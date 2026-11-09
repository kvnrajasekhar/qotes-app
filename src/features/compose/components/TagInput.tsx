import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import { MAX_TAGS, TAG_MAX_LENGTH } from '../types/compose.types';

type TagInputProps = {
  /** Stored without "#". */
  tags: string[];
  onChange: (tags: string[]) => void;
};

const normalize = (raw: string) => raw.replace(/^#+/, '').replace(/[^A-Za-z0-9_]/g, '').slice(0, TAG_MAX_LENGTH);

export function TagInput({ tags, onChange }: TagInputProps) {
  const { colors } = useThemeColors('app');
  const [draft, setDraft] = useState('');
  const full = tags.length >= MAX_TAGS;

  const commit = (raw: string) => {
    const tag = normalize(raw);
    setDraft('');
    if (!tag || full || tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    onChange([...tags, tag]);
  };

  const onChangeText = (text: string) => {
    // A space or comma finishes the current tag.
    if (/[\s,]$/.test(text)) commit(text);
    else setDraft(text);
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">Tags</Text>
        <Text style={{ fontVariant: ['tabular-nums'] }} className="text-[12px] text-neutral-500 dark:text-neutral-400">
          {tags.length} / {MAX_TAGS}
        </Text>
      </View>

      {tags.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {tags.map((tag) => (
            <Pressable
              key={tag}
              onPress={() => onChange(tags.filter((t) => t !== tag))}
              accessibilityRole="button"
              accessibilityLabel={`Remove tag ${tag}`}
              className="flex-row items-center gap-1.5 rounded-full bg-neutral-100 py-1.5 pl-3 pr-2.5 active:opacity-70 dark:bg-neutral-900"
            >
              <Text className="text-[13px] text-neutral-700 dark:text-neutral-300">#{tag}</Text>
              <X size={13} color={colors.textMuted} strokeWidth={2.4} />
            </Pressable>
          ))}
        </View>
      ) : null}

      <TextInput
        value={draft}
        onChangeText={onChangeText}
        onSubmitEditing={() => commit(draft)}
        onBlur={() => draft && commit(draft)}
        editable={!full}
        placeholder={full ? 'Tag limit reached' : 'Add a tag, then press space'}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        blurOnSubmit={false}
        maxLength={TAG_MAX_LENGTH + 1}
        accessibilityLabel="Add a tag"
        style={{ color: colors.text, borderColor: colors.border, backgroundColor: colors.background, opacity: full ? 0.5 : 1 }}
        className="h-[46px] rounded-2xl border px-3.5 text-[15px]"
      />
    </View>
  );
}
