import { createClient } from 'contentful';
import type {
  TypeProjectSkeleton,
  TypeInProgressEntrySkeleton,
  TypeSiteSettingsSkeleton,
} from '@cezar/contentful-types';
import type { Entry } from 'contentful';

// Lazy client initialisation — avoids throwing at module load time (e.g. during tests).
function getClient() {
  const space = import.meta.env.CONTENTFUL_SPACE_ID;
  const accessToken = import.meta.env.CONTENTFUL_DELIVERY_TOKEN;
  if (!space || !accessToken) {
    throw new Error('Missing CONTENTFUL_SPACE_ID or CONTENTFUL_DELIVERY_TOKEN');
  }
  return createClient({ space, accessToken });
}

let _cf: ReturnType<typeof createClient> | null = null;
function client() {
  return (_cf ??= getClient());
}

export function sortProjectsForDisplay<T extends Entry<TypeProjectSkeleton>>(
  projects: T[],
): T[] {
  return [...projects].sort((a, b) => {
    const orderDiff =
      ((a.fields.order as number) ?? 0) - ((b.fields.order as number) ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return (
      ((b.fields.year as number) ?? 0) - ((a.fields.year as number) ?? 0)
    );
  });
}

export async function getCompletedProjects(limit = 100) {
  const res = await client().getEntries<TypeProjectSkeleton>({
    content_type: 'project',
    'fields.status': 'completed',
    limit,
  });
  return sortProjectsForDisplay(res.items);
}

export async function getProjectBySlug(slug: string) {
  const res = await client().getEntries<TypeProjectSkeleton>({
    content_type: 'project',
    'fields.slug': slug,
    limit: 1,
  });
  return res.items[0] ?? null;
}

export async function getInProgressEntries(limit = 100) {
  const res = await client().getEntries<TypeInProgressEntrySkeleton>({
    content_type: 'inProgressEntry',
    limit,
  });
  return res.items;
}

export async function getSiteSettings() {
  const res = await client().getEntries<TypeSiteSettingsSkeleton>({
    content_type: 'siteSettings',
    limit: 1,
    include: 2,
  });
  const settings = res.items[0];
  if (!settings) throw new Error('SiteSettings entry missing in Contentful');
  return settings;
}
