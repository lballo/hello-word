import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {enterExit, useTiming} from '../lib/animation';
import {theme} from '../theme';
import {SAFE_MARGIN, scale} from '../video-config';

/**
 * KINETIC TEXT — words land one after another, then leave one after another.
 *
 * Note the pattern: hooks can't run inside `.map()`, so each word calls the
 * PURE `enterExit()` helper with its own delay instead of `useEnterExit()`.
 */

export const kineticTextSchema = z.object({
  text: z.string(),
  /** Words matching this (case-insensitive) get the accent colour. */
  emphasise: z.string(),
  backgroundColor: zColor(),
  textColor: zColor(),
  accentColor: zColor(),
  /** Seconds between one word landing and the next. */
  wordStagger: z.number().min(0).max(1),
});

export type KineticTextProps = z.infer<typeof kineticTextSchema>;

export const kineticTextDefaultProps: KineticTextProps = {
  text: 'Every word enters and exits',
  emphasise: 'exits',
  backgroundColor: theme.colors.ink,
  textColor: theme.colors.paper,
  accentColor: theme.colors.accent,
  wordStagger: 0.1,
};

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  emphasise,
  backgroundColor,
  textColor,
  accentColor,
  wordStagger,
}) => {
  const {frame, fps, durationInFrames} = useTiming();
  const words = text.split(' ').filter(Boolean);
  const needle = emphasise.trim().toLowerCase();

  return (
    <AbsoluteFill style={{backgroundColor, fontFamily: theme.fontFamily}}>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: `${SAFE_MARGIN.vertical}px ${SAFE_MARGIN.horizontal}px`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: `${scale(12)}px ${scale(26)}px`,
            maxWidth: '100%',
          }}
        >
          {words.map((word, i) => {
            const {enter, exit, opacity} = enterExit({
              frame,
              fps,
              durationInFrames,
              enterDelay: i * wordStagger,
              enterDuration: 0.7,
              exitDuration: 0.35,
              // First word in, first word out: earlier words leave sooner.
              exitEarly: (words.length - 1 - i) * wordStagger * 0.6,
              damping: 14,
            });

            const isAccent =
              needle !== '' &&
              word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '') === needle;

            return (
              <span
                key={`${word}-${i}`}
                style={{
                  display: 'inline-block',
                  fontSize: scale(88),
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: theme.tracking.tight,
                  color: isAccent ? accentColor : textColor,
                  opacity,
                  transform: [
                    `translateY(${(1 - enter) * scale(70) - exit * scale(40)}px)`,
                    `scale(${0.85 + enter * 0.15 - exit * 0.1})`,
                  ].join(' '),
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
