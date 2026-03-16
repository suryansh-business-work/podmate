/* global require, module, __dirname */
/**
 * Expo config plugin to optimize Android build size.
 *
 * Applies the following optimizations to gradle.properties:
 * - ABI filter: arm64-v8a only (removes x86, x86_64, armeabi-v7a)
 * - Enables R8/ProGuard minification
 * - Enables resource shrinking
 * - Enables JS bundle compression
 *
 * Also adds comprehensive ProGuard keep rules for React Native compatibility.
 */
const {
  withGradleProperties,
  withAppBuildGradle,
  withDangerousMod,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/** Gradle property overrides for release optimization */
const OPTIMIZED_PROPERTIES = {
  'reactNativeArchitectures': 'arm64-v8a',
  'android.enableMinifyInReleaseBuilds': 'true',
  'android.enableShrinkResourcesInReleaseBuilds': 'true',
  'android.enableBundleCompression': 'true',
};

/** ProGuard rules appended to app/proguard-rules.pro via build.gradle */
const PROGUARD_RULES = `
    # ── React Native core ──
    -keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
    -keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
    -keep @com.facebook.proguard.annotations.DoNotStrip class *
    -keepclassmembers class * { @com.facebook.proguard.annotations.DoNotStrip *; }
    -keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * { void set*(***); *** get*(); }
    -keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }

    # ── Hermes ──
    -keep class com.facebook.hermes.unicode.** { *; }
    -keep class com.facebook.jni.** { *; }

    # ── Reanimated ──
    -keep class com.swmansion.reanimated.** { *; }
    -keep class com.facebook.react.turbomodule.** { *; }

    # ── Expo modules ──
    -keep class expo.modules.** { *; }

    # ── Gesture Handler ──
    -keep class com.swmansion.gesturehandler.** { *; }

    # ── React Native Screens ──
    -keep class com.swmansion.rnscreens.** { *; }

    # ── Google Sign-In ──
    -keep class com.google.android.gms.** { *; }
    -dontwarn com.google.android.gms.**

    # ── Networking ──
    -dontwarn okhttp3.**
    -dontwarn okio.**

    # ── Native methods ──
    -keepclassmembers class * { native <methods>; }

    # ── Vector Icons ──
    -keep class com.oblador.vectoricons.** { *; }
`;

function withOptimizedGradleProperties(config) {
  return withGradleProperties(config, (cfg) => {
    const props = cfg.modResults;

    for (const [key, value] of Object.entries(OPTIMIZED_PROPERTIES)) {
      const idx = props.findIndex(
        (p) => p.type === 'property' && p.key === key
      );
      if (idx !== -1) {
        props[idx] = { type: 'property', key, value };
      } else {
        props.push({ type: 'property', key, value });
      }
    }

    return cfg;
  });
}

function withProguardRules(config) {
  return withAppBuildGradle(config, (cfg) => {
    const buildGradle = cfg.modResults.contents;

    // Check if our custom proguard file reference is already present
    if (buildGradle.includes('proguard-rules-optimized.pro')) {
      return cfg;
    }

    // Add reference to our custom proguard file alongside the existing one
    cfg.modResults.contents = buildGradle.replace(
      /proguardFiles getDefaultProguardFile\("proguard-android.txt"\), "proguard-rules.pro"/,
      'proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro", "proguard-rules-optimized.pro"'
    );

    return cfg;
  });
}

function withCopyProguardRules(config) {
  return withDangerousMod(config, [
    'android',
    (cfg) => {
      const src = path.resolve(__dirname, 'proguard-rules-optimized.pro');
      const dest = path.join(
        cfg.modRequest.platformProjectRoot,
        'app',
        'proguard-rules-optimized.pro'
      );
      fs.copyFileSync(src, dest);
      return cfg;
    },
  ]);
}

function withAndroidBuildOptimization(config) {
  config = withOptimizedGradleProperties(config);
  config = withProguardRules(config);
  config = withCopyProguardRules(config);
  return config;
}

module.exports = withAndroidBuildOptimization;
module.exports.PROGUARD_RULES = PROGUARD_RULES;
