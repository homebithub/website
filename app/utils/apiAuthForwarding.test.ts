import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Every call that changes something carries the caller.
 *
 * These route files sit between the browser and the gRPC services and speak to
 * auth on the user's behalf. Each `callUnaryGrpc` takes optional metadata as its
 * last argument, and that is where the session token goes.
 *
 * The apply and shortlist branch of the job-listings route was the one POST that
 * left it out. Nothing failed for as long as the RPC behind it asked nobody
 * anything; the moment an ownership check was added there — so that a household
 * hiring somebody it approached directly could be told apart from an applicant
 * answering an advert — every application stopped being possible, for households
 * and househelps alike, with a generic "please try again".
 *
 * That is the shape of the mistake worth catching: not a call that is wrong
 * today, but one that is fine only because the far end has not started checking
 * yet. Reads are exempt, since several are deliberately public.
 */

const ROUTES_DIR = join(process.cwd(), 'app', 'routes');

/** RPC names that only read. Everything else must forward the caller. */
const READ_ONLY = new Set([
  'ListJobs',
  'GetJobListing',
  'ListApplications',
  'ListJobTypes',
  'GetProfileFeatures',
  'ListFeatures',
  'GetOutcomePrompt',
  'ListPicks',
  'GetListingFeatureProperties',
  'GetJobTypeFeatureBundles',
]);

/**
 * Calls made before anybody is signed in. A login has no session to forward —
 * establishing one is the point of the call.
 */
const PRE_SESSION = new Set([
  'Login',
  'Signup',
  'Register',
  'VerifyOTP',
  'VerifyOtp',
  'ResendOTP',
  'RefreshToken',
  'Refresh',
  'RecordOutcome',
]);

type Call = { file: string; rpc: string; forwardsAuth: boolean };

/**
 * Reads every `callUnaryGrpc(...)` out of a file with paren matching rather than
 * a regex, because the argument lists span lines and contain nested calls.
 */
function callsIn(file: string, source: string): Call[] {
  const calls: Call[] = [];
  const marker = 'callUnaryGrpc(';

  for (let index = source.indexOf(marker); index !== -1; index = source.indexOf(marker, index + 1)) {
    let depth = 0;
    let end = -1;
    for (let cursor = index + marker.length - 1; cursor < source.length; cursor += 1) {
      const char = source[cursor];
      if (char === '(') depth += 1;
      if (char === ')') {
        depth -= 1;
        if (depth === 0) {
          end = cursor;
          break;
        }
      }
    }
    if (end === -1) continue;

    const args = source.slice(index + marker.length, end);
    // The RPC is named by its full method path, whether inline or via a variable
    // assigned just above (`const rpcPath = ... ? '/auth.X/A' : '/auth.X/B'`).
    const paths = [...args.matchAll(/\/[\w.]+\/(\w+)/g)].map((match) => match[1]);
    if (paths.length === 0) {
      // A path held in a variable. Look back for the nearest assignment.
      const preceding = source.slice(Math.max(0, index - 800), index);
      for (const match of preceding.matchAll(/\/[\w.]+\/(\w+)/g)) paths.push(match[1]);
    }

    // Either built inline, or handed down as a parameter by a helper whose
    // caller built it — both put the token on the wire.
    const forwardsAuth = /authMetadata|\bmetadata\b|matchAuth/.test(args);
    for (const rpc of paths.length > 0 ? paths : ['<unknown>']) {
      calls.push({ file, rpc, forwardsAuth });
    }
  }
  return calls;
}

function everyCall(): Call[] {
  return readdirSync(ROUTES_DIR)
    .filter((name) => name.startsWith('api.') && name.endsWith('.ts'))
    .flatMap((name) => callsIn(name, readFileSync(join(ROUTES_DIR, name), 'utf8')));
}

describe('server routes forward the caller to auth', () => {
  it('finds the calls it is meant to be checking', () => {
    const calls = everyCall();
    // A guard on the guard: a refactor that renames the helper would otherwise
    // leave this suite passing against nothing at all.
    expect(calls.length).toBeGreaterThan(10);
    expect(calls.some((call) => call.rpc === 'InitiateListing')).toBe(true);
  });

  it('sends the session on every call that changes something', () => {
    const missing = everyCall().filter(
      (call) =>
        !call.forwardsAuth &&
        !READ_ONLY.has(call.rpc) &&
        !PRE_SESSION.has(call.rpc) &&
        call.rpc !== '<unknown>',
    );

    expect(
      missing.map((call) => `${call.file} -> ${call.rpc}`),
      'these change something but reach auth anonymously, so any ownership check on them refuses everyone',
    ).toEqual([]);
  });

  it('sends the session when applying to a job', () => {
    // Named on its own because it is the one that broke, and because both the
    // househelp applying and the household headhunting go through it.
    const applying = everyCall().filter(
      (call) => call.rpc === 'InitiateListing' || call.rpc === 'ShortlistListing',
    );
    expect(applying.length).toBeGreaterThan(0);
    for (const call of applying) {
      expect(call.forwardsAuth, `${call.file} -> ${call.rpc}`).toBe(true);
    }
  });
});
