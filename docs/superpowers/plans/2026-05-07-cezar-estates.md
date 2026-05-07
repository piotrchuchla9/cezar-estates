# Cezar Estates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, fully-responsive landing site for Cezar Estates (Polish home developer) with Contentful CMS, Resend contact form, and modern bold visual style.

**Architecture:** pnpm monorepo with `apps/web` (Astro 5 + React islands + TypeScript strict + Tailwind 4) and `packages/contentful-types` (auto-generated TS types from Contentful schema). SSG build pulls all content at build time. Vercel hosts static output and a single serverless function for the contact form (Resend + Cloudflare Turnstile anti-spam).

**Tech Stack:** Astro 5, React 19, TypeScript 5, Tailwind 4, Contentful, Resend, React Email, motion (motion.dev), Lenis, Cloudflare Turnstile, Vercel, pnpm + Turborepo, Biome, Vitest, Playwright.

**Reference spec:** `docs/superpowers/specs/2026-05-07-cezar-estates-design.md`

---

## File Structure (created by this plan)

```
cezar/
├── package.json                              # workspace root
├── pnpm-workspace.yaml
├── turbo.json
├── biome.json
├── tsconfig.base.json
├── .gitignore
├── .nvmrc
├── .env.example
├── README.md
│
├── apps/web/
│   ├── package.json
│   ├── astro.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vercel.json                            # CSP, HSTS, redirects
│   ├── playwright.config.ts
│   ├── vitest.config.ts
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── robots.txt
│   │   └── og-default.jpg                     # placeholder, swap later
│   └── src/
│       ├── env.d.ts
│       ├── pages/
│       │   ├── index.astro
│       │   ├── realizacje/
│       │   │   ├── index.astro
│       │   │   └── [slug].astro
│       │   ├── w-budowie.astro
│       │   ├── kontakt.astro
│       │   ├── polityka-prywatnosci.astro
│       │   └── api/
│       │       └── contact.ts
│       ├── layouts/
│       │   └── Base.astro
│       ├── components/
│       │   ├── astro/
│       │   │   ├── Nav.astro
│       │   │   ├── Footer.astro
│       │   │   ├── Hero.astro
│       │   │   ├── About.astro
│       │   │   ├── ProjectCard.astro
│       │   │   ├── ProjectsGrid.astro
│       │   │   ├── Process.astro
│       │   │   ├── ProcessStep.astro
│       │   │   ├── InProgressCard.astro
│       │   │   ├── InProgressGrid.astro
│       │   │   └── ContactSection.astro
│       │   └── react/
│       │       ├── ScrollReveal.tsx
│       │       ├── MagneticButton.tsx
│       │       ├── CountUp.tsx
│       │       ├── ProgressBar.tsx
│       │       ├── Gallery.tsx
│       │       ├── ContactForm.tsx
│       │       ├── SmoothScroll.tsx
│       │       └── HeroParallax.tsx
│       ├── lib/
│       │   ├── contentful.ts                  # client + queries
│       │   ├── contentful.test.ts
│       │   ├── resend.ts                      # email send
│       │   ├── validation.ts                  # zod schemas
│       │   ├── validation.test.ts
│       │   ├── turnstile.ts                   # token verify
│       │   ├── turnstile.test.ts
│       │   ├── seo.ts                         # meta + JSON-LD helpers
│       │   └── animations.ts                  # motion variants
│       ├── emails/
│       │   └── ContactNotification.tsx        # React Email template
│       ├── styles/
│       │   └── globals.css                    # Tailwind + tokens
│       └── tests/
│           └── e2e/
│               ├── home.spec.ts
│               └── contact.spec.ts
│
├── packages/contentful-types/
│   ├── package.json
│   ├── tsconfig.json
│   ├── codegen.ts
│   └── src/
│       ├── index.ts
│       └── generated.ts                       # auto-gen, gitignored
│
└── docs/
    └── superpowers/
        ├── specs/2026-05-07-cezar-estates-design.md   (already exists)
        └── plans/2026-05-07-cezar-estates.md          (this file)
```

---

## Phase 1 — Monorepo Foundation

### Task 1: Initialize monorepo root

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `biome.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.nvmrc`
- Create: `.env.example`
- Create: `README.md`

- [ ] **Step 1: Verify Node 22 and pnpm 9+ installed**

```bash
node --version    # expect v22.x
pnpm --version    # expect 9.x+; install: `npm i -g pnpm`
```

- [ ] **Step 2: Initialize git repo**

```bash
cd E:/projects/cezar
git init
git branch -M main
```

- [ ] **Step 3: Create `.nvmrc`**

```
22
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules/
.turbo/
dist/
.astro/
.vercel/
.env
.env.local
.env.*.local
*.log
.DS_Store
.superpowers/
packages/contentful-types/src/generated.ts
playwright-report/
test-results/
coverage/
```

- [ ] **Step 5: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 6: Create root `package.json`**

```json
{
  "name": "cezar",
  "version": "0.0.0",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "engines": { "node": ">=22.0.0" },
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "typecheck": "turbo run typecheck",
    "lint": "biome check .",
    "format": "biome format --write .",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "types:generate": "pnpm --filter @cezar/contentful-types generate"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "turbo": "^2.3.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 7: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env", ".env.local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".astro/**"],
      "env": [
        "CONTENTFUL_SPACE_ID",
        "CONTENTFUL_DELIVERY_TOKEN",
        "RESEND_API_KEY",
        "CONTACT_EMAIL",
        "CONTACT_FROM_EMAIL",
        "SITE_URL",
        "PUBLIC_TURNSTILE_SITE_KEY",
        "TURNSTILE_SECRET_KEY"
      ]
    },
    "dev": { "cache": false, "persistent": true },
    "typecheck": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"] },
    "test:e2e": { "dependsOn": ["^build"] },
    "generate": { "cache": false }
  }
}
```

- [ ] **Step 8: Create `biome.json`**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "files": {
    "ignore": ["**/dist/**", "**/.astro/**", "**/.vercel/**", "**/generated.ts", "**/node_modules/**"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": { "useImportType": "error" },
      "suspicious": { "noExplicitAny": "warn" }
    }
  },
  "javascript": { "formatter": { "quoteStyle": "single", "semicolons": "always" } }
}
```

- [ ] **Step 9: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
```

- [ ] **Step 10: Create `.env.example`**

```
# Contentful
CONTENTFUL_SPACE_ID=
CONTENTFUL_DELIVERY_TOKEN=
CONTENTFUL_PREVIEW_TOKEN=
CONTENTFUL_MANAGEMENT_TOKEN=

# Resend
RESEND_API_KEY=
CONTACT_EMAIL=piotrchuchla9@gmail.com
CONTACT_FROM_EMAIL=onboarding@resend.dev

# Cloudflare Turnstile
PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Site
SITE_URL=http://localhost:4321
```

- [ ] **Step 11: Create minimal `README.md`**

```markdown
# Cezar Estates

Static landing site for Cezar Estates (Kraków home developer).

## Quick start

```bash
pnpm install
cp .env.example .env.local   # fill values
pnpm types:generate           # generate Contentful types
pnpm dev                      # http://localhost:4321
```

## Stack

Astro 5 · React · TypeScript · Tailwind 4 · Contentful · Resend · Vercel.

See `docs/superpowers/specs/2026-05-07-cezar-estates-design.md` for design.
```

- [ ] **Step 12: Install root devDependencies**

```bash
pnpm install
```

Expected: pnpm creates `node_modules/`, no errors. `pnpm-lock.yaml` generated.

- [ ] **Step 13: Commit**

```bash
git add .
git commit -m "chore: initialize monorepo (pnpm workspaces, turbo, biome)"
```

---

