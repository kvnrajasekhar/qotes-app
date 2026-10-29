import { useLocalSearchParams } from 'expo-router';

import { FollowersScreen } from '../../../src/features/profile/screens/FollowersScreen';

export default function FollowersRoute() {
  const { username } = useLocalSearchParams<{ username: string }>();
  return <FollowersScreen username={username} />;
}
