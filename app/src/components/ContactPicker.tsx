import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Linking from 'expo-linking';
import { useMutation } from '@apollo/client';
import { colors, spacing, borderRadius } from '../theme';
import { SEND_INVITES } from '../graphql/mutations';

interface SelectedContact {
  id: string;
  name: string;
  phone: string;
}

interface ContactPickerProps {
  podId: string;
  podTitle: string;
  onDone: () => void;
  onSkip: () => void;
}

interface ContactItem {
  id: string;
  name: string;
  phone: string;
}

const ContactPicker: React.FC<ContactPickerProps> = ({ podId, podTitle, onDone, onSkip }) => {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [filtered, setFiltered] = useState<ContactItem[]>([]);
  const [selected, setSelected] = useState<Map<string, SelectedContact>>(new Map());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const [sendInvites, { loading: sending }] = useMutation(SEND_INVITES);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(contacts);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        contacts.filter(
          (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
        ),
      );
    }
  }, [search, contacts]);

  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        sort: Contacts.SortTypes.FirstName,
      });

      const mapped: ContactItem[] = [];
      for (const c of data) {
        if (c.phoneNumbers && c.phoneNumbers.length > 0) {
          const phone = c.phoneNumbers[0].number ?? '';
          if (phone) {
            mapped.push({
              id: c.id ?? phone,
              name: c.name ?? c.firstName ?? 'Unknown',
              phone: phone.replace(/[\s()-]/g, ''),
            });
          }
        }
      }

      setContacts(mapped);
      setFiltered(mapped);
    } catch {
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = useCallback(
    (contact: ContactItem) => {
      setSelected((prev) => {
        const next = new Map(prev);
        if (next.has(contact.id)) {
          next.delete(contact.id);
        } else {
          next.set(contact.id, { id: contact.id, name: contact.name, phone: contact.phone });
        }
        return next;
      });
    },
    [],
  );

  const handleDone = async () => {
    const selectedContacts = Array.from(selected.values());
    if (selectedContacts.length === 0) return;

    try {
      const { data } = await sendInvites({
        variables: {
          podId,
          contacts: selectedContacts.map((c) => ({
            phone: c.phone,
            name: c.name,
          })),
        },
      });

      const smsMessages = data?.sendInvites?.smsMessages ?? [];

      if (smsMessages.length > 0 && Platform.OS !== 'web') {
        Alert.alert(
          'Invites Ready!',
          `${smsMessages.length} invitation(s) prepared. Send SMS to your friends?`,
          [
            { text: 'Skip', style: 'cancel', onPress: onDone },
            {
              text: 'Send SMS',
              onPress: async () => {
                for (const sms of smsMessages as { phone: string; body: string }[]) {
                  const smsUrl =
                    Platform.OS === 'ios'
                      ? `sms:${sms.phone}&body=${encodeURIComponent(sms.body)}`
                      : `sms:${sms.phone}?body=${encodeURIComponent(sms.body)}`;
                  try {
                    await Linking.openURL(smsUrl);
                  } catch {
                    /* user cancelled */
                  }
                }
                onDone();
              },
            },
          ],
        );
      } else {
        Alert.alert('Invites Sent!', `${selectedContacts.length} contacts invited.`, [
          { text: 'OK', onPress: onDone },
        ]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send invites';
      Alert.alert('Error', msg);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  if (permissionDenied) {
    return (
      <View style={styles.centered}>
        <Text style={styles.deniedIcon}>📱</Text>
        <Text style={styles.deniedTitle}>Contact Access Required</Text>
        <Text style={styles.deniedText}>
          To invite friends to your pod, please grant contact access in your device settings.
        </Text>
        <TouchableOpacity style={styles.skipBtnLarge} onPress={onSkip}>
          <Text style={styles.skipBtnText}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Invite Friends</Text>
        <Text style={styles.subtitle}>
          Select contacts to send SMS invites with a link to your pod
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Selected count */}
      {selected.size > 0 && (
        <View style={styles.selectedBanner}>
          <Text style={styles.selectedText}>
            {selected.size} contact{selected.size > 1 ? 's' : ''} selected
          </Text>
        </View>
      )}

      {/* Contact list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.id);
          return (
            <TouchableOpacity
              style={[styles.contactRow, isSelected && styles.contactRowSelected]}
              onPress={() => toggleSelect(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                <Text style={[styles.avatarText, isSelected && styles.avatarTextSelected]}>
                  {getInitials(item.name)}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>{item.phone}</Text>
              </View>
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        }
      />

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
          <Text style={styles.skipBtnText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.inviteBtn, (selected.size === 0 || sending) && styles.inviteBtnDisabled]}
          onPress={handleDone}
          disabled={selected.size === 0 || sending}
        >
          <Text style={styles.inviteBtnText}>
            {sending ? 'Sending...' : `Send Invites (${selected.size})`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 15,
    color: colors.textSecondary,
  },
  deniedIcon: { fontSize: 48, marginBottom: spacing.md },
  deniedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  deniedText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    fontSize: 15,
    color: colors.text,
  },
  selectedBanner: {
    backgroundColor: colors.primary + '15',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  selectedText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  contactRowSelected: {
    backgroundColor: colors.primary + '08',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSelected: { backgroundColor: colors.primary },
  avatarText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  avatarTextSelected: { color: colors.white },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '500', color: colors.text },
  contactPhone: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkmark: { color: colors.white, fontSize: 14, fontWeight: '700' },
  emptyContainer: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: 15, color: colors.textSecondary },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    gap: spacing.md,
  },
  skipBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtnLarge: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipBtnText: { fontSize: 15, fontWeight: '500', color: colors.textSecondary },
  inviteBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteBtnDisabled: { opacity: 0.4 },
  inviteBtnText: { fontSize: 15, fontWeight: '600', color: colors.white },
});

export default ContactPicker;
