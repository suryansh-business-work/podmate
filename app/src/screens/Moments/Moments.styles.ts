import { StyleSheet, Dimensions, Platform } from 'react-native';
import type { ThemeUtils } from '../../hooks/useThemedStyles';

const MEDIA_WIDTH = Dimensions.get('window').width - 32;

export const createStyles = ({ colors }: ThemeUtils) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginTop: 12,
    },
    emptySubtitle: {
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 4,
      textAlign: 'center',
    },
    list: {
      paddingBottom: 100,
    },
    /* ── Moment Card ── */
    card: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
    },
    cardAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceVariant,
    },
    cardUserInfo: {
      flex: 1,
      marginLeft: 10,
    },
    cardUserName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    cardTime: {
      fontSize: 11,
      color: colors.textTertiary,
      marginTop: 1,
    },
    cardDeleteBtn: {
      padding: 4,
    },
    cardImage: {
      width: '100%',
      height: 280,
      backgroundColor: colors.surfaceVariant,
    },
    cardMediaSlide: {
      width: MEDIA_WIDTH,
      height: 280,
      backgroundColor: colors.surfaceVariant,
    },
    mediaDots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 8,
    },
    mediaDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    cardFooter: {
      padding: 12,
    },
    cardCaption: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 10,
    },
    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 20,
    },
    actionCount: {
      fontSize: 13,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    /* ── FAB ── */
    fab: {
      position: 'absolute',
      bottom: Platform.OS === 'android' ? 40 : 24,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    fabGradient: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    /* ── Comment Bottom Sheet ── */
    commentOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    commentSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '60%',
      paddingTop: 12,
    },
    commentSheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: 8,
    },
    commentSheetTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    commentItem: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    commentAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.surfaceVariant,
    },
    commentBody: {
      flex: 1,
      marginLeft: 8,
    },
    commentUser: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    commentText: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    commentInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    commentInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      maxHeight: 80,
    },
    commentSendBtn: {
      marginLeft: 8,
      padding: 4,
    },
  });
