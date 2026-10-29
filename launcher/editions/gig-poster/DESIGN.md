---
name: Go, Hipster, Go! — Gig Poster edition
description: A two-ink gig poster made into a usable music-request instrument.
colors:
  petrol: "#103135"
  mustard-stock: "#dfb045"
  warm-highlight: "#edc65d"
  star-red: "#a83223"
  receipt-ink: "#742019"
  focus-paper: "#f5cf64"
typography:
  display:
    fontFamily: "Poster, sans-serif"
    fontSize: "17.2cqw"
    fontWeight: 400
    lineHeight: 0.86
    letterSpacing: "-.025em"
  label:
    fontFamily: "Courier New, monospace"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
rounded:
  flat: "0"
  key: "2px"
components:
  service-key:
    backgroundColor: "transparent"
    textColor: "{colors.petrol}"
    rounded: "{rounded.key}"
    padding: "7px 3px"
  service-key-selected:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.mustard-stock}"
    rounded: "{rounded.key}"
  go:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.mustard-stock}"
    rounded: "{rounded.key}"
    padding: "10px 3%"
---

# Design System: Go, Hipster, Go! — Gig Poster edition

## Overview

**Creative North Star: "The Gig Poster"**

A small-run gig poster becomes a usable music-request instrument. Mustard stock, petrol ink, condensed display type and engraved illustrations carry the personality; literal controls and readable status carry the work. The voice is a begrudgingly helpful record-store clerk: precise condescension without cruelty or obstruction.

This document applies only to this alternate edition. The user selected the Gig Poster image study with “Gig poster ftw”; that authorizes developing the alternate, not replacing the canonical live PWA. The approved comp remains the visual authority. This is an extracted implementation record, not a completed fidelity certification.

**Key Characteristics:**

- Mustard stock and deep petrol ink.
- Monumental condensed type and engraved art.
- Flat physical keys and clear inverse selection.
- Compact controls with honest handoff and recovery.

## Colors

### Primary

Petrol carries text, rules, geography and the GO strip. Mustard stock is the dominant working surface and inverse label color. Genuine paper texture uses luminosity blending over the stock color; texture must not replace the approved ground with a different hue.

### Secondary

Star red is a restrained identity accent. Warm highlight supports warning surfaces; focus paper separates the focus halo from ink.

**The Ink Rule.** Selection must remain legible as an explicit inverse state, rather than relying on a subtle hue shift.

## Typography

Display type is self-hosted Anton under the local Poster family name; its license accompanies the font asset. Arial carries practical explanatory text. Bold Courier New carries short annotations and instructions.

The launch headline uses a three-line lockup, compressed horizontally (scale 0.92) from its left origin. This composition belongs to the hero; do not apply that distortion to functional labels. Mood labels have a minimum (.8125rem); map guidance uses (.75rem). These are current implementation values, not permission to shrink other functional text.

## Layout

The poster container fills the viewport up to (960px), with main content inset (3%). Container-relative display sizing follows the poster width. Services use two rows of three equal keys. The five illustrated moods stay in one horizontal strip. The default-open geographic atlas uses real selection boundaries, an intentional factual adaptation from the mockup's approximate geography.

Navigation and principal keys retain touch targets of at least (44px). The small-screen adjustment at (360px) reduces masthead typography and gaps. First-use setup, receipt and clipboard recovery sit below the primary working controls; they remain part of the real interface.

## Elevation & Depth

The edition is flat at rest: printed rules, paper texture, engraving and inverse ink convey structure. No nested raised-card system. GO provides a brief downward press (2px), disabled under reduced-motion preferences. Focus uses an ink outline and contrasting paper halo.

## Shapes

Use predominantly square edges and thin ink rules. Service keys and GO have subtly eased corners (2px). The round tempo thumb is an intentional exception, paired with a horizontal ink track.

## Components

### Service keys and navigation

Service keys are transparent with ink borders; selected keys invert and underline their labels. The active navigation link is underlined. Footer links use ink and an underline. Preserve the actual capability-specific status under the service selectors.

### Tempo

A native five-stop range control handles pace; a separate Any button bypasses tempo. Any is not a sixth speed. The bypass state uses a dashed thumb treatment and explicit button state.

### Atlas and region stamps

One finger pans; two fingers pinch and pan; tapping selects real regions. Selected zone groups invert their child paths with a stronger outline. Named-region controls and Whole World remain available. Region stamps identify removable selections.

### Illustrated moods

Five engraved clerk portraits form a continuous strip. Inverse ink and the selected portrait treatment identify state. Preserve accessible pressed states and the existing tap-again-to-clear behavior.

### GO and recovery

The broad petrol strip has mustard display type and the red identity star. The latest source increases the star's size and brightness to restore visibility; confirm the rendered result rather than treating its filter as an immutable brand token. Copy status, handoff actions and recovery remain literal and usable.

### Verification status

The local correction batch covers selected map styling, footer contrast, label sizes, stock blending and GO star visibility. Desktop and mobile spot checks of the deployed batch confirmed selected-region inversion and successful Weird + GO copying with current handoff. This does not close automated visual fidelity review. Automated plate closure has not passed: the clerk asset comparison confounds a neutral sprite strip with a selected panel in the comp. Hero and viewport comparison reports are not passing whole-page fidelity evidence; partial capture absence does not prove absent controls. No quality-bar board was obtained. Resolve or explicitly disclose these gates before claiming finish approval. Do not canonize these limitations as visual rules.

## Do's and Don'ts

### Do:

- Do preserve readable labels, visible focus and truthful copy status.
- Do use actual engraved assets and the licensed self-hosted Anton font.
- Do keep service, tempo, region and mood mechanics shared with the canonical app.

### Don't:

