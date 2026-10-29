import { FollowListView } from '../components/FollowListView';

/** V14 */
export function FollowingScreen({ username }: { username: string | undefined }) {
  return <FollowListView username={username} kind="following" />;
}
