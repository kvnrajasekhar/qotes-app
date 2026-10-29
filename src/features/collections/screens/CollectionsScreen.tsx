import { useRouter } from 'expo-router';

import { PlaceholderScreen } from '../../../shared/components/PlaceholderScreen';

export function CollectionsScreen() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="Bookmarks"
      description="Saved quotes and collections are not available yet."
      onBack={() => router.back()}
    />
  );
}
