/**
 * Contentful Migration Script
 * Provisions content types and sample entries for Cezar Estates.
 * Idempotent: skips existing content types/entries.
 *
 * Run: pnpm setup:contentful
 */

import { resolve } from 'node:path';
import * as dotenv from 'dotenv';

// Load .env.local from repo root
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from 'contentful-management';

// biome-ignore lint/style/noNonNullAssertion: guarded by check below
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
// biome-ignore lint/style/noNonNullAssertion: guarded by check below
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;

if (!SPACE_ID || !CMA_TOKEN) {
  console.error(
    'ERROR: CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set in .env.local',
  );
  process.exit(1);
}

const client = createClient({ accessToken: CMA_TOKEN });

// ---- Helper: sleep ----
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---- Helper: extract HTTP status from contentful-management error ----
// SDK v11 wraps errors with status either on err.status, err.statusCode, or
// inside JSON-encoded err.message. Check all three.
function errorStatus(err: any): number | undefined {
  if (typeof err?.status === 'number') return err.status;
  if (typeof err?.statusCode === 'number') return err.statusCode;
  try {
    const parsed = JSON.parse(err?.message ?? '');
    if (typeof parsed?.status === 'number') return parsed.status;
  } catch {
    // not JSON
  }
  return undefined;
}

// ---- Helper: retry with backoff ----
async function withRetry<T>(fn: () => Promise<T>, retries = 3, initialDelayMs = 2000): Promise<T> {
  let delayMs = initialDelayMs;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const status = errorStatus(err);
      if (i < retries - 1 && (status === 429 || status === 503)) {
        console.log(`  Rate limited, waiting ${delayMs}ms...`);
        await sleep(delayMs);
        delayMs *= 2;
      } else {
        throw err;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// ---- Content Type Definitions ----

const CONTENT_TYPES = [
  {
    id: 'project',
    name: 'Realizacja',
    displayField: 'title',
    fields: [
      { id: 'title', name: 'Title', type: 'Symbol', required: true },
      {
        id: 'slug',
        name: 'Slug',
        type: 'Symbol',
        required: true,
        validations: [{ unique: true }, { regexp: { pattern: '^[a-z0-9-]+$' } }],
      },
      { id: 'location', name: 'Location', type: 'Symbol', required: true },
      {
        id: 'area',
        name: 'Area',
        type: 'Integer',
        required: true,
        validations: [{ range: { min: 0 } }],
      },
      {
        id: 'plotArea',
        name: 'Plot Area',
        type: 'Integer',
        required: false,
        validations: [{ range: { min: 0 } }],
      },
      { id: 'year', name: 'Year', type: 'Integer', required: true },
      {
        id: 'status',
        name: 'Status',
        type: 'Symbol',
        required: true,
        validations: [{ in: ['completed', 'in_progress'] }],
      },
      {
        id: 'shortDescription',
        name: 'Short Description',
        type: 'Text',
        required: true,
        validations: [{ size: { max: 200 } }],
      },
      { id: 'description', name: 'Description', type: 'RichText', required: true },
      {
        id: 'coverImage',
        name: 'Cover Image',
        type: 'Link',
        linkType: 'Asset',
        required: true,
        validations: [{ linkMimetypeGroup: ['image'] }],
      },
      {
        id: 'gallery',
        name: 'Gallery',
        type: 'Array',
        required: false,
        items: {
          type: 'Link',
          linkType: 'Asset',
          validations: [{ linkMimetypeGroup: ['image'] }],
        },
      },
      {
        id: 'features',
        name: 'Features',
        type: 'Array',
        required: false,
        items: { type: 'Symbol', validations: [] },
      },
      {
        id: 'order',
        name: 'Order',
        type: 'Integer',
        required: true,
        defaultValue: { 'en-US': 0 },
      },
    ],
  },
  {
    id: 'inProgressEntry',
    name: 'W budowie',
    displayField: 'title',
    fields: [
      { id: 'title', name: 'Title', type: 'Symbol', required: true },
      {
        id: 'slug',
        name: 'Slug',
        type: 'Symbol',
        required: true,
        validations: [{ unique: true }, { regexp: { pattern: '^[a-z0-9-]+$' } }],
      },
      { id: 'location', name: 'Location', type: 'Symbol', required: true },
      {
        id: 'expectedCompletion',
        name: 'Expected Completion',
        type: 'Symbol',
        required: true,
      },
      {
        id: 'progressPercent',
        name: 'Progress Percent',
        type: 'Integer',
        required: true,
        validations: [{ range: { min: 0, max: 100 } }],
      },
      {
        id: 'coverImage',
        name: 'Cover Image',
        type: 'Link',
        linkType: 'Asset',
        required: true,
        validations: [{ linkMimetypeGroup: ['image'] }],
      },
      {
        id: 'shortDescription',
        name: 'Short Description',
        type: 'Text',
        required: true,
        validations: [{ size: { max: 200 } }],
      },
    ],
  },
  {
    id: 'processStep',
    name: 'Process Step',
    displayField: 'title',
    fields: [
      {
        id: 'number',
        name: 'Number',
        type: 'Integer',
        required: true,
        validations: [{ range: { min: 1, max: 10 } }],
      },
      { id: 'title', name: 'Title', type: 'Symbol', required: true },
      {
        id: 'description',
        name: 'Description',
        type: 'Text',
        required: true,
        validations: [{ size: { max: 300 } }],
      },
      { id: 'icon', name: 'Icon', type: 'Symbol', required: false },
    ],
  },
  {
    id: 'siteSettings',
    name: 'Site Settings',
    displayField: 'heroHeadline',
    fields: [
      { id: 'heroHeadline', name: 'Hero Headline', type: 'Symbol', required: true },
      {
        id: 'heroSubheadline',
        name: 'Hero Subheadline',
        type: 'Text',
        required: true,
      },
      {
        id: 'heroBackgroundImage',
        name: 'Hero Background Image',
        type: 'Link',
        linkType: 'Asset',
        required: true,
        validations: [{ linkMimetypeGroup: ['image'] }],
      },
      { id: 'aboutHeadline', name: 'About Headline', type: 'Symbol', required: true },
      { id: 'aboutBody', name: 'About Body', type: 'RichText', required: true },
      {
        id: 'aboutPortrait',
        name: 'About Portrait',
        type: 'Link',
        linkType: 'Asset',
        required: true,
        validations: [{ linkMimetypeGroup: ['image'] }],
      },
      {
        id: 'processSteps',
        name: 'Process Steps',
        type: 'Array',
        required: true,
        items: {
          type: 'Link',
          linkType: 'Entry',
          validations: [{ linkContentType: ['processStep'] }],
        },
      },
      { id: 'contactEmail', name: 'Contact Email', type: 'Symbol', required: true },
      { id: 'contactPhone', name: 'Contact Phone', type: 'Symbol', required: true },
      {
        id: 'contactCity',
        name: 'Contact City',
        type: 'Symbol',
        required: true,
        defaultValue: { 'en-US': 'Kraków' },
      },
      { id: 'socialInstagram', name: 'Social Instagram', type: 'Symbol', required: false },
      { id: 'socialFacebook', name: 'Social Facebook', type: 'Symbol', required: false },
    ],
  },
];

// ---- Asset definitions ----
const ASSETS = [
  {
    id: 'asset-hero-bg',
    title: 'Hero Background',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920',
    filename: 'hero-background.jpg',
  },
  {
    id: 'asset-about-portrait',
    title: 'About Portrait',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600',
    filename: 'about-portrait.jpg',
  },
  {
    id: 'asset-project1-cover',
    title: 'Dom Słoneczny Cover',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600',
    filename: 'dom-sloneczny-cover.jpg',
  },
  {
    id: 'asset-project2-cover',
    title: 'Willa Akacja Cover',
    url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600',
    filename: 'willa-akacja-cover.jpg',
  },
  {
    id: 'asset-inprogress-cover',
    title: 'Dom Brzozowy Cover',
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600',
    filename: 'dom-brzozowy-cover.jpg',
  },
];

// ---- RichText helper ----
function makeRichText(text: string) {
  return {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'paragraph',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: text,
            marks: [],
            data: {},
          },
        ],
      },
    ],
  };
}

