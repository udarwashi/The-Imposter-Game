/**
 * Direction-aware style fragments.
 *
 * The app deliberately does NOT touch `I18nManager.forceRTL`: that flips Yoga's
 * base direction natively and only takes effect after a full app restart, which
 * would make the language toggle feel broken. Instead the base direction stays
 * LTR and every direction-sensitive style is chosen explicitly from the current
 * language, so switching is instant.
 *
 * "start" and "end" below mean start/end of the READING order, not physical
 * left/right — `dir.textStart` is right-aligned in Arabic and left-aligned in
 * English.
 *
 * Both variants are built once at module load, so a re-render hands React the
 * same style objects and nothing downstream re-diffs.
 */

import type { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function build(rtl: boolean) {
  return StyleSheet.create({
    /** A row laid out in reading order. */
    row: { flexDirection: rtl ? "row-reverse" : "row" },
    /** Text aligned to the start of the line. */
    textStart: { textAlign: rtl ? "right" : "left" },
    /** Cross-axis: pin children to the start of the reading order. */
    alignStart: { alignItems: rtl ? "flex-end" : "flex-start" },
    /** Cross-axis: pin children to the end of the reading order. */
    alignEnd: { alignItems: rtl ? "flex-start" : "flex-end" },
  });
}

export type DirectionStyles = ReturnType<typeof build>;

const RTL_STYLES = build(true);
const LTR_STYLES = build(false);

/** Icons whose meaning flips with reading direction. */
const RTL_ICONS = { back: "chevron-forward", forward: "arrow-back" } as const;
const LTR_ICONS = { back: "chevron-back", forward: "arrow-forward" } as const;

export type DirectionIcons = { back: IoniconName; forward: IoniconName };

export type Direction = {
  isRTL: boolean;
  /** `"right"` in Arabic, `"left"` in English — for TextInput's `textAlign`. */
  textAlign: "right" | "left";
  icons: DirectionIcons;
} & DirectionStyles;

const RTL: Direction = {
  isRTL: true,
  textAlign: "right",
  icons: RTL_ICONS,
  ...RTL_STYLES,
};

const LTR: Direction = {
  isRTL: false,
  textAlign: "left",
  icons: LTR_ICONS,
  ...LTR_STYLES,
};

export function directionFor(isRTL: boolean): Direction {
  return isRTL ? RTL : LTR;
}
