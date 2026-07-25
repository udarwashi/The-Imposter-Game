/**
 * Design tokens for المندس.
 *
 * The old UI read as a web form because it had no shadows, no font weights, one
 * flat surface colour and no motion. Everything here exists to fix that: a
 * layered palette so surfaces can sit *above* the background, real elevation,
 * four font weights, and a shared motion vocabulary.
 *
 * Import this rather than hard-coding colours. `app/Styles.tsx` is built on it.
 */

import { Platform } from "react-native";

/** Adds an alpha channel to a #rrggbb hex colour. */
export function alpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const colors = {
  /** Page background, darkest layer. */
  bg: "#070B14",
  /** Raised panel. */
  surface: "#111A2C",
  /** Raised panel, one step brighter (rows on top of panels). */
  surfaceHi: "#18233A",
  /** Pressed / recessed. */
  surfaceLo: "#0A1120",

  text: "#EAF2FF",
  textMuted: "rgba(234,242,255,0.62)",
  textFaint: "rgba(234,242,255,0.34)",

  hairline: "rgba(234,242,255,0.10)",
  hairlineStrong: "rgba(234,242,255,0.18)",

  /** Primary accent — actions, selection, the safe word. */
  green: "#3FAF6C",
  greenLight: "#6BE39A",
  greenDark: "#1B3A2A",
  greenDeep: "#102019",

  /** Danger accent — the imposter, destructive actions. */
  red: "#FF3B3B",
  redLight: "#FF7A8F",
  redDark: "#4A0D16",
  redDeep: "#25070C",

  /** Highlight — counts, badges, the logo's spark. */
  gold: "#FFC24B",
  /** Cool accent, used to keep category groups from all looking alike. */
  blue: "#5B8CFF",
  violet: "#A87BFF",

  disabled: "#28303F",
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  huge: 40,
} as const;

/**
 * Four real weights, instanced from the Alexandria variable font. Faking weight
 * with `fontWeight` on a single static TTF gives ugly synthetic bolding on
 * Android, which is why these exist as separate families.
 */
export const font = {
  regular: "stc",
  semi: "stcSemi",
  bold: "stcBold",
  black: "stcBlack",
} as const;

export const size = {
  display: 44,
  h1: 30,
  h2: 22,
  h3: 18,
  body: 15,
  small: 13,
  tiny: 11,
} as const;

/** Android needs elevation; iOS needs shadow*. Both are set on every preset. */
function shadow(color: string, opacity: number, radiusPx: number, offsetY: number, elevation: number) {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radiusPx,
      shadowOffset: { width: 0, height: offsetY },
    },
    android: { shadowColor: color, elevation },
    default: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radiusPx,
      shadowOffset: { width: 0, height: offsetY },
    },
  })!;
}

export const shadows = {
  card: shadow("#000000", 0.45, 14, 6, 6),
  panel: shadow("#000000", 0.35, 10, 4, 4),
  button: shadow("#000000", 0.5, 10, 5, 8),
  glowGreen: shadow(colors.green, 0.55, 18, 0, 10),
  glowRed: shadow(colors.red, 0.55, 18, 0, 10),
  glowGold: shadow(colors.gold, 0.5, 16, 0, 8),
} as const;

export const motion = {
  /** Button press down / release. */
  press: 90,
  /** Chevrons, checkmarks, small state flips. */
  quick: 160,
  /** Panel expand/collapse, screen entrance. */
  normal: 260,
  /** Big reveals. */
  slow: 420,
  /** Per-item delay for staggered entrances. */
  stagger: 45,
} as const;

/** Gradient stop pairs, so buttons and pills stay consistent. */
export const gradients = {
  green: [colors.greenLight, colors.green] as const,
  greenDeep: [colors.green, colors.greenDark] as const,
  red: [colors.red, colors.redDark] as const,
  gold: ["#FFD87A", colors.gold] as const,
  surface: [colors.surfaceHi, colors.surface] as const,
  surfaceDim: [colors.surface, colors.surfaceLo] as const,
} as const;

const theme = { colors, radius, space, font, size, shadows, motion, gradients, alpha };
export default theme;
