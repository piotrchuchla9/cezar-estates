import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!SPACE_ID || !TOKEN) {
  console.error('Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN');
  process.exit(1);
}

const outDir = resolve(import.meta.dirname, 'src');
mkdirSync(outDir, { recursive: true });

execSync(
  `npx cf-content-types-generator --spaceId ${SPACE_ID} --token ${TOKEN} --out ${outDir}/generated.ts --typeguard --v10`,
  { stdio: 'inherit' },
);

console.log('Generated Contentful types → src/generated.ts');
