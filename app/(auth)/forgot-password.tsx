import { useRouter } from 'expo-router';

import { ForgotPasswordScreen } from '../../src/features/auth/screens/ForgotPasswordScreen';

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const toLogin = () => router.replace('/auth');

  return (
    <ForgotPasswordScreen
      onBack={() => (router.canGoBack() ? router.back() : toLogin())}
      onBackToLogin={toLogin}
    />
  );
}
