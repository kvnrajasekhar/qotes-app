import { Text, View } from 'react-native';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import { REACTION_TYPES, type ReactionCounts, type ReactionType } from '../../feed/types/feed.types';
import { formatCount } from '../../feed/utils/format';
import { EMOTION_MATRIX } from '../constants/emotionMatrix';

type ReactionBreakdownProps = {
  reactions: ReactionCounts;
  userReaction?: ReactionType | null;
};

/** One accent-filled progress bar per emotion, showing count and percentage share of all reactions. */
export function ReactionBreakdown({ reactions, userReaction }: ReactionBreakdownProps) {
  const { isDark } = useThemeColors('app');
  const total = REACTION_TYPES.reduce((sum, t) => sum + (reactions[t] ?? 0), 0);

  return (
    <View className="gap-4">
      {EMOTION_MATRIX.map(({ type, label, Icon, accent }) => {
        const count = reactions[type] ?? 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        const width = count > 0 ? Math.max(percent, 2) : 0;
        const tint = isDark ? accent.dark : accent.light;
        const mine = userReaction === type;

        return (
          <View
            key={type}
            accessible
            accessibilityLabel={`${label}: ${count} reactions, ${percent} percent${mine ? ', your reaction' : ''}`}
          >
            <View className="flex-row items-center">
              <Icon size={18} color={tint} strokeWidth={2} />
              <Text className={`ml-2 flex-1 text-[15px] text-neutral-900 dark:text-neutral-100 ${mine ? 'font-bold' : 'font-semibold'}`}>
                {label}
                {mine ? <Text className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400">{'  \u00B7 You'}</Text> : null}
              </Text>
              <Text style={{ fontVariant: ['tabular-nums'] }} className="w-10 text-right text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">
                {formatCount(count)}
              </Text>
              <Text style={{ fontVariant: ['tabular-nums'] }} className="w-12 text-right text-[13px] text-neutral-500 dark:text-neutral-400">
                {percent}%
              </Text>
            </View>
            <View className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
              <View style={{ width: `${width}%`, backgroundColor: tint }} className="h-full rounded-full" />
            </View>
          </View>
        );
      })}
    </View>
  );
}
