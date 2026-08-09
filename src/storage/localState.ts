import type { CaseState, Fingerprint } from '@/types';

const KEY = 'kawach.case.v1';
const SCHEMA_VERSION = 1 as const;

function makeCaseId(): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `KWC-${suffix.toUpperCase()}`;
}

export function createCase(): CaseState {
  return {
    schemaVersion: SCHEMA_VERSION,
    caseId: makeCaseId(),
    createdAt: new Date().toISOString(),
    answers: {},
    fingerprints: [],
    screenshotCount: 0,
    draft: null,
    payment: {
      paid: false,
      transactionId: null,
      method: null,
      amountNPR: 5,
      paidAt: null,
      simulated: true,
    },
    nodeId: 'entry',
    history: [],
    completedGuidance: false,
  };
}

/**
 * Reads through a version check. An unknown schemaVersion is discarded rather
 * than migrated — a half-understood case record is worse than a fresh start.
 */
export function loadCase(): CaseState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CaseState;
    if (parsed?.schemaVersion !== SCHEMA_VERSION) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveCase(state: CaseState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage can be full or blocked (Safari private mode). The in-memory
    // flow continues to work; persistence is a convenience, not a dependency.
  }
}

export function loadOrCreateCase(): CaseState {
  return loadCase() ?? createCase();
}

export function patchCase(patch: Partial<CaseState>): CaseState {
  const next = { ...loadOrCreateCase(), ...patch };
  saveCase(next);
  return next;
}

export function appendFingerprint(fp: Fingerprint): CaseState {
  const current = loadOrCreateCase();
  const next: CaseState = { ...current, fingerprints: [...current.fingerprints, fp] };
  saveCase(next);
  return next;
}

/** Panic control. Clears everything this app has written to the device. */
export async function wipeAll(): Promise<void> {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('kawach.')) localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }

  try {
    const { deleteScreenshotDb } = await import('@/storage/db');
    await deleteScreenshotDb();
  } catch {
    // ignore
  }
}
