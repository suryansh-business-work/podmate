import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, borderRadius } from '../theme';
import { SEND_INVITES } from '../graphql/mutations';

interface Contact {
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

/** Contacts list — populated via device contacts API */
const SAMPLE_CONTACTS: Contact[] = [];

const ContactPicker: React.FC<ContactPickerProps> = ({ podId, podTitle, onDone, onSkip }) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [sendInvites, { loading: sending }] = useMutation(SEND_INVITES);

  const contacts = SAMPLE_CONTACTS;

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const toggleContact = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

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

  const renderContact = useCallback(({ item }: { item: Contact }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <TouchableOpacity style={styles.contactRow} onPress={() => toggleContact(item.id)} activeOpacity={0.7}>
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
  }, [selectedIds]);

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
        <MaterialIcons name="event" size={14} color={colors.primary} />{' '}
        {podTitle}
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
              {contacts.length === 0 ? 'No contacts available' : 'No contacts match your search'}
            </Text>
            <Text style={styles.emptySubtext}>
              Contact access will be available in a future update. You can share the pod link instead.
            </Text>
          </View>
        }
      />

      {selectedIds.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending} activeOpacity={0.8}>
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <MaterialIcons name="send" size={18} color={colors.white} />
                <Text style={styles.sendBtnText}>Send {selectedIds.length} Invite{selectedIds.length > 1 ? 's' : ''}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  skipText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  podLabel: { fontSize: 14, fontWeight: '600', color: colors.primary, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, marginHorizontal: spacing.xl, marginBottom: spacing.md, gap: spacing.sm },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 12 },
  selectedCount: { fontSize: 13, fontWeight: '600', color: colors.primary, paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  list: { paddingHorizontal: spacing.xl },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' },
  contactInitial: { fontSize: 18, fontWeight: '700', color: colors.primary },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '600', color: colors.text },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  contactPhone: { fontSize: 13, color: colors.textSecondary },
  checkCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  checkCircleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  separator: { height: 1, backgroundColor: colors.surfaceVariant, marginLeft: 56 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: spacing.xxl },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.lg },
  emptySubtext: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginTop: spacing.sm },
  footer: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: colors.surfaceVariant },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingVertical: 14, borderRadius: borderRadius.full, gap: spacing.sm },
  sendBtnText: { fontSize: 16, fontWeight: '600', color: colors.white },
});

export default ContactPicker;
