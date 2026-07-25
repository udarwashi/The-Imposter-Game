/**
 * One collapsible category group.
 *
 * The header does two independent jobs, so they get separate hit targets:
 *   - tapping the row expands/collapses
 *   - tapping the check toggles the WHOLE group at once
 *
 * Collapse animation: the body is always mounted and absolutely positioned, so
 * `onLayout` reports its natural height regardless of how much of it is
 * currently revealed. The wrapper then animates between 0 and that height with
 * `overflow: hidden`. This avoids measuring tricks and avoids layout animations,
 * which are unreliable on Fabric.
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { CategoryGroup as Group } from "../../assets/data/categories";
import { alpha, colors, font, motion, radius, shadows, size, space } from "../theme";
import { play } from "../sound";
import AppText from "./AppText";
import SelectPill from "./SelectPill";

type Props = {
  group: Group;
  /** Which leaf keys in this group are currently on. */
  selected: Record<string, boolean>;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleItem: (key: string) => void;
  /** Turn every item in the group on (or off, if all are already on). */
  onToggleAll: (keys: string[], next: boolean) => void;
};

export default function CategoryGroup({
  group,
  selected,
  expanded,
  onToggleExpanded,
  onToggleItem,
  onToggleAll,
}: Props) {
  const [bodyHeight, setBodyHeight] = useState(0);
  const open = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    open.value = withTiming(expanded ? 1 : 0, { duration: motion.normal });
  }, [expanded, open]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: bodyHeight * open.value,
    opacity: open.value,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${open.value * 180}deg` }],
  }));

  const keys = group.items.map((i) => i.key);
  const onCount = keys.filter((k) => selected[k]).length;
  const all = onCount === keys.length;
  const some = onCount > 0 && !all;

  const onBodyLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && Math.abs(h - bodyHeight) > 0.5) setBodyHeight(h);
  };

  return (
    <View
      style={[
        styles.card,
        { borderColor: onCount > 0 ? alpha(group.accent, 0.4) : colors.hairline },
        shadows.panel,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          play("tap");
          onToggleExpanded();
        }}
        style={styles.header}
      >
        <View style={[styles.iconBadge, { backgroundColor: alpha(group.accent, 0.18), borderColor: alpha(group.accent, 0.45) }]}>
          <Ionicons name={group.icon} size={19} color={group.accent} />
        </View>

        <View style={styles.titleWrap}>
          <AppText style={styles.title}>{group.nameAr}</AppText>
          <AppText style={[styles.count, onCount > 0 && { color: group.accent }]}>
            {onCount} من {keys.length}
          </AppText>
        </View>

        {/* Select-all — its own target, stopping the row's expand/collapse. */}
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: all }}
          hitSlop={8}
          onPress={() => {
            play(all ? "back" : "select");
            onToggleAll(keys, !all);
          }}
          style={[
            styles.allCheck,
            {
              backgroundColor: all ? group.accent : some ? alpha(group.accent, 0.25) : "transparent",
              borderColor: onCount > 0 ? group.accent : colors.hairlineStrong,
            },
          ]}
        >
          {all ? (
            <Ionicons name="checkmark" size={15} color="#07121A" />
          ) : some ? (
            <View style={[styles.dash, { backgroundColor: group.accent }]} />
          ) : null}
        </Pressable>

        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={18} color={colors.textFaint} />
        </Animated.View>
      </Pressable>

      <Animated.View style={[styles.bodyClip, bodyStyle]}>
        <View style={styles.body} onLayout={onBodyLayout}>
          {group.items.map((item) => (
            <SelectPill
              key={item.key}
              label={item.nameAr}
              accent={group.accent}
              selected={!!selected[item.key]}
              onToggle={() => onToggleItem(item.key)}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },
  title: {
    fontFamily: font.bold,
    fontSize: size.h3,
    color: colors.text,
    textAlign: "right",
  },
  count: {
    fontFamily: font.regular,
    fontSize: size.tiny,
    color: colors.textFaint,
    textAlign: "right",
  },
  allCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dash: {
    width: 11,
    height: 2.5,
    borderRadius: 2,
  },
  bodyClip: {
    overflow: "hidden",
  },
  body: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingBottom: space.md,
  },
});
