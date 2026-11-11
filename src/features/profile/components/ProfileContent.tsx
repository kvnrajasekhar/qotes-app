import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View, type ListRenderItem } from 'react-native';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import { QuoteFeedItem } from '../../feed/components/QuoteFeedItem';
import { useQuoteInteractions } from '../../feed/hooks/useQuoteInteractions';
import type { QuoteCreator, QuoteItem } from '../../feed/types/feed.types';
import { useProfileQuotes } from '../hooks/useProfileQuotes';
import type { ProfileTabKey, ViewerProfile } from '../types/profile.types';
import { ProfileTabs } from './ProfileTabs';

type Row = { kind: 'tabs' } | { kind: 'quote'; quote: QuoteItem };

type ProfileContentProps = {
  profile: ViewerProfile;
  /** Fixed bar above the list. */
  top: ReactNode;
  /** Scrolling header (avatar, name, bio, metrics, action). */
  header: ReactNode;
  /** Own profile shows "Saved"; public profiles only show "Quotes". */
  tabs: readonly ProfileTabKey[];
  onRefreshProfile: () => Promise<unknown>;
};

const keyExtractor = (row: Row) => (row.kind === 'tabs' ? 'tabs' : row.quote._id);

function emptyCopy(tab: ProfileTabKey, profile: ViewerProfile): string {
  if (tab === 'saved') return 'Nothing saved yet. Tap the bookmark on a quote to keep it here.';
  return profile.isSelf ? "You haven't shared a quote yet." : `@${profile.username} hasn't shared any quotes yet.`;
}

/** Shared body of both profile screens: sticky tabs over a paginated quote stream. */
export function ProfileContent({ profile, top, header, tabs, onRefreshProfile }: ProfileContentProps) {
  const router = useRouter();
  const { colors } = useThemeColors('app');
  const [tab, setTab] = useState<ProfileTabKey>('quotes');
  const [pulling, setPulling] = useState(false);

  const stream = useProfileQuotes(profile._id, tab);

  // Index 0 is the tabs row; `stickyHeaderIndices={[0]}` pins it beneath the fixed top bar.
  const rows = useMemo<Row[]>(
    () => [{ kind: 'tabs' }, ...stream.quotes.map((quote): Row => ({ kind: 'quote', quote }))],
    [stream.quotes],
  );

  const onRefresh = useCallback(async () => {
    setPulling(true);
    try {
      await Promise.all([onRefreshProfile(), stream.refetch()]);
    } finally {
      setPulling(false);
    }
  }, [onRefreshProfile, stream]);

  const onEndReached = useCallback(() => {
    if (stream.hasNextPage && !stream.isFetchingNextPage) void stream.fetchNextPage();
  }, [stream]);

  const onOpenUser = useCallback(
    (creator: QuoteCreator) => {
      if (creator.username && creator.username.toLowerCase() !== profile.username.toLowerCase()) {
        router.push(`/u/${creator.username}`);
      }
    },
    [router, profile.username],
  );

  const interactions = useQuoteInteractions();
  const handlers = useMemo(
    () => ({ ...interactions.handlers, onPressUser: onOpenUser }),
    [interactions.handlers, onOpenUser],
  );

  const renderItem: ListRenderItem<Row> = useCallback(
    ({ item }) =>
      item.kind === 'tabs' ? (
        <ProfileTabs tabs={tabs} value={tab} onChange={setTab} />
      ) : (
        <QuoteFeedItem quote={item.quote} handlers={handlers} />
      ),
    [tabs, tab, handlers],
  );

  const footer = (() => {
    if (stream.isLoading) {
      return (
        <View className="py-12">
          <ActivityIndicator color={colors.textMuted} />
        </View>
      );
    }
    if (stream.isError && stream.quotes.length === 0) {
      return (
        <View className="items-center px-8 py-12">
          <Text className="text-center text-[14px] text-neutral-600 dark:text-neutral-400">
            {stream.error instanceof Error ? stream.error.message : 'Could not load quotes.'}
          </Text>
          <Text onPress={() => void stream.refetch()} className="mt-3 text-[14px] font-bold text-neutral-900 underline dark:text-neutral-100">
            Try again
          </Text>
        </View>
      );
    }
    if (stream.quotes.length === 0) {
      return (
        <View className="items-center px-8 py-12">
          <Text className="text-center text-[15px] leading-6 text-neutral-600 dark:text-neutral-400">
            {emptyCopy(tab, profile)}
          </Text>
        </View>
      );
    }
    return stream.isFetchingNextPage ? (
      <View className="py-6">
        <ActivityIndicator color={colors.textMuted} />
      </View>
    ) : null;
  })();

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <StatusBar style="light" />
      {interactions.sheets}
      {top}
      <View className="w-full max-w-md flex-1 self-center">
        <FlatList
          data={rows}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={<View>{header}</View>}
          ListFooterComponent={footer ?? undefined}
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
          initialNumToRender={5}
          windowSize={9}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}
