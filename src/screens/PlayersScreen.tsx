/**
 * Step 2 — the squad.
 *
 * Keeps the existing ReorderableList (drag order = reveal order). That list
 * requires every row to be the same height, so rows use a fixed avatar size and
 * a single-line name.
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "../components/AppText";
import GameButton from "../components/GameButton";
import ReorderableList, { ReorderableRowInfo } from "../components/ReorderableList";
import ScreenBackground from "../components/ScreenBackground";
import ScreenHeader from "../components/ScreenHeader";
import { useI18n } from "../i18n";
import { alpha, colors, font, radius, shadows, size, space } from "../theme";
import { play } from "../sound";

export type Player = { id: string; name: string };

const MIN_PLAYERS = 3;

/** Avatar palette, picked by index so colours stay stable per position. */
const AVATAR_COLORS = [
  colors.green,
  colors.blue,
  colors.gold,
  colors.violet,
  "#37C6D0",
  "#FF9F45",
  "#FF6B8A",
  "#8FD14F",
];

type Props = {
  players: Player[];
  newPlayerName: string;
  onChangeNewPlayerName: (v: string) => void;
  onAddPlayer: () => void;
  onReorder: (next: Player[]) => void;
  onEditPlayer: (p: Player) => void;
  categoriesCount: number;
  onBack: () => void;
  onStart: () => void;
};

/** Module scope: ReorderableList memoizes on keyExtractor identity. */
const playerKey = (p: Player) => p.id;

