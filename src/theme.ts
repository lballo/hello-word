import {loadFont} from '@remotion/google-fonts/Inter';

/**
 * Deliberately neutral. This is a starting point, not a finished look —
 * change the values here and every composition follows.
 *
 * Fonts: `@remotion/google-fonts` downloads and registers the font for you,
 * in both the Studio preview and the render, with no <link> tag needed.
 * Swap `Inter` above for any Google font (`.../Poppins`, `.../Lora`, ...) —
 * autocomplete lists them all. To use a font file of your own instead, drop it
 * in `public/fonts/` and see the README ("Using your own font file").
 */
const {fontFamily} = loadFont('normal', {
  weights: ['400', '500', '700'],
  subsets: ['latin'],
});

export const theme = {
  fontFamily,
  colors: {
    ink: '#111214', // near-black, for dark-on-light
    paper: '#f4f4f2', // off-white background
    muted: '#6c6f75', // secondary text
    accent: '#3b6ef5', // one single accent
    onAccent: '#ffffff',
  },
  /** Letter-spacing in em, tuned for large display text. */
  tracking: {
    tight: '-0.02em',
    normal: '0em',
    wide: '0.12em',
  },
} as const;