function assetLink(assetId: string) {
  return {
    sys: { type: 'Link', linkType: 'Asset', id: assetId },
  };
}

function entryLink(entryId: string) {
  return {
    sys: { type: 'Link', linkType: 'Entry', id: entryId },
  };
}

// ---- Main ----
async function main() {
  console.log('\n=== Cezar Estates – Contentful Setup ===\n');

  const space = await client.getSpace(SPACE_ID);
  const env = await space.getEnvironment('master');
  console.log(`Connected to space: ${space.name} (${SPACE_ID})`);

  let typesCreated = 0;
  let typesSkipped = 0;

  // ---- 1. Create content types ----
  console.log('\n--- Content Types ---');
  for (const ct of CONTENT_TYPES) {
    try {
      const existing = await env.getContentType(ct.id);
      console.log(`  SKIP  [${ct.id}] already exists (version ${existing.sys.version})`);
      typesSkipped++;
    } catch (err: any) {
      if (errorStatus(err) !== 404) throw err;

      // Build fields payload
      const fields = ct.fields.map((f: any) => {
        const field: any = {
          id: f.id,
          name: f.name,
          type: f.type,
          required: f.required,
        };
        if (f.type === 'Link') {
          field.linkType = f.linkType;
        }
        if (f.validations) {
          field.validations = f.validations;
        }
        if (f.items) {
          field.items = f.items;
        }
        if (f.defaultValue) {
          field.defaultValue = f.defaultValue;
        }
        return field;
      });

      const created = await withRetry(() =>
        env.createContentTypeWithId(ct.id, {
          name: ct.name,
          displayField: ct.displayField,
          fields,
        }),
      );
      await withRetry(() => created.publish());
      console.log(`  CREATE [${ct.id}] "${ct.name}" — published`);
      typesCreated++;
    }
    await sleep(300);
  }

  // ---- 2. Upload assets ----
  console.log('\n--- Assets ---');
  let assetsCreated = 0;
  let assetsSkipped = 0;
  const assetIdMap: Record<string, string> = {};

  for (const a of ASSETS) {
    assetIdMap[a.id] = a.id;
    try {
      const existing = await env.getAsset(a.id);
      console.log(`  SKIP  [${a.id}] "${a.title}" already exists`);
      assetsSkipped++;
    } catch (err: any) {
      if (errorStatus(err) !== 404) throw err;

      const asset = await withRetry(() =>
        env.createAssetWithId(a.id, {
          fields: {
            title: { 'en-US': a.title },
            file: {
              'en-US': {
                contentType: 'image/jpeg',
                fileName: a.filename,
                upload: a.url,
              },
            },
          },
        }),
      );

      console.log(`  UPLOAD [${a.id}] "${a.title}" — processing...`);
      const processed = await withRetry(() => asset.processForAllLocales(), 5, 3000);
      // Wait for processing to finish
      await sleep(4000);
      // Fetch fresh copy and publish
      const fresh = await withRetry(() => env.getAsset(a.id));
      await withRetry(() => fresh.publish());
      console.log(`  DONE   [${a.id}] "${a.title}" — published`);
      assetsCreated++;
    }
    await sleep(500);
  }

  // ---- 3. Create ProcessStep entries ----
  console.log('\n--- ProcessStep Entries ---');
  const processSteps = [
    {
      id: 'entry-process-1',
      number: 1,
      title: 'Konsultacja',
      description: 'Spotykamy się, analizujemy działkę i wasze oczekiwania. Bezpłatnie.',
    },
    {
      id: 'entry-process-2',
      number: 2,
      title: 'Projekt',
      description: 'Architekt projektuje dom dopasowany do potrzeb. Wycena i umowa.',
    },
    {
      id: 'entry-process-3',
      number: 3,
      title: 'Budowa',
      description: 'Realizacja z raportami fotograficznymi co tydzień. Bez ukrytych kosztów.',
    },
    {
      id: 'entry-process-4',
      number: 4,
      title: 'Klucze',
      description: 'Odbiór techniczny + 5-letnia gwarancja na konstrukcję.',
    },
  ];

  const processStepIds: string[] = [];
  let entriesCreated = 0;
  let entriesSkipped = 0;

  for (const step of processSteps) {
    processStepIds.push(step.id);
    try {
      const existing = await env.getEntry(step.id);
      console.log(`  SKIP  [${step.id}] "${step.title}" already exists`);
      entriesSkipped++;
    } catch (err: any) {
      if (errorStatus(err) !== 404) throw err;

      const entry = await withRetry(() =>
        env.createEntryWithId('processStep', step.id, {
          fields: {
            number: { 'en-US': step.number },
            title: { 'en-US': step.title },
            description: { 'en-US': step.description },
          },
        }),
      );
      await withRetry(() => entry.publish());
      console.log(`  CREATE [${step.id}] "${step.title}" — published`);
      entriesCreated++;
    }
    await sleep(300);
  }

  // ---- 4. Create siteSettings entry ----
  console.log('\n--- SiteSettings Entry ---');
  const siteSettingsId = 'entry-site-settings';
  const aboutBodyRichText = makeRichText(
    'Cezar Estates to butikowy deweloper z Krakowa. Od 15 lat tworzymy domy szyte na miarę — z troską o jakość, terminy i detale. Każdy projekt traktujemy indywidualnie, bo każda rodzina jest inna.',
  );

  try {
    const existing = await env.getEntry(siteSettingsId);
    console.log(`  SKIP  [${siteSettingsId}] siteSettings already exists`);
    entriesSkipped++;
  } catch (err: any) {
    if (errorStatus(err) !== 404) throw err;

    const entry = await withRetry(() =>
      env.createEntryWithId('siteSettings', siteSettingsId, {
        fields: {
          heroHeadline: { 'en-US': 'Domy na pokolenia.' },
          heroSubheadline: {
            'en-US':
              'Indywidualne projekty domów jednorodzinnych w Krakowie i okolicach. Od pomysłu po klucze.',
          },
          heroBackgroundImage: { 'en-US': assetLink('asset-hero-bg') },
          aboutHeadline: {
            'en-US': 'Budujemy domy, w których chce się żyć. Dosłownie.',
          },
          aboutBody: { 'en-US': aboutBodyRichText },
          aboutPortrait: { 'en-US': assetLink('asset-about-portrait') },
          processSteps: {
            'en-US': processStepIds.map((id) => entryLink(id)),
          },
          contactEmail: { 'en-US': 'piotrchuchla9@gmail.com' },
          contactPhone: { 'en-US': '+48 505 455 811' },
          contactCity: { 'en-US': 'Kraków' },
        },
      }),
    );
    await withRetry(() => entry.publish());
    console.log(`  CREATE [${siteSettingsId}] siteSettings — published`);
    entriesCreated++;
  }

  // ---- 5. Create Project entries ----
  console.log('\n--- Project Entries ---');
  const descriptionRichText = makeRichText(
    'Dom zaprojektowany z myślą o rodzinie ceniącej spokój i przestrzeń. Otwarty plan parteru, duże okna otwierające widok na ogród, najwyższej jakości materiały wykończeniowe.',
  );

  const projects = [
    {
      id: 'entry-project-dom-sloneczny',
      title: 'Dom Słoneczny',
      slug: 'dom-sloneczny',
      location: 'Wieliczka',
      area: 180,
      year: 2025,
      status: 'completed',
      shortDescription: 'Parterowy dom z dużym ogrodem i tarasem południowym.',
      features: ['parter', 'garaż 2-stan.', 'ogród', 'fotowoltaika'],
      order: 1,
      coverImageAssetId: 'asset-project1-cover',
    },
    {
      id: 'entry-project-willa-akacja',
      title: 'Willa Akacja',
      slug: 'willa-akacja',
      location: 'Zabierzów',
      area: 240,
      year: 2024,
      status: 'completed',
      shortDescription: 'Dwukondygnacyjny dom z tarasem i ogromnym salonem.',
      features: ['piętro', 'garaż 2-stan.', 'kominek'],
      order: 2,
      coverImageAssetId: 'asset-project2-cover',
    },
  ];

  for (const p of projects) {
    try {
      const existing = await env.getEntry(p.id);
      console.log(`  SKIP  [${p.id}] "${p.title}" already exists`);
      entriesSkipped++;
    } catch (err: any) {
      if (errorStatus(err) !== 404) throw err;

      const entry = await withRetry(() =>
        env.createEntryWithId('project', p.id, {
          fields: {
            title: { 'en-US': p.title },
            slug: { 'en-US': p.slug },
            location: { 'en-US': p.location },
            area: { 'en-US': p.area },
            year: { 'en-US': p.year },
            status: { 'en-US': p.status },
            shortDescription: { 'en-US': p.shortDescription },
            description: { 'en-US': descriptionRichText },
            coverImage: { 'en-US': assetLink(p.coverImageAssetId) },
            features: { 'en-US': p.features },
            order: { 'en-US': p.order },
          },
        }),
      );
      await withRetry(() => entry.publish());
      console.log(`  CREATE [${p.id}] "${p.title}" — published`);
      entriesCreated++;
    }
    await sleep(300);
  }

  // ---- 6. Create InProgressEntry ----
  console.log('\n--- InProgressEntry ---');
  const inProgressId = 'entry-inprogress-dom-brzozowy';
  try {
    const existing = await env.getEntry(inProgressId);
    console.log(`  SKIP  [${inProgressId}] "Dom Brzozowy" already exists`);
    entriesSkipped++;
  } catch (err: any) {
    if (errorStatus(err) !== 404) throw err;

    const entry = await withRetry(() =>
      env.createEntryWithId('inProgressEntry', inProgressId, {
        fields: {
          title: { 'en-US': 'Dom Brzozowy' },
          slug: { 'en-US': 'dom-brzozowy' },
          location: { 'en-US': 'Mogilany' },
          expectedCompletion: { 'en-US': 'Q3 2026' },
          progressPercent: { 'en-US': 65 },
          shortDescription: {
            'en-US': 'Stan surowy zamknięty, w trakcie wykończeń wewnętrznych.',
          },
          coverImage: { 'en-US': assetLink('asset-inprogress-cover') },
        },
      }),
    );
    await withRetry(() => entry.publish());
    console.log(`  CREATE [${inProgressId}] "Dom Brzozowy" — published`);
    entriesCreated++;
  }

  // ---- Summary ----
  console.log('\n=== Summary ===');
  console.log(`Content Types: ${typesCreated} created, ${typesSkipped} skipped`);
  console.log(`Assets:        ${assetsCreated} created, ${assetsSkipped} skipped`);
  console.log(`Entries:       ${entriesCreated} created, ${entriesSkipped} skipped`);
  console.log(
    `\nTotal: ${typesCreated} types, ${assetsCreated} assets, ${entriesCreated} entries provisioned`,
  );
  console.log('\n✓ Setup complete!\n');
}

main().catch((err) => {
  console.error('\nFATAL:', err?.message || err);
  if (err?.details) {
    console.error('Details:', JSON.stringify(err.details, null, 2));
  }
  process.exit(1);
});
