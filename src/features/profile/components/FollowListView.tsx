import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import { formatCount } from '../../feed/utils/format';
import { useCurrentIdentity } from '../hooks/useCurrentIdentity';
import { useFollowList } from '../hooks/useFollowList';
import { useFollowToggle } from '../hooks/useFollowToggle';
import type { FollowListKind, FollowListUser } from '../types/profile.types';
import { ScreenStatus } from './ScreenStatus';
import { UserListItem } from './UserListItem';

type FollowListViewProps = { username: string | undefined; kind: FollowListKind };

const TITLE: Record<FollowListKind, string> = { followers: 'Followers', following: 'Following' };
const keyExtractor = (u: FollowListUser) => u._id;

/** Shared implementation behind FollowersScreen and FollowingScreen. */
export function FollowListView({ username, kind }: FollowListViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeColors('app');
  const { identity } = useCurrentIdentity();
  const [pulling, setPulling] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const list = useFollowList(username, kind);
  const toggle = useFollowToggle();

  const goBack = useCallback(() => (router.canGoBack() ? router.back() : router.replace('/')), [router]);

  const onRefresh = useCallback(async () => {
    setPulling(true);
    try {
      await list.refetch();
    } finally {
      setPulling(false);
    }
  }, [list]);

  const onEndReached = useCallback(() => {
    if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
  }, [list]);

  const onToggleFollow = useCallback(
    (user: FollowListUser) => {
      setPendingId(user._id);
      toggle.mutate({ user, follow: !user.isFollowing }, { onSettled: () => setPendingId(null) });
    },
    [toggle],
  );

  const renderItem: ListRenderItem<FollowListUser> = useCallback(
    ({ item }) => (
      <UserListItem
        user={item}
        isSelf={identity?.userId === item._id || identity?.username.toLowerCase() === item.username.toLowerCase()}
        pending={pendingId === item._id}
        onPress={(u) => router.push(`/u/${u.username}`)}
        onToggleFollow={onToggleFollow}
      />
    ),
    [identity, pendingId, router, onToggleFollow],
  );

  if (list.isLoading) return <ScreenStatus kind="loading" />;
  if (list.notFound) {
    return <ScreenStatus kind="message" title="This profile doesn't exist." onBack={goBack} />;
  }
  if (list.isError && !list.profile) {
    return (
      <ScreenStatus
        kind="message"
        title="Couldn't load this list."
        message={list.error instanceof Error ? list.error.message : undefined}
        onRetry={() => void list.refetch()}
        onBack={goBack}
      />
    );
  }

  const total = kind === 'followers' ? list.profile?.stats.followerCount : list.profile?.stats.followingCount;

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View
        style={{ paddingTop: insets.top }}
        className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black"
      >
        <View className="h-14 w-full max-w-md flex-row items-center self-center px-2">
          <Pressable
            onPress={goBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-10 w-10 items-center justify-center active:opacity-60"
          >
            <Text style={{ color: colors.text, fontSize: 30, lineHeight: 34 }}>‹</Text>
          </Pressable>
          <Text
            accessibilityRole="header"
            className="flex-1 text-center text-[17px] font-bold text-neutral-900 dark:text-neutral-100"
          >
            {TITLE[kind]}
          </Text>
          <Text
            style={{ fontVariant: ['tabular-nums'] }}
            className="w-12 pr-2 text-right text-[13px] text-neutral-500 dark:text-neutral-400"
          >
            {total !== undefined ? formatCount(total) : ''}
          </Text>
        </View>
      </View>

      <View className="w-full max-w-md flex-1 self-center">
        <FlatList
          data={list.users}
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
          ListEmptyComponent={
            <View className="items-center px-8 py-20">
              <Text className="text-center text-[15px] leading-6 text-neutral-600 dark:text-neutral-400">
                {kind === 'followers'
                  ? `@${username} has no followers yet.`
                  : `@${username} isn't following anyone yet.`}
              </Text>
            </View>
          }
          ListFooterComponent={
            list.isFetchingNextPage ? (
              <View className="py-6">
                <ActivityIndicator color={colors.textMuted} />
              </View>
            ) : undefined
          }
          contentContainerStyle={list.users.length === 0 ? { flexGrow: 1 } : { paddingBottom: insets.bottom + 16 }}
          initialNumToRender={12}
          windowSize={9}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}
