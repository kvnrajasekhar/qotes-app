import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useTheme } from '../../../shared/hooks/useTheme';
import { CategoryEmptyState } from '../components/CategoryEmptyState';
import { CategoryPills } from '../components/CategoryPills';
import { FeedEmptyState } from '../components/FeedEmptyState';
import { FloatingComposeButton } from '../components/FloatingComposeButton';
import { QuoteFeedList } from '../components/QuoteFeedList';
import { ScreenTitleBar } from '../components/ScreenTitleBar';
import { useInfiniteFeed } from '../hooks/useInfiniteFeed';
import { useQuoteInteractions } from '../hooks/useQuoteInteractions';
import type { FeedCategory } from '../types/feed.types';

const DISCOVER_CATEGORIES: readonly FeedCategory[] = ['All', 'Philosophy', 'Literature', 'Stoicism', 'Science', 'Art'];

/** V07: recommended quotes from outside your network, filterable by category. */
export function DiscoverFeedScreen() {
  const router = useRouter();
  const { isDark } = useTheme('app');
  const [category, setCategory] = useState<FeedCategory>('All');
  const feed = useInfiniteFeed({ type: 'discover', category });
  const interactions = useQuoteInteractions();

  const goCompose = () => router.push('/compose');

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className="w-full max-w-md flex-1 self-center">
        <View className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
          <ScreenTitleBar title="Discover" />
          <CategoryPills value={category} onChange={setCategory} categories={DISCOVER_CATEGORIES} />
        </View>

        <QuoteFeedList
          data={feed.quotes}
          isLoading={feed.isLoading}
          hasNextPage={Boolean(feed.hasNextPage)}
          isFetchingNextPage={feed.isFetchingNextPage}
          fetchNextPage={feed.fetchNextPage}
          refetch={feed.refetch}
          handlers={interactions.handlers}
          empty={
            category !== 'All' ? (
              <CategoryEmptyState category={category} />
            ) : (
              <FeedEmptyState
                onWrite={goCompose}
                errorMessage={feed.isError ? (feed.error instanceof Error ? feed.error.message : 'Could not reach the server.') : undefined}
                onRetry={feed.isError ? () => void feed.refetch() : undefined}
              />
            )
          }
        />

        <FloatingComposeButton />
      </View>
      {interactions.sheets}
    </SafeAreaView>
  );
}
