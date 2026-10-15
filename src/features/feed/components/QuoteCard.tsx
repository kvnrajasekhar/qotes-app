import * as Clipboard from 'expo-clipboard';
import { Bookmark, Check, Clipboard as ClipboardIcon, MoreHorizontal, Repeat2, Sparkles } from 'lucide-react-native';
import { memo, useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import { fonts } from '../../../shared/tokens/typography';
import { formatRelativeTime } from '../../../shared/utils/date-formatter';
import { REACTION_TYPES, type QuoteCreator, type QuoteItem } from '../types/feed.types';
import { formatCount } from '../utils/format';

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
  onPressQuote?: (quote: QuoteItem) => void;
};

/* --------------------------- small pieces --------------------------- */

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

type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number; fill?: string }>;

type ActionProps = {
  Icon: IconComponent;
  label: string;
  count?: number;
  active?: boolean;
  onPress?: () => void;
  color: string;
  activeColor: string;
};

function Action({ Icon, label, count, active = false, onPress, color, activeColor }: ActionProps) {
  const tint = active ? activeColor : color;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={count === undefined ? label : `${label}, ${count}`}
      accessibilityState={{ selected: active }}
      className="min-w-[56px] flex-row items-center gap-1.5 active:opacity-60"
    >
      <Icon size={ICON_SIZE} color={tint} strokeWidth={active ? 2.4 : 1.8} fill={active ? tint : 'none'} />
      {count !== undefined && (
        <Text style={{ color: tint, fontVariant: ['tabular-nums'] }} className="text-[13px] font-medium">
          {formatCount(count)}
        </Text>
      )}
    </Pressable>
  );
}

/* ------------------------------ card ------------------------------ */

function QuoteCardBase({
  quote,
  onPressReact,
  onPressRepost,
  onToggleSave,
  onPressMore,
  onPressUser,
  onPressQuote,
}: QuoteCardProps) {
  const { colors } = useThemeColors('app');

  const [saved, setSaved] = useState(quote.isSaved === true);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-sync if the server value changes (refetch / pagination merge).
  useEffect(() => setSaved(quote.isSaved === true), [quote.isSaved]);
  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    [],
  );

  const reactionTotal = REACTION_TYPES.reduce((sum, type) => sum + (quote.reactions[type] ?? 0), 0);
  // Optimistic count: offset the server number by our local toggle.
  const savesCount = Math.max(0, quote.savesCount + (saved ? 1 : 0) - (quote.isSaved ? 1 : 0));

  const handleSave = useCallback(() => {
    const next = !saved;
    setSaved(next);
    onToggleSave?.(quote, next);
  }, [saved, quote, onToggleSave]);

  const handleCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(`${quote.text} — ${quote.author}`);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [quote.text, quote.author]);

  const time = formatRelativeTime(quote.createdAt);
  const visibleTags = quote.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTags = quote.tags.length - visibleTags.length;

  return (
    <View className="w-full max-w-md self-center border-b border-neutral-200 bg-white px-4 pb-3 pt-4 dark:border-neutral-800 dark:bg-black">
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
      <Pressable onPress={() => onPressQuote?.(quote)} disabled={!onPressQuote} accessibilityRole="text">
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
      <View className="mt-3 flex-row items-center justify-between">
        <Action
          Icon={Sparkles}
          label="React"
          count={reactionTotal}
          active={!!quote.userReaction}
          onPress={() => onPressReact?.(quote)}
          color={colors.textMuted}
          activeColor={colors.text}
        />
        <Action
          Icon={Repeat2}
          label="Echo"
          count={quote.repostsCount}
          onPress={() => onPressRepost?.(quote)}
          color={colors.textMuted}
          activeColor={colors.text}
        />
        <Action
          Icon={Bookmark}
          label={saved ? 'Remove from saved' : 'Save'}
          count={savesCount}
          active={saved}
          onPress={handleSave}
          color={colors.textMuted}
          activeColor={colors.text}
        />
        <Action
          Icon={copied ? Check : ClipboardIcon}
          label={copied ? 'Copied' : 'Copy quote'}
          active={copied}
          onPress={handleCopy}
          color={colors.textMuted}
          activeColor={colors.text}
        />
      </View>
    </View>
  );
}

export const QuoteCard = memo(QuoteCardBase);
