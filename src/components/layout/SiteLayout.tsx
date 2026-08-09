import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { FileText, FolderLock, Home, MessageSquare, Phone, ShieldCheck, Trash2 } from 'lucide-react';
import { EmergencyButton, Wordmark } from '@/components/shared';
import { AmbientBackground } from '@/components/AmbientBackground';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/overlays';
import { wipeAll } from '@/storage/localState';

const NAV = [
  { to: '/', key: 'home' as const, icon: Home, end: true },
  { to: '/response', key: 'response' as const, icon: MessageSquare, end: false },
  { to: '/evidence', key: 'evidence' as const, icon: FolderLock, end: false },
  { to: '/report', key: 'report' as const, icon: FileText, end: false },
  { to: '/resources', key: 'resources' as const, icon: Phone, end: false },
];

/**
 * Erase everything.
 *
 * Shared and family devices are a live threat model here — the person being
 * blackmailed may not own the phone they are holding. One confirm, then all
 * local state is gone.
 */
function EraseControl({ compact }: { compact?: boolean }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function erase() {
    setBusy(true);
    await wipeAll();
    window.location.replace('/');
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-md text-ink-3 transition-colors hover:text-danger-bright ${
          compact ? 'px-2 py-1 text-[12px]' : 'min-h-[40px] px-3 text-[13px] font-medium'
        }`}
      >
        <Trash2 size={14} />
        {t.erase}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t.eraseTitle}>
        <p className="mb-5 text-sm leading-relaxed text-ink-2">
          {t.eraseDescription}
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row-reverse">
          <Button variant="emergency" fullWidth loading={busy} onClick={erase}>
            {t.eraseEverything}
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setOpen(false)}>
            {t.cancel}
          </Button>
        </div>
      </Modal>
    </>
  );
}

function LanguageToggle() {
  const { t, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={t.languageLabel}
      title={t.languageLabel}
      className="min-h-10 rounded-md border border-line bg-surface px-2.5 text-[12px] font-bold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {t.language}
    </button>
  );
}

export function SiteLayout() {
  const { language, t } = useLanguage();
  const { pathname } = useLocation();
  const onLanding = pathname === '/';

  return (
    <div className="flex min-h-dvh flex-col">
      <AmbientBackground />

      {/* ---------- Desktop header ---------- */}
      <header className="k-no-print k-safe-top sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[62px] max-w-[1120px] items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6">
          <Link to="/" aria-label={language === 'ne' ? 'Kawach गृहपृष्ठ' : 'Kawach home'}>
            <Wordmark />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label={language === 'ne' ? 'मुख्य' : 'Main'}>
            {NAV.slice(1).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg border border-line-strong px-4 py-2 text-[14px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-danger/80 text-white shadow-low'
                      : 'bg-surface/70 text-ink-2 hover:border-brand-bright hover:text-ink'
                  }`
                }
              >
                {t.nav[item.key]}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/privacy"
              className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-[13.5px] font-semibold text-ink-2 transition-colors hover:text-ink lg:inline-flex"
            >
              <ShieldCheck size={15} />
              {t.nav.privacy}
            </Link>
            <LanguageToggle />
            <ThemeToggle />
            <EraseControl />
          </div>
        </div>
      </header>

      <main className={`flex-1 ${onLanding ? '' : 'pb-28 md:pb-12'}`}>
        <Outlet />
      </main>

      {/* ---------- Mobile bottom navigation ---------- */}
      <nav
        className="k-no-print k-safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 backdrop-blur-md md:hidden"
        aria-label={language === 'ne' ? 'मुख्य' : 'Main'}
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[10.5px] font-semibold transition-colors ${
                    isActive ? 'text-brand-bright' : 'text-ink-3'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                    {t.nav[item.key]}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <EmergencyButton />
    </div>
  );
}
