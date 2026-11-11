import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type TextInputInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import { EmbeddedQuote } from '../../feed/components/EmbeddedQuote';
import { useQuote } from '../../feed/hooks/useQuote';
import { ScreenStatus } from '../../profile/components/ScreenStatus';
import { useRequote } from '../hooks/useRequote';
import { REQUOTE_COMMENTARY_MAX } from '../types/compose.types';

type RequoteWithThoughtsModalProps = {
  /** Id of the quote being requoted. */
  id: string | undefined;
  onDone: () => void;
};

/** Reflection input on top, read-only citation of the root quote below. */
export function RequoteWithThoughtsModal({ id, onDone }: RequoteWithThoughtsModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors('app');
  const { data: root, isLoading, error, refetch } = useQuote(id);
  const requote = useRequote();
  const [text, setText] = useState('');
  const inputRef = useRef<TextInputInstance>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, [root?._id]);

  if (!root) {
    if (isLoading) return <ScreenStatus kind="loading" />;
    return (
      <ScreenStatus
        kind="message"
        title="Couldn't load this quote."
        message={error?.message}
        onRetry={() => void refetch()}
        onBack={onDone}
      />
    );
  }

  const length = text.length;
  const over = length > REQUOTE_COMMENTARY_MAX;
  const already = root.viewerRequoted === true;
  const canPost = text.trim().length > 0 && !over && !requote.isPending && !already;

  const post = () => {
    if (!canPost) return;
    requote.mutate({ parent: root, commentary: text }, { onSuccess: onDone });
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View
        style={{ paddingTop: Platform.OS === 'ios' ? 12 : insets.top }}
        className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black"
      >
        <View className="h-14 w-full max-w-md flex-row items-center justify-between self-center px-4">
          <Pressable onPress={onDone} hitSlop={8} accessibilityRole="button" className="active:opacity-60">
            <Text className="text-[16px] text-neutral-900 dark:text-neutral-100">Cancel</Text>
          </Pressable>
          <Text accessibilityRole="header" className="text-[17px] font-bold text-neutral-900 dark:text-neutral-100">
            Requote
          </Text>
          <Pressable
            onPress={post}
            disabled={!canPost}
            accessibilityRole="button"
            accessibilityLabel="Post requote"
            accessibilityState={{ disabled: !canPost, busy: requote.isPending }}
            style={{ opacity: canPost ? 1 : 0.35 }}
            className="h-9 items-center justify-center rounded-full bg-black px-5 active:opacity-80 dark:bg-white"
          >
            <Text className="text-[14px] font-bold text-white dark:text-black">
              {requote.isPending ? 'Posting…' : 'Requote'}
            </Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{ alignItems: 'center', paddingBottom: insets.bottom + 24 }}
        >
          <View className="w-full max-w-md px-5 pt-5">
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={setText}
              multiline
              scrollEnabled={false}
              textAlignVertical="top"
              placeholder="Add your reflection..."
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.text}
              autoCapitalize="sentences"
              accessibilityLabel="Your reflection"
              style={{ color: colors.text, fontSize: 18, lineHeight: 28, minHeight: 120 }}
            />
            <Text
              accessibilityLabel={`${length} of ${REQUOTE_COMMENTARY_MAX} characters`}
              style={{ color: over ? colors.danger : colors.textMuted, fontVariant: ['tabular-nums'] }}
              className="mb-5 text-right text-[12px] font-medium"
            >
              {length}/{REQUOTE_COMMENTARY_MAX}
            </Text>

            <Text className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Requoting
            </Text>
            <EmbeddedQuote quote={root} />

            {already ? (
              <Text className="mt-4 text-[14px] text-neutral-600 dark:text-neutral-400">
                You&apos;ve already requoted this quote.
              </Text>
            ) : null}
            {requote.isError ? (
              <Text accessibilityRole="alert" style={{ color: colors.danger }} className="mt-4 text-[14px]">
                {requote.error.message}
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
