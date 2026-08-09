import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';
import { Logo } from '@/components/shared';
import { useLanguage } from '@/components/LanguageContext';
import type { ChecklistItem, TreeOption } from '@/types';

/* ==========================================================================
   ChatBubble
   Deliberately NOT a chat app. No typing indicator, no personality, no
   avatars beyond the mark. The bubble is a container for one instruction.
   ========================================================================== */

export function ChatBubble({
  children,
  sub,
  delay = 0,
}: {
  children: ReactNode;
  sub?: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-3"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface">
        <Logo size={17} />
      </span>
      <div className="min-w-0 flex-1 rounded-lg rounded-tl-sm border border-line bg-surface px-4 py-3.5 shadow-low sm:px-5 sm:py-4">
        <p className="text-[16px] font-semibold leading-snug text-ink sm:text-[17px]">
          {children}
        </p>
        {sub && <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{sub}</p>}
      </div>
    </motion.div>
  );
}

/** The user's own selection, echoed back so the transcript reads as a record. */
export function UserEcho({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-end"
    >
      <p className="max-w-[85%] rounded-lg rounded-br-sm border border-brand/30 bg-brand/10 px-4 py-2.5 text-[14.5px] font-semibold text-ink">
        {children}
      </p>
    </motion.div>
  );
}

/* ==========================================================================
   QuickReplyButtons
   Large targets, 3–6 words. The label is the entire decision.
   ========================================================================== */

export function QuickReplyButtons({
  options,
  onPick,
  disabled,
}: {
  options: TreeOption[];
  onPick: (option: TreeOption) => void;
  disabled?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="grid gap-2.5 pl-0 sm:pl-11"
    >
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          disabled={disabled}
          onClick={() => onPick(option)}
          className={`group flex min-h-[56px] min-w-0 items-center justify-between gap-3 rounded-md border px-4 py-3 text-left text-[15px] font-semibold transition-colors disabled:opacity-40 ${
            option.tone === 'caution'
              ? 'border-caution/35 bg-caution/[0.08] text-ink hover:bg-caution/[0.14]'
              : 'border-line-strong bg-surface text-ink shadow-low hover:border-brand/50 hover:bg-brand/[0.06]'
          }`}
        >
          <span className="min-w-0 flex-1 break-words">{option.label}</span>
          <ArrowRight
            size={17}
            className="shrink-0 text-ink-3 transition-colors group-hover:text-brand-bright"
            aria-hidden="true"
          />
        </button>
      ))}
    </motion.div>
  );
}

/* ==========================================================================
   ActionChecklist — the "DO THIS NOW" card
   Do and Don't are distinguished by icon and label, never by colour alone.
   ========================================================================== */

export function ActionChecklist({ items }: { items: ChecklistItem[] }) {
  const { language } = useLanguage();
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <motion.li
          key={item.text}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
          className="flex gap-3 rounded-md border border-line bg-surface px-4 py-3.5 shadow-low"
        >
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              item.kind === 'do'
                ? 'bg-safe/12 text-safe-bright'
                : 'bg-danger/12 text-danger-bright'
            }`}
            aria-hidden="true"
          >
            {item.kind === 'do' ? (
              <Check size={13} strokeWidth={3} />
            ) : (
              <X size={13} strokeWidth={3} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold leading-snug text-ink break-words">
              <span className="sr-only">
                {item.kind === 'do'
                  ? language === 'ne' ? 'गर्नुहोस्: ' : 'Do: '
                  : language === 'ne' ? 'नगर्नुहोस्: ' : 'Do not: '}
              </span>
              {item.text}
            </p>
            {item.detail && (
              <p className="mt-1 break-words text-[13.5px] leading-relaxed text-ink-2">{item.detail}</p>
            )}
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
