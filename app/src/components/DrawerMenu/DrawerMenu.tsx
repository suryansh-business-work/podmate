import React, { memo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing } from '../../theme';
import { GET_ME } from '../../graphql/queries';
import { SWITCH_ACTIVE_ROLE } from '../../graphql/mutations';
import { DrawerMenuProps, NavItem, ROLE_MENUS, ROLE_LABELS, USER_NAV, REGISTER_VENUE_ITEM, BE_A_POD_OWNER_ITEM } from './DrawerMenu.types';
import { createStyles } from './DrawerMenu.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const DrawerMenu: React.FC<DrawerMenuProps> = memo(function DrawerMenu({
  onClose,
  onNavigate,
  onLogout,
}) {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const { data, loading } = useQuery(GET_ME, { fetchPolicy: 'cache-first' });
  const user = data?.me;
  const [switchActiveRole] = useMutation(SWITCH_ACTIVE_ROLE, {
    refetchQueries: [{ query: GET_ME }],
  });

  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const activeRole: string = user?.activeRole ?? 'USER';
  const roles: string[] = user?.roles ?? ['USER'];
  const hasMultipleRoles = roles.length > 1;

  /* Build menu: for USER role, conditionally add registration items based on missing roles */
  const buildMenuItems = (): NavItem[] => {
    const baseItems = ROLE_MENUS[activeRole] ?? USER_NAV;
    if (activeRole !== 'USER') return baseItems;

    const items = [...baseItems];
    const profileIdx = items.findIndex((item) => item.id === 'Profile');
    const insertIdx = profileIdx >= 0 ? profileIdx : items.length;

    if (!roles.includes('VENUE_OWNER')) {
      items.splice(insertIdx, 0, REGISTER_VENUE_ITEM);
    }
    if (!roles.includes('HOST')) {
      const newInsertIdx = items.findIndex((item) => item.id === 'Profile');
      items.splice(newInsertIdx >= 0 ? newInsertIdx : items.length, 0, BE_A_POD_OWNER_ITEM);
    }
    return items;
  };
  const menuItems = buildMenuItems();

  const handleNavigate = (id: string) => {
    onClose();
    onNavigate(id);
  };

  const handleSwitchRole = async (role: string) => {
    setRoleSwitcherOpen(false);
    await switchActiveRole({ variables: { role } });
    const newMenu = ROLE_MENUS[role] ?? USER_NAV;
    if (newMenu.length > 0) {
      handleNavigate(newMenu[0].id);
    }
  };

  const renderMenuItem = (item: NavItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuRow}
      onPress={() => handleNavigate(item.id)}
      activeOpacity={0.65}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: (item.color ?? colors.textSecondary) + '18' },
        ]}
      >
        <MaterialIcons name={item.icon} size={18} color={item.color ?? colors.textSecondary} />
      </View>
      <Text style={styles.menuLabel}>{item.label}</Text>
      <MaterialIcons name="chevron-right" size={18} color={colors.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
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
          <TouchableOpacity
            style={styles.profileSection}
            onPress={() => handleNavigate('Profile')}
            activeOpacity={0.8}
          >
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
                {user?.isVerifiedHost && <MaterialIcons name="verified" size={16} color="#FFF" />}
              </View>
              <Text style={styles.userPhone}>{user?.phone ?? ''}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{ROLE_LABELS[activeRole] ?? activeRole}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Role switcher */}
        {hasMultipleRoles && (
          <>
            <TouchableOpacity
              style={styles.switchRoleRow}
              onPress={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + '18' }]}>
                <MaterialIcons name="swap-horiz" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.primary, fontWeight: '600' }]}>
                Switch Role
              </Text>
              <MaterialIcons
                name={roleSwitcherOpen ? 'expand-less' : 'expand-more'}
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>

            {roleSwitcherOpen &&
              roles.map((role) => {
                const isActive = role === activeRole;
                return (
                  <TouchableOpacity
                    key={role}
                    style={[styles.roleOption, isActive && styles.roleOptionActive]}
                    onPress={() => {
                      if (!isActive) handleSwitchRole(role);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        isActive && { color: colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {ROLE_LABELS[role] ?? role}
                    </Text>
                    {isActive && (
                      <MaterialIcons name="check-circle" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            <View style={styles.divider} />
          </>
        )}

        {/* Role-specific menu */}
        {menuItems.map((item) => renderMenuItem(item))}

        <View style={styles.divider} />

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
});

export default DrawerMenu;
