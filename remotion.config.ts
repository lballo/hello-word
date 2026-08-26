import {Config} from '@remotion/cli/config';

/**
 * Project-wide render defaults.
 * Anything set here can still be overridden per-render with a CLI flag,
 * e.g. `npx remotion render TitleCard out/x.mp4 --image-format=png`.
 */

Config.setEntryPoint('./src/index.ts');

// JPEG frames are faster and smaller for opaque videos (MP4).
// Transparent renders need PNG frames — pass `--image-format=png` on those.
Config.setVideoImageFormat('jpeg');

// Overwrite out/<file> instead of erroring when it already exists.
Config.setOverwriteOutput(true);

// NOTE: quality/CRF is deliberately NOT set here.
// CRF only applies to h264/h265 — setting it project-wide makes every ProRes
// (transparent) render fail. Pass `--crf=18` on the MP4 command line instead.
