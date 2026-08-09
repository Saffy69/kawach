import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

/* ==========================================================================
   Button
   Variants carry meaning, not decoration:
   primary   — the one action we want taken on this screen
   secondary — a real alternative
   ghost     — navigation / dismissal
   emergency — call for help now; the only variant that uses danger red
   safe      — the privacy-preserving action (hash on device)
   ========================================================================== */

type Variant = 'primary' | 'secondary' | 'ghost' | 'emergency' | 'safe';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-deep shadow-low',
  secondary:
    'bg-surface text-ink hover:bg-surface-2 border border-line-strong shadow-low',
  ghost: 'bg-transparent text-ink-2 hover:text-ink hover:bg-surface-2 border border-transparent',
  emergency: 'bg-danger text-white hover:bg-danger-deep shadow-low',
  safe: 'bg-safe text-white hover:bg-safe-deep shadow-low',
};

const SIZES: Record<Size, string> = {
  // min-h keeps every target at or above 44px — one-handed use, panic state.
  sm: 'min-h-[44px] px-4 text-sm gap-2',
  md: 'min-h-[52px] px-5 text-[15px] gap-2.5',
  lg: 'h-[60px] min-h-[60px] min-w-[220px] px-7 text-base gap-3 whitespace-nowrap',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth,
    icon,
    iconRight,
    loading,
    className = '',
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center rounded-md font-semibold',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? 'w-full min-w-0' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
        />
      ) : (
        icon
      )}
      <span>{children}</span>
      {iconRight}
    </button>
  );
});

/* ==========================================================================
   Card
   ========================================================================== */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'default' | 'raised' | 'brand' | 'safe' | 'caution' | 'danger';
  padded?: boolean;
}

const CARD_TONES: Record<NonNullable<CardProps['tone']>, string> = {
  default: 'bg-surface border-line',
  raised: 'bg-surface border-line-strong shadow-mid',
  brand: 'bg-brand/[0.06] border-brand/30',
  safe: 'bg-safe/[0.07] border-safe/30',
  caution: 'bg-caution/[0.08] border-caution/35',
  danger: 'bg-danger/[0.06] border-danger/30',
};

export function Card({
  tone = 'default',
  padded = true,
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        'rounded-lg border',
        CARD_TONES[tone],
        padded ? 'p-5 sm:p-6' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ==========================================================================
   SectionLabel — small uppercase eyebrow
   ========================================================================== */

export function SectionLabel({
  children,
  className = '',
  labeled = false,
}: {
  children: ReactNode;
  className?: string;
  labeled?: boolean;
}) {
  if (!labeled) return null;
  return <p className={`k-label ${className}`}>{children}</p>;
}

/* ==========================================================================
   Pill
   ========================================================================== */

export function Pill({
  children,
  tone = 'neutral',
  icon,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'safe' | 'caution' | 'brand';
  icon?: ReactNode;
}) {
  const tones = {
    neutral: 'bg-surface-2 text-ink-2 border-line',
    safe: 'bg-safe/10 text-safe-bright border-safe/30',
    caution: 'bg-caution/10 text-caution-bright border-caution/35',
    brand: 'bg-brand/10 text-brand-bright border-brand/30',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
