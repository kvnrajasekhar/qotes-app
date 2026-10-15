import { StatusBar } from 'expo-status-bar';
import { Bell, Search } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../../shared/hooks/useTheme';
import { fonts } from '../../../shared/tokens/typography';
import { CategoryPills } from '../components/CategoryPills';
import { QuoteCard } from '../components/QuoteCard';
import { useInfiniteFeed } from '../hooks/useInfiniteFeed';
import type { FeedCategory, QuoteCreator, QuoteItem } from '../types/feed.types';

export type GlobalFeedScreenProps = {
  onPressSearch?: () => void;
  onPressNotifications?: () => void;
  onOpenReactions?: (quote: QuoteItem) => void;
  onRepost?: (quote: QuoteItem) => void;
  onToggleSave?: (quote: QuoteItem, saved: boolean) => void;
  onOpenOptions?: (quote: QuoteItem) => void;
  onOpenUser?: (creator: QuoteCreator) => void;
  onOpenQuote?: (quote: QuoteItem) => void;
};

const keyExtractor = (item: QuoteItem) => item._id;

export function GlobalFeedScreen({
  onPressSearch,
  onPressNotifications,
  onOpenReactions,
  onRepost,
  onToggleSave,
  onOpenOptions,
  onOpenUser,
  onOpenQuote,
}: GlobalFeedScreenProps) {
  const { colors, isDark } = useTheme('app');
  const [category, setCategory] = useState<FeedCategory>('All');
  const [pulling, setPulling] = useState(false);

  const { quotes, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isLoading, isError, error } =
    useInfiniteFeed(category);

  const onRefresh = useCallback(async () => {
    setPulling(true);
    try {
      await refetch();
    } finally {
      setPulling(false);
    }
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem: ListRenderItem<QuoteItem> = useCallback(
    ({ item }) => (
      <QuoteCard
        quote={item}
        onPressReact={onOpenReactions}
        onPressRepost={onRepost}
        onToggleSave={onToggleSave}
        onPressMore={onOpenOptions}
        onPressUser={onOpenUser}
        onPressQuote={onOpenQuote}
      />
    ),
    [onOpenReactions, onRepost, onToggleSave, onOpenOptions, onOpenUser, onOpenQuote],
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-24">
          <ActivityIndicator color={colors.text} />
        </View>
      );
    }
    if (isError) {
      return (
        <View className="flex-1 items-center justify-center gap-4 px-8 py-24">
          <Text style={{ fontFamily: fonts.serif }} className="text-center text-xl text-neutral-900 dark:text-neutral-100">
            The feed went quiet.
          </Text>
          <Text className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            {error instanceof Error ? error.message : 'Could not load quotes.'}
          </Text>
          <Pressable
            onPress={onRefresh}
            accessibilityRole="button"
            className="rounded-full bg-black px-5 py-2.5 active:opacity-80 dark:bg-white"
          >
            <Text className="text-sm font-bold text-white dark:text-black">Try again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View className="flex-1 items-center justify-center gap-2 px-8 py-24">
        <Text style={{ fontFamily: fonts.serif }} className="text-center text-xl leading-8 text-neutral-900 dark:text-neutral-100">
          {category === 'All' ? '\u201CWords worth keeping start with one.\u201D' : `Nothing in ${category} yet.`}
        </Text>
        <Text className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          {category === 'All'
            ? 'Follow a few voices or share the first quote.'
            : 'Try another category, or be the first to share a quote here.'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className="w-full max-w-md flex-1 self-center">
        {/* Sticky top bar + category rail */}
        <View className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
          <View className="h-14 flex-row items-center justify-between px-4">
            <Text
              accessibilityRole="header"
              style={{ fontFamily: fonts.serifBold, fontWeight: '700' }}
              className="text-[26px] tracking-tight text-neutral-900 dark:text-neutral-100"
            >
              Qotes
            </Text>
            <View className="flex-row items-center gap-1">
              <Pressable
                onPress={onPressSearch}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Search"
                className="h-10 w-10 items-center justify-center active:opacity-60"
              >
                <Search size={22} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={onPressNotifications}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                className="h-10 w-10 items-center justify-center active:opacity-60"
              >
                <Bell size={22} color={colors.text} />
              </Pressable>
            </View>
          </View>
          <CategoryPills value={category} onChange={setCategory} />
        </View>

        <FlatList
          data={quotes}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={pulling}
              onRefresh={onRefresh}
              tintColor={colors.text}
              colors={[colors.text]}
              progressBackgroundColor={colors.background}
            />
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-6">
                <ActivityIndicator color={colors.textMuted} />
              </View>
            ) : null
          }
          contentContainerStyle={quotes.length === 0 ? { flexGrow: 1 } : undefined}
          initialNumToRender={5}
          maxToRenderPerBatch={6}
          windowSize={9}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
