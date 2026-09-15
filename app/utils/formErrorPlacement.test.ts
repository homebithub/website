import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * The reason a form refused is shown next to the button that was pressed.
 *
 * These forms used to render their error at the top. On a short one that is
 * fine. On a job post, an open-for-work listing or a hire request the submit
 * button is several screens below it, so pressing Save appeared to do nothing
 * and the explanation sat off-screen behind the person — which is where somebody
 * abandons a thing they had already decided to do.
 *
 * What this measures is distance: how far the form's error is from the form's
 * button. It deliberately does not object to an error that sits a few lines
 * above a field — an error directly above a message composer is exactly right.
 * It objects to one that is nowhere near the control that produced it.
 *
 * It reads the last error render and the last submit control in each file,
 * because a file may also carry a page-level banner for things that happen
 * outside its form, and that one is not what this is about.
 */

const COMPONENTS = join(process.cwd(), 'app', 'components');

/** How far an error may sit from the button, in lines of source. */
const MAX_DISTANCE = 80;

type Placement = { file: string; errorLine: number; submitLine: number };

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith('.tsx') ? [full] : [];
  });
}

function lastIndex(lines: string[], matches: (line: string) => boolean): number {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (matches(lines[index])) return index;
  }
  return -1;
}

function placementOf(path: string): Placement | null {
  const lines = readFileSync(path, 'utf8').split('\n');

  const errorLine = lastIndex(
    lines,
    (line) =>
      !line.startsWith('import ') &&
      (/\{(error|formError|submitError|saveError|actionError)\s*&&/.test(line) ||
        /<ErrorAlert\b/.test(line) ||
        /<FormError\b/.test(line)),
  );

  const submitLine = lastIndex(lines, (line) =>
    /type="submit"|onClick=\{(handleSubmit|handleSave|submit|save|upload)\b/.test(line),
  );

  if (errorLine === -1 || submitLine === -1) return null;
  return {
    file: path.slice(COMPONENTS.length + 1),
    errorLine: errorLine + 1,
    submitLine: submitLine + 1,
  };
}

describe('form errors are shown where the person is looking', () => {
  const placements = walk(COMPONENTS)
    .map(placementOf)
    .filter((placement): placement is Placement => placement !== null);

  it('finds the forms it is meant to be checking', () => {
    // Without this the suite passes by finding nothing, and it nearly did: an
    // earlier version of the detector knew the old spellings of an error render
    // but not the component that replaced them, so every form that had been
    // fixed dropped out of the check rather than passing it.
    expect(placements.length).toBeGreaterThan(8);
    const files = placements.map((placement) => placement.file);
    expect(files).toContain('modals/JobPostModal.tsx');
    expect(files).toContain('modals/OpenForWorkModal.tsx');
    expect(files).toContain('ProfileReviews.tsx');
  });

  it('keeps the error within sight of the submit button', () => {
    const stranded = placements
      .filter((placement) => placement.submitLine - placement.errorLine > MAX_DISTANCE)
      .map(
        (placement) =>
          `${placement.file}: error at line ${placement.errorLine}, ` +
          `button at ${placement.submitLine} (${placement.submitLine - placement.errorLine} lines apart)`,
      );

    expect(
      stranded,
      'the reason is too far from the button to be seen by somebody pressing it',
    ).toEqual([]);
  });
});
