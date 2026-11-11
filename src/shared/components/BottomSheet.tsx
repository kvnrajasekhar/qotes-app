import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Dimensions, Easing, Modal, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Fixed height as a fraction of the screen (use for sheets that contain a scrolling list). */
  heightRatio?: number;
  accessibilityLabel?: string;
};

const WINDOW_HEIGHT = Dimensions.get('window').height;
const DISMISS_DISTANCE = 90;

/**
 * Dependency-free slide-up sheet: dimmed backdrop, spring in, drag the handle (or tap the backdrop) to dismiss.
 * Content is unmounted once the exit animation finishes.
 */
export function BottomSheet({ visible, onClose, children, heightRatio, accessibilityLabel }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(false);
  const translateY = useRef(new Animated.Value(WINDOW_HEIGHT)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, damping: 24, stiffness: 240, mass: 0.9, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(translateY, {
          toValue: WINDOW_HEIGHT,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 4,
      onPanResponderMove: (_e, g) => translateY.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_e, g) => {
        if (g.dy > DISMISS_DISTANCE || g.vy > 0.9) onCloseRef.current();
        else Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  if (!mounted) return null;

  return (
    <Modal transparent animationType="none" statusBarTranslucent visible onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: '#000000', opacity: backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) },
          ]}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
        </Animated.View>

        <Animated.View
          style={[
            { transform: [{ translateY }], paddingBottom: insets.bottom + 12 },
            heightRatio ? { height: WINDOW_HEIGHT * heightRatio } : null,
          ]}
          className="w-full max-w-md self-center rounded-t-3xl border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black"
          accessibilityViewIsModal
          accessibilityLabel={accessibilityLabel}
        >
          <View {...pan.panHandlers} className="items-center pb-1 pt-3">
            <View className="h-1 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          </View>
          <View className={heightRatio ? 'flex-1' : undefined}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}
