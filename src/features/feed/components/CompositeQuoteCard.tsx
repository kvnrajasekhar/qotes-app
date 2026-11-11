import { MoreHorizontal } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { MonogramAvatar } from '../../../shared/components/MonogramAvatar';
import { useThemeColors } from '../../../shared/hooks/useTheme';
import { formatRelativeTime } from '../../../shared/utils/date-formatter';
import type { QuoteHandlers, QuoteItem } from '../types/feed.types';
import { EmbeddedQuote } from './EmbeddedQuote';
import { QuoteActionBar } from './QuoteActionBar';

type CompositeQuoteCardProps = {
  /** A requote with commentary: `text` is the commentary, `parent` is the root quote. */
  quote: QuoteItem;
  handlers?: QuoteHandlers;
  /** Hide the embedded root (used in a quote's own Reflections list, where the root is the page itself). */
  showEmbedded?: boolean;
};

/** User A's commentary on top, User B's quote embedded below in a 1px border box. */
function CompositeQuoteCardBase({ quote, handlers = {}, showEmbedded = true }: CompositeQuoteCardProps) {
  const { colors } = useThemeColors('app');
  const time = formatRelativeTime(quote.createdAt);

  return (
    <View
      testID={`composite-card-${quote._id}`}
      className="w-full max-w-md self-center border-b border-neutral-200 bg-white px-4 pb-3 pt-4 dark:border-neutral-800 dark:bg-black"
    >
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => handlers.onPressUser?.(quote.creator)}
          accessibilityRole="button"
          accessibilityLabel={`View @${quote.creator.username}`}
          className="flex-1 flex-row items-center gap-2.5 active:opacity-70"
        >
          <MonogramAvatar username={quote.creator.username} avatarUrl={quote.creator.avatarUrl} size={36} />
          <Text numberOfLines={1} className="shrink text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">
            @{quote.creator.username}
          </Text>
          {time ? <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">· {time}</Text> : null}
        </Pressable>
        <Pressable
          onPress={() => handlers.onPressMore?.(quote)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="More options"
          className="h-9 w-9 items-center justify-center active:opacity-60"
        >
          <MoreHorizontal size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => handlers.onPressQuote?.(quote)}
        disabled={!handlers.onPressQuote}
        accessibilityRole={handlers.onPressQuote ? 'button' : undefined}
      >
        <Text className="mt-3 text-[16px] leading-6 text-neutral-900 dark:text-neutral-100">{quote.text}</Text>
      </Pressable>

      {showEmbedded && quote.parent ? (
        <View className="mt-3">
          <EmbeddedQuote quote={quote.parent} onPress={handlers.onPressQuote} />
        </View>
      ) : null}

      <View className="mt-3">
        <QuoteActionBar
          quote={quote}
          onPressReact={handlers.onPressReact}
          onPressRepost={handlers.onPressRepost}
          onToggleSave={handlers.onToggleSave}
        />
      </View>
    </View>
  );
}

export const CompositeQuoteCard = memo(CompositeQuoteCardBase);
