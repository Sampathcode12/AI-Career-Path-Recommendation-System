import bcrypt from 'bcryptjs';
import { getDb, ensureIndexes } from '../lib/mongodb.js';
import { nextSequence } from '../lib/counters.js';
import { signUserToken, verifyBearerToken } from '../lib/jwt.js';
import { readJsonBody, sendJson } from '../lib/http.js';

let indexesReady = false;

async function prepareDb() {
  const db = await getDb();
  if (!indexesReady) {
    await ensureIndexes();
    indexesReady = true;
  }
  return db;
}

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email };
}

function authPayload(token, user) {
  return { access_token: token, user: publicUser(user) };
}

export async function handleAuthSignup(req, res) {
  const body = readJsonBody(req);
  const name = String(body?.name ?? '').trim();
  const email = String(body?.email ?? '').trim();
  const password = body?.password;

  if (!email) return sendJson(res, 400, { detail: 'Email is required.' });
  if (!password) return sendJson(res, 400, { detail: 'Password is required.' });

  try {
    const db = await prepareDb();
    const emailLower = email.toLowerCase();
    const existing = await db.collection('users').findOne({ email: emailLower });
    if (existing) return sendJson(res, 400, { detail: 'Email already registered.' });

    const id = await nextSequence('users');
    const now = new Date();
    const user = {
      id,
      name,
      email: emailLower,
      password_hash: await bcrypt.hash(String(password), 10),
      created_at: now,
    };
    await db.collection('users').insertOne(user);
    await db.collection('user_sign_in_details').insertOne({
      user_id: id,
      email: emailLower,
      signed_in_at: now,
    });

    const token = signUserToken(user);
    sendJson(res, 200, authPayload(token, user));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Sign up failed.' });
  }
}

export async function handleAuthLoginJson(req, res) {
  const body = readJsonBody(req);
  if (!body) {
    return sendJson(res, 400, { detail: 'Request body must be JSON with email and password.' });
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  const password = body.password;
  if (!email || password == null) {
    return sendJson(res, 401, { detail: 'Invalid email or password.' });
  }

  try {
    const db = await prepareDb();
    const user = await db.collection('users').findOne({ email });
    if (!user?.password_hash) {
      return sendJson(res, 401, { detail: 'Invalid email or password.' });
    }

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return sendJson(res, 401, { detail: 'Invalid email or password.' });

    await db.collection('user_sign_in_details').insertOne({
      user_id: user.id,
      email: user.email,
      signed_in_at: new Date(),
    });

    const token = signUserToken(user);
    sendJson(res, 200, authPayload(token, user));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Login failed.' });
  }
}

export async function handleAuthMe(req, res) {
  const claims = verifyBearerToken(req.headers.authorization || req.headers.Authorization);
  if (!claims) return sendJson(res, 401, { detail: 'Unauthorized.' });

  try {
    const db = await prepareDb();
    const user = await db.collection('users').findOne({ id: claims.id });
    if (!user) return sendJson(res, 404, { detail: 'User not found.' });
    sendJson(res, 200, publicUser(user));
  } catch (err) {
    sendJson(res, 500, { detail: err instanceof Error ? err.message : 'Could not load user.' });
  }
}
