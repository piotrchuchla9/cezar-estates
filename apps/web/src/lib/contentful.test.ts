import { describe, expect, it } from 'vitest';
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