export default function PlayersScreen({
  players,
  newPlayerName,
  onChangeNewPlayerName,
  onAddPlayer,
  onReorder,
  onEditPlayer,
  categoriesCount,
  onBack,
  onStart,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t, dir } = useI18n();
  const [barHeight, setBarHeight] = useState(0);

  const enough = players.length >= MIN_PLAYERS;

  const renderRow = useCallback(
    ({ item, index, isDragging, DragHandle }: ReorderableRowInfo<Player>) => {
      const accent = AVATAR_COLORS[index % AVATAR_COLORS.length];
      return (
        <View
          style={[
            styles.row,
            dir.row,
            isDragging && {
              borderColor: alpha(colors.green, 0.7),
              backgroundColor: colors.surfaceHi,
            },
            isDragging ? shadows.card : shadows.panel,
          ]}
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: alpha(accent, 0.18), borderColor: alpha(accent, 0.6) },
            ]}
          >
            <AppText style={[styles.avatarText, { color: accent }]}>
              {item.name.trim().charAt(0) || t.unknownInitial}
            </AppText>
          </View>

          <View style={[styles.nameWrap, dir.alignStart]}>
            <AppText style={[styles.name, dir.textStart]} numberOfLines={1}>
              {item.name}
            </AppText>
            <AppText style={[styles.order, dir.textStart]}>{t.turnNumber(index + 1)}</AppText>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.a11yEditPlayer(item.name)}
            hitSlop={6}
            onPress={() => {
              play("tap");
              onEditPlayer(item);
            }}
            style={styles.editBtn}
          >
            <Ionicons name="create-outline" size={18} color={colors.textMuted} />
          </Pressable>

          {/* Drag lives on its own handle, not the whole row, so a vertical
              swipe anywhere else still scrolls the list. */}
          <DragHandle style={styles.dragHandle} hitSlop={10}>
            <Ionicons
              name="reorder-two"
              size={22}
              color={isDragging ? colors.greenLight : colors.textFaint}
            />
          </DragHandle>
        </View>
      );
    },
    [onEditPlayer, t, dir]
  );

  const header = (
    <View style={styles.headerBlock}>
      <View style={[styles.addCard, shadows.panel]}>
        <View style={[styles.addRow, dir.row]}>
          <TextInput
            value={newPlayerName}
            onChangeText={onChangeNewPlayerName}
            placeholder={t.playerNamePlaceholder}
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            textAlign={dir.textAlign}
            returnKeyType="done"
            onSubmitEditing={() => {
              if (newPlayerName.trim()) {
                play("select");
                onAddPlayer();
              } else {
                Keyboard.dismiss();
              }
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.a11yAddPlayer}
            disabled={!newPlayerName.trim()}
            onPress={() => {
              play("select");
              onAddPlayer();
            }}
            style={[
              styles.addBtn,
              !newPlayerName.trim() && { backgroundColor: colors.disabled, borderColor: "transparent" },
            ]}
          >
            <Ionicons
              name="add"
              size={26}
              color={newPlayerName.trim() ? "#04140B" : colors.textFaint}
            />
          </Pressable>
        </View>

        <View style={[styles.metaRow, dir.row]}>
          <View style={[styles.metaItem, dir.row]}>
            <Ionicons name="people" size={13} color={enough ? colors.green : colors.gold} />
            <AppText style={[styles.metaText, { color: enough ? colors.green : colors.gold }]}>
              {t.playersCount(players.length)}
            </AppText>
          </View>
          <View style={[styles.metaItem, dir.row]}>
            <Ionicons name="albums" size={13} color={colors.textFaint} />
            <AppText style={styles.metaText}>{t.categoriesCount(categoriesCount)}</AppText>
          </View>
        </View>
      </View>

      {players.length > 0 ? (
        <AppText style={[styles.hint, dir.textStart]}>{t.reorderHint}</AppText>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="person-add-outline" size={30} color={colors.textFaint} />
          <AppText style={styles.emptyText}>{t.addAtLeast(MIN_PLAYERS)}</AppText>
        </View>
      )}
    </View>
  );

  return (
    <ScreenBackground tint="neutral">
      <ScreenHeader
        title={t.playersTitle}
        subtitle={t.playersSubtitle}
        step={t.stepPlayers}
        onBack={onBack}
      />

      <ReorderableList
        data={players}
        keyExtractor={playerKey}
        onReorder={onReorder}
        renderItem={renderRow}
        gap={space.sm}
        header={header}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: barHeight + insets.bottom + space.xxl }}
        autoScrollBottomInset={barHeight}
      />

      <View
        style={[styles.bottomBar, { paddingBottom: insets.bottom + space.lg }]}
        onLayout={(e) => setBarHeight(e.nativeEvent.layout.height)}
      >
        <GameButton
          title={enough ? t.startRound : t.needMorePlayers(MIN_PLAYERS - players.length)}
          icon={enough ? "play" : undefined}
          disabled={!enough}
          onPress={onStart}
        />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    gap: space.md,
  },
  addCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    padding: space.md,
    gap: space.md,
  },
  addRow: {
    alignItems: "center",
    gap: space.md,
  },
  input: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: size.body,
    color: colors.text,
    backgroundColor: colors.surfaceLo,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    minHeight: 50,
  },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  metaRow: {
    gap: space.lg,
  },
  metaItem: {
    alignItems: "center",
    gap: space.xs,
  },
  metaText: {
    fontFamily: font.semi,
    fontSize: size.tiny,
    color: colors.textFaint,
  },
  hint: {
    fontFamily: font.regular,
    fontSize: size.tiny,
    color: colors.textFaint,
  },
  empty: {
    alignItems: "center",
    gap: space.sm,
    paddingVertical: space.xl,
  },
  emptyText: {
    fontFamily: font.regular,
    fontSize: size.small,
    color: colors.textFaint,
    textAlign: "center",
  },

  // Rows must all be the same height for ReorderableList's slot maths.
  row: {
    alignItems: "center",
    gap: space.md,
    marginHorizontal: space.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.hairline,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: font.black,
    fontSize: size.h3,
  },
  nameWrap: {
    flex: 1,
  },
  name: {
    fontFamily: font.bold,
    fontSize: size.body,
    color: colors.text,
  },
  order: {
    fontFamily: font.regular,
    fontSize: size.tiny,
    color: colors.textFaint,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLo,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  dragHandle: {
    width: 32,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
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
