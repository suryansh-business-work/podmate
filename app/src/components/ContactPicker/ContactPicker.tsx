import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { SEND_INVITES } from '../../graphql/mutations';
import type { ContactPickerProps, DeviceContact } from './ContactPicker.types';
import { useDeviceContacts } from './useDeviceContacts';
import { createStyles } from './ContactPicker.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const ContactPicker: React.FC<ContactPickerProps> = ({ podId, podTitle, onDone, onSkip }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const { contacts, loading: loadingContacts, permissionDenied, refresh } = useDeviceContacts();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sendInvites, { loading: sending }] = useMutation(SEND_INVITES);

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const toggleContact = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const handleSend = async () => {
    const selected = contacts.filter((c) => selectedIds.includes(c.id));
    try {
      await sendInvites({
        variables: {
          podId,
          contacts: selected.map((c) => ({ name: c.name, phone: c.phone })),
        },
      });
      Alert.alert('Invitations Sent', `${selected.length} invite(s) sent for "${podTitle}"`, [
        { text: 'OK', onPress: onDone },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to send invitations. Please try again.');
    }
  };

  const renderContact = useCallback(
    ({ item }: { item: DeviceContact }) => {
      const isSelected = selectedIds.includes(item.id);
      return (
        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => toggleContact(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.contactAvatar}>
            <Text style={styles.contactInitial}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.name}</Text>
            <View style={styles.phoneRow}>
              <MaterialIcons name="smartphone" size={13} color={colors.textTertiary} />
              <Text style={styles.contactPhone}>{item.phone}</Text>
            </View>
          </View>
          <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
            {isSelected && <MaterialIcons name="check" size={16} color={colors.white} />}
          </View>
        </TouchableOpacity>
      );
    },
    [selectedIds, toggleContact],
  );

  if (loadingContacts) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.permissionText}>Loading contacts...</Text>
      </SafeAreaView>
    );
  }

  if (permissionDenied) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <MaterialIcons name="contacts" size={48} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>Contacts Access Required</Text>
        <Text style={styles.permissionText}>
          Please grant contacts permission so we can help you invite friends to your pod.
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSkip} style={{ marginTop: 16 }}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onSkip} style={styles.headerBtn}>
          <MaterialIcons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Friends</Text>
        <TouchableOpacity onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.podLabel}>
        <MaterialIcons name="event" size={14} color={colors.primary} /> {podTitle}
      </Text>

      <View style={styles.searchRow}>
        <MaterialIcons name="search" size={18} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {selectedIds.length > 0 && (
        <Text style={styles.selectedCount}>
          {selectedIds.length} contact{selectedIds.length > 1 ? 's' : ''} selected
        </Text>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="person-search" size={40} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>
              {contacts.length === 0 ? 'No contacts found' : 'No contacts match your search'}
            </Text>
            <Text style={styles.emptySubtext}>
              {contacts.length === 0
                ? 'Your address book appears empty. You can share the pod link instead.'
                : 'Try a different search term.'}
            </Text>
          </View>
        }
      />

      {selectedIds.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSend}
            disabled={sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <MaterialIcons name="send" size={18} color={colors.white} />
                <Text style={styles.sendBtnText}>
                  Send {selectedIds.length} Invite{selectedIds.length > 1 ? 's' : ''}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ContactPicker;
