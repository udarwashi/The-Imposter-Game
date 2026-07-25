/**
 * Discussion and the verdict.
 *
 * Two states: everyone argues, then the imposter is named.
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "../components/AppText";
import GameButton from "../components/GameButton";
import ScreenBackground from "../components/ScreenBackground";
import { useI18n } from "../i18n";
import { alpha, colors, font, radius, shadows, size, space } from "../theme";
import { play } from "../sound";

type Props = {
  playerNames: string[];
  imposterName: string;
  /** Already resolved to the current language by the caller. */
  categoryName: string;
  secretWord: string;
  showImposter: boolean;
  onRevealImposter: () => void;
  onNewRound: () => void;
  onBackToSetup: () => void;
};

export default function DiscussionScreen({
  playerNames,
  imposterName,
  categoryName,
  secretWord,
  showImposter,
  onRevealImposter,
  onNewRound,
  onBackToSetup,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t, dir } = useI18n();

  useEffect(() => {
    if (showImposter) play("win");
  }, [showImposter]);

  return (
    <ScreenBackground tint={showImposter ? "red" : "gold"} intensity={showImposter ? 1.4 : 1}>
      <View
        style={[
          styles.root,
          { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.lg },
        ]}
      >
        <View style={styles.titleBlock}>
          <AppText style={styles.stage}>{t.votingStage}</AppText>
          <AppText style={styles.title}>{t.whoIsImposter}</AppText>
        </View>

        <View style={styles.center}>
          {!showImposter ? (
            <Animated.View entering={FadeInDown.duration(320)} style={[styles.card, shadows.card]}>
              <View style={styles.iconRing}>
                <Ionicons name="chatbubbles" size={30} color={colors.gold} />
              </View>
              <AppText style={styles.note}>{t.discussionNote}</AppText>

              <View style={styles.divider} />

              <AppText style={styles.label}>{t.categoryLabel}</AppText>
              <AppText style={styles.category}>{categoryName}</AppText>

              <View style={[styles.namesWrap, dir.row]}>
                {playerNames.map((n, i) => (
                  <View key={`${n}-${i}`} style={styles.nameChip}>
                    <AppText style={styles.nameChipText} numberOfLines={1}>
                      {n}
                    </AppText>
                  </View>
                ))}
              </View>
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeInDown.duration(320)}
              style={[styles.card, shadows.card, { borderColor: alpha(colors.red, 0.6) }]}
            >
              <AppText style={styles.label}>{t.imposterWas}</AppText>
              <Animated.View entering={ZoomIn.delay(100).duration(340)} style={styles.revealBox}>
                <Ionicons name="alert-circle" size={26} color={colors.redLight} />
                <AppText style={styles.imposterName} numberOfLines={2}>
                  {imposterName}
                </AppText>
              </Animated.View>

              <View style={styles.divider} />
              <AppText style={styles.label}>{t.wordWas}</AppText>
              <AppText style={styles.word}>{secretWord}</AppText>
            </Animated.View>
          )}
        </View>

        <View style={styles.actions}>
          {!showImposter ? (
            <GameButton
              title={t.revealImposter}
              icon="eye"
              variant="danger"
              onPress={onRevealImposter}
            />
          ) : (
            <GameButton title={t.newRound} icon="refresh" onPress={onNewRound} />
          )}
          <GameButton title={t.backToPlayers} variant="ghost" size="sm" onPress={onBackToSetup} />
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: space.xl,
  },
  titleBlock: {
    alignItems: "center",
    gap: 2,
  },
  stage: {
    fontFamily: font.semi,
    fontSize: size.tiny,
    color: colors.textFaint,
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: font.black,
    fontSize: size.h1,
    color: colors.text,
    textAlign: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    padding: space.xxl,
    alignItems: "center",
    gap: space.sm,
  },
  iconRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: alpha(colors.gold, 0.14),
    borderWidth: 2,
    borderColor: alpha(colors.gold, 0.5),
    marginBottom: space.sm,
  },
  note: {
    fontFamily: font.regular,
    fontSize: size.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 23,
  },
  divider: {
    height: 1,
    alignSelf: "stretch",
    backgroundColor: colors.hairline,
    marginVertical: space.md,
  },
  label: {
    fontFamily: font.regular,
    fontSize: size.tiny,
    color: colors.textFaint,
    textAlign: "center",
    letterSpacing: 0.6,
  },
  category: {
    fontFamily: font.bold,
    fontSize: size.h3,
    color: colors.text,
    textAlign: "center",
  },
  namesWrap: {
    flexWrap: "wrap",
    justifyContent: "center",
    gap: space.sm,
    marginTop: space.md,
  },
  nameChip: {
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceLo,
    borderWidth: 1,
    borderColor: colors.hairline,
    maxWidth: 140,
  },
  nameChipText: {
    fontFamily: font.semi,
    fontSize: size.small,
    color: colors.textMuted,
  },
  revealBox: {
    alignSelf: "stretch",
    marginTop: space.sm,
    paddingVertical: space.xxl,
    paddingHorizontal: space.lg,
    borderRadius: radius.xl,
    alignItems: "center",
    gap: space.sm,
    backgroundColor: alpha(colors.red, 0.14),
    borderWidth: 2,
    borderColor: alpha(colors.red, 0.55),
  },
  imposterName: {
    fontFamily: font.black,
    fontSize: 34,
    color: colors.redLight,
    textAlign: "center",
  },
  word: {
    fontFamily: font.bold,
    fontSize: size.h2,
    color: colors.greenLight,
    textAlign: "center",
  },
  actions: {
    gap: space.sm,
  },
});
