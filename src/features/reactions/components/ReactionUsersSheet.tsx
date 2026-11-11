import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View, type ListRenderItem } from 'react-native';

import { BottomSheet } from '../../../shared/components/BottomSheet';
import { MonogramAvatar } from '../../../shared/components/MonogramAvatar';
import { useThemeColors } from '../../../shared/hooks/useTheme';
import { formatRelativeTime } from '../../../shared/utils/date-formatter';
import { REACTION_TYPES, type ReactionCounts } from '../../feed/types/feed.types';
import { formatCount } from '../../feed/utils/format';
import { EMOTION_BY_TYPE, EMOTION_MATRIX } from '../constants/emotionMatrix';
import { useReactionUsers } from '../hooks/useReactionUsers';
import type { ReactionFilter, ReactionUser } from '../types/reaction.types';

type ReactionUsersSheetProps = {
  /** Open when set, closed when null. */
  quoteId: string | null;
  /** Live counts, used for the filter pills. */
  reactions: ReactionCounts;
  onClose: () => void;
};

const keyExtractor = (u: ReactionUser) => u.id;

/** V09: who reacted, filterable by emotion. */
export function ReactionUsersSheet({ quoteId, reactions, onClose }: ReactionUsersSheetProps) {
  const router = useRouter();
  const { colors, isDark } = useThemeColors('app');
  const [filter, setFilter] = useState<ReactionFilter>('all');
  const open = quoteId !== null;
  const list = useReactionUsers(quoteId, filter, open);

  useEffect(() => {
    if (!open) setFilter('all');
  }, [open]);

  const total = REACTION_TYPES.reduce((sum, t) => sum + (reactions[t] ?? 0), 0);
  const pills = useMemo(
    () => [
      { key: 'all' as ReactionFilter, label: `All ${formatCount(total)}` },
      ...EMOTION_MATRIX.filter((e) => (reactions[e.type] ?? 0) > 0).map((e) => ({
        key: e.type as ReactionFilter,
        label: `${e.label} ${formatCount(reactions[e.type] ?? 0)}`,
      })),
    ],
    [reactions, total],
  );

  const openProfile = (username: string) => {
    onClose();
    router.push(`/u/${username}`);
  };

  const renderItem: ListRenderItem<ReactionUser> = ({ item }) => {
    const meta = EMOTION_BY_TYPE[item.type];
    const tint = isDark ? meta.accent.dark : meta.accent.light;
    const time = formatRelativeTime(item.createdAt);
    return (
      <Pressable
        onPress={() => openProfile(item.username)}
        accessibilityRole="button"
        accessibilityLabel={`@${item.username} reacted ${meta.label}`}
        className="flex-row items-center gap-3 border-b border-neutral-200 px-5 py-3 active:bg-neutral-100 dark:border-neutral-800 dark:active:bg-neutral-900"
      >
        <MonogramAvatar username={item.username} avatarUrl={item.avatarUrl} size={44} />
        <View className="flex-1">
          <Text numberOfLines={1} className="text-[15px] font-bold text-neutral-900 dark:text-neutral-100">
            @{item.username}
          </Text>
          {time ? <Text className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-400">{time}</Text> : null}
        </View>
        <meta.Icon size={18} color={tint} strokeWidth={2} />
        <Text style={{ color: tint }} className="min-w-[84px] text-right text-[13px] font-bold">
          {meta.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <BottomSheet visible={open} onClose={onClose} heightRatio={0.72} accessibilityLabel="Reactions">
      <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
        <Text accessibilityRole="header" className="text-[18px] font-bold text-neutral-900 dark:text-neutral-100">
          Reactions
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="h-9 w-9 items-center justify-center active:opacity-60"
        >
          <X size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        className="grow-0"
        contentContainerClassName="gap-2 px-5 pb-3"
        accessibilityRole="tablist"
      >
        {pills.map((pill) => {
          const selected = pill.key === filter;
          return (
            <Pressable
              key={pill.key}
              onPress={() => setFilter(pill.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className={`rounded-full px-4 py-2 active:opacity-80 ${
                selected ? 'bg-black dark:bg-white' : 'bg-neutral-100 dark:bg-neutral-900'
              }`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  selected ? 'text-white dark:text-black' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {pill.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={list.users}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={() => {
          if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          list.isLoading ? (
            <View className="py-12">
              <ActivityIndicator color={colors.textMuted} />
            </View>
          ) : (
            <View className="items-center px-8 py-12">
              <Text className="text-center text-[14px] text-neutral-500 dark:text-neutral-400">
                {list.isError
                  ? (list.error instanceof Error ? list.error.message : 'Could not load reactions.')
                  : 'No reactions here yet.'}
              </Text>
              {list.isError ? (
                <Text onPress={() => void list.refetch()} className="mt-3 text-[14px] font-bold text-neutral-900 underline dark:text-neutral-100">
                  Try again
                </Text>
              ) : null}
            </View>
          )
        }
        ListFooterComponent={
          list.isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator color={colors.textMuted} />
            </View>
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
      />
    </BottomSheet>
  );
}
