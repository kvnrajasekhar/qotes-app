import { Pressable, Text } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';

type PasswordToggleProps = { visible: boolean; onToggle: () => void };

export function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  const { colors } = useTheme('auth');
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={visible ? 'Hide password' : 'Show password'}
      className="px-2 py-1 active:opacity-70"
    >
      <Text style={{ color: colors.text }} className="text-[13px] font-semibold">
        {visible ? 'Hide' : 'Show'}
      </Text>
    </Pressable>
  );
}
