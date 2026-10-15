// app/_layout.tsx
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../src/features/auth/auth/AuthProvider";
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </QueryClientProvider>
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
    // Login lives at /auth; recovery screens live in the (auth) route group.
    const inAuthFlow = currentSegment === "auth" || currentSegment === "(auth)";

    if (!token) {
      if (!inAuthFlow) {
        router.replace("/auth");
      }
    } else if (inAuthFlow || !currentSegment) {
      router.replace("/(tabs)");
    }
  }, [isReady, token, segments, router]);

  if (!isReady) return null;
  return <Slot />;
}
