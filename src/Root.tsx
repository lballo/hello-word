import React from 'react';
import {Composition} from 'remotion';
import {
  KineticText,
  kineticTextDefaultProps,
  kineticTextSchema,
} from './compositions/KineticText';
import {
  LowerThird,
  lowerThirdDefaultProps,
  lowerThirdSchema,
} from './compositions/LowerThird';
import {
  TitleCard,
  titleCardDefaultProps,
  titleCardSchema,
} from './compositions/TitleCard';
import {
  TransparentBadge,
  transparentBadgeDefaultProps,
  transparentBadgeSchema,
} from './compositions/TransparentBadge';
import {CANVAS, seconds} from './video-config';

/**
 * ── THE REGISTRY ────────────────────────────────────────────────────────
 *
 * Every graphic you want to preview or render must be listed here.
 * The `id` is what you type on the command line:
 *
 *     npx remotion render TitleCard out/TitleCard.mp4 --codec=h264 --crf=18
 *
 * `{...CANVAS}` supplies width / height / fps from src/video-config.ts, so no
 * composition hard-codes a resolution. Durations use `seconds()` for the same
 * reason — switch the project to 60fps and every graphic keeps its timing.
 */

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TitleCard"
        component={TitleCard}
        durationInFrames={seconds(5)}
        {...CANVAS}
        schema={titleCardSchema}
        defaultProps={titleCardDefaultProps}
      />

      <Composition
        id="LowerThird"
        component={LowerThird}
        durationInFrames={seconds(6)}
        {...CANVAS}
        schema={lowerThirdSchema}
        defaultProps={lowerThirdDefaultProps}
      />

      <Composition
        id="KineticText"
        component={KineticText}
        durationInFrames={seconds(5)}
        {...CANVAS}
        schema={kineticTextSchema}
        defaultProps={kineticTextDefaultProps}
      />

      {/*
        Transparent overlay. Nothing here paints a background, so the render
        keeps a real alpha channel (see the ProRes / PNG commands in README).
      */}
      <Composition
        id="TransparentBadge"
        component={TransparentBadge}
        durationInFrames={seconds(4)}
        {...CANVAS}
        schema={transparentBadgeSchema}
        defaultProps={transparentBadgeDefaultProps}
      />
    </>
  );
};
