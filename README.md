# Motion graphics — Remotion starter

Animated graphics built in React, rendered to files you can drop into any video
editor (Premiere, Resolve, Final Cut, CapCut…). Overlays export with a **real
alpha channel**, so they sit on top of your footage with no black box behind them.

The four included graphics are deliberately plain — neutral greys, one accent
colour, one font. They're a working skeleton to restyle, not a finished look.

---

## Preview

```bash
npm install      # first time only
npm run studio   # opens the Remotion Studio at http://localhost:3000
```

The Studio is the live editor: pick a composition on the left, scrub the
timeline, and edit any prop in the right-hand panel — text, colours, corner
placement — and see the change instantly. Nothing you type there is saved to the
code unless you hit "Save" on the props panel, so it's safe to experiment.

> On the very first render Remotion downloads a headless Chrome (~150 MB). That
> happens once, automatically.

---

## What's in the box

| Composition id     | What it is                | Length |
| ------------------ | ------------------------- | ------ |
| `TitleCard`        | Headline + rule + subtitle | 5s |
| `LowerThird`       | Name / role, bottom-left   | 6s |
| `KineticText`      | Word-by-word text          | 5s |
| `TransparentBadge` | Corner badge, **transparent background** | 4s |

```
src/
  index.ts              entry point — don't touch
  Root.tsx              THE REGISTRY: every graphic is listed here
  video-config.ts       resolution + fps + safe area (one place to change)
  theme.ts              colours + the Google font
  lib/animation.ts      the enter/exit timing helpers
  compositions/         one file per graphic
public/                 fonts, images, audio  (referenced with staticFile())
out/                    your renders land here (git-ignored)
```

---

## Changing resolution / fps

Everything lives in **`src/video-config.ts`**. Edit these two lines:

```ts
const RESOLUTION = RESOLUTIONS.HD;   // → RESOLUTIONS.UHD_4K, VERTICAL, SQUARE
const FPS = 30;                      // → 60
```

That's the whole change. It works because:

- No composition hard-codes a size — `Root.tsx` spreads `{...CANVAS}` into each one.
- No composition hard-codes a frame count — durations are written in **seconds**
  via `seconds(5)`, so at 60fps a 5-second graphic is still 5 seconds, just with
  twice the frames. Timing never drifts.
- Font sizes and padding go through `scale()`, which is relative to the 1920×1080
  baseline — so 4K gets proportionally bigger text instead of tiny text in a huge
  frame.

Use `RESOLUTIONS.VERTICAL` for 9:16 social. You'll want to re-check the layouts;
the safe area follows automatically.

---

## Adding a new graphic

**1. Create `src/compositions/MyGraphic.tsx`.** A minimal one:

```tsx
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useEnterExit} from '../lib/animation';
import {theme} from '../theme';
import {SAFE_MARGIN, scale} from '../video-config';

export const myGraphicSchema = z.object({
  headline: z.string(),
  backgroundColor: zColor(),
});

export type MyGraphicProps = z.infer<typeof myGraphicSchema>;

export const myGraphicDefaultProps: MyGraphicProps = {
  headline: 'Hello',
  backgroundColor: theme.colors.paper,
};

export const MyGraphic: React.FC<MyGraphicProps> = ({headline, backgroundColor}) => {
  const {enter, exit, opacity} = useEnterExit();

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        fontFamily: theme.fontFamily,
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${SAFE_MARGIN.vertical}px ${SAFE_MARGIN.horizontal}px`,
      }}
    >
      <h1
        style={{
          fontSize: scale(90),
          color: theme.colors.ink,
          opacity,
          transform: `translateY(${(1 - enter) * scale(40) - exit * scale(24)}px)`,
        }}
      >
        {headline}
      </h1>
    </AbsoluteFill>
  );
};
```

**2. Register it in `src/Root.tsx`:**

```tsx
<Composition
  id="MyGraphic"              // ← the name you type on the command line
  component={MyGraphic}
  durationInFrames={seconds(5)}
  {...CANVAS}                 // width, height, fps from video-config.ts
  schema={myGraphicSchema}     // ← gives you live editable fields in the Studio
  defaultProps={myGraphicDefaultProps}
/>
```

The `schema` is what makes props editable in the Studio sidebar. `z.string()`
becomes a text box, `zColor()` a colour picker, `z.boolean()` a switch,
`z.number()` a number field, and `z.enum([...])` a dropdown. Skip the schema and
you lose the live editing.

**3. It appears in the Studio immediately** (and in `npx remotion compositions`).

---

## Rendering

Run these from the project folder. `<id>` is the composition id from `Root.tsx`.

**MP4 — the normal one, for anything with a background:**

```bash
npx remotion render <id> out/<id>.mp4 --codec=h264 --crf=18
```

**Transparent MOV — for overlays (real alpha channel):**

```bash
npx remotion render <id> out/<id>.mov --codec=prores \
  --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png
