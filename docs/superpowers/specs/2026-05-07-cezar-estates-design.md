# Cezar Estates — Strona wizytówka

**Data:** 2026-05-07
**Klient:** Ewa Korgól (Cezar Estates, Kraków)
**Cel:** Statyczna strona wizytówka dewelopera budującego domy jednorodzinne. Portfolio realizacji zarządzane przez CMS, formularz kontaktowy, profesjonalny design.

## 1. Cel i zakres

Pojedyncza, w pełni responsywna strona wizytówka (RWD: mobile-first, breakpointy `sm/md/lg/xl/2xl`). Główne zadania:

- Prezentuje firmę i osobę założycielki (Ewa Korgól).
- Pokazuje portfolio zrealizowanych domów oraz aktualnie budowanych projektów.
- Umożliwia kontakt (formularz + dane).
- Tylko język polski.
- SEO-friendly (strona ma rankować na "deweloper Kraków", "domy jednorodzinne Kraków").

## 2. Wybrany stack

| Warstwa | Wybór | Uzasadnienie |
|---------|-------|--------------|
| Framework | Astro 5 + React islands | SSG, minimalny JS, React tylko gdzie potrzebny (animacje, formularz) |
| Język | TypeScript (strict) | |
| Style | Tailwind CSS 4 | |
| CMS | Contentful (free Community) | Hostowane, dobry edytor dla nietechnicznego użytkownika |
| Email | Resend + React Email | 3000 maili/mo free, własna domena DKIM |
| Animacje | `motion` (motion.dev) | ~3KB, hybrid API |
| Smooth scroll | Lenis | |
| Hosting | Vercel (free tier) | Najlepszy DX dla Astro, automatyczne preview deploys |
| Lint/format | Biome | Szybsze niż ESLint+Prettier |
| Test | Vitest + Playwright | Unit + E2E |
| Monorepo | pnpm workspaces + Turborepo | |

## 3. Struktura monorepo

```
cezar/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── biome.json
├── .env.example
├── apps/
│   └── web/                     # Astro app
│       ├── astro.config.ts
│       ├── tailwind.config.ts
│       ├── src/
│       │   ├── pages/
│       │   │   ├── index.astro
│       │   │   ├── realizacje/{index,[slug]}.astro
│       │   │   ├── w-budowie.astro
│       │   │   ├── kontakt.astro
│       │   │   ├── polityka-prywatnosci.astro
│       │   │   └── api/contact.ts
│       │   ├── layouts/Base.astro
│       │   ├── components/{astro,react}/
│       │   ├── lib/{contentful,resend,animations}.ts
│       │   ├── styles/globals.css
│       │   └── env.d.ts
│       └── public/
└── packages/
    └── contentful-types/        # auto-gen TS types z Contentful schema
        ├── codegen.ts
        └── src/{index,generated}.ts
```

## 4. Routing

| Ścieżka | Typ | Treść |
|---------|-----|-------|
| `/` | SSG | Single-scroll homepage (hero, about, realizacje teaser, proces, w-budowie teaser, kontakt) |
| `/realizacje` | SSG | Pełna siatka wszystkich `Project` (status=completed) |
| `/realizacje/[slug]` | SSG | Szczegóły projektu + galeria |
| `/w-budowie` | SSG | Pełna siatka `InProgressEntry` |
| `/kontakt` | SSG | Pełna strona kontaktu |
| `/polityka-prywatnosci` | SSG | Statyczna treść RODO |
| `/api/contact` | Vercel Function | POST: formularz → Resend |

## 5. Model treści (Contentful)

### Project (Realizacja)

```typescript
{
  title: string                     // "Dom pod Krakowem"
  slug: string                      // unique, URL-safe
  location: string                  // "Wieliczka, ul. Słoneczna"
  area: number                      // m² powierzchnia użytkowa
  plotArea?: number                 // m² działki
  year: number                      // rok ukończenia
  status: 'completed' | 'in_progress'
  shortDescription: string          // 1-2 zdania, na karcie
  description: RichText             // pełen opis
  coverImage: Asset                 // główne zdjęcie 16:9
  gallery: Asset[]                  // galeria
  features: string[]                // ["parter", "garaż 2 stan.", "ogród"]
  order: number                     // kolejność wyświetlania
}
```

### InProgressEntry (W budowie)

```typescript
{
  title: string
  slug: string
  location: string
  expectedCompletion: string        // "Q3 2026"
  progressPercent: number           // 0-100
  coverImage: Asset
  shortDescription: string
}
```

### SiteSettings (singleton)

