# Katie Jarman Portfolio Site — Design

**Date:** 2026-08-13
**Status:** Approved

## Purpose

A five-page static portfolio and pitch site for Katie Jarman, Digital Campaigns
Coordinator, presenting her campaigns history and a set of digital campaign
concepts for Feeding Liverpool.

Katie is the content editor and is non-technical. She must be able to change all
copy, images, and figures without touching code or markup. Page structure and
layout are fixed by design.

Source requirements: `Draft One of Notes For Job App website.md` in the repo
root.

## Constraints

- No paid services. GitHub Pages (free, public repo), Pages CMS (free, open
  source), GitHub Actions (free on public repos). Only optional cost is a domain.
- Katie never edits markup. She sees CMS form fields only.
- Content goes in front of Feeding Liverpool, so no fabricated statistics and no
  accessibility regressions.
- Repo starts on the developer's GitHub account and transfers to Katie's once
  good enough.

## Stack

Astro with Tailwind, static output, no framework islands, zero shipped
JavaScript.

Astro was chosen over Eleventy and Hugo because this site's difficulty is
concentrated in reusable geometric components (hexagon tessellation), which is
what Astro's scoped components handle best. Hugo installs lighter (single binary,
no `node_modules`) but its templating is clumsier for component work. Eleventy
sits between the two but offers no component scoping.

A build step is required, not incidental: Pages CMS produces form fields by
parsing structured content (JSON, YAML, frontmatter). Pointed at raw HTML it can
only offer one `rich-text` or `code` blob per page, which would mean Katie
editing markup — the exact failure mode the fixed-layout decision exists to
prevent. The build step is what makes the CMS safe.

Fonts: Manrope via `@fontsource-variable/manrope`, bundled locally. No
third-party font request, no layout shift, no GDPR question about Google Fonts on
a site aimed at a Liverpool charity.

## Architecture

Three parts:

**Content** — JSON files in `src/content/`, one per page. All copy, image
references, and figures live here and nowhere else. The only thing Pages CMS
touches.

**Templates** — one `.astro` page per route, five total, each reading its content
file. Layouts are fixed.

**Config** — `.pages.yml` at repo root, describing each content file as a Pages
CMS `file` entry with typed fields.

Live flow: Katie edits in Pages CMS → commit to GitHub → Action runs `astro
build` → deploys to GitHub Pages. Local flow: `astro dev`.

### Fixed layouts, editable content

Each page is a fixed template exposing exactly the slots the notes describe.
Katie cannot add a fourth hexagon to a three-hexagon cluster or otherwise break
the honeycomb geometry.

Consequence: adding a new section or page later is a developer task. Accepted.
Hexagon grids do not tessellate at arbitrary counts, so a "flexible section
count" would be partly illusory for the honeycombs regardless. If Katie starts
asking for more sections, the natural next step is to loosen the ordinary
text-and-image pages to Pages CMS `block` fields while leaving hexagon grids
fixed.

Because every page is a distinct fixed template, content files are `type: file`
entries rather than a `collection`. Katie sees a list of five named pages to
edit, not a "create new post" button.

## Content model

```
src/content/
  home.json               title, three hexagon labels
  campaigns-history.json  title, 3 x {heading, body, image}
  concepts.json           title, subtitle, 3 sections (see below)
  recipes.json            title, 1 x {heading, body, image}
  impact.json             title, screenshot, 7 hexagons
```

Concepts sections differ, per the notes:

