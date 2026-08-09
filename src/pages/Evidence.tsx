import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  Fingerprint,
  Globe2,
  ImageOff,
  Lock,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Button, Card, SectionLabel } from '@/components/ui/primitives';
import {
  EmptyState,
  InfoNote,
  TrustIndicator,
  WarningBanner,
} from '@/components/ui/feedback';
import { useToast } from '@/components/ui/overlays';
import { useLanguage } from '@/components/LanguageContext';
import { addScreenshot, deleteScreenshot, listScreenshots } from '@/storage/db';
import type { ScreenshotRecord } from '@/storage/db';
import { HashError, fingerprintFile, formatBytes, formatHash } from '@/storage/hashEvidence';
import { appendFingerprint, loadOrCreateCase, patchCase } from '@/storage/localState';
import type { CaseState } from '@/types';

type HashStage = 'idle' | 'reading' | 'hashing' | 'clearing' | 'done';

const COPY = {
  en: {
    stage: { reading: 'Reading the file on this device…', hashing: 'Computing SHA-256…', clearing: 'Clearing the file reference…' },
    title: 'Evidence Center', heading: 'Preserve what matters.', intro: 'Kawach helps you document the incident while keeping sensitive content off the network. Two separate paths, handled very differently.',
    conversation: 'Conversation screenshots', conversationText: 'Save screenshots that show the threats, usernames, timestamps, and payment demands. These stay in this browser on this device.', cropTitle: 'Crop the image out first', cropText: 'If a screenshot shows the actual intimate image, crop or blur that part before saving. We only need the conversation text.', addScreenshot: 'Add a screenshot', empty: 'No screenshots saved yet', emptyText: 'Nothing has been stored on this device.', saved: 'saved on this device', delete: (label: string) => `Delete ${label}`,
    privateImage: 'Private image', noOpenTitle: 'We are not going to ask you to open that file.', noOpenText: 'Because someone under 18 is involved, handling the image at all — even to fingerprint it on this device — is not something we will ask you to do. NCMEC Take It Down is built for exactly this and works without you sending the image to anyone.', takeDown: 'Go to Take It Down and Child Helpline', protection: 'Private image protection', stays: 'Your image stays on this device', fingerprintTitle: 'We create a fingerprint, not a copy.',
    steps: ['Device only', 'SHA-256', 'Hash string', 'Image discarded'], hashLabel: 'Hash', imageLabel: 'Image', retainedLabel: 'Retained', privacy: 'Kawach does not upload your intimate image to a server and does not send it to any AI model. The file is read in this browser, a SHA-256 hash is computed, and the file reference is cleared.', errorTitle: 'Could not create a fingerprint', hashImage: 'Hash image on this device', info: 'A SHA-256 fingerprint proves a specific file existed, unaltered, at a specific time. It is not a takedown request, and it cannot match re-encoded or cropped copies — the takedown services do that with their own perceptual hashing.', generated: 'Generated locally', reference: 'Reference cleared', hashOnly: 'Hash only', recorded: 'recorded', continue: 'Continue to report', help: 'See official help',
    saveError: 'Could not save on this device. Storage may be blocked.', savedToast: 'Screenshot saved on this device', fingerprintToast: 'Fingerprint created. The image was not stored.', insecure: 'This needs a secure (https) connection to hash safely on your device.', tooLarge: 'That file is larger than 25 MB. Try a smaller file.', unreadable: 'That file could not be read. Try selecting it again.', unknown: 'Something went wrong. Nothing was uploaded.',
    exposureScan: 'Exposure scan demo', exposureScanText: 'See a simulated metadata-only review flow. It does not browse the internet or load images.',
  },
  ne: {
    stage: { reading: 'यस उपकरणमा फाइल पढिँदै…', hashing: 'SHA-256 गणना हुँदै…', clearing: 'फाइल सन्दर्भ हटाइँदै…' },
    title: 'प्रमाण केन्द्र', heading: 'महत्त्वपूर्ण कुरा सुरक्षित राख्नुहोस्।', intro: 'Kawach ले संवेदनशील सामग्री नेटवर्कबाट बाहिर राख्दै घटनाको अभिलेख बनाउन मद्दत गर्छ। दुई अलग बाटा, धेरै फरक तरिकाले व्यवस्थापन गरिएका।',
    conversation: 'कुराकानीका स्क्रिनसट', conversationText: 'धम्की, प्रयोगकर्ता नाम, समय र भुक्तानी माग देखिने स्क्रिनसट सुरक्षित गर्नुहोस्। यी यस उपकरणको यही ब्राउजरमा रहन्छन्।', cropTitle: 'पहिले तस्बिर काट्नुहोस्', cropText: 'स्क्रिनसटमा वास्तविक निजी तस्बिर देखिएमा सुरक्षित गर्नुअघि त्यो भाग काट्नुहोस् वा धमिलो पार्नुहोस्। हामीलाई कुराकानीको पाठ मात्र चाहिन्छ।', addScreenshot: 'स्क्रिनसट थप्नुहोस्', empty: 'अहिलेसम्म कुनै स्क्रिनसट सुरक्षित छैन', emptyText: 'यस उपकरणमा केही पनि भण्डारण गरिएको छैन।', saved: 'यस उपकरणमा सुरक्षित', delete: (label: string) => `${label} मेटाउनुहोस्`,
    privateImage: 'निजी तस्बिर', noOpenTitle: 'हामी तपाईंलाई त्यो फाइल खोल्न भन्ने छैनौँ।', noOpenText: '१८ वर्षमुनिका व्यक्ति संलग्न भएकाले तस्बिरलाई यस उपकरणमै फिंगरप्रिन्ट बनाउन समेत चलाउनु पर्ने छैन। NCMEC Take It Down यही कामका लागि बनाइएको हो र तस्बिर कसैलाई पठाउनुपर्दैन।', takeDown: 'Take It Down र Child Helpline मा जानुहोस्', protection: 'निजी तस्बिर सुरक्षा', stays: 'तपाईंको तस्बिर यस उपकरणमै रहन्छ', fingerprintTitle: 'हामी प्रतिलिपि होइन, फिंगरप्रिन्ट बनाउँछौँ।',
    steps: ['उपकरणमा मात्र', 'SHA-256', 'ह्यास स्ट्रिङ', 'तस्बिर हटाइयो'], hashLabel: 'ह्यास', imageLabel: 'तस्बिर', retainedLabel: 'राखिएको', privacy: 'Kawach ले तपाईंको निजी तस्बिर सर्भरमा अपलोड गर्दैन र कुनै AI मोडलमा पठाउँदैन। फाइल यही ब्राउजरमा पढिन्छ, SHA-256 ह्यास गणना गरिन्छ र फाइल सन्दर्भ हटाइन्छ।', errorTitle: 'फिंगरप्रिन्ट बनाउन सकिएन', hashImage: 'यस उपकरणमा तस्बिरको ह्यास बनाउनुहोस्', info: 'SHA-256 फिंगरप्रिन्टले कुनै निश्चित फाइल निश्चित समयमा परिवर्तन नगरिएको अवस्थामा रहेको प्रमाणित गर्छ। यो हटाउने अनुरोध होइन र पुनः-एन्कोड वा काटिएका प्रतिलिपिसँग मिल्दैन — हटाउने सेवाहरूले आफ्नै perceptual hashing गर्छन्।', generated: 'स्थानीय रूपमा बनाइएको', reference: 'सन्दर्भ हटाइयो', hashOnly: 'ह्यास मात्र', recorded: 'अभिलेखित', continue: 'प्रतिवेदनमा जारी राख्नुहोस्', help: 'आधिकारिक सहायता हेर्नुहोस्',
    saveError: 'यस उपकरणमा सुरक्षित गर्न सकिएन। भण्डारण रोकिएको हुन सक्छ।', savedToast: 'स्क्रिनसट यस उपकरणमा सुरक्षित भयो', fingerprintToast: 'फिंगरप्रिन्ट बन्यो। तस्बिर सुरक्षित गरिएन।', insecure: 'यस उपकरणमा सुरक्षित रूपमा ह्यास बनाउन सुरक्षित (https) जडान चाहिन्छ।', tooLarge: 'यो फाइल २५ MB भन्दा ठूलो छ। सानो फाइल प्रयोग गर्नुहोस्।', unreadable: 'यो फाइल पढ्न सकिएन। फेरि चयन गर्नुहोस्।', unknown: 'केही समस्या भयो। केही पनि अपलोड भएन।',
    exposureScan: 'एक्सपोजर स्क्यान डेमो', exposureScanText: 'कृत्रिम मेटाडाटा मात्र भएको समीक्षा प्रक्रिया हेर्नुहोस्। यसले इन्टरनेट ब्राउज वा तस्बिर खोल्दैन।',
  },
} as const;

