import { z } from 'zod';
import { homeSchema, impactSchema, parsePage } from '../src/schemas/pages.ts';
import { withBaseLinks } from '../src/lib/richtext.ts';

let failures = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`  FAIL  ${name}\n        ${error.message.split('\n')[0]}`);
  }
}

function expectThrows(name, fn) {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (threw) {
    console.log(`  PASS  ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${name}\n        expected a validation error`);
  }
}

console.log('Schema checks:');

check('valid home data parses', () => {
  parsePage(
    homeSchema,
    {
      title: 'Katie Jarman - Digital Campaigns Coordinator',
      campaignsHexLabel: 'Campaigns History',
      conceptsHexLabel: 'Feeding Liverpool Campaign Concepts',
    },
    'home',
  );
});

expectThrows('home data missing a hexagon label is rejected', () => {
  parsePage(homeSchema, { title: 'Only a title' }, 'home');
});

expectThrows('impact data with the wrong hexagon count is rejected', () => {
  parsePage(
    impactSchema,
    {
      title: 'Community Food Spaces Impact',
      pantryScreenshot: null,
      rowOne: [{ value: '000', label: 'People served' }],
      rowTwo: [],
      rowThree: [],
    },
    'impact',
  );
});

check('image fields default to null when absent', () => {
  const parsed = parsePage(
    z.object({ image: z.string().nullable().default(null) }),
    {},
    'probe',
  );
  if (parsed.image !== null) {
    throw new Error(`expected null, got ${JSON.stringify(parsed.image)}`);
  }
});

if (failures > 0) {
  console.error(`\n${failures} schema check(s) failed.`);
  process.exit(1);
}

console.log('\nRich-text link rewriting:');

function expectEqual(name, actual, expected) {
  if (actual === expected) {
    console.log(`  PASS  ${name}`);
  } else {
    failures += 1;
    console.error(
      `  FAIL  ${name}\n        expected: ${expected}\n        actual:   ${actual}`,
    );
  }
}

expectEqual(
  'root-relative href gains the base prefix',
  withBaseLinks('<a href="/recipes">Menu cards</a>', '/ktjpocsite'),
  '<a href="/ktjpocsite/recipes">Menu cards</a>',
);

expectEqual(
  'absolute URL is left alone',
  withBaseLinks('<a href="https://example.com/x">x</a>', '/ktjpocsite'),
  '<a href="https://example.com/x">x</a>',
);

expectEqual(
  'protocol-relative URL is left alone',
  withBaseLinks('<a href="//example.com/x">x</a>', '/ktjpocsite'),
  '<a href="//example.com/x">x</a>',
);

expectEqual(
  'already-prefixed href is not double-prefixed',
  withBaseLinks('<a href="/ktjpocsite/recipes">x</a>', '/ktjpocsite'),
  '<a href="/ktjpocsite/recipes">x</a>',
);

expectEqual(
  'an empty base leaves content untouched',
  withBaseLinks('<a href="/recipes">x</a>', '/'),
  '<a href="/recipes">x</a>',
);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll checks passed.');
