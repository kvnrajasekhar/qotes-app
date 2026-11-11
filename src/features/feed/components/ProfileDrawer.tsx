import { Bookmark, LogIn, LogOut, Settings, UserPlus, UserRound } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  Platform,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import { MonogramAvatar } from '../../../shared/components/MonogramAvatar';
import type { UserProfile } from '../../profile';

type ProfileDrawerProps = {
  open: boolean;
  profile?: UserProfile;
  isSignedOut: boolean;
  isLoggingOut: boolean;
  onClose: () => void;
  onNavigateProfile: () => void;
  onNavigateBookmarks: () => void;
  onNavigateSettings: () => void;
  onNavigateFollowers: () => void;
  onNavigateFollowing: () => void;
  onNavigateSignIn: () => void;
  onNavigateSignUp: () => void;
  onLogout: () => void;
};

export function ProfileDrawer({
  open,
  profile,
  isSignedOut,
  isLoggingOut,
  onClose,
  onNavigateProfile,
  onNavigateBookmarks,
  onNavigateSettings,
  onNavigateFollowers,
  onNavigateFollowing,
  onNavigateSignIn,
  onNavigateSignUp,
  onLogout,
}: ProfileDrawerProps) {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors('app');
  const drawerWidth = Math.min(screenWidth * 0.82, 320);
  const [mounted, setMounted] = useState(false);
  const translateX = useRef(new Animated.Value(-drawerWidth)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      if (mounted) return;
      translateX.setValue(-drawerWidth);
      backdropOpacity.setValue(0);
      setMounted(true);
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(translateX, { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        ]).start();
      });
      return;
    }
    if (mounted) {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -drawerWidth, duration: 180, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [backdropOpacity, drawerWidth, mounted, open, translateX]);

  const confirmLogout = () => {
    const title = 'Log out of Qotes?';
    const message = 'You will need to sign in again to access your account.';
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onLogout();
      return;
    }
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: onLogout },
      ],
    );
  };

  const navigate = (action: () => void) => {
    onClose();
    action();
  };

  if (!mounted) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View className="flex-1 flex-row">
        <Animated.View
          pointerEvents="none"
          style={{ opacity: backdropOpacity }}
          className="absolute inset-0 bg-black/50"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close navigation menu"
          onPress={onClose}
          className="absolute inset-0"
        />
        <Animated.View
          style={{ width: drawerWidth, height: '100%', paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16, transform: [{ translateX }] }}
          className="bg-white px-4 dark:bg-black"
          accessibilityViewIsModal
        >
          {!isSignedOut ? (
            <View className="pb-4">
              {profile ? (
                <>
                  <MonogramAvatar
                    username={profile.username}
                    displayName={profile.displayName}
                    avatarUrl={profile.avatarUrl}
                    size={48}
                  />
                  <Text className="mt-3 text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {profile.displayName}
                  </Text>
                  <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">@{profile.username}</Text>
                  <View className="mt-3 flex-row gap-4">
                    <Metric
                      count={profile.stats.followingCount}
                      label="Following"
                      onPress={() => navigate(onNavigateFollowing)}
                    />
                    <Metric
                      count={profile.stats.followerCount}
                      label="Followers"
                      onPress={() => navigate(onNavigateFollowers)}
                    />
                  </View>
                </>
              ) : (
                <Text className="text-base font-bold text-neutral-900 dark:text-neutral-100">Your profile</Text>
              )}
            </View>
          ) : (
            <View className="pb-4">
              <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Welcome to Qotes</Text>
              <Text className="mt-2 text-sm leading-5 text-neutral-600 dark:text-neutral-400">
                Sign in or create an account to save quotes and follow writers.
              </Text>
            </View>
          )}

          <View className="border-t border-neutral-200 pt-2 dark:border-neutral-800">
            {!isSignedOut ? (
              <>
                <NavigationRow
                  label="Profile"
                  icon={<UserRound size={20} color={colors.text} />}
                  onPress={() => navigate(onNavigateProfile)}
                />
                <NavigationRow
                  label="Bookmarks"
                  icon={<Bookmark size={20} color={colors.text} />}
                  onPress={() => navigate(onNavigateBookmarks)}
                />
                <NavigationRow
                  label="Settings"
                  icon={<Settings size={20} color={colors.text} />}
                  onPress={() => navigate(onNavigateSettings)}
                />
              </>
            ) : (
              <>
                <NavigationRow
                  label="Sign in"
                  icon={<LogIn size={20} color={colors.text} />}
                  onPress={() => navigate(onNavigateSignIn)}
                />
                <NavigationRow
                  label="Create account"
                  icon={<UserPlus size={20} color={colors.text} />}
                  onPress={() => navigate(onNavigateSignUp)}
                />
              </>
            )}
          </View>

          {!isSignedOut ? (
            <View className="mt-auto border-t border-neutral-200 pt-2 dark:border-neutral-800">
              <NavigationRow
                label={isLoggingOut ? 'Logging out…' : 'Log Out'}
                icon={<LogOut size={20} color={colors.danger} />}
                labelClassName="text-red-700 dark:text-red-400"
                disabled={isLoggingOut}
                onPress={confirmLogout}
              />
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

function Metric({ count, label, onPress }: { count: number; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${count} ${label}`}
      className="min-h-11 flex-row items-center gap-1"
    >
      <Text className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{count}</Text>
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">{label}</Text>
    </Pressable>
  );
}

function NavigationRow({
  label,
  icon,
  onPress,
  labelClassName = 'text-neutral-900 dark:text-neutral-100',
  disabled = false,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  labelClassName?: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className="h-12 flex-row items-center gap-4 active:opacity-60"
    >
      {icon}
      <Text className={`text-base font-medium ${labelClassName}`}>{label}</Text>
    </Pressable>
  );
}
