import { useEffect, useRef, useState } from 'react';
import { Check, ExternalLink, Globe2, ImageOff, Search, ShieldCheck, Upload } from 'lucide-react';
import { Button, Card, Pill, SectionLabel } from '@/components/ui/primitives';
import { WarningBanner } from '@/components/ui/feedback';
import { useLanguage } from '@/components/LanguageContext';
import { platformReportUrls } from '@/data/resources';
import { loadOrCreateCase } from '@/storage/localState';
import { HashError, fingerprintFile } from '@/storage/hashEvidence';
import type { Platform } from '@/types';

const RESULTS: Array<{ platform: Platform; platformLabel: string; source: string; date: string; confidence: string; accent: string }> = [
  { platform: 'instagram', platformLabel: 'Instagram', source: 'Public profile post', date: '2 days ago', confidence: 'High similarity', accent: 'from-fuchsia-950 via-purple-900 to-orange-700' },
  { platform: 'facebook', platformLabel: 'Facebook', source: 'Public group attachment', date: '5 days ago', confidence: 'Likely match', accent: 'from-blue-950 via-blue-800 to-cyan-700' },
  { platform: 'other', platformLabel: 'Image host', source: 'Indexed media page', date: '1 week ago', confidence: 'Possible match', accent: 'from-slate-950 via-slate-700 to-emerald-800' },
];

const COPY = {
  en: {
    label: 'Exposure scan', title: 'Find where related media may be appearing.', intro: 'Choose related media, scan public sources, review possible references, and open the right reporting channel.', uploadTitle: 'Add related media', uploadText: 'Choose an image or video to begin the exposure scan.', upload: 'Choose media', ready: 'Media ready for scanning', change: 'Choose different media', start: 'Start exposure scan', scanAgain: 'Scan again', stages: ['Preparing media', 'Searching indexed pages', 'Checking social platforms', 'Comparing references'], sources: 'Scanning across public sources', results: 'Possible references', waiting: 'Add media and start the scan to view results.', selected: 'selected', select: 'Select for review', selectedLabel: 'Selected for review', openReport: 'Open report form', reportSelected: 'Report selected references', found: '3 references found', sample: 'Preview result', sampleText: 'Result cards are generated for this frontend flow.', minorTitle: 'Use Take It Down', minorText: 'Because someone under 18 is involved, do not select or handle the media here. Continue with the dedicated service instead.', takeDown: 'Continue to Take It Down', error: 'Could not prepare that file. Try another image or video.', tooLarge: 'That file is larger than 25 MB. Try a smaller file.', back: 'Back to evidence',
  },
  ne: {
    label: 'एक्सपोजर स्क्यान', title: 'सम्बन्धित मिडिया कहाँ देखिन सक्छ पत्ता लगाउनुहोस्।', intro: 'सम्बन्धित मिडिया छान्नुहोस्, सार्वजनिक स्रोत स्क्यान गर्नुहोस्, सम्भावित सन्दर्भ समीक्षा गरी सही रिपोर्टिङ माध्यम खोल्नुहोस्।', uploadTitle: 'सम्बन्धित मिडिया थप्नुहोस्', uploadText: 'एक्सपोजर स्क्यान सुरु गर्न तस्बिर वा भिडियो छान्नुहोस्।', upload: 'मिडिया छान्नुहोस्', ready: 'मिडिया स्क्यानका लागि तयार', change: 'अर्को मिडिया छान्नुहोस्', start: 'एक्सपोजर स्क्यान सुरु गर्नुहोस्', scanAgain: 'फेरि स्क्यान गर्नुहोस्', stages: ['मिडिया तयार हुँदै', 'इन्डेक्स पृष्ठ खोजिँदै', 'सामाजिक प्लेटफर्म जाँचिँदै', 'सन्दर्भ तुलना हुँदै'], sources: 'सार्वजनिक स्रोतहरूमा स्क्यान हुँदै', results: 'सम्भावित सन्दर्भ', waiting: 'नतिजा हेर्न मिडिया थपेर स्क्यान सुरु गर्नुहोस्।', selected: 'चयन गरिएको', select: 'समीक्षाका लागि छान्नुहोस्', selectedLabel: 'समीक्षाका लागि चयन', openReport: 'रिपोर्ट फाराम खोल्नुहोस्', reportSelected: 'चयन गरिएका सन्दर्भ रिपोर्ट गर्नुहोस्', found: '३ सन्दर्भ भेटिए', sample: 'पूर्वावलोकन परिणाम', sampleText: 'यी नतिजा कार्डहरू फ्रन्टएन्ड प्रक्रियाका लागि बनाइएका हुन्।', minorTitle: 'Take It Down प्रयोग गर्नुहोस्', minorText: '१८ वर्षमुनिको व्यक्ति संलग्न भएकाले यहाँ मिडिया नछान्नुहोस् वा नचलाउनुहोस्। समर्पित सेवामा जारी राख्नुहोस्।', takeDown: 'Take It Down मा जारी राख्नुहोस्', error: 'यो फाइल तयार गर्न सकिएन। अर्को तस्बिर वा भिडियो प्रयास गर्नुहोस्।', tooLarge: 'यो फाइल २५ MB भन्दा ठूलो छ। सानो फाइल प्रयोग गर्नुहोस्।', back: 'प्रमाणमा फर्कनुहोस्',
  },
} as const;

