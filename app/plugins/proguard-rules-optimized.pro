# ══════════════════════════════════════════════════
# Optimized ProGuard/R8 rules for PartyWings APK
# ══════════════════════════════════════════════════

# ── React Native core ──
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * { @com.facebook.proguard.annotations.DoNotStrip *; }
-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * { void set*(***); *** get*(); }
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }

# ── Hermes engine ──
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
