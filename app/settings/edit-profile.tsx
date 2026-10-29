import { useRouter } from 'expo-router';

import { EditProfileScreen } from '../../src/features/profile/screens/EditProfileScreen';

export default function EditProfileRoute() {
  const router = useRouter();
  return <EditProfileScreen onDone={() => router.canGoBack() ? router.back() : router.replace('/profile')} />;
}
