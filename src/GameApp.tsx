
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { CATEGORY_AR, CATEGORY_KEYS } from "../assets/data/categories";
import AppText from "./components/AppText";
import GameButton from "./components/GameButton";
import GameModal from "./components/GameModal";
import ScreenBackground from "./components/ScreenBackground";
import CategoriesScreen from "./screens/CategoriesScreen";
import DiscussionScreen from "./screens/DiscussionScreen";
import HomeScreen from "./screens/HomeScreen";
import PlayersScreen from "./screens/PlayersScreen";
import RevealScreen from "./screens/RevealScreen";
import { colors, font, radius, size, space } from "./theme";
import { play } from "./sound";

const STORAGE_KEY = "imposter_game_state_v1";

type Player = { id: string; name: string };
type CategoryKey = string;

type PersistedState = {
  selectedCategories: Record<CategoryKey, boolean>;
  players: Player[];
};

const WORDS = require("../assets/data/words.json");

type ModalMode = "info" | "confirm";

type Phase = "home" | "categories" | "players" | "reveal" | "discussion";

type RoundState = {
  categoryKey: CategoryKey;
  categoryNameAr: string;
  secretWord: any;
  imposterIndex: number;
  revealed: boolean[];
  currentRevealIndex: number;
  step: "name" | "secret";
};

function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}
function sample<T>(arr: T[]) {
  return arr[randInt(arr.length)];
}

/** Every category on by default. */
const DEFAULT_SELECTED: Record<CategoryKey, boolean> = Object.fromEntries(
  CATEGORY_KEYS.map((k) => [k, true])
);

const HOW_TO_PLAY =
  "كل اللاعبين يشوفوا نفس الكلمة… إلا واحد، هو المندس.\n\n" +
  "١. اختاروا الفئات وأضيفوا اللاعبين.\n" +
  "٢. مرروا الجوال، وكل واحد يشوف دوره لوحده.\n" +
  "٣. بالتناوب، كل واحد يوصف الكلمة بكلمة أو كلمتين — بدون ما يقولها.\n" +
  "٤. المندس ما يعرف الكلمة، فلازم يتمثّل ويخمّن.\n" +
  "٥. تناقشوا وصوّتوا: من المندس؟";

