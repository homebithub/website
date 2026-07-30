import {
  callUnaryGrpc,
  concatBytes,
  encodeStringField,
  resolveAuthGrpcBaseUrl,
} from '~/utils/grpcRaw.server';

/**
 * The endpoint behind the "did the work happen?" link.
 *
 * Unauthenticated on purpose: requiring a sign-in to answer one question loses
 * most of the answers, and the answers are the point. The signed token is the
 * access control — it is scoped to one engagement and one person, it expires, and
 * auth refuses anything it cannot verify.
 *
 * GET reads and changes nothing. That is not a stylistic choice: mail clients and
 * security scanners prefetch every URL in a message, so a GET that recorded an
 * answer would have the outcome filled in by a robot before the person ever saw
 * the question. The answer is a POST from the page.
 */

function encodeToken(token: string) {
  return concatBytes([encodeStringField(1, token)]);
}

function encodeRecord(token: string, response: string) {
  return concatBytes([
    encodeStringField(1, token),
    encodeStringField(2, response),
  ]);
}

// Mirrors what auth accepts. Checked here too so an obviously wrong value never
// costs a round trip.
const ALLOWED = new Set(['started', 'did_not_start', 'not_yet']);

export async function loader({ request }: { request: Request }) {
  const token = new URL(request.url).searchParams.get('token') || '';
  if (!token) {
    return Response.json({ message: 'This link is missing its token.' }, { status: 400 });
  }

  try {
    const { body } = await callUnaryGrpc(
      resolveAuthGrpcBaseUrl(request),
      '/auth.EmploymentService/GetOutcomePrompt',
      encodeToken(token),
    );
    return Response.json({ data: body.data ?? body });
  } catch {
    // Auth is deliberately vague about why, and so is this: telling someone
    // probing the endpoint whether a token was expired or forged narrows their
    // guesses.
    return Response.json(
      { message: 'This link is no longer valid. Please use the most recent email we sent you.' },
      { status: 401 },
    );
  }
}

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ message: 'Method not allowed' }, { status: 405 });
  }

  const body = await request.json().catch(() => ({}));
  const token = String(body?.token || '');
  const response = String(body?.response || '');

  if (!token || !ALLOWED.has(response)) {
    return Response.json({ message: 'That answer was not recognised.' }, { status: 400 });
  }

  try {
    const { body: responseBody } = await callUnaryGrpc(
      resolveAuthGrpcBaseUrl(request),
      '/auth.EmploymentService/RecordOutcome',
      encodeRecord(token, response),
    );
    return Response.json({ data: responseBody.data ?? responseBody });
  } catch {
    return Response.json(
      { message: 'We could not record that. Please use the most recent email we sent you.' },
      { status: 401 },
    );
  }
}
