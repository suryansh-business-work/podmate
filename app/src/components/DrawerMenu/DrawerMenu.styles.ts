import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFBFC' },

  /* Gradient header */
  headerGradient: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.6)' },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  userName: { fontSize: 18, fontWeight: '700', color: colors.white, maxWidth: '75%' },
  userPhone: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  roleText: { fontSize: 10, fontWeight: '700', color: colors.white, letterSpacing: 0.5 },

  /* Sections */
  scrollContent: { flex: 1, paddingTop: spacing.md },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '500', color: colors.text, flex: 1 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: spacing.sm, marginHorizontal: spacing.xl },
  logoutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: spacing.xl, gap: spacing.md },
  logoutLabel: { fontSize: 15, fontWeight: '600', color: colors.error, flex: 1 },
  footer: { alignItems: 'center', paddingVertical: spacing.xl },
  footerText: { fontSize: 11, color: colors.textTertiary, letterSpacing: 0.3 },
});

export default styles;
