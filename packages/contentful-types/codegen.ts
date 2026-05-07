import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!SPACE_ID || !TOKEN) {
  console.error('Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN');
  process.exit(1);
}

const srcDir = resolve(import.meta.dirname, 'src');
const tmpDir = resolve(import.meta.dirname, 'src', '_generated_tmp');
mkdirSync(tmpDir, { recursive: true });

// Generate into a temp directory (cf-content-types-generator treats the output as a directory)
execSync(
  `npx cf-content-types-generator --spaceId ${SPACE_ID} --token ${TOKEN} --out ${tmpDir} --typeguard --v10`,
  { stdio: 'inherit' },
);

// Read each individual type file (skip index.ts — it only re-exports)
const typeFiles = readdirSync(tmpDir)
  .filter((f) => f !== 'index.ts' && f.endsWith('.ts'))
  .sort();

const sections: string[] = [];
for (const file of typeFiles) {
  const content = readFileSync(join(tmpDir, file), 'utf-8');
  // Rewrite cross-file imports to nothing (we're merging into one file)
  const cleaned = content
    .replace(/^import type \{ .* \} from "\.\/\w+";\n/gm, '')
    .replace(/^import \{ .* \} from "\.\/\w+";\n/gm, '');
  sections.push(cleaned.trim());
}

// Build merged file
const merged = [
  '// AUTO-GENERATED — do not edit manually. Run `pnpm types:generate` to regenerate.',
  "import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from 'contentful';",
  '',
  ...sections.map((s) => {
    // Strip per-file contentful import lines (already added above)
    return s
      .replace(/^import type \{[^}]+\} from ["']contentful["'];?\n?/gm, '')
      .trim();
  }),
].join('\n\n');

const outFile = resolve(srcDir, 'generated.ts');
writeFileSync(outFile, merged + '\n', 'utf-8');

// Clean up temp dir
rmSync(tmpDir, { recursive: true, force: true });

console.log('Generated Contentful types → src/generated.ts');
