import { deleteDB, openDB, type IDBPDatabase } from 'idb';

/**
 * IndexedDB store for CONVERSATION screenshots only.
 *
 * Never used for the explicit image — that path terminates at a hash and has
 * no storage step at all. See storage/hashEvidence.ts.
 *
 * Every call is wrapped: Safari private mode can reject storage outright, and
 * a storage failure must degrade to "screenshots unavailable" rather than
 * breaking the response flow.
 */

const DB_NAME = 'kawach-evidence';
const STORE = 'screenshots';
const DB_VERSION = 1;

export interface ScreenshotRecord {
  id?: number;
  blob: Blob;
  label: string;
  addedAt: string;
  sizeBytes: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export async function isStorageAvailable(): Promise<boolean> {
  try {
    await getDb();
    return true;
  } catch {
    return false;
  }
}

export async function addScreenshot(
  file: File,
  label: string,
): Promise<ScreenshotRecord | null> {
  try {
    const db = await getDb();
    const record: ScreenshotRecord = {
      blob: file,
      label,
      addedAt: new Date().toISOString(),
      sizeBytes: file.size,
    };
    const id = await db.add(STORE, record);
    return { ...record, id: id as number };
  } catch {
    return null;
  }
}

export async function listScreenshots(): Promise<ScreenshotRecord[]> {
  try {
    const db = await getDb();
    return (await db.getAll(STORE)) as ScreenshotRecord[];
  } catch {
    return [];
  }
}

export async function deleteScreenshot(id: number): Promise<boolean> {
  try {
    const db = await getDb();
    await db.delete(STORE, id);
    return true;
  } catch {
    return false;
  }
}

export async function deleteScreenshotDb(): Promise<void> {
  try {
    if (dbPromise) {
      const db = await dbPromise;
      db.close();
      dbPromise = null;
    }
    await deleteDB(DB_NAME);
  } catch {
    // ignore
  }
}
