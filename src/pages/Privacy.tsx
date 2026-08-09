import { Server, Wifi } from 'lucide-react';
import { Card, SectionLabel } from '@/components/ui/primitives';
import { InfoNote, TrustIndicator } from '@/components/ui/feedback';
import { useLanguage } from '@/components/LanguageContext';

const COPY = {
  en: {
    guarantees: [
      ['Image', 'Never uploaded'], ['AI', 'Never receives image'],
      ['Storage', 'No intimate image stored'], ['Hash', 'Only fingerprint retained'],
    ],
    section: 'Privacy Center', title: 'Exactly what happens to your image.',
    intro: 'Not a reassurance — a description. Here is the actual data path, so you can judge it for yourself.',
    select: 'When you select an image',
    steps: [
      ['The file is read in your browser', 'Your browser reads the bytes into memory on this device. Nothing is sent anywhere at this point.'],
      ['A SHA-256 hash is computed locally', 'The Web Crypto API built into your browser produces a 64-character fingerprint. This runs on your device, not on a server.'],
      ['The bytes are overwritten and released', 'The memory holding the image is zeroed, and the file input is cleared. We never render a preview, never create a thumbnail, and never write the image to storage.'],
      ['Only the hash and timestamp are kept', 'Those two values are saved in this browser. They are what appears in your report.'],
    ],
    leaves: 'What does leave your device', answers: 'The answers you tapped — and nothing else',
    answersBody: 'To draft your complaint, Kawach sends the structured choices you selected: the platform, the type of threat, whether money was demanded, and the dates. These are fixed options, not free text, and they never describe image content.',
    offline: 'Offline, nothing leaves at all', offlineBody: 'With no connection, Kawach builds the same report from a local template on your device. The flow still finishes.',
    stored: 'Stored in this browser', storedItems: ['Your answers and progress through the guided flow', 'SHA-256 fingerprints and their timestamps', 'Conversation screenshots you chose to save', 'Your drafted report, including any edits'],
    storedBody: 'There is no account and no server-side copy. Anyone with access to this device and browser can open it, so use', erase: 'Erase', storedEnd: 'in the header when you are finished — especially on a shared or family phone.',
    note: 'Kawach is a prototype built for a hackathon. It is not a substitute for the Cyber Bureau, a lawyer, or a counsellor, and it does not file anything on your behalf.',
  },
  ne: {
    guarantees: [['तस्बिर', 'कहिल्यै अपलोड हुँदैन'], ['एआई', 'तस्बिर कहिल्यै प्राप्त गर्दैन'], ['भण्डारण', 'निजी तस्बिर सुरक्षित गरिँदैन'], ['ह्यास', 'फिंगरप्रिन्ट मात्र राखिन्छ']],
    section: 'गोपनीयता केन्द्र', title: 'तपाईंको तस्बिरसँग वास्तवमा के हुन्छ।',
    intro: 'यो केवल आश्वासन होइन — विवरण हो। यहाँ वास्तविक डेटा प्रवाह दिइएको छ, ताकि तपाईं आफैं निर्णय गर्न सक्नुहोस्।', select: 'तपाईंले तस्बिर छान्दा',
    steps: [['फाइल तपाईंको ब्राउजरमा पढिन्छ', 'तपाईंको ब्राउजरले यस उपकरणको मेमोरीमा फाइलका बाइटहरू पढ्छ। यस चरणमा केही पनि कतै पठाइँदैन।'], ['SHA-256 ह्यास स्थानीय रूपमा निकालिन्छ', 'तपाईंको ब्राउजरमा रहेको Web Crypto API ले ६४ अक्षरको फिंगरप्रिन्ट बनाउँछ। यो सर्भरमा होइन, तपाईंको उपकरणमै चल्छ।'], ['बाइटहरू मेटाएर मेमोरी खाली गरिन्छ', 'तस्बिर राखिएको मेमोरी शून्यमा भरिन्छ र फाइल इनपुट खाली गरिन्छ। हामी प्रिभ्यु देखाउँदैनौं, थम्बनेल बनाउँदैनौं र तस्बिर भण्डारणमा लेख्दैनौं।'], ['ह्यास र समय मात्र राखिन्छ', 'यी दुई मान यस ब्राउजरमा सुरक्षित हुन्छन्। तपाईंको प्रतिवेदनमा यही देखिन्छ।']],
    leaves: 'तपाईंको उपकरणबाट बाहिर जाने कुरा', answers: 'तपाईंले छान्नुभएका जवाफ मात्र — अरू केही होइन', answersBody: 'तपाईंको उजुरीको मस्यौदा बनाउन Kawach ले तपाईंले छान्नुभएका संरचित विकल्पहरू पठाउँछ: प्लेटफर्म, धम्कीको प्रकार, पैसा मागिएको हो कि होइन, र मितिहरू। यी स्वतन्त्र लेखाइ होइनन्, निश्चित विकल्प हुन् र तस्बिरको विषयवस्तु बताउँदैनन्।', offline: 'अफलाइन हुँदा केही पनि बाहिर जाँदैन', offlineBody: 'इन्टरनेट जडान नभए Kawach ले तपाईंको उपकरणमा रहेको स्थानीय नमुनाबाट उही प्रतिवेदन बनाउँछ। प्रक्रिया पूरा हुन्छ।', stored: 'यस ब्राउजरमा सुरक्षित हुने कुरा', storedItems: ['निर्देशित प्रक्रियाका तपाईंका जवाफ र प्रगति', 'SHA-256 फिंगरप्रिन्ट र तिनका समय', 'तपाईंले सुरक्षित गर्न रोजेका कुराकानीका स्क्रिनसट', 'तपाईंको प्रतिवेदनको मस्यौदा, सम्पादनसहित'], storedBody: 'कुनै खाता वा सर्भरमा राखिएको प्रतिलिपि हुँदैन। यो उपकरण र ब्राउजरमा पहुँच हुने जोसुकैले यसलाई खोल्न सक्छ, त्यसैले सकिएपछि हेडरमा रहेको', erase: 'मेटाउनुहोस्', storedEnd: 'प्रयोग गर्नुहोस् — विशेषगरी साझा वा पारिवारिक फोनमा।', note: 'Kawach ह्याकाथनका लागि बनाइएको प्रोटोटाइप हो। यो साइबर ब्यूरो, वकिल वा परामर्शदाताको विकल्प होइन र तपाईंको तर्फबाट कुनै उजुरी दर्ता गर्दैन।',
  },
} as const;

