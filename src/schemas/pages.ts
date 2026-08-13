import { z } from 'zod';

/** Image paths are CMS-managed and empty until Katie uploads something. */
const imagePath = z.string().nullable().default(null);

/** A heading, a rich-text HTML body, and one optional image. */
export const sectionSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
  image: imagePath,
});

/** Impact page: a big figure and its caption. `value` is free text, never
 *  numeric, so Katie can enter "1,240", "~2.5 tonnes" or "Coming soon". */
export const statHexSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

/** Impact page: a named person and their role. */
export const spotlightHexSchema = z.object({
  role: z.string().min(1),
  name: z.string().min(1),
  photo: imagePath,
});

export const homeSchema = z.object({
  title: z.string().min(1),
  campaignsHexLabel: z.string().min(1),
  conceptsHexLabel: z.string().min(1),
});

export const campaignsHistorySchema = z.object({
  title: z.string().min(1),
  sections: z.tuple([sectionSchema, sectionSchema, sectionSchema]),
});

export const conceptsSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  /** Section 1 body contains the "Menu cards" link through to /recipes. */
  sectionOne: sectionSchema,
  /** The notes specify two image placeholders for this section. */
  sectionTwo: sectionSchema.extend({ imageTwo: imagePath }),
  /** The map screenshot is a single clickable image linking to /impact. */
  sectionThree: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
    mapScreenshot: imagePath,
  }),
});

export const recipesSchema = z.object({
  title: z.string().min(1),
  section: sectionSchema,
});

export const impactSchema = z.object({
  title: z.string().min(1),
  /** Screenshot of the Christ Church Toxteth Park Pantry page. */
  pantryScreenshot: imagePath,
  /** Honeycomb rows, per the notes: 2 stats, 3 spotlights, 2 stats. */
  rowOne: z.tuple([statHexSchema, statHexSchema]),
  rowTwo: z.tuple([spotlightHexSchema, spotlightHexSchema, spotlightHexSchema]),
  rowThree: z.tuple([statHexSchema, statHexSchema]),
});

export type Section = z.infer<typeof sectionSchema>;
export type StatHex = z.infer<typeof statHexSchema>;
export type SpotlightHex = z.infer<typeof spotlightHexSchema>;
export type Home = z.infer<typeof homeSchema>;
export type CampaignsHistory = z.infer<typeof campaignsHistorySchema>;
export type Concepts = z.infer<typeof conceptsSchema>;
export type Recipes = z.infer<typeof recipesSchema>;
export type Impact = z.infer<typeof impactSchema>;

/**
 * Validate a page's JSON at build time. Throws with the file name and the
 * exact failing field path so a CMS edit that breaks the shape fails the
 * build loudly instead of deploying a broken page.
 */
export function parsePage<T>(
  schema: z.ZodType<T>,
  data: unknown,
  name: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Content validation failed for src/data/${name}.json:\n${problems}\n\n` +
        `Fix the content in Pages CMS, or update src/schemas/pages.ts and ` +
        `.pages.yml together if the shape genuinely changed.`,
    );
  }
  return result.data;
}
