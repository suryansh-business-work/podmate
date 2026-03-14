import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';

import { GET_ACTIVE_POD_TEMPLATES } from '../../graphql/queries';
import SafeImage from '../../components/SafeImage';
import { useThemedStyles, useAppColors, ThemeUtils } from '../../hooks/useThemedStyles';

interface PodTemplateItem {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultFee: number;
  defaultMaxSeats: number;
  defaultRefundPolicy: string;
}

interface TemplateSelectorProps {
  onSelect: (template: PodTemplateItem) => void;
  onSkip: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect, onSkip }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();

  const { data } = useQuery<{ activePodTemplates: PodTemplateItem[] }>(
    GET_ACTIVE_POD_TEMPLATES,
    { fetchPolicy: 'cache-and-network' },
  );

  const templates = data?.activePodTemplates ?? [];

  if (templates.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start from a template</Text>
      <Text style={styles.subtitle}>Choose a template or start from scratch</Text>

      <FlatList
        data={templates}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => onSelect(item)}
          >
            {item.imageUrl ? (
              <SafeImage uri={item.imageUrl} style={styles.cardImage} />
            ) : (
              <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                <MaterialIcons name="description" size={28} color={colors.textTertiary} />
              </View>
            )}
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cardCategory}>{item.category}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
        <MaterialIcons name="add" size={18} color={colors.primary} />
        <Text style={styles.skipText}>Start from scratch</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = ({ colors }: ThemeUtils) =>
  StyleSheet.create({
    container: {
      paddingVertical: 16,
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      paddingHorizontal: 16,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textTertiary,
      paddingHorizontal: 16,
      marginTop: 2,
      marginBottom: 12,
    },
    list: {
      paddingHorizontal: 12,
    },
    card: {
      width: 130,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginHorizontal: 4,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardImage: {
      width: 130,
      height: 80,
      backgroundColor: colors.surfaceVariant,
    },
    cardImagePlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      paddingHorizontal: 8,
      paddingTop: 8,
    },
    cardCategory: {
      fontSize: 11,
      color: colors.textTertiary,
      paddingHorizontal: 8,
      paddingBottom: 8,
      marginTop: 2,
    },
    skipBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      paddingVertical: 8,
    },
    skipText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
      marginLeft: 4,
    },
  });

export default TemplateSelector;
export type { PodTemplateItem };
