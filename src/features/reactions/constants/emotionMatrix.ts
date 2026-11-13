import type { ComponentType } from 'react';

import {
  ArtisticIcon,
  ClapIcon,
  EmpoweringIcon,
  InsightfulIcon,
  ResonantIcon,
  type ReactionIconProps,
} from '../components/ReactionIcons';
import type { ReactionType } from '../types/reaction.types';

export type { ReactionType } from '../types/reaction.types';

export interface AccentTokens {
  dark: string;
  light: string;
}

export interface EmotionMeta {
  type: ReactionType;
  label: string;
  hint: string;
  accent: AccentTokens;
  Icon: ComponentType<ReactionIconProps>;
}

/** Display order of the 5-emotion matrix. Keep the system monochrome, not color-coded by emotion. */
export const EMOTION_MATRIX: readonly EmotionMeta[] = [
  { type: 'insightful', label: 'Insightful', hint: 'Made me think', accent: { dark: '#FFFFFF', light: '#111827' }, Icon: InsightfulIcon },
  { type: 'empowering', label: 'Empowering', hint: 'Gave me strength', accent: { dark: '#FFFFFF', light: '#111827' }, Icon: EmpoweringIcon },
  { type: 'resonant', label: 'Resonant', hint: 'Felt true to me', accent: { dark: '#FFFFFF', light: '#111827' }, Icon: ResonantIcon },
  { type: 'artistic', label: 'Artistic', hint: 'Beautifully said', accent: { dark: '#FFFFFF', light: '#111827' }, Icon: ArtisticIcon },
  { type: 'clap', label: 'Clap', hint: 'Well done', accent: { dark: '#FFFFFF', light: '#111827' }, Icon: ClapIcon },
];

export const EMOTION_BY_TYPE = Object.fromEntries(
  EMOTION_MATRIX.map((e) => [e.type, e]),
) as Record<ReactionType, EmotionMeta>;