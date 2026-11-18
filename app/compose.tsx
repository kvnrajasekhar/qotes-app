import { useLocalSearchParams, useRouter } from 'expo-router';

import { ComposeModalScreen } from '../src/features/compose/screens/ComposeModalScreen';

export default function ComposeRoute() {
  const router = useRouter();
  const { mode, quoteId } = useLocalSearchParams<{ mode?: string; quoteId?: string }>();
  return (
    <ComposeModalScreen
      mode={mode === 'edit' ? 'edit' : 'create'}
      quoteId={quoteId}
      onDone={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
    />
  );
}
