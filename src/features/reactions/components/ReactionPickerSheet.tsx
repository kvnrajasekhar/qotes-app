import { Check, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import { useQuote } from '../../feed/hooks/useQuote';
import type { QuoteItem } from '../../feed/types/feed.types';
import { formatCount } from '../../feed/utils/format';
import { EMOTION_MATRIX } from '../constants/emotionMatrix';
import { useReactionToggle } from '../hooks/useReactionToggle';

export type ReactionPickerSheetProps = {
  /** Open when set, closed when null. The sheet reads the live quote, so counters update as you tap. */
  quoteId: string | null;
  onClose: () => void;
};

const OFFSCREEN = Dimensions.get('window').height;
const DISMISS_DISTANCE = 90;

export function ReactionPickerSheet({ quoteId, onClose }: ReactionPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeColors('app');
  const { data: liveQuote } = useQuote(quoteId);
  const toggle = useReactionToggle();

  // Keep rendering the last quote while the sheet animates out.
  const lastQuote = useRef<QuoteItem | undefined>(undefined);
  if (liveQuote) lastQuote.current = liveQuote;
  const quote = liveQuote ?? lastQuote.current;

  const [mounted, setMounted] = useState(false);
  const translateY = useRef(new Animated.Value(OFFSCREEN)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const open = quoteId !== null;

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, damping: 24, stiffness: 240, mass: 0.9, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(translateY, {
          toValue: OFFSCREEN,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Drag the handle down to dismiss.
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

  const select = (type: (typeof EMOTION_MATRIX)[number]['type']) => {
    if (!quote) return;
    toggle.mutate({ quoteId: quote._id, type, current: quote.userReaction ?? null });
    onClose();
  };

  if (!mounted) return null;

  return (
    <Modal transparent animationType="none" statusBarTranslucent visible onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: '#000000', opacity: backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) }]}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close reactions" />
        </Animated.View>

        <Animated.View
          style={{ transform: [{ translateY }], paddingBottom: insets.bottom + 12 }}
          className="w-full max-w-md self-center rounded-t-3xl border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black"
          accessibilityViewIsModal
        >
          <View {...pan.panHandlers} className="items-center pb-1 pt-3">
            <View className="h-1 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          </View>

          <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
            <View>
              <Text accessibilityRole="header" className="text-[18px] font-bold text-neutral-900 dark:text-neutral-100">
                How did this land?
              </Text>
              <Text className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-400">
                One reaction per quote. Tap again to remove it.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="h-9 w-9 items-center justify-center active:opacity-60"
            >
              <X size={22} color={isDark ? '#FFFFFF' : '#000000'} />
            </Pressable>
          </View>

          {EMOTION_MATRIX.map(({ type, label, hint, Icon, accent }) => {
            const selected = quote?.userReaction === type;
            const tint = isDark ? accent.dark : accent.light;
            const count = quote?.reactions[type] ?? 0;
            return (
              <Pressable
                key={type}
                onPress={() => select(type)}
                accessibilityRole="button"
                accessibilityLabel={`${label}, ${count} reactions${selected ? ', selected' : ''}`}
                accessibilityState={{ selected }}
                className="flex-row items-center gap-4 px-5 py-3 active:bg-neutral-100 dark:active:bg-neutral-900"
              >
                <View
                  style={{ backgroundColor: selected ? tint : 'transparent', borderColor: tint, borderWidth: 1.5 }}
                  className="h-11 w-11 items-center justify-center rounded-full"
                >
                  <Icon size={22} color={selected ? (isDark ? '#000000' : '#FFFFFF') : tint} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: tint }} className="text-[16px] font-bold">
                    {label}
                  </Text>
                  <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">{hint}</Text>
                </View>
                {selected ? <Check size={20} color={tint} strokeWidth={2.6} /> : null}
                <Text
                  style={{ fontVariant: ['tabular-nums'] }}
                  className="min-w-[36px] text-right text-[14px] font-medium text-neutral-600 dark:text-neutral-400"
                >
                  {formatCount(count)}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>
      </View>
    </Modal>
  );
}
