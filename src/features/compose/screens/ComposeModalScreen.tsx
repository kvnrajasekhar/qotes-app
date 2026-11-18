import { useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  ActivityIndicator,
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
import { useCurrentIdentity } from '../../profile/public';
import { useQuote } from '../../feed';
import { CategoryChips } from '../components/CategoryChips';
import { TagInput } from '../components/TagInput';
import { TextBudgetCounter } from '../components/TextBudgetCounter';
import { useCreateQuote } from '../hooks/useCreateQuote';
import { useUpdateQuote } from '../hooks/useUpdateQuote';
import { AUTHOR_MAX_LENGTH, COMPOSE_CATEGORIES, quoteValidity } from '../types/compose.types';

type ComposeModalScreenProps = {
  mode?: 'create' | 'edit';
  quoteId?: string;
  /** Dismiss the modal (cancel, or after a successful post). */
  onDone: () => void;
};

/** V10: distraction-free, text-only quote composer. */
export function ComposeModalScreen({ mode = 'create', quoteId, onDone }: ComposeModalScreenProps) {
  const isEditing = mode === 'edit';
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors('app');
  const { identity } = useCurrentIdentity();
  const editQuoteQuery = useQuote(isEditing ? quoteId : null);
  const editQuote = editQuoteQuery.data;
  const create = useCreateQuote();
  const update = useUpdateQuote();

  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const prefilledQuoteId = useRef<string | null>(null);

  useEffect(() => {
    if (!isEditing || !editQuote || prefilledQuoteId.current === editQuote._id) return;
    setText(editQuote.text);
    setAuthor(editQuote.author === 'Anonymous' ? '' : editQuote.author);
    setCategory(editQuote.category || null);
    setTags(editQuote.tags.map((tag) => tag.replace(/^#/, '')));
    prefilledQuoteId.current = editQuote._id;
  }, [editQuote, isEditing]);

  useEffect(() => {
    if (isEditing && !editQuote) return;
    const id = setTimeout(() => inputRef.current?.focus(), 250); // after the modal finishes presenting
    return () => clearTimeout(id);
  }, [isEditing, Boolean(editQuote)]);

  const originalTags = editQuote?.tags.map((tag) => tag.replace(/^#/, '')) ?? [];
  const hasChanges = isEditing
    ? Boolean(
        editQuote &&
          (text.trim() !== editQuote.text ||
            (author.trim() || 'Anonymous') !== editQuote.author ||
            (category ?? '') !== editQuote.category ||
            tags.join('\u0000') !== originalTags.join('\u0000')),
      )
    : text.trim().length > 0 || author.trim().length > 0 || tags.length > 0 || category !== null;
  const isSubmitting = isEditing ? update.isPending : create.isPending;
  const canPost =
    quoteValidity(text) === 'valid' &&
    !isSubmitting &&
    (!isEditing || Boolean(editQuote && hasChanges));
  const mutationError = isEditing ? update.error : create.error;
  const editStatus =
    isEditing && !editQuote
      ? editQuoteQuery.isLoading
        ? (
            <View className="items-center gap-3 py-16">
              <ActivityIndicator color={colors.text} />
              <Text className="text-[14px] text-neutral-600 dark:text-neutral-400">Loading quote…</Text>
            </View>
          )
        : editQuoteQuery.isError
          ? (
              <View className="items-center gap-3 px-6 py-16">
                <Text className="text-center text-[14px] text-neutral-600 dark:text-neutral-400">
                  {editQuoteQuery.error.status === 404
                    ? 'This quote is no longer available.'
                    : editQuoteQuery.error.message}
                </Text>
                {editQuoteQuery.error.status === 404 ? null : (
                  <Pressable
                    onPress={() => void editQuoteQuery.refetch()}
                    accessibilityRole="button"
                    className="min-h-11 justify-center px-4"
                  >
                    <Text className="text-[14px] font-bold text-neutral-900 underline dark:text-neutral-100">
                      Try again
                    </Text>
                  </Pressable>
                )}
              </View>
            )
          : (
              <View className="items-center px-6 py-16">
                <Text className="text-center text-[14px] text-neutral-600 dark:text-neutral-400">
                  This quote could not be loaded.
                </Text>
              </View>
            )
      : null;

  const cancel = () => {
    if (!hasChanges || isSubmitting) {
      onDone();
      return;
    }
    Alert.alert(
      isEditing ? 'Discard changes?' : 'Discard this quote?',
      isEditing ? 'Your edits will be lost.' : 'Your draft will be lost.',
      [
        { text: 'Keep writing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onDone },
      ],
    );
  };

  const submit = () => {
    if (!canPost) return;
    const input = { text, author, category, tags };
    if (isEditing && editQuote) {
      update.mutate({ quoteId: editQuote._id, input }, { onSuccess: onDone });
    } else {
      create.mutate(input, { onSuccess: onDone });
    }
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
            {isEditing ? 'Edit Quote' : 'New Quote'}
          </Text>
          <Pressable
            onPress={submit}
            disabled={!canPost}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? 'Save quote changes' : 'Post quote'}
            accessibilityState={{ disabled: !canPost, busy: isSubmitting }}
            style={{ opacity: canPost ? 1 : 0.35 }}
            className="h-9 items-center justify-center rounded-full bg-black px-5 active:opacity-80 dark:bg-white"
          >
            <Text className="text-[14px] font-bold text-white dark:text-black">
              {isSubmitting ? (isEditing ? 'Saving…' : 'Posting…') : isEditing ? 'Save' : 'Post'}
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
          {editStatus ?? <View className="w-full max-w-md gap-6 px-5 pt-4">
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
              placeholder={isEditing ? 'Edit quote text...' : 'Write a quote worth keeping...'}
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
              {isEditing && category && !COMPOSE_CATEGORIES.some((item) => item === category) ? (
                <View className="flex-row items-center justify-between">
                  <Text className="text-[13px] text-neutral-600 dark:text-neutral-400">Current category: {category}</Text>
                  <Pressable
                    onPress={() => setCategory(null)}
                    accessibilityRole="button"
                    accessibilityLabel={`Clear category ${category}`}
                    className="min-h-11 justify-center px-3"
                  >
                    <Text className="text-[13px] font-semibold text-neutral-800 underline dark:text-neutral-200">Clear</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>

            {/* Tags */}
            <TagInput tags={tags} onChange={setTags} />

            {mutationError ? (
              <Text accessibilityRole="alert" style={{ color: colors.danger }} className="text-[14px]">
                {mutationError.message}
              </Text>
            ) : null}
          </View>}
        </ScrollView>

        {/* Rides above the keyboard */}
        <View style={{ paddingBottom: insets.bottom }} className="bg-neutral-100 dark:bg-neutral-900">
          <TextBudgetCounter text={text} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
