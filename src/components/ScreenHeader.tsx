/**
 * Shared screen header: a back chevron, a title block, and an optional slot.
 * Laid out RTL, so "back" points right.
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, font, radius, size, space } from "../theme";
import { play } from "../sound";
import AppText from "./AppText";

type Props = {
  title: string;
  subtitle?: string;
  /** Omit to hide the back button. */
  onBack?: () => void;
  right?: React.ReactNode;
  /** Small step indicator, e.g. "١ / ٢". */
  step?: string;
};

export default function ScreenHeader({ title, subtitle, onBack, right, step }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + space.md }]}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="رجوع"
            hitSlop={10}
            onPress={() => {
              play("back");
              onBack();
            }}
            style={styles.iconBtn}
          >
            <Ionicons name="chevron-forward" size={22} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}

        <View style={styles.titleWrap}>
          <View style={styles.titleRow}>
            <AppText style={styles.title}>{title}</AppText>
            {step ? (
              <View style={styles.stepPill}>
                <AppText style={styles.stepText}>{step}</AppText>
              </View>
            ) : null}
          </View>
          {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
        </View>

        <View style={styles.rightSlot}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: space.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLo,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  titleWrap: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },
  titleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: space.sm,
  },
  title: {
    fontFamily: font.black,
    fontSize: size.h2,
    color: colors.text,
    textAlign: "right",
  },
  stepPill: {
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  stepText: {
    fontFamily: font.semi,
    fontSize: size.tiny,
    color: colors.textMuted,
  },
  subtitle: {
    fontFamily: font.regular,
    fontSize: size.small,
    color: colors.textMuted,
    textAlign: "right",
  },
  rightSlot: {
    minWidth: 40,
    alignItems: "flex-start",
  },
});
