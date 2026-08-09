import { renderTemplate } from '@/services/reportTemplate';
import type { Language } from '@/components/LanguageContext';
import type { CaseState, ReportDraft } from '@/types';

/**
 * Report drafting.
 *
 * Sends ONLY the structured, enum-only `answers` object to our own origin.
 * Never an image, never free text describing image content.
 *
 * The API key cannot live in this bundle — a browser-side call to Anthropic
 * would leak it and be blocked by CORS regardless. `/api/draft` is a
 * serverless proxy holding the key in an env var. When it is absent (which is
 * the default in this frontend-only build), we fall back to the local
 * template so the flow never dead-ends.
 */
export async function draftComplaint(caseState: CaseState, language: Language = 'en'): Promise<ReportDraft> {
  const fallback = (): ReportDraft => ({
    text: renderTemplate(caseState.answers, caseState, language),
    source: 'template',
    generatedAt: new Date().toISOString(),
    edited: false,
  });

  if (!navigator.onLine) return fallback();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    const res = await fetch('/api/draft', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        answers: caseState.answers,
        evidence: {
          screenshotCount: caseState.screenshotCount,
          fingerprints: caseState.fingerprints.map((f) => ({
            label: f.label,
            hash: f.hash,
            hashedAt: f.hashedAt,
          })),
        },
        caseId: caseState.caseId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) return fallback();

    const data = (await res.json()) as { text?: string };
    if (!data.text?.trim()) return fallback();

    return {
      text: data.text,
      source: 'ai',
      generatedAt: new Date().toISOString(),
      edited: false,
    };
  } catch {
    return fallback();
  }
}
