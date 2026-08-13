# Katie Jarman — portfolio site

A five-page static site, edited through [Pages CMS](https://pagescms.org) and
deployed to GitHub Pages.

## Editing content

All content is edited through Pages CMS — no code changes needed. Sign in at
[pagescms.org](https://pagescms.org) with GitHub and open this repository.
Saving publishes automatically; the live site updates a couple of minutes
later.

Page structure and layout are fixed by design. Text, images and figures are
editable; sections and hexagons cannot be added, removed or reordered.

Images you upload land in `public/media/`. Any image field left empty shows a
labelled placeholder box, so an unfinished page never looks broken.

## Local development

```bash
npm install
npm run dev
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built site |
| `npm run check:schemas` | Validate content shapes and link rewriting |
| `npm run check:cms` | Check `.pages.yml` matches the content schemas |

Both check scripts run in CI before every deploy.

## Architecture

- **Content:** `src/data/*.json`, one file per page. The only thing the CMS
  touches.
- **Schemas:** `src/schemas/pages.ts` — validated at build time, so invalid
  content fails the build rather than deploying broken.
- **CMS config:** `.pages.yml`
- **Components:** `src/components/` owns all geometry and colour. Page
  templates in `src/pages/` compose content and contain neither.

**`.pages.yml` and `src/schemas/pages.ts` are a matched pair.** Change one and
you must change the other — `npm run check:cms` enforces this and fails naming
both sides of any mismatch.

## Design constraints

- Palette and font are fixed: Manrope, bundled locally, with the five brand
  colours defined once in `src/styles/global.css`.
- Green (~4.3:1) and orange (~2.9:1) fail WCAG AA contrast on the cream
  background, so both are restricted to large text, hexagon fills and borders.
  Body and small text are charcoal (~13:1).
- Zero client-side JavaScript.
- No hard-coded deployment paths. Content stores bare paths like `/recipes`
  and `Section.astro` applies Astro's `base` at render time, so moving the site
  to a different GitHub account only requires updating `astro.config.mjs`.

## Moving this repo to another account

1. Settings → General → Danger Zone → Transfer ownership
2. New owner re-enables Pages: Settings → Pages → Source → GitHub Actions
3. Update `site` and `base` in `astro.config.mjs` to match the new owner and
   repo name. No content edits are needed.
4. New owner authorises Pages CMS against the transferred repo.

The old URL redirects after transfer, so existing links keep working.
