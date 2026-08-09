import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { ResourceCard } from '@/components/shared';
import { useLanguage } from '@/components/LanguageContext';
import { Button, Card, SectionLabel } from '@/components/ui/primitives';
import { InfoNote } from '@/components/ui/feedback';
import { platformReportUrls, resourceGroupLabels, resources } from '@/data/resources';
import { loadOrCreateCase } from '@/storage/localState';
import type { Resource } from '@/types';

const GROUP_ORDER: Resource['group'][] = ['emergency', 'crisis', 'reporting', 'takedown'];

const pageCopy = {
  en: {
    sectionLabel: 'Official help',
    title: 'Get official help.',
    introduction: 'These services are free and they exist for exactly this. You do not need Kawach, a report, or a payment to use any of them.',
    minorTitle: 'Start with these two',
    minorDescription: 'Because someone under 18 is involved, NCMEC Take It Down and Child Helpline 1098 will move fastest.',
    call1098: 'Call 1098',
    platformTitle: (platform: string) => `Report the account on ${platform}`,
    platformDescription: 'Platforms remove non-consensual intimate imagery faster when it is reported through their dedicated form. Screenshot the conversation before you report, because reporting can hide the thread.',
    openReportForm: (platform: string) => `Open ${platform} report form`,
    groups: resourceGroupLabels,
    takedownTitle: 'About the takedown services',
    takedownDescription: 'StopNCII and Take It Down hash your image on your own device and share only that hash with partner platforms, which then block matching uploads. They use perceptual hashing, which still matches after an image is re-encoded or cropped.',
    fingerprintNote: 'Kawach does not submit on your behalf, and the SHA-256 fingerprint we create is a different thing for a different purpose — it is tamper-evidence for your complaint, not a takedown request. Use the links above to file with them directly.',
    back: 'Back to your report',
    otherPlatform: 'the platform',
  },
  ne: {
    sectionLabel: 'आधिकारिक सहायता',
    title: 'आधिकारिक सहायता लिनुहोस्।',
    introduction: 'यी सेवाहरू निःशुल्क छन् र यस्तै अवस्थाका लागि उपलब्ध छन्। यीमध्ये कुनै सेवा प्रयोग गर्न तपाईंलाई Kawach, प्रतिवेदन वा भुक्तानी आवश्यक पर्दैन।',
    minorTitle: 'यी दुईबाट सुरु गर्नुहोस्',
    minorDescription: '१८ वर्षमुनिको व्यक्ति संलग्न भएकाले NCMEC Take It Down र Child Helpline 1098 ले सबैभन्दा छिटो सहायता गर्न सक्छन्।',
    call1098: '1098 मा फोन गर्नुहोस्',
    platformTitle: (platform: string) => `${platform} मा उक्त खाताको उजुरी गर्नुहोस्`,
    platformDescription: 'प्लेटफर्मको समर्पित फाराममार्फत उजुरी गर्दा सहमतिबिनाका अन्तरङ्ग तस्बिरहरू छिटो हट्न सक्छन्। उजुरी गरेपछि कुराकानी लुक्न सक्ने भएकाले उजुरी गर्नुअघि कुराकानीको स्क्रिनसट लिनुहोस्।',
    openReportForm: (platform: string) => `${platform} को उजुरी फाराम खोल्नुहोस्`,
    groups: {
      emergency: 'आपत्कालीन सेवा',
      crisis: 'संकट तथा परामर्श',
      reporting: 'अपराधको उजुरी',
      takedown: 'तस्बिर हटाउने सेवा',
    },
    takedownTitle: 'तस्बिर हटाउने सेवाहरूबारे',
    takedownDescription: 'StopNCII र Take It Down ले तपाईंको आफ्नै उपकरणमा तस्बिरको ह्यास बनाउँछन् र साझेदार प्लेटफर्मसँग त्यो ह्यास मात्र साझा गर्छन्। त्यसपछि ती प्लेटफर्मले मिल्दोजुल्दो अपलोड रोक्छन्। तिनीहरूले पर्सेप्चुअल ह्यासिङ प्रयोग गर्ने भएकाले तस्बिर पुनः इन्कोड वा क्रप गरेपछि पनि मिलान हुन सक्छ।',
    fingerprintNote: 'Kawach ले तपाईंको तर्फबाट निवेदन पठाउँदैन। हामीले बनाउने SHA-256 फिंगरप्रिन्ट फरक उद्देश्यका लागि हो—यो तपाईंको उजुरीको प्रमाणमा छेडछाड भएको छैन भन्ने देखाउन हो, तस्बिर हटाउने अनुरोध होइन। माथिका लिङ्क प्रयोग गरी सम्बन्धित सेवामा सिधै निवेदन दिनुहोस्।',
    back: 'आफ्नो प्रतिवेदनमा फर्कनुहोस्',
    otherPlatform: 'प्लेटफर्म',
  },
} as const;

export function ResourcesPage() {
  const { language } = useLanguage();
  const copy = pageCopy[language];
  const caseState = loadOrCreateCase();
  const platform = caseState.answers.platform;
  const platformLink = platform ? platformReportUrls[platform] : null;
  const minorInvolved = caseState.answers.minorInvolved === 'yes';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <SectionLabel>{copy.sectionLabel}</SectionLabel>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2">
          {copy.introduction}
        </p>
      </header>

      {minorInvolved && (
        <Card tone="caution" className="mb-8">
          <h2 className="mb-2 text-base font-bold text-caution">{copy.minorTitle}</h2>
          <p className="mb-4 text-[14.5px] leading-relaxed text-ink-2">
            {copy.minorDescription}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <a href="https://takeitdown.ncmec.org" target="_blank" rel="noopener noreferrer">
              <Button fullWidth iconRight={<ExternalLink size={15} />}>
                Take It Down
              </Button>
            </a>
            <a href="tel:1098">
              <Button variant="secondary" fullWidth>
                {copy.call1098}
              </Button>
            </a>
          </div>
        </Card>
      )}

      {platformLink && (
        <Card tone="brand" className="mb-8">
          <h2 className="mb-1.5 text-base font-bold">
            {copy.platformTitle(platform === 'other' ? copy.otherPlatform : platformLink.label)}
          </h2>
          <p className="mb-4 text-[14.5px] leading-relaxed text-ink-2">
            {copy.platformDescription}
          </p>
          <a href={platformLink.url} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" iconRight={<ExternalLink size={15} />}>
              {copy.openReportForm(platform === 'other' ? copy.otherPlatform : platformLink.label)}
            </Button>
          </a>
        </Card>
      )}

      <div className="space-y-10">
        {GROUP_ORDER.map((group) => {
          const items = resources.filter((r) => r.group === group);
          if (!items.length) return null;
          return (
            <section key={group}>
              <h2 className="mb-4 text-lg font-bold">{copy.groups[group]}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <Card className="mt-10">
        <div className="mb-3 flex items-center gap-2.5">
          <ShieldCheck size={17} className="text-brand-bright" aria-hidden="true" />
          <h2 className="text-base font-bold">{copy.takedownTitle}</h2>
        </div>
        <p className="mb-4 text-[14.5px] leading-relaxed text-ink-2">
          {copy.takedownDescription}
        </p>
        <InfoNote>{copy.fingerprintNote}</InfoNote>
      </Card>

      <div className="mt-8">
        <Link to="/report">
          <Button variant="secondary" iconRight={<ArrowRight size={16} />}>
            {copy.back}
          </Button>
        </Link>
      </div>
    </div>
  );
}
