import { useLocalSearchParams, useRouter } from 'expo-router';

import { RequoteWithThoughtsModal } from '../../src/features/compose/screens/RequoteWithThoughtsModal';

export default function RequoteRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return <RequoteWithThoughtsModal id={id} onDone={() => (router.canGoBack() ? router.back() : router.replace('/'))} />;
}
