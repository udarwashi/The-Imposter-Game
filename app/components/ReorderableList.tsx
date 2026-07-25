
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LayoutChangeEvent,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureType,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  scrollTo,
  SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useFrameCallback,
  useScrollOffset,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/** How long the dropped row takes to settle into its slot. */
const SETTLE_MS = 190;
/** How long a displaced neighbour takes to slide to its new slot. */
const SHIFT_MS = 170;
/** How long the lift/lower emphasis takes. */
const LIFT_MS = 120;
/** Movement required before a drag takes over from the scroll view. */
const ACTIVATION_DISTANCE = 6;
/** Distance from the viewport edge at which auto-scroll kicks in. */
const AUTOSCROLL_EDGE = 64;
/** Auto-scroll speed, px per second. */
const AUTOSCROLL_SPEED = 520;
/**
 * Slop around the drag handle. This has to go on the gesture, not on the View:
 * a View's hitSlop does not widen gesture-handler's own hit testing.
 */
const DRAG_HIT_SLOP = 10;

const SETTLE_EASING = Easing.out(Easing.cubic);
const SHIFT_EASING = Easing.out(Easing.quad);

export type DragHandleProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
};

/** Stands in for the real handle while measuring. Never receives touches. */
function ProbeHandle({ children, style }: DragHandleProps) {
  return <View style={style}>{children}</View>;
}

export type ReorderableRowInfo<T> = {
  item: T;
  index: number;
  /** True while this row is lifted under the finger. */
  isDragging: boolean;
  /** Wrap whatever should start a drag in this. */
  DragHandle: React.ComponentType<DragHandleProps>;
};

export type ReorderableListProps<T> = {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (info: ReorderableRowInfo<T>) => React.ReactNode;
  /** Called once per drop, at the moment the finger lifts, with the new order. */
  onReorder: (next: T[]) => void;
  /** Vertical space between rows. */
  gap?: number;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
  /**
   * Height of anything overlapping the bottom of the viewport (a sticky bar),
   * so drag-to-edge auto-scroll triggers above it rather than underneath.
   */
  autoScrollBottomInset?: number;
};

