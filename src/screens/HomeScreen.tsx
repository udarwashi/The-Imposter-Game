/**
 * Title screen. Logo, wordmark, and the way in.
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "../components/AppText";
import GameButton from "../components/GameButton";
import Logo from "../components/Logo";
import ScreenBackground from "../components/ScreenBackground";
import { LANG_LABEL, useI18n } from "../i18n";
import { colors, font, radius, size, space } from "../theme";
import { play, startAmbient, stopAmbient, toggleMuted, useMuted } from "../sound";

type Props = {
  onStart: () => void;
  onHowToPlay: () => void;
  /** Shown as a subtle hint when a squad is already saved. */
  savedPlayers: number;
  savedCategories: number;
};

export default function HomeScreen({
  onStart,
  onHowToPlay,
  savedPlayers,
  savedCategories,
}: Props) {
  const insets = useSafeAreaInsets();
  const muted = useMuted();
  const { lang, t, dir, toggleLang } = useI18n();

  /** The toggle is labelled with the language it switches TO, not the current one. */
  const otherLang = lang === "ar" ? "en" : "ar";

  // The pad belongs to this screen only.
  useEffect(() => {
    startAmbient();
    return () => stopAmbient();
  }, []);

  return (
    <ScreenBackground tint="neutral">
      <View style={[styles.root, { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.xl }]}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.topBar}>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: !muted }}
            accessibilityLabel={muted ? t.a11yUnmute : t.a11yMute}
            hitSlop={12}
            onPress={toggleMuted}
            style={styles.iconBtn}
          >
            <Ionicons
              name={muted ? "volume-mute" : "volume-high"}
              size={20}
              color={muted ? colors.textFaint : colors.text}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.a11ySwitchLang}
            hitSlop={12}
            onPress={() => {
              play("select");
              toggleLang();
            }}
            style={styles.iconBtn}
          >
            <AppText style={styles.langText}>{LANG_LABEL[otherLang]}</AppText>
          </Pressable>
        </Animated.View>

        <View style={styles.center}>
          <Animated.View entering={FadeInDown.duration(560)}>
            <Logo size={190} pulse />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(180).duration(520)} style={styles.titleBlock}>
            <AppText style={styles.title}>{t.appName}</AppText>
            <View style={styles.rule} />
            <AppText style={styles.tagline}>{t.tagline}</AppText>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(320).duration(520)} style={styles.actions}>
          <GameButton title={t.play} icon="play" onPress={onStart} />
          <GameButton
            title={t.howToPlayTitle}
            variant="ghost"
            size="md"
            icon="help-circle-outline"
            onPress={onHowToPlay}
          />

          {savedPlayers > 0 ? (
            <View style={[styles.savedRow, dir.row]}>
              <Ionicons name="bookmark" size={13} color={colors.textFaint} />
              <AppText style={styles.saved}>
                {t.savedSquad(savedPlayers, savedCategories)}
              </AppText>
            </View>
          ) : null}
        </Animated.View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: space.xl,
  },
  // Kept physically left-aligned in both languages: these are utility toggles,
  // not part of the reading flow, and moving them on a language switch would be
  // more disorienting than helpful.
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: space.sm,
  },
  langText: {
    fontFamily: font.bold,
    fontSize: size.small,
    color: colors.text,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLo,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.xl,
  },
  titleBlock: {
    alignItems: "center",
    gap: space.md,
  },
  title: {
    fontFamily: font.black,
    fontSize: size.display,
    color: colors.text,
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: "rgba(63,175,108,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  rule: {
    width: 66,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.green,
  },
  tagline: {
    fontFamily: font.regular,
    fontSize: size.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  actions: {
    gap: space.md,
  },
  savedRow: {
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    marginTop: space.xs,
  },
  saved: {
    fontFamily: font.regular,
    fontSize: size.tiny,
    color: colors.textFaint,
    textAlign: "center",
  },
});
