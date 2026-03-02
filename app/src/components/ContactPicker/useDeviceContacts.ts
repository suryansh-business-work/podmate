import { useState, useEffect, useCallback } from 'react';
import * as Contacts from 'expo-contacts';
import type { DeviceContact } from './ContactPicker.types';

function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-()]/g, '');
}

interface UseDeviceContactsResult {
  contacts: DeviceContact[];
  loading: boolean;
  permissionDenied: boolean;
  refresh: () => Promise<void>;
}

export function useDeviceContacts(): UseDeviceContactsResult {
  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }
      setPermissionDenied(false);

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        sort: Contacts.SortTypes.FirstName,
      });

      const mapped: DeviceContact[] = [];
      for (const c of data) {
        const phone = c.phoneNumbers?.[0]?.number;
        if (!phone) continue;
        mapped.push({
          id: c.id ?? `${c.name}-${phone}`,
          name: c.name ?? 'Unknown',
          phone: normalizePhone(phone),
        });
      }
      setContacts(mapped);
    } catch {
      setPermissionDenied(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  return { contacts, loading, permissionDenied, refresh: loadContacts };
}
