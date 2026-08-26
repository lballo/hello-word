import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {useEnterExit, useTiming} from '../lib/animation';
import {theme} from '../theme';
import {SAFE_MARGIN, scale} from '../video-config';

/**
 * TRANSPARENT OVERLAY DEMO — a small badge on a genuinely empty background.
 *
 * There is NO <AbsoluteFill backgroundColor> anywhere in this file, and the
 * composition is registered without one either. Everything the graphic doesn't
 * paint stays transparent, so the ProRes 4444 / PNG-sequence renders in the
 * README carry a real alpha channel into your editor.
 *
 * The Studio shows a checkerboard behind it — that's the transparency.
 */

export const transparentBadgeSchema = z.object({
  label: z.string(),
  corner: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']),
  badgeColor: zColor(),
  textColor: zColor(),
  dotColor: zColor(),
});

export type TransparentBadgeProps = z.infer<typeof transparentBadgeSchema>;

export const transparentBadgeDefaultProps: TransparentBadgeProps = {
  label: 'LIVE · REPLAY',
  corner: 'top-right',
  badgeColor: 'rgba(17, 18, 20, 0.9)',
  textColor: '#f4f4f2',
  dotColor: '#3b6ef5',
};

const placement: Record<
  TransparentBadgeProps['corner'],
  {justifyContent: 'flex-start' | 'center' | 'flex-end'; alignItems: 'flex-start' | 'center' | 'flex-end'}
> = {
  'top-left': {justifyContent: 'flex-start', alignItems: 'flex-start'},
  'top-right': {justifyContent: 'flex-start', alignItems: 'flex-end'},
  'bottom-left': {justifyContent: 'flex-end', alignItems: 'flex-start'},
  'bottom-right': {justifyContent: 'flex-end', alignItems: 'flex-end'},
  center: {justifyContent: 'center', alignItems: 'center'},
};

export const TransparentBadge: React.FC<TransparentBadgeProps> = ({
  label,
  corner,
  badgeColor,
  textColor,
  dotColor,
}) => {
  const {frame, fps} = useTiming();
  const badge = useEnterExit({enterDuration: 0.7, exitDuration: 0.4, damping: 13});
  const text = useEnterExit({
    enterDelay: 0.2,
    enterDuration: 0.6,
    exitDuration: 0.25,
    exitEarly: 0.15,
  });

  // Steady 1.2s pulse on the dot, faded in and out with the badge.
  const pulse = interpolate(
    Math.sin((frame / (fps * 1.2)) * Math.PI * 2),
    [-1, 1],
    [0.45, 1],
    {easing: Easing.inOut(Easing.ease)},
  );

  return (
    <AbsoluteFill
      style={{
        fontFamily: theme.fontFamily,
        padding: `${SAFE_MARGIN.vertical}px ${SAFE_MARGIN.horizontal}px`,
        flexDirection: 'column',
        ...placement[corner],
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: scale(16),
          padding: `${scale(18)}px ${scale(34)}px`,
          borderRadius: scale(999),
          backgroundColor: badgeColor,
          opacity: badge.opacity,
          transform: `scale(${0.8 + badge.enter * 0.2 - badge.exit * 0.15}) translateY(${
            (1 - badge.enter) * scale(24) - badge.exit * scale(16)
          }px)`,
        }}
      >
        <div
          style={{
            width: scale(16),
            height: scale(16),
            borderRadius: '50%',
            backgroundColor: dotColor,
            opacity: pulse * (1 - badge.exit),
            transform: `scale(${badge.enter})`,
          }}
        />
        <span
          style={{
            fontSize: scale(28),
            fontWeight: 700,
            letterSpacing: theme.tracking.wide,
            color: textColor,
            whiteSpace: 'nowrap',
            opacity: text.opacity,
            transform: `translateX(${(1 - text.enter) * scale(-14)}px)`,
          }}
        >
          {label}
        </span>
      </div>
    </AbsoluteFill>
  );
};
