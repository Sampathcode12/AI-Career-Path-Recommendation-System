import { MongoClient } from 'mongodb';

const globalKey = Symbol.for('careerPath.mongo');

function resolveUri() {
  return (process.env.MONGODB_URI || process.env.DATABASE_URL || '').trim();
}

export function isMongoConfigured() {
  return resolveUri().length > 0;
}

/** Reuse one client across warm serverless invocations. */
export async function getDb() {
  const uri = resolveUri();
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add a MongoDB Atlas connection string in Vercel Environment Variables.',
    );
  }

  const cache = global[globalKey];
  if (cache?.db) return cache.db;

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  global[globalKey] = { client, db };
  return db;
}

export async function ensureIndexes() {
  const db = await getDb();
  await db.collection('users').createIndex({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
  await db.collection('users').createIndex({ id: 1 }, { unique: true });
  await db.collection('user_profiles').createIndex({ user_id: 1 }, { unique: true });
  await db.collection('user_profiles').createIndex({ id: 1 }, { unique: true });
  await db.collection('assessments').createIndex({ user_id: 1, created_at: -1 });
  await db.collection('career_recommendations').createIndex({ user_id: 1, sort_order: 1 });
  await db.collection('saved_jobs').createIndex({ user_id: 1, saved_at: -1 });
}
