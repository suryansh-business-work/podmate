import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedStyles, useAppColors, ThemeUtils } from '../hooks/useThemedStyles';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const splashVideo = require('../../assets/icon-and-splash/splash_photo.mp4');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);

  const player = useVideoPlayer(splashVideo, (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    Animated.timing(logoOpacity, { toValue: 1, duration: 600, delay: 400, useNativeDriver: true }).start();
    timerRef.current = setTimeout(finish, 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [finish, logoOpacity]);

  useEffect(() => {
    const sub = player.addListener('playToEnd', () => {
      finish();
    });
    return () => { sub.remove(); };
  }, [player, finish]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={false}
        contentFit="cover"
      />
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity }]}>
        <LinearGradient colors={[colors.primaryLight, colors.primary]} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <MaterialCommunityIcons name="account-group" size={22} color={colors.white} />
        </LinearGradient>
        <Text style={styles.brandName}>PartyWings</Text>
      </Animated.View>
    </View>
  );
};

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  video: { width: SCREEN_W, height: SCREEN_H, position: 'absolute', top: 0, left: 0 },
  logoWrap: { position: 'absolute', bottom: 48, alignSelf: 'center', alignItems: 'center', gap: 8 },
  logoBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  brandName: { fontSize: 16, fontWeight: '700', color: colors.white, letterSpacing: 0.5 },
});

export default SplashScreen;
