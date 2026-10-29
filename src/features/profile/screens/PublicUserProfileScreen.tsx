import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Alert, Pressable, Text } from 'react-native';

import { FollowButton, type FollowState } from '../components/FollowButton';
import { ProfileContent } from '../components/ProfileContent';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileTopBar } from '../components/ProfileTopBar';
import { ScreenStatus } from '../components/ScreenStatus';
import { useFollowToggle } from '../hooks/useFollowToggle';
import { useUserProfile } from '../hooks/useUserProfile';
import type { ProfileTabKey, ViewerProfile } from '../types/profile.types';

const PUBLIC_TABS: readonly ProfileTabKey[] = ['quotes'];

export type PublicUserProfileScreenProps = {
  username: string | undefined;
  /** Wire these to the safety endpoints; until then the menu explains they're unavailable. */
  onReport?: (profile: ViewerProfile) => void;
  onBlock?: (profile: ViewerProfile) => void;
};

function followStateOf(profile: ViewerProfile): FollowState {
  if (profile.isFollowing) return 'following';
  return profile.followsYou ? 'follow-back' : 'follow';
}

/** V12: another user's profile. */
export function PublicUserProfileScreen({ username, onReport, onBlock }: PublicUserProfileScreenProps) {
  const router = useRouter();
  const { profile, isLoading, isError, error, notFound, refetch } = useUserProfile(username);
  const toggle = useFollowToggle();

  const goBack = useCallback(() => (router.canGoBack() ? router.back() : router.replace('/')), [router]);
  useEffect(() => {
    if (profile?.isSelf) router.replace('/profile');
  }, [profile?.isSelf, router]);

  const openMenu = useCallback(
    (target: ViewerProfile) => {
      const unavailable = () => Alert.alert('Not available yet', 'This action will be available soon.');
      Alert.alert(`@${target.username}`, undefined, [
        { text: 'Report', onPress: () => (onReport ? onReport(target) : unavailable()) },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => (onBlock ? onBlock(target) : unavailable()),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [onReport, onBlock],
  );

  if (isLoading) return <ScreenStatus kind="loading" />;
  if (notFound) {
    return (
      <ScreenStatus
        kind="message"
        title="This profile doesn't exist."
        message={`We couldn't find @${username}.`}
        onBack={goBack}
      />
    );
  }
  if (isError || !profile) {
    return (
      <ScreenStatus
        kind="message"
        title="Couldn't load this profile."
        message={error?.message}
        onRetry={() => void refetch()}
        onBack={goBack}
      />
    );
  }

  const action = profile.isSelf ? (
    <Pressable
      onPress={() => router.push('/settings/edit-profile')}
      accessibilityRole="button"
      accessibilityLabel="Edit profile"
      className="h-10 items-center justify-center rounded-full border border-neutral-900 px-5 active:opacity-70 dark:border-neutral-100"
    >
      <Text className="text-[14px] font-bold text-neutral-900 dark:text-neutral-100">Edit profile</Text>
    </Pressable>
  ) : (
    <FollowButton
      state={followStateOf(profile)}
      accessibilityName={`@${profile.username}`}
      loading={toggle.isPending}
      onPress={() => toggle.mutate({ user: profile, follow: !profile.isFollowing })}
    />
  );

  return (
    <ProfileContent
      profile={profile}
      tabs={PUBLIC_TABS}
      onRefreshProfile={refetch}
      top={
        <ProfileTopBar
          title={profile.displayName}
          onBack={goBack}
          onMore={profile.isSelf ? undefined : () => openMenu(profile)}
        />
      }
      header={
        <ProfileHeader
          profile={profile}
          badge={!profile.isSelf && profile.followsYou ? 'Follows you' : undefined}
          action={action}
          onPressFollowers={() => router.push(`/u/${profile.username}/followers`)}
          onPressFollowing={() => router.push(`/u/${profile.username}/following`)}
        />
      }
    />
  );
}
