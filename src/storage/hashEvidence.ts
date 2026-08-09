import type { Fingerprint } from '@/types';

/**
 * SHA-256 fingerprinting, entirely in-browser.
 *
 * THE INVARIANT: image bytes never enter React state, never reach storage,
 * and never appear in a network request body. This module is the only place
 * that touches them, and it holds them only long enough to digest.
 *
 * What this proves: the file the user holds later is byte-identical to the
 * file that existed at the recorded timestamp. That is tamper-evidence.
 *
 * What this does NOT do: match visually similar copies. SHA-256 is
 * cryptographic — re-encode or crop the image and the hash is unrelated.
 * Content matching needs perceptual hashing (PDQ-family), which is what
 * StopNCII and NCMEC Take It Down run inside their own flows. We hand off to
 * them rather than pretending to wrap them.
 */

const MAX_BYTES = 25 * 1024 * 1024;

export class HashError extends Error {
  constructor(public code: 'INSECURE_CONTEXT' | 'TOO_LARGE' | 'READ_FAILED') {
    super(code);
    this.name = 'HashError';
  }
}

export async function fingerprintFile(file: File, label: string): Promise<Fingerprint> {
  // Web Crypto requires a secure context. Failing loudly beats a silent
  // no-op that leaves the user believing they are protected.
  if (!globalThis.crypto?.subtle) throw new HashError('INSECURE_CONTEXT');
  if (file.size > MAX_BYTES) throw new HashError('TOO_LARGE');

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    throw new HashError('READ_FAILED');
  }

  const digest = await crypto.subtle.digest('SHA-256', buffer);

  const hash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Overwrite the plaintext bytes before releasing the reference. GC timing
  // is not guaranteed, so we do not rely on it alone.
  new Uint8Array(buffer).fill(0);

  return {
    algo: 'SHA-256',
    hash,
    hashedAt: new Date().toISOString(),
    sizeBytes: file.size,
    label,
  };
}

/** Groups the digest into readable blocks for on-screen display. */
export function formatHash(hash: string, groupSize = 8): string {
  return (hash.match(new RegExp(`.{1,${groupSize}}`, 'g')) ?? []).join(' ');
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
