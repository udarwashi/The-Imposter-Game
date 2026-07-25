import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { I18nManager, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LanguageProvider, useI18n } from "../src/i18n";
import { initAudio } from "../src/sound";
import { colors } from "../src/theme";

// Pin Yoga's base direction to LTR, before anything lays out.
//
// The Android manifest sets `android:supportsRtl="true"`, so on a phone whose
// system language is Arabic (or Hebrew/Farsi/Urdu) React Native would otherwise
// set `I18nManager.isRTL`, which flips what `flexDirection: "row"` means. The
// app draws its own direction from the language the player picked — see
// `src/i18n/direction.ts` — so a second, device-level flip on top of that would
// mirror every row back the wrong way. Pinning it here makes the one in
// `direction.ts` the only flip in the app.
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

// Not available in Expo Go, so never let a rejection escape.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  // Four real weights, instanced from the Alexandria variable font by
  // scripts/ (see assets/fonts). Synthetic bolding of a single static TTF looks
  // bad on Android, so the display weights are separate families.
  const [loaded] = useFonts({
    stc: require("../assets/fonts/Alexandria-Regular.ttf"),
    stcSemi: require("../assets/fonts/Alexandria-SemiBold.ttf"),
    stcBold: require("../assets/fonts/Alexandria-Bold.ttf"),
    stcBlack: require("../assets/fonts/Alexandria-ExtraBold.ttf"),
  });

  // Restores the mute preference and configures the audio session once.
  useEffect(() => {
    void initAudio();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <LanguageProvider>
        <AppShell fontsLoaded={loaded} />
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Lives inside the provider so the splash can wait on the stored language as
 * well as the fonts. Painting before the language is known would show a frame
 * of the wrong locale — brief, but it reads as a bug.
 */
function AppShell({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { ready: langReady } = useI18n();
  const ready = fontsLoaded && langReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // While we wait, paint the app's own background. Returning null here used to
  // leave the bare window showing, which is white — that was the white flash on
  // launch. Paired with `expo.backgroundColor` in app.json, which sets the
  // native window background for the frames before JS is even running.
  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </SafeAreaProvider>
  );
}
