import { useState } from 'react';
import { ExternalLink, LifeBuoy, Phone, ShieldAlert } from 'lucide-react';
import { Drawer } from '@/components/ui/overlays';
import { Button, Pill } from '@/components/ui/primitives';
import { useLanguage } from '@/components/LanguageContext';
import { resourceGroupLabels, resources } from '@/data/resources';
import type { Resource } from '@/types';

const sharedCopy = {
  en: {
    verified: 'Verified',
    unconfirmed: 'Unconfirmed',
    unconfirmedWarning: 'We have not confirmed this contact. Please verify before relying on it.',
    call: 'Call',
    drawerTitle: 'Get help now',
    emergencyIntroduction: 'If you are in immediate physical danger, call 100 first. These lines are free and you do not need this app to use them.',
    emergencyButton: 'Get Help Now',
    crisisTitle: 'If this feels unbearable',
    crisisDescription: 'Many people in this situation feel trapped or ashamed. It passes, and this is survivable. If you are having thoughts of harming yourself, please talk to someone now.',
    groups: resourceGroupLabels,
  },
  ne: {
    verified: 'प्रमाणित',
    unconfirmed: 'अपुष्ट',
    unconfirmedWarning: 'हामीले यो सम्पर्क पुष्टि गरेका छैनौँ। यसमा भर पर्नुअघि कृपया प्रमाणीकरण गर्नुहोस्।',
    call: 'फोन गर्नुहोस्',
    drawerTitle: 'अहिले मद्दत लिनुहोस्',
    emergencyIntroduction: 'तपाईं तत्काल शारीरिक खतरामा हुनुहुन्छ भने पहिले 100 मा फोन गर्नुहोस्। यी सेवाहरू निःशुल्क छन् र प्रयोग गर्न यो एप आवश्यक पर्दैन।',
    emergencyButton: 'अहिले मद्दत लिनुहोस्',
    crisisTitle: 'यदि यो सहनै नसकिने जस्तो लाग्छ भने',
    crisisDescription: 'यस अवस्थामा धेरै मानिसलाई आफू फसेको वा लज्जित भएको महसुस हुन्छ। यो भावना बित्छ र यसबाट सुरक्षित रूपमा बाहिर निस्कन सकिन्छ। आफूलाई हानि पुर्‍याउने सोच आइरहेको छ भने कृपया अहिले नै कसैसँग कुरा गर्नुहोस्।',
    groups: {
      emergency: 'आपत्कालीन सेवा',
      crisis: 'संकट तथा परामर्श',
      reporting: 'अपराधको उजुरी',
      takedown: 'तस्बिर हटाउने सेवा',
    },
  },
} as const;

const nepaliResourceCopy: Record<string, { description: string; availability?: string }> = {
  police: { description: 'तत्काल शारीरिक खतराका लागि आपत्कालीन सहायता।', availability: '२४ सै घण्टा' },
  'cyber-tollfree': { description: 'नेपाल प्रहरी साइबर ब्युरो। अनलाइन ब्ल्याकमेल र तस्बिर दुरुपयोगको उजुरी गर्नुहोस्।', availability: 'कार्यालय समय' },
  'cyber-hotline': { description: 'साइबर ब्युरोको ड्युटी डेस्कमा सिधा सम्पर्क।', availability: 'कार्यालय समय' },
  'mental-health': { description: 'निराश महसुस भइरहेमा वा आफूलाई हानि पुर्‍याउने सोच आइरहेमा निःशुल्क परामर्श।', availability: 'हालको सेवा समय जाँच्नुहोस्' },
  'tpo-nepal': { description: 'मनोसामाजिक परामर्श तथा मानसिक स्वास्थ्य सहायता सेवाहरू।' },
  'women-commission': { description: 'लैङ्गिक हिंसासम्बन्धी सहायता तथा उजुरी व्यवस्थापन।', availability: '२४ सै घण्टा' },
  'child-helpline': { description: '१८ वर्षमुनिका जोसुकैका लागि निःशुल्क र गोप्य सहायता।', availability: '२४ सै घण्टा' },
  'cyber-portal': { description: 'नेपाल प्रहरी साइबर ब्युरोमा साइबर अपराधको अनलाइन उजुरी दर्ता गर्नुहोस्।' },
  'cyber-email': { description: 'आफ्नो उजुरी पठाउनुहोस् र कुराकानीका स्क्रिनसट संलग्न गर्नुहोस्।' },
  'cyber-office': { description: 'भोटाहिटी, काठमाडौं। प्रिन्ट गरिएको प्रमाण लिएर कार्यालय जानुहोस्।', availability: 'कार्यालय समय' },
  stopncii: { description: 'वयस्कका लागि। तपाईंको उपकरणमै पर्सेप्चुअल ह्यास बनाएर साझेदार प्लेटफर्मसँग साझा गर्छ, जसले मिल्दोजुल्दो तस्बिर अपलोड हुनबाट रोक्न सक्छ। निःशुल्क।' },
  takeitdown: { description: 'तस्बिर खिचिँदा १८ वर्षमुनि रहेका जोसुकैका लागि। उपकरणमै ह्यास बनाउने उही विधि। निःशुल्क।' },
};

function localizedResource(resource: Resource, language: 'en' | 'ne') {
  return language === 'ne' ? nepaliResourceCopy[resource.id] : undefined;
}

