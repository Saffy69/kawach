import type { ReactNode } from 'react';
import { AlertTriangle, Check, Info, ShieldCheck, X } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

/* ==========================================================================
   TrustIndicator
   Colour is never the only signal — every tone pairs with an icon and a word.
   ========================================================================== */

export type Tone = 'safe' | 'caution' | 'danger' | 'brand';

const TONE_STYLES: Record<Tone, { text: string; bg: string; ring: string }> = {
  safe: { text: 'text-safe-bright', bg: 'bg-safe/10', ring: 'ring-safe/30' },
  caution: {
    text: 'text-caution-bright',
    bg: 'bg-caution/10',
    ring: 'ring-caution/35',
  },
  danger: { text: 'text-danger-bright', bg: 'bg-danger/10', ring: 'ring-danger/30' },
  brand: { text: 'text-brand-bright', bg: 'bg-brand/10', ring: 'ring-brand/30' },
};

const TONE_ICONS: Record<Tone, ReactNode> = {
  safe: <Check size={15} strokeWidth={3} />,
  caution: <AlertTriangle size={15} strokeWidth={2.5} />,
  danger: <X size={15} strokeWidth={3} />,
  brand: <ShieldCheck size={15} strokeWidth={2.5} />,
};

export function TrustIndicator({
  label,
  value,
  tone = 'safe',
}: {
  label: string;
  value: string;
  tone?: Tone;
}) {
  const s = TONE_STYLES[tone];
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 ${s.bg} ${s.ring} ${s.text}`}
        aria-hidden="true"
      >
        {TONE_ICONS[tone]}
      </span>
      <div className="min-w-0">
        <p className="k-label mb-0.5">{label}</p>
        <p className={`text-sm font-semibold ${s.text}`}>{value}</p>
      </div>
    </div>
  );
}

/* ==========================================================================
   WarningBanner
   ========================================================================== */

const TONE_BORDERS: Record<Tone, string> = {
  safe: 'border-safe/30',
  caution: 'border-caution/35',
  danger: 'border-danger/30',
  brand: 'border-brand/30',
};

export function WarningBanner({
  tone = 'caution',
  title,
  children,
}: {
  tone?: Tone;
  title: string;
  children?: ReactNode;
}) {
  const s = TONE_STYLES[tone];
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-md border px-4 py-3.5 ${s.bg} ${TONE_BORDERS[tone]}`}
    >
      <span className={`mt-0.5 shrink-0 ${s.text}`} aria-hidden="true">
        {TONE_ICONS[tone]}
      </span>
      <div className="min-w-0 text-sm">
        <p className={`font-semibold ${s.text}`}>{title}</p>
        {children && <div className="mt-1 text-ink-2">{children}</div>}
      </div>
    </div>
  );
}

/* ==========================================================================
   ProgressIndicator
   "Step 3 of 7" — the point is to communicate that this ends.
   ========================================================================== */

export function ProgressIndicator({ step, total }: { step: number; total: number }) {
  const { language } = useLanguage();
  const safeTotal = Math.max(total, step);
  const label = language === 'ne' ? `चरण ${step} / ${safeTotal}` : `Step ${step} of ${safeTotal}`;
  return (
    <div className="flex items-center gap-3">
      <span className="k-label whitespace-nowrap">{label}</span>
      <div
        className="flex h-1.5 flex-1 gap-1"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={safeTotal}
        aria-label={label}
      >
        {Array.from({ length: safeTotal }).map((_, i) => (
          <span
            key={i}
            className={`h-full flex-1 rounded-full transition-colors duration-300 ${
              i < step ? 'bg-brand' : 'bg-surface-3'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   Timeline — case status
   ========================================================================== */

export interface TimelineStep {
  label: string;
  detail?: string;
  state: 'done' | 'current' | 'pending';
}

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  const { language } = useLanguage();
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li
            key={s.label}
            className="relative flex gap-4 pb-6 last:pb-0"
            aria-current={s.state === 'current' ? 'step' : undefined}
          >
            {!last && (
              <span
                className={`absolute left-[13px] top-7 h-[calc(100%-16px)] w-px ${
                  s.state === 'done' ? 'bg-safe/40' : 'bg-line'
                }`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                s.state === 'done'
                  ? 'border-safe/40 bg-safe/10 text-safe-bright'
                  : s.state === 'current'
                    ? 'border-brand/50 bg-brand/10 text-brand-bright'
                    : 'border-line bg-surface-2 text-ink-3'
              }`}
            >
              {s.state === 'done' ? <Check size={14} strokeWidth={3} /> : i + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p
                className={`text-sm font-semibold ${
                  s.state === 'pending' ? 'text-ink-3' : 'text-ink'
                }`}
              >
                {s.label}
                {s.state === 'current' && (
                  <span className="ml-2 text-[11px] font-bold uppercase tracking-wider text-brand-bright">
                    {language === 'ne' ? 'अहिले' : 'Now'}
                  </span>
                )}
              </p>
              {s.detail && <p className="mt-0.5 text-[13px] text-ink-2">{s.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ==========================================================================
   EmptyState
   ========================================================================== */

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-line-strong px-6 py-10 text-center">
      {icon && <div className="mb-3 flex justify-center text-ink-3">{icon}</div>}
      <p className="text-sm font-semibold text-ink-2">{title}</p>
      {children && <div className="mt-1.5 text-[13px] text-ink-3">{children}</div>}
    </div>
  );
}

/* ==========================================================================
   InfoNote — quiet clarification, used heavily in the privacy copy
   ========================================================================== */

export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-3">
      <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
