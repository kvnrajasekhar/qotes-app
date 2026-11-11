import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MoreHorizontal } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MonogramAvatar } from '../../../shared/components/MonogramAvatar';
import { useTheme } from '../../../shared/hooks/useTheme';
import { fonts } from '../../../shared/tokens/typography';
import { formatAbsoluteDateTime, formatRelativeTime } from '../../../shared/utils/date-formatter';
import { ScreenStatus } from '../../profile/components/ScreenStatus';
import { ReactionBreakdown } from '../../reactions/components/ReactionBreakdown';
import { ReactionUsersSheet } from '../../reactions/components/ReactionUsersSheet';
import { CompositeQuoteCard } from '../components/CompositeQuoteCard';
import { EmbeddedQuote } from '../components/EmbeddedQuote';
import { QuoteActionBar } from '../components/QuoteActionBar';
import { useQuoteInteractions } from '../hooks/useQuoteInteractions';
import { useQuote } from '../hooks/useQuote';
import { useReflections } from '../hooks/useReflections';
import { REACTION_TYPES, type QuoteItem } from '../types/feed.types';
import { formatCount } from '../utils/format';

type DetailTab = 'reactions' | 'reflections';
type Row = { kind: 'tabs' } | { kind: 'breakdown' } | { kind: 'reflection'; quote: QuoteItem };

const TAB_LABELS: Record<DetailTab, string> = { reactions: 'Reactions', reflections: 'Reflections' };

function DetailTabs({ value, onChange }: { value: DetailTab; onChange: (tab: DetailTab) => void }) {
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black"
    >
      {(Object.keys(TAB_LABELS) as DetailTab[]).map((tab) => {
        const selected = tab === value;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className="flex-1 items-center active:opacity-70"
          >
            <Text
              className={`py-3.5 text-[15px] ${
                selected
                  ? 'font-bold text-neutral-900 dark:text-neutral-100'
                  : 'font-medium text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {TAB_LABELS[tab]}
            </Text>
            <View className={`h-[2px] w-full ${selected ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-transparent'}`} />
          </Pressable>
        );
      })}
    </View>
  );
}

type QuoteHeroProps = {
  quote: QuoteItem;
  onPressUser: () => void;
  onPressParent: (parent: QuoteItem) => void;
};

