import * as Clipboard from 'expo-clipboard';
import { Bookmark, Check, Clipboard as ClipboardIcon, Repeat2, Sparkles } from 'lucide-react-native';
import { memo, useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import { REACTION_TYPES, type QuoteItem } from '../types/feed.types';
import { formatCount } from '../utils/format';

const ICON_SIZE = 20;

type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number; fill?: string }>;

export type QuoteActionBarProps = {
  quote: QuoteItem;
  /** "inline": icon + count in a row (cards). "stacked": icon above a label (detail screen). */
  variant?: 'inline' | 'stacked';
  onPressReact?: (quote: QuoteItem) => void;
  onPressRepost?: (quote: QuoteItem) => void;
  /** Fired after the optimistic toggle with the new saved state. */
  onToggleSave?: (quote: QuoteItem, saved: boolean) => void;
};

type ActionProps = {
  Icon: IconComponent;
  label: string;
  /** Text under (stacked) or beside (inline) the icon. */
  caption?: string;
  active?: boolean;
  onPress?: () => void;
  color: string;
  activeColor: string;
  stacked: boolean;
};

function Action({ Icon, label, caption, active = false, onPress, color, activeColor, stacked }: ActionProps) {
  const tint = active ? activeColor : color;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      className={`active:opacity-60 ${stacked ? 'min-w-[64px] items-center gap-1' : 'min-w-[56px] flex-row items-center gap-1.5'}`}
    >
      <Icon size={ICON_SIZE} color={tint} strokeWidth={active ? 2.4 : 1.8} fill={active ? tint : 'none'} />
      {caption ? (
        <Text
          style={{ color: tint, fontVariant: ['tabular-nums'] }}
          className={stacked ? 'text-[12px] font-medium' : 'text-[13px] font-medium'}
        >
          {caption}
        </Text>
      ) : null}
    </Pressable>
  );
}

function QuoteActionBarBase({ quote, variant = 'inline', onPressReact, onPressRepost, onToggleSave }: QuoteActionBarProps) {
  const { colors } = useThemeColors('app');
  const stacked = variant === 'stacked';

  const [saved, setSaved] = useState(quote.isSaved === true);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setSaved(quote.isSaved === true), [quote.isSaved]);
  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    [],
  );

  const reactionTotal = REACTION_TYPES.reduce((sum, type) => sum + (quote.reactions[type] ?? 0), 0);
  const savesCount = Math.max(0, quote.savesCount + (saved ? 1 : 0) - (quote.isSaved ? 1 : 0));

  const handleSave = useCallback(() => {
    const next = !saved;
    setSaved(next);
    onToggleSave?.(quote, next);
  }, [saved, quote, onToggleSave]);

  const handleCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(`${quote.text} \u2014 ${quote.author}`);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [quote.text, quote.author]);

  const shared = { color: colors.textMuted, activeColor: colors.text, stacked };

  return (
    <View className={`flex-row items-center justify-between ${stacked ? 'px-2' : ''}`}>
      <Action
        {...shared}
        Icon={Sparkles}
        label={`React, ${reactionTotal} reactions`}
        caption={stacked ? 'React' : formatCount(reactionTotal)}
        active={!!quote.userReaction}
        onPress={() => onPressReact?.(quote)}
      />
      <Action
        {...shared}
        Icon={Repeat2}
        label={`Echo, ${quote.repostsCount}`}
        caption={stacked ? `Echo ${formatCount(quote.repostsCount)}` : formatCount(quote.repostsCount)}
        onPress={() => onPressRepost?.(quote)}
      />
      <Action
        {...shared}
        Icon={Bookmark}
        label={saved ? 'Remove from saved' : 'Save'}
        caption={stacked ? `Save ${formatCount(savesCount)}` : formatCount(savesCount)}
        active={saved}
        onPress={handleSave}
      />
      <Action
        {...shared}
        Icon={copied ? Check : ClipboardIcon}
        label={copied ? 'Copied' : 'Copy quote'}
        caption={stacked ? (copied ? 'Copied' : 'Copy') : undefined}
        active={copied}
        onPress={handleCopy}
      />
    </View>
  );
}

export const QuoteActionBar = memo(QuoteActionBarBase);
