import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { ProfileContent } from '../components/ProfileContent';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileTopBar } from '../components/ProfileTopBar';
import { ScreenStatus } from '../components/ScreenStatus';
import { useCurrentUserProfile } from '../hooks/useUserProfile';
import type { ProfileTabKey } from '../types/profile.types';

const OWN_TABS: readonly ProfileTabKey[] = ['quotes', 'saved'];

/** V11: the signed-in user's profile (bottom-tab "Me"). */
export function CurrentUserProfileScreen() {
  const router = useRouter();
  const { profile, isLoading, isError, error, signedOut, refetch } = useCurrentUserProfile();

  if (isLoading) return <ScreenStatus kind="loading" />;
  if (signedOut) {
    return (
      <ScreenStatus
        kind="message"
        title="You're signed out."
        message="Sign in again to see your profile."
        onRetry={() => router.replace('/auth')}
      />
    );
  }
  if (isError || !profile) {
    return (
      <ScreenStatus
        kind="message"
        title="Couldn't load your profile."
        message={error?.message}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <ProfileContent
      profile={profile}
      tabs={OWN_TABS}
      onRefreshProfile={refetch}
      top={<ProfileTopBar title={profile.displayName} />}
      header={
        <ProfileHeader
          profile={profile}
          onPressFollowers={() => router.push(`/u/${profile.username}/followers`)}
          onPressFollowing={() => router.push(`/u/${profile.username}/following`)}
          action={
            <Pressable
              onPress={() => router.push('/settings/edit-profile')}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              className="h-10 items-center justify-center rounded-full border border-neutral-900 px-5 active:opacity-70 dark:border-neutral-100"
            >
              <Text className="text-[14px] font-bold text-neutral-900 dark:text-neutral-100">Edit profile</Text>
            </Pressable>
          }
        />
      }
    />
  );
}
