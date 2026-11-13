import React from 'react';
import Svg, { G, Line, Path } from 'react-native-svg';

import type { ReactionType } from '../types/reaction.types';

export interface ReactionIconProps {
  /** Rendered width/height in px. Designed to stay crisp from 18–24. */
  size?: number;
  color?: string;
  strokeWidth?: number;
  /** Selected state: full opacity + slightly heavier stroke. */
  active?: boolean;
}

// NOTE: spec default. The Qotes design system is strictly monochrome
// (#FFFFFF / zinc); swap to your theme token if you want to follow that.
const DEFAULT_COLOR = '#E8DCC6';
const IDLE_OPACITY = 0.7;
const ACTIVE_BOOST = 0.3;

/** Shared prop resolution so all five icons behave identically. */
function useIconStyle({
  size = 20,
  color = DEFAULT_COLOR,
  strokeWidth = 1.6,
  active = false,
}: ReactionIconProps) {
  return {
    size,
    color,
    sw: active ? strokeWidth + ACTIVE_BOOST : strokeWidth,
    opacity: active ? 1 : IDLE_OPACITY,
  };
}

/** Rounded-rect bar path (used for the Empowering chart). */
const bar = (x: number, top: number, w = 3.6, bottom = 21, r = 1) =>
  `M${x} ${top + r}a${r} ${r} 0 0 1 ${r} ${-r}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}` +
  `V${bottom - r}a${r} ${r} 0 0 1 ${-r} ${r}H${x + r}a${r} ${r} 0 0 1 ${-r} ${-r}z`;

const common = {
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/* ─────────── Insightful: bulb + rays ─────────── */
export function InsightfulIcon(props: ReactionIconProps) {
  const { size, color, sw, opacity } = useIconStyle(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity}>
      <G fill="none" stroke={color} strokeWidth={sw} {...common}>
        <Path d="M9.2 17.2v-1.1a5.8 5.8 0 1 1 5.6 0v1.1z" />
        <Path d="M10 10.5h4l-1.3 3.3v2.3h-1.4v-2.3z" />
        <Line x1={9.8} y1={19.4} x2={14.2} y2={19.4} />
        <Line x1={10.8} y1={21.4} x2={13.2} y2={21.4} />
        <Line x1={12} y1={1.6} x2={12} y2={3.2} />
        <Line x1={5.4} y1={4.4} x2={6.6} y2={5.6} />
        <Line x1={18.6} y1={4.4} x2={17.4} y2={5.6} />
        <Line x1={1.6} y1={11} x2={3.2} y2={11} />
        <Line x1={20.8} y1={11} x2={22.4} y2={11} />
      </G>
    </Svg>
  );
}

/* ─────────── Empowering: rising bars + arrow ─────────── */
export function EmpoweringIcon(props: ReactionIconProps) {
  const { size, color, sw, opacity } = useIconStyle(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity}>
      <G fill={color}>
        <Path d={bar(3, 17)} />
        <Path d={bar(10.2, 13.5)} />
        <Path d={bar(17.4, 10)} />
      </G>
      <G fill="none" stroke={color} strokeWidth={sw} {...common}>
        <Path d="M3 12.5C8 11.5 14 8.5 19.6 3.6" />
        <Path d="M15.5 3H21v5.5" />
      </G>
    </Svg>
  );
}

/* ─────────── Resonant: heart + sound arcs ─────────── */
export function ResonantIcon(props: ReactionIconProps) {
  const { size, color, sw, opacity } = useIconStyle(props);
  const HEART_SCALE = 0.9; // keeps clear air between heart and arcs
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity}>
      <G
        fill="none"
        stroke={color}
        strokeWidth={sw / HEART_SCALE}
        transform={`translate(1.2 1.2) scale(${HEART_SCALE})`}
        {...common}
      >
        <Path d="M16.35 13.24c.92-.91 1.86-1.99 1.86-3.41A3.41 3.41 0 0 0 14.79 6.42c-1.09 0-1.86.31-2.79 1.24-.93-.93-1.7-1.24-2.79-1.24A3.41 3.41 0 0 0 5.8 9.83c0 1.43.93 2.51 1.86 3.41L12 17.58z" />
      </G>
      <G fill="none" stroke={color} strokeWidth={sw} {...common}>
        <Path d="M4.2 9.6a3.2 3.2 0 0 0 0 4.8" />
        <Path d="M2.2 8.6a6 6 0 0 0 0 6.8" />
        <Path d="M19.8 9.6a3.2 3.2 0 0 1 0 4.8" />
        <Path d="M21.8 8.6a6 6 0 0 1 0 6.8" />
      </G>
    </Svg>
  );
}

/* ─────────── Artistic: 4-point sparkle trio ─────────── */
export function ArtisticIcon(props: ReactionIconProps) {
  const { size, color, sw, opacity } = useIconStyle(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity}>
      <G fill={color} stroke={color} strokeWidth={sw / 2} {...common}>
        <Path d="M9.5 5Q10.4 11.1 16 12Q10.4 12.9 9.5 19Q8.6 12.9 3 12Q8.6 11.1 9.5 5Z" />
        <Path d="M19.5 4.1Q19.8 6.2 21.9 6.5Q19.8 6.8 19.5 8.9Q19.2 6.8 17.1 6.5Q19.2 6.2 19.5 4.1Z" />
        <Path d="M19.5 15.1Q19.8 17.2 21.9 17.5Q19.8 17.8 19.5 19.9Q19.2 17.8 17.1 17.5Q19.2 17.2 19.5 15.1Z" />
      </G>
    </Svg>
  );
}

/* ─────────── Clap: hand + impact lines ─────────── */
export function ClapIcon(props: ReactionIconProps) {
  const { size, color, sw, opacity } = useIconStyle(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity}>
      <G fill="none" stroke={color} strokeWidth={sw} {...common}>
        <Path d="M2.8 12.2L8.5 6.5a1.37 1.37 0 0 1 1.875 2a1.37 1.37 0 0 1 1.875 2a1.37 1.37 0 0 1 1.875 2a1.37 1.37 0 0 1 1.875 2L10.3 20.2Q5.5 21.5 2.8 12.2z" />
        <Line x1={10.4} y1={8.5} x2={7.2} y2={11.7} />
        <Line x1={12.25} y1={10.5} x2={9.05} y2={13.7} />
        <Line x1={14.1} y1={12.5} x2={10.9} y2={15.7} />
        <Line x1={14.5} y1={1.5} x2={14.5} y2={4.2} />
        <Line x1={17.5} y1={5} x2={20} y2={2} />
        <Line x1={20} y1={7.2} x2={22.8} y2={6.5} />
      </G>
    </Svg>
  );
}

/** Lookup keyed by the server's 5-emotion enum. */
export const REACTION_ICONS: Record<
  ReactionType,
  (props: ReactionIconProps) => React.JSX.Element
> = {
  insightful: InsightfulIcon,
  empowering: EmpoweringIcon,
  resonant: ResonantIcon,
  artistic: ArtisticIcon,
  clap: ClapIcon,
};

export function ReactionIcon({ type, ...rest }: ReactionIconProps & { type: ReactionType }) {
  const Icon = REACTION_ICONS[type];
  return <Icon {...rest} />;
}
