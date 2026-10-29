import { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View, type ListRenderItem } from 'react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '../../../shared/hooks/useTheme';
import { formatCount } from '../../feed/utils/format';
import { ScreenStatus } from './ScreenStatus';
import { ProfileTopBar } from './ProfileTopBar';
import { UserListItem } from './UserListItem';
import { useCurrentIdentity } from '../hooks/useCurrentIdentity';
import { useFollowList } from '../hooks/useFollowList';
import { useFollowToggle } from '../hooks/useFollowToggle';
import type { FollowListKind, FollowListUser } from '../types/profile.types';

export function FollowListView({ username, kind }: { username: string | undefined; kind: FollowListKind }) {
  const router = useRouter();
  const { colors } = useTheme('app');
  const { identity } = useCurrentIdentity();
  const list = useFollowList(username, kind);
  const toggle = useFollowToggle();
  const title = kind === 'followers' ? 'Followers' : 'Following';
  const back = useCallback(() => router.canGoBack() ? router.back() : router.replace('/'), [router]);

  const renderItem: ListRenderItem<FollowListUser> = useCallback(({ item }) => (
    <UserListItem
      user={item}
      isSelf={item._id === identity?.userId}
      pending={toggle.isPending && toggle.variables?.user._id === item._id}
      onPress={(user) => router.push(`/u/${user.username}`)}
      onToggleFollow={(user) => toggle.mutate({ user, follow: !user.isFollowing })}
    />
  ), [identity?.userId, router, toggle]);

  if (list.isLoading) return <ScreenStatus kind="loading" />;
  if (list.notFound) return <ScreenStatus kind="message" title="This profile isn't available." onBack={back} />;
  if (list.isError || !list.profile) {
    return <ScreenStatus kind="message" title={`Couldn't load ${title.toLowerCase()}.`} message={list.error?.message} onRetry={() => void list.refetch()} onBack={back} />;
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FlatList
        data={list.users}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <>
            <ProfileTopBar title={title} onBack={back} />
            <View className="w-full max-w-md self-center px-4 py-3">
              <Text className="text-[14px] font-bold text-neutral-900 dark:text-neutral-100">{list.profile.displayName}</Text>
              <Text className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-400">
                @{list.profile.username}{list.total !== undefined ? ` · ${formatCount(list.total)} ${title.toLowerCase()}` : ''}
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <Text className="px-8 py-12 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {kind === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
          </Text>
        }
        ListFooterComponent={list.isFetchingNextPage ? <View className="py-6"><ActivityIndicator color={colors.textMuted} /></View> : undefined}
        refreshControl={<RefreshControl refreshing={list.isRefetching} onRefresh={() => void list.refetch()} tintColor={colors.text} />}
        onEndReached={() => {
          if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
