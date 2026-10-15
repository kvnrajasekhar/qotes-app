import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';

type NoticeCardProps = {
  title: string;
  children: ReactNode;
  tone?: 'neutral' | 'error';
};

export function NoticeCard({ title, children, tone = 'neutral' }: NoticeCardProps) {
  const { colors } = useTheme('auth');
  return (
    <View
      accessibilityRole="alert"
      style={{
        backgroundColor: colors.surface,
        borderColor: tone === 'error' ? colors.danger : 'transparent',
        borderWidth: tone === 'error' ? 1 : 0,
      }}
      className="gap-1 rounded-xl p-4"
    >
      <Text style={{ color: colors.text }} className="text-[16px] font-bold">
        {title}
      </Text>
      {typeof children === 'string' ? (
        <Text style={{ color: colors.text }} className="text-[14px] leading-5">
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
