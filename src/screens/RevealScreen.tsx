/**
 * The pass-the-phone stage.
 *
 * Two steps per player: "hand the phone to X", then the secret word (or the
 * imposter card). The whole screen tints red for the imposter so the moment
 * lands, and the sting plays once on entry.
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "../components/AppText";
import GameButton from "../components/GameButton";
import ScreenBackground from "../components/ScreenBackground";
import { alpha, colors, font, radius, shadows, size, space } from "../theme";
import { play } from "../sound";

type Props = {
  playerName: string;
  playerIndex: number;
  playerCount: number;
  revealed: boolean[];
  step: "name" | "secret";
  isImposter: boolean;
  categoryNameAr: string;
  secretWord: string;
  onShowSecret: () => void;
  onNext: () => void;
  onEndRound: () => void;
};

export default function RevealScreen({
  playerName,
  playerIndex,
  playerCount,
  revealed,
  step,
  isImposter,
  categoryNameAr,
  secretWord,
  onShowSecret,
  onNext,
  onEndRound,
}: Props) {
  const insets = useSafeAreaInsets();
  const secret = step === "secret";

  // The SAME sound and haptic for every player, deliberately.
  //
  // Anything role-dependent here leaks the secret: the word on screen is only
  // visible to whoever holds the phone, but a sound is heard by the whole room
  // and a distinct vibration is felt through the table. The reveal has to be
  // indistinguishable from the outside.
  useEffect(() => {
    if (secret) play("reveal");
  }, [secret, playerIndex]);

  return (
    <ScreenBackground tint={secret && isImposter ? "red" : "neutral"} intensity={secret ? 1.4 : 1}>
      <View
        style={[
          styles.root,
          { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.lg },
        ]}
      >
        {/* Progress dots — one per player, filled as they finish. */}
        <View style={styles.progress}>
          {Array.from({ length: playerCount }, (_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                revealed[i] && styles.dotDone,
                i === playerIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <AppText style={styles.stage}>
          مرحلة الكشف · {playerIndex + 1} من {playerCount}
        </AppText>

        <View style={styles.center}>
          {!secret ? (
            <Animated.View
              key={`name-${playerIndex}`}
              entering={FadeInDown.duration(300)}
              style={[styles.card, shadows.card]}
            >
              <View style={styles.avatarBig}>
                <AppText style={styles.avatarBigText}>
                  {playerName.trim().charAt(0) || "؟"}
                </AppText>
              </View>
              <AppText style={styles.label}>الدور على</AppText>
              <AppText style={styles.playerName} numberOfLines={2}>
                {playerName}
              </AppText>
              <View style={styles.divider} />
              <View style={styles.noteRow}>
                <Ionicons name="phone-portrait-outline" size={15} color={colors.textMuted} />
                <AppText style={styles.note}>
                  سلّم الجوال لهذا اللاعب، واضغط عندما يكون جاهزًا
                </AppText>
              </View>
            </Animated.View>
          ) : (
            <Animated.View
              key={`secret-${playerIndex}`}
              entering={FadeIn.duration(220)}
              style={[
                styles.card,
                shadows.card,
                isImposter && { borderColor: alpha(colors.red, 0.6) },
              ]}
            >
              <AppText style={styles.label}>اللاعب</AppText>
              <AppText style={styles.playerNameSmall}>{playerName}</AppText>

              <View style={styles.chipRow}>
                <Ionicons name="albums-outline" size={13} color={colors.textMuted} />
                <AppText style={styles.category}>{categoryNameAr}</AppText>
              </View>

              <Animated.View
                entering={ZoomIn.delay(80).duration(320)}
                style={[styles.wordBox, isImposter && styles.wordBoxImposter]}
              >
                {isImposter ? (
                  <>
                    <Ionicons name="eye-off" size={30} color={colors.redLight} />
                    <AppText style={[styles.word, styles.wordImposter]}>أنت المندس</AppText>
                    <AppText style={styles.imposterHint}>
                      لا تعرف الكلمة — جاري وحاول ما ينكشف عليك
                    </AppText>
                  </>
                ) : (
                  <AppText style={styles.word}>{secretWord}</AppText>
                )}
              </Animated.View>

              <AppText style={styles.note}>احفظها، ثم اضغط “التالي” وسلّم الجوال للي بعدك</AppText>
            </Animated.View>
          )}
        </View>

        <View style={styles.actions}>
          {!secret ? (
            <GameButton title="عرض الكلمة" icon="eye" onPress={onShowSecret} />
          ) : (
            <GameButton
              title={playerIndex + 1 >= playerCount ? "ابدأ النقاش" : "التالي"}
              icon="arrow-back"
              onPress={onNext}
            />
          )}
          <GameButton
            title="إنهاء الجولة"
            variant="ghost"
            size="sm"
            onPress={onEndRound}
          />
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
  progress: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 6,
    paddingBottom: space.sm,
  },
  dot: {
    width: 22,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceHi,
  },
  dotDone: { backgroundColor: alpha(colors.green, 0.75) },
  dotActive: { backgroundColor: colors.text },
  stage: {
    fontFamily: font.semi,
    fontSize: size.tiny,
    color: colors.textFaint,
    textAlign: "center",
    letterSpacing: 0.5,
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
  avatarBig: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: alpha(colors.green, 0.16),
    borderWidth: 2,
    borderColor: alpha(colors.green, 0.55),
    marginBottom: space.sm,
  },
  avatarBigText: {
    fontFamily: font.black,
    fontSize: 30,
    color: colors.greenLight,
  },
  label: {
    fontFamily: font.regular,
    fontSize: size.tiny,
    color: colors.textFaint,
    textAlign: "center",
    letterSpacing: 0.6,
  },
  playerName: {
    fontFamily: font.black,
    fontSize: size.h1,
    color: colors.text,
    textAlign: "center",
  },
  playerNameSmall: {
    fontFamily: font.bold,
    fontSize: size.h3,
    color: colors.text,
    textAlign: "center",
  },
  divider: {
    height: 1,
    alignSelf: "stretch",
    backgroundColor: colors.hairline,
    marginVertical: space.md,
  },
  noteRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: space.sm,
  },
  note: {
    fontFamily: font.regular,
    fontSize: size.small,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 21,
    flexShrink: 1,
  },
  chipRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceLo,
    borderWidth: 1,
    borderColor: colors.hairline,
    marginTop: space.xs,
  },
  category: {
    fontFamily: font.semi,
    fontSize: size.tiny,
    color: colors.textMuted,
  },
  wordBox: {
    alignSelf: "stretch",
    marginVertical: space.lg,
    paddingVertical: space.xxl,
    paddingHorizontal: space.lg,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    backgroundColor: alpha(colors.green, 0.12),
    borderWidth: 2,
    borderColor: alpha(colors.green, 0.45),
  },
  wordBoxImposter: {
    backgroundColor: alpha(colors.red, 0.14),
    borderColor: alpha(colors.red, 0.55),
  },
  word: {
    fontFamily: font.black,
    fontSize: 34,
    color: colors.greenLight,
    textAlign: "center",
  },
  wordImposter: {
    color: colors.redLight,
  },
  imposterHint: {
    fontFamily: font.regular,
    fontSize: size.small,
    color: alpha(colors.redLight, 0.85),
    textAlign: "center",
  },
  actions: {
    gap: space.sm,
  },
});
