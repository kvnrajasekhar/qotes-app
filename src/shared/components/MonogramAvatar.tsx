import { useState } from 'react';
import { Image, Text, View } from 'react-native';

type MonogramAvatarProps = {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  size?: number;
};

export function MonogramAvatar({ username, displayName, avatarUrl, size = 44 }: MonogramAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const label = (displayName?.trim() || username).trim();
  const initials = label.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
  const showImage = Boolean(avatarUrl && avatarUrl !== failedUrl);

  if (showImage) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        onError={() => setFailedUrl(avatarUrl)}
        accessibilityLabel={`${label}'s profile photo`}
        accessibilityIgnoresInvertColors
        style={{ width: size, height: size }}
        className="rounded-full bg-neutral-200 dark:bg-neutral-800"
      />
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={`${label} profile initials`}
      style={{ width: size, height: size }}
      className="items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800"
    >
      <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-300">{initials}</Text>
    </View>
  );
}
