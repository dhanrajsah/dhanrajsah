# TODO - Premium Portfolio Overhaul

## Step 1 — Implementation prep
- [x] Confirm baseline by reviewing index.html/style.css/script.js/gallery.html (already reviewed).


## Step 2 — Create elite design system in CSS
- [x] Update `:root` tokens to match Abyssal Dark Mode + neon gradients.

- [ ] Enforce glassmorphism tokens (rgba(255,255,255,0.03), blur(16px), 1px border rgba(255,255,255,0.08)).
- [ ] Ensure overflow stability: overflow-x hidden + min-width:0 safety where needed.

## Step 3 — Refactor Bento Grid
- [ ] Update About/Skills/Projects to asymmetric bento layout (span-1/span-2) without content changes.
- [ ] Ensure mobile <768px collapses to single column with no gaps.

## Step 4 — Micro-interactions
- [ ] Tune scroll reveal: translateY(30px) fade in opacity with stagger and cubic-bezier curve.
- [ ] Fix tilt/hover transform conflicts between CSS and JS (consistent transform approach).
- [ ] Enhance magnetic button behavior for `.js-magnetic`.

## Step 5 — Profile ring
- [ ] Upgrade dashed/gradient rotating ring/aura behind `profile.jpg.jpeg`.

## Step 6 — Cursor
- [ ] Ensure cursor expands/colors on hover for clickable targets.
- [ ] Add reduced-motion fallback.

## Step 7 — Gallery sync
- [ ] Normalize gallery navbar markup to match index.html class hooks.
- [ ] Ensure gallery uses same glass cards and reveal animations.

## Step 8 — QA
- [ ] Verify no horizontal overflow in both pages.
- [ ] Verify social icons render.
- [ ] Verify all images use original filenames and profile image src remains `profile.jpg.jpeg`.

