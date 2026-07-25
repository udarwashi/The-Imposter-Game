/**
 * Shared modal shell.
 *
 * Also fixes a real bug in the old styles: `modalBackdrop` was
 * `backgroundColor: "rgba(0,0,0)"` — a malformed 3-argument rgba, which React
 * Native resolves to fully opaque black. Every dialog therefore blanked the
 * screen behind it instead of dimming it. Here the backdrop is a genuine dim,
 * so you keep your place in the game while a dialog is up.
 */

import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { colors, font, radius, shadows, size, space } from "../theme";
import AppText from "./AppText";

type Props = {
  visible: boolean;
  onRequestClose: () => void;
  title: string;
  /** Optional body copy above `children`. */
  body?: string;
  /** Tap outside to dismiss. Off for destructive confirmations. */
  dismissOnBackdrop?: boolean;
  accent?: string;
  onShow?: () => void;
  children?: React.ReactNode;
};

export default function GameModal({
  visible,
  onRequestClose,
  title,
  body,
  dismissOnBackdrop = true,
  accent = colors.green,
  onShow,
  children,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onRequestClose}
      onShow={onShow}
    >
      <Animated.View entering={FadeIn.duration(160)} style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissOnBackdrop ? onRequestClose : undefined}
        />
        <Animated.View
          entering={FadeInDown.duration(220).springify().damping(18)}
          style={[styles.card, shadows.card]}
        >
          <View style={[styles.accentBar, { backgroundColor: accent }]} />
          <AppText style={styles.title}>{title}</AppText>
          {body ? <AppText style={styles.body}>{body}</AppText> : null}
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(3,6,12,0.78)",
    alignItems: "center",
    justifyContent: "center",
    padding: space.xl,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    borderRadius: radius.xl,
    padding: space.xl,
    paddingTop: space.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    gap: space.md,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  title: {
    fontFamily: font.bold,
    color: colors.text,
    fontSize: size.h2,
    textAlign: "right",
  },
  body: {
    fontFamily: font.regular,
    color: colors.textMuted,
    fontSize: size.body,
    lineHeight: 22,
    textAlign: "right",
  },
});
