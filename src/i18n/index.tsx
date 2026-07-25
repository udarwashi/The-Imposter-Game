/**
 * Language state for the whole app.
 *
 * One context holds the chosen language, the resolved string table and the
 * direction fragments, so a component asks for all three in a single hook and
 * every one of them changes together on a toggle.
 *
 * The choice is persisted, and `ready` stays false until that read finishes —
 * `app/_layout.tsx` holds the splash screen up until then, so the game is never
 * painted in the wrong language for a frame.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Direction, directionFor } from "./direction";
import { Lang, LANG_RTL, STRINGS, Strings } from "./strings";

const LANG_KEY = "imposter_lang_v1";

/** Arabic is the game's mother tongue, so it wins when nothing is stored. */
const DEFAULT_LANG: Lang = "ar";

type I18nValue = {
  lang: Lang;
  /** Copy for the current language. */
  t: Strings;
  /** Direction-aware style fragments and icon names. */
  dir: Direction;
  setLang: (next: Lang) => void;
  toggleLang: () => void;
  /** False until the stored preference has been read. */
  ready: boolean;
};

const I18nContext = createContext<I18nValue | null>(null);

function isLang(value: unknown): value is Lang {
  return value === "ar" || value === "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(LANG_KEY);
        if (!cancelled && isLang(raw)) setLangState(raw);
      } catch {
        // A missing or unreadable preference just means the default.
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    AsyncStorage.setItem(LANG_KEY, next).catch(() => {});
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next: Lang = prev === "ar" ? "en" : "ar";
      AsyncStorage.setItem(LANG_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      t: STRINGS[lang],
      dir: directionFor(LANG_RTL[lang]),
      setLang,
      toggleLang,
      ready,
    }),
    [lang, ready, setLang, toggleLang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>");
  return ctx;
}

export type { Direction } from "./direction";
export type { Lang, Strings } from "./strings";
export { LANG_LABEL, LANG_RTL, LANGS } from "./strings";
