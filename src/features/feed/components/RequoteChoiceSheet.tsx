import { useRouter } from 'expo-router';
import { Pencil, Repeat2, type LucideIcon } from 'lucide-react-native';
import { useRef } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BottomSheet } from '../../../shared/components/BottomSheet';
import { useThemeColors } from '../../../shared/hooks/useTheme';
import { useRequote } from '../../compose/hooks/useRequote';
import type { QuoteItem } from '../types/feed.types';

type RequoteChoiceSheetProps = {
  /** Open when set, closed when null. */
  quote: QuoteItem | null;
  onClose: () => void;
};

type OptionProps = {
  Icon: LucideIcon;
  title: string;
  description: string;
  disabled: boolean;
  onPress: () => void;
  color: string;
};

function Option({ Icon, title, description, disabled, onPress, color }: OptionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={{ disabled }}
      style={{ opacity: disabled ? 0.4 : 1 }}
      className="flex-row items-center gap-4 px-5 py-4 active:bg-neutral-100 dark:active:bg-neutral-900"
    >
      <View className="h-11 w-11 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700">
        <Icon size={22} color={color} strokeWidth={1.9} />
      </View>
      <View className="flex-1">
        <Text className="text-[16px] font-bold text-neutral-900 dark:text-neutral-100">{title}</Text>
        <Text className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-400">{description}</Text>
      </View>
    </Pressable>
  );
}

/** "Requote to profile" (one tap) vs "Requote with commentary" (opens the composer). */
export function RequoteChoiceSheet({ quote, onClose }: RequoteChoiceSheetProps) {
  const router = useRouter();
  const { colors } = useThemeColors('app');
  const requote = useRequote();

  // Keep content while the sheet animates out.
  const last = useRef<QuoteItem | undefined>(undefined);
  if (quote) last.current = quote;
  const shown = quote ?? last.current;
  const already = shown?.viewerRequoted === true;

  const toProfile = () => {
    if (!shown) return;
    requote.mutate({ parent: shown });
    onClose();
  };

  const withCommentary = () => {
    if (!shown) return;
    onClose();
    router.push(`/requote/${shown._id}`);
  };

  return (
    <BottomSheet visible={quote !== null} onClose={onClose} accessibilityLabel="Requote options">
      <Text accessibilityRole="header" className="px-5 pb-2 pt-2 text-[18px] font-bold text-neutral-900 dark:text-neutral-100">
        Requote
      </Text>
      {already ? (
        <Text className="px-5 pb-2 text-[13px] text-neutral-500 dark:text-neutral-400">
          You&apos;ve already requoted this quote.
        </Text>
      ) : null}

      <Option
        Icon={Repeat2}
        title="Requote to profile"
        description="Share it with your followers right away."
        disabled={already}
        onPress={toProfile}
        color={colors.text}
      />
      <Option
        Icon={Pencil}
        title="Requote with commentary"
        description="Add your reflection (up to 200 characters)."
        disabled={already}
        onPress={withCommentary}
        color={colors.text}
      />
    </BottomSheet>
  );
}
