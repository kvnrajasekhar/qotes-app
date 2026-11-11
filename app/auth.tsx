// app/auth.tsx
import { useLocalSearchParams } from 'expo-router';
import AuthScreen from '../src/features/auth/components/AuthScreen';
import '../global.css';

export default function AuthRoute() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  return <AuthScreen initialMode={mode === 'signup' ? 'signup' : 'signin'} />;
}