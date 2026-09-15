import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(path, 'utf8');

describe('guided route tours', () => {
  const tour = source('app/components/GuidedRouteTour.tsx');

  it('uses the Homebit primary gradient for the forward action', () => {
    expect(tour).toContain('bg-gradient-to-r from-purple-600 to-pink-600');
    expect(tour).toContain('hover:from-purple-700 hover:to-pink-700');
  });

  it('targets named tutorial anchors instead of whichever button appears first', () => {
    expect(tour).toContain('[data-tour="discovery-filters"]');
    expect(tour).toContain('[data-tour="marketplace-card"]');
    expect(tour).not.toContain("selector: 'main input, main button'");
    expect(tour).not.toContain("selector: 'main button'");
  });

  it('ignores hidden responsive duplicates when resolving a target', () => {
    expect(tour).toContain('document.querySelectorAll<HTMLElement>');
    expect(tour).toContain('rect.width > 0 && rect.height > 0');
    expect(tour).toContain("style.visibility !== 'hidden'");
  });

  it('places the filter anchors on both marketplace home variants', () => {
    expect(source('app/components/ServiceProviderJobsHome.tsx')).toContain('data-tour="discovery-filters"');
    expect(source('app/components/HouseholdJobsHome.tsx')).toContain('data-tour="discovery-filters"');
  });

  it('persists first display locally and restores it from the tour service', () => {
    expect(tour).toContain('tourService.getProgress');
    expect(tour).toContain("status: 'started'");
    expect(tour).toContain("recordTourEvent('started', 0)");
    expect(tour).toContain("recordTourEvent('step_viewed', index)");
  });

  it('tracks skip and completion as distinct outcomes', () => {
    expect(tour).toContain("finish('skipped')");
    expect(tour).toContain("finish('completed')");
  });
});
