import { StyleSheet, Platform, Dimensions } from 'react-native';
import { ThemeUtils } from '../../hooks/useThemedStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const MEDIA_MAX_WIDTH = SCREEN_WIDTH * 0.6;

/* ── Input bar constants ── */
const INPUT_BAR_HEIGHT = 56;
const INPUT_MIN_HEIGHT = 40;
const INPUT_MAX_HEIGHT = 100;
const SEND_BTN_SIZE = 40;

/* ── Chat list (pod selector) ── */
export const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    /* Shared */
    container: { flex: 1, backgroundColor: colors.white },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },

    /* ─── Chat list screen ─── */
    header: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
      marginTop: spacing.md,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    list: {
      paddingHorizontal: spacing.xl,
      paddingBottom: 100,
      flexGrow: 1,
    },
    chatRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    avatar: { width: 52, height: 52, borderRadius: 26 },
    chatInfo: { flex: 1 },
    chatName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    chatMessage: { fontSize: 14, color: colors.textSecondary },
    separator: { height: 1, backgroundColor: colors.surfaceVariant },

    /* ─── Chat room header (fixed) ─── */
    roomHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceVariant,
      backgroundColor: colors.white,
      gap: spacing.sm,
      zIndex: 10,
      elevation: 4,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    backBtn: { padding: spacing.xs },
    roomAvatar: { width: 40, height: 40, borderRadius: 20 },
    roomHeaderInfo: { flex: 1, justifyContent: 'center' },
    roomTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    roomSubtitle: { fontSize: 12, color: colors.success, fontWeight: '500' },
    roomSubtitleOffline: { color: colors.textTertiary },

    /* ─── Messages list ─── */
    messagesList: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },

    /* ─── Message bubble ─── */
    msgRow: {
      flexDirection: 'row',
      marginBottom: 2,
      alignItems: 'flex-end',
    },
    msgRowMe: { justifyContent: 'flex-end' },
    msgRowSpacedTop: { marginTop: spacing.sm },
    msgAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      marginRight: spacing.xs,
    },
    msgAvatarPlaceholder: { width: 28, marginRight: spacing.xs },
    msgBubble: {
      maxWidth: '75%',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 18,
    },
    msgBubbleOther: {
      backgroundColor: colors.surfaceVariant,
      borderBottomLeftRadius: 4,
    },
    msgBubbleMe: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    mediaBubble: {
      paddingHorizontal: spacing.xs,
      paddingTop: spacing.xs,
      overflow: 'hidden',
    },
    msgSenderName: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.secondary,
      marginBottom: 2,
    },
    msgText: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 20,
    },
    msgTextMe: { color: colors.white },
    msgTime: {
      fontSize: 10,
      color: colors.textTertiary,
      marginTop: 2,
      alignSelf: 'flex-end',
    },
    msgTimeMe: { color: 'rgba(255,255,255,0.7)' },
    mediaThumbnail: {
      width: MEDIA_MAX_WIDTH,
      height: MEDIA_MAX_WIDTH * 0.65,
      borderRadius: borderRadius.md,
    },
    videoThumbWrap: { position: 'relative' as const },
    playOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: 'rgba(0,0,0,0.18)',
    },

    /* Day separator */
    daySeparator: {
      alignSelf: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(0,0,0,0.06)',
      marginVertical: spacing.md,
    },
    daySeparatorText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },

    /* ─── Uploading indicator ─── */
    uploadingBar: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surfaceVariant,
    },
    uploadingText: { fontSize: 13, color: colors.textSecondary },

    /* ─── Input bar (fixed bottom) ─── */
    inputBarOuter: {
      borderTopWidth: 1,
      borderTopColor: colors.surfaceVariant,
      backgroundColor: colors.white,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      minHeight: INPUT_BAR_HEIGHT,
      gap: spacing.xs,
    },
    attachBtn: {
      width: SEND_BTN_SIZE,
      height: SEND_BTN_SIZE,
      borderRadius: SEND_BTN_SIZE / 2,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 20,
      paddingHorizontal: spacing.md,
      paddingTop: Platform.OS === 'ios' ? 10 : 8,
      paddingBottom: Platform.OS === 'ios' ? 10 : 8,
      fontSize: 15,
      minHeight: INPUT_MIN_HEIGHT,
      maxHeight: INPUT_MAX_HEIGHT,
      color: colors.text,
      textAlignVertical: 'center',
    },
    sendBtn: {
      width: SEND_BTN_SIZE,
      height: SEND_BTN_SIZE,
      borderRadius: SEND_BTN_SIZE / 2,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendBtnDisabled: { opacity: 0.4 },

    /* ─── Attachment panel ─── */
    attachRow: {
      flexDirection: 'row' as const,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      gap: spacing.xl,
      borderTopWidth: 1,
      borderTopColor: colors.surfaceVariant,
      backgroundColor: colors.white,
    },
    attachOption: { alignItems: 'center' as const, gap: spacing.xs },
    attachCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    attachLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500' as const,
    },
  });

/* ─── Media preview modal ─── */
export const createPvStyles = ({ colors }: ThemeUtils) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.92)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeBtn: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
      padding: 8,
    },
    fullImage: { width: '100%', height: '80%' },
  });
