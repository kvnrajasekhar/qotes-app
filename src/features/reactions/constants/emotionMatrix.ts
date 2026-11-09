import { Feather, Lightbulb, Sparkles, Waves, Zap, type LucideIcon } from 'lucide-react-native';

import type { ReactionType } from '../../feed/types/feed.types';

export interface EmotionMeta {
  type: ReactionType;
  label: string;
  hint: string;
  Icon: LucideIcon;
  /** Accent per colour scheme: the only colour in the app besides error red. */
  accent: { light: string; dark: string };
}

/** Display order of the 5-emotion matrix. */
export const EMOTION_MATRIX: readonly EmotionMeta[] = [
  { type: 'insightful', label: 'Insightful', hint: 'Made me think', Icon: Lightbulb, accent: { light: '#1D4ED8', dark: '#60A5FA' } },
  { type: 'empowering', label: 'Empowering', hint: 'Gave me strength', Icon: Zap, accent: { light: '#047857', dark: '#34D399' } },
  { type: 'resonant', label: 'Resonant', hint: 'Felt true to me', Icon: Waves, accent: { light: '#B45309', dark: '#FBBF24' } },
  { type: 'artistic', label: 'Artistic', hint: 'Beautifully said', Icon: Feather, accent: { light: '#7E22CE', dark: '#C084FC' } },
  { type: 'clap', label: 'Clap', hint: 'Well done', Icon: Sparkles, accent: { light: '#B91C1C', dark: '#F87171' } },
];

export const EMOTION_BY_TYPE = Object.fromEntries(EMOTION_MATRIX.map((e) => [e.type, e])) as Record<
  ReactionType,
  EmotionMeta
>;
