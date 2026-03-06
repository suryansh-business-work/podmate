import { StyleSheet, Dimensions, StatusBar } from 'react-native';
import { ThemeUtils } from '../../hooks/useThemedStyles';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const STATUS_BAR_H = StatusBar.currentHeight ?? 44;

export { SCREEN_W, SCREEN_H };

export function getSlideHeight(tabBarHeight: number): number {
  return SCREEN_H - tabBarHeight;
}

export const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.black },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.black,
    },
    slide: { width: SCREEN_W, position: 'relative' },
    bgImage: {
      ...StyleSheet.absoluteFillObject,
      width: SCREEN_W,
      justifyContent: 'center',
      alignItems: 'center',
    },
    gradient: { ...StyleSheet.absoluteFillObject },

    topBar: {
      position: 'absolute',
      top: STATUS_BAR_H + 8,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
      zIndex: 10,
    },
    catPill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    catPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    catPillText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
    catPillTextActive: { color: colors.white },

    sideActions: {
      position: 'absolute',
      right: spacing.md,
      bottom: 200,
      alignItems: 'center',
      gap: spacing.lg,
      zIndex: 10,
    },
    sideBtn: { alignItems: 'center', gap: 4 },
    sideBtnText: { fontSize: 10, color: colors.white, fontWeight: '500' },
    hostAvatarSide: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: colors.primary,
    },

    bottomContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 70,
      paddingHorizontal: spacing.xl,
      paddingBottom: 20,
      zIndex: 10,
    },
    hostRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    hostName: { fontSize: 14, fontWeight: '700', color: colors.white },
    podTitle: { fontSize: 22, fontWeight: '800', color: colors.white, marginBottom: spacing.xs },
    podDesc: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.75)',
      lineHeight: 20,
      marginBottom: spacing.md,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
    },
    chipText: { fontSize: 11, color: colors.white, fontWeight: '500' },

    seatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    seatsBarBg: {
      flex: 1,
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    seatsBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
    seatsLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

    actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    priceBox: { flex: 1 },
    priceLabel: { fontSize: 22, fontWeight: '800', color: colors.white },
    priceSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
    joinBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.full,
    },
    joinBtnFull: { backgroundColor: colors.textTertiary },
    joinBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },

    paginationDots: {
      position: 'absolute',
      top: STATUS_BAR_H + 50,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
      zIndex: 10,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.4)',
    },
    dotActive: {
      width: 20,
      borderRadius: 3,
      backgroundColor: colors.surface,
    },
  });
