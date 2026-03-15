import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { createCardStyles } from '../Dashboard.styles';
import type { AnalyticsCardProps } from '../Dashboard.types';

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  icon,
  iconColor,
  title,
  value,
  hint,
  loading,
}) => {
  const styles = useThemedStyles(createCardStyles);
  const [showHint, setShowHint] = useState(false);

  if (loading) {
    return <View style={styles.skeleton} />;
  }

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}18` }]}>
        <MaterialIcons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <View>
        <TouchableOpacity
          style={styles.hintBtn}
          onPress={() => setShowHint((p) => !p)}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="info-outline"
            size={18}
            color={showHint ? iconColor : '#9CA3AF'}
          />
        </TouchableOpacity>
        {showHint && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>{hint}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default AnalyticsCard;
