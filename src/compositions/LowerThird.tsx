import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useEnterExit} from '../lib/animation';
import {theme} from '../theme';
import {SAFE_MARGIN, scale} from '../video-config';

/**
 * LOWER THIRD — name + role in the bottom-left corner.
 * Enter: an accent bar grows, then the text wipes open beside it.
 * Exit:  the text wipes shut, then the bar collapses.
 *
 * This is an OVERLAY: turn `showPreviewBackdrop` off and render it with the
 * transparent (ProRes 4444) command to get a real alpha channel you can drop
 * straight onto footage in your editor.
 */

export const lowerThirdSchema = z.object({
  name: z.string(),
  role: z.string(),
  textColor: zColor(),
  accentColor: zColor(),
  panelColor: zColor(),
  /** Grey card behind the graphic, so you can see it while designing. */
  showPreviewBackdrop: z.boolean(),
});

export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;

export const lowerThirdDefaultProps: LowerThirdProps = {
  name: 'Name Surname',
  role: 'Role · Organisation',
  textColor: theme.colors.paper,
  accentColor: theme.colors.accent,
  panelColor: 'rgba(17, 18, 20, 0.82)',
  showPreviewBackdrop: true,
};

export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  role,
  textColor,
  accentColor,
  panelColor,
  showPreviewBackdrop,
}) => {
  const bar = useEnterExit({enterDuration: 0.6, exitDuration: 0.35});
  const panel = useEnterExit({
    enterDelay: 0.18,
    enterDuration: 0.8,
    exitDuration: 0.4,
    exitEarly: 0.18, // leaves before the bar, so the bar closes last
  });
  const text = useEnterExit({
    enterDelay: 0.34,
    enterDuration: 0.7,
    exitDuration: 0.3,
    exitEarly: 0.3,
  });

  // clip-path wipe: 100% closed → 0% open → closed again.
  const wipe = (1 - panel.enter) * 100 + panel.exit * 100;

  return (
    <AbsoluteFill style={{fontFamily: theme.fontFamily}}>
      {showPreviewBackdrop ? (
        <AbsoluteFill style={{backgroundColor: '#3a3d42'}} />
      ) : null}

      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          padding: `${SAFE_MARGIN.vertical}px ${SAFE_MARGIN.horizontal}px`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'stretch'}}>
          {/* Accent bar — grows from the bottom, collapses last. */}
          <div
            style={{
              width: scale(8),
              borderRadius: scale(4),
              backgroundColor: accentColor,
              transformOrigin: 'bottom center',
              transform: `scaleY(${bar.enter * (1 - bar.exit)})`,
            }}
          />

          <div
            style={{
              backgroundColor: panelColor,
              padding: `${scale(26)}px ${scale(44)}px ${scale(28)}px ${scale(32)}px`,
              // Wipes open to the right, and shut again on the way out.
              clipPath: `inset(0 ${wipe}% 0 0)`,
            }}
          >
            <div
              style={{
                fontSize: scale(52),
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: theme.tracking.tight,
                color: textColor,
                opacity: text.opacity,
                transform: `translateY(${(1 - text.enter) * scale(14)}px)`,
              }}
            >
              {name}
            </div>
            <div
              style={{
                marginTop: scale(10),
                fontSize: scale(26),
                fontWeight: 500,
                letterSpacing: theme.tracking.wide,
                textTransform: 'uppercase',
                color: accentColor,
                opacity: text.opacity,
                transform: `translateY(${(1 - text.enter) * scale(20)}px)`,
              }}
            >
              {role}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
