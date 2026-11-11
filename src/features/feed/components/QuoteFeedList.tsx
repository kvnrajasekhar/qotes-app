import { useCallback, useState, type ReactElement, type ReactNode } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View, type ListRenderItem } from 'react-native';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import type { QuoteHandlers, QuoteItem } from '../types/feed.types';
import { FAB_CLEARANCE } from './FloatingComposeButton';
import { QuoteFeedItem } from './QuoteFeedItem';

type QuoteFeedListProps = {
  data: QuoteItem[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
  refetch: () => unknown;
  handlers: QuoteHandlers;
  /** Rendered (filling the list) when loading has finished and there is nothing to show. */
  empty: ReactNode;
  header?: ReactElement | null;
  /** Extra space under the last row, e.g. FAB_CLEARANCE when a floating button is present. */
  bottomPadding?: number;
};

const keyExtractor = (item: QuoteItem) => item._id;

/** Pull-to-refresh, cursor pagination, loading/empty states: shared by every quote feed. */
export function QuoteFeedList({
  data,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  refetch,
  handlers,
  empty,
  header,
  bottomPadding = FAB_CLEARANCE,
}: QuoteFeedListProps) {
  const { colors } = useThemeColors('app');
  const [pulling, setPulling] = useState(false);

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
    ({ item }) => <QuoteFeedItem quote={item} handlers={handlers} />,
    [handlers],
  );

  return (
    <FlatList
      data={data}
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
      ListHeaderComponent={header ?? undefined}
      ListEmptyComponent={
        isLoading ? (
          <View className="flex-1 items-center justify-center py-24">
            <ActivityIndicator color={colors.text} />
          </View>
        ) : (
          <>{empty}</>
        )
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="py-6">
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : undefined
      }
      contentContainerStyle={data.length === 0 ? { flexGrow: 1 } : { paddingBottom: bottomPadding }}
      initialNumToRender={5}
      maxToRenderPerBatch={6}
      windowSize={9}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
    />
  );
}