export function EvidencePage() {
  const toast = useToast();
  const { language } = useLanguage();
  const c = COPY[language];
  const [caseState, setCaseState] = useState<CaseState>(() => loadOrCreateCase());
  const [shots, setShots] = useState<ScreenshotRecord[]>([]);
  const [stage, setStage] = useState<HashStage>('idle');
  const [error, setError] = useState<string | null>(null);

  const shotInput = useRef<HTMLInputElement>(null);
  const hashInput = useRef<HTMLInputElement>(null);

  // The minor gate. Enforced here as well as in the tree, because this is the
  // one regression that must never happen: if a minor is involved we do not
  // ask anyone to select that file.
  const minorInvolved = caseState.answers.minorInvolved === 'yes';

  useEffect(() => {
    listScreenshots().then(setShots);
  }, []);

  async function onPickScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rec = await addScreenshot(file, `Screenshot ${shots.length + 1}`);
      if (!rec) {
        toast(c.saveError, 'caution');
        return;
      }
      const next = await listScreenshots();
      setShots(next);
      setCaseState(patchCase({ screenshotCount: next.length }));
      toast(c.savedToast, 'safe');
    } finally {
      e.target.value = '';
    }
  }

  async function onRemoveScreenshot(id?: number) {
    if (id === undefined) return;
    await deleteScreenshot(id);
    const next = await listScreenshots();
    setShots(next);
    setCaseState(patchCase({ screenshotCount: next.length }));
  }

  /**
   * The hash path. The file input is cleared in `finally` — on success AND on
   * failure. A thrown error must never leave the file selected.
   */
  async function onPickForHash(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      setStage('reading');
      await new Promise((r) => setTimeout(r, 260));
      setStage('hashing');

      const fp = await fingerprintFile(file, `Image ${caseState.fingerprints.length + 1}`);

      setStage('clearing');
      await new Promise((r) => setTimeout(r, 240));

      setCaseState(appendFingerprint(fp));
      setStage('done');
      toast(c.fingerprintToast, 'safe');
    } catch (err) {
      setStage('idle');
      if (err instanceof HashError) {
        setError(
          err.code === 'INSECURE_CONTEXT'
            ? c.insecure
            : err.code === 'TOO_LARGE'
              ? c.tooLarge
              : c.unreadable,
        );
      } else {
        setError(c.unknown);
      }
    } finally {
      // Non-negotiable: the picked file never stays selected.
      e.target.value = '';
    }
  }

  const busy = stage === 'reading' || stage === 'hashing' || stage === 'clearing';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <SectionLabel>{c.title}</SectionLabel>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{c.heading}</h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-2">{c.intro}</p>
      </header>

      <div className="mb-8">
        <Link to="/scan">
          <Card tone="brand" className="transition-colors hover:border-brand-bright/60">
            <div className="flex items-start gap-3">
              <Globe2 size={19} className="mt-0.5 shrink-0 text-brand-bright" aria-hidden="true" />
              <div>
                <h2 className="font-bold">{c.exposureScan}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{c.exposureScanText}</p>
              </div>
              <ArrowRight size={17} className="ml-auto mt-1 shrink-0 text-brand-bright" aria-hidden="true" />
            </div>
          </Card>
        </Link>
      </div>

      {/* ================= A. Conversation evidence ================= */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2.5">
          <Camera size={17} className="text-brand-bright" aria-hidden="true" />
          <h2 className="text-lg font-bold">{c.conversation}</h2>
        </div>

        <Card>
          <p className="mb-4 text-[14.5px] leading-relaxed text-ink-2">{c.conversationText}</p>

          <div className="mb-4">
            <WarningBanner tone="caution" title={c.cropTitle}>{c.cropText}</WarningBanner>
          </div>

          <input
            ref={shotInput}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onPickScreenshot}
          />
          <Button
            variant="secondary"
            fullWidth
            icon={<Camera size={17} />}
            onClick={() => shotInput.current?.click()}
          >
            {c.addScreenshot}
          </Button>

          <div className="mt-5">
            {shots.length === 0 ? (
              <EmptyState title={c.empty}>{c.emptyText}</EmptyState>
            ) : (
              <ul className="space-y-2">
                {shots.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface-2 px-4 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{s.label}</span>
                      <span className="block text-[12.5px] text-ink-3">
                        {formatBytes(s.sizeBytes)} · {c.saved}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveScreenshot(s.id)}
                      aria-label={c.delete(s.label)}
                      className="flex h-11 w-11 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-3 hover:text-danger-bright"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </section>

      {/* ================= B. Private image hash ================= */}
      {minorInvolved ? (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2.5">
            <ImageOff size={17} className="text-caution" aria-hidden="true" />
            <h2 className="text-lg font-bold">{c.privateImage}</h2>
          </div>
          <Card tone="caution">
            <h3 className="mb-2 text-[15px] font-bold text-caution">{c.noOpenTitle}</h3>
            <p className="mb-4 text-[14.5px] leading-relaxed text-ink-2">{c.noOpenText}</p>
            <Link to="/resources">
              <Button variant="primary" fullWidth iconRight={<ArrowRight size={16} />}>
                {c.takeDown}
              </Button>
            </Link>
          </Card>
        </section>
      ) : (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2.5">
            <Lock size={17} className="text-safe-bright" aria-hidden="true" />
            <h2 className="text-lg font-bold">{c.protection}</h2>
          </div>

          <Card tone="safe">
            <div className="mb-5">
              <SectionLabel className="text-safe-bright/70">
                {c.stays}
              </SectionLabel>
              <h3 className="mt-2 text-xl font-bold">
                {c.fingerprintTitle}
              </h3>
            </div>

            {/* The four-stage privacy diagram — the demo's centrepiece. */}
            <div className="mb-5 grid gap-2 sm:grid-cols-4">
              {(
                [
                  { label: c.steps[0], icon: Lock, active: stage !== 'idle' },
                  { label: c.steps[1], icon: Fingerprint, active: stage === 'hashing' || stage === 'clearing' || stage === 'done' },
                  { label: c.steps[2], icon: ShieldCheck, active: stage === 'clearing' || stage === 'done' },
                  { label: c.steps[3], icon: ImageOff, active: stage === 'done' },
                ] as const
              ).map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className={`flex items-center gap-2.5 rounded-md border px-3 py-3 transition-colors sm:flex-col sm:gap-2 sm:text-center ${
                      s.active
                        ? 'border-safe/40 bg-safe/12 text-safe-bright'
                        : 'border-line bg-surface-2 text-ink-3'
                    }`}
                  >
                    <Icon size={17} aria-hidden="true" />
                    <span className="text-[12.5px] font-bold">{s.label}</span>
                  </div>
                );
              })}
            </div>

            <p className="mb-5 text-[14.5px] leading-relaxed text-ink-2">{c.privacy}</p>

            {error && (
              <div className="mb-4">
                <WarningBanner tone="danger" title={c.errorTitle}>
                  {error}
                </WarningBanner>
              </div>
            )}

            <input
              ref={hashInput}
              type="file"
              accept="image/*,video/*"
              className="sr-only"
              onChange={onPickForHash}
            />
            <Button
              variant="safe"
              fullWidth
              size="lg"
              loading={busy}
              icon={<Fingerprint size={18} />}
              onClick={() => hashInput.current?.click()}
            >
              {busy ? c.stage[stage as keyof typeof c.stage] : c.hashImage}
            </Button>

            <div className="mt-4">
              <InfoNote>{c.info}</InfoNote>
            </div>
          </Card>

          {caseState.fingerprints.length > 0 && (
            <div className="mt-5 space-y-3">
              {caseState.fingerprints.map((fp) => (
                <motion.div
                  key={fp.hash + fp.hashedAt}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Card tone="raised">
                    <div className="mb-4 grid gap-3 sm:grid-cols-3">
                      <TrustIndicator label={c.hashLabel} value={c.generated} tone="safe" />
                      <TrustIndicator label={c.imageLabel} value={c.reference} tone="safe" />
                      <TrustIndicator label={c.retainedLabel} value={c.hashOnly} tone="safe" />
                    </div>
                    <SectionLabel>{fp.label} · SHA-256</SectionLabel>
                    <p className="k-hash mt-1.5 text-safe-bright">{formatHash(fp.hash)}</p>
                    <p className="mt-3 text-[12.5px] text-ink-3">
                      {formatBytes(fp.sizeBytes)} · {c.recorded}{' '}
                      {new Date(fp.hashedAt).toLocaleString(language === 'ne' ? 'ne-NP' : 'en-GB')}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/report" className="flex-1">
          <Button fullWidth size="lg" iconRight={<ArrowRight size={17} />}>
            {c.continue}
          </Button>
        </Link>
        <Link to="/resources" className="flex-1">
          <Button variant="secondary" fullWidth size="lg">
            {c.help}
          </Button>
        </Link>
      </div>
    </div>
  );
}
