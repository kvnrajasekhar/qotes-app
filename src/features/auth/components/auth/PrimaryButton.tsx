import { ActivityIndicator, Pressable, Text } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, loading = false, disabled = false }: PrimaryButtonProps) {
  const { colors } = useTheme('auth');
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={{ backgroundColor: colors.buttonBg, opacity: inactive ? 0.5 : 1 }}
      className="h-[52px] flex-row items-center justify-center gap-2.5 rounded-full active:opacity-85"
    >
      {loading ? <ActivityIndicator color={colors.buttonText} /> : null}
      <Text style={{ color: colors.buttonText }} className="text-[16px] font-bold tracking-tight">
        {label}
      </Text>
    </Pressable>
  );
}
