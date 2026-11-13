import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { EMOTION_MATRIX } from '../constants/emotionMatrix';
import { useReactionToggle } from '../hooks/useReactionToggle';
import type { ReactionType } from '../types/reaction.types';
import { ReactionIcon } from './ReactionIcons';

interface Props {
  quoteId: string;
  counts: Partial<Record<ReactionType, number>>;
  /** Viewer's current reaction (from the quote payload), if any. */
  initialReaction?: ReactionType | null;
}

export function ReactionPillBar({ quoteId, counts, initialReaction = null }: Props) {
  const [mine, setMine] = useState<ReactionType | null>(initialReaction);
  const [local, setLocal] = useState(counts);
  const { mutate } = useReactionToggle();

  const onPress = (type: ReactionType) => {
    setLocal((c) => {
      const next = { ...c };
      if (mine) next[mine] = Math.max(0, (next[mine] ?? 0) - 1);
      if (mine !== type) next[type] = (next[type] ?? 0) + 1;
      return next;
    });

    const prevMine = mine;
    const prevCounts = local;
    const nextMine = mine === type ? null : type;
    setMine(nextMine);

    mutate(
      { quoteId, type, current: mine },
      {
        onError: () => {
          setMine(prevMine);
          setLocal(prevCounts);
        },
      },
    );
  };

  return (
    <View className="flex-row items-center gap-x-2">
      {EMOTION_MATRIX.map(({ type, label }) => {
        const active = mine === type;
        return (
          <Pressable
            key={type}
            onPress={() => onPress(type)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${label} reaction`}
            accessibilityState={{ selected: active }}
            className={`flex-row items-center gap-x-1.5 rounded-full border px-3 py-1.5 active:opacity-70 ${
              active ? 'border-white bg-white/10' : 'border-zinc-700 bg-transparent'
            }`}
          >
            <ReactionIcon type={type} size={18} active={active} />
            <Text className={`text-xs ${active ? 'text-white' : 'text-zinc-400'}`}>
              {local[type] ?? 0}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
