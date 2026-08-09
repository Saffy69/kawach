import { Link } from 'react-router-dom';
import { ArrowRight, FileText, FolderLock, MessageSquare } from 'lucide-react';
import { Button, Card, Pill, SectionLabel } from '@/components/ui/primitives';
import { Timeline, type TimelineStep } from '@/components/ui/feedback';
import { loadOrCreateCase } from '@/storage/localState';
import { useLanguage } from '@/components/LanguageContext';

const COPY = {
  en: {
    section: 'Your response', title: 'Where you are.', started: 'Started', nextStep: 'Next step', continue: 'Continue', status: 'Case status',
    labels: ['Incident described', 'Guidance received', 'Evidence preserved', 'Report prepared', 'Reviewed by you', 'Submitted or exported'],
    details: ['Your answers are saved on this device.', 'Not started yet.', 'You have your action steps.', 'Finish the guided flow.', 'Nothing saved yet.', 'A draft is ready to review.', 'Not generated yet.', 'You edited and confirmed it.', 'Read it before sending.', 'You choose where it goes. Kawach never sends it for you.'],
    next: ['Start the guided response', 'Preserve your evidence', 'Review your report'], now: 'Now', fingerprint: 'fingerprint(s)', screenshot: 'screenshot(s).',
  },
  ne: {
    section: 'तपाईंको प्रतिक्रिया', title: 'तपाईं कहाँ हुनुहुन्छ।', started: 'सुरु भएको', nextStep: 'अर्को चरण', continue: 'जारी राख्नुहोस्', status: 'केसको अवस्था',
    labels: ['घटना वर्णन गरियो', 'मार्गदर्शन प्राप्त भयो', 'प्रमाण सुरक्षित गरियो', 'प्रतिवेदन तयार गरियो', 'तपाईंले समीक्षा गर्नुभयो', 'पेश वा निर्यात गरियो'],
    details: ['तपाईंका जवाफ यस उपकरणमा सुरक्षित छन्।', 'अझै सुरु गरिएको छैन।', 'तपाईंका कार्य चरणहरू तयार छन्।', 'निर्देशित प्रक्रिया पूरा गर्नुहोस्।', 'अहिलेसम्म केही सुरक्षित गरिएको छैन।', 'मस्यौदा समीक्षाका लागि तयार छ।', 'अहिलेसम्म बनाइएको छैन।', 'तपाईंले सम्पादन गरेर पुष्टि गर्नुभयो।', 'पठाउनुअघि पढ्नुहोस्।', 'यो कहाँ जाने भन्ने तपाईंले छान्नुहुन्छ। Kawach ले तपाईंको तर्फबाट कहिल्यै पठाउँदैन।'],
    next: ['निर्देशित प्रतिक्रिया सुरु गर्नुहोस्', 'आफ्नो प्रमाण सुरक्षित गर्नुहोस्', 'आफ्नो प्रतिवेदन समीक्षा गर्नुहोस्'], now: 'अहिले', fingerprint: 'फिंगरप्रिन्ट', screenshot: 'स्क्रिनसट।',
  },
} as const;

export function DashboardPage() {
  const { language } = useLanguage();
  const copy = COPY[language];
  const c = loadOrCreateCase();

  const answered = Object.keys(c.answers).length > 0;
  const hasEvidence = c.fingerprints.length > 0 || c.screenshotCount > 0;
  const hasDraft = Boolean(c.draft);
  const reviewed = Boolean(c.draft?.edited);

  const steps: TimelineStep[] = [
    { label: copy.labels[0], detail: answered ? copy.details[0] : copy.details[1], state: answered ? 'done' : 'current' },
    { label: copy.labels[1], detail: c.completedGuidance ? copy.details[2] : copy.details[3], state: c.completedGuidance ? 'done' : answered ? 'current' : 'pending' },
    { label: copy.labels[2], detail: hasEvidence ? `${c.fingerprints.length} ${copy.fingerprint}, ${c.screenshotCount} ${copy.screenshot}` : copy.details[4], state: hasEvidence ? 'done' : c.completedGuidance ? 'current' : 'pending' },
    { label: copy.labels[3], detail: hasDraft ? copy.details[5] : copy.details[6], state: hasDraft ? 'done' : hasEvidence ? 'current' : 'pending' },
    { label: copy.labels[4], detail: reviewed ? copy.details[7] : copy.details[8], state: reviewed ? 'done' : hasDraft ? 'current' : 'pending' },
    { label: copy.labels[5], detail: copy.details[9], state: 'pending' },
  ];

  const next = !answered
    ? { label: copy.next[0], to: '/response', icon: MessageSquare }
    : !hasEvidence
      ? { label: copy.next[1], to: '/evidence', icon: FolderLock }
      : { label: copy.next[2], to: '/report', icon: FileText };

  const NextIcon = next.icon;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <SectionLabel>{copy.section}</SectionLabel>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{copy.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <Pill tone="brand">Case {c.caseId}</Pill>
          <Pill>{copy.started} {new Date(c.createdAt).toLocaleDateString('en-GB')}</Pill>
        </div>
      </header>

      <Card tone="brand" className="mb-8">
        <SectionLabel>{copy.nextStep}</SectionLabel>
        <h2 className="mt-2 text-xl font-bold">{next.label}</h2>
        <Link to={next.to} className="mt-4 inline-block">
          <Button icon={<NextIcon size={16} />} iconRight={<ArrowRight size={16} />}>
            {copy.continue}
          </Button>
        </Link>
      </Card>

      <Card>
        <h2 className="mb-5 text-base font-bold">{copy.status}</h2>
        <Timeline steps={steps} />
      </Card>

      <Card className="mt-6 border-line-strong">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="font-bold">Report management</h2><p className="mt-1 text-sm text-ink-2">Review and organize submitted cases.</p></div>
          <Link to="/admin"><Button variant="secondary" size="sm">Open</Button></Link>
        </div>
      </Card>
    </div>
  );
}
