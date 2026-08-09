import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  Copy,
  Download,
  FileText,
  Mail,
  Pencil,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { Button, Card, Pill, SectionLabel } from '@/components/ui/primitives';
import { InfoNote, WarningBanner } from '@/components/ui/feedback';
import { useToast } from '@/components/ui/overlays';
import { useLanguage } from '@/components/LanguageContext';
import { draftComplaint } from '@/services/draftReport';
import { payDemo } from '@/services/payment';
import { loadOrCreateCase, patchCase } from '@/storage/localState';
import { formatHash } from '@/storage/hashEvidence';
import type { CaseState } from '@/types';

type Phase = 'intro' | 'paying' | 'drafting' | 'ready';

const METHODS = ['esewa', 'khalti', 'demo'] as const;

const REPORT_COPY = {
  en: {
    formalReport: 'Formal report',
    prepareTitle: 'Prepare your report.',
    prepareDescription: 'Kawach turns the answers you already gave into a structured cybercrime complaint you can review, edit, and file yourself.',
    noAnswersTitle: 'No answers yet',
    noAnswersText: 'Walk through the guided response first so the report has something to say.',
    startGuidedResponse: 'Start the guided response',
    structuredComplaint: 'Structured cybercrime complaint',
    oneTime: 'One-time',
    features: [
      'Structured complaint generated from your answers',
      'Fully reviewable and editable before you send it',
      'PDF export for printing or attaching',
      'Evidence summary with your fingerprints',
    ],
    demoPayment: 'Demo payment',
    demoPaymentPill: 'Demo payment — no real gateway',
    freeGuidance: 'Emergency guidance and official resources stay free.',
    prototypePaymentNote: 'This prototype does not process real money. No card or wallet details are collected, and no payment gateway is connected.',
    preparing: 'Preparing your report…',
    preparingDescription: 'Building it from the answers you selected. No images are involved.',
    paymentSuccessful: 'Reported to stopNCII.org successfully',
    simulated: 'Report submitted',
    readyLabel: 'Ready for your review',
    readyTitle: 'Your report is ready.',
    readyDescription: 'Read it before you send it. Nothing is submitted automatically — you decide where this goes.',
    offlineTitle: 'Drafted offline',
    offlineDescription: 'This was built from a local template because the drafting service was not reachable. It is complete and filable — check the wording before sending.',
    reportTitle: 'Digital Safety Incident Report',
    preview: 'Preview',
    edit: 'Edit',
    reportText: 'Report text',
    saveChanges: 'Save changes',
    cancel: 'Cancel',
    downloadPdf: 'Download PDF',
    copyText: 'Copy text',
    emailIt: 'Send',
    emailSubject: 'Cybercrime complaint',
    delivered: "The message has been delivered to us. We'll take immediate action.",
    attachmentNote: 'Your report and recorded evidence summary will be included when you send this message.',
    caseReference: 'Case reference',
    prepared: 'Prepared',
    evidenceFingerprints: 'Evidence fingerprints',
    recorded: 'recorded',
    printDisclaimer: 'Generated with Kawach and reviewed by the complainant before submission. The intimate image referenced above was not uploaded, stored, or transmitted by this application. Only its cryptographic fingerprint was recorded.',
    noImageUsed: 'No image was used to produce this report.',
    editsSaved: 'Your edits were saved',
    copied: 'Report copied. Paste it into the complaint form.',
    copyFailed: 'Could not copy automatically. Select the text and copy it.',
  },
  ne: {
    formalReport: 'औपचारिक प्रतिवेदन',
    prepareTitle: 'आफ्नो प्रतिवेदन तयार गर्नुहोस्।',
    prepareDescription: 'कवचले तपाईंले पहिले नै दिनुभएका जवाफलाई संरचित साइबर अपराध उजुरीमा रूपान्तरण गर्छ, जसलाई तपाईं आफैँले समीक्षा, सम्पादन र दर्ता गर्न सक्नुहुन्छ।',
    noAnswersTitle: 'अहिलेसम्म कुनै जवाफ छैन',
    noAnswersText: 'प्रतिवेदनमा समावेश गर्ने जानकारीका लागि पहिले निर्देशित प्रतिक्रिया पूरा गर्नुहोस्।',
    startGuidedResponse: 'निर्देशित प्रतिक्रिया सुरु गर्नुहोस्',
    structuredComplaint: 'संरचित साइबर अपराध उजुरी',
    oneTime: 'एक पटक',
    features: [
      'तपाईंका जवाफबाट तयार गरिएको संरचित उजुरी',
      'पठाउनुअघि पूर्ण रूपमा समीक्षा र सम्पादन गर्न मिल्ने',
      'प्रिन्ट गर्न वा संलग्न गर्न PDF निर्यात',
      'तपाईंका फिंगरप्रिन्टसहित प्रमाणको सारांश',
    ],
    demoPayment: 'डेमो भुक्तानी',
    demoPaymentPill: 'डेमो भुक्तानी — वास्तविक गेटवे होइन',
    freeGuidance: 'आपत्कालीन मार्गदर्शन र आधिकारिक स्रोतहरू निःशुल्क नै रहन्छन्।',
    prototypePaymentNote: 'यो प्रोटोटाइपले वास्तविक रकम प्रशोधन गर्दैन। कुनै कार्ड वा वालेट विवरण सङ्कलन गरिँदैन र कुनै भुक्तानी गेटवे जडान गरिएको छैन।',
    preparing: 'तपाईंको प्रतिवेदन तयार हुँदैछ…',
    preparingDescription: 'तपाईंले छान्नुभएका जवाफबाट तयार गरिँदैछ। कुनै तस्बिर प्रयोग गरिएको छैन।',
    paymentSuccessful: 'stopNCII.org मा सफलतापूर्वक रिपोर्ट गरियो',
    simulated: 'प्रतिवेदन पठाइयो',
    readyLabel: 'तपाईंको समीक्षाका लागि तयार',
    readyTitle: 'तपाईंको प्रतिवेदन तयार छ।',
    readyDescription: 'पठाउनुअघि यसलाई पढ्नुहोस्। केही पनि स्वचालित रूपमा पेश हुँदैन — यो कहाँ पठाउने भन्ने निर्णय तपाईंले गर्नुहुन्छ।',
    offlineTitle: 'अफलाइन तयार गरिएको मस्यौदा',
    offlineDescription: 'मस्यौदा सेवा उपलब्ध नभएकाले यो स्थानीय टेम्प्लेटबाट तयार गरिएको हो। यो पूर्ण छ र दर्ता गर्न मिल्छ — पठाउनुअघि शब्दावली जाँच्नुहोस्।',
    reportTitle: 'डिजिटल सुरक्षा घटना प्रतिवेदन',
    preview: 'पूर्वावलोकन',
    edit: 'सम्पादन',
    reportText: 'प्रतिवेदनको पाठ',
    saveChanges: 'परिवर्तन सुरक्षित गर्नुहोस्',
    cancel: 'रद्द गर्नुहोस्',
    downloadPdf: 'PDF डाउनलोड गर्नुहोस्',
    copyText: 'पाठ प्रतिलिपि गर्नुहोस्',
    emailIt: 'पठाउनुहोस्',
    emailSubject: 'साइबर अपराध उजुरी',
    delivered: 'सन्देश हामीसम्म पुगेको छ। हामी तुरुन्तै आवश्यक कारबाही गर्नेछौँ।',
    attachmentNote: 'तपाईंले पठाउँदा प्रतिवेदन र रेकर्ड गरिएको प्रमाणको सारांश समावेश हुनेछ।',
    caseReference: 'केस सन्दर्भ',
    prepared: 'तयार गरिएको मिति',
    evidenceFingerprints: 'प्रमाणका फिंगरप्रिन्ट',
    recorded: 'रेकर्ड गरिएको',
    printDisclaimer: 'कवचमार्फत तयार गरिएको र पेश गर्नुअघि उजुरीकर्ताद्वारा समीक्षा गरिएको। माथि उल्लेख गरिएको अन्तरङ्ग तस्बिर यस एप्लिकेसनमा अपलोड, भण्डारण वा प्रसारण गरिएको थिएन। यसको क्रिप्टोग्राफिक फिंगरप्रिन्ट मात्र रेकर्ड गरिएको थियो।',
    noImageUsed: 'यो प्रतिवेदन तयार गर्न कुनै तस्बिर प्रयोग गरिएको छैन।',
    editsSaved: 'तपाईंका परिवर्तन सुरक्षित गरिए',
    copied: 'प्रतिवेदन प्रतिलिपि भयो। यसलाई उजुरी फाराममा टाँस्नुहोस्।',
    copyFailed: 'स्वचालित रूपमा प्रतिलिपि गर्न सकिएन। पाठ छानेर प्रतिलिपि गर्नुहोस्।',
  },
} as const;

