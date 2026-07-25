/**
 * The المندس mark.
 *
 * Concept: three figures standing together — the outer two in muted blue-grey,
 * the middle one red and marked with a question mark. It states the game in one
 * glance (one of us is not who they say they are) and stays readable down to
 * icon size, which is why it is pure geometry with no fine detail.
 *
 * Written as inline SVG rather than an imported .svg: importing SVG files needs
 * a metro.config.js + react-native-svg-transformer, and this project has none.
 * `scripts/gen-icons.js` re-draws this same geometry to PNG for the app icon.
 */

import React, { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { colors } from "../theme";

type Props = {
  /** Rendered width/height in px. The art is square. */
  size?: number;
  /** Slow breathing scale, for the home screen. */
  pulse?: boolean;
};

/** One head-and-shoulders silhouette. */
function Figure({
  cx,
  headY,
  headR,
  halfWidth,
  shoulderY,
  bottomY,
  fill,
  stroke,
}: {
  cx: number;
  headY: number;
  headR: number;
  halfWidth: number;
  shoulderY: number;
  bottomY: number;
  fill: string;
  stroke: string;
}) {
  // A smooth dome from the left hip, over the shoulders, to the right hip.
  const rise = (shoulderY - headY) * 0.42;
  const body =
    `M ${cx - halfWidth},${bottomY} ` +
    `C ${cx - halfWidth},${shoulderY - rise} ${cx - halfWidth * 0.5},${shoulderY - rise * 1.6} ${cx},${shoulderY - rise * 1.6} ` +
    `C ${cx + halfWidth * 0.5},${shoulderY - rise * 1.6} ${cx + halfWidth},${shoulderY - rise} ${cx + halfWidth},${bottomY} ` +
    `Z`;

  return (
    <G>
      <Path d={body} fill={fill} stroke={stroke} strokeWidth={1.6} />
      <Circle cx={cx} cy={headY} r={headR} fill={fill} stroke={stroke} strokeWidth={1.6} />
    </G>
  );
}

export default function Logo({ size = 160, pulse = false }: Props) {
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (!pulse) return;
    breathe.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [pulse, breathe]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * 0.035 }],
  }));

  // Question mark drawn as a stroked hook plus a dot, so no font is involved.
  const qx = 60;
  const qTop = 40;
  const hook =
    `M ${qx - 3.9},${qTop - 0.8} ` +
    `A 3.9 3.9 0 1 1 ${qx + 3.6},${qTop + 1.4} ` +
    `C ${qx + 3.4},${qTop + 4.2} ${qx},${qTop + 4.4} ${qx},${qTop + 7.0}`;

  return (
    <Animated.View style={animStyle}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <LinearGradient id="badge" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1C2740" />
            <Stop offset="1" stopColor="#0B1220" />
          </LinearGradient>
          <LinearGradient id="side" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#46587C" />
            <Stop offset="1" stopColor="#2C3A55" />
          </LinearGradient>
          <LinearGradient id="mid" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FF6A6A" />
            <Stop offset="1" stopColor={colors.red} />
          </LinearGradient>
          <RadialGradient id="midGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.red} stopOpacity={0.55} />
            <Stop offset="1" stopColor={colors.red} stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.greenLight} stopOpacity={0.9} />
            <Stop offset="0.5" stopColor={colors.green} stopOpacity={0.35} />
            <Stop offset="1" stopColor={colors.red} stopOpacity={0.7} />
          </LinearGradient>
        </Defs>

        {/* Badge */}
        <Rect x="5" y="5" width="110" height="110" rx="32" fill="url(#badge)" />
        <Rect
          x="5"
          y="5"
          width="110"
          height="110"
          rx="32"
          fill="none"
          stroke="url(#ring)"
          strokeWidth="2.5"
        />

        {/* Glow behind the imposter */}
        <Ellipse cx="60" cy="62" rx="34" ry="30" fill="url(#midGlow)" />

        {/* Outer two figures sit slightly back and lower. */}
        <Figure cx={27} headY={55} headR={8.5} halfWidth={14} shoulderY={78} bottomY={92} fill="url(#side)" stroke="#0B1220" />
        <Figure cx={93} headY={55} headR={8.5} halfWidth={14} shoulderY={78} bottomY={92} fill="url(#side)" stroke="#0B1220" />

        {/* The imposter, front and centre. */}
        <Figure cx={60} headY={42} headR={12.5} halfWidth={19} shoulderY={72} bottomY={95} fill="url(#mid)" stroke="#2A0509" />

        {/* Question mark on the imposter's head. */}
        <Path
          d={hook}
          fill="none"
          stroke="#2A0509"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <Circle cx={qx} cy={qTop + 10.4} r="1.5" fill="#2A0509" />
      </Svg>
    </Animated.View>
  );
}
