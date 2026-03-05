import { StyleSheet, Platform } from 'react-native';
import { ThemeUtils } from '../hooks/useThemedStyles';

export const createDrawerStyles = ({ colors }: ThemeUtils) => StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    zIndex: 100,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 101,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
    ...Platform.select({
      android: { paddingTop: 0 },
    }),
  },
});
