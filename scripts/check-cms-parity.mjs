import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import {
  campaignsHistorySchema,
  conceptsSchema,
  homeSchema,
  impactSchema,
  recipesSchema,
  siteSchema,
} from '../src/schemas/pages.ts';

const schemas = {
  site: siteSchema,
  home: homeSchema,
  'campaigns-history': campaignsHistorySchema,
  concepts: conceptsSchema,
  recipes: recipesSchema,
  impact: impactSchema,
};

/** Field names Pages CMS declares for one content entry, as a flat set of
 *  dotted paths. */
function cmsPaths(fields, prefix = '') {
  const out = new Set();
  for (const field of fields ?? []) {
    const path = prefix ? `${prefix}.${field.name}` : field.name;
    if (field.fields) {
      for (const nested of cmsPaths(field.fields, path)) out.add(nested);
    } else {
      out.add(path);
    }
  }
  return out;
}

/** Field names a Zod schema declares, as the same flat set of dotted paths.
 *  Tuple and array element paths are flattened to the parent path so a
 *  3-item list and a 3-tuple compare equal. */
function zodPaths(schema, prefix = '') {
  const out = new Set();
  const def = schema._zod?.def ?? schema._def;
  const type = def?.type;

  if (type === 'object') {
    for (const [key, value] of Object.entries(def.shape)) {
      const path = prefix ? `${prefix}.${key}` : key;
      for (const nested of zodPaths(value, path)) out.add(nested);
    }
    return out;
  }
  if (type === 'tuple') {
    for (const nested of zodPaths(def.items[0], prefix)) out.add(nested);
    return out;
  }
  if (type === 'array') {
    for (const nested of zodPaths(def.element, prefix)) out.add(nested);
    return out;
  }
  if (type === 'optional' || type === 'nullable' || type === 'default') {
    for (const nested of zodPaths(def.innerType, prefix)) out.add(nested);
    return out;
  }

  if (prefix) out.add(prefix);
  return out;
}

const config = parse(readFileSync('.pages.yml', 'utf8'));
let failures = 0;

console.log('Pages CMS / Zod schema parity:');

for (const [name, schema] of Object.entries(schemas)) {
  const entry = config.content.find((item) => item.name === name);
  if (!entry) {
    failures += 1;
    console.error(`  FAIL  ${name}: no matching entry in .pages.yml`);
    continue;
  }

  const fromCms = cmsPaths(entry.fields);
  const fromZod = zodPaths(schema);

  const missingInCms = [...fromZod].filter((path) => !fromCms.has(path));
  const missingInZod = [...fromCms].filter((path) => !fromZod.has(path));

  if (missingInCms.length === 0 && missingInZod.length === 0) {
    console.log(`  PASS  ${name} (${fromZod.size} fields)`);
    continue;
  }

  failures += 1;
  console.error(`  FAIL  ${name}`);
  if (missingInCms.length) {
    console.error(`        in schema but not .pages.yml: ${missingInCms.join(', ')}`);
  }
  if (missingInZod.length) {
    console.error(`        in .pages.yml but not schema: ${missingInZod.join(', ')}`);
  }
}

if (failures > 0) {
  console.error(
    `\n${failures} entr(ies) out of sync. .pages.yml and src/schemas/pages.ts ` +
      `must declare the same fields.`,
  );
  process.exit(1);
}
console.log('\n.pages.yml and Zod schemas agree.');
