// app/_layout.tsx
import { useEffect, useState } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/features/auth/auth/AuthProvider";
import { authStorage } from "../src/shared/lib/storage";
import "../global.css";

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
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

useEffect(() => {
  async function prepare() {
    try {
      const [tokens] = await Promise.all([
        authStorage.getTokens(),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
      setIsAuthenticated(!!tokens?.accessToken);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsReady(true);
      await SplashScreen.hideAsync();
    }
  }
  prepare();
}, []);

  useEffect(() => {
    if (!isReady || isAuthenticated === null) return;

    const currentSegment = segments[0] as string | undefined;

    if (!isAuthenticated) {
      // If not logged in and not already on auth, send to auth
      if (currentSegment !== "auth") {
        router.replace("/auth");
      }
    } else {
      // If logged in and on auth or index, send to tabs/feed
      if (currentSegment === "auth" || !currentSegment) {
        router.replace("/(tabs)/feed");
      }
    }
  }, [isReady, isAuthenticated, segments]);

  if (!isReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </QueryClientProvider>
  );
}