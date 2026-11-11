import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../../shared/hooks/useTheme';
import { FollowingEmptyState } from '../components/FollowingEmptyState';
import { QuoteFeedList } from '../components/QuoteFeedList';
import { ScreenTitleBar } from '../components/ScreenTitleBar';
import { useInfiniteFeed } from '../hooks/useInfiniteFeed';
import { useQuoteInteractions } from '../hooks/useQuoteInteractions';

/** V06: quotes from people you follow, or "Your feed is quiet" with suggested writers. */
export function FollowingFeedScreen() {
  const { isDark } = useTheme('app');
  const feed = useInfiniteFeed({ type: 'following' });
  const interactions = useQuoteInteractions();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className="w-full max-w-md flex-1 self-center">
        <ScreenTitleBar title="Following" />
        <QuoteFeedList
          data={feed.quotes}
          isLoading={feed.isLoading}
          hasNextPage={Boolean(feed.hasNextPage)}
          isFetchingNextPage={feed.isFetchingNextPage}
          fetchNextPage={feed.fetchNextPage}
          refetch={feed.refetch}
          handlers={interactions.handlers}
          bottomPadding={24}
          empty={
            <FollowingEmptyState
              errorMessage={feed.isError ? (feed.error instanceof Error ? feed.error.message : 'Could not load your feed.') : undefined}
              onRetry={feed.isError ? () => void feed.refetch() : undefined}
            />
          }
        />
      </View>
      {interactions.sheets}
    </SafeAreaView>
  );
}
