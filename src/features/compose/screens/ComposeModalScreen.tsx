import { useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import { fonts } from '../../../shared/tokens/typography';
import { UserAvatar } from '../../profile/components/UserAvatar';
import { useCurrentIdentity } from '../../profile/hooks/useCurrentIdentity';
import { CategoryChips } from '../components/CategoryChips';
import { TagInput } from '../components/TagInput';
import { TextBudgetCounter } from '../components/TextBudgetCounter';
import { useCreateQuote } from '../hooks/useCreateQuote';
import { AUTHOR_MAX_LENGTH, quoteValidity } from '../types/compose.types';

type ComposeModalScreenProps = {
  /** Dismiss the modal (cancel, or after a successful post). */
  onDone: () => void;
};

/** V10: distraction-free, text-only quote composer. */
export function ComposeModalScreen({ onDone }: ComposeModalScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors('app');
  const { identity } = useCurrentIdentity();
  const create = useCreateQuote();

  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 250); // after the modal finishes presenting
    return () => clearTimeout(id);
  }, []);

  const canPost = quoteValidity(text) === 'valid' && !create.isPending;
  const hasDraft = text.trim().length > 0 || author.trim().length > 0 || tags.length > 0 || category !== null;

  const cancel = () => {
    if (!hasDraft || create.isPending) {
      onDone();
      return;
    }
    Alert.alert('Discard this quote?', 'Your draft will be lost.', [
      { text: 'Keep writing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: onDone },
    ]);
  };

  const post = () => {
    if (!canPost) return;
    create.mutate({ text, author, category, tags }, { onSuccess: onDone });
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Header */}
      <View
        style={{ paddingTop: Platform.OS === 'ios' ? 12 : insets.top }}
        className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black"
      >
        <View className="h-14 w-full max-w-md flex-row items-center justify-between self-center px-4">
          <Pressable onPress={cancel} hitSlop={8} accessibilityRole="button" className="active:opacity-60">
            <Text className="text-[16px] text-neutral-900 dark:text-neutral-100">Cancel</Text>
          </Pressable>
          <Text accessibilityRole="header" className="text-[17px] font-bold text-neutral-900 dark:text-neutral-100">
            New Quote
          </Text>
          <Pressable
            onPress={post}
            disabled={!canPost}
            accessibilityRole="button"
            accessibilityLabel="Post quote"
            accessibilityState={{ disabled: !canPost, busy: create.isPending }}
            style={{ opacity: canPost ? 1 : 0.35 }}
            className="h-9 items-center justify-center rounded-full bg-black px-5 active:opacity-80 dark:bg-white"
          >
            <Text className="text-[14px] font-bold text-white dark:text-black">
              {create.isPending ? 'Posting…' : 'Post'}
            </Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}
        >
          <View className="w-full max-w-md gap-6 px-5 pt-4">
            {/* Identity */}
            <View className="flex-row items-center gap-2.5">
              <UserAvatar username={identity?.username ?? 'you'} size={36} />
              <Text className="text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">
                @{identity?.username ?? 'you'}
              </Text>
            </View>

            {/* Quote body */}
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={setText}
              multiline
              scrollEnabled={false}
              textAlignVertical="top"
              placeholder="Write a quote worth keeping..."
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.text}
              autoCapitalize="sentences"
              accessibilityLabel="Quote text"
              style={{ fontFamily: fonts.serif, color: colors.text, fontSize: 20, lineHeight: 32, minHeight: 150 }}
            />

            {/* Author */}
            <View className="gap-1.5">
              <Text className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">Author</Text>
              <TextInput
                value={author}
                onChangeText={setAuthor}
                placeholder="Anonymous"
                placeholderTextColor={colors.textMuted}
                maxLength={AUTHOR_MAX_LENGTH}
                autoCapitalize="words"
                returnKeyType="next"
                accessibilityLabel="Author"
                style={{ color: colors.text, borderColor: colors.border, backgroundColor: colors.background }}
                className="h-[50px] rounded-2xl border px-3.5 text-[15px]"
              />
            </View>

            {/* Category */}
            <View className="gap-2">
              <Text className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">Category</Text>
              <CategoryChips value={category} onChange={setCategory} />
            </View>

            {/* Tags */}
            <TagInput tags={tags} onChange={setTags} />

            {create.isError ? (
              <Text accessibilityRole="alert" style={{ color: colors.danger }} className="text-[14px]">
                {create.error.message}
              </Text>
            ) : null}
          </View>
        </ScrollView>

        {/* Rides above the keyboard */}
        <View style={{ paddingBottom: insets.bottom }} className="bg-neutral-100 dark:bg-neutral-900">
          <TextBudgetCounter text={text} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
