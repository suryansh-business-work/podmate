import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, borderRadius } from '../theme';
import { GET_ME } from '../graphql/queries';

interface DrawerMenuProps {
  onClose: () => void;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

interface NavItem {
  id: string;
  icon: string;
  label: string;
  color?: string;
}

const MAIN_NAV: NavItem[] = [
  { id: 'Home', icon: 'home', label: 'Home', color: '#F50247' },
  { id: 'Explore', icon: 'explore', label: 'Explore', color: '#9333EA' },
  { id: 'Chat', icon: 'chat-bubble', label: 'Chat', color: '#2563EB' },
  { id: 'Notifications', icon: 'notifications', label: 'Notifications', color: '#F59E0B' },
];

const QUICK_ACTIONS: NavItem[] = [
  { id: 'RegisterPlace', icon: 'store', label: 'Register a Place', color: '#10B981' },
  { id: 'CreatePod', icon: 'add-circle', label: 'Create a Pod', color: '#F50247' },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { id: 'Profile', icon: 'person', label: 'Profile', color: '#6366F1' },
  { id: 'Tickets', icon: 'confirmation-number', label: 'My Tickets', color: '#EC4899' },
  { id: 'Payments', icon: 'account-balance-wallet', label: 'Payments', color: '#14B8A6' },
  { id: 'Help', icon: 'help-outline', label: 'Help & FAQs', color: '#8B5CF6' },
  { id: 'Support', icon: 'support-agent', label: 'Support', color: '#F50247' },
];

const DrawerMenu: React.FC<DrawerMenuProps> = ({ onClose, onNavigate, onLogout }) => {
  const { data, loading } = useQuery(GET_ME, { fetchPolicy: 'cache-first' });
  const user = data?.me;

  const handleNavigate = (id: string) => {
    onClose();
    onNavigate(id);
  };

  const renderMenuItem = (item: NavItem, accent: boolean = false) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuRow}
      onPress={() => handleNavigate(item.id)}
      activeOpacity={0.65}
    >
      <View style={[styles.iconCircle, { backgroundColor: (item.color ?? colors.textSecondary) + '18' }]}>
        <MaterialIcons name={item.icon} size={18} color={item.color ?? colors.textSecondary} />
      </View>
      <Text style={[styles.menuLabel, accent && { color: item.color, fontWeight: '600' }]}>
        {item.label}
      </Text>
      <MaterialIcons name="chevron-right" size={18} color={colors.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Header with profile */}
      <LinearGradient
        colors={[colors.primary, '#9333EA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <MaterialIcons name="close" size={22} color={colors.white} />
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="small" color={colors.white} style={{ marginTop: spacing.xl }} />
        ) : (
          <TouchableOpacity style={styles.profileSection} onPress={() => handleNavigate('Profile')} activeOpacity={0.8}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={28} color={colors.primary} />
              </View>
            )}
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name || 'PartyWings User'}
                </Text>
                {user?.isVerifiedHost && (
                  <MaterialIcons name="verified" size={16} color="#FFF" />
                )}
              </View>
              <Text style={styles.userPhone}>{user?.phone ?? ''}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role ?? 'USER'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Main Navigation */}
        <Text style={styles.sectionLabel}>Navigate</Text>
        {MAIN_NAV.map((item) => renderMenuItem(item))}

        <View style={styles.divider} />

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        {QUICK_ACTIONS.map((item) => renderMenuItem(item, true))}

        <View style={styles.divider} />

        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        {ACCOUNT_ITEMS.map((item) => renderMenuItem(item))}

        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity style={styles.logoutRow} onPress={onLogout} activeOpacity={0.7}>
          <View style={[styles.iconCircle, { backgroundColor: colors.error + '18' }]}>
            <MaterialIcons name="logout" size={18} color={colors.error} />
          </View>
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
  container: { flex: 1, backgroundColor: '#FAFBFC' },

  /* Gradient header */
  headerGradient: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.6)' },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  userName: { fontSize: 18, fontWeight: '700', color: colors.white, maxWidth: '75%' },
  userPhone: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  roleText: { fontSize: 10, fontWeight: '700', color: colors.white, letterSpacing: 0.5 },

  /* Sections */
  scrollContent: { flex: 1, paddingTop: spacing.md },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '500', color: colors.text, flex: 1 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: spacing.sm, marginHorizontal: spacing.xl },
  logoutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: spacing.xl, gap: spacing.md },
  logoutLabel: { fontSize: 15, fontWeight: '600', color: colors.error, flex: 1 },
  footer: { alignItems: 'center', paddingVertical: spacing.xl },
  footerText: { fontSize: 11, color: colors.textTertiary, letterSpacing: 0.3 },
});

export default DrawerMenu;
