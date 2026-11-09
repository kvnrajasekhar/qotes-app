import { Check } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import { QUOTE_MAX_LENGTH, QUOTE_MIN_LENGTH, quoteValidity } from '../types/compose.types';

type TextBudgetCounterProps = { text: string };

function messageFor(text: string): string {
  const length = text.trim().length;
  switch (quoteValidity(text)) {
    case 'empty':
      return `Minimum ${QUOTE_MIN_LENGTH} characters`;
    case 'too-short':
      return `${QUOTE_MIN_LENGTH - length} more to go`;
    case 'too-long':
      return `${length - QUOTE_MAX_LENGTH} over the limit`;
    default:
      return 'Ready to post';
  }
}

/** Footer strip: validation message on the left, "{length} / 500" on the right, hairline progress above. */
export function TextBudgetCounter({ text }: TextBudgetCounterProps) {
  const { colors } = useThemeColors('app');
  const validity = quoteValidity(text);
  const length = text.trim().length;
  const progress = Math.min(1, length / QUOTE_MAX_LENGTH);
  const invalid = validity === 'too-long';

  return (
    <View className="bg-neutral-100 dark:bg-neutral-900">
      <View className="h-[2px] bg-neutral-200 dark:bg-neutral-800">
        <View
          style={{ width: `${progress * 100}%`, backgroundColor: invalid ? colors.danger : colors.text }}
          className="h-full"
        />
      </View>
      <View className="w-full max-w-md flex-row items-center justify-between self-center px-4 py-2.5">
        <View className="flex-row items-center gap-1.5" accessibilityLiveRegion="polite">
          {validity === 'valid' ? <Check size={14} color={colors.text} strokeWidth={2.6} /> : null}
          <Text style={{ color: invalid ? colors.danger : colors.textMuted }} className="text-[12px] font-medium">
            {messageFor(text)}
          </Text>
        </View>
        <Text
          accessibilityLabel={`${length} of ${QUOTE_MAX_LENGTH} characters`}
          style={{ color: invalid ? colors.danger : colors.textMuted, fontVariant: ['tabular-nums'] }}
          className="text-[12px] font-medium"
        >
          {length} / {QUOTE_MAX_LENGTH}
        </Text>
      </View>
    </View>
  );
}