```typescript
{
  heroHeadline: string              // "Domy na pokolenia."
  heroSubheadline: string
  heroBackgroundImage: Asset
  aboutHeadline: string
  aboutBody: RichText
  aboutPortrait: Asset              // foto Ewy
  processSteps: ProcessStep[]
  contactEmail: string
  contactPhone: string              // "+48 505 455 811"
  contactCity: string               // "Kraków"
  socialInstagram?: string
  socialFacebook?: string
}
```

### ProcessStep (referenced)

```typescript
{
  number: number                    // 1, 2, 3, 4
  title: string                     // "Konsultacja"
  description: string
  icon?: string                     // nazwa ikony Lucide
}
```

## 6. Design wizualny

**Kierunek:** Modern Bold / Architektoniczny.

**Paleta:**
- Tło: `#FAFAF7` (off-white)
- Akcent główny: `#1F3A2E` (zieleń butelkowa) — przyciski, headery, footer block
- Akcent jasny: `#D9D4C7` (piaskowy) — duże liczby, badge'y, dividery
- Tekst: `#0A0A0A` (near-black), `#4A4A4A` (secondary)

**Typografia:**
- Headery: **Inter** 800/700 weight, tight letter-spacing (-1.5px do -2.5px)
- Body: Inter 400/500
- Akcenty kursywne (np. "dosłownie."): Georgia italic dla kontrastu serif/sans

**Layout:**
- Asymetryczna siatka (1.4fr 1fr) w hero
- Mosaic grid w Realizacje (2/1/1 kolumny)
- Big numbers w sekcji proces (01-04)
- Sekcja "W budowie" na ciemnym tle (`#1F3A2E`) z piaskowym akcentem

**RWD:**
- Mobile (<640px): nav → hamburger, hero stack vertical, realizacje 1 kolumna, proces 1 kolumna z liczbami obok tekstu, formularz full-width
- Tablet (640-1024px): hero 2 kolumny, realizacje 2 kolumny
- Desktop (>1024px): pełen wireframe

## 7. Animacje

| # | Animacja | Element | Trigger |
|---|----------|---------|---------|
| 1 | Scroll reveal (fade + slide-up 24px, stagger 80ms) | Sekcje, listy kart | IntersectionObserver |
| 2 | Parallax | Hero background image | scroll |
| 3 | Headline split-text reveal | "DOMY NA POKOLENIA" | onMount |
| 4 | Card hover (zoom 1.05, overlay darken) | Karty realizacji | hover |
| 5 | Magnetic button (max 8px translate) | CTA "Skontaktuj się" | mousemove (desktop only) |
| 6 | Lightbox z keyboard nav, swipe na mobile | Galeria szczegółów | klik karty |
| 7 | Counter-up | Liczby procesu (01→04) | viewport |
| 8 | Progress bar fill | "W budowie" progressPercent | viewport |
| 9 | Lenis smooth scroll | Cała strona | global |
| 10 | Cursor follow (opcjonalny) | Desktop only | mousemove |

**Reduced motion:** wszystkie respektują `prefers-reduced-motion: reduce` (skrócone do fade 100ms lub off).

## 8. Sekcje strony głównej

W kolejności scrolla:

1. **Nav** — logo, linki (Realizacje, O nas, Proces, W budowie, Kontakt CTA)
2. **Hero** — duży headline, subheadline, 2 CTA (Zobacz realizacje, Skontaktuj się), obraz po prawej, asymetria 1.4fr/1fr
3. **O firmie** — sekcja z portretem Ewy + tekst (founder story, wartości)
4. **Realizacje teaser** — top 4 projektów w mosaic gridzie, link "Wszystkie 40+ →"
5. **Proces** — 4 kroki (Konsultacja, Projekt, Budowa, Klucze) z dużymi liczbami
6. **W budowie teaser** — top 3 projektów na ciemnym tle, progress bary
7. **Kontakt** — full-width section, formularz po prawej, dane po lewej
8. **Footer** — copyright, polityka, linki social

## 9. Formularz kontaktowy

**Pola (wszystkie wymagane oprócz telefon):**
- Imię i nazwisko (text)
- Email (email validation)
- Telefon (opcjonalny, regex polski format)
- Wiadomość (textarea, min 20 chars)
- Checkbox zgody RODO (wymagany)
- Honeypot ukryty: `website` (bot fill = 400)

**Walidacja:** zod schema, błędy inline pod polami.

**Backend (`/api/contact`):**
1. Parse + zod validate
2. Honeypot check (ukryte pole `website` — bot fill = 400)
3. Anti-spam: **Cloudflare Turnstile** (invisible, free unlimited) — token walidowany serverside przez `siteverify`. Honeypot + Turnstile zastępują potrzebę state-ful rate limitingu (in-memory nie działa na serverless cold starts).
4. Resend send do `CONTACT_EMAIL` (HTML + plaintext, React Email template)
5. Return JSON 200 z `{ ok: true }` lub 4xx z `{ error: string }`

