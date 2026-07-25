/**
 * A single selectable category inside a group.
 *
 * Selected state is carried by a filled tint + accent border + a check, not just
 * a colour swap, so it is obvious at a glance which of ~80 categories are on.
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useI18n } from "../i18n";
import { alpha, colors, font, motion, radius, size, space } from "../theme";
import { play } from "../sound";
import AppText from "./AppText";

type Props = {
  label: string;
  selected: boolean;
  accent: string;
  onToggle: () => void;
};

export default function SelectPill({ label, selected, accent, onToggle }: Props) {
  const { dir } = useI18n();
  const pressed = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.04 }],
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: motion.press });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: motion.press });
      }}
      onPress={() => {
        play(selected ? "back" : "select");
        onToggle();
      }}
    >
      <Animated.View
        style={[
          styles.pill,
          dir.row,
          {
            backgroundColor: selected ? alpha(accent, 0.16) : colors.surfaceLo,
            borderColor: selected ? alpha(accent, 0.75) : colors.hairline,
          },
          animStyle,
        ]}
      >
        <View
          style={[
            styles.check,
            {
              backgroundColor: selected ? accent : "transparent",
              borderColor: selected ? accent : colors.hairlineStrong,
            },
          ]}
        >
          {selected ? <Ionicons name="checkmark" size={12} color="#07121A" /> : null}
        </View>
        <AppText
          numberOfLines={1}
          style={[
            styles.label,
            { color: selected ? colors.text : colors.textMuted },
            selected && { fontFamily: font.semi },
          ]}
        >
          {label}
        </AppText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    // flexDirection comes from `dir.row`.
    alignItems: "center",
    gap: space.sm,
    paddingVertical: 9,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: font.regular,
    fontSize: size.small,
  },
});
