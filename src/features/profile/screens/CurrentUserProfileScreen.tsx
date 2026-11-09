import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Pressable, Text } from 'react-native';

import { useAuth } from '../../auth/auth/AuthProvider';
import { clearPersistentCache } from '../../../shared/lib/storage';
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
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const { profile, isLoading, isError, error, signedOut, refetch } = useCurrentUserProfile();

  const goToSignIn = async () => {
    try {
      await signOut();
    } catch (signOutError) {
      console.error('Could not clear the expired session before sign-in.', signOutError);
    }
    queryClient.clear();
    try {
      clearPersistentCache();
    } catch (cacheError) {
      console.error('Could not clear the persisted cache before sign-in.', cacheError);
    }
    router.replace('/auth');
  };

  if (isLoading) return <ScreenStatus kind="loading" />;
  if (signedOut) {
    return (
      <ScreenStatus
        kind="message"
        title="Your profile is waiting."
        message="Sign in or create an account to see your profile."
        retryLabel="Sign in / create account"
        onRetry={() => void goToSignIn()}
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
