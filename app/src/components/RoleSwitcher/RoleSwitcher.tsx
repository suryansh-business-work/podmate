import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

import { RoleSwitcherProps, ROLE_LABELS, ROLE_ICONS } from './RoleSwitcher.types';
import { createStyles } from './RoleSwitcher.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  visible,
  roles,
  activeRole,
  onSwitch,
  onClose,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Switch Role</Text>
          {roles.map((role) => {
            const isActive = role === activeRole;
            return (
              <TouchableOpacity
                key={role}
                style={[styles.roleItem, isActive ? styles.roleItemActive : styles.roleItemInactive]}
                activeOpacity={0.7}
                onPress={() => {
                  if (!isActive) onSwitch(role);
                }}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: isActive ? colors.primary + '20' : colors.border + '40' },
                  ]}
                >
                  <MaterialIcons
                    name={(ROLE_ICONS[role] ?? 'person') as ComponentProps<typeof MaterialIcons>['name']}
                    size={20}
                    color={isActive ? colors.primary : colors.textSecondary}
                  />
                </View>
                <Text style={styles.roleLabel}>{ROLE_LABELS[role] ?? role}</Text>
                {isActive && <Text style={styles.activeIndicator}>ACTIVE</Text>}
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default RoleSwitcher;
