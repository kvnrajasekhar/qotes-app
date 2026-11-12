import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, Search } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, Image, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLogout } from '../../auth';
import { useCurrentUserProfile } from '../../profile';
import { MonogramAvatar } from '../../../shared/components/MonogramAvatar';
import { useTheme } from '../../../shared/hooks/useTheme';
import { fonts } from '../../../shared/tokens/typography';
import { CategoryEmptyState } from '../components/CategoryEmptyState';
import { CategoryPills } from '../components/CategoryPills';
import { FeedEmptyState } from '../components/FeedEmptyState';
import { FloatingComposeButton } from '../components/FloatingComposeButton';
import { ProfileDrawer } from '../components/ProfileDrawer';
import { QuoteFeedList } from '../components/QuoteFeedList';
import { FeedApiError } from '../api/feedApi';
import { useInfiniteFeed } from '../hooks/useInfiniteFeed';
import { useQuoteInteractions } from '../hooks/useQuoteInteractions';
import type { FeedCategory } from '../types/feed.types';

export type GlobalFeedScreenProps = {
  /** Defaults to router.push('/compose'). */
  onCompose?: () => void;
  onPressSearch?: () => void;
  /** Defaults to navigating to the notifications tab. */
  onPressNotifications?: () => void;
};

export function GlobalFeedScreen({ onCompose, onPressSearch, onPressNotifications }: GlobalFeedScreenProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme('app');
  const [category, setCategory] = useState<FeedCategory>('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const feed = useInfiniteFeed({ type: 'global', category });
  const interactions = useQuoteInteractions();
  const { profile, signedOut } = useCurrentUserProfile();
  const { logout, isLoggingOut } = useLogout();
  const needsSignIn = feed.error instanceof FeedApiError && feed.error.status === 401;

  const handleCompose = useCallback(() => {
    if (onCompose) onCompose();
    else router.push('/compose');
  }, [onCompose, router]);

  const handleNotifications = useCallback(() => {
    if (onPressNotifications) onPressNotifications();
    else router.navigate('/notifications');
  }, [onPressNotifications, router]);

  const handleLogout = useCallback(async () => {
    setIsDrawerOpen(false);
    const result = await logout();
    if (!result.serverLogoutSucceeded) {
      showMessage(
        'Signed out on this device.',
        'The server could not end your session. It may remain active until it expires.',
      );
    }
    if (result.localCleanupError) {
      showMessage(
        'Could not clear saved credentials.',
        'You are signed out in this app, but stored credentials could not be removed.',
      );
    }
  }, [logout]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className="w-full max-w-md flex-1 self-center">
        <View className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
          <View className="h-14 flex-row items-center justify-between px-4">
            <Pressable
              onPress={() => setIsDrawerOpen(true)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Open navigation menu"
              className="h-11 w-11 items-center justify-center active:opacity-70"
            >
              <MonogramAvatar
                username={profile?.username ?? 'qotes'}
                displayName={profile?.displayName}
                avatarUrl={profile?.avatarUrl}
                size={34}
              />
            </Pressable>
            <View
              pointerEvents="none"
              className="absolute inset-x-0 flex-row items-center justify-center gap-1"
            >
              <Image
                source={require('../../../assets/images/qotes-logo-main.png')}
                resizeMode="contain"
                accessible={false}
                className="h-8 w-8"
              />
              {/* <Text
                accessibilityRole="header"
                style={{ fontFamily: fonts.serifBold, fontWeight: '700' }}
                className="text-[20px] tracking-tight text-neutral-900 dark:text-neutral-100"
              >
                Qotes
              </Text> */}
            </View>
            <View className="flex-row items-center gap-1">
              <Pressable
                onPress={onPressSearch}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Search"
                className="h-10 w-10 items-center justify-center active:opacity-60"
              >
                <Search size={22} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={handleNotifications}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                className="h-10 w-10 items-center justify-center active:opacity-60"
              >
                <Bell size={22} color={colors.text} />
              </Pressable>
            </View>
          </View>
          <CategoryPills value={category} onChange={setCategory} />
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
                onWrite={handleCompose}
                errorMessage={
                  needsSignIn
                    ? 'Sign in to load the global feed.'
                    : feed.isError
                      ? (feed.error instanceof Error ? feed.error.message : 'Could not reach the server.')
                      : undefined
                }
                onRetry={feed.isError && !needsSignIn ? () => void feed.refetch() : undefined}
                onSignIn={needsSignIn ? () => router.push('/auth') : undefined}
              />
            )
          }
        />

        <FloatingComposeButton onPress={handleCompose} />
      </View>
      <ProfileDrawer
        open={isDrawerOpen}
        profile={profile}
        isSignedOut={signedOut}
        isLoggingOut={isLoggingOut}
        onClose={() => setIsDrawerOpen(false)}
        onNavigateProfile={() => router.push('/(tabs)/profile')}
        onNavigateBookmarks={() => router.push('/collections')}
        onNavigateSettings={() => router.push('/settings')}
        onNavigateFollowers={() => {
          if (profile) router.push(`/u/${profile.username}/followers`);
        }}
        onNavigateFollowing={() => {
          if (profile) router.push(`/u/${profile.username}/following`);
        }}
        onNavigateSignIn={() => router.push('/auth')}
        onNavigateSignUp={() => router.push('/auth?mode=signup')}
        onLogout={() => void handleLogout()}
      />
      {interactions.sheets}
    </SafeAreaView>
  );
}

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
