/**
 * The layered game background.
 *
 * A single flat colour is most of why the old UI read as a web page. This puts
 * two large, soft radial glows behind everything so panels have something to sit
 * on top of. `expo-linear-gradient` cannot do radial, hence react-native-svg.
 *
 * The SVG is laid out in a 0-100 space with `preserveAspectRatio="none"` so it
 * stretches to any screen without measuring anything.
 */

import React from "react";
import { StyleSheet, View, ViewStyle, StyleProp } from "react-native";
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from "react-native-svg";
import { colors } from "../theme";

export type BackgroundTint = "neutral" | "green" | "red" | "gold";

const TINTS: Record<BackgroundTint, { top: string; bottom: string }> = {
  neutral: { top: colors.green, bottom: colors.blue },
  green: { top: colors.greenLight, bottom: colors.green },
  red: { top: colors.red, bottom: colors.redLight },
  gold: { top: colors.gold, bottom: colors.green },
};

type Props = {
  tint?: BackgroundTint;
  /** 0-1 multiplier on glow strength. */
  intensity?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export default function ScreenBackground({
  tint = "neutral",
  intensity = 1,
  style,
  children,
}: Props) {
  const { top, bottom } = TINTS[tint];

  return (
    <View style={[styles.root, style]}>
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient id="glowTop" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={top} stopOpacity={0.3 * intensity} />
            <Stop offset="0.55" stopColor={top} stopOpacity={0.1 * intensity} />
            <Stop offset="1" stopColor={top} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="glowBottom" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={bottom} stopOpacity={0.22 * intensity} />
            <Stop offset="0.6" stopColor={bottom} stopOpacity={0.07 * intensity} />
            <Stop offset="1" stopColor={bottom} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Rect x="0" y="0" width="100" height="100" fill={colors.bg} />
        {/* Top-right wash, roughly behind the header. */}
        <Ellipse cx="78" cy="8" rx="62" ry="34" fill="url(#glowTop)" />
        {/* Bottom-left wash, behind the sticky action bar. */}
        <Ellipse cx="14" cy="92" rx="66" ry="32" fill="url(#glowBottom)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
