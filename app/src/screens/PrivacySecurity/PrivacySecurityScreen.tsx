import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import {
  PrivacySecurityScreenProps,
  SettingRowItem,
  PRIVACY_SETTINGS,
  SECURITY_SETTINGS,
  ACCOUNT_ACTIONS,
} from './PrivacySecurity.types';
import { createStyles } from './PrivacySecurity.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const PrivacySecurityScreen: React.FC<PrivacySecurityScreenProps> = ({ onBack }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    profile_visibility: true,
    hide_location: false,
    marketing_notifications: true,
    two_factor_auth: false,
  });

  const handleToggle = useCallback((key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleAction = useCallback((key: string) => {
    if (key === 'delete_account') {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to permanently delete your account? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () =>
              Alert.alert(
                'Account Deletion',
                'Your request has been submitted. Our team will process it within 48 hours.',
              ),
          },
        ],
      );
    } else if (key === 'download_data') {
      Alert.alert(
        'Download Data',
        'Your data export will be prepared and sent to your registered email within 24 hours.',
      );
    } else if (key === 'active_sessions') {
      Alert.alert('Active Sessions', 'You are currently logged in on 1 device.');
    }
  }, []);

  const renderToggleRow = (item: SettingRowItem) => (
    <View key={item.key}>
      <View style={styles.settingRow}>
        <View style={styles.settingIconWrap}>
          <MaterialIcons name={item.icon} size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>{item.label}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
        {item.type === 'toggle' ? (
          <Switch
            value={toggles[item.key] ?? false}
            onValueChange={() => handleToggle(item.key)}
            trackColor={{ false: colors.surfaceVariant, true: colors.primary + '50' }}
            thumbColor={toggles[item.key] ? colors.primary : colors.textTertiary}
          />
        ) : (
          <TouchableOpacity onPress={() => handleAction(item.key)}>
            <MaterialIcons name="chevron-right" size={22} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.divider} />
    </View>
  );

  const renderDangerRow = (item: SettingRowItem) => (
    <View key={item.key}>
      <TouchableOpacity style={styles.dangerRow} onPress={() => handleAction(item.key)}>
        <View style={styles.dangerIconWrap}>
          <MaterialIcons name={item.icon} size={20} color={colors.error} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.dangerLabel}>{item.label}</Text>
          <Text style={styles.dangerSubtitle}>{item.subtitle}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={colors.error} />
      </TouchableOpacity>
      <View style={styles.divider} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sectionHeader}>
          <MaterialIcons name="shield" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>Privacy</Text>
        </View>
        {PRIVACY_SETTINGS.map(renderToggleRow)}

        <View style={styles.sectionHeader}>
          <MaterialIcons name="lock" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>Security</Text>
        </View>
        {SECURITY_SETTINGS.map(renderToggleRow)}

        <View style={styles.sectionHeader}>
          <MaterialIcons name="manage-accounts" size={18} color={colors.error} />
          <Text style={[styles.sectionTitle, { color: colors.error }]}>Account</Text>
        </View>
        {ACCOUNT_ACTIONS.map(renderDangerRow)}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacySecurityScreen;
