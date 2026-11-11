import { memo, useState } from 'react';
import { Image, Text, View } from 'react-native';

type MonogramAvatarProps = {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  size?: number;
};

/** Photo when available, otherwise the first letter on a neutral circle. */
function MonogramAvatarBase({ username, displayName, avatarUrl, size = 40 }: MonogramAvatarProps) {
  const [failed, setFailed] = useState(false);
  const letter = ((displayName || username).trim()[0] ?? '?').toUpperCase();
  const box = { width: size, height: size, borderRadius: size / 2 };

  if (avatarUrl && !failed) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
        style={box}
        className="bg-neutral-200 dark:bg-neutral-800"
      />
    );
  }
  return (
    <View style={box} className="items-center justify-center bg-neutral-200 dark:bg-neutral-800">
      <Text style={{ fontSize: size * 0.4 }} className="font-semibold text-neutral-700 dark:text-neutral-300">
        {letter}
      </Text>
    </View>
  );
}

export const MonogramAvatar = memo(MonogramAvatarBase);
