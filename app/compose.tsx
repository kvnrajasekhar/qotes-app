import { useRouter } from 'expo-router';

import { ComposeModalScreen } from '../src/features/compose/screens/ComposeModalScreen';

export default function ComposeRoute() {
  const router = useRouter();
  return <ComposeModalScreen onDone={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} />;
}
