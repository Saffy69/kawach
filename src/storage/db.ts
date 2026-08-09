import { deleteDB, openDB, type IDBPDatabase } from 'idb';
import type { LocalReportRecord, ReportReviewStatus } from '@/types';

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
const SCREENSHOT_STORE = 'screenshots';
const REPORT_STORE = 'reports';
const DB_VERSION = 2;

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
        if (!db.objectStoreNames.contains(SCREENSHOT_STORE)) {
          db.createObjectStore(SCREENSHOT_STORE, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(REPORT_STORE)) {
          db.createObjectStore(REPORT_STORE, { keyPath: 'id' });
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
    const id = await db.add(SCREENSHOT_STORE, record);
    return { ...record, id: id as number };
  } catch {
    return null;
  }
}

export async function listScreenshots(): Promise<ScreenshotRecord[]> {
  try {
    const db = await getDb();
    return (await db.getAll(SCREENSHOT_STORE)) as ScreenshotRecord[];
  } catch {
    return [];
  }
}

export async function deleteScreenshot(id: number): Promise<boolean> {
  try {
    const db = await getDb();
    await db.delete(SCREENSHOT_STORE, id);
    return true;
  } catch {
    return false;
  }
}

export async function saveLocalReport(report: LocalReportRecord): Promise<boolean> {
  try {
    const db = await getDb();
    await db.put(REPORT_STORE, report);
    return true;
  } catch {
    return false;
  }
}

export async function listLocalReports(): Promise<LocalReportRecord[]> {
  try {
    const db = await getDb();
    const reports = await db.getAll(REPORT_STORE);
    return (reports as LocalReportRecord[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export async function updateLocalReportStatus(
  id: string,
  status: ReportReviewStatus,
  verificationNotes: string[],
): Promise<boolean> {
  try {
    const db = await getDb();
    const report = await db.get(REPORT_STORE, id) as LocalReportRecord | undefined;
    if (!report) return false;
    await db.put(REPORT_STORE, {
      ...report,
      status,
      verificationNotes,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteLocalReport(id: string): Promise<boolean> {
  try {
    const db = await getDb();
    await db.delete(REPORT_STORE, id);
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