```

**PNG sequence — maximum quality + alpha, biggest files:**

```bash
npx remotion render <id> out/<id> --sequence --image-format=png
```

Note the `--sequence` flag and that the output is a **folder**, not a filename
pattern — Remotion writes `element-000.png`, `element-001.png`, … itself.

Handy extras:

```bash
npx remotion compositions                    # list every id
npx remotion still <id> out/<id>.png --frame=30   # one frame as an image
npx remotion render <id> out/<id>.mp4 --frames=0-59  # render a range only
npx remotion render <id> out/x.mp4 --props='{"title":"Override"}'
```

### Which format when

| You want | Use |
| --- | --- |
| A clip with a background | MP4 (h264) |
| Something to lay **over** footage | ProRes 4444 `.mov` |
| An overlay your editor won't accept as ProRes | PNG sequence |
| A thumbnail / static graphic | `remotion still` |

`--crf` only applies to h264/h265 — lower is better quality (18 is visually
lossless, 23 is the default). ProRes ignores it, which is why it isn't set
project-wide in `remotion.config.ts`.

---

## Transparency

`TransparentBadge` is the demo. The rule is simply: **paint nothing you want to
be see-through.** No `backgroundColor` on the outer `AbsoluteFill`, and none on
the composition. Anything the graphic doesn't draw stays empty.

The Studio shows a checkerboard behind a transparent composition. Both commands
above preserve the alpha; the MP4 command does not (h264 has no alpha channel —
you'd get a black background).

`LowerThird` has a `showPreviewBackdrop` switch: leave it on while designing so
you can see the graphic, turn it **off** before rendering it as an overlay.

---

## Fonts

`src/theme.ts` loads Inter from Google Fonts:

```ts
import {loadFont} from '@remotion/google-fonts/Inter';
const {fontFamily} = loadFont('normal', {weights: ['400', '500', '700'], subsets: ['latin']});
```

Swap `Inter` for any Google font — `@remotion/google-fonts/Poppins`,
`/Lora`, `/DMSans` — and your editor will autocomplete the list. Remotion
downloads and registers it for both the preview and the render; no `<link>` tag,
and the render waits for the font before drawing a frame (so text never flashes
in unstyled).

**Using your own font file:** drop it in `public/fonts/` and load it once in
`theme.ts`:

```ts
import {staticFile} from 'remotion';
const myFont = new FontFace('MyFont', `url(${staticFile('fonts/MyFont.woff2')})`);
myFont.load().then(() => document.fonts.add(myFont));
```

---

## Sound

Audio goes in `public/audio/` and is referenced with `staticFile()`. Wrap it in a
`<Sequence>` to control **when** it fires:

```tsx
import {Audio, Sequence, staticFile} from 'remotion';
import {seconds} from '../video-config';

<Sequence from={seconds(0.15)} name="Sound effect">
  <Audio src={staticFile('audio/whoosh.mp3')} volume={0.7} />
</Sequence>
```

`from={seconds(0.15)}` means "start 0.15s in". You can also fade with a
function: `volume={(f) => interpolate(f, [0, 15], [0, 1], {extrapolateRight: 'clamp'})}`.

`TitleCard` has this wired up already: set its `soundEffect` prop to `tick.mp3`
(a placeholder included in `public/audio/`) to hear it, or empty for silence.
Delete `tick.mp3` once you have real sound effects.

---

## Tips

**Keep text in the title-safe area.** Every composition already pads by
`SAFE_MARGIN` (5% of the frame). Text outside it risks being clipped by player
chrome, TV overscan, or a platform's crop. Use the padding, don't fight it —
and give social crops extra room.

**Always give an animation a full enter *and* exit.** A graphic that's already
on screen at frame 0, or still visible on the last frame, will *pop* when it's
cut into a timeline. Every composition here starts and ends on an empty frame —
scrub to the first and last frame to check your own. `useEnterExit()` handles
this for you: the exit always finishes exactly on the final frame.

**Trim leading silence on sound effects.** A file with 200ms of silence at the
front will feel late no matter where you place it, and you'll compensate by
nudging the `<Sequence from={...}>` earlier until it fights the animation. Cut
the silence in the audio file itself, then sync it to the motion.

**Stagger, don't synchronise.** Two things arriving on the same frame reads as
one thing. `enterDelay` of 0.1–0.2s between elements is usually enough.

**Design at 1920×1080 and scale up.** It previews faster, and `scale()` handles
4K for you.

**Check a render, not just the preview.** The Studio is a browser; the render is
a browser too, but fonts, audio, and timing are worth confirming once on the
real file.

---

## Scripts

| Command | Does |
| --- | --- |
| `npm run studio` | Live preview / editor |
| `npm run render` | Alias for `remotion render` |
| `npm run still` | Alias for `remotion still` |
| `npm run compositions` | List all composition ids |
| `npm run typecheck` | TypeScript check, no render |
| `npm run upgrade` | Upgrade Remotion to the latest version |