export default function GameApp() {
  const [selectedCategories, setSelectedCategories] =
    useState<Record<CategoryKey, boolean>>(DEFAULT_SELECTED);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [showImposter, setShowImposter] = useState(false);
  const [round, setRound] = useState<RoundState | null>(null);
  const [phase, setPhase] = useState<Phase>("home");
  const [uiModalOpen, setUiModalOpen] = useState(false);
  const [uiModalMode, setUiModalMode] = useState<ModalMode>("info");
  const [uiModalTitle, setUiModalTitle] = useState("");
  const [danger, setDanger] = useState(false);
  const [uiModalBody, setUiModalBody] = useState("");
  const [uiModalConfirmText, setUiModalConfirmText] = useState("نعم");
  const [uiModalCancelText, setUiModalCancelText] = useState("إلغاء");
  const uiModalOnConfirmRef = useRef<null | (() => void)>(null);
  const [playerEditModalOpen, setPlayerEditModalOpen] = useState(false);
  const [editPlayerName, setEditPlayerName] = useState("");
  const [editPlayerId, setEditPlayerId] = useState<string | null>(null);

  const editInputRef = useRef<TextInput>(null);
  const currentPlayerName =
    round && players?.[round.currentRevealIndex]
      ? players[round.currentRevealIndex].name
      : "";

  const activeCategoryKeys = useMemo(() => {
    return CATEGORY_KEYS.filter((k) => selectedCategories[k]);
  }, [selectedCategories]);

  const focusEditInput = () => {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        editInputRef.current?.focus();
      }, 120);
    });
  };

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: PersistedState = JSON.parse(raw);

          // Merge OVER the defaults rather than replacing them. A save written
          // before the category tree grew only contains the old keys, and a
          // plain replace would leave every new category `undefined` — i.e.
          // silently switched off for existing players.
          if (parsed?.selectedCategories) {
            setSelectedCategories({ ...DEFAULT_SELECTED, ...parsed.selectedCategories });
          }
          if (Array.isArray(parsed?.players)) setPlayers(parsed.players);
        }
      } catch {
        // ignore corrupted storage; start fresh
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const payload: PersistedState = {
      selectedCategories,
      players,
    };

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [selectedCategories, players, hydrated]);

  const openPlayerEditMenu = React.useCallback((player: Player) => {
    setEditPlayerId(player.id);
    setEditPlayerName(player.name);
    setPlayerEditModalOpen(true);
  }, []);

  const closePlayerEditModal = () => {
    setPlayerEditModalOpen(false);
    setEditPlayerName("");
    setEditPlayerId(null);
  };

  const handleSavePlayerName = () => {
    if (!editPlayerId || !editPlayerName.trim()) return;

    setPlayers((prev) =>
      prev.map((p) => (p.id === editPlayerId ? { ...p, name: editPlayerName.trim() } : p))
    );

    closePlayerEditModal();
  };

  const handleDeletePlayer = () => {
    if (!editPlayerId) return;

    setPlayers((prev) => prev.filter((p) => p.id !== editPlayerId));
    closePlayerEditModal();
  };

  function toggleCategory(key: CategoryKey) {
    setSelectedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  /** Batched so toggling a whole group is one render, not one per category. */
  function toggleManyCategories(keys: CategoryKey[], next: boolean) {
    setSelectedCategories((prev) => {
      const out = { ...prev };
      for (const k of keys) out[k] = next;
      return out;
    });
  }

  function addPlayer() {
    const name = newPlayerName.trim();
    if (!name) return;

    setPlayers((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, name }]);

    setNewPlayerName("");
    Keyboard.dismiss();
  }

  function requestResetToSetup() {
    showConfirm({
      title: "تأكيد",
      body: "هل تريد فعلاً إنهاء الجولة والرجوع للإعداد؟ سيتم فقدان الجولة الحالية.",
      confirmText: "نعم، إنهاء",
      cancelText: "إلغاء",
      danger: true,
      onConfirm: () => {
        resetToSetup();
      },
    });
  }

  function requestToViewImposter() {
    showConfirm({
      title: "تأكيد",
      body: "هل تريد فعلاً عرض المندس؟",
      confirmText: "نعم، عرض",
      cancelText: "إلغاء",
      danger: false,
      onConfirm: () => {
        setShowImposter(true);
      },
    });
  }

  function closeUiModal() {
    setUiModalOpen(false);
    setUiModalTitle("");
    setUiModalBody("");
    uiModalOnConfirmRef.current = null;
    setUiModalMode("info");
  }

  function showInfo(title: string, body: string) {
    setUiModalMode("info");
    setUiModalTitle(title);
    setUiModalBody(body);
    setDanger(false);
    setUiModalOpen(true);
  }

  function showConfirm(opts: {
    title: string;
    body: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => void;
  }) {
    setUiModalMode("confirm");
    setUiModalTitle(opts.title);
    setUiModalBody(opts.body);
    setDanger(!!opts.danger);
    setUiModalConfirmText(opts.confirmText ?? "نعم");
    setUiModalCancelText(opts.cancelText ?? "إلغاء");
    uiModalOnConfirmRef.current = opts.onConfirm;
    setUiModalOpen(true);
  }

  function validateBeforeStart(): boolean {
    if (players.length < 3) {
      showInfo("سلامات صاحبي", "لازم 3 لاعبين على الأقل.");
      return false;
    }
    if (activeCategoryKeys.length === 0) {
      showInfo("سلامات صاحبي", "اختر فئة واحدة على الأقل.");
      return false;
    }
    for (const k of activeCategoryKeys) {
      const list = WORDS[k];
      if (!list || list.length < 4) {
        showInfo("خطأ", `قائمة كلمات فئة ${CATEGORY_AR[k]} صغيرة جدًا.`);
        return false;
      }
    }
    return true;
  }

  function startNewRound() {
    setShowImposter(false);

    if (!validateBeforeStart()) return;

    const categoryKey = sample(activeCategoryKeys);
    const wordList = WORDS[categoryKey];
    const secretWord = sample(wordList);

    const imposterIndex = randInt(players.length);

    const newRound: RoundState = {
      categoryKey,
      categoryNameAr: CATEGORY_AR[categoryKey],
      secretWord,
      imposterIndex,
      revealed: Array(players.length).fill(false),
      currentRevealIndex: 0,
      step: "name",
    };
    setRound(newRound);
    setPhase("reveal");
  }

  function resetToSetup() {
    setShowImposter(false);
    setRound(null);
    setPhase("players");
  }

  function showSecretForCurrent() {
    if (!round) return;
    setRound({ ...round, step: "secret" });
  }

  function nextPlayer() {
    if (!round) return;

    const i = round.currentRevealIndex;

    const updated: RoundState = {
      ...round,
      revealed: round.revealed.map((v, idx) => (idx === i ? true : v)),
      step: "name",
    };

    let next = i + 1;
    while (next < players.length && updated.revealed[next]) next++;

    if (next >= players.length) {
      setRound(updated);
      setPhase("discussion");
      return;
    }

    updated.currentRevealIndex = next;

    setRound(updated);
  }

  if (!hydrated) {
    return (
      <ScreenBackground>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.green} />
          <AppText style={styles.loadingText}>جاري التحميل…</AppText>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <View style={styles.root}>
      {phase === "home" && (
        <HomeScreen
          onStart={() => setPhase("categories")}
          onHowToPlay={() => showInfo("كيف نلعب؟", HOW_TO_PLAY)}
          savedPlayers={players.length}
          savedCategories={activeCategoryKeys.length}
        />
      )}

      {phase === "categories" && (
        <CategoriesScreen
          selected={selectedCategories}
          onToggleItem={toggleCategory}
          onToggleMany={toggleManyCategories}
          onBack={() => setPhase("home")}
          onNext={() => setPhase("players")}
        />
      )}

      {phase === "players" && (
        <PlayersScreen
          players={players}
          newPlayerName={newPlayerName}
          onChangeNewPlayerName={setNewPlayerName}
          onAddPlayer={addPlayer}
          onReorder={setPlayers}
          onEditPlayer={openPlayerEditMenu}
          categoriesCount={activeCategoryKeys.length}
          onBack={() => setPhase("categories")}
          onStart={startNewRound}
        />
      )}

      {phase === "reveal" && round && (
        <RevealScreen
          playerName={currentPlayerName}
          playerIndex={round.currentRevealIndex}
          playerCount={players.length}
          revealed={round.revealed}
          step={round.step}
          isImposter={round.currentRevealIndex === round.imposterIndex}
          categoryNameAr={round.categoryNameAr}
          secretWord={String(round.secretWord)}
          onShowSecret={showSecretForCurrent}
          onNext={nextPlayer}
          onEndRound={requestResetToSetup}
        />
      )}

      {phase === "discussion" && round && (
        <DiscussionScreen
          playerNames={players.map((p) => p.name)}
          imposterName={players?.[round.imposterIndex]?.name ?? ""}
          categoryNameAr={round.categoryNameAr}
          secretWord={String(round.secretWord)}
          showImposter={showImposter}
          onRevealImposter={requestToViewImposter}
          onNewRound={startNewRound}
          onBackToSetup={resetToSetup}
        />
      )}

      <GameModal
        visible={uiModalOpen}
        onRequestClose={closeUiModal}
        title={uiModalTitle}
        body={uiModalBody}
        accent={danger ? colors.red : colors.green}
        dismissOnBackdrop={uiModalMode === "info"}
      >
        {uiModalMode === "info" ? (
          <GameButton title="تمام" variant="secondary" onPress={closeUiModal} />
        ) : (
          <View style={styles.modalRow}>
            <GameButton
              title={uiModalCancelText}
              variant="secondary"
              size="md"
              onPress={closeUiModal}
              style={styles.modalBtn}
            />
            <GameButton
              title={uiModalConfirmText}
              variant={danger ? "danger" : "primary"}
              size="md"
              style={styles.modalBtn}
              onPress={() => {
                const fn = uiModalOnConfirmRef.current;
                closeUiModal();
                fn?.();
              }}
            />
          </View>
        )}
      </GameModal>

      <GameModal
        visible={playerEditModalOpen}
        onRequestClose={closePlayerEditModal}
        onShow={focusEditInput}
        title="تعديل اللاعب"
        accent={colors.blue}
      >
        <TextInput
          ref={editInputRef}
          value={editPlayerName}
          onChangeText={setEditPlayerName}
          placeholder="اسم اللاعب"
          placeholderTextColor={colors.textFaint}
          style={styles.editInput}
          textAlign="right"
          autoFocus={false}
          onSubmitEditing={handleSavePlayerName}
          submitBehavior="submit"
        />
        <View style={styles.modalRow}>
          <GameButton
            title="حذف"
            variant="danger"
            size="md"
            style={styles.modalBtn}
            onPress={() => {
              play("back");
              handleDeletePlayer();
            }}
          />
          <GameButton
            title="حفظ"
            size="md"
            style={styles.modalBtn}
            onPress={handleSavePlayerName}
          />
        </View>
        <Pressable onPress={closePlayerEditModal} style={styles.cancelRow}>
          <AppText style={styles.cancelText}>إلغاء</AppText>
        </Pressable>
      </GameModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.md,
  },
  loadingText: {
    fontFamily: font.semi,
    fontSize: size.body,
    color: colors.textMuted,
  },
  modalRow: {
    flexDirection: "row-reverse",
    gap: space.md,
    marginTop: space.sm,
  },
  modalBtn: {
    flex: 1,
  },
  editInput: {
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
  cancelRow: {
    alignItems: "center",
    paddingTop: space.xs,
  },
  cancelText: {
    fontFamily: font.semi,
    fontSize: size.small,
    color: colors.textFaint,
  },
});