- **Section 1** (Liverpool's Good Food Stories) — `{heading, body, image}`, and its
  body contains the "Menu cards" link to `/recipes`
- **Section 2** (Food Rights in Action) — `{heading, body, image, image2}`; the
  notes specify two image placeholders here
- **Section 3** (Mapping & Evidencing) — `{heading, body, mapScreenshot}`, where
  the map screenshot links to `/impact`

Recipes takes a single heading/body/image group: the notes specify only
"placeholder for image and text", not three sections.

JSON rather than markdown because every page is structured slots rather than
flowing prose, and JSON is what Astro content collections and Pages CMS both
handle most predictably. Body text uses `rich-text` fields, giving Katie a WYSIWYG
editor and the build sanitised HTML.

### Impact page structure

Two stacked horizontal sections, per the notes:

- **Section 1** — the Christ Church Toxteth Park Pantry screenshot, full width,
  no active links
- **Section 2** — the 2/3/2 honeycomb of seven hexagons

### Impact page hexagons

Seven hexagons in two shapes, all fields CMS-editable including the labels:

- **4 stat hexagons** — `{value, label}`. `value` is free text, not numeric, so
  Katie can enter `1,240`, `~2.5 tonnes`, or `Coming soon` without fighting field
  validation.
- **3 spotlight hexagons** — `{role, name, photo}`.

Row mapping from the notes:

- **Row 1** (2 hexagons) — stats: people served, volunteers
- **Row 2** (3 hexagons) — spotlights: Organiser, Shopper, Volunteer
- **Row 3** (2 hexagons) — stats: food saved from landfill, locally produced food

The notes hard-code "this month" into four labels. The whole label is editable
rather than splitting out a separate period field: simpler for Katie, and she
will want "October 2026" or "last quarter" eventually.

### Schema drift

Astro validates content against Zod schemas at build time. A shape the schema
does not expect fails the build loudly rather than deploying a broken page.

This means `.pages.yml` and the Zod schemas must be kept in step, and they are
separate files with no automatic link. They will be kept adjacent and commented
as a pair.

`.pages.yml` field labels and help text are written for Katie, not for
developers, since she will first encounter them after transfer without anyone
walking her through it.

## Routes and navigation

```
/                     Home — title + 3 hexagons
/campaigns-history    Campaigns History and Reach
/concepts             Feeding Liverpool Campaigns Concepts
/recipes              Recipes
/impact               Community Food Spaces Impact
```

Primary navigation is through hexagons, per the notes. Home's three hexagons: one
holds the title (not a link), one links to Campaigns History, one to Concepts.

Two further links specified in the notes:

- Concepts section 1, "Menu cards" → `/recipes`
- Concepts section 3, map screenshot → `/impact`

Recipes and Impact are therefore only reachable via Concepts. This is a
deliberate narrative walkthrough, but it leaves a visitor landing directly on
`/impact` with no way out.

**Addition beyond the notes:** a persistent header with a small wordmark linking
Home, plus a footer, on every page except Home. Without it those pages are dead
ends, which reads as broken rather than intentional.

### Path handling

All internal links and asset paths resolve through Astro's `base` config, never
hard-coded. The Pages URL changes on transfer
(`yourname.github.io/ksite` → `katiename.github.io/ksite`), so this keeps the
move to a one-line config change. Cheap now, tedious to retrofit.

## Components

**`Hexagon.astro`** — takes a label, optional `href`, optional fill colour, and
slot content. CSS `clip-path` on a fixed aspect ratio. No SVG, no images, no JS.

Two grid wrappers compose hexagons:

- **`HexRow`** — Home's three-across cluster
- **`HexGrid`** — Impact's 2/3/2 honeycomb, using negative vertical margins and
  alternate-row offsets so edges meet

Honeycombs do not reflow gracefully. Below approximately 640px both collapse to a
single vertical column of hexagons rather than attempting to tessellate at narrow
widths.

## Visual design

| Hex | Name | Use |
| --- | --- | --- |
| `#049013` | Alliance Dark Green | Links, buttons, primary hexagon fills |
| `#1D2A24` | Deep Slate Charcoal | Body text, headings, hexagon borders |
| `#F26722` | Bright Carrot Orange | Stat callouts, section accents |
| `#FEA000` | Golden Yellow | Secondary accents, hexagon variety |
| `#FAF8F5` | Off-White / Cream | Page background |

Applied as Tailwind theme tokens (`bg-cream`, `text-charcoal`, `border-green`) so
the palette lives in one file and Katie's content never contains colour
decisions.

### Contrast

Green on cream is approximately 4.3:1, under WCAG AA's 4.5:1 threshold for body
text. Therefore:

- Green is used for large text, hexagon fills, and borders — not body copy
- Body and small text are charcoal on cream (approximately 13:1)
- Orange on cream is approximately 2.9:1, so orange is decorative and for large
  stat numbers only, never small text
- White on green hexagon fill is approximately 4.9:1 and passes

This is weighted more heavily than usual: accessibility sits squarely in the
values of the organisation Katie is pitching to, and a pitch site failing
contrast checks undercuts the pitch.

### Hexagon fills

Fills rotate green → charcoal → orange → yellow across a grid so honeycombs read
as a designed cluster rather than a repeated tile. Rotation is deterministic by
index, not random, so it is stable between builds.

Otherwise restrained: generous whitespace on cream, charcoal headings in
Manrope's heavier weights, images in soft-cornered frames. The hexagons carry the
personality.

## Third-party content

The notes call for reproducing two Feeding Liverpool pages. Since Katie is
pitching to Feeding Liverpool, showing their own pages back is deliberate — a
mockup of where her concepts would live.

Both are handled as **static screenshot images** via CMS image fields:

- **The map** from `/community-food-spaces/map/` — one clickable image linking to
  `/impact`. Dead links are dead by construction because it is a picture.
- **Christ Church Toxteth Park Pantry page** — Impact section one.

Until Katie supplies real screenshots, both are labelled grey placeholder boxes
of the right shape. Swapping in the real thing is an image upload.

## Placeholder content

Two kinds, deliberately distinguished:

- **Real copy from the notes** goes in verbatim — the three campaign concepts,
  the What/Why/How structure, the hexagon labels. This is Katie's actual thinking
  and is what makes the layout legible.
- **Everything else is obvious filler** — lorem ipsum for Campaigns History
  sections and the Recipes body; stat values as `000` or `— tonnes`.

No fabricated statistics that could be mistaken for real data, and no stock
photography. Image placeholders are labelled grey SVGs stating intended
dimensions and purpose.

## Testing

Proportionate to a POC. No test suite for a five-page static site. Four checks:

1. `astro build` completes clean, no schema errors
2. Every route renders and every internal link resolves, no 404s
3. Both hexagon grids inspected at desktop and mobile widths, honeycomb edges
   meeting
4. `.pages.yml` validated against every field in the Zod schemas

Verification is by running the build and driving the dev server in a browser,
then showing the result — not by assertion.

## GitHub and transfer

In scope for the POC:

- Public repo on the developer's GitHub account
- Actions workflow: `astro build` → deploy to Pages on push to `main`
- `.pages.yml` live, with the developer connecting Pages CMS to the real repo and
  exercising the edit loop end to end

Transfer plan: GitHub repo transfer moves repo, issues, history and stars to
Katie's account and redirects the old URL. Two things do not survive cleanly:

- **Pages URL changes.** Mitigated by routing all paths through `base` config.
- **Pages CMS authorisation is per-account.** Katie re-authorises against the
  transferred repo.

**Katie is not a collaborator during the POC.** She gets access after transfer.

Known consequence: whether the CMS forms are genuinely usable by Katie stays
untested until after handover. This is the riskiest open assumption in the plan
and is accepted deliberately. Mitigated by writing `.pages.yml` labels and help
text for her rather than for developers.

## Out of scope

- Expand-on-click or modal behaviour for spotlight hexagons
- Real screenshots and photography
- Flexible/reorderable section blocks
- A sixth page or any structural change requiring a developer
- Custom domain
