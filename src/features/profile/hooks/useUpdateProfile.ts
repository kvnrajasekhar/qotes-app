import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiRequestError } from '../../../core/api/client';
import { userApiV1 } from '../../../core/api/v1/user.api';
import type { UpdateProfileInput, UserProfile } from '../types/profile.types';
import { profileKeys } from './profileKeys';

type Variables = UpdateProfileInput & { username: string };

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, ApiRequestError, Variables>({
    mutationFn: async ({ username, avatar, firstName, lastName, bio }) => {
      await userApiV1.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim(), bio: bio.trim() });
      if (avatar) await userApiV1.uploadAvatar(avatar);
      // Re-read so the cache holds exactly what the server stored (including the new avatar URL).
      return userApiV1.getProfile(username);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.user(profile.username), profile);
      // Rows and cards elsewhere embed this user's name/avatar.
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      void queryClient.invalidateQueries({ queryKey: ['profile', 'quotes'] });
      void queryClient.invalidateQueries({ queryKey: profileKeys.followLists });
    },
  });
}
