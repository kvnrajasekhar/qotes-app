import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { MoreHorizontal } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../../shared/hooks/useTheme';
import { fonts } from '../../../shared/tokens/typography';
import { formatAbsoluteDateTime } from '../../../shared/utils/date-formatter';
import { ScreenStatus } from '../../profile/components/ScreenStatus';
import { UserAvatar } from '../../profile/components/UserAvatar';
import { ReactionBreakdown, ReactionPickerSheet } from '../../reactions';
import { QuoteActionBar } from '../components/QuoteActionBar';
import { useQuote } from '../hooks/useQuote';
import { REACTION_TYPES } from '../types/feed.types';
import { formatCount } from '../utils/format';

type QuoteDetailScreenProps = { id: string | undefined };

/** V08: one quote in full, with the 5-emotion breakdown. */
export function QuoteDetailScreen({ id }: QuoteDetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme('app');
  const { data: quote, isLoading, error, refetch } = useQuote(id);
  const [reacting, setReacting] = useState(false);

  const goBack = useCallback(() => (router.canGoBack() ? router.back() : router.replace('/')), [router]);

  const openMenu = useCallback(() => {
    if (!quote) return;
    Alert.alert('Quote', undefined, [
      {
        text: 'Copy quote',
        onPress: () => void Clipboard.setStringAsync(`${quote.text} \u2014 ${quote.author}`),
      },
      { text: 'Report', onPress: () => Alert.alert('Not available yet', 'Reporting will be available soon.') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [quote]);

  if (!quote) {
    if (isLoading) return <ScreenStatus kind="loading" />;
    return (
      <ScreenStatus
        kind="message"
        title={error?.status === 404 ? 'Quote not found.' : "Couldn't load this quote."}
        message={error?.status === 404 ? 'It may have been removed.' : error?.message}
        onRetry={error?.status === 404 ? undefined : () => void refetch()}
        onBack={goBack}
      />
    );
  }

  const totalReactions = REACTION_TYPES.reduce((sum, t) => sum + (quote.reactions[t] ?? 0), 0);
  const stamp = formatAbsoluteDateTime(quote.createdAt);
  const hasCreator = quote.creator.username && quote.creator.username !== 'unknown';

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top bar */}
      <View
        style={{ paddingTop: insets.top }}
        className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black"
      >
        <View className="h-14 w-full max-w-md flex-row items-center justify-between self-center px-3">
          <Pressable
            onPress={goBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-10 w-10 items-center justify-center active:opacity-60"
          >
            <Text style={{ color: colors.text, fontSize: 24, lineHeight: 28 }}>←</Text>
          </Pressable>
          <Text accessibilityRole="header" className="text-[17px] font-bold text-neutral-900 dark:text-neutral-100">
            Quote
          </Text>
          <Pressable
            onPress={openMenu}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="More options"
            className="h-10 w-10 items-center justify-center active:opacity-60"
          >
            <MoreHorizontal size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: insets.bottom + 24 }}
      >
        <View className="w-full max-w-md px-6 pt-5">
          {hasCreator ? (
            <Pressable
              onPress={() => router.push(`/u/${quote.creator.username}`)}
              accessibilityRole="button"
              className="flex-row items-center gap-2.5 active:opacity-70"
            >
              <UserAvatar username={quote.creator.username} avatarUrl={quote.creator.avatarUrl} size={36} />
              <Text className="text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">
                @{quote.creator.username}
              </Text>
            </Pressable>
          ) : null}

          {/* Hero typography */}
          <Text
            selectable
            style={{ fontFamily: fonts.serif, fontSize: 24, lineHeight: 36 }}
            className={`${hasCreator ? 'mt-5' : ''} text-neutral-900 dark:text-neutral-100`}
          >
            {`\u201C${quote.text}\u201D`}
          </Text>

          <Text className="mt-6 text-[16px] font-medium text-neutral-700 dark:text-neutral-300">
            {`\u2014 ${quote.author}`}
          </Text>
          {stamp ? <Text className="mt-1.5 text-[13px] text-neutral-500 dark:text-neutral-400">{stamp}</Text> : null}

          {(quote.category || quote.tags.length > 0) && (
            <View className="mt-4 flex-row flex-wrap items-center gap-2">
              {quote.category ? (
                <View className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-900">
                  <Text className="text-[13px] text-neutral-700 dark:text-neutral-300">{quote.category}</Text>
                </View>
              ) : null}
              {quote.tags.map((tag) => (
                <View key={tag} className="rounded-full border border-neutral-200 px-3 py-1 dark:border-neutral-800">
                  <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Stats line */}
          <View className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
              {`${formatCount(totalReactions)} reactions \u00B7 ${formatCount(quote.repostsCount)} echoes \u00B7 ${formatCount(quote.savesCount)} saves`}
            </Text>
          </View>

          {/* 5-emotion breakdown */}
          <View className="mt-4">
            <ReactionBreakdown reactions={quote.reactions} userReaction={quote.userReaction} />
          </View>

          {/* Quick actions */}
          <View className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <QuoteActionBar quote={quote} variant="stacked" onPressReact={() => setReacting(true)} />
          </View>
        </View>
      </ScrollView>

      <ReactionPickerSheet quoteId={reacting ? quote._id : null} onClose={() => setReacting(false)} />
    </View>
  );
}
