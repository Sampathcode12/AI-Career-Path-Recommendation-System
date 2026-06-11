import { getDb } from './mongodb.js';

/** Numeric user ids (matches legacy .NET JWT nameidentifier). */
export async function nextSequence(name) {
  const db = await getDb();
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  );
  return result.seq;
}
