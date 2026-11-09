import { useLocalSearchParams } from 'expo-router';

import { QuoteDetailScreen } from '../../src/features/feed/screens/QuoteDetailScreen';

export default function QuoteDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <QuoteDetailScreen id={id} />;
}
