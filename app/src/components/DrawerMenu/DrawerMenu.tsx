import React, { memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing } from '../../theme';
import { GET_ME } from '../../graphql/queries';
import { useThemeMode } from '../../contexts/ThemeContext';
import {
  DrawerMenuProps,
  NavItem,
  MAIN_NAV,
  QUICK_ACTIONS,
  ACCOUNT_ITEMS,
} from './DrawerMenu.types';
import { createStyles } from './DrawerMenu.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const DrawerMenu: React.FC<DrawerMenuProps> = memo(function DrawerMenu({ onClose, onNavigate, onLogout }) {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const { data, loading } = useQuery(GET_ME, { fetchPolicy: 'cache-first' });
  const user = data?.me;
  const { isDark, toggleTheme } = useThemeMode();

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
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: (item.color ?? colors.textSecondary) + '18' },
        ]}
      >
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
                <Text style={styles.roleText}>{user?.role ?? 'USER'}</Text>
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
        <Text style={styles.sectionLabel}>Navigate</Text>
        {MAIN_NAV.map((item) => renderMenuItem(item))}

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Quick Actions</Text>
        {QUICK_ACTIONS.map((item) => renderMenuItem(item, true))}

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Account</Text>
        {ACCOUNT_ITEMS.map((item) => renderMenuItem(item))}

        <View style={styles.divider} />

        <View style={styles.menuRow}>
          <View style={[styles.iconCircle, { backgroundColor: colors.indigoAccent + '18' }]}>
            <MaterialIcons name={isDark ? 'dark-mode' : 'light-mode'} size={18} color={colors.indigoAccent} />
          </View>
          <Text style={[styles.menuLabel, { flex: 1 }]}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

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
