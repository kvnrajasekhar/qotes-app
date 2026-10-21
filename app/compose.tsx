import { useRouter } from 'expo-router';

import { PlaceholderScreen } from '../src/shared/components/PlaceholderScreen';

export default function ComposeRoute() {
  const router = useRouter();
  return (
    <PlaceholderScreen
      title="Write a quote"
      description="The composer is coming soon: 500 characters, an author, and a category."
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    />
  );
}