- Don't replace the live PWA merely because this alternate was selected.
- Don't treat an automated mismatch or an unverified fix as a design invariant.
- Don't bury recovery actions or capability limitations in decorative copy.

## Manual extension

The approved Manual comp extends this world at `/editions/gig-poster/setup/`: two-line Anton title, engraved hand holding a record leaflet, compact service keys, stacked primary copy and secondary AI actions, thin-rule disclosures and readable fine print. Body instructions use Arial at .9375rem with 1.5 line height. The shared setup renderer retains route-specific instructions and truthful capability notes; real instructions are longer than the image study. Hero minimum height is 27cqw, with the illustration confined to the right. Canonical production files remain unchanged.

## First-visit setup notice

A compact outlined notice sits between hero and service choices: FIRST VISIT? SORT OUT THE CONNECTIONS. One setup check. Then we can discuss your taste. Its setup link opens the matching Manual; Dismiss uses the existing browser-local dismissal key. Returning-hero state alone does not hide the notice. Dismissing never removes the persistent Manual tab, and visiting the Manual is not treated as successful installation.

## Interaction feedback

Print-counter feedback uses immediate color/underline states and a 1px press on keys/actions. Successful copy alone earns one 180ms ink-settle; it follows real copied state, never a pointer click. The fader changes knob ink while held, disclosures show plus/minus and a dashed open rule, removable region stamps invert on hover/press. Fine-pointer hover decoration is gated; reduced-motion removes translation and the success animation while retaining state, focus and confirmation text. No dependencies, audio, haptics, waits or changed workflows.


## Confirmed-copy accent

Reserve deep vermilion (#742019) for the Jukebox's successful clipboard stamp and enabled next-AI handoff. Mustard lettering on this ink and ink against mustard both exceed 5:1 contrast. The existing COPIED TO CLIPBOARD text, bordered stamp and NEXT label remain the state cues; color is supplementary. Drafts and failed copies retain the normal petrol treatment. This adds no new motion or layout change.

## Approved portrait and selection refinement
Five tightly framed engraved clerk portraits use clerks-v2.webp. Weird is a surreal three-eyed character with looping hair. Selected moods use vermilion #d64b30 with petrol ink; passport stamps retain transparent paper with petrol ink; mood labels retain mustard on petrol and underlining. Selected map regions use vermilion with petrol diagonal hatching and outlines. Pressed states and removable named stamps remain the non-color cues.

## Selected expressions
The neutral clerk strip switches to clerks-expressions.webp on aria-pressed=true: laughing Happy, snarling Angry, tearful Sad, surreal grinning Weird, and smirking Criminal. The selected sprite is preloaded on the Jukebox to avoid a blank first selection. Both sprites share dimensions and cell positions; controls retain their size, labels, and vermilion selection surface. Existing brief character motion respects reduced motion, while the expression state remains visible. Shuffle and Undo use the same pressed-state source of truth.

## What is this even?
A collapsed-by-default liner note below the Manual introduction explains the Jukebox prompt, installed AI skill and connected music-service tools. Three plain text columns become a single readable sequence on phones; thin rules and a dashed signoff sit directly on the stock. Its heading is a native disclosure; the three role subheadings use bold Arial for clear scanning.

## Approved Weird replacement
Weird now uses weird-curly.webp: the user-supplied curly-haired, thin-moustached man facing forward, rendered in the established petrol engraving. Its two-cell strip holds neutral and open-mouth selected expressions. The other four portraits, vermilion selection and petrol passport stamps remain unchanged.

## The Funk, sixth mood
Approved two-state petrol-ink portrait: beaded shoulder-length braids, star-shaped sunglasses, high stand-up jumpsuit collar and front zipper. Neutral half-smile becomes a broad grin on selection. The visible name is THE FUNK; the stable mood key and generated command are `funky` / `go funky`. Six columns on desktop, three by two below 600px.

The Funk selection snaps to the grinning sprite and performs one diminishing 440ms horizontal shoulder shake. Only the portrait moves; the frame and label stay fixed. Reduced motion preserves the expression and selection without spatial animation.

## Optional sleeve and deep-crate keys
+ Art and TRY HARD retain the shuffle-pin pressed-key primitive and 44px minimum targets. Small current-ink sleeve and crate-divider marks identify the options; inverse ink plus an underline confirms selection. The sleeve record eases outward and the dividers lift once across a 240ms state transition. No loops, sound, waiting, added dependencies or changed prompt behavior. Reduced motion keeps the static icon and explicit selected treatment. Hover titles provide optional sleeve/Deep Crate context without adding mobile copy.

## Full-width GO and options below
GO spans the working width, followed by a horizontal row of + Art and TRY HARD keys with a 12px gap. Each optional key keeps its 44px minimum height and gains a 96px minimum width; the row wraps for enlarged text. GO says Copy your prompt; mood, track count and enabled extras remain explicit in the receipt, and the accessible GO name still includes the mood. DOM and keyboard order follow GO, + Art, TRY HARD, then receipt. Sleeve/crate detail and reduced motion remain intact.

## Joined request print block
The approved order is now + Art and TRY HARD before GO, matching visual and keyboard order. The two equal-width option areas share one outer ink boundary with the full-width GO key below. A single 1px divider separates the paper option areas; each retains the sleeve/crate mark, a short literal description, and a small checkbox-style pressed indicator. Selection keeps the surface paper and underlines only the label. Native buttons retain aria-pressed, descriptive help and inset visible focus. The GO star is restrained to 44–80px; GO type caps at 6rem and the copy helper aligns right. Existing icon motion, reduced-motion support, receipt, clipboard recovery and prompt logic remain intact. Earlier separate-key and below-GO layout notes are superseded by this approval.