export function ExposureScanPage() {
  const { language } = useLanguage();
  const c = COPY[language];
  const minorInvolved = loadOrCreateCase().answers.minorInvolved === 'yes';
  const inputRef = useRef<HTMLInputElement>(null);
  const [mediaReady, setMediaReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scanning) return;
    const timer = window.setInterval(() => {
      setScanStep((step) => {
        if (step < c.stages.length - 1) return step + 1;
        window.clearInterval(timer);
        setScanning(false);
        setComplete(true);
        return step;
      });
    }, 850);
    return () => window.clearInterval(timer);
  }, [c.stages.length, scanning]);

  async function onChooseMedia(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setComplete(false);
    setSelected([]);
    try {
      await fingerprintFile(file, 'Exposure scan reference');
      setMediaReady(true);
    } catch (caught) {
      setError(caught instanceof HashError && caught.code === 'TOO_LARGE' ? c.tooLarge : c.error);
      setMediaReady(false);
    } finally {
      event.target.value = '';
    }
  }

  function startScan() {
    setScanStep(0);
    setSelected([]);
    setComplete(false);
    setScanning(true);
  }

  function toggleSelected(index: number) {
    setSelected((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  }

  function openSelectedReports() {
    const urls = [...new Set(selected.map((index) => platformReportUrls[RESULTS[index].platform].url))];
    urls.forEach((url) => window.open(url, '_blank', 'noopener,noreferrer'));
  }

  if (minorInvolved) {
    return <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12"><SectionLabel>{c.label}</SectionLabel><Card tone="caution" className="mt-4"><div className="mb-3 flex items-center gap-2.5"><ImageOff size={19} className="text-caution" /><h1 className="text-xl font-bold">{c.minorTitle}</h1></div><p className="mb-5 text-sm leading-relaxed text-ink-2">{c.minorText}</p><a href="https://takeitdown.ncmec.org" target="_blank" rel="noopener noreferrer"><Button fullWidth iconRight={<ExternalLink size={16} />}>{c.takeDown}</Button></a></Card></div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8"><SectionLabel>{c.label}</SectionLabel><h1 className="mt-2 max-w-3xl text-3xl font-bold sm:text-4xl">{c.title}</h1><p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2">{c.intro}</p></header>

      <WarningBanner tone="brand" title={c.sample}>{c.sampleText}</WarningBanner>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card tone="safe"><div className="mb-4 flex items-center gap-2.5"><Upload size={18} className="text-safe-bright" /><h2 className="font-bold">{c.uploadTitle}</h2></div><p className="mb-5 text-sm text-ink-2">{c.uploadText}</p><input ref={inputRef} type="file" accept="image/*,video/*" className="sr-only" onChange={onChooseMedia} /><Button fullWidth variant="safe" icon={<Upload size={17} />} onClick={() => inputRef.current?.click()}>{mediaReady ? c.change : c.upload}</Button>{mediaReady && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-safe-bright"><Check size={16} />{c.ready}</p>}{error && <p className="mt-3 text-sm text-danger-bright">{error}</p>}</Card>

        <Card tone="brand"><div className="mb-4 flex items-center gap-2.5"><Globe2 size={18} className="text-brand-bright" /><h2 className="font-bold">{c.sources}</h2></div><div className="space-y-3">{c.stages.map((stage, index) => { const active = scanning && index === scanStep; const done = complete || index < scanStep; return <div key={stage} className={`flex items-center gap-3 rounded-md border px-3 py-2.5 ${active ? 'border-brand/50 bg-brand/10' : 'border-line bg-surface-2'}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full ${done ? 'bg-safe/15 text-safe-bright' : active ? 'bg-brand/15 text-brand-bright' : 'bg-surface-3 text-ink-3'}`}>{done ? <Check size={14} /> : active ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand/30 border-t-brand-bright" /> : index + 1}</span><span className={`text-sm font-semibold ${active ? 'text-brand-bright' : done ? 'text-ink' : 'text-ink-3'}`}>{stage}</span></div>; })}</div><div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: complete ? '100%' : scanning ? `${((scanStep + 1) / c.stages.length) * 100}%` : '0%' }} /></div><Button className="mt-5" fullWidth disabled={!mediaReady} loading={scanning} icon={<Search size={17} />} onClick={startScan}>{complete ? c.scanAgain : c.start}</Button></Card>
      </div>

      <section className="mt-10"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-bold">{c.results}</h2>{complete && <Pill tone="brand">{c.found}</Pill>}</div>{!complete ? <Card><p className="text-sm text-ink-3">{c.waiting}</p></Card> : <div className="grid gap-4 md:grid-cols-3">{RESULTS.map((result, index) => { const isSelected = selected.includes(index); return <Card key={result.platformLabel} tone={isSelected ? 'brand' : 'default'} padded={false} className="overflow-hidden"><div className={`relative aspect-[4/3] bg-gradient-to-br ${result.accent}`}><div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.28),transparent_22%),radial-gradient(circle_at_68%_60%,rgba(255,255,255,0.16),transparent_30%)] blur-xl" /><div className="absolute inset-0 flex items-center justify-center"><ImageOff size={30} className="text-white/55" /></div><span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white">{result.platformLabel}</span></div><div className="p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold">{result.source}</h3><p className="mt-1 text-xs text-ink-3">{result.date}</p></div><Pill tone="caution">{result.confidence}</Pill></div><Button className="mt-4" fullWidth size="sm" variant={isSelected ? 'safe' : 'secondary'} onClick={() => toggleSelected(index)}>{isSelected ? c.selectedLabel : c.select}</Button>{isSelected && <a className="mt-2 block" href={platformReportUrls[result.platform].url} target="_blank" rel="noopener noreferrer"><Button fullWidth size="sm" iconRight={<ExternalLink size={14} />}>{c.openReport}</Button></a>}</div></Card>; })}</div>}</section>

      {selected.length > 0 && <Card tone="safe" className="mt-8"><div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-bold">{selected.length} {c.selected}</h2><p className="mt-1 text-sm text-ink-2">{RESULTS.filter((_, index) => selected.includes(index)).map((item) => item.platformLabel).join(' · ')}</p></div><Button icon={<ShieldCheck size={17} />} onClick={openSelectedReports}>{c.reportSelected}</Button></div></Card>}

      <a className="mt-8 inline-block text-sm font-semibold text-brand-bright hover:text-brand" href="/evidence">← {c.back}</a>
    </div>
  );
}
