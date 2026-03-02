import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = '100%',
  height = 16,
  borderRadius: br = borderRadius.sm,
  style,
}) => {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius: br,
          backgroundColor: colors.surfaceVariant,
          opacity,
        },
        style,
      ]}
    />
  );
};

/** Card-shaped skeleton for feed items */
export const SkeletonCard: React.FC = () => (
  <View style={skStyles.card}>
    <SkeletonBox height={180} borderRadius={borderRadius.md} />
    <View style={skStyles.cardBody}>
      <SkeletonBox height={14} width="60%" />
      <SkeletonBox height={12} width="40%" style={{ marginTop: spacing.sm }} />
      <SkeletonBox height={12} width="80%" style={{ marginTop: spacing.sm }} />
    </View>
  </View>
);

/** Full-screen skeleton with multiple card placeholders */
export const SkeletonFeed: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <View style={skStyles.feedWrap}>
    <SkeletonBox height={40} width="50%" style={{ alignSelf: 'flex-start', marginBottom: spacing.lg }} />
    <SkeletonBox height={40} borderRadius={borderRadius.full} style={{ marginBottom: spacing.xl }} />
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={`sk-${i}`} />
    ))}
  </View>
);

/** Profile screen skeleton */
export const SkeletonProfile: React.FC = () => (
  <View style={skStyles.profileWrap}>
    <SkeletonBox width={80} height={80} borderRadius={40} style={{ alignSelf: 'center' }} />
    <SkeletonBox width={120} height={18} style={{ alignSelf: 'center', marginTop: spacing.md }} />
    <SkeletonBox width={160} height={14} style={{ alignSelf: 'center', marginTop: spacing.sm }} />
    <View style={skStyles.statsRow}>
      {[1, 2, 3].map((i) => (
        <SkeletonBox key={i} width={80} height={50} borderRadius={borderRadius.md} />
      ))}
    </View>
    {[1, 2, 3, 4].map((i) => (
      <SkeletonBox key={i} height={48} style={{ marginTop: spacing.md }} borderRadius={borderRadius.md} />
    ))}
  </View>
);

/** Detail page skeleton */
export const SkeletonDetail: React.FC = () => (
  <View style={skStyles.feedWrap}>
    <SkeletonBox height={240} borderRadius={0} />
    <View style={{ padding: spacing.xl }}>
      <SkeletonBox height={22} width="70%" />
      <SkeletonBox height={14} width="40%" style={{ marginTop: spacing.md }} />
      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
        <SkeletonBox width={SCREEN_W * 0.42} height={70} borderRadius={borderRadius.md} />
        <SkeletonBox width={SCREEN_W * 0.42} height={70} borderRadius={borderRadius.md} />
      </View>
      <SkeletonBox height={100} style={{ marginTop: spacing.xl }} borderRadius={borderRadius.md} />
    </View>
  </View>
);

const skStyles = StyleSheet.create({
  card: { marginBottom: spacing.lg, borderRadius: borderRadius.md, overflow: 'hidden', backgroundColor: colors.white },
  cardBody: { padding: spacing.md },
  feedWrap: { padding: spacing.xl, paddingTop: spacing.lg },
  profileWrap: { padding: spacing.xl, paddingTop: 60 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.xl },
});

export default SkeletonBox;
