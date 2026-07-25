import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initAudio } from "../src/sound";
import { colors } from "../src/theme";

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

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  // While the fonts load, paint the app's own background. Returning null here
  // used to leave the bare window showing, which is white — that was the white
  // flash on launch. Paired with `expo.backgroundColor` in app.json, which sets
  // the native window background for the frames before JS is even running.
  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
