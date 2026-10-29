import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../../shared/hooks/useTheme';
import { Field } from '../../auth/components/auth/Field';
import { ScreenStatus } from '../components/ScreenStatus';
import { MonogramAvatar } from '../../../shared/components/MonogramAvatar';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useCurrentUserProfile } from '../hooks/useUserProfile';
import { BIO_MAX_LENGTH, NAME_MAX_LENGTH } from '../types/profile.types';

type EditProfileScreenProps = {
  /** Called on cancel and after a successful save. */
  onDone: () => void;
};

export function EditProfileScreen({ onDone }: EditProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme('app');
  const { profile, isLoading, isError, error, refetch } = useCurrentUserProfile();
  const update = useUpdateProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [ready, setReady] = useState(false);

  // Seed the form once, when the profile first arrives (not on every background refetch).
  useEffect(() => {
    if (profile && !ready) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setBio(profile.bio);
      setReady(true);
    }
  }, [profile, ready]);

  const errors = useMemo(
    () => ({
      firstName: !firstName.trim() ? 'First name is required.' : undefined,
      lastName: undefined,
      bio: bio.length > BIO_MAX_LENGTH ? `Bio must be ${BIO_MAX_LENGTH} characters or fewer.` : undefined,
    }),
    [firstName, bio],
  );

  const dirty =
    !!profile &&
    (firstName.trim() !== profile.firstName ||
      lastName.trim() !== profile.lastName ||
      bio.trim() !== profile.bio ||
      avatar !== null);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setAvatar(result.assets[0]);
  };

  const save = () => {
    setAttempted(true);
    if (!profile || errors.firstName || errors.bio || update.isPending) return;
    update.mutate({ username: profile.username, firstName, lastName, bio, avatar }, { onSuccess: onDone });
  };

  if (isLoading || (profile && !ready)) return <ScreenStatus kind="loading" />;
  if (isError || !profile) {
    return (
      <ScreenStatus
        kind="message"
        title="Couldn't load your profile."
        message={error?.message}
        onRetry={() => void refetch()}
        onBack={onDone}
      />
    );
  }

  const canSave = dirty && !update.isPending;

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View
        style={{ paddingTop: insets.top }}
        className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black"
      >
        <View className="h-14 w-full max-w-md flex-row items-center justify-between self-center px-4">
          <Pressable onPress={onDone} hitSlop={8} accessibilityRole="button" className="active:opacity-60">
            <Text className="text-[16px] text-neutral-900 dark:text-neutral-100">Cancel</Text>
          </Pressable>
          <Text accessibilityRole="header" className="text-[17px] font-bold text-neutral-900 dark:text-neutral-100">
            Edit profile
          </Text>
          <Pressable
            onPress={save}
            disabled={!canSave}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave, busy: update.isPending }}
            className="active:opacity-60"
          >
            <Text
              style={{ opacity: canSave ? 1 : 0.4 }}
              className="text-[16px] font-bold text-neutral-900 dark:text-neutral-100"
            >
              {update.isPending ? 'Saving…' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ alignItems: 'center', paddingBottom: insets.bottom + 32 }}
        >
          <View className="w-full max-w-md gap-5 px-6 pt-6">
            <Pressable
              onPress={pickAvatar}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              className="items-center gap-2 active:opacity-70"
            >
              <MonogramAvatar
                username={profile.username}
                displayName={`${firstName} ${lastName}`}
                avatarUrl={avatar?.uri ?? profile.avatarUrl}
                size={96}
              />
              <Text style={{ color: colors.text }} className="text-[14px] font-bold">
                Change photo
              </Text>
            </Pressable>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field
                  label="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                  error={attempted ? errors.firstName : undefined}
                  maxLength={NAME_MAX_LENGTH}
                  autoCapitalize="words"
                  autoComplete="given-name"
                  textContentType="givenName"
                  returnKeyType="next"
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                  maxLength={NAME_MAX_LENGTH}
                  autoCapitalize="words"
                  autoComplete="family-name"
                  textContentType="familyName"
                  returnKeyType="next"
                />
              </View>
            </View>

            <Field
              label="Bio"
              value={bio}
              onChangeText={setBio}
              error={errors.bio}
              multiline
              maxLength={BIO_MAX_LENGTH}
              autoCapitalize="sentences"
              counter={`${bio.length}/${BIO_MAX_LENGTH}`}
            />

            {update.isError ? (
              <Text accessibilityRole="alert" style={{ color: '#B91C1C' }} className="text-[14px]">
                {update.error.message}
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
