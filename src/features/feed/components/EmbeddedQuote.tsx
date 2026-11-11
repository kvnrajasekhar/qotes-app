import { Pressable, Text, View } from 'react-native';

import { MonogramAvatar } from '../../../shared/components/MonogramAvatar';
import { fonts } from '../../../shared/tokens/typography';
import { formatRelativeTime } from '../../../shared/utils/date-formatter';
import type { QuoteItem } from '../types/feed.types';

type EmbeddedQuoteProps = {
  quote: QuoteItem;
  /** Omit for a read-only citation (e.g. inside the requote composer). */
  onPress?: (quote: QuoteItem) => void;
};

/** The root quote inside a requote: 1px border box, serif text, author. */
export function EmbeddedQuote({ quote, onPress }: EmbeddedQuoteProps) {
  const time = formatRelativeTime(quote.createdAt);
  return (
    <Pressable
      onPress={() => onPress?.(quote)}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Original quote by ${quote.author}: ${quote.text}`}
      className="rounded-xl border border-neutral-300 p-3 active:opacity-80 dark:border-neutral-700"
    >
      <View className="flex-row items-center gap-2">
        <MonogramAvatar username={quote.creator.username} avatarUrl={quote.creator.avatarUrl} size={20} />
        <Text numberOfLines={1} className="shrink text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
          @{quote.creator.username}
        </Text>
        {time ? <Text className="text-[12px] text-neutral-500 dark:text-neutral-400">· {time}</Text> : null}
      </View>
      <Text
        style={{ fontFamily: fonts.serif }}
        className="mt-2 text-[16px] leading-6 text-neutral-900 dark:text-neutral-100"
      >
        {`\u201C${quote.text}\u201D`}
      </Text>
      <Text className="mt-2 text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
        {`\u2014 ${quote.author}`}
      </Text>
    </Pressable>
  );
}