### Task 2: Initialize `apps/web` Astro application

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/astro.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/src/env.d.ts`
- Create: `apps/web/src/styles/globals.css`
- Create: `apps/web/src/pages/index.astro` (placeholder)
- Create: `apps/web/public/favicon.svg`

- [ ] **Step 1: Create `apps/web/package.json`**

```json
{
  "name": "@cezar/web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "typecheck": "astro check && tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@astrojs/check": "^0.9.4",
    "@astrojs/react": "^4.1.0",
    "@astrojs/sitemap": "^3.2.1",
    "@astrojs/vercel": "^8.0.0",
    "@cezar/contentful-types": "workspace:*",
    "@tailwindcss/vite": "^4.0.0",
    "astro": "^5.0.0",
    "contentful": "^11.0.0",
    "lenis": "^1.1.18",
    "lucide-react": "^0.460.0",
    "motion": "^11.13.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "resend": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "zod": "^3.23.8",
    "@react-email/components": "^0.0.31",
    "@react-email/render": "^1.0.3"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vercel/analytics": "^1.4.1",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `apps/web/tsconfig.json`**

```json
{
  "extends": ["astro/tsconfigs/strict", "../../tsconfig.base.json"],
  "include": ["src/**/*", "tests/**/*", ".astro/types.d.ts"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": { "~/*": ["src/*"] }
  }
}
```

- [ ] **Step 3: Create `apps/web/astro.config.ts`**

```typescript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: true },
    imageService: true,
  }),
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
```

- [ ] **Step 4: Create `apps/web/tailwind.config.ts`**

(Tailwind 4 uses CSS-based config; this file is a stub for IDE compat.)

```typescript
import type { Config } from 'tailwindcss';
export default {} satisfies Config;
```

- [ ] **Step 5: Create `apps/web/src/styles/globals.css`**

```css
@import 'tailwindcss';

@theme {
  --color-bg: #fafaf7;
  --color-ink: #0a0a0a;
  --color-ink-muted: #4a4a4a;
  --color-accent: #1f3a2e;
  --color-accent-soft: #d9d4c7;
  --color-line: #e5e2da;

  --font-sans: 'Inter', system-ui, sans-serif;
  --font-serif: Georgia, 'Times New Roman', serif;

  --container-page: 1280px;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

body {
  background: var(--color-bg);
  color: var(--color-ink);
  font-family: var(--font-sans);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Create `apps/web/src/env.d.ts`**

```typescript
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly CONTENTFUL_SPACE_ID: string;
  readonly CONTENTFUL_DELIVERY_TOKEN: string;
  readonly CONTENTFUL_PREVIEW_TOKEN?: string;
  readonly RESEND_API_KEY: string;
  readonly CONTACT_EMAIL: string;
  readonly CONTACT_FROM_EMAIL: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
  readonly TURNSTILE_SECRET_KEY: string;
  readonly SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 7: Create `apps/web/public/favicon.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#1F3A2E"/><text x="16" y="22" font-family="Inter,sans-serif" font-size="18" font-weight="800" fill="#FAFAF7" text-anchor="middle">C</text></svg>
```

- [ ] **Step 8: Create `apps/web/src/pages/index.astro` (placeholder)**

```astro
---
import '~/styles/globals.css';
---
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>Cezar Estates</title>
  </head>
  <body>
    <main class="p-8">
      <h1 class="text-4xl font-extrabold">Cezar Estates — w budowie</h1>
    </main>
  </body>
</html>
```

- [ ] **Step 9: Install and run dev**

```bash
pnpm install
pnpm --filter @cezar/web dev
```

Expected: dev server boots on `http://localhost:4321`, page shows "Cezar Estates — w budowie". Stop with Ctrl+C.

- [ ] **Step 10: Run typecheck**

```bash
pnpm --filter @cezar/web typecheck
```

Expected: 0 errors.

- [ ] **Step 11: Commit**

```bash
git add .
git commit -m "feat(web): scaffold Astro app with Tailwind 4 and React"
```

---

### Task 3: Initialize `packages/contentful-types`

**Files:**
- Create: `packages/contentful-types/package.json`
- Create: `packages/contentful-types/tsconfig.json`
- Create: `packages/contentful-types/codegen.ts`
- Create: `packages/contentful-types/src/index.ts`

- [ ] **Step 1: Create `packages/contentful-types/package.json`**

```json
{
  "name": "@cezar/contentful-types",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": {
    "generate": "tsx codegen.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "contentful": "^11.0.0"
  },
  "devDependencies": {
    "contentful-management": "^11.0.0",
    "cf-content-types-generator": "^2.15.5",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Create `packages/contentful-types/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*", "codegen.ts"],
  "compilerOptions": {
    "outDir": "dist",
    "noEmit": true
  }
}
```

- [ ] **Step 3: Create `packages/contentful-types/codegen.ts`**

```typescript
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
```

- [ ] **Step 4: Create `packages/contentful-types/src/index.ts` (placeholder until codegen runs)**

```typescript
// This file re-exports auto-generated types from `./generated.ts`.
// Run `pnpm types:generate` from repo root after Contentful schema is set up (Task 4).
export type {} from './generated';
```

- [ ] **Step 5: Run install + typecheck**

```bash
pnpm install
pnpm --filter @cezar/contentful-types typecheck
```

Expected: typecheck fails because `./generated` doesn't exist yet. That's fine — will be created in Task 5. For now create an empty stub so monorepo builds.

- [ ] **Step 6: Create empty `src/generated.ts` stub**

```typescript
// Placeholder — replaced by codegen in Task 5.
export {};
```

- [ ] **Step 7: Re-run typecheck**

```bash
pnpm --filter @cezar/contentful-types typecheck
```

Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat(contentful-types): scaffold package with codegen script"
```

---

## Phase 2 — Contentful Setup

### Task 4: Provision Contentful space and content types

**Files:** none (manual setup via Contentful UI), but document in:
- Create: `docs/contentful-setup.md`

This task is **manual UI work**. Document each step so it's reproducible.

- [ ] **Step 1: Create Contentful account + space**

Sign up at https://www.contentful.com (free Community tier). Create a new space named "Cezar Estates".

- [ ] **Step 2: Create API tokens**

Settings → API keys:
- Add new API key. Copy `Space ID`, `Content Delivery API token`, `Content Preview API token`.
- Settings → API keys → Content management tokens → Generate. Copy token (shown once).

- [ ] **Step 3: Add tokens to `.env.local`**

```
CONTENTFUL_SPACE_ID=<from step 2>
CONTENTFUL_DELIVERY_TOKEN=<from step 2>
CONTENTFUL_PREVIEW_TOKEN=<from step 2>
CONTENTFUL_MANAGEMENT_TOKEN=<from step 2>
```

- [ ] **Step 4: Create content type `Project`**

Content model → Add content type. ID: `project`. Fields:
- `title` — Short text, required, used as entry title
- `slug` — Short text, required, unique, validation: matches `^[a-z0-9-]+$`
- `location` — Short text, required
- `area` — Number (integer), required, min 0
- `plotArea` — Number (integer), optional, min 0
- `year` — Number (integer), required
- `status` — Short text, required, validation: in `[completed, in_progress]`
- `shortDescription` — Long text, required, max 200 chars
- `description` — Rich text, required
- `coverImage` — Media, required, accept image only
- `gallery` — Media (many), optional, accept image only
- `features` — Short text (list), optional
- `order` — Number (integer), required, default 0

- [ ] **Step 5: Create content type `InProgressEntry`**

ID: `inProgressEntry`. Fields:
- `title` — Short text, required
- `slug` — Short text, required, unique, regex `^[a-z0-9-]+$`
- `location` — Short text, required
- `expectedCompletion` — Short text, required
- `progressPercent` — Number (integer), required, range 0-100
- `coverImage` — Media, required
- `shortDescription` — Long text, required, max 200 chars

- [ ] **Step 6: Create content type `ProcessStep`**

ID: `processStep`. Fields:
- `number` — Number (integer), required, range 1-10
- `title` — Short text, required
- `description` — Long text, required, max 300 chars
- `icon` — Short text, optional (Lucide icon name)

- [ ] **Step 7: Create content type `SiteSettings` (singleton)**

ID: `siteSettings`. Fields:
- `heroHeadline` — Short text, required
- `heroSubheadline` — Long text, required
- `heroBackgroundImage` — Media, required
- `aboutHeadline` — Short text, required
- `aboutBody` — Rich text, required
- `aboutPortrait` — Media, required
- `processSteps` — References (many), required, accept `processStep` only
- `contactEmail` — Short text, required
- `contactPhone` — Short text, required
- `contactCity` — Short text, required, default "Kraków"
- `socialInstagram` — Short text, optional
- `socialFacebook` — Short text, optional

After creating, add a single `SiteSettings` entry. Mark unique-singleton via UI hint (no built-in enforcement; convention only).

- [ ] **Step 8: Add 2 sample `Project` entries (one completed, one in_progress) and 1 `InProgressEntry`**

This unblocks frontend work; real content can be added later by Ewa.

- [ ] **Step 9: Document setup**

Create `docs/contentful-setup.md` summarizing the steps above (so Ewa or future devs can recreate the schema).

- [ ] **Step 10: Commit**

```bash
git add docs/contentful-setup.md
git commit -m "docs: contentful schema setup guide"
```

---

### Task 5: Generate Contentful TypeScript types

**Files:**
- Modify: `packages/contentful-types/src/generated.ts` (auto-generated)
- Modify: `packages/contentful-types/src/index.ts`

- [ ] **Step 1: Run codegen**

```bash
pnpm types:generate
```

Expected: `packages/contentful-types/src/generated.ts` populated with `TypeProject`, `TypeInProgressEntry`, `TypeProcessStep`, `TypeSiteSettings` interfaces and typeguards.

- [ ] **Step 2: Update `packages/contentful-types/src/index.ts` with explicit re-exports**

```typescript
export type {
  TypeProject,
  TypeProjectFields,
  TypeInProgressEntry,
  TypeInProgressEntryFields,
  TypeProcessStep,
  TypeProcessStepFields,
  TypeSiteSettings,
  TypeSiteSettingsFields,
} from './generated';

export {
  isTypeProject,
  isTypeInProgressEntry,
  isTypeProcessStep,
  isTypeSiteSettings,
} from './generated';
```

- [ ] **Step 3: Verify typecheck**

```bash
pnpm --filter @cezar/contentful-types typecheck
pnpm --filter @cezar/web typecheck
```

Expected: 0 errors in both.

- [ ] **Step 4: Commit (excluding generated.ts which is gitignored)**

```bash
git add packages/contentful-types/src/index.ts
git commit -m "feat(contentful-types): export generated types and typeguards"
```

---

### Task 6: Contentful client and queries

**Files:**
- Create: `apps/web/src/lib/contentful.ts`
- Create: `apps/web/src/lib/contentful.test.ts`

- [ ] **Step 1: Write failing test for `getCompletedProjects`**

`apps/web/src/lib/contentful.test.ts`:

```typescript
import { describe, expect, it, vi } from 'vitest';
import { sortProjectsForDisplay } from './contentful';

describe('sortProjectsForDisplay', () => {
  it('sorts projects by `order` ascending then by `year` descending', () => {
    const projects = [
      { fields: { order: 2, year: 2024, title: 'B' } },
      { fields: { order: 1, year: 2023, title: 'A' } },
      { fields: { order: 1, year: 2025, title: 'A2' } },
    // biome-ignore lint/suspicious/noExplicitAny: minimal fixture
    ] as any[];

    const sorted = sortProjectsForDisplay(projects);

    expect(sorted.map((p) => p.fields.title)).toEqual(['A2', 'A', 'B']);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
pnpm --filter @cezar/web test
```

Expected: FAIL — `sortProjectsForDisplay` not exported.

- [ ] **Step 3: Create `apps/web/src/lib/contentful.ts`**

