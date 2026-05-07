# Contentful Setup

The Contentful space schema (content types, sample entries, and assets) is provisioned via a single migration script. There is no manual work needed in the Contentful UI after the one-time account confirmation step described below.

## Prerequisites

1. A Contentful account with a space created (space ID: `psa2qz9jkl4p` — "Cezar Estates").
2. All 4 tokens filled in `.env.local` at the repo root:
   - `CONTENTFUL_SPACE_ID`
   - `CONTENTFUL_DELIVERY_TOKEN`
   - `CONTENTFUL_PREVIEW_TOKEN`
   - `CONTENTFUL_MANAGEMENT_TOKEN`

### One-time: Confirm Contentful Organization Access

Contentful requires you to visit the web app once to confirm org membership before any Personal Access Token (CFPAT) can manage spaces via the API. This is a browser-only flow:

1. Open [https://app.contentful.com](https://app.contentful.com) and log in.
2. Navigate to your organization (top-left org selector → "comp").
3. If there is a banner or confirmation prompt about org access, click through it.
4. Optionally regenerate the CMA token: **Settings → CMA tokens → Create personal access token** → copy the new value into `.env.local` as `CONTENTFUL_MANAGEMENT_TOKEN`.

Once this step is done (only needed once per account), the migration script works with no further UI interaction.

## Running the Migration

From the repo root:

```bash
pnpm setup:contentful
```

This is equivalent to:

```bash
tsx scripts/setup-contentful.ts
```

The script is **idempotent** — running it multiple times is safe. Existing content types, assets, and entries are skipped, not overwritten.

## What Gets Provisioned

### Content Types (4)

| ID | Name | Display Field |
|----|------|---------------|
| `project` | Realizacja | `title` |
| `inProgressEntry` | W budowie | `title` |
| `processStep` | Process Step | `title` |
| `siteSettings` | Site Settings | `heroHeadline` |

#### `project`
Single-family home project with status `completed` or `in_progress`.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | Symbol | yes | Display field |
| slug | Symbol | yes | Unique, `^[a-z0-9-]+$` |
| location | Symbol | yes | |
| area | Integer | yes | min 0 |
| plotArea | Integer | no | min 0 |
| year | Integer | yes | |
| status | Symbol | yes | `completed` or `in_progress` |
| shortDescription | Text | yes | max 200 chars |
| description | RichText | yes | |
| coverImage | Link (Asset) | yes | image only |
| gallery | Array of Link (Asset) | no | images only |
| features | Array of Symbol | no | |
| order | Integer | yes | default 0 |

#### `inProgressEntry`
A home currently under construction.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | Symbol | yes | |
| slug | Symbol | yes | Unique |
| location | Symbol | yes | |
| expectedCompletion | Symbol | yes | |
| progressPercent | Integer | yes | 0–100 |
| coverImage | Link (Asset) | yes | image only |
| shortDescription | Text | yes | max 200 chars |

#### `processStep`
One step in the "how we work" process section.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| number | Integer | yes | 1–10 |
| title | Symbol | yes | |
| description | Text | yes | max 300 chars |
| icon | Symbol | no | |

#### `siteSettings` (singleton)
Global site configuration. Only one entry should exist.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| heroHeadline | Symbol | yes | |
| heroSubheadline | Text | yes | |
| heroBackgroundImage | Link (Asset) | yes | image only |
| aboutHeadline | Symbol | yes | |
| aboutBody | RichText | yes | |
| aboutPortrait | Link (Asset) | yes | image only |
| processSteps | Array of Link (Entry) | yes | `processStep` entries |
| contactEmail | Symbol | yes | |
| contactPhone | Symbol | yes | |
| contactCity | Symbol | yes | default "Kraków" |
| socialInstagram | Symbol | no | |
| socialFacebook | Symbol | no | |

### Placeholder Assets (5)

| ID | Title | Source |
|----|-------|--------|
| `asset-hero-bg` | Hero Background | Unsplash — modern house exterior |
| `asset-about-portrait` | About Portrait | Unsplash — professional portrait |
| `asset-project1-cover` | Dom Słoneczny Cover | Unsplash — single-story home |
| `asset-project2-cover` | Willa Akacja Cover | Unsplash — two-story villa |
| `asset-inprogress-cover` | Dom Brzozowy Cover | Unsplash — construction site |

### Sample Entries

- **4× processStep** — Konsultacja, Projekt, Budowa, Klucze
- **1× siteSettings** — hero, about, contact data, linked process steps
- **2× project** — Dom Słoneczny (Wieliczka, 180m², 2025), Willa Akacja (Zabierzów, 240m², 2024)
- **1× inProgressEntry** — Dom Brzozowy (Mogilany, 65% done, Q3 2026)

## Script Location

`scripts/setup-contentful.ts`

## Verifying in Contentful UI

After a successful run, navigate to [https://app.contentful.com/spaces/psa2qz9jkl4p](https://app.contentful.com/spaces/psa2qz9jkl4p):

- **Content model** tab → should show 4 content types.
- **Content** tab → should show 8 entries (4 processStep + 1 siteSettings + 2 project + 1 inProgressEntry).
- **Media** tab → should show 5 assets.
