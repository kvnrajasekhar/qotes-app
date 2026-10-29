import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View, type ListRenderItem } from 'react-native';

import { useTheme } from '../../../shared/hooks/useTheme';
import { QuoteCard } from '../../feed/components/QuoteCard';
import type { QuoteItem } from '../../feed/types/feed.types';
import type { ProfileTabKey, UserProfile } from '../types/profile.types';
import { ProfileTabs } from './ProfileTabs';
import { useProfileQuotes } from '../hooks/useProfileQuotes';

type ProfileRow = { type: 'tabs' } | { type: 'quote'; quote: QuoteItem } | { type: 'status'; message: string; loading?: boolean };
type ProfileContentProps = {
  profile: UserProfile;
  tabs: readonly ProfileTabKey[];
  top: ReactNode;
  header: ReactNode;
  onRefreshProfile: () => Promise<unknown>;
};

export function ProfileContent({ profile, tabs, top, header, onRefreshProfile }: ProfileContentProps) {
  const { colors } = useTheme('app');
  const [tab, setTab] = useState<ProfileTabKey>(tabs[0] ?? 'quotes');
  const query = useProfileQuotes(profile._id, tab === 'quotes');
  const quotes = useMemo(() => {
    const seen = new Set<string>();
    return (query.data?.pages.flatMap((page) => page.quotes) ?? []).filter((quote) => {
      if (seen.has(quote._id)) return false;
      seen.add(quote._id);
      return true;
    });
  }, [query.data?.pages]);
  const rows = useMemo<ProfileRow[]>(() => {
    const items: ProfileRow[] = [{ type: 'tabs' }];
    if (tab === 'quotes' && quotes.length) {
      items.push(...quotes.map((quote) => ({ type: 'quote' as const, quote })));
    } else if (query.isLoading && tab === 'quotes') {
      items.push({ type: 'status', message: '', loading: true });
    } else {
      items.push({ type: 'status', message: tab === 'saved'
        ? 'Saved quotes are not available yet.'
        : query.isError
          ? 'Could not load quotes. Pull down to try again.'
          : `@${profile.username} hasn't posted yet.` });
    }
    return items;
  }, [profile.username, query.isError, query.isLoading, quotes, tab]);

  const refresh = useCallback(async () => {
    await Promise.all([query.refetch(), onRefreshProfile()]);
  }, [query.refetch, onRefreshProfile]);
  const renderItem: ListRenderItem<ProfileRow> = useCallback(({ item }) => {
    if (item.type === 'tabs') {
      return <ProfileTabs tabs={tabs} value={tab} onChange={setTab} />;
    }
    if (item.type === 'quote') {
      return <QuoteCard quote={item.quote} />;
    }
    if (item.type === 'status') {
      return item.loading
        ? <View className="py-12"><ActivityIndicator color={colors.textMuted} /></View>
        : <Text accessibilityRole={query.isError ? 'alert' : undefined} className="px-6 py-12 text-center text-sm text-neutral-600 dark:text-neutral-400">{item.message}</Text>;
    }
    return null;
  }, [colors.textMuted, query.isError, tab, tabs]);

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FlatList
        data={rows}
        renderItem={renderItem}
        keyExtractor={(item) => item.type === 'tabs'
          ? 'profile-tabs'
          : item.type === 'quote'
            ? item.quote._id
            : 'profile-status'}
        ListHeaderComponent={<>{top}{header}</>}
        stickyHeaderIndices={[1]}
        refreshControl={<RefreshControl refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => void refresh()} tintColor={colors.text} />}
        ListFooterComponent={query.isFetchingNextPage ? <View className="py-6"><ActivityIndicator color={colors.textMuted} /></View> : undefined}
        onEndReached={() => {
          if (tab === 'quotes' && query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={rows.length <= 2 ? { flexGrow: 1 } : undefined}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