```typescript
import { createClient, type Entry } from 'contentful';
import type {
  TypeProject,
  TypeInProgressEntry,
  TypeSiteSettings,
} from '@cezar/contentful-types';

const space = import.meta.env.CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.CONTENTFUL_DELIVERY_TOKEN;

if (!space || !accessToken) {
  throw new Error('Missing CONTENTFUL_SPACE_ID or CONTENTFUL_DELIVERY_TOKEN');
}

export const cf = createClient({ space, accessToken });

export function sortProjectsForDisplay<T extends Entry<TypeProject>>(projects: T[]): T[] {
  return [...projects].sort((a, b) => {
    const orderDiff = (a.fields.order ?? 0) - (b.fields.order ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return (b.fields.year ?? 0) - (a.fields.year ?? 0);
  });
}

export async function getCompletedProjects(limit = 100) {
  const res = await cf.getEntries<TypeProject>({
    content_type: 'project',
    'fields.status': 'completed',
    limit,
  });
  return sortProjectsForDisplay(res.items);
}

export async function getProjectBySlug(slug: string) {
  const res = await cf.getEntries<TypeProject>({
    content_type: 'project',
    'fields.slug': slug,
    limit: 1,
  });
  return res.items[0] ?? null;
}

export async function getInProgressEntries(limit = 100) {
  const res = await cf.getEntries<TypeInProgressEntry>({
    content_type: 'inProgressEntry',
    limit,
  });
  return res.items;
}

export async function getSiteSettings() {
  const res = await cf.getEntries<TypeSiteSettings>({
    content_type: 'siteSettings',
    limit: 1,
    include: 2,
  });
  const settings = res.items[0];
  if (!settings) throw new Error('SiteSettings entry missing in Contentful');
  return settings;
}
```

- [ ] **Step 4: Create `apps/web/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
```

- [ ] **Step 5: Run test — expect PASS**

```bash
pnpm --filter @cezar/web test
```

Expected: 1 passing.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(web): contentful client and query helpers"
```

---

## Phase 3 — Layout, Nav, Footer, Base Page Frame

### Task 7: Base layout with SEO + fonts

**Files:**
- Create: `apps/web/src/lib/seo.ts`
- Create: `apps/web/src/layouts/Base.astro`
- Modify: `apps/web/src/styles/globals.css` (add font-face)

- [ ] **Step 1: Create `apps/web/src/lib/seo.ts`**

```typescript
export interface SeoProps {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

export function buildSeo(props: SeoProps, siteUrl: string) {
  const fullTitle = props.title === 'Cezar Estates'
    ? props.title
    : `${props.title} — Cezar Estates`;
  const canonical = props.canonical ?? siteUrl;
  const ogImage = props.ogImage ?? `${siteUrl}/og-default.jpg`;
  return { title: fullTitle, description: props.description, canonical, ogImage, noindex: props.noindex ?? false };
}

export function organizationJsonLd(siteUrl: string, phone: string, email: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Cezar Estates',
    url: siteUrl,
    telephone: phone,
    email,
    address: { '@type': 'PostalAddress', addressLocality: 'Kraków', addressCountry: 'PL' },
    areaServed: 'Kraków, Małopolska',
  };
}
```

- [ ] **Step 2: Add Inter font preload to globals.css**

Add at the top of `apps/web/src/styles/globals.css` (above `@import 'tailwindcss';`):

```css
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400 800;
  font-display: swap;
  src: url('/fonts/Inter-Variable.woff2') format('woff2');
}
```

- [ ] **Step 3: Download Inter Variable woff2**

Download `Inter-Variable.woff2` from https://rsms.me/inter/font-files/InterVariable.woff2 and save to `apps/web/public/fonts/Inter-Variable.woff2`.

(Verify by listing: `ls apps/web/public/fonts/` should show `Inter-Variable.woff2`.)

- [ ] **Step 4: Create `apps/web/src/layouts/Base.astro`**

```astro
---
import '~/styles/globals.css';
import { buildSeo, organizationJsonLd, type SeoProps } from '~/lib/seo';
import Nav from '~/components/astro/Nav.astro';
import Footer from '~/components/astro/Footer.astro';
import { getSiteSettings } from '~/lib/contentful';

interface Props { seo: SeoProps }
const { seo } = Astro.props;

const siteUrl = import.meta.env.SITE_URL;
const meta = buildSeo(seo, siteUrl);
const settings = await getSiteSettings();
const jsonLd = organizationJsonLd(
  siteUrl,
  settings.fields.contactPhone,
  settings.fields.contactEmail,
);
---
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preload" href="/fonts/Inter-Variable.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="canonical" href={meta.canonical} />
    <title>{meta.title}</title>
    <meta name="description" content={meta.description} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={meta.title} />
    <meta property="og:description" content={meta.description} />
    <meta property="og:image" content={meta.ogImage} />
    <meta property="og:locale" content="pl_PL" />
    <meta name="twitter:card" content="summary_large_image" />
    {meta.noindex && <meta name="robots" content="noindex" />}
    <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
  </head>
  <body class="bg-[var(--color-bg)] text-[var(--color-ink)]">
    <Nav settings={settings} />
    <main><slot /></main>
    <Footer settings={settings} />
  </body>
</html>
```

- [ ] **Step 5: Commit (Nav and Footer don't exist yet, so this won't build — fixed in Task 8/9)**

Skip commit until after Task 9.

---

### Task 8: Nav component (Astro, responsive)

**Files:**
- Create: `apps/web/src/components/astro/Nav.astro`

- [ ] **Step 1: Create `apps/web/src/components/astro/Nav.astro`**

```astro
---
import type { TypeSiteSettings } from '@cezar/contentful-types';
import type { Entry } from 'contentful';

interface Props { settings: Entry<TypeSiteSettings> }
const { settings: _settings } = Astro.props;

const links = [
  { href: '/realizacje', label: 'Realizacje' },
  { href: '/#o-nas', label: 'O nas' },
  { href: '/#proces', label: 'Proces' },
  { href: '/w-budowie', label: 'W budowie' },
];
---
<header class="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-bg)]/90 backdrop-blur">
  <nav class="mx-auto flex max-w-[var(--container-page)] items-center justify-between px-4 py-4 md:px-10">
    <a href="/" class="font-extrabold tracking-tight">
      CEZAR <span class="text-[var(--color-accent)]">ESTATES</span>
    </a>

    <ul class="hidden items-center gap-7 text-sm font-medium md:flex">
      {links.map((l) => <li><a href={l.href} class="hover:text-[var(--color-accent)]">{l.label}</a></li>)}
      <li>
        <a href="/kontakt" class="bg-[var(--color-accent)] px-4 py-2 text-white text-xs font-semibold tracking-wide hover:opacity-90">
          KONTAKT →
        </a>
      </li>
    </ul>

    <button id="nav-toggle" class="md:hidden p-2" aria-label="Otwórz menu" aria-expanded="false">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
  </nav>

  <div id="mobile-menu" class="hidden border-t border-[var(--color-line)] md:hidden">
    <ul class="flex flex-col gap-2 px-4 py-4">
      {links.map((l) => <li><a href={l.href} class="block py-2 text-base">{l.label}</a></li>)}
      <li><a href="/kontakt" class="mt-2 inline-block bg-[var(--color-accent)] px-4 py-3 text-white font-semibold">KONTAKT →</a></li>
    </ul>
  </div>
</header>

<script>
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  toggle?.addEventListener('click', () => {
    const open = menu?.classList.toggle('hidden') === false;
    toggle.setAttribute('aria-expanded', String(open));
  });
</script>
```

- [ ] **Step 2: Manual verification (after Task 9 + Task 10 stubs)**

Will be tested visually after homepage is wired up.

---

### Task 9: Footer component

**Files:**
- Create: `apps/web/src/components/astro/Footer.astro`

- [ ] **Step 1: Create `apps/web/src/components/astro/Footer.astro`**

```astro
---
import type { TypeSiteSettings } from '@cezar/contentful-types';
import type { Entry } from 'contentful';

interface Props { settings: Entry<TypeSiteSettings> }
const { settings } = Astro.props;
const year = new Date().getFullYear();
---
<footer class="bg-[#0a0a0a] text-neutral-400">
  <div class="mx-auto flex max-w-[var(--container-page)] flex-col items-start justify-between gap-4 px-4 py-8 text-xs md:flex-row md:items-center md:px-10">
    <div>© {year} Cezar Estates · Kraków</div>
    <div class="flex flex-wrap gap-4">
      <a href="/polityka-prywatnosci" class="hover:text-white">Polityka prywatności</a>
      {settings.fields.socialInstagram && <a href={settings.fields.socialInstagram} class="hover:text-white">Instagram</a>}
      {settings.fields.socialFacebook && <a href={settings.fields.socialFacebook} class="hover:text-white">Facebook</a>}
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Update homepage to use Base layout (placeholder content)**

Replace `apps/web/src/pages/index.astro`:

```astro
---
import Base from '~/layouts/Base.astro';
---
<Base seo={{ title: 'Cezar Estates', description: 'Indywidualne projekty domów jednorodzinnych w Krakowie i okolicach.' }}>
  <div class="mx-auto max-w-[var(--container-page)] px-4 py-20 md:px-10">
    <h1 class="text-5xl font-extrabold tracking-tight md:text-7xl">CEZAR ESTATES</h1>
    <p class="mt-4 text-[var(--color-ink-muted)]">Strona w budowie — kolejne sekcje wkrótce.</p>
  </div>
</Base>
```

- [ ] **Step 3: Run dev and verify**

```bash
pnpm --filter @cezar/web dev
```

Open `http://localhost:4321`. Expected: nav with logo, links (md+), mobile hamburger (smaller viewports), placeholder hero, dark footer with copyright.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(web): base layout with nav, footer, SEO meta"
```

---

## Phase 4 — Homepage Sections (Static)

### Task 10: Hero section (Astro static + React parallax island)

**Files:**
- Create: `apps/web/src/components/astro/Hero.astro`
- Create: `apps/web/src/components/react/HeroParallax.tsx`

- [ ] **Step 1: Create `apps/web/src/components/react/HeroParallax.tsx`**

```typescript
import { useEffect, useRef } from 'react';

interface Props {
  imageUrl: string;
  alt: string;
}

