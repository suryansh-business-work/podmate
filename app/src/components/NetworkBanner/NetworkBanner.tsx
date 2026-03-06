import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Animated, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemedStyles, useAppColors, ThemeUtils } from '../../hooks/useThemedStyles';

const NetworkBanner: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const [isConnected, setIsConnected] = useState(true);
  const [wasDisconnected, setWasDisconnected] = useState(false);
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBanner = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [slideAnim]);

  const hideBanner = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? true;

      if (!connected) {
        setIsConnected(false);
        setWasDisconnected(true);
        showBanner();
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      } else if (wasDisconnected || !isConnected) {
        setIsConnected(true);
        showBanner();
        reconnectTimer.current = setTimeout(() => {
          hideBanner();
          setWasDisconnected(false);
        }, 3000);
      }
    });

    return () => {
      unsubscribe();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [isConnected, wasDisconnected, showBanner, hideBanner]);

  const bgColor = isConnected ? colors.success : colors.error;
  const message = isConnected ? 'Back online' : 'No internet connection';
  const icon = isConnected ? 'wifi' : 'wifi-off';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: bgColor,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.content}>
        <MaterialIcons name={icon} size={16} color={colors.white} />
        <Text style={styles.text}>{message}</Text>
        {!isConnected && (
          <TouchableOpacity
            onPress={() => NetInfo.refresh()}
            style={styles.retryBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons name="refresh" size={16} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      elevation: 10,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      gap: 8,
    },
    text: {
      color: colors.white,
      fontSize: 13,
      fontWeight: '600',
    },
    retryBtn: {
      padding: 4,
    },
  });

export default NetworkBanner;