function QuoteHero({ quote, onPressUser, onPressParent }: QuoteHeroProps) {
  const time = formatRelativeTime(quote.createdAt);
  const stamp = formatAbsoluteDateTime(quote.createdAt);
  const hasCreator = Boolean(quote.creator.username) && quote.creator.username !== 'unknown';
  const isCommentary = quote.isRequote === true && quote.text.trim().length > 0 && Boolean(quote.parent);

  return (
    <View className="px-6 pb-5 pt-5">
      {hasCreator ? (
        <Pressable
          onPress={onPressUser}
          accessibilityRole="button"
          accessibilityLabel={`View @${quote.creator.username}`}
          className="flex-row items-center gap-2.5 active:opacity-70"
        >
          <MonogramAvatar username={quote.creator.username} avatarUrl={quote.creator.avatarUrl} size={36} />
          <Text className="text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">
            @{quote.creator.username}
          </Text>
          {time ? <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">· {time}</Text> : null}
        </Pressable>
      ) : null}

      {isCommentary && quote.parent ? (
        <>
          <Text selectable className="mt-5 text-[18px] leading-7 text-neutral-900 dark:text-neutral-100">
            {quote.text}
          </Text>
          <View className="mt-4">
            <EmbeddedQuote quote={quote.parent} onPress={onPressParent} />
          </View>
        </>
      ) : (
        <>
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
        </>
      )}

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
    </View>
  );
}

const keyExtractor = (row: Row) =>
  row.kind === 'reflection' ? `reflection-${row.quote._id}` : row.kind;

type QuoteDetailScreenProps = { id: string | undefined };

/** V08: one quote in full, with the 5-emotion breakdown and Reactions / Reflections tabs. */
export function QuoteDetailScreen({ id }: QuoteDetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme('app');
  const { data: quote, isLoading, error, refetch } = useQuote(id);
  const interactions = useQuoteInteractions();

  const [tab, setTab] = useState<DetailTab>('reactions');
  const [usersOpen, setUsersOpen] = useState(false);
  const reflections = useReflections(quote?._id, tab === 'reflections');

  const goBack = useCallback(() => (router.canGoBack() ? router.back() : router.replace('/')), [router]);

  // A plain requote has nothing of its own to show: open the quote it points at.
  useEffect(() => {
    if (quote?.isRequote && !quote.text.trim() && quote.parent) router.replace(`/quote/${quote.parent._id}`);
  }, [quote, router]);

  const openMenu = useCallback(() => {
    if (!quote) return;
    Alert.alert('Quote', undefined, [
      { text: 'Copy quote', onPress: () => void Clipboard.setStringAsync(`${quote.text} \u2014 ${quote.author}`) },
      { text: 'Report', onPress: () => Alert.alert('Not available yet', 'Reporting will be available soon.') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [quote]);

  const rows = useMemo<Row[]>(() => {
    if (tab === 'reactions') return [{ kind: 'tabs' }, { kind: 'breakdown' }];
    return [{ kind: 'tabs' }, ...reflections.reflections.map((q): Row => ({ kind: 'reflection', quote: q }))];
  }, [tab, reflections.reflections]);

  const totalReactions = quote ? REACTION_TYPES.reduce((sum, t) => sum + (quote.reactions[t] ?? 0), 0) : 0;
  const { handlers } = interactions;

  const renderItem: ListRenderItem<Row> = useCallback(
    ({ item }) => {
      if (!quote) return null;
      if (item.kind === 'tabs') return <DetailTabs value={tab} onChange={setTab} />;
      if (item.kind === 'breakdown') {
        return (
          <Pressable
            onPress={() => setUsersOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="See who reacted"
            accessibilityHint="Opens the list of people who reacted"
            className="px-6 py-5 active:opacity-80"
          >
            <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
              {`${formatCount(totalReactions)} reactions \u00B7 ${formatCount(quote.repostsCount)} echoes \u00B7 ${formatCount(quote.savesCount)} saves`}
            </Text>
            <View className="mt-4">
              <ReactionBreakdown reactions={quote.reactions} userReaction={quote.userReaction} />
            </View>
            <Text className="mt-5 text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
              See who reacted {'\u203A'}
            </Text>
          </Pressable>
        );
      }
      return <CompositeQuoteCard quote={item.quote} handlers={handlers} showEmbedded={false} />;
    },
    [quote, tab, totalReactions, handlers],
  );

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

  const footer =
    tab !== 'reflections' ? null : reflections.isLoading ? (
      <View className="py-12">
        <ActivityIndicator color={colors.textMuted} />
      </View>
    ) : reflections.isError && reflections.reflections.length === 0 ? (
      <View className="items-center px-8 py-12">
        <Text className="text-center text-[14px] text-neutral-600 dark:text-neutral-400">
          {reflections.error instanceof Error ? reflections.error.message : 'Could not load reflections.'}
        </Text>
        <Text onPress={() => void reflections.refetch()} className="mt-3 text-[14px] font-bold text-neutral-900 underline dark:text-neutral-100">
          Try again
        </Text>
      </View>
    ) : reflections.reflections.length === 0 ? (
      <View className="items-center px-8 py-12">
        <Text className="text-center text-[15px] leading-6 text-neutral-600 dark:text-neutral-400">
          No reflections yet. Requote with commentary to add yours.
        </Text>
      </View>
    ) : reflections.isFetchingNextPage ? (
      <View className="py-6">
        <ActivityIndicator color={colors.textMuted} />
      </View>
    ) : null;

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top bar */}
      <View style={{ paddingTop: insets.top }} className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
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

      <View className="w-full max-w-md flex-1 self-center">
        <FlatList
          data={rows}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <QuoteHero
              quote={quote}
              onPressUser={() => handlers.onPressUser?.(quote.creator)}
              onPressParent={(parent) => router.push(`/quote/${parent._id}`)}
            />
          }
          ListFooterComponent={footer ?? undefined}
          onEndReached={() => {
            if (tab === 'reflections' && reflections.hasNextPage && !reflections.isFetchingNextPage) {
              void reflections.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Fixed bottom action bar: React, Requote, Save, Copy */}
      <View
        style={{ paddingBottom: insets.bottom + 8 }}
        className="border-t border-neutral-200 bg-white pt-3 dark:border-neutral-800 dark:bg-black"
      >
        <View className="w-full max-w-md self-center px-4">
          <QuoteActionBar
            quote={quote}
            variant="stacked"
            onPressReact={handlers.onPressReact}
            onPressRepost={handlers.onPressRepost}
          />
        </View>
      </View>

      <ReactionUsersSheet
        quoteId={usersOpen ? quote._id : null}
        reactions={quote.reactions}
        onClose={() => setUsersOpen(false)}
      />
      {interactions.sheets}
    </View>
  );
}