export default function HeroParallax({ imageUrl, alt }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const offset = window.scrollY * 0.25;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 will-change-transform">
      <img src={imageUrl} alt={alt} className="h-full w-full object-cover" loading="eager" />
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/web/src/components/astro/Hero.astro`**

```astro
---
import type { TypeSiteSettings } from '@cezar/contentful-types';
import type { Entry } from 'contentful';
import HeroParallax from '~/components/react/HeroParallax';

interface Props { settings: Entry<TypeSiteSettings> }
const { settings } = Astro.props;

const imageUrl = `https:${settings.fields.heroBackgroundImage.fields.file.url}?w=1600&fm=webp&q=80`;
const imageAlt = settings.fields.heroBackgroundImage.fields.title ?? 'Cezar Estates';
---
<section class="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] min-h-[480px] lg:min-h-[560px]">
  <div class="px-6 py-16 md:px-10 md:py-20 lg:py-28 flex flex-col justify-center">
    <div class="text-[11px] font-semibold tracking-[3px] text-[var(--color-accent)]">EST. KRAKÓW</div>
    <h1 class="mt-5 font-extrabold leading-[0.92] tracking-[-0.05em] text-[44px] sm:text-[56px] lg:text-[72px]">
      {settings.fields.heroHeadline}
    </h1>
    <p class="mt-7 max-w-md text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
      {settings.fields.heroSubheadline}
    </p>
    <div class="mt-8 flex flex-wrap gap-3">
      <a href="/realizacje" class="bg-[var(--color-accent)] px-5 py-3 text-white text-[13px] font-semibold tracking-wide hover:opacity-90">
        ZOBACZ REALIZACJE →
      </a>
      <a href="/kontakt" class="border border-[var(--color-accent)] px-5 py-3 text-[var(--color-accent)] text-[13px] font-semibold tracking-wide hover:bg-[var(--color-accent)] hover:text-white">
        SKONTAKTUJ SIĘ
      </a>
    </div>
  </div>

  <div class="relative overflow-hidden bg-[var(--color-accent)] min-h-[280px] lg:min-h-0">
    <HeroParallax client:load imageUrl={imageUrl} alt={imageAlt} />
  </div>
</section>
```

- [ ] **Step 3: Wire Hero into homepage**

Replace `apps/web/src/pages/index.astro`:

```astro
---
import Base from '~/layouts/Base.astro';
import Hero from '~/components/astro/Hero.astro';
import { getSiteSettings } from '~/lib/contentful';

const settings = await getSiteSettings();
---
<Base seo={{
  title: 'Cezar Estates',
  description: 'Indywidualne projekty domów jednorodzinnych w Krakowie i okolicach. Cezar Estates — domy na pokolenia.'
}}>
  <Hero settings={settings} />
</Base>
```

- [ ] **Step 4: Run dev and verify**

```bash
pnpm --filter @cezar/web dev
```

Verify: hero shows headline from Contentful, asymmetric on desktop, stacks on mobile, image loads, parallax animates on scroll.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(web): hero section with parallax background image"
```

---

### Task 11: About section (Astro)

**Files:**
- Create: `apps/web/src/components/astro/About.astro`

- [ ] **Step 1: Create `apps/web/src/components/astro/About.astro`**

```astro
---
import type { TypeSiteSettings } from '@cezar/contentful-types';
import type { Entry } from 'contentful';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';

interface Props { settings: Entry<TypeSiteSettings> }
const { settings } = Astro.props;

const portraitUrl = `https:${settings.fields.aboutPortrait.fields.file.url}?w=440&h=560&fit=fill&fm=webp&q=85`;
const bodyHtml = documentToHtmlString(settings.fields.aboutBody);
---
<section id="o-nas" class="border-t border-[var(--color-line)]">
  <div class="mx-auto grid max-w-[var(--container-page)] grid-cols-1 gap-10 px-4 py-20 md:grid-cols-[1fr_1.5fr] md:gap-16 md:px-10 md:py-24">
    <div>
      <div class="text-[10px] font-semibold tracking-[3px] text-[var(--color-accent)]">O FIRMIE</div>
      <img src={portraitUrl} alt="Ewa Korgól — założycielka Cezar Estates" class="mt-5 w-full max-w-[280px] aspect-[4/5] object-cover" loading="lazy" />
      <div class="mt-3 text-xs text-[var(--color-ink-muted)]">Ewa Korgól — założycielka</div>
    </div>
    <div>
      <h2 class="text-3xl font-bold leading-[1.05] tracking-tight md:text-5xl">
        {settings.fields.aboutHeadline}
      </h2>
      <div class="prose prose-neutral mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--color-ink-muted)]" set:html={bodyHtml} />
    </div>
  </div>
</section>
```

- [ ] **Step 2: Install rich-text renderer**

```bash
pnpm --filter @cezar/web add @contentful/rich-text-html-renderer @contentful/rich-text-types
```

- [ ] **Step 3: Wire About into homepage**

Modify `apps/web/src/pages/index.astro`, add after `<Hero>`:

```astro
<About settings={settings} />
```

And add import at top:

```astro
import About from '~/components/astro/About.astro';
```

- [ ] **Step 4: Verify in dev**

```bash
pnpm --filter @cezar/web dev
```

Expected: About section renders below hero, portrait + headline + rich text body.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(web): about section with portrait and rich text"
```

---

### Task 12: ProjectCard + ProjectsGrid + Realizacje teaser

**Files:**
- Create: `apps/web/src/components/astro/ProjectCard.astro`
- Create: `apps/web/src/components/astro/ProjectsGrid.astro`

- [ ] **Step 1: Create `apps/web/src/components/astro/ProjectCard.astro`**

```astro
---
import type { TypeProject } from '@cezar/contentful-types';
import type { Entry } from 'contentful';

interface Props {
  project: Entry<TypeProject>;
  variant?: 'large' | 'small';
}
const { project, variant = 'small' } = Astro.props;

const f = project.fields;
const imgWidth = variant === 'large' ? 900 : 480;
const imageUrl = `https:${f.coverImage.fields.file.url}?w=${imgWidth}&fm=webp&q=80`;
const aspect = variant === 'large' ? 'aspect-[1.3/1]' : 'aspect-[0.65/1]';
---
<a href={`/realizacje/${f.slug}`} class={`group relative block overflow-hidden ${aspect}`}>
  <img
    src={imageUrl}
    alt={f.title}
    class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    loading="lazy"
  />
  <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-500 group-hover:from-black/80" />
  <div class="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
    <div class="text-[11px] opacity-70">{f.year} · {f.location}</div>
    <div class={`mt-1 font-bold tracking-tight ${variant === 'large' ? 'text-xl md:text-2xl' : 'text-base md:text-lg'}`}>
      {f.title}
    </div>
  </div>
</a>
```

- [ ] **Step 2: Create `apps/web/src/components/astro/ProjectsGrid.astro`**

```astro
---
import type { TypeProject } from '@cezar/contentful-types';
import type { Entry } from 'contentful';
import ProjectCard from './ProjectCard.astro';

interface Props {
  projects: Entry<TypeProject>[];
  layout: 'mosaic' | 'uniform';
}
const { projects, layout } = Astro.props;
---
{layout === 'mosaic' && projects.length >= 3 ? (
  <div class="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr]">
    <ProjectCard project={projects[0]!} variant="large" />
    <ProjectCard project={projects[1]!} />
    <ProjectCard project={projects[2]!} />
  </div>
) : (
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {projects.map((p) => <ProjectCard project={p} />)}
  </div>
)}
```

- [ ] **Step 3: Add Realizacje teaser to homepage**

Modify `apps/web/src/pages/index.astro`. Add imports:

```astro
import { getCompletedProjects, getSiteSettings } from '~/lib/contentful';
import ProjectsGrid from '~/components/astro/ProjectsGrid.astro';
```

Update fetches and add section:

```astro
const [settings, projects] = await Promise.all([
  getSiteSettings(),
  getCompletedProjects(4),
]);
```

After `<About>`:

```astro
<section class="bg-[#f4f1ea]">
  <div class="mx-auto max-w-[var(--container-page)] px-4 py-16 md:px-10 md:py-20">
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div class="text-[10px] font-semibold tracking-[3px] text-[var(--color-accent)]">REALIZACJE</div>
        <h2 class="mt-2 text-3xl font-extrabold leading-none tracking-tight md:text-5xl">Wybrane projekty.</h2>
      </div>
      <a href="/realizacje" class="text-sm font-semibold text-[var(--color-accent)]">WSZYSTKIE →</a>
    </div>
    <ProjectsGrid projects={projects.slice(0, 3)} layout="mosaic" />
  </div>
</section>
```

- [ ] **Step 4: Verify in dev**

Open homepage, verify mosaic grid shows 3 projects (1 large + 2 small) on desktop, stacks on mobile, hover zoom works.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(web): project cards and realizacje teaser"
```

---

### Task 13: Process section

**Files:**
- Create: `apps/web/src/components/astro/Process.astro`
- Create: `apps/web/src/components/astro/ProcessStep.astro`

- [ ] **Step 1: Create `apps/web/src/components/astro/ProcessStep.astro`**

```astro
---
import type { TypeProcessStep } from '@cezar/contentful-types';
import type { Entry } from 'contentful';

interface Props { step: Entry<TypeProcessStep> }
const { step } = Astro.props;
const numStr = String(step.fields.number).padStart(2, '0');
---
<div>
  <div class="font-extrabold leading-none text-[var(--color-accent-soft)] text-5xl md:text-6xl">{numStr}</div>
  <div class="mt-2 font-bold">{step.fields.title}</div>
  <p class="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{step.fields.description}</p>
</div>
```

- [ ] **Step 2: Create `apps/web/src/components/astro/Process.astro`**

```astro
---
import type { TypeSiteSettings } from '@cezar/contentful-types';
import type { Entry } from 'contentful';
import ProcessStep from './ProcessStep.astro';

interface Props { settings: Entry<TypeSiteSettings> }
const { settings } = Astro.props;
const steps = (settings.fields.processSteps ?? []).slice().sort((a, b) => a.fields.number - b.fields.number);
---
<section id="proces">
  <div class="mx-auto max-w-[var(--container-page)] px-4 py-20 md:px-10 md:py-24">
    <div class="text-[10px] font-semibold tracking-[3px] text-[var(--color-accent)]">PROCES</div>
    <h2 class="mt-2 text-3xl font-extrabold leading-none tracking-tight md:text-5xl">Jak pracujemy.</h2>
    <div class="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step) => <ProcessStep step={step} />)}
    </div>
  </div>
</section>
```

- [ ] **Step 3: Wire Process into homepage**

Add import + render after Realizacje teaser:

```astro
import Process from '~/components/astro/Process.astro';
```

```astro
<Process settings={settings} />
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm --filter @cezar/web dev
# verify: 4 steps render on desktop, stacks on mobile
git add .
git commit -m "feat(web): process section with 4 steps"
```

---

### Task 14: InProgress cards + W budowie teaser

**Files:**
- Create: `apps/web/src/components/astro/InProgressCard.astro`
- Create: `apps/web/src/components/astro/InProgressGrid.astro`
- Create: `apps/web/src/components/react/ProgressBar.tsx`

- [ ] **Step 1: Create `apps/web/src/components/react/ProgressBar.tsx`**

```typescript
import { useEffect, useRef, useState } from 'react';

interface Props { percent: number }

export default function ProgressBar({ percent }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setAnimated(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-1 w-full overflow-hidden rounded-sm bg-white/15">
      <div
        className="h-full bg-[var(--color-accent-soft)] transition-[width] duration-1200 ease-out"
        style={{ width: animated ? `${percent}%` : '0%' }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/web/src/components/astro/InProgressCard.astro`**

```astro
---
import type { TypeInProgressEntry } from '@cezar/contentful-types';
import type { Entry } from 'contentful';
import ProgressBar from '~/components/react/ProgressBar';

interface Props { entry: Entry<TypeInProgressEntry> }
const { entry } = Astro.props;
const f = entry.fields;
---
<div class="bg-white/[0.08] p-5">
  <div class="text-[11px] opacity-70">Ukończenie {f.expectedCompletion}</div>
  <div class="mt-1 font-bold">{f.title}</div>
  <p class="mt-2 text-xs opacity-80">{f.shortDescription}</p>
  <div class="mt-3"><ProgressBar client:visible percent={f.progressPercent} /></div>
  <div class="mt-2 text-[11px] opacity-70">{f.progressPercent}%</div>
</div>
```

- [ ] **Step 3: Create `apps/web/src/components/astro/InProgressGrid.astro`**

```astro
---
import type { TypeInProgressEntry } from '@cezar/contentful-types';
import type { Entry } from 'contentful';
import InProgressCard from './InProgressCard.astro';

interface Props {
  entries: Entry<TypeInProgressEntry>[];
  variant: 'teaser' | 'full';
}
const { entries, variant } = Astro.props;
---
{variant === 'teaser' ? (
  <section class="bg-[var(--color-accent)] text-white">
    <div class="mx-auto max-w-[var(--container-page)] px-4 py-16 md:px-10 md:py-20">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div class="text-[10px] font-semibold tracking-[3px] text-[var(--color-accent-soft)]">AKTUALNIE</div>
          <h2 class="mt-2 text-3xl font-extrabold leading-none tracking-tight md:text-5xl">W budowie.</h2>
        </div>
        <a href="/w-budowie" class="text-sm font-semibold text-[var(--color-accent-soft)]">ZOBACZ WSZYSTKIE →</a>
      </div>
      <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.slice(0, 3).map((e) => <InProgressCard entry={e} />)}
      </div>
    </div>
  </section>
) : (
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {entries.map((e) => <InProgressCard entry={e} />)}
  </div>
)}
```

- [ ] **Step 4: Wire into homepage**

In `apps/web/src/pages/index.astro`:

```astro
import { getCompletedProjects, getInProgressEntries, getSiteSettings } from '~/lib/contentful';
import InProgressGrid from '~/components/astro/InProgressGrid.astro';
```

```astro
const [settings, projects, inProgress] = await Promise.all([
  getSiteSettings(),
  getCompletedProjects(4),
  getInProgressEntries(3),
]);
```

After `<Process>`:

```astro
<InProgressGrid entries={inProgress} variant="teaser" />
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm --filter @cezar/web dev
# verify: dark section, 3 cards, progress bars animate when scrolled into view
git add .
git commit -m "feat(web): in-progress cards with animated progress bars"
```

---

### Task 15: Contact section (UI only — form wired in Phase 6)

**Files:**
- Create: `apps/web/src/components/astro/ContactSection.astro`
- Create: `apps/web/src/components/react/ContactForm.tsx` (UI stub)

- [ ] **Step 1: Create `apps/web/src/components/react/ContactForm.tsx` (stub)**

```typescript
import { useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: string | HTMLElement, opts: { sitekey: string; callback: (token: string) => void }) => string;
      reset: (id?: string) => void;
    };
  }
}

interface Props { siteKey: string }

export default function ContactForm({ siteKey: _siteKey }: Props) {
  const [status, _setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  if (status === 'sent') {
    return (
      <div className="rounded-sm bg-white p-6 text-sm">
        Dziękujemy. Odezwiemy się w ciągu 24h.
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-3" aria-label="Formularz kontaktowy">
      <input name="name" placeholder="Imię i nazwisko" required className="h-11 border border-neutral-300 bg-white px-3 text-sm" />
      <input name="email" type="email" placeholder="Email" required className="h-11 border border-neutral-300 bg-white px-3 text-sm" />
      <input name="phone" placeholder="Telefon (opcjonalnie)" className="h-11 border border-neutral-300 bg-white px-3 text-sm" />
      <textarea name="message" placeholder="Wiadomość" rows={5} required className="border border-neutral-300 bg-white p-3 text-sm" />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0" />
      <label className="flex items-start gap-2 text-xs text-neutral-600">
        <input type="checkbox" required className="mt-0.5" />
        <span>Wyrażam zgodę na przetwarzanie moich danych osobowych w celu odpowiedzi na zapytanie (RODO).</span>
      </label>
      <button
        type="submit"
        disabled
        className="bg-[var(--color-accent)] py-3.5 font-semibold text-white text-[13px] tracking-wide disabled:opacity-50"
      >
        WYŚLIJ WIADOMOŚĆ →
      </button>
      <p className="text-[11px] text-neutral-500">Backend wired in Task 23.</p>
    </form>
  );
}
```

- [ ] **Step 2: Create `apps/web/src/components/astro/ContactSection.astro`**

```astro
---
import type { TypeSiteSettings } from '@cezar/contentful-types';
import type { Entry } from 'contentful';
import ContactForm from '~/components/react/ContactForm';

interface Props { settings: Entry<TypeSiteSettings> }
const { settings } = Astro.props;
const f = settings.fields;
---
<section id="kontakt" class="border-t border-[var(--color-line)]">
  <div class="mx-auto grid max-w-[var(--container-page)] grid-cols-1 gap-10 px-4 py-20 md:grid-cols-2 md:gap-16 md:px-10 md:py-24">
    <div>
      <div class="text-[10px] font-semibold tracking-[3px] text-[var(--color-accent)]">KONTAKT</div>
      <h2 class="mt-3 text-4xl font-extrabold leading-[0.95] tracking-tight md:text-6xl">
        Porozmawiajmy o twoim domu.
      </h2>
      <div class="mt-8 space-y-1 text-base">
        <div class="font-bold">Ewa Korgól</div>
        <div><a href={`tel:${f.contactPhone.replace(/\s/g, '')}`}>{f.contactPhone}</a></div>
        <div><a href={`mailto:${f.contactEmail}`}>{f.contactEmail}</a></div>
        <div>{f.contactCity}</div>
      </div>
    </div>
    <div class="bg-[#f4f1ea] p-6 md:p-8">
      <ContactForm client:visible siteKey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY} />
    </div>
  </div>
</section>
```

- [ ] **Step 3: Wire into homepage**

```astro
import ContactSection from '~/components/astro/ContactSection.astro';
```

```astro
<ContactSection settings={settings} />
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm --filter @cezar/web dev
# verify: contact section renders, form fields visible (disabled submit), responsive
git add .
git commit -m "feat(web): contact section with form UI (backend pending)"
```

---

## Phase 5 — Subpages

### Task 16: `/realizacje` listing page

**Files:**
- Create: `apps/web/src/pages/realizacje/index.astro`

- [ ] **Step 1: Create page**

```astro
---
import Base from '~/layouts/Base.astro';
import ProjectsGrid from '~/components/astro/ProjectsGrid.astro';
import { getCompletedProjects } from '~/lib/contentful';

const projects = await getCompletedProjects();
---
<Base seo={{
  title: 'Realizacje',
  description: `Portfolio zrealizowanych domów Cezar Estates — ${projects.length} projektów w Krakowie i okolicach.`
}}>
  <div class="mx-auto max-w-[var(--container-page)] px-4 py-20 md:px-10 md:py-24">
    <div class="text-[10px] font-semibold tracking-[3px] text-[var(--color-accent)]">REALIZACJE</div>
    <h1 class="mt-2 text-4xl font-extrabold leading-none tracking-tight md:text-6xl">
      Wszystkie projekty.
    </h1>
    <div class="mt-10">
      <ProjectsGrid projects={projects} layout="uniform" />
    </div>
  </div>
</Base>
```

- [ ] **Step 2: Verify and commit**

```bash
# visit http://localhost:4321/realizacje — uniform 3-col grid (desktop), 2-col tablet, 1-col mobile
git add .
git commit -m "feat(web): realizacje listing page"
```

---

### Task 17: `/realizacje/[slug]` detail page + Gallery island

**Files:**
- Create: `apps/web/src/components/react/Gallery.tsx`
- Create: `apps/web/src/pages/realizacje/[slug].astro`

- [ ] **Step 1: Create `apps/web/src/components/react/Gallery.tsx`**

```typescript
import { useEffect, useState } from 'react';

interface Image { url: string; alt: string }
interface Props { images: Image[] }

export default function Gallery({ images }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? null : (i - 1 + images.length) % images.length));
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? null : (i + 1) % images.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, images.length]);

  useEffect(() => {
    document.body.style.overflow = open !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={() => setOpen(i)}
            className="aspect-square overflow-hidden bg-neutral-200"
            aria-label={`Otwórz zdjęcie ${i + 1}`}
          >
            <img src={img.url} alt={img.alt} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={(e) => { e.stopPropagation(); setOpen(null); }}
            aria-label="Zamknij"
          >×</button>
          <button
            type="button"
            className="absolute left-4 text-white text-4xl px-3"
            onClick={(e) => { e.stopPropagation(); setOpen((i) => i === null ? null : (i - 1 + images.length) % images.length); }}
            aria-label="Poprzednie"
          >‹</button>
          <img
            src={images[open]!.url.replace(/w=\d+/, 'w=1600')}
            alt={images[open]!.alt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="absolute right-4 text-white text-4xl px-3"
            onClick={(e) => { e.stopPropagation(); setOpen((i) => i === null ? null : (i + 1) % images.length); }}
            aria-label="Następne"
          >›</button>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Create `apps/web/src/pages/realizacje/[slug].astro`**

```astro
---
import Base from '~/layouts/Base.astro';
import Gallery from '~/components/react/Gallery';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { getCompletedProjects, getProjectBySlug } from '~/lib/contentful';

export async function getStaticPaths() {
  const projects = await getCompletedProjects();
  return projects.map((p) => ({ params: { slug: p.fields.slug } }));
}

const { slug } = Astro.params;
const project = await getProjectBySlug(slug!);
if (!project) return Astro.redirect('/realizacje');

const f = project.fields;
const coverUrl = `https:${f.coverImage.fields.file.url}?w=1600&fm=webp&q=85`;
const galleryImages = (f.gallery ?? []).map((img) => ({
  url: `https:${img.fields.file.url}?w=800&fm=webp&q=80`,
  alt: img.fields.title ?? f.title,
}));
const bodyHtml = documentToHtmlString(f.description);
---
<Base seo={{
  title: f.title,
  description: f.shortDescription,
  ogImage: coverUrl,
  canonical: `${import.meta.env.SITE_URL}/realizacje/${f.slug}`,
}}>
  <article>
    <div class="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
      <img src={coverUrl} alt={f.title} class="h-full w-full object-cover" />
    </div>

    <div class="mx-auto max-w-[var(--container-page)] px-4 py-12 md:px-10 md:py-16">
      <a href="/realizacje" class="text-sm text-[var(--color-accent)]">← Wszystkie realizacje</a>
      <h1 class="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">{f.title}</h1>
      <div class="mt-3 text-sm text-[var(--color-ink-muted)]">
        {f.location} · {f.year} · {f.area} m²{f.plotArea ? ` · działka ${f.plotArea} m²` : ''}
      </div>

      {f.features && f.features.length > 0 && (
        <ul class="mt-6 flex flex-wrap gap-2">
          {f.features.map((tag) => (
            <li class="bg-[var(--color-accent-soft)] px-3 py-1 text-xs">{tag}</li>
          ))}
        </ul>
      )}

      <div class="prose prose-neutral mt-10 max-w-2xl text-[15px] leading-relaxed" set:html={bodyHtml} />

      {galleryImages.length > 0 && (
        <div class="mt-16">
          <h2 class="text-[10px] font-semibold tracking-[3px] text-[var(--color-accent)]">GALERIA</h2>
          <div class="mt-4">
            <Gallery client:visible images={galleryImages} />
          </div>
        </div>
      )}
    </div>
  </article>
</Base>
```

- [ ] **Step 3: Verify and commit**

```bash
# visit http://localhost:4321/realizacje/<slug> — cover, title, meta, gallery lightbox works (← → keys, Esc to close)
git add .
git commit -m "feat(web): project detail page with gallery lightbox"
```

---

### Task 18: `/w-budowie` listing page

**Files:**
- Create: `apps/web/src/pages/w-budowie.astro`

- [ ] **Step 1: Create page**

```astro
---
import Base from '~/layouts/Base.astro';
import InProgressGrid from '~/components/astro/InProgressGrid.astro';
import { getInProgressEntries } from '~/lib/contentful';

const entries = await getInProgressEntries();
---
<Base seo={{
  title: 'W budowie',
  description: 'Aktualnie realizowane projekty Cezar Estates.'
}}>
  <div class="bg-[var(--color-accent)] text-white">
    <div class="mx-auto max-w-[var(--container-page)] px-4 py-20 md:px-10 md:py-24">
      <div class="text-[10px] font-semibold tracking-[3px] text-[var(--color-accent-soft)]">AKTUALNIE</div>
      <h1 class="mt-2 text-4xl font-extrabold leading-none tracking-tight md:text-6xl">W budowie.</h1>
      <div class="mt-10">
        <InProgressGrid entries={entries} variant="full" />
      </div>
    </div>
  </div>
</Base>
```

- [ ] **Step 2: Verify and commit**

```bash
git add .
git commit -m "feat(web): w-budowie listing page"
```

---

### Task 19: `/kontakt` full page

**Files:**
- Create: `apps/web/src/pages/kontakt.astro`

- [ ] **Step 1: Create page**

```astro
---
import Base from '~/layouts/Base.astro';
import ContactSection from '~/components/astro/ContactSection.astro';
import { getSiteSettings } from '~/lib/contentful';

const settings = await getSiteSettings();
---
<Base seo={{
  title: 'Kontakt',
  description: 'Skontaktuj się z Cezar Estates — Ewa Korgól, Kraków. +48 505 455 811.'
}}>
  <ContactSection settings={settings} />
</Base>
```

- [ ] **Step 2: Verify and commit**

```bash
git add .
git commit -m "feat(web): kontakt page"
```

---

### Task 20: `/polityka-prywatnosci`

**Files:**
- Create: `apps/web/src/pages/polityka-prywatnosci.astro`

- [ ] **Step 1: Create page (RODO standard text in Polish)**

```astro
---
import Base from '~/layouts/Base.astro';
---
<Base seo={{ title: 'Polityka prywatności', description: 'Polityka prywatności Cezar Estates', noindex: false }}>
  <div class="mx-auto max-w-3xl px-4 py-20 md:px-10 md:py-24 prose prose-neutral">
    <h1>Polityka prywatności</h1>

    <p>Niniejsza polityka określa zasady przetwarzania danych osobowych użytkowników strony Cezar Estates.</p>

    <h2>1. Administrator danych</h2>
    <p>Administratorem danych osobowych jest Cezar Estates, z siedzibą w Krakowie. Kontakt: +48 505 455 811.</p>

    <h2>2. Cel przetwarzania</h2>
    <p>Dane osobowe podane w formularzu kontaktowym (imię, email, telefon, treść wiadomości) są przetwarzane wyłącznie w celu odpowiedzi na zapytanie użytkownika. Podstawa prawna: art. 6 ust. 1 lit. a RODO (zgoda) oraz lit. f (uzasadniony interes administratora).</p>

    <h2>3. Okres przechowywania</h2>
    <p>Dane przechowujemy przez okres niezbędny do udzielenia odpowiedzi i nie dłużej niż 24 miesiące, chyba że zachodzi konieczność dłuższego przechowywania (np. nawiązanie współpracy).</p>

    <h2>4. Prawa użytkownika</h2>
    <p>Masz prawo do dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia, sprzeciwu oraz wycofania zgody. Skontaktuj się pod adresem: kontakt@cezarestates.pl.</p>

    <h2>5. Pliki cookies</h2>
    <p>Strona używa Vercel Analytics, które nie wykorzystują plików cookies do śledzenia użytkowników i są zgodne z RODO.</p>

    <h2>6. Bezpieczeństwo</h2>
    <p>Formularz kontaktowy korzysta z usługi Cloudflare Turnstile w celu ochrony przed spamem oraz Resend do dostarczania wiadomości email.</p>
  </div>
</Base>
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat(web): privacy policy page"
```

---

## Phase 6 — Contact Form Backend

### Task 21: Validation schema + tests

**Files:**
- Create: `apps/web/src/lib/validation.ts`
- Create: `apps/web/src/lib/validation.test.ts`

- [ ] **Step 1: Write failing tests**

`apps/web/src/lib/validation.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { contactSchema } from './validation';

describe('contactSchema', () => {
  const valid = {
    name: 'Anna Kowalska',
    email: 'anna@example.com',
    phone: '+48 500 000 000',
    message: 'Chciałabym się dowiedzieć więcej o waszych realizacjach.',
    consent: true,
    website: '',
    turnstileToken: 'token123',
  };

  it('accepts valid input', () => {
    const result = contactSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = contactSchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects too-short message', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'too short' });
    expect(result.success).toBe(false);
  });

  it('rejects missing consent', () => {
    const result = contactSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });

  it('rejects honeypot fill', () => {
    const result = contactSchema.safeParse({ ...valid, website: 'http://spam.com' });
    expect(result.success).toBe(false);
  });

  it('accepts empty optional phone', () => {
    const result = contactSchema.safeParse({ ...valid, phone: '' });
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
pnpm --filter @cezar/web test
```

Expected: FAIL — `contactSchema` not exported.

- [ ] **Step 3: Create `apps/web/src/lib/validation.ts`**

```typescript
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Imię jest wymagane').max(120),
  email: z.string().trim().email('Nieprawidłowy email').max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  message: z.string().trim().min(20, 'Wiadomość zbyt krótka (min 20 znaków)').max(5000),
  consent: z.literal(true, { errorMap: () => ({ message: 'Zgoda RODO wymagana' }) }),
  website: z.literal('', { errorMap: () => ({ message: 'spam' }) }),
  turnstileToken: z.string().min(1),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
pnpm --filter @cezar/web test
```

Expected: 7 passing.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(web): zod validation schema for contact form"
```

---

### Task 22: Turnstile verification helper

**Files:**
- Create: `apps/web/src/lib/turnstile.ts`
- Create: `apps/web/src/lib/turnstile.test.ts`

- [ ] **Step 1: Write failing tests**

`apps/web/src/lib/turnstile.test.ts`:

```typescript
import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyTurnstile } from './turnstile';

describe('verifyTurnstile', () => {
  const fetchMock = vi.fn();
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.resetAllMocks();
  });

  it('returns true when Cloudflare reports success', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ success: true }) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const ok = await verifyTurnstile('token', 'secret', '1.2.3.4');
    expect(ok).toBe(true);
  });

  it('returns false when Cloudflare reports failure', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ success: false }) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const ok = await verifyTurnstile('token', 'secret');
    expect(ok).toBe(false);
  });

  it('returns false on network error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network'));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const ok = await verifyTurnstile('token', 'secret');
    expect(ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

- [ ] **Step 3: Create `apps/web/src/lib/turnstile.ts`**

```typescript
const ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token: string, secret: string, remoteIp?: string): Promise<boolean> {
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set('remoteip', remoteIp);

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run tests — expect PASS (3 passing)**

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(web): turnstile siteverify helper"
```

---

### Task 23: Resend email + React Email template

**Files:**
- Create: `apps/web/src/emails/ContactNotification.tsx`
- Create: `apps/web/src/lib/resend.ts`

- [ ] **Step 1: Create `apps/web/src/emails/ContactNotification.tsx`**

```typescript
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components';

interface Props {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export default function ContactNotification({ name, email, phone, message }: Props) {
  return (
    <Html lang="pl">
      <Head />
      <Preview>{`Nowe zapytanie od ${name}`}</Preview>
      <Body style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#fafaf7', padding: 24 }}>
        <Container style={{ background: 'white', padding: 24, maxWidth: 600 }}>
          <Heading as="h1" style={{ fontSize: 20, marginBottom: 16, color: '#1F3A2E' }}>
            Nowe zapytanie z formularza
          </Heading>
          <Section>
            <Text><strong>Imię:</strong> {name}</Text>
            <Text><strong>Email:</strong> {email}</Text>
            {phone && <Text><strong>Telefon:</strong> {phone}</Text>}
          </Section>
          <Section style={{ borderTop: '1px solid #e5e2da', paddingTop: 16, marginTop: 16 }}>
            <Text style={{ whiteSpace: 'pre-wrap' }}>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2: Create `apps/web/src/lib/resend.ts`**

```typescript
import { Resend } from 'resend';
import { render } from '@react-email/render';
import ContactNotification from '~/emails/ContactNotification';
import type { ContactInput } from './validation';

const apiKey = import.meta.env.RESEND_API_KEY;
const fromEmail = import.meta.env.CONTACT_FROM_EMAIL;
const toEmail = import.meta.env.CONTACT_EMAIL;

export async function sendContactEmail(input: ContactInput) {
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  const resend = new Resend(apiKey);

  const html = await render(ContactNotification({
    name: input.name,
    email: input.email,
    phone: input.phone || undefined,
    message: input.message,
  }));

  const result = await resend.emails.send({
    from: `Cezar Estates <${fromEmail}>`,
    to: toEmail,
    replyTo: input.email,
    subject: `Nowe zapytanie od ${input.name}`,
    html,
  });

  if (result.error) throw new Error(`Resend: ${result.error.message}`);
  return result.data;
}
```

- [ ] **Step 3: Create `apps/web/src/pages/api/contact.ts`**

```typescript
import type { APIRoute } from 'astro';
import { contactSchema } from '~/lib/validation';
import { verifyTurnstile } from '~/lib/turnstile';
import { sendContactEmail } from '~/lib/resend';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Walidacja nieudana', issues: parsed.error.flatten() }, { status: 400 });
  }

  const ok = await verifyTurnstile(
    parsed.data.turnstileToken,
    import.meta.env.TURNSTILE_SECRET_KEY,
    clientAddress,
  );
  if (!ok) {
    return Response.json({ error: 'Weryfikacja antyspamowa nieudana' }, { status: 400 });
  }

  try {
    await sendContactEmail(parsed.data);
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Contact email failed:', err);
    return Response.json({ error: 'Wysyłka nie powiodła się' }, { status: 500 });
  }
};
```

- [ ] **Step 4: Update `apps/web/src/components/react/ContactForm.tsx` to wire submit**

Replace entire file:

```typescript
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: string | HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void; 'error-callback'?: () => void; },
      ) => string;
      reset: (id?: string) => void;
    };
  }
}

interface Props { siteKey: string }

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm({ siteKey }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const turnstileTokenRef = useRef<string>('');
  const turnstileEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptId = 'cf-turnstile-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const tryRender = () => {
      if (window.turnstile && turnstileEl.current) {
        window.turnstile.render(turnstileEl.current, {
          sitekey: siteKey,
          callback: (token: string) => { turnstileTokenRef.current = token; },
          'error-callback': () => { turnstileTokenRef.current = ''; },
        });
        return true;
      }
      return false;
    };

    if (!tryRender()) {
      const id = setInterval(() => { if (tryRender()) clearInterval(id); }, 200);
      return () => clearInterval(id);
    }
  }, [siteKey]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      message: String(fd.get('message') ?? ''),
      consent: fd.get('consent') === 'on',
      website: String(fd.get('website') ?? ''),
      turnstileToken: turnstileTokenRef.current,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Wystąpił błąd');
      }
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Wystąpił błąd');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-sm bg-white p-6 text-sm">
        <div className="font-semibold text-[var(--color-accent)]">Dziękujemy.</div>
        <div className="mt-1 text-[var(--color-ink-muted)]">Odezwiemy się w ciągu 24 godzin.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" aria-label="Formularz kontaktowy">
      <input name="name" placeholder="Imię i nazwisko" required className="h-11 border border-neutral-300 bg-white px-3 text-sm focus:border-[var(--color-accent)] focus:outline-none" />
      <input name="email" type="email" placeholder="Email" required className="h-11 border border-neutral-300 bg-white px-3 text-sm focus:border-[var(--color-accent)] focus:outline-none" />
      <input name="phone" placeholder="Telefon (opcjonalnie)" className="h-11 border border-neutral-300 bg-white px-3 text-sm focus:border-[var(--color-accent)] focus:outline-none" />
      <textarea name="message" placeholder="Wiadomość" rows={5} required minLength={20} className="border border-neutral-300 bg-white p-3 text-sm focus:border-[var(--color-accent)] focus:outline-none" />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0" />
      <label className="flex items-start gap-2 text-xs text-neutral-600">
        <input type="checkbox" name="consent" required className="mt-0.5" />
        <span>Wyrażam zgodę na przetwarzanie moich danych w celu odpowiedzi na zapytanie (RODO).</span>
      </label>
      <div ref={turnstileEl} />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-[var(--color-accent)] py-3.5 font-semibold text-white text-[13px] tracking-wide hover:opacity-90 disabled:opacity-50"
      >
        {status === 'sending' ? 'WYSYŁANIE…' : 'WYŚLIJ WIADOMOŚĆ →'}
      </button>
      {status === 'error' && <p className="text-sm text-red-700">{errorMsg}</p>}
    </form>
  );
}
```

- [ ] **Step 5: Verify dev (against test Resend key + test Turnstile site key)**

Use Cloudflare's "always passes" test keys for dev:
- `PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`
- `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA`

For Resend, sign up at resend.com → API key. Use `onboarding@resend.dev` as `CONTACT_FROM_EMAIL` for dev.

```bash
pnpm --filter @cezar/web dev
# fill form, submit, check inbox piotrchuchla9@gmail.com (or wherever CONTACT_EMAIL points)
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(web): contact form backend (resend + turnstile + zod)"
```

---

## Phase 7 — Animations + Polish

### Task 24: Smooth scroll (Lenis) + ScrollReveal

**Files:**
- Create: `apps/web/src/components/react/SmoothScroll.tsx`
- Create: `apps/web/src/components/react/ScrollReveal.tsx`
- Create: `apps/web/src/lib/animations.ts`
- Modify: `apps/web/src/layouts/Base.astro`

- [ ] **Step 1: Create `apps/web/src/lib/animations.ts`**

```typescript
export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] as const },
};

export const stagger = (delay = 0.08) => ({
  transition: { staggerChildren: delay },
});
```

- [ ] **Step 2: Create `apps/web/src/components/react/SmoothScroll.tsx`**

```typescript
import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3) });
    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
```

- [ ] **Step 3: Create `apps/web/src/components/react/ScrollReveal.tsx`**

```typescript
import type { PropsWithChildren } from 'react';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { fadeUp } from '~/lib/animations';

interface Props { delay?: number }

export default function ScrollReveal({ children, delay = 0 }: PropsWithChildren<Props>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={fadeUp.initial}
      animate={inView ? fadeUp.animate : fadeUp.initial}
      transition={{ ...fadeUp.transition, delay }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Wire SmoothScroll into Base layout**

Add to `apps/web/src/layouts/Base.astro` inside `<body>`, after `<Nav />`:

```astro
import SmoothScroll from '~/components/react/SmoothScroll';
```

```astro
<SmoothScroll client:load />
```

- [ ] **Step 5: Apply ScrollReveal selectively**

Wrap the heading rows in `Process.astro`, `InProgressGrid.astro`, `ContactSection.astro` with `<ScrollReveal client:visible>`. Example for `Process.astro`:

```astro
import ScrollReveal from '~/components/react/ScrollReveal';
```

Wrap heading block:

```astro
<ScrollReveal client:visible>
  <div class="text-[10px] font-semibold tracking-[3px] text-[var(--color-accent)]">PROCES</div>
  <h2 class="mt-2 text-3xl font-extrabold leading-none tracking-tight md:text-5xl">Jak pracujemy.</h2>
</ScrollReveal>
```

- [ ] **Step 6: Verify and commit**

```bash
pnpm --filter @cezar/web dev
# verify: scroll feels smooth, sections fade-up on entry, reduced-motion off respects setting
git add .
git commit -m "feat(web): smooth scroll (lenis) and scroll-reveal animations"
```

---

### Task 25: MagneticButton

**Files:**
- Create: `apps/web/src/components/react/MagneticButton.tsx`
- Modify: `apps/web/src/components/astro/Hero.astro`

- [ ] **Step 1: Create `apps/web/src/components/react/MagneticButton.tsx`**

```typescript
import type { PropsWithChildren } from 'react';
import { useRef, type CSSProperties } from 'react';

interface Props {
  href: string;
  className?: string;
  style?: CSSProperties;
}

export default function MagneticButton({ href, className, style, children }: PropsWithChildren<Props>) {
  const ref = useRef<HTMLAnchorElement>(null);

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (reduce || isTouch) return;

    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const max = 8;
    el.style.transform = `translate(${Math.max(-max, Math.min(max, dx * 0.15))}px, ${Math.max(-max, Math.min(max, dy * 0.15))}px)`;
  }

  function reset() {
    if (ref.current) ref.current.style.transform = '';
  }

  return (
    <a
      ref={ref}
      href={href}
      className={`inline-block transition-transform duration-200 ${className ?? ''}`}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </a>
  );
}
```

- [ ] **Step 2: Use in Hero CTAs**

Replace the two `<a>` CTAs in `Hero.astro` with:

```astro
import MagneticButton from '~/components/react/MagneticButton';
```

```astro
<MagneticButton client:visible href="/realizacje" className="bg-[var(--color-accent)] px-5 py-3 text-white text-[13px] font-semibold tracking-wide hover:opacity-90">
  ZOBACZ REALIZACJE →
</MagneticButton>
<MagneticButton client:visible href="/kontakt" className="border border-[var(--color-accent)] px-5 py-3 text-[var(--color-accent)] text-[13px] font-semibold tracking-wide hover:bg-[var(--color-accent)] hover:text-white">
  SKONTAKTUJ SIĘ
</MagneticButton>
```

- [ ] **Step 3: Verify and commit**

```bash
# verify desktop only — buttons follow cursor subtly within 8px
git add .
git commit -m "feat(web): magnetic CTA buttons"
```

---

### Task 26: CountUp for process numbers

**Files:**
- Create: `apps/web/src/components/react/CountUp.tsx`
- Modify: `apps/web/src/components/astro/ProcessStep.astro`

- [ ] **Step 1: Create `apps/web/src/components/react/CountUp.tsx`**

```typescript
import { useEffect, useRef, useState } from 'react';

interface Props { to: number; duration?: number }

export default function CountUp({ to, duration = 800 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(to);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          observer.disconnect();
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            setValue(Math.round(to * t));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }
    }, { threshold: 0.5 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{String(value).padStart(2, '0')}</span>;
}
```

- [ ] **Step 2: Update `apps/web/src/components/astro/ProcessStep.astro`**

```astro
---
import type { TypeProcessStep } from '@cezar/contentful-types';
import type { Entry } from 'contentful';
import CountUp from '~/components/react/CountUp';

interface Props { step: Entry<TypeProcessStep> }
const { step } = Astro.props;
---
<div>
  <div class="font-extrabold leading-none text-[var(--color-accent-soft)] text-5xl md:text-6xl">
    <CountUp client:visible to={step.fields.number} />
  </div>
  <div class="mt-2 font-bold">{step.fields.title}</div>
  <p class="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{step.fields.description}</p>
</div>
```

- [ ] **Step 3: Verify and commit**

```bash
git add .
git commit -m "feat(web): count-up animation for process numbers"
```

---

## Phase 8 — SEO, Security, Analytics

### Task 27: Sitemap, robots.txt, vercel.json with security headers

**Files:**
- Create: `apps/web/public/robots.txt`
- Create: `apps/web/vercel.json`

- [ ] **Step 1: Create `apps/web/public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://cezarestates.pl/sitemap-index.xml
```

(Replace domain when known.)

- [ ] **Step 2: Create `apps/web/vercel.json`**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    },
    {
      "source": "/fonts/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

- [ ] **Step 3: Verify sitemap generates on build**

```bash
pnpm --filter @cezar/web build
ls apps/web/dist/sitemap-index.xml
```

Expected: file exists.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(web): sitemap, robots.txt, security headers"
```

---

### Task 28: Vercel Analytics

**Files:**
- Modify: `apps/web/src/layouts/Base.astro`

- [ ] **Step 1: Add Vercel Analytics script**

Add to `<head>` of `Base.astro`:

```astro
{import.meta.env.PROD && <script defer src="/_vercel/insights/script.js"></script>}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat(web): vercel analytics in production"
```

---

## Phase 9 — Testing

### Task 29: Playwright E2E setup + happy paths

**Files:**
- Create: `apps/web/playwright.config.ts`
- Create: `apps/web/tests/e2e/home.spec.ts`
- Create: `apps/web/tests/e2e/contact.spec.ts`

- [ ] **Step 1: Install Playwright browsers**

```bash
pnpm --filter @cezar/web exec playwright install chromium
```

- [ ] **Step 2: Create `apps/web/playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 3: Create `apps/web/tests/e2e/home.spec.ts`**

```typescript
import { expect, test } from '@playwright/test';

test('homepage renders all sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('REALIZACJE', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('PROCES')).toBeVisible();
  await expect(page.getByText('AKTUALNIE')).toBeVisible();
  await expect(page.getByText('KONTAKT')).toBeVisible();
});

test('navigation to /realizacje works', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /realizacje/i }).first().click();
  await expect(page).toHaveURL(/\/realizacje/);
  await expect(page.getByRole('heading', { name: /Wszystkie projekty/i })).toBeVisible();
});

test('mobile menu toggles', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await page.goto('/');
  await page.getByLabel('Otwórz menu').click();
  await expect(page.getByRole('link', { name: 'KONTAKT →' })).toBeVisible();
});
```

- [ ] **Step 4: Create `apps/web/tests/e2e/contact.spec.ts`**

```typescript
import { expect, test } from '@playwright/test';

test('contact form rejects invalid input', async ({ page }) => {
  await page.goto('/kontakt');
  await page.getByRole('button', { name: /WYŚLIJ/i }).click();
  // Browser-native required validation triggers on empty fields; submit blocked
  await expect(page.getByPlaceholder('Imię i nazwisko')).toBeFocused();
});

test('contact form structure renders', async ({ page }) => {
  await page.goto('/kontakt');
  await expect(page.getByPlaceholder('Imię i nazwisko')).toBeVisible();
  await expect(page.getByPlaceholder('Email')).toBeVisible();
  await expect(page.getByPlaceholder('Wiadomość')).toBeVisible();
  await expect(page.getByText(/Wyrażam zgodę/)).toBeVisible();
});
```

- [ ] **Step 5: Run E2E**

```bash
pnpm --filter @cezar/web test:e2e
```

Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "test(web): playwright e2e for home and contact"
```

---

### Task 30: Run full check

- [ ] **Step 1: Lint + format check**

```bash
pnpm lint
pnpm format
```

Expected: no errors.

- [ ] **Step 2: Typecheck monorepo**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Unit tests**

```bash
pnpm test
```

Expected: all passing (Vitest).

- [ ] **Step 4: Build**

```bash
pnpm build
```

Expected: `apps/web/dist/` populated, sitemap exists.

- [ ] **Step 5: Lighthouse audit (manual)**

Run Lighthouse against `http://localhost:4321` (after `pnpm --filter @cezar/web preview`). Targets:
- Performance ≥ 95
- Accessibility ≥ 95
- SEO ≥ 95

Iterate on any failing categories before commit.

- [ ] **Step 6: Commit any fixes**

```bash
git add .
git commit -m "chore: pass lint, typecheck, tests, and lighthouse targets"
```

---

## Phase 10 — Deployment

### Task 31: Vercel deployment + Contentful webhook

- [ ] **Step 1: Push to GitHub**

Create a new GitHub repo (`cezar-estates`). Push:

```bash
git remote add origin git@github.com:<user>/cezar-estates.git
git push -u origin main
```

- [ ] **Step 2: Connect to Vercel**

vercel.com → Add New Project → import GitHub repo. Settings:
- Root directory: `apps/web`
- Framework: Astro (auto-detected)
- Install: `cd ../.. && pnpm install`
- Build: `pnpm build`
- Output: `apps/web/dist`

- [ ] **Step 3: Add env vars in Vercel**

Project Settings → Environment Variables — add all from `.env.example` with production values.

- [ ] **Step 4: Trigger first deploy**

Vercel will auto-deploy on connect. Verify https://<project>.vercel.app loads.

- [ ] **Step 5: Set up Contentful webhook**

Vercel → Settings → Git → Deploy Hooks → Create hook for `main` branch. Copy URL.

Contentful → Settings → Webhooks → Add webhook:
- URL: Vercel deploy hook URL
- Triggers: Publish, Unpublish (Entry + Asset)
- Filter: any of `project`, `inProgressEntry`, `siteSettings`, `processStep`

- [ ] **Step 6: Verify webhook**

In Contentful, edit the SiteSettings entry, change a field, publish. Vercel should start a new deploy within ~5s.

- [ ] **Step 7: Document in README**

Add deployment section explaining:
- production URL
- env vars required in Vercel
- Contentful webhook setup
- where to find domain config (post-domain-purchase)

```bash
git add README.md
git commit -m "docs: deployment + webhook setup"
git push
```

---

## Open follow-ups (post-launch)

- Verify domain DKIM in Resend after domain purchase, swap `CONTACT_FROM_EMAIL` to `kontakt@cezarestates.pl`.
- Replace `piotrchuchla9@gmail.com` in `CONTACT_EMAIL` env with Ewa's production email before go-live.
- Replace `og-default.jpg` with branded OG card.
- Capture professional photos for Project entries.
- Optional: cursor-follow component (Section 7 spec, item 10) — deferred as low priority.
- Optional: split-text headline reveal animation (Section 7 spec, item 3) — deferred. Current scroll reveal covers the entry animation; per-line reveal is polish.
- Optional: Lighthouse CI in GitHub Actions for regression alerts.