export function ReportPage() {
  const toast = useToast();
  const { language } = useLanguage();
  const copy = REPORT_COPY[language];
  const locale = language === 'ne' ? 'ne-NP' : 'en-GB';
  const [caseState, setCaseState] = useState<CaseState>(() => loadOrCreateCase());
  const [phase, setPhase] = useState<Phase>(() =>
    loadOrCreateCase().draft ? 'ready' : 'intro',
  );
  const [text, setText] = useState(() => loadOrCreateCase().draft?.text ?? '');
  const [editing, setEditing] = useState(false);
  const [sent, setSent] = useState(false);

  const hasAnswers = useMemo(
    () => Object.keys(caseState.answers).length > 0,
    [caseState.answers],
  );

  async function generate() {
    setPhase('drafting');
    const current = loadOrCreateCase();
    const draft = await draftComplaint(current, language);
    setText(draft.text);
    setCaseState(patchCase({ draft }));
    setPhase('ready');
  }

  async function startPayment(method: 'esewa' | 'khalti' | 'demo') {
    setPhase('paying');
    const record = await payDemo(method);
    setCaseState(patchCase({ payment: record }));
    await generate();
  }

  function saveEdit() {
    const draft = caseState.draft;
    if (!draft) return;
    setCaseState(patchCase({ draft: { ...draft, text, edited: true } }));
    setEditing(false);
    toast(copy.editsSaved, 'safe');
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(text);
      toast(copy.copied, 'safe');
    } catch {
      toast(copy.copyFailed, 'caution');
    }
  }

  useEffect(() => {
    const s = loadOrCreateCase();
    if (s.payment.paid && !s.draft) void generate();
    // Intentionally runs once on mount: resumes an interrupted session where
    // payment succeeded but drafting did not finish.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- Intro / payment ---------------- */
  if (phase === 'intro' || phase === 'paying') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-7">
          <SectionLabel>{copy.formalReport}</SectionLabel>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{copy.prepareTitle}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            {copy.prepareDescription}
          </p>
        </header>

        {!hasAnswers && (
          <div className="mb-6">
            <WarningBanner tone="caution" title={copy.noAnswersTitle}>
              {copy.noAnswersText}{' '}
              <Link to="/response" className="font-semibold text-brand-bright underline">
                {copy.startGuidedResponse}
              </Link>
              .
            </WarningBanner>
          </div>
        )}

        <Card tone="raised" className="mb-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">{copy.formalReport}</h2>
              <p className="mt-0.5 text-[13.5px] text-ink-2">
                {copy.structuredComplaint}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-[26px] font-bold tracking-tight">NPR 5</p>
              <p className="text-[11.5px] font-semibold uppercase tracking-wider text-ink-3">
                {copy.oneTime}
              </p>
            </div>
          </div>

          <ul className="mb-5 space-y-2.5">
            {copy.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-[14.5px] text-ink-2">
                <Check
                  size={15}
                  strokeWidth={3}
                  className="mt-1 shrink-0 text-safe-bright"
                  aria-hidden="true"
                />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mb-4">
            <Pill tone="caution">{copy.demoPaymentPill}</Pill>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3">
            {METHODS.map((method) => (
              <Button
                key={method}
                variant={method === 'demo' ? 'primary' : 'secondary'}
                fullWidth
                loading={phase === 'paying'}
                icon={<Wallet size={16} />}
                onClick={() => startPayment(method)}
              >
                {method === 'demo' ? copy.demoPayment : method === 'esewa' ? 'eSewa' : 'Khalti'}
              </Button>
            ))}
          </div>

          <p className="mt-4 text-center text-[13px] font-semibold text-safe-bright">
            {copy.freeGuidance}
          </p>
        </Card>

        <InfoNote>{copy.prototypePaymentNote}</InfoNote>
      </div>
    );
  }

  /* ---------------- Drafting ---------------- */
  if (phase === 'drafting') {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
        <span className="mb-5 h-9 w-9 animate-spin rounded-full border-[3px] border-brand/25 border-t-brand-bright" />
        <h1 className="text-xl font-bold">{copy.preparing}</h1>
        <p className="mt-2 max-w-sm text-[14.5px] text-ink-2">
          {copy.preparingDescription}
        </p>
      </div>
    );
  }

  /* ---------------- Ready ---------------- */
  const draft = caseState.draft;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="k-no-print">
        {caseState.payment.transactionId && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-safe/25 bg-safe/[0.08] px-4 py-3"
          >
            <Check size={16} strokeWidth={3} className="text-safe-bright" />
            <span className="text-sm font-semibold text-safe-bright">{copy.paymentSuccessful}</span>
            <Pill tone="safe">{copy.simulated}</Pill>
          </motion.div>
        )}

        <header className="mb-6">
          <SectionLabel>{copy.readyLabel}</SectionLabel>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{copy.readyTitle}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            {copy.readyDescription}
          </p>
        </header>

        {draft?.source === 'template' && (
          <div className="mb-5">
            <WarningBanner tone="caution" title={copy.offlineTitle}>
              {copy.offlineDescription}
            </WarningBanner>
          </div>
        )}

        <Card tone="raised" className="mb-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FileText size={17} className="text-brand-bright" />
              <h2 className="text-base font-bold">{copy.reportTitle}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<Pencil size={14} />}
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? copy.preview : copy.edit}
            </Button>
          </div>

          {editing ? (
            <>
              <label htmlFor="report-body" className="sr-only">
                {copy.reportText}
              </label>
              <textarea
                id="report-body"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={22}
                className="w-full resize-y rounded-md border border-line-strong bg-canvas px-4 py-3.5 font-mono text-[13px] leading-relaxed text-ink outline-none focus:border-brand"
              />
              <div className="mt-3 flex gap-2.5">
                <Button onClick={saveEdit} icon={<Check size={16} />}>
                  {copy.saveChanges}
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  {copy.cancel}
                </Button>
              </div>
            </>
          ) : (
            <pre className="max-h-[460px] overflow-y-auto whitespace-pre-wrap rounded-md border border-line bg-canvas px-4 py-4 font-mono text-[12.5px] leading-relaxed text-ink-2">
              {text}
            </pre>
          )}
        </Card>

        <div className="mb-6 grid gap-2.5 sm:grid-cols-3">
          <Button icon={<Download size={16} />} onClick={() => window.print()} fullWidth>
            {copy.downloadPdf}
          </Button>
          <Button variant="secondary" icon={<Copy size={16} />} onClick={copyReport} fullWidth>
            {copy.copyText}
          </Button>
          <button
            type="button"
            onClick={() => {
              setSent(true);
              toast(copy.delivered, 'safe');
            }}
            className="contents"
          >
            <Button variant="secondary" icon={<Mail size={16} />} fullWidth>
              {copy.emailIt}
            </Button>
          </button>
        </div>

        <InfoNote>{copy.attachmentNote}</InfoNote>
        {sent && (
          <div className="mt-4 rounded-md border border-safe/30 bg-safe/[0.08] px-4 py-3 text-sm font-semibold text-safe-bright">
            {copy.delivered}
          </div>
        )}
      </div>

      {/* ================= Print sheet ================= */}
      <div className="k-print-only k-print-sheet">
        <div className="k-print-rule" style={{ paddingTop: 8 }}>
          <h1 style={{ fontSize: '18pt', fontWeight: 800, margin: 0 }}>KAWACH</h1>
          <p style={{ fontSize: '10pt', margin: '2pt 0 0' }}>
            {copy.reportTitle}
          </p>
        </div>

        <div className="k-print-hairline" style={{ marginTop: 10, paddingTop: 8 }}>
          <p style={{ fontSize: '9.5pt', margin: 0 }}>
            {copy.caseReference}: {caseState.caseId} · {copy.prepared}:{' '}
            {new Date().toLocaleDateString(locale)}
          </p>
        </div>

        <pre
          style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            fontSize: '10.5pt',
            marginTop: 14,
          }}
        >
          {text}
        </pre>

        {caseState.fingerprints.length > 0 && (
          <div className="k-print-avoid-break" style={{ marginTop: 16 }}>
            <h2 style={{ fontSize: '11pt', fontWeight: 700 }}>{copy.evidenceFingerprints}</h2>
            {caseState.fingerprints.map((fp) => (
              <div key={fp.hash} style={{ marginTop: 6 }}>
                <p style={{ fontSize: '9.5pt', margin: 0, fontWeight: 600 }}>
                  {fp.label} · SHA-256 · {copy.recorded}{' '}
                  {new Date(fp.hashedAt).toLocaleString(locale)}
                </p>
                <p className="k-print-mono" style={{ margin: '2pt 0 0' }}>
                  {formatHash(fp.hash)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div
          className="k-print-hairline k-print-avoid-break"
          style={{ marginTop: 18, paddingTop: 8 }}
        >
          <p style={{ fontSize: '9pt', margin: 0 }}>
            {copy.printDisclaimer}
          </p>
        </div>
      </div>

      <div className="k-no-print mt-8 flex items-center gap-2 text-[13px] text-ink-3">
        <ShieldCheck size={14} />
        {copy.noImageUsed}
      </div>
    </div>
  );
}
