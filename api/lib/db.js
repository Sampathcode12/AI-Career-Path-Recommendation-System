import { getDb, ensureIndexes } from './mongodb.js';
import { ensureSeeded } from './seed.js';

let ready = false;

export async function prepareDb() {
  const db = await getDb();
  if (!ready) {
    await ensureIndexes();
    await ensureSeeded();
    ready = true;
  }
  return db;
}