function ReorderableListInner<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  gap = 5,
  header,
  footer,
  contentContainerStyle,
  keyboardShouldPersistTaps,
  autoScrollBottomInset = 0,
}: ReorderableListProps<T>) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  // The resting order of keys, owned by the UI thread. This is what every row
  // derives its slot from, so it — not the React array — is what positions
  // things during a drag.
  const order = useSharedValue<string[]>([]);
  const activeKey = useSharedValue<string | null>(null);
  /** Mirror of the lifted row's top, so auto-scroll can see where it is. */
  const activeTop = useSharedValue(0);
  /** Pixels of auto-scroll applied during the current drag. */
  const autoScrollDelta = useSharedValue(0);
  /** Row height + gap. 0 until the first row has been measured. */
  const stride = useSharedValue(0);

  const zoneY = useSharedValue(0);
  const viewportHeight = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  const [rowHeight, setRowHeight] = useState(0);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);

  // Read from stable callbacks so the gesture objects never need rebuilding.
  const dataRef = useRef(data);
  dataRef.current = data;
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;
  const keyExtractorRef = useRef(keyExtractor);
  keyExtractorRef.current = keyExtractor;

  const keys = useMemo(() => data.map(keyExtractor), [data, keyExtractor]);

  useEffect(() => {
    order.value = keys;
  }, [keys, order]);

  const strideJs = rowHeight > 0 ? rowHeight + gap : 0;
  useEffect(() => {
    stride.value = strideJs;
  }, [strideJs, stride]);

  const handleMeasure = useCallback((height: number) => {
    if (height <= 0) return;
    // Rows are uniform; keep the tallest measurement so nothing overlaps.
    setRowHeight((prev) => (Math.abs(prev - height) < 0.5 ? prev : Math.max(prev, height)));
  }, []);

  const autoScrollFrame = useCallback(
    (frame: { timeSincePreviousFrame: number | null }) => {
      "worklet";
      if (activeKey.value === null) return;
      const s = stride.value;
      if (s <= 0) return;

      const dt = frame.timeSincePreviousFrame;
      if (dt === null) return;

      const rowH = s - gap;
      const topOnScreen = zoneY.value + activeTop.value - scrollOffset.value;
      const bottomOnScreen = topOnScreen + rowH;
      const usableBottom = viewportHeight.value - autoScrollBottomInset;

      let delta = 0;
      if (topOnScreen < AUTOSCROLL_EDGE) {
        delta = -AUTOSCROLL_SPEED * (dt / 1000);
      } else if (bottomOnScreen > usableBottom - AUTOSCROLL_EDGE) {
        delta = AUTOSCROLL_SPEED * (dt / 1000);
      }
      if (delta === 0) return;

      const maxScroll = Math.max(0, contentHeight.value - viewportHeight.value);
      const next = Math.min(maxScroll, Math.max(0, scrollOffset.value + delta));
      const applied = next - scrollOffset.value;
      if (applied === 0) return;

      scrollTo(scrollRef, 0, next, false);
      // Moves the lifted row with the content: the row's own reaction picks
      // this up and re-runs the slot maths, so a still finger keeps reordering.
      autoScrollDelta.value += applied;
    },
    [
      gap,
      autoScrollBottomInset,
      activeKey,
      stride,
      zoneY,
      activeTop,
      scrollOffset,
      viewportHeight,
      contentHeight,
      autoScrollDelta,
      scrollRef,
    ]
  );

  const autoScroll = useFrameCallback(autoScrollFrame, false);

  const handlePickUp = useCallback(
    (key: string) => {
      setDraggingKey(key);
      autoScroll.setActive(true);
    },
    [autoScroll]
  );

  // Runs the instant the finger lifts. Committing here rather than after the
  // settle keeps `data` and what is on screen in agreement at all times, and
  // costs nothing visually because layout ignores order.
  const handleDrop = useCallback(
    (ids: string[]) => {
      autoScroll.setActive(false);
      const current = dataRef.current;
      const extract = keyExtractorRef.current;
      if (ids.length !== current.length) return;
      const byKey = new Map(current.map((item) => [extract(item), item]));
      const next: T[] = [];
      for (const id of ids) {
        const item = byKey.get(id);
        if (item === undefined) return; // keys drifted; leave data alone
        next.push(item);
      }
      const unchanged = next.every((item, i) => item === current[i]);
      if (unchanged) return;
      onReorderRef.current(next);
    },
    [autoScroll]
  );

  // Keyed, so a settle finishing for the PREVIOUS row cannot un-elevate the row
  // that is currently under the finger.
  const handleSettled = useCallback((key: string) => {
    setDraggingKey((prev) => (prev === key ? null : prev));
  }, []);

  const onZoneLayout = useCallback(
    (e: LayoutChangeEvent) => {
      zoneY.value = e.nativeEvent.layout.y;
    },
    [zoneY]
  );

  const onScrollLayout = useCallback(
    (e: LayoutChangeEvent) => {
      viewportHeight.value = e.nativeEvent.layout.height;
    },
    [viewportHeight]
  );

  const onContentSizeChange = useCallback(
    (_w: number, h: number) => {
      contentHeight.value = h;
    },
    [contentHeight]
  );

  const scrollGesture = useMemo(
    () => Gesture.Native().shouldCancelWhenOutside(false).disallowInterruption(true),
    []
  );

  const measured = strideJs > 0;
  const zoneHeight = measured ? data.length * strideJs : 0;

  return (
    <GestureDetector gesture={scrollGesture}>
      <Animated.ScrollView
        ref={scrollRef}
        onLayout={onScrollLayout}
        onContentSizeChange={onContentSizeChange}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        scrollEventThrottle={16}
      >
        {header}
        <View onLayout={onZoneLayout} style={{ height: zoneHeight }}>

          {!measured && data.length > 0 && (
            <View
              pointerEvents="none"
              style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: 0 }}
              onLayout={(e) => handleMeasure(e.nativeEvent.layout.height)}
            >
              {renderItem({
                item: data[0],
                index: 0,
                isDragging: false,
                DragHandle: ProbeHandle,
              })}
            </View>
          )}
          {measured &&
            data.map((item, index) => {
            const key = keyExtractor(item);
            return (
              <ReorderableRow
                key={key}
                itemKey={key}
                item={item}
                index={index}
                initialTop={index * strideJs}
                isDragging={draggingKey === key}
                order={order}
                activeKey={activeKey}
                activeTop={activeTop}
                autoScrollDelta={autoScrollDelta}
                stride={stride}
                scrollGesture={scrollGesture}
                renderItem={renderItem}
                onMeasure={handleMeasure}
                onPickUp={handlePickUp}
                onDrop={handleDrop}
                onSettled={handleSettled}
              />
            );
          })}
        </View>
        {footer}
      </Animated.ScrollView>
    </GestureDetector>
  );
}

type ReorderableRowProps<T> = {
  item: T;
  itemKey: string;
  index: number;
  /** Where this row belongs at mount, so its first painted frame is correct. */
  initialTop: number;
  isDragging: boolean;
  order: SharedValue<string[]>;
  activeKey: SharedValue<string | null>;
  activeTop: SharedValue<number>;
  autoScrollDelta: SharedValue<number>;
  stride: SharedValue<number>;
  scrollGesture: GestureType;
  renderItem: (info: ReorderableRowInfo<T>) => React.ReactNode;
  onMeasure: (height: number) => void;
  onPickUp: (key: string) => void;
  onDrop: (ids: string[]) => void;
  onSettled: (key: string) => void;
};

