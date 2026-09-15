import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import listing from "./__fixtures__/listing.json";
import { formatListingPlace, NO_PLACE } from "./place";
import { listingHighlights } from "./listingFeatures";

/**
 * What a listing actually looks like, and who is allowed to interpret it.
 *
 * Three bugs in one week came from the same mistake: a page keeping its own copy
 * of logic that reads a shape the service does not send.
 *
 *   The household browse filters matched against fields the API never returned.
 *   job.household_id was read in eight places and set in none.
 *   The Saved cards read location.name and salary_range, and showed "Location
 *     not specified" and "Salary: Not specified" for jobs that displayed both on
 *     the board a click earlier.
 *
 * Each looked different and was the same error. What makes the class dangerous
 * is that it cannot fail loudly: reading a field nobody sends returns undefined,
 * the formatter falls through to its fallback, and the fallback is plausible
 * text that reads as missing data rather than as a bug.
 *
 * The fixture is a real response, captured from the deployed service rather than
 * written by hand — a hand-written one only proves the shape somebody imagined.
 */

describe("the shared formatters against a real listing", () => {
  it("names the place from ward and subcounty", () => {
    const place = formatListingPlace(listing as never);

    expect(place).not.toBe(NO_PLACE);
    expect(place).toContain("Chesikaki");
  });

  it("reads the salary out of the SalaryRange feature group", () => {
    const { salary } = listingHighlights(listing as never);

    expect(salary).toBeTruthy();
    expect(salary).toMatch(/KES/);
  });

  it("has none of the fields pages kept inventing", () => {
    // If any of these ever appears in a real response, the denylist below is
    // wrong and should shrink — that is the point of asserting it here rather
    // than trusting the comment.
    expect(listing).not.toHaveProperty("location");
    expect(listing).not.toHaveProperty("salary_range");
    expect(listing).not.toHaveProperty("household_id");
  });
});

/**
 * Fields no listing response carries, which nothing may read.
 *
 * This is the half that would have caught all three bugs. Testing the shared
 * helpers proves they work — they always did. What went wrong each time was a
 * page not using them, and reading something plausible-sounding instead.
 *
 * Matched only when read off something named like a listing.
 *
 * The first cut of this matched the bare field names anywhere and flagged six
 * files that were right: a hiring record genuinely has a household_id, the
 * household API genuinely returns one, and errorMessages maps a server
 * validation string for the create-listing form, where salary_range is the
 * request field. A test that cries wolf gets its expectations edited rather than
 * its findings read, so it asks the narrower question it actually means: is
 * something interpreting a *listing* on its own terms.
 */
const LISTING = String.raw`(?:job|listing|jobListing|savedJob)\??\.`;

const PHANTOM_LISTING_FIELDS = [
  // A listing carries its place as ward/subcounty at the top level.
  {
    pattern: new RegExp(`${LISTING}\\s*location\\b[\\s\\S]{0,12}?\\bname\\b|${LISTING}\\s*location\\b(?!_)`),
    name: "job.location",
    use: "formatListingPlace from ~/utils/place",
  },
  // Salary is a SalaryRange feature group, already formatted for display.
  {
    pattern: new RegExp(`${LISTING}\\s*salary_range\\b`),
    name: "job.salary_range",
    use: "listingHighlights from ~/utils/listingFeatures",
  },
  // ListJobs returns owner_user_id and user_profile_id.
  {
    pattern: new RegExp(`${LISTING}\\s*household_id\\b`),
    name: "job.household_id",
    use: "owner_user_id / user_profile_id",
  },
];

/**
 * Files allowed to name these fields.
 *
 * The shared helpers are the exception on purpose: they are the one place that
 * should know a listing has been shaped differently over time, and
 * formatListingPlace falls back to listing.location precisely so no page has to.
 * Allowing them is what makes "use the shared helper" an answer rather than a
 * rule with nowhere to point.
 */
const ALLOWED = [
  "app/utils/listingShape.test.ts",
  "app/utils/__fixtures__/listing.json",
  "app/utils/place.ts",
  "app/utils/listingFeatures.ts",
];

function sourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "build" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      sourceFiles(full, found);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      found.push(full);
    }
  }
  return found;
}

