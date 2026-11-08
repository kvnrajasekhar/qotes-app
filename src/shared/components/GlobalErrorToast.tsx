import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '../hooks/useTheme';
import { useGlobalErrorToastStore } from '../stores/global-error-toast.store';

const TOAST_DURATION_MS = 4000;

export function GlobalErrorToast() {
  const error = useGlobalErrorToastStore((state) => state.error);
  const dismissError = useGlobalErrorToastStore((state) => state.dismissError);
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const currentSegment = segments[0];
  const inAuthFlow = currentSegment === 'auth' || currentSegment === '(auth)';
  const inTabs = currentSegment === '(tabs)';
  const { colors } = useThemeColors(inAuthFlow ? 'auth' : 'app');

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => dismissError(error.id), TOAST_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [error, dismissError]);

  if (!error) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { bottom: insets.bottom + (inTabs ? 72 : 16) }]}
    >
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        style={[styles.toast, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text style={[styles.message, { color: colors.danger }]}>{error.message}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss error message"
          onPress={() => dismissError(error.id)}
          style={styles.dismiss}
          hitSlop={8}
        >
          <X size={18} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 60,
  },
  toast: {
    width: '100%',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 4,
  },
  message: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  dismiss: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