function ReorderableRowInner<T>({
  item,
  itemKey,
  index,
  initialTop,
  isDragging,
  order,
  activeKey,
  activeTop,
  autoScrollDelta,
  stride,
  scrollGesture,
  renderItem,
  onMeasure,
  onPickUp,
  onDrop,
  onSettled,
}: ReorderableRowProps<T>) {

  const top = useSharedValue(initialTop);
  const commanded = useSharedValue(initialTop);
  const translation = useSharedValue(0);
  const startTop = useSharedValue(0);
  const lift = useSharedValue(0);

  const placeActive = useCallback(
    (tY: number) => {
      "worklet";
      const s = stride.value;
      if (s <= 0) return;

      const ids = order.value;
      const count = ids.length;
      if (count === 0) return;

      const limit = (count - 1) * s;
      let y = startTop.value + tY;
      if (y < 0) y = 0;
      if (y > limit) y = limit;
      top.value = y;
      activeTop.value = y;

      let slot = Math.round(y / s);
      if (slot < 0) slot = 0;
      if (slot > count - 1) slot = count - 1;

      const from = ids.indexOf(itemKey);
      if (from === -1 || from === slot) return;
      const next = ids.slice();
      next.splice(from, 1);
      next.splice(slot, 0, itemKey);
      order.value = next;
    },
    [itemKey, order, activeTop, startTop, stride, top]
  );

  useAnimatedReaction(
    () => {
      const s = stride.value;
      if (s <= 0) return -1;
      const slot = order.value.indexOf(itemKey);
      return slot < 0 ? -1 : slot * s;
    },
    (target) => {
      if (target < 0) return;
      if (activeKey.value === itemKey) return;
      if (commanded.value === target) return;
      commanded.value = target;
      top.value = withTiming(target, {
        duration: SHIFT_MS,
        easing: SHIFT_EASING,
      });
    }
  );

  useAnimatedReaction(
    () => (activeKey.value === itemKey ? autoScrollDelta.value : null),
    (delta, previous) => {
      if (delta === null || previous === null || delta === previous) return;
      placeActive(translation.value + delta);
    }
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .maxPointers(1)
        .hitSlop(DRAG_HIT_SLOP)
        .activeOffsetY([-ACTIVATION_DISTANCE, ACTIVATION_DISTANCE])
        .blocksExternalGesture(scrollGesture)
        .onStart(() => {

          if (activeKey.value !== null) return;
          const s = stride.value;
          if (s <= 0) return;
          const slot = order.value.indexOf(itemKey);
          if (slot < 0) return;
          activeKey.value = itemKey;
          startTop.value = slot * s;
          translation.value = 0;
          autoScrollDelta.value = 0;
          lift.value = withTiming(1, { duration: LIFT_MS });
          runOnJS(onPickUp)(itemKey);
        })
        .onUpdate((e) => {
          if (activeKey.value !== itemKey) return;
          translation.value = e.translationY;
          placeActive(e.translationY + autoScrollDelta.value);
        })
        .onFinalize(() => {

          if (activeKey.value !== itemKey) return;
          const ids = order.value;
          const s = stride.value;
          const slot = ids.indexOf(itemKey);
          const target = slot < 0 ? top.value : slot * s;

          activeKey.value = null;
          commanded.value = target;
          top.value = withTiming(
            target,
            { duration: SETTLE_MS, easing: SETTLE_EASING },
            (finished) => {

              if (!finished) return;
              lift.value = withTiming(0, { duration: LIFT_MS });
              runOnJS(onSettled)(itemKey);
            }
          );
          runOnJS(onDrop)(ids);
        }),
    [
      itemKey,
      scrollGesture,
      placeActive,
      order,
      activeKey,
      autoScrollDelta,
      commanded,
      lift,
      onDrop,
      onPickUp,
      onSettled,
      startTop,
      stride,
      top,
      translation,
    ]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: top.value },
      { scale: 1 + lift.value * 0.02 },
    ],
    opacity: 1 - lift.value * 0.12,
  }));

  const DragHandle = useMemo(() => {
    const Handle = ({ children, style, hitSlop }: DragHandleProps) => (
      <GestureDetector gesture={pan}>
        <View style={style} hitSlop={hitSlop}>
          {children}
        </View>
      </GestureDetector>
    );
    return Handle;
  }, [pan]);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => onMeasure(e.nativeEvent.layout.height),
    [onMeasure]
  );

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,

          zIndex: isDragging ? 2 : 1,
        },
        animatedStyle,
      ]}
    >
      {renderItem({ item, index, isDragging, DragHandle })}
    </Animated.View>
  );
}

const ReorderableRow = memo(ReorderableRowInner) as typeof ReorderableRowInner;

const ReorderableList = memo(ReorderableListInner) as typeof ReorderableListInner;

export default ReorderableList;