describe("nothing reads a listing field the service does not send", () => {
  it("finds no page interpreting a listing on its own terms", () => {
    const offenders: string[] = [];

    for (const file of sourceFiles("app")) {
      const relative = file.replace(/\\/g, "/");
      if (ALLOWED.some((allowed) => relative.endsWith(allowed))) continue;

      const source = readFileSync(file, "utf8");
      // Comments explain these on purpose; only real reads matter.
      const code = source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .split("\n")
        .filter((line) => !line.trim().startsWith("//"))
        .join("\n");

      for (const field of PHANTOM_LISTING_FIELDS) {
        if (field.pattern.test(code)) {
          offenders.push(`${relative} reads ${field.name} — use ${field.use}`);
        }
      }
    }

    expect(
      offenders,
      `A listing does not carry these fields, so reading one returns undefined and the\n` +
        `screen falls through to "not specified" for data that is present:\n\n  ` +
        offenders.join("\n  ") +
        `\n\nIf the service genuinely started sending one, remove it from\nPHANTOM_LISTING_FIELDS and refresh app/utils/__fixtures__/listing.json.\n`,
    ).toEqual([]);
  });
});

/**
 * Sorting by budget across frequencies.
 *
 * The board's budget sorts read job.salary_range.max, which no listing carries,
 * so every job scored null, every comparison tied, and "Highest budget" returned
 * the list in the order it arrived. A sort that silently does nothing is the
 * worst kind: nothing looks broken.
 *
 * The replacement reads the SalaryRange feature and normalises to a month,
 * because the two formats in the data right now are "daily: 500-1,000 KES" and
 * "monthly: 25,000+ KES" — and 1,000 a day is more than 25,000 a month. Sorting
 * on the bare number would have put them the wrong way round, which is worse
 * than not sorting at all.
 */
describe("budget ordering", () => {
  const MONTHLY_EQUIVALENT: Record<string, number> = {
    hourly: 8 * 26,
    daily: 26,
    weekly: 4.33,
    monthly: 1,
    yearly: 1 / 12,
  };

  // Mirrors getJobBudgetValue in ServiceProviderJobsHome; kept here because the
  // component is not importable without a DOM.
  const budgetOf = (salary: string): number | null => {
    if (!salary) return null;
    const frequency = Object.keys(MONTHLY_EQUIVALENT).find((key) =>
      salary.toLowerCase().startsWith(key),
    );
    const amounts = (salary.replace(/,/g, "").match(/\d+(?:\.\d+)?/g) || [])
      .map(Number)
      .filter((value) => Number.isFinite(value));
    if (amounts.length === 0) return null;
    return Math.max(...amounts) * (frequency ? MONTHLY_EQUIVALENT[frequency] : 1);
  };

  it("takes the top of a range", () => {
    expect(budgetOf("daily: 500-1,000 KES")).toBe(1000 * 26);
  });

  it("reads an open-ended figure", () => {
    expect(budgetOf("monthly: 25,000+ KES")).toBe(25000);
  });

  it("ranks a daily rate above a monthly one it actually beats", () => {
    // The pair in the live data. Sorted on the bare numbers, 1,000 would have
    // come last.
    expect(budgetOf("daily: 500-1,000 KES")!).toBeGreaterThan(
      budgetOf("monthly: 25,000+ KES")!,
    );
  });

  it("gives nothing to sort on when there is no salary", () => {
    expect(budgetOf("")).toBeNull();
    expect(budgetOf("negotiable")).toBeNull();
  });
});

/**
 * The listing survives the trip onto an application.
 *
 * The household's page and the househelp's page each described the same job.
 * They drifted: the household saw chores, salary range, start timing, frequency,
 * duration, work arrangement, days and shift window, and the househelp — looking
 * at their own application for that job — saw the message they had written and
 * "Salary Expected: Not specified".
 *
 * Nothing was missing from the API. The listing was fetched to resolve the
 * household behind each application and then dropped, everything but the title,
 * on the way into the row. That is what this checks: a rendering rule is hard to
 * state in a source scan without an allowlist that rots, but "the thing we
 * fetched is still attached" is exact.
 */
describe("an application carries the job it is for", () => {
  it("keeps the listing, not only its title", () => {
    const { readFileSync } = require("node:fs");
    const source = readFileSync("app/components/service-provider-pages/hiring-history.tsx", "utf8");
    expect(source, "the fetched listing is being discarded again").toMatch(
      /\n\s+listing,\n/,
    );
  });

  it("shows the job's salary rather than a field an application never carries", () => {
    const { readFileSync } = require("node:fs");
    const source = readFileSync("app/components/service-provider-pages/hiring-history.tsx", "utf8");
    expect(source).toMatch(/listingSalary\(interest\.listing\)/);
    // salary_expectation described an interest's asking rate and is always 0 on
    // an application, so rendering it read "Not specified" on every row.
    expect(
      /formatSalary\(interest\.salary_expectation/.test(source),
      "the row is back to reading a salary an application does not carry",
    ).toBe(false);
  });
});
