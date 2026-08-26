import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile} from 'remotion';
import {useEnterExit, useTiming} from '../lib/animation';
import {theme} from '../theme';
import {SAFE_MARGIN, scale, seconds} from '../video-config';

/**
 * TITLE CARD — a headline, a rule, a subtitle.
 * Enter: each line springs up and fades in, staggered.
 * Exit:  the whole block drifts up and fades out before the last frame.
 */

export const titleCardSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  backgroundColor: zColor(),
  textColor: zColor(),
  accentColor: zColor(),
  /**
   * OPTIONAL SOUND EFFECT.
   * Drop a file into `public/audio/` and type its filename here
   * (e.g. "whoosh.mp3"), or try the placeholder shipped in this repo:
   * "tick.mp3". Leave empty for a silent graphic.
   */
  soundEffect: z.string(),
});

export type TitleCardProps = z.infer<typeof titleCardSchema>;

export const titleCardDefaultProps: TitleCardProps = {
  title: 'Your title here',
  subtitle: 'A neutral starting point — restyle everything',
  backgroundColor: theme.colors.paper,
  textColor: theme.colors.ink,
  accentColor: theme.colors.accent,
  soundEffect: '',
};

export const TitleCard: React.FC<TitleCardProps> = ({
  title,
  subtitle,
  backgroundColor,
  textColor,
  accentColor,
  soundEffect,
}) => {
  const {frame, durationInFrames} = useTiming();

  // One enter/exit ramp per element, staggered by `enterDelay`.
  const headline = useEnterExit({enterDelay: 0.1, enterDuration: 0.9});
  const rule = useEnterExit({enterDelay: 0.35, enterDuration: 0.7});
  const sub = useEnterExit({enterDelay: 0.5, enterDuration: 0.9});

  // A very slow push-in across the whole shot keeps the frame alive.
  const drift = interpolate(frame, [0, durationInFrames - 1], [1, 1.03], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });

  return (
    <AbsoluteFill style={{backgroundColor, fontFamily: theme.fontFamily}}>
      {/* Sound effect — only mounted when a filename is provided. */}
      {soundEffect.trim() !== '' ? (
        <Sequence from={seconds(0.15)} name="Sound effect">
          <Audio src={staticFile(`audio/${soundEffect}`)} volume={0.7} />
        </Sequence>
      ) : null}

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          // Title-safe area: nothing important outside this padding.
          padding: `${SAFE_MARGIN.vertical}px ${SAFE_MARGIN.horizontal}px`,
          transform: `scale(${drift})`,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: scale(96),
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: theme.tracking.tight,
            color: textColor,
            opacity: headline.opacity,
            transform: `translateY(${(1 - headline.enter) * scale(48) - headline.exit * scale(28)}px)`,
          }}
        >
          {title}
        </h1>

        <div
          style={{
            width: scale(160),
            height: scale(4),
            marginTop: scale(36),
            marginBottom: scale(32),
            borderRadius: scale(4),
            backgroundColor: accentColor,
            opacity: 1 - rule.exit,
            // Wipes open from the centre, then closes again on exit.
            transform: `scaleX(${rule.enter * (1 - rule.exit)})`,
          }}
        />

        <p
          style={{
            margin: 0,
            fontSize: scale(34),
            fontWeight: 400,
            letterSpacing: theme.tracking.normal,
            color: textColor,
            opacity: sub.opacity * 0.72,
            transform: `translateY(${(1 - sub.enter) * scale(28) - sub.exit * scale(18)}px)`,
          }}
        >
          {subtitle}
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
