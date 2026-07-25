/**
 * The one button in the game.
 *
 * Replaces PrimaryButton/SecondaryButton. What makes it feel like a game button
 * rather than a web button:
 *
 *  - a darker "lip" behind the face, so the button has visible thickness
 *  - pressing translates the face DOWN into that lip, instead of just fading
 *  - a paired sound + haptic on every press
 *
 * The lip trick works with auto height: the outer view reserves `LIP` px of
 * bottom padding, and the face slides into it on press, so total height never
 * changes and nothing reflows.
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useI18n } from "../i18n";
import { colors, font, motion, radius, shadows, size, space } from "../theme";
import { play, SoundName } from "../sound";
import AppText from "./AppText";

export type GameButtonVariant = "primary" | "danger" | "secondary" | "ghost";
export type GameButtonSize = "lg" | "md" | "sm";

type Props = {
  title: string;
  onPress: () => void;
  variant?: GameButtonVariant;
  size?: GameButtonSize;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  /** Overrides the variant's default sound. */
  sound?: SoundName | null;
  style?: StyleProp<ViewStyle>;
};

/** How thick the button looks, per size. */
const LIP: Record<GameButtonSize, number> = { lg: 5, md: 4, sm: 3 };

const PADDING: Record<GameButtonSize, { v: number; h: number }> = {
  lg: { v: 17, h: 20 },
  md: { v: 13, h: 16 },
  sm: { v: 9, h: 12 },
};

const LABEL: Record<GameButtonSize, number> = {
  lg: size.h3,
  md: size.body,
  sm: size.small,
};

const FACE: Record<GameButtonVariant, readonly [string, string]> = {
  primary: [colors.greenLight, colors.green],
  danger: ["#FF5C5C", colors.red],
  secondary: [colors.surfaceHi, colors.surface],
  ghost: ["transparent", "transparent"],
};

/** The lip is a darkened version of the face's bottom stop. */
const LIP_COLOR: Record<GameButtonVariant, string> = {
  primary: colors.greenDeep,
  danger: colors.redDeep,
  secondary: colors.surfaceLo,
  ghost: "transparent",
};

const TEXT_COLOR: Record<GameButtonVariant, string> = {
  primary: "#04140B",
  danger: "#FFFFFF",
  secondary: colors.text,
  ghost: colors.textMuted,
};

const DEFAULT_SOUND: Record<GameButtonVariant, SoundName> = {
  primary: "confirm",
  danger: "tap",
  secondary: "tap",
  ghost: "back",
};

export default function GameButton({
  title,
  onPress,
  variant = "primary",
  size: sz = "lg",
  disabled = false,
  icon,
  sound,
  style,
}: Props) {
  const { dir } = useI18n();
  const pressed = useSharedValue(0);
  const lip = LIP[sz];

  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * lip }],
  }));

  const isGhost = variant === "ghost";
  const faceColors = disabled
    ? ([colors.disabled, colors.disabled] as const)
    : FACE[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: motion.press });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: motion.press });
      }}
      onPress={() => {
        const s = sound === undefined ? DEFAULT_SOUND[variant] : sound;
        if (s) play(s);
        onPress();
      }}
      style={style}
    >
      <View
        style={[
          styles.lipLayer,
          {
            borderRadius: sz === "sm" ? radius.sm : radius.md,
            backgroundColor: disabled ? colors.surfaceLo : LIP_COLOR[variant],
            paddingBottom: isGhost ? 0 : lip,
          },
          !isGhost && !disabled && shadows.button,
        ]}
      >
        <Animated.View style={faceStyle}>
          <LinearGradient
            colors={faceColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.face,
              dir.row,
              {
                borderRadius: sz === "sm" ? radius.sm : radius.md,
                paddingVertical: PADDING[sz].v,
                paddingHorizontal: PADDING[sz].h,
                borderColor: isGhost ? "transparent" : "rgba(255,255,255,0.16)",
                opacity: disabled ? 0.7 : 1,
              },
            ]}
          >
            {icon ? (
              <Ionicons
                name={icon}
                size={LABEL[sz] + 3}
                color={disabled ? colors.textFaint : TEXT_COLOR[variant]}
              />
            ) : null}
            <AppText
              numberOfLines={1}
              style={{
                fontFamily: variant === "ghost" ? font.semi : font.bold,
                fontSize: LABEL[sz],
                color: disabled ? colors.textFaint : TEXT_COLOR[variant],
                textAlign: "center",
              }}
            >
              {title}
            </AppText>
          </LinearGradient>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  lipLayer: {
    width: "100%",
  },
  face: {
    // flexDirection comes from `dir.row` — the icon leads the label in both
    // reading directions.
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    borderWidth: 1,
  },
});
