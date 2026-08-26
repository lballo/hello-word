import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * ── ENTER / EXIT TIMING ─────────────────────────────────────────────────
 *
 * The rule this project follows: every element animates IN and animates OUT.
 * Nothing appears on frame 0 already finished, and nothing is still on screen
 * when the composition cuts — that's what makes a graphic drop cleanly into a
 * timeline instead of popping.
 *
 * `enter` and `exit` are both 0 → 1 ramps you multiply into any style value:
 *
 *   opacity:   enter * (1 - exit)
 *   translateY: (1 - enter) * 40 + exit * -20
 *   scale:     0.9 + enter * 0.1
 *
 * `enter` is a spring (organic, slight overshoot), `exit` is an eased
 * interpolation (predictable, always finishes exactly on the last frame).
 */

export type EnterExitOptions = {
  /** Seconds to wait before this element enters. Use to stagger. */
  enterDelay?: number;
  /** Seconds the enter spring takes to settle. */
  enterDuration?: number;
  /** Seconds the exit takes. */
  exitDuration?: number;
  /**
   * Start the exit this many seconds EARLIER than the default.
   * Default (0) means the exit lands exactly on the final frame.
   * Use it to stagger exits — a bigger value leaves sooner.
   */
  exitEarly?: number;
  /** Spring feel: lower damping = bouncier. */
  damping?: number;
  stiffness?: number;
};

export type EnterExit = {
  /** 0 → 1 as the element arrives. */
  enter: number;
  /** 0 → 1 as the element leaves. */
  exit: number;
  /** Convenience: `enter * (1 - exit)`. */
  opacity: number;
};

/** Pure version — use inside `.map()` where hooks aren't allowed. */
export const enterExit = ({
  frame,
  fps,
  durationInFrames,
  enterDelay = 0,
  enterDuration = 0.8,
  exitDuration = 0.5,
  exitEarly = 0,
  damping = 18,
  stiffness = 110,
}: EnterExitOptions & {
  frame: number;
  fps: number;
  durationInFrames: number;
}): EnterExit => {
  const enter = spring({
    frame,
    fps,
    delay: Math.round(enterDelay * fps),
    durationInFrames: Math.max(1, Math.round(enterDuration * fps)),
    config: {damping, stiffness, mass: 1},
  });

  const lastFrame = durationInFrames - 1;
  const exitFrames = Math.max(1, Math.round(exitDuration * fps));
  const exitEnd = lastFrame - Math.round(exitEarly * fps);
  const exitStart = Math.max(0, exitEnd - exitFrames);

  const exit = interpolate(frame, [exitStart, exitEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  return {enter, exit, opacity: enter * (1 - exit)};
};

/** Hook version — the one you'll use most, once per component. */
export const useEnterExit = (options: EnterExitOptions = {}): EnterExit => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  return enterExit({frame, fps, durationInFrames, ...options});
};

/**
 * Frame + timing values, so a component can do its own custom `interpolate`
 * without repeating the two hooks every time.
 */
export const useTiming = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  return {frame, fps, durationInFrames, lastFrame: durationInFrames - 1};
};