**UX:**
- Loading state na przycisku
- Success: zamiana formularza na komunikat "Dziękujemy, odezwiemy się"
- Error: toast + retry

## 10. Aktualizacja treści

```
Ewa → Contentful Web App → Edit Project → Publish
                                        ↓
                      Webhook → Vercel Deploy Hook
                                        ↓
                          Astro rebuild + deploy (~30s)
                                        ↓
                         Strona zaktualizowana
```

Brak interakcji programistycznej dla typowej aktualizacji portfolio.

## 11. Środowisko (env vars)

```
CONTENTFUL_SPACE_ID=
CONTENTFUL_DELIVERY_TOKEN=          # read-only, build-time
CONTENTFUL_PREVIEW_TOKEN=           # opcjonalnie
CONTENTFUL_MANAGEMENT_TOKEN=        # tylko do codegen
RESEND_API_KEY=
CONTACT_EMAIL=piotrchuchla9@gmail.com
CONTACT_FROM_EMAIL=onboarding@resend.dev   # zmienić po weryfikacji domeny
SITE_URL=https://cezarestates.pl    # do absolutnych URL w sitemap/OG
TURNSTILE_SITE_KEY=                 # public, w bundle (PUBLIC_ prefix)
TURNSTILE_SECRET_KEY=               # serverside walidacja
```

Wszystkie ustawione lokalnie w `.env.local` oraz w Vercel Project Settings.

## 12. SEO / Meta

- `<title>` per strona, format: `{Tytuł strony} — Cezar Estates`
- Meta description z Contentful (fallback per template)
- Open Graph: `og:image` z coverImage projektu lub default
- JSON-LD: `Organization` schema na każdej stronie, `RealEstateAgent` na home
- Sitemap: `@astrojs/sitemap` plugin
- robots.txt: allow all
- Canonical URLs absolutne

## 13. Bezpieczeństwo i privacy

- Polityka prywatności statyczna z RODO clause
- Formularz: wymagany checkbox zgody RODO przed wysłaniem
- Brak Google Analytics. **Vercel Analytics** (free 2.5k events/mo, brak cookies, RODO-friendly)
- API keys tylko w env, nigdy w bundle (Astro automatycznie chroni `import.meta.env` bez prefiksu `PUBLIC_`)
- CSP + HSTS headers w `vercel.json`
- Anti-spam: honeypot + Cloudflare Turnstile na formularzu

## 14. Testowanie

- **Vitest** — unit testy:
  - `lib/contentful.ts` query builders
  - Zod schema walidacji formularza
  - Honeypot logic
- **Playwright** — E2E:
  - Load homepage, sprawdź obecność wszystkich sekcji
  - Klik na realizację → przejście na sub-page → galeria działa
  - Submit formularza (z mockiem Resend) → success state
- **Lighthouse CI** — target ≥95 Performance/SEO/Accessibility na `/`

## 15. Performance

- Astro SSG = 0 JS w domyślnej ścieżce
- React islands tylko `client:visible` lub `client:load` (formularz)
- Astro `<Image>` z lazy loading, blur placeholder, AVIF/WebP
- Fonts: `font-display: swap`, preload Inter regular+bold
- Lighthouse target: LCP <2s, CLS <0.05, TBT <200ms

## 16. Deployment

- GitHub repo → Vercel auto-deploy
- Branch `main` → production
- Branch `*` → preview deploys
- Env vars w Vercel Settings (per environment)
- Domena: TBD (np. `cezarestates.pl`) — DNS A/CNAME do Vercel po zakupie

## 17. Out of scope (świadomie pominięte)

- FAQ section
- Sekcja liczb / statystyk
- Testimonials
- Wielojęzyczność (tylko PL)
- Blog
- Konfigurator domu
- Panel admin (Contentful wystarcza)
- Płatności / leady CRM

## 18. Otwarte pytania

- **Domena:** do dokupienia (`cezarestates.pl` rekomendowane). Po zakupie verify DKIM w Resend, podmienić `CONTACT_FROM_EMAIL`.
- **Treści start:** kto pisze copy do hero, about, opisów realizacji? Ewa? Copywriter?
- **Zdjęcia start:** czy są profesjonalne fotografie realizacji? Jeśli nie — sesja?
- **Kontakt mail produkcyjny:** podmienić `piotrchuchla9@gmail.com` na docelowy mail Ewy przed go-live.
