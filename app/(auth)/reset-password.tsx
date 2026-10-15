import { useLocalSearchParams, useRouter } from 'expo-router';

import { ResetPasswordScreen } from '../../src/features/auth/screens/ResetPasswordScreen';

// Deep link shape: qotes://reset-password?userId=<id>&token=<jwt>
export default function ResetPasswordRoute() {
  const router = useRouter();
  const { userId, token } = useLocalSearchParams<{ userId?: string; token?: string }>();

  return (
    <ResetPasswordScreen
      userId={userId}
      token={token}
      onSuccess={() => router.replace('/auth')}
      onRequestNewLink={() => router.replace('/forgot-password')}
    />
  );
}
