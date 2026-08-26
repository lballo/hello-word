/**
 * ── THE ONE PLACE TO CHANGE CANVAS SETTINGS ─────────────────────────────
 *
 * Every composition reads its width / height / fps from `CANVAS`, and every
 * duration is written in SECONDS (via the `seconds()` helper) rather than in
 * frames. So switching the whole project to 4K or 60fps is a one-line edit
 * here — timings stay identical, nothing gets faster or slower.
 */

/** Ready-made frame sizes. Add your own freely. */
export const RESOLUTIONS = {
  HD: {width: 1920, height: 1080}, // 1080p landscape
  UHD_4K: {width: 3840, height: 2160}, // 4K landscape
  VERTICAL: {width: 1080, height: 1920}, // 9:16 reels / stories
  SQUARE: {width: 1080, height: 1080}, // 1:1 social
} as const;

/**
 * ↓↓↓ EDIT THESE TWO LINES ↓↓↓
 * e.g. `RESOLUTIONS.UHD_4K` and `60`.
 */
const RESOLUTION = RESOLUTIONS.HD;
const FPS = 30;

export const CANVAS = {
  width: RESOLUTION.width,
  height: RESOLUTION.height,
  fps: FPS,
} as const;

/**
 * Convert seconds to frames at the project's fps.
 * Always author durations with this instead of hard-coding frame counts.
 */
export const seconds = (value: number): number =>
  Math.max(1, Math.round(value * CANVAS.fps));

/**
 * Scale factor vs. the 1920x1080 baseline the compositions were designed at.
 * Multiply font sizes / paddings by this so a switch to 4K or vertical keeps
 * the same visual proportions instead of leaving tiny text in a huge frame.
 */
export const scale = (value: number): number =>
  value * (CANVAS.width / 1920);

/**
 * Title-safe area: keep all text inside this margin so nothing gets clipped
 * by overscan, player chrome, or platform-specific crops.
 * 5% is the broadcast convention.
 */
export const SAFE_MARGIN = {
  horizontal: CANVAS.width * 0.05,
  vertical: CANVAS.height * 0.05,
} as const;
