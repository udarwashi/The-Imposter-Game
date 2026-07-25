/**
 * Shared screen header: a back chevron, a title block, and an optional slot.
 *
 * Laid out in reading order, so "back" points right in Arabic and left in
 * English — see `src/i18n/direction.ts`.
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../i18n";
import { colors, font, radius, size, space } from "../theme";
import { play } from "../sound";
import AppText from "./AppText";

type Props = {
  title: string;
  subtitle?: string;
  /** Omit to hide the back button. */
  onBack?: () => void;
  right?: React.ReactNode;
  /** Small step indicator, e.g. "١ / ٢" or "1 / 2". */
  step?: string;
};

export default function ScreenHeader({ title, subtitle, onBack, right, step }: Props) {
  const insets = useSafeAreaInsets();
  const { t, dir } = useI18n();

  return (
    <View style={[styles.root, { paddingTop: insets.top + space.md }]}>
      <View style={[styles.row, dir.row]}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.a11yBack}
            hitSlop={10}
            onPress={() => {
              play("back");
              onBack();
            }}
            style={styles.iconBtn}
          >
            <Ionicons name={dir.icons.back} size={22} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}

        <View style={[styles.titleWrap, dir.alignStart]}>
          <View style={[styles.titleRow, dir.row]}>
            <AppText style={[styles.title, dir.textStart]}>{title}</AppText>
            {step ? (
              <View style={styles.stepPill}>
                <AppText style={styles.stepText}>{step}</AppText>
              </View>
            ) : null}
          </View>
          {subtitle ? (
            <AppText style={[styles.subtitle, dir.textStart]}>{subtitle}</AppText>
          ) : null}
        </View>

        <View style={[styles.rightSlot, dir.alignEnd]}>{right}</View>
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
    gap: 2,
  },
  titleRow: {
    alignItems: "center",
    gap: space.sm,
  },
  title: {
    fontFamily: font.black,
    fontSize: size.h2,
    color: colors.text,
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
  },
  rightSlot: {
    minWidth: 40,
  },
});
