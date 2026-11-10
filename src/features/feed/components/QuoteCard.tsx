import { MoreHorizontal } from 'lucide-react-native';
import { memo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import { fonts } from '../../../shared/tokens/typography';
import { formatRelativeTime } from '../../../shared/utils/date-formatter';
import type { QuoteCreator, QuoteItem } from '../types/feed.types';
import { QuoteActionBar } from './QuoteActionBar';

const MAX_VISIBLE_TAGS = 3;
const ICON_SIZE = 20;

export type QuoteCardProps = {
  quote: QuoteItem;
  /** Opens the 5-emotion reaction sheet. */
  onPressReact?: (quote: QuoteItem) => void;
  onPressRepost?: (quote: QuoteItem) => void;
  /** Fired after the optimistic toggle with the new saved state. */
  onToggleSave?: (quote: QuoteItem, saved: boolean) => void;
  onPressMore?: (quote: QuoteItem) => void;
  onPressUser?: (creator: QuoteCreator) => void;
  /** Tapping the quote body, e.g. to open the detail screen. */
  onPressQuote?: (quote: QuoteItem) => void;
  /** Long-pressing quote text opens the reaction picker. */
  onLongPressQuote?: (quote: QuoteItem) => void;
};

function Monogram({ creator }: { creator: QuoteCreator }) {
  const [failed, setFailed] = useState(false);
  const letter = (creator.username.trim()[0] ?? '?').toUpperCase();

  if (creator.avatarUrl && !failed) {
    return (
      <Image
        source={{ uri: creator.avatarUrl }}
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
        className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-800"
      />
    );
  }
  return (
    <View className="h-9 w-9 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
      <Text className="text-[15px] font-semibold text-neutral-700 dark:text-neutral-300">{letter}</Text>
    </View>
  );
}

function QuoteCardBase({
  quote,
  onPressReact,
  onPressRepost,
  onToggleSave,
  onPressMore,
  onPressUser,
  onPressQuote,
  onLongPressQuote,
}: QuoteCardProps) {
  const { colors } = useThemeColors('app');

  const time = formatRelativeTime(quote.createdAt);
  const visibleTags = quote.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTags = quote.tags.length - visibleTags.length;

  return (
    <View
      testID={`quote-card-${quote._id}`}
      className="w-full max-w-md self-center border-b border-neutral-200 bg-white px-4 pb-3 pt-4 dark:border-neutral-800 dark:bg-black"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => onPressUser?.(quote.creator)}
          accessibilityRole="button"
          accessibilityLabel={`View @${quote.creator.username}`}
          className="flex-1 flex-row items-center gap-2.5 active:opacity-70"
        >
          <Monogram creator={quote.creator} />
          <Text numberOfLines={1} className="shrink text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">
            @{quote.creator.username}
          </Text>
          {time ? <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">· {time}</Text> : null}
        </Pressable>
        <Pressable
          onPress={() => onPressMore?.(quote)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="More options"
          className="h-9 w-9 items-center justify-center active:opacity-60"
        >
          <MoreHorizontal size={ICON_SIZE} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Body */}
      <Pressable
        onPress={() => onPressQuote?.(quote)}
        onLongPress={() => onLongPressQuote?.(quote)}
        disabled={!onPressQuote && !onLongPressQuote}
        accessibilityRole={onPressQuote || onLongPressQuote ? 'button' : undefined}
        accessibilityLabel={`Quote by ${quote.author}: ${quote.text}`}
      >
        <Text
          style={{ fontFamily: fonts.serif }}
          className="mt-3 text-lg leading-relaxed text-neutral-900 dark:text-neutral-100"
        >
          {`\u201C${quote.text}\u201D`}
        </Text>
        <Text className="mt-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {`\u2014 ${quote.author}`}
        </Text>
      </Pressable>

      {/* Taxonomy */}
      {(quote.category || visibleTags.length > 0) && (
        <View className="mt-3 flex-row flex-wrap items-center gap-2">
          {quote.category ? (
            <View className="rounded-full bg-neutral-100 px-2.5 py-0.5 dark:bg-neutral-900">
              <Text className="text-xs text-neutral-600 dark:text-neutral-400">{quote.category}</Text>
            </View>
          ) : null}
          {visibleTags.map((tag) => (
            <View key={tag} className="rounded-full border border-neutral-200 px-2.5 py-0.5 dark:border-neutral-800">
              <Text className="text-xs text-neutral-500 dark:text-neutral-400">{tag}</Text>
            </View>
          ))}
          {hiddenTags > 0 ? (
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">+{hiddenTags}</Text>
          ) : null}
        </View>
      )}

      {/* Action bar */}
      <View className="mt-3">
        <QuoteActionBar
          quote={quote}
          onPressReact={onPressReact}
          onPressRepost={onPressRepost}
          onToggleSave={onToggleSave}
        />
      </View>
    </View>
  );
}

export const QuoteCard = memo(QuoteCardBase);
