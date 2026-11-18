import { EyeOff, Flag, Link, Pencil, Share2, X, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BottomSheet } from '../../../shared/components/BottomSheet';
import { useThemeColors } from '../../../shared/hooks/useTheme';
import type { QuoteItem } from '../types/feed.types';

const REPORT_REASONS = ['Spam', 'Harassment or bullying', 'Hate speech', 'Impersonation', 'Other'] as const;

type QuoteOverflowSheetProps = {
  quote: QuoteItem | null;
  isOwnQuote: boolean | null;
  onClose: () => void;
  onEdit: (quote: QuoteItem) => void;
  onShare: (quote: QuoteItem) => Promise<void>;
  onCopyLink: (quote: QuoteItem) => Promise<void>;
  onNotInterested: (quote: QuoteItem) => Promise<void>;
  onReport: (quote: QuoteItem, reason?: string) => Promise<void>;
};

function MenuAction({
  label,
  Icon,
  onPress,
  disabled = false,
}: {
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useThemeColors('app');
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-h-12 flex-row items-center gap-3 px-5 active:bg-neutral-100 disabled:opacity-50 dark:active:bg-neutral-900"
    >
      <Icon size={20} color={colors.textMuted} />
      <Text className="flex-1 text-[15px] font-medium text-neutral-900 dark:text-neutral-100">{label}</Text>
    </Pressable>
  );
}

export function QuoteOverflowSheet({
  quote,
  isOwnQuote,
  onClose,
  onEdit,
  onShare,
  onCopyLink,
  onNotInterested,
  onReport,
}: QuoteOverflowSheetProps) {
  const { colors } = useThemeColors('app');
  const [reportMode, setReportMode] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    setReportMode(false);
    setSelectedReason(undefined);
    setPending(false);
    setErrorMessage(undefined);
  }, [quote?._id]);

  const run = async (action: () => Promise<void>) => {
    setPending(true);
    setErrorMessage(undefined);
    try {
      await action();
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not complete this action.');
    } finally {
      setPending(false);
    }
  };

  const username = quote?.creator.username;
  const hasUsername = Boolean(username && username !== 'unknown');

  return (
    <BottomSheet
      visible={quote !== null}
      onClose={onClose}
      accessibilityLabel={reportMode ? 'Report user' : 'Quote options'}
    >
      {quote ? (
        <View className="pb-3">
          <View className="min-h-12 flex-row items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
            {reportMode ? (
              <Pressable
                onPress={() => {
                  setReportMode(false);
                  setErrorMessage(undefined);
                }}
                accessibilityRole="button"
                accessibilityLabel="Back to quote options"
                className="h-11 min-w-11 items-start justify-center"
              >
                <Text className="text-[14px] font-semibold text-neutral-700 dark:text-neutral-300">Back</Text>
              </Pressable>
            ) : (
              <Text className="text-[16px] font-bold text-neutral-900 dark:text-neutral-100">
                @{username}
              </Text>
            )}
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close quote options"
              className="h-11 w-11 items-center justify-center"
            >
              <X size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          {reportMode ? (
            <View className="px-4 pt-4">
              <Text accessibilityRole="header" className="text-[18px] font-bold text-neutral-900 dark:text-neutral-100">
                Report @{username}
              </Text>
              <Text className="mt-2 text-[14px] leading-5 text-neutral-600 dark:text-neutral-400">
                Choose a reason if you want. You can also submit without one.
              </Text>
              <View className="mt-3" accessibilityRole="radiogroup" accessibilityLabel="Report reason">
                {REPORT_REASONS.map((reason) => {
                  const selected = selectedReason === reason;
                  return (
                    <Pressable
                      key={reason}
                      onPress={() => setSelectedReason(selected ? undefined : reason)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      className="min-h-11 flex-row items-center gap-3"
                    >
                      <View
                        className={`h-5 w-5 items-center justify-center rounded-full border ${
                          selected ? 'border-neutral-900 dark:border-neutral-100' : 'border-neutral-400 dark:border-neutral-600'
                        }`}
                      >
                        {selected ? <View className="h-2.5 w-2.5 rounded-full bg-neutral-900 dark:bg-neutral-100" /> : null}
                      </View>
                      <Text className="text-[14px] text-neutral-800 dark:text-neutral-200">{reason}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {errorMessage ? (
                <Text accessibilityRole="alert" className="mt-2 text-[13px] text-red-700 dark:text-red-400">
                  {errorMessage}
                </Text>
              ) : null}
              <Pressable
                disabled={pending}
                onPress={() => quote && void run(() => onReport(quote, selectedReason))}
                accessibilityRole="button"
                className="mt-4 h-12 items-center justify-center rounded-full bg-neutral-900 active:opacity-80 disabled:opacity-60 dark:bg-white"
              >
                <Text className="text-[15px] font-bold text-white dark:text-black">
                  {pending ? 'Submitting…' : 'Submit report'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="pt-2">
              <MenuAction
                label="Share quote"
                Icon={Share2}
                disabled={pending}
                onPress={() => quote && void run(() => onShare(quote))}
              />
              <MenuAction
                label="Copy link"
                Icon={Link}
                disabled={pending}
                onPress={() => quote && void run(() => onCopyLink(quote))}
              />
              {isOwnQuote ? (
                <MenuAction
                  label="Edit quote"
                  Icon={Pencil}
                  disabled={pending}
                  onPress={() => quote && onEdit(quote)}
                />
              ) : null}
              {isOwnQuote === false && hasUsername ? (
                <>
                  {quote.creator._id ? (
                    <MenuAction
                      label={`Not interested in @${username}`}
                      Icon={EyeOff}
                      disabled={pending}
                      onPress={() => quote && void run(() => onNotInterested(quote))}
                    />
                  ) : null}
                  <MenuAction
                    label={`Report @${username}`}
                    Icon={Flag}
                    disabled={pending}
                    onPress={() => {
                      setReportMode(true);
                      setErrorMessage(undefined);
                    }}
                  />
                </>
              ) : null}
              {errorMessage ? (
                <Text accessibilityRole="alert" className="px-4 py-2 text-[13px] text-red-700 dark:text-red-400">
                  {errorMessage}
                </Text>
              ) : null}
            </View>
          )}
        </View>
      ) : null}
    </BottomSheet>
  );
}
