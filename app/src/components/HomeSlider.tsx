import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Linking } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import SafeImage from './SafeImage';
import { useAppColors, useThemedStyles, ThemeUtils } from '../hooks/useThemedStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH;
const SLIDER_HEIGHT = 200;

export interface SliderItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  category: string;
}

interface HomeSliderProps {
  items: SliderItem[];
}

const HomeSlider: React.FC<HomeSliderProps> = ({ items }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();

  if (items.length === 0) return null;

  const handleCtaPress = (ctaLink: string) => {
    if (ctaLink) {
      Linking.openURL(ctaLink).catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      <Carousel
        width={SLIDER_WIDTH}
        height={SLIDER_HEIGHT}
        data={items}
        autoPlay
        autoPlayInterval={4000}
        scrollAnimationDuration={800}
        loop
        renderItem={({ item }: { item: SliderItem }) => (
          <View style={styles.slide}>
            <SafeImage uri={item.imageUrl} style={styles.slideImage} fallbackIcon="image" />
            <View style={styles.overlay}>
              <View style={styles.textContent}>
                <Text style={styles.slideTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text style={styles.slideSubtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                ) : null}
                {item.ctaText ? (
                  <TouchableOpacity
                    style={[styles.ctaButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleCtaPress(item.ctaLink)}
                  >
                    <Text style={styles.ctaText}>{item.ctaText}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        )}
      />
      {items.length > 1 && (
        <View style={styles.dotsContainer}>
          {items.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: colors.textTertiary }]} />
          ))}
        </View>
      )}
    </View>
  );
};

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
      marginHorizontal: -20,
    },
    slide: {
      overflow: 'hidden',
      height: SLIDER_HEIGHT,
    },
    slideImage: {
      width: '100%',
      height: '100%',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'flex-end',
      padding: spacing.lg,
    },
    textContent: {
      gap: 4,
    },
    slideTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.white,
    },
    slideSubtitle: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.85)',
    },
    ctaButton: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
    },
    ctaText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.white,
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
      marginTop: spacing.sm,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
  });

export default HomeSlider;
