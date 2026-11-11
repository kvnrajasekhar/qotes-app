import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '../features/auth/auth/AuthProvider';
import { GlobalErrorToast } from '../shared/components/GlobalErrorToast';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthGate />
          <GlobalErrorToast />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function AuthGate() {
  const { token, isReady } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isReady) void SplashScreen.hideAsync();
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;

    const currentSegment = segments[0] as string | undefined;
    const childSegment = segments[1] as string | undefined;
    // Login lives at /auth; recovery screens live in the (auth) route group.
    const inAuthFlow = currentSegment === 'auth' || currentSegment === '(auth)';
    const guestFeedOrProfile =
      currentSegment === '(tabs)' &&
      (childSegment === undefined || childSegment === 'index' || childSegment === 'profile');
    const publicQuoteDetail = currentSegment === 'quote' && segments.length === 2;
    const publicUserProfile = currentSegment === 'u' && segments.length === 2;

    if (!token) {
      const guestAccessible = inAuthFlow || guestFeedOrProfile || publicQuoteDetail || publicUserProfile;
      if (!guestAccessible) {
        router.replace(!currentSegment || currentSegment === 'index' ? '/(tabs)' : '/auth');
      }
    } else if (inAuthFlow || !currentSegment) {
      router.replace('/(tabs)');
    }
  }, [isReady, token, segments, router]);

  if (!isReady) return null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="compose" options={{ presentation: 'modal' }} />
      <Stack.Screen name="requote/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
