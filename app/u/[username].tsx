import { useLocalSearchParams } from 'expo-router';

import { PublicUserProfileScreen } from '../../src/features/profile/screens/PublicUserProfileScreen';

export default function PublicProfileRoute() {
  const { username } = useLocalSearchParams<{ username: string }>();
  return <PublicUserProfileScreen username={username} />;
}
