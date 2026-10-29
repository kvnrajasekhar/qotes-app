import { Calendar } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import { fonts } from '../../../shared/tokens/typography';
import { MonogramAvatar } from '../../../shared/components/MonogramAvatar';
import { formatCount } from '../../feed/utils/format';
import type { UserProfile } from '../types/profile.types';

type ProfileHeaderProps = {
  profile: UserProfile;
  /** Right-aligned action: "Edit profile" or the follow button. */
  action: ReactNode;
  /** Shown next to the handle, e.g. "Follows you". */
  badge?: string;
  onPressFollowers: () => void;
  onPressFollowing: () => void;
};

function Metric({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) {
  const content = (
    <Text className="text-[14px] text-neutral-600 dark:text-neutral-400">
      <Text style={{ fontVariant: ['tabular-nums'] }} className="font-bold text-neutral-900 dark:text-neutral-100">
        {formatCount(value)}
      </Text>
      {` ${label}`}
    </Text>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`${formatCount(value)} ${label}`}
      className="active:opacity-60"
    >
      {content}
    </Pressable>
  );
}

function formatJoined(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `Joined ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

export function ProfileHeader({ profile, action, badge, onPressFollowers, onPressFollowing }: ProfileHeaderProps) {
  const { colors } = useThemeColors('app');
  const joined = formatJoined(profile.joinedAt);

  return (
    <View>
      {/* Continues the fixed top bar; the avatar overlaps its lower edge. */}
      <View className="h-12 bg-neutral-900 dark:bg-neutral-800" />

      <View className="px-4 pb-4">
        <View className="-mt-10 flex-row items-end justify-between">
          <View className="rounded-full border-4 border-white bg-white dark:border-black dark:bg-black">
            <MonogramAvatar
              username={profile.username}
              displayName={profile.displayName}
              avatarUrl={profile.avatarUrl}
              size={80}
            />
          </View>
          <View className="pb-1">{action}</View>
        </View>

        <Text
          numberOfLines={2}
          style={{ fontFamily: fonts.serifBold, fontWeight: '700' }}
          className="mt-3 text-[24px] text-neutral-900 dark:text-neutral-100"
        >
          {profile.displayName}
        </Text>

        <View className="mt-0.5 flex-row items-center gap-2">
          <Text className="text-[14px] text-neutral-500 dark:text-neutral-400">@{profile.username}</Text>
          {badge ? (
            <View className="rounded-md bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-900">
              <Text className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">{badge}</Text>
            </View>
          ) : null}
        </View>

        {profile.bio ? (
          <Text className="mt-3 text-[15px] leading-6 text-neutral-900 dark:text-neutral-100">{profile.bio}</Text>
        ) : null}

        {joined ? (
          <View className="mt-3 flex-row items-center gap-1.5">
            <Calendar size={14} color={colors.textMuted} />
            <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">{joined}</Text>
          </View>
        ) : null}

        <View className="mt-3 flex-row flex-wrap items-center gap-x-4 gap-y-1">
          <Metric value={profile.stats.quoteCount} label="Quotes" />
          <Metric value={profile.stats.followerCount} label="Followers" onPress={onPressFollowers} />
          <Metric value={profile.stats.followingCount} label="Following" onPress={onPressFollowing} />
        </View>
      </View>
    </View>
  );
}
