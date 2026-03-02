import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, borderRadius } from '../theme';
import { GET_ME } from '../graphql/queries';

interface DrawerMenuProps {
  onClose: () => void;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const MAIN_NAV = [
  { id: 'Home', icon: 'home', label: 'Home' },
  { id: 'Explore', icon: 'explore', label: 'Explore' },
  { id: 'Chat', icon: 'chat', label: 'Chat' },
  { id: 'Notifications', icon: 'notifications', label: 'Notifications' },
];

const QUICK_ACTIONS = [
  { id: 'RegisterPlace', icon: 'place', label: 'Register a Place' },
  { id: 'CreatePod', icon: 'add', label: 'Create a Pod' },
];

const ACCOUNT_ITEMS = [
  { id: 'Profile', icon: 'person', label: 'Profile' },
  { id: 'Tickets', icon: 'confirmation-number', label: 'My Tickets' },
  { id: 'Payments', icon: 'credit-card', label: 'Payments' },
  { id: 'Settings', icon: 'settings', label: 'Settings' },
  { id: 'Help', icon: 'help', label: 'Help & Support' },
];

const DrawerMenu: React.FC<DrawerMenuProps> = ({ onClose, onNavigate, onLogout }) => {
  const { data, loading } = useQuery(GET_ME, { fetchPolicy: 'cache-first' });
  const user = data?.me;

  const handleNavigate = (id: string) => {
    onClose();
    onNavigate(id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <MaterialIcons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* User Profile Section */}
      <View style={styles.profileSection}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={28} color={colors.white} />
              </View>
            )}
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name ?? 'User'}
                </Text>
                {user?.isVerifiedHost && (
                  <MaterialIcons name="check-circle" size={16} color={colors.primary} />
                )}
              </View>
              <Text style={styles.userPhone}>{user?.phone ?? ''}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role ?? 'USER'}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.divider} />

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Navigation */}
        {MAIN_NAV.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuRow} onPress={() => handleNavigate(item.id)} activeOpacity={0.7}>
            <MaterialIcons name={item.icon} size={20} color={colors.textSecondary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        {QUICK_ACTIONS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuRow} onPress={() => handleNavigate(item.id)} activeOpacity={0.7}>
            <MaterialIcons name={item.icon} size={20} color={colors.primary} />
            <Text style={[styles.menuLabel, { color: colors.primary }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        {ACCOUNT_ITEMS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuRow} onPress={() => handleNavigate(item.id)} activeOpacity={0.7}>
            <MaterialIcons name={item.icon} size={20} color={colors.textSecondary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} style={styles.chevron} />
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity style={styles.logoutRow} onPress={onLogout} activeOpacity={0.7}>
          <MaterialIcons name="exit-to-app" size={20} color={colors.error} />
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>PartyWings v1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  closeBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  profileSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  userName: { fontSize: 18, fontWeight: '700', color: colors.text, maxWidth: '80%' },
  userPhone: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: colors.primary + '15', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full, marginTop: spacing.xs },
  roleText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  divider: { height: 1, backgroundColor: colors.surfaceVariant, marginVertical: spacing.sm, marginHorizontal: spacing.xl },
  scrollContent: { flex: 1 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: colors.textTertiary, paddingHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.xl, gap: spacing.md },
  menuLabel: { fontSize: 15, fontWeight: '500', color: colors.text, flex: 1 },
  chevron: { marginLeft: 'auto' },
  logoutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.xl, gap: spacing.md },
  logoutLabel: { fontSize: 15, fontWeight: '500', color: colors.error },
  footer: { alignItems: 'center', paddingVertical: spacing.xxl },
  footerText: { fontSize: 12, color: colors.textTertiary },
});

export default DrawerMenu;
