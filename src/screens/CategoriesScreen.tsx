/**
 * Step 1 — pick categories.
 *
 * ~80 categories is far too many for a flat chip wall, so they are grouped into
 * collapsible panels. A group can be taken wholesale from its header check, or
 * opened to cherry-pick individual categories.
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CATEGORY_GROUPS } from "../../assets/data/categories";
import AppText from "../components/AppText";
import CategoryGroup from "../components/CategoryGroup";
import GameButton from "../components/GameButton";
import ScreenBackground from "../components/ScreenBackground";
import ScreenHeader from "../components/ScreenHeader";
import { alpha, colors, font, motion, radius, shadows, size, space } from "../theme";
import { play } from "../sound";

type Props = {
  selected: Record<string, boolean>;
  onToggleItem: (key: string) => void;
  onToggleMany: (keys: string[], next: boolean) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function CategoriesScreen({
  selected,
  onToggleItem,
  onToggleMany,
  onBack,
  onNext,
}: Props) {
  const insets = useSafeAreaInsets();
  const [openGroup, setOpenGroup] = useState<string | null>(CATEGORY_GROUPS[0].key);

  const totalOn = useMemo(
    () => CATEGORY_GROUPS.reduce((n, g) => n + g.items.filter((i) => selected[i.key]).length, 0),
    [selected]
  );
  const totalAll = useMemo(
    () => CATEGORY_GROUPS.reduce((n, g) => n + g.items.length, 0),
    []
  );

  const allKeys = useMemo(
    () => CATEGORY_GROUPS.flatMap((g) => g.items.map((i) => i.key)),
    []
  );

  return (
    <ScreenBackground tint="neutral">
      <ScreenHeader
        title="اختر الفئات"
        subtitle="كل فئة تفتحها تزيد تنوّع الكلمات"
        step="١ / ٢"
        onBack={onBack}
      />

      <View style={styles.summaryRow}>
        <View style={[styles.countPill, totalOn > 0 && { borderColor: alpha(colors.green, 0.5) }]}>
          <Ionicons
            name="albums"
            size={14}
            color={totalOn > 0 ? colors.green : colors.textFaint}
          />
          <AppText style={[styles.countText, totalOn > 0 && { color: colors.green }]}>
            {totalOn} / {totalAll}
          </AppText>
        </View>

        <View style={styles.bulkRow}>
          <Pressable
            hitSlop={8}
            onPress={() => {
              play("select");
              onToggleMany(allKeys, true);
            }}
          >
            <AppText style={styles.bulkText}>تحديد الكل</AppText>
          </Pressable>
          <AppText style={styles.bulkSep}>·</AppText>
          <Pressable
            hitSlop={8}
            onPress={() => {
              play("back");
              onToggleMany(allKeys, false);
            }}
          >
            <AppText style={styles.bulkText}>مسح الكل</AppText>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 130 }]}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORY_GROUPS.map((group, i) => (
          <Animated.View
            key={group.key}
            entering={FadeInDown.delay(Math.min(i, 8) * motion.stagger).duration(motion.normal)}
          >
            <CategoryGroup
              group={group}
              selected={selected}
              expanded={openGroup === group.key}
              onToggleExpanded={() =>
                setOpenGroup((prev) => (prev === group.key ? null : group.key))
              }
              onToggleItem={onToggleItem}
              onToggleAll={onToggleMany}
            />
          </Animated.View>
        ))}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + space.lg }]}>
        <GameButton
          title={totalOn === 0 ? "اختر فئة واحدة على الأقل" : "التالي · اللاعبون"}
          icon={totalOn === 0 ? undefined : "arrow-back"}
          disabled={totalOn === 0}
          onPress={onNext}
        />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  countPill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceLo,
    borderWidth: 1.5,
    borderColor: colors.hairline,
  },
  countText: {
    fontFamily: font.bold,
    fontSize: size.small,
    color: colors.textFaint,
  },
  bulkRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: space.sm,
  },
  bulkText: {
    fontFamily: font.semi,
    fontSize: size.small,
    color: colors.textMuted,
  },
  bulkSep: {
    color: colors.textFaint,
    fontFamily: font.regular,
  },
  list: {
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    backgroundColor: "rgba(7,11,20,0.94)",
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    ...shadows.card,
  },
});
