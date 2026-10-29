import { useLocalSearchParams } from 'expo-router';

import { FollowingScreen } from '../../../src/features/profile/screens/FollowingScreen';

export default function FollowingRoute() {
  const { username } = useLocalSearchParams<{ username: string }>();
  return <FollowingScreen username={username} />;
}
