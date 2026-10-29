import { FollowListView } from '../components/FollowListView';

/** V13 */
export function FollowersScreen({ username }: { username: string | undefined }) {
  return <FollowListView username={username} kind="followers" />;
}