/* ==========================================================================
   Logo — a shield drawn as a single outline with a check. Monochrome on
   purpose: it inherits the current text colour, so it works in both themes
   and at 16px in a browser tab without special-casing.
   ========================================================================== */

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-brand-bright"
    >
      <path
        d="M16 2.75 5 7.1v8.9c0 6.4 4.4 11.55 11 13.25 6.6-1.7 11-6.85 11-13.25V7.1L16 2.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M11.2 15.9l3.3 3.3 6.3-6.7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ size = 26 }: { size?: number }) {
  const { language } = useLanguage();
  return (
    <span className="inline-flex items-center gap-2.5">
      <Logo size={size} />
      <span className="font-display text-[19px] font-bold tracking-tight text-ink">
        {language === 'ne' ? 'कवच' : 'Kawach'}
      </span>
    </span>
  );
}

/* ==========================================================================
   ResourceCard
   `verifiedOn: null` is surfaced, not hidden. Presenting an unconfirmed
   hotline as verified would be worse than showing the gap.
   ========================================================================== */

export function ResourceCard({ resource }: { resource: Resource }) {
  const { language } = useLanguage();
  const copy = sharedCopy[language];
  const localized = localizedResource(resource, language);
  const { kind, value, display, name, verifiedOn } = resource;
  const description = localized?.description ?? resource.description;
  const availability = localized?.availability ?? resource.availability;

  const href =
    kind === 'phone' ? `tel:${value}` : kind === 'email' ? `mailto:${value}` : value;
  const external = kind === 'url';

  return (
    <div className="flex flex-col justify-between gap-4 rounded-lg border border-line bg-surface p-5 shadow-low">
      <div>
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <h3 className="font-sans text-[15px] font-bold text-ink">{name}</h3>
          {verifiedOn ? (
            <Pill tone="safe">{copy.verified}</Pill>
          ) : (
            <Pill tone="caution">{copy.unconfirmed}</Pill>
          )}
        </div>
        <p className="text-[13.5px] leading-relaxed text-ink-2">{description}</p>
        {availability && (
          <p className="mt-2 text-[12.5px] font-medium text-ink-3">{availability}</p>
        )}
        {!verifiedOn && (
          <p className="mt-2 text-[12.5px] font-medium text-caution-bright">
            {copy.unconfirmedWarning}
          </p>
        )}
      </div>

      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md border border-line-strong bg-surface-2 px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-3"
      >
        {kind === 'phone' ? <Phone size={16} /> : <ExternalLink size={16} />}
        {kind === 'phone' ? `${copy.call} ${display ?? value}` : display ?? value}
      </a>
    </div>
  );
}

/* ==========================================================================
   Emergency access — reachable in one tap from every screen
   ========================================================================== */

function DrawerResourceRow({ resource }: { resource: Resource }) {
  const { language } = useLanguage();
  const localized = localizedResource(resource, language);
  const href =
    resource.kind === 'phone'
      ? `tel:${resource.value}`
      : resource.kind === 'email'
        ? `mailto:${resource.value}`
        : resource.value;
  const external = resource.kind === 'url';

  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex min-h-[60px] items-center justify-between gap-3 rounded-md border border-line bg-surface-2 px-4 py-3 transition-colors hover:bg-surface-3"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink">{resource.name}</span>
        <span className="block truncate text-[12.5px] text-ink-3">
          {localized?.availability ?? localized?.description ?? resource.availability ?? resource.description}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand-bright">
        {resource.kind === 'phone' ? (
          <>
            <Phone size={15} />
            {resource.display ?? resource.value}
          </>
        ) : (
          <ExternalLink size={15} />
        )}
      </span>
    </a>
  );
}

export function EmergencyHelpDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const copy = sharedCopy[language];
  const groups: Resource['group'][] = ['emergency', 'crisis', 'reporting'];

  return (
    <Drawer open={open} onClose={onClose} title={copy.drawerTitle}>
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-ink-2">
          {copy.emergencyIntroduction}
        </p>

        {groups.map((group) => (
          <section key={group}>
            <div className="space-y-2">
              {resources
                .filter((r) => r.group === group)
                .map((r) => (
                  <DrawerResourceRow key={r.id} resource={r} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </Drawer>
  );
}

/**
 * Floating, always-visible. Danger red is reserved for exactly this.
 * Deliberately static — no pulse animation. The situation already supplies
 * the urgency; the button just has to be findable.
 */
export function EmergencyButton() {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <>
      <div className="k-no-print fixed bottom-[84px] right-4 z-40 sm:bottom-6 sm:right-6">
        <Button
          variant="emergency"
          size="md"
          onClick={() => setOpen(true)}
          icon={<ShieldAlert size={18} />}
          className="rounded-full shadow-high"
        >
          {sharedCopy[language].emergencyButton}
        </Button>
      </div>
      <EmergencyHelpDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/* ==========================================================================
   CrisisCard — surfaced automatically on the branches where distress is most
   likely (published images, minor involved, already paid).
   ========================================================================== */

export function CrisisCard() {
  const { language } = useLanguage();
  const copy = sharedCopy[language];
  const crisis = resources.filter((r) => r.group === 'crisis');

  return (
    <div className="rounded-lg border border-safe/30 bg-safe/[0.07] p-5">
      <div className="mb-2 flex items-center gap-2.5">
        <LifeBuoy size={18} className="text-safe-bright" aria-hidden="true" />
        <h3 className="font-sans text-sm font-bold text-safe-bright">
          {copy.crisisTitle}
        </h3>
      </div>
      <p className="mb-4 text-[13.5px] leading-relaxed text-ink-2">
        {copy.crisisDescription}
      </p>
      <div className="space-y-2">
        {crisis.map((r) => (
          <DrawerResourceRow key={r.id} resource={r} />
        ))}
      </div>
    </div>
  );
}