export function PrivacyPage() {
  const { language } = useLanguage();
  const copy = COPY[language];
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8"><SectionLabel>{copy.section}</SectionLabel><h1 className="mt-2 text-3xl font-bold sm:text-4xl">{copy.title}</h1><p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2">{copy.intro}</p></header>
      <Card tone="safe" className="mb-8"><div className="grid gap-5 sm:grid-cols-2">{copy.guarantees.map((g) => <TrustIndicator key={g[0]} label={g[0]} value={g[1]} tone="safe" />)}</div></Card>
      <section className="mb-8"><h2 className="mb-4 text-lg font-bold">{copy.select}</h2><ol className="space-y-3">{copy.steps.map((step, i) => <li key={step[0]} className="flex gap-4 rounded-lg border border-line bg-surface p-5 shadow-low"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand/40 bg-brand/10 font-sans text-[12px] font-bold text-brand-bright">{i + 1}</span><div><p className="text-[15px] font-semibold">{step[0]}</p><p className="mt-1 text-[14px] leading-relaxed text-ink-2">{step[1]}</p></div></li>)}</ol></section>
      <section className="mb-8"><h2 className="mb-4 text-lg font-bold">{copy.leaves}</h2><Card><div className="mb-4 flex items-start gap-3"><Server size={17} className="mt-0.5 shrink-0 text-brand-bright" aria-hidden="true" /><div><p className="text-[15px] font-semibold">{copy.answers}</p><p className="mt-1 text-[14px] leading-relaxed text-ink-2">{copy.answersBody}</p></div></div><div className="flex items-start gap-3"><Wifi size={17} className="mt-0.5 shrink-0 text-safe-bright" aria-hidden="true" /><div><p className="text-[15px] font-semibold">{copy.offline}</p><p className="mt-1 text-[14px] leading-relaxed text-ink-2">{copy.offlineBody}</p></div></div></Card></section>
      <section className="mb-8"><h2 className="mb-4 text-lg font-bold">{copy.stored}</h2><Card><ul className="space-y-2.5 text-[14.5px] text-ink-2">{copy.storedItems.map((item) => <li key={item}>· {item}</li>)}</ul><p className="mt-4 text-[14px] leading-relaxed text-ink-2">{copy.storedBody} <strong>{copy.erase}</strong> {copy.storedEnd}</p></Card></section>
      <InfoNote>{copy.note}</InfoNote>
    </div>
  );
}
