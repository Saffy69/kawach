import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Fingerprint,
  ImageOff,
  Lock,
  MessageSquare,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { Button, Card, Pill, SectionLabel } from '@/components/ui/primitives';
import { InfoNote, TrustIndicator } from '@/components/ui/feedback';
import { Wordmark } from '@/components/shared';
import { useLanguage } from '@/components/LanguageContext';

const NEPALI_COPY: Record<string, string> = {
  Welcome: 'स्वागत छ', 'Immediate help': 'तत्काल सहायता', 'How it works': 'यसले कसरी काम गर्छ', Privacy: 'गोपनीयता', 'Evidence and report': 'प्रमाण र प्रतिवेदन', Pricing: 'शुल्क', Questions: 'प्रश्नहरू', Start: 'सुरु गर्नुहोस्', Slides: 'स्लाइडहरू', 'Go to ': 'यहाँ जानुहोस्: ',
  "Nepal's digital safety response kit": 'नेपालको डिजिटल सुरक्षा सहायता किट', 'Take the next': 'अबको सही', 'right step.': 'कदम चाल्नुहोस्।',
  'Kawach guides you through sextortion and intimate-image threats — helping you preserve evidence, prepare a report, and reach the right support without uploading your private images.': 'कवचले यौन दुर्व्यवहार तथा निजी तस्बिरसम्बन्धी धम्कीमा तपाईंलाई मार्गदर्शन गर्छ—निजी तस्बिर अपलोड नगरी प्रमाण सुरक्षित गर्न, प्रतिवेदन तयार गर्न र सही सहयोगमा पुग्न मद्दत गर्छ।',
  'I Need Help Now': 'मलाई अहिले सहायता चाहिन्छ', 'See How It Works': 'यसले कसरी काम गर्छ हेर्नुहोस्', 'Free to use': 'प्रयोग गर्न निःशुल्क', 'No account needed': 'खाता आवश्यक पर्दैन', 'Works offline': 'इन्टरनेटबिनै चल्छ', 'Step 1 of 6': '६ मध्ये चरण १',
  "You're not alone. Let's take this one step at a time.": 'तपाईं एक्लो हुनुहुन्न। यसलाई एक–एक कदम गर्दै अघि बढौँ।', 'What best describes what is happening?': 'के भइरहेको छ भन्ने कुरा कुन विकल्पले राम्रोसँग बताउँछ?', 'Someone is threatening me': 'कसैले मलाई धम्की दिइरहेको छ', 'My image has already been shared': 'मेरो तस्बिर पहिले नै साझा भइसकेको छ', 'They are demanding money': 'उनीहरूले पैसा मागिरहेका छन्', 'Your answers stay on this device.': 'तपाईंका जवाफ यही उपकरणमा सुरक्षित रहन्छन्।',
  'If this is happening right now': 'यदि यो अहिले भइरहेको छ भने', 'Three things that help immediately.': 'तुरुन्तै मद्दत गर्ने तीन कुरा।', 'Stop engaging': 'सम्पर्क रोक्नुहोस्', 'You do not owe them a reply. Do not send more images, and do not pay — it rarely stops the demands.': 'तपाईंले जवाफ दिनैपर्छ भन्ने छैन। थप तस्बिर नपठाउनुहोस् र पैसा नदिनुहोस्—यसले माग प्रायः रोकिँदैन।', 'Keep the evidence': 'प्रमाण सुरक्षित राख्नुहोस्', 'Screenshot the conversation before you block or report. Lock your accounts down, but do not delete the thread.': 'ब्लक वा रिपोर्ट गर्नुअघि कुराकानीको स्क्रिनसट लिनुहोस्। आफ्ना खाता सुरक्षित गर्नुहोस्, तर कुराकानी नमेटाउनुहोस्।', 'Reach official help': 'आधिकारिक सहायता लिनुहोस्', 'The Cyber Bureau handles this. Child Helpline 1098 and the Women Commission 1145 are free.': 'साइबर ब्युरोले यस्तो विषय हेर्छ। बाल हेल्पलाइन १०९८ र महिला आयोग ११४५ निःशुल्क छन्।',
  'How Kawach works': 'कवचले कसरी काम गर्छ', 'Four steps, and you can stop at any point.': 'चार चरण—र तपाईं जुनसुकै चरणमा रोक्न सक्नुहुन्छ।', 'Answer by tapping': 'थिचेर जवाफ दिनुहोस्', 'No typing. One question at a time, with a Back button that always works.': 'टाइप गर्नुपर्दैन। एकपटकमा एउटा प्रश्न, र सधैँ काम गर्ने पछाडि बटन।', 'Get tailored steps': 'तपाईंका लागि मिलाइएका कदम पाउनुहोस्', 'Clear do and do-not guidance for your exact situation.': 'तपाईंको अवस्थाअनुसार के गर्ने र के नगर्ने स्पष्ट मार्गदर्शन।', 'Preserve evidence': 'प्रमाण सुरक्षित गर्नुहोस्', 'Save conversation screenshots. Fingerprint the image without uploading it.': 'कुराकानीका स्क्रिनसट सुरक्षित गर्नुहोस्। तस्बिर अपलोड नगरी यसको फिंगरप्रिन्ट बनाउनुहोस्।', 'Review and file': 'समीक्षा गरी दर्ता गर्नुहोस्', 'A structured complaint you can edit, print, or email yourself.': 'आफैँ सम्पादन, प्रिन्ट वा इमेल गर्न मिल्ने व्यवस्थित उजुरी।',
  'Privacy architecture': 'गोपनीयताको संरचना', 'Your image never leaves this device.': 'तपाईंको तस्बिर यो उपकरणबाट बाहिर जाँदैन।', 'If you choose to fingerprint an image, your browser reads it, computes a SHA-256 hash locally, and clears the file. The image is never uploaded, never written to storage, and never sent to any AI model.': 'तपाईंले तस्बिरको फिंगरप्रिन्ट बनाउन रोज्नुभयो भने ब्राउजरले यसलाई पढेर यहीँ SHA-256 ह्यास गणना गर्छ र फाइल हटाउँछ। तस्बिर कहिल्यै अपलोड, भण्डारण वा कुनै एआई मोडेलमा पठाइँदैन।', Image: 'तस्बिर', 'Never uploaded': 'कहिल्यै अपलोड हुँदैन', AI: 'एआई', 'Never receives image': 'तस्बिर प्राप्त गर्दैन', Storage: 'भण्डारण', 'No intimate image stored': 'निजी तस्बिर भण्डारण हुँदैन', Hash: 'ह्यास', 'Only fingerprint retained': 'फिंगरप्रिन्ट मात्र राखिन्छ', 'How Kawach Protects You': 'कवचले तपाईंलाई कसरी सुरक्षित राख्छ', 'The full data path': 'सम्पूर्ण डेटा मार्ग', 'Device only': 'उपकरणमा मात्र', 'Hash string': 'ह्यास स्ट्रिङ', 'Image discarded': 'तस्बिर हटाइन्छ', 'Nothing in this diagram involves a network request. You can watch it happen with your connection turned off.': 'यस प्रक्रियामा कुनै नेटवर्क अनुरोध हुँदैन। इन्टरनेट बन्द गरेर पनि तपाईंले यो प्रक्रिया देख्न सक्नुहुन्छ।',
  Evidence: 'प्रमाण', 'Two paths, handled differently.': 'दुई मार्ग, फरक तरिकाले व्यवस्थापन', 'Conversation screenshots': 'कुराकानीका स्क्रिनसट', 'Threats, usernames, timestamps, payment demands. Saved in this browser, never uploaded.': 'धम्की, प्रयोगकर्ता नाम, समय र पैसाका माग। यही ब्राउजरमा सुरक्षित, कहिल्यै अपलोड हुँदैन।', 'The private image': 'निजी तस्बिर', 'Hashed on your device. Never displayed, never stored, never sent.': 'तपाईंको उपकरणमै ह्यास गरिन्छ। देखाइँदैन, भण्डारण हुँदैन, पठाइँदैन।', Report: 'प्रतिवेदन', 'A complaint you can actually file.': 'तपाईंले वास्तवमै दर्ता गर्न सक्ने उजुरी', 'Built from the answers you tapped — incident summary, timeline, platform, threat type, financial demand, evidence held, and the action requested.': 'तपाईंले दिएका जवाफबाट तयार हुन्छ—घटनाको सारांश, समयरेखा, प्लेटफर्म, धम्कीको प्रकार, आर्थिक माग, उपलब्ध प्रमाण र अनुरोध गरिएको कारबाही।', 'Fully editable before anything is sent': 'केही पठाउनुअघि पूर्ण रूपमा सम्पादन गर्न मिल्ने', 'Nothing is submitted automatically': 'कुनै कुरा स्वचालित रूपमा पठाइँदैन', 'Prints as a clean A4 document': 'सफा A4 कागजातका रूपमा प्रिन्ट गर्न मिल्ने',
  'Help is free. The paperwork is NPR 5.': 'सहायता निःशुल्क छ। कागजी प्रतिवेदनको शुल्क रु. ५ हो।', 'Emergency response': 'आपत्कालीन प्रतिक्रिया', Free: 'निःशुल्क', 'Full guided response flow': 'पूर्ण मार्गदर्शित प्रतिक्रिया प्रक्रिया', 'Tailored do and do-not guidance': 'के गर्ने र के नगर्ने मिलाइएको मार्गदर्शन', 'Evidence tools and local image hashing': 'प्रमाण उपकरण र स्थानीय तस्बिर ह्यासिङ', 'Every official resource and hotline': 'सबै आधिकारिक स्रोत र हटलाइन', 'Formal report': 'औपचारिक प्रतिवेदन', 'Structured cybercrime complaint': 'व्यवस्थित साइबर अपराध उजुरी', 'Reviewable and fully editable': 'समीक्षा तथा पूर्ण सम्पादन गर्न मिल्ने', 'PDF export': 'PDF निर्यात', 'Evidence summary with fingerprints': 'फिंगरप्रिन्टसहित प्रमाण सारांश', 'Demo payment — no real gateway': 'डेमो भुक्तानी—वास्तविक गेटवे होइन', 'Emergency resources remain free. The fee only applies to the optional report.': 'आपत्कालीन स्रोतहरू निःशुल्क नै रहन्छन्। शुल्क वैकल्पिक प्रतिवेदनमा मात्र लाग्छ।',
  'Straight answers.': 'सीधा जवाफ।', 'Do you upload my intimate image?': 'के तपाईं मेरो निजी तस्बिर अपलोड गर्नुहुन्छ?', 'No. If you choose to fingerprint one, your browser reads it, computes a SHA-256 hash on your device, and clears the file. The image is never uploaded, stored, or sent to any AI model. We never even display it back to you.': 'हुँदैन। फिंगरप्रिन्ट बनाउन रोज्नुभयो भने ब्राउजरले तस्बिर पढेर उपकरणमै SHA-256 ह्यास गणना गर्छ र फाइल हटाउँछ। तस्बिर कहिल्यै अपलोड, भण्डारण वा कुनै एआई मोडेलमा पठाइँदैन। हामी यसलाई तपाईंलाई फेरि देखाउँदैनौँ।', 'What does the hash actually do?': 'ह्यासले वास्तवमा के गर्छ?', 'Does Kawach file the report for me?': 'के कवचले मेरो तर्फबाट प्रतिवेदन दर्ता गर्छ?', 'What if someone under 18 is involved?': 'यदि १८ वर्षमुनिका व्यक्ति संलग्न छन् भने?', 'Does it work without internet?': 'के यो इन्टरनेटबिना चल्छ?', 'Do I have to pay to get help?': 'सहायता पाउन के मैले पैसा तिर्नुपर्छ?', 'You can start now, and stop whenever you want.': 'तपाईं अहिले सुरु गर्न र चाहेको बेला रोक्न सक्नुहुन्छ।', 'No account, no typing, no explanation required. Just tap through what happened.': 'खाता, टाइप वा स्पष्टीकरण आवश्यक पर्दैन। के भयो भन्ने कुरा थिच्दै अघि बढ्नुहोस्।', 'Just show me the hotlines': 'मलाई हटलाइनहरू मात्र देखाउनुहोस्', Footer: 'फुटर', Product: 'उत्पादन', Help: 'सहायता', Response: 'प्रतिक्रिया', Resources: 'स्रोतहरू', 'Police · 100': 'प्रहरी · १००', 'A digital safety response kit for Nepal. Built as a hackathon prototype — not a substitute for the Cyber Bureau, a lawyer, or a counsellor.': 'नेपालका लागि डिजिटल सुरक्षा सहायता किट। ह्याकाथनको नमुना—साइबर ब्युरो, कानुन व्यवसायी वा परामर्शदाताको विकल्प होइन।', 'Payments shown in this build are simulated. No real transaction occurs.': 'यस नमुनामा देखाइएका भुक्तानीहरू सिमुलेटेड हुन्। कुनै वास्तविक कारोबार हुँदैन।', 'Verify all hotline numbers before relying on them.': 'भरोसा गर्नुअघि सबै हटलाइन नम्बरहरू जाँच गर्नुहोस्।',
};

function useLandingCopy() {
  const { language } = useLanguage();
  return (english: string) => language === 'ne' ? NEPALI_COPY[english] ?? english : english;
}

/* ==========================================================================
   The landing page reads as a presentation: one idea per full-height
   slide, each revealing as it scrolls into view, with a dot rail on the
   right. Scrolling stays the user's — snap is "proximity" only, never
   mandatory, so nobody is ever held on a slide.
   ========================================================================== */

const SLIDES = [
  { id: 'hero', label: 'Welcome' },
  { id: 'help', label: 'Immediate help' },
  { id: 'how', label: 'How it works' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'paths', label: 'Evidence and report' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'Questions' },
  { id: 'start', label: 'Start' },
];

/** Section chrome stays static; only the content inside glides in. */
function Slide({
  id,
  className = '',
  innerClassName = '',
  children,
}: {
  id: string;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`k-snap-slide relative ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={innerClassName}
      >
        {children}
      </motion.div>
    </section>
  );
}

function SlideDots() {
  const c = useLandingCopy();
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // A slide is "current" when it crosses the middle band of the screen.
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    for (const slide of SLIDES) {
      const el = document.getElementById(slide.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label={c('Slides')}
      className="k-no-print fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-2.5 lg:flex"
    >
      {SLIDES.map((s) => (
        <button
          key={s.id}
          type="button"
          title={c(s.label)}
          aria-label={`${c('Go to ')}${c(s.label)}`}
          aria-current={active === s.id ? 'true' : undefined}
          onClick={() => document.getElementById(s.id)?.scrollIntoView()}
          className={`w-2 rounded-full transition-all duration-300 ${
            active === s.id ? 'h-7 bg-brand' : 'h-2 bg-ink-3/40 hover:bg-ink-3'
          }`}
        />
      ))}
    </nav>
  );
}

/* ==========================================================================
   Slide 1 — Hero
   The product preview IS the illustration. No stock graphics, no 3D, no
   abstract "AI" imagery — we show the actual interface.
   ========================================================================== */

function Hero() {
  const c = useLandingCopy();
  return (
    <section
      id="hero"
      className="hero-stage k-snap-slide relative flex min-h-[92svh] items-center overflow-hidden bg-canvas"
    >
      <div className="mx-auto w-full max-w-[1120px] items-center gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:grid-cols-[1.05fr_.95fr] lg:gap-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="mt-4 text-[40px] font-bold leading-[1.08] sm:text-[54px]">
              {c('Take the next')}
              <br />
              {c('right step.')}
            </h1>

            <p className="mt-5 max-w-lg text-[16.5px] leading-relaxed text-ink-2">
              {c('Kawach guides you through sextortion and intimate-image threats — helping you preserve evidence, prepare a report, and reach the right support without uploading your private images.')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link to="/response" className="w-full sm:w-[220px]">
              <Button size="lg" fullWidth className="h-[64px] px-5" iconRight={<ArrowRight size={18} />}>
                {c('I Need Help Now')}
              </Button>
            </Link>
            <a href="#how" className="w-full sm:w-[220px]">
              <Button variant="secondary" size="lg" fullWidth className="h-[64px] px-5">
                {c('See How It Works')}
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5"
          >
            {['Free to use', 'No account needed', 'Works offline'].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink-3">
                <Check size={14} strokeWidth={3} className="text-safe-bright" />
                {c(t)}
              </span>
            ))}
          </motion.div>
        </div>

        {/* --- Reference portrait and product preview --- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex min-h-[470px] flex-col justify-end lg:min-h-[510px]"
        >
          <img
            src="/woman-cutout.png"
            alt=""
            aria-hidden="true"
            className="hero-portrait absolute bottom-16 right-[2%] z-0 h-[390px] w-[430px] max-w-[92%] object-cover object-top lg:bottom-24 lg:right-[3%] lg:h-[500px] lg:w-[510px]"
          />
          <div className="relative z-10 mt-auto w-full translate-y-6 rounded-xl border border-line-strong bg-surface/95 p-5 shadow-high backdrop-blur-xl sm:p-6 lg:left-0 lg:w-full lg:translate-y-10 xl:left-0 xl:w-[120%] xl:translate-y-28">
            <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
              <Wordmark size={22} />
              <span className="k-label text-ink-3">{c('Step 1 of 6')}</span>
            </div>
            <div className="space-y-3.5">
              <div className="flex min-h-[84px] flex-col justify-center rounded-lg border border-line bg-surface-2 px-4 py-3.5">
                <p className="text-[15px] font-semibold leading-snug text-ink">{c("You're not alone. Let's take this one step at a time.")}</p>
                <p className="mt-1.5 text-[13.5px] text-ink-2">{c('What best describes what is happening?')}</p>
              </div>
              {['Someone is threatening me', 'My image has already been shared', 'They are demanding money'].map((label, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.35 + i * 0.09 }}
                  className="flex h-[58px] min-w-0 items-center justify-between gap-3 overflow-hidden rounded-md border border-line-strong bg-canvas px-4 py-3 text-[14.5px] font-semibold text-ink"
                >
                  <span className="min-w-0 flex-1 overflow-hidden text-left leading-snug">{c(label)}</span>
                  <ArrowRight size={16} className="shrink-0 text-[#4cc9b2]" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ==========================================================================
   Slide 2 — Immediate help
   ========================================================================== */

function ImmediateHelp() {
  const c = useLandingCopy();
  const items = [
    {
      icon: MessageSquare,
      title: 'Stop engaging',
      body: 'You do not owe them a reply. Do not send more images, and do not pay — it rarely stops the demands.',
    },
    {
      icon: Fingerprint,
      title: 'Keep the evidence',
      body: 'Screenshot the conversation before you block or report. Lock your accounts down, but do not delete the thread.',
    },
    {
      icon: Phone,
      title: 'Reach official help',
      body: 'The Cyber Bureau handles this. Child Helpline 1098 and the Women Commission 1145 are free.',
    },
  ];

  return (
    <Slide id="help" className="border-t border-line bg-surface/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionLabel labeled>{c('If this is happening right now')}</SectionLabel>
        <h2 className="mt-3 max-w-xl text-[32px] font-bold sm:text-[38px]">
          {c('Three things that help immediately.')}
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="shadow-low">
                <Icon size={20} className="mb-3.5 text-brand-bright" aria-hidden="true" />
                <h3 className="font-sans text-[16px] font-bold">{c(item.title)}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{c(item.body)}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </Slide>
  );
}

/* ==========================================================================
   Slide 3 — How it works
   ========================================================================== */

function HowItWorks() {
  const c = useLandingCopy();
  const steps = [
    { title: 'Answer by tapping', body: 'No typing. One question at a time, with a Back button that always works.' },
    { title: 'Get tailored steps', body: 'Clear do and do-not guidance for your exact situation.' },
    { title: 'Preserve evidence', body: 'Save conversation screenshots. Fingerprint the image without uploading it.' },
    { title: 'Review and file', body: 'A structured complaint you can edit, print, or email yourself.' },
  ];

  return (
    <Slide id="how" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionLabel labeled>{c('How Kawach works')}</SectionLabel>
        <h2 className="mt-3 max-w-xl text-[32px] font-bold sm:text-[38px]">
          {c('Four steps, and you can stop at any point.')}
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Card key={s.title} className="shadow-low">
              <span className="mb-3.5 flex h-8 w-8 items-center justify-center rounded-full border border-brand/35 bg-brand/10 font-sans text-[13px] font-bold text-brand-bright">
                {i + 1}
              </span>
              <h3 className="font-sans text-[15.5px] font-bold">{c(s.title)}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{c(s.body)}</p>
            </Card>
          ))}
        </div>
      </div>
    </Slide>
  );
}

/* ==========================================================================
   Slide 4 — Privacy architecture
   ========================================================================== */

function PrivacyArchitecture() {
  const c = useLandingCopy();
  const flow = [
    { label: 'Device only', icon: Lock },
    { label: 'SHA-256', icon: Fingerprint },
    { label: 'Hash string', icon: ShieldCheck },
    { label: 'Image discarded', icon: ImageOff },
  ];

  return (
    <Slide id="privacy" className="border-t border-line bg-surface/60">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
        <div>
          <SectionLabel labeled>{c('Privacy architecture')}</SectionLabel>
          <h2 className="mt-3 text-[32px] font-bold sm:text-[38px]">
            {c('Your image never leaves this device.')}
          </h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-2">
            {c('If you choose to fingerprint an image, your browser reads it, computes a SHA-256 hash locally, and clears the file. The image is never uploaded, never written to storage, and never sent to any AI model.')}
          </p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <TrustIndicator labeled label={c('Image')} value={c('Never uploaded')} tone="safe" />
            <TrustIndicator labeled label={c('AI')} value={c('Never receives image')} tone="safe" />
            <TrustIndicator labeled label={c('Storage')} value={c('No intimate image stored')} tone="safe" />
            <TrustIndicator labeled label={c('Hash')} value={c('Only fingerprint retained')} tone="safe" />
          </div>

          <div className="mt-7">
            <InfoNote>
              A SHA-256 fingerprint proves a file existed unaltered at a given time. It is
              not a takedown request — StopNCII and Take It Down handle matching with
              their own perceptual hashing, and we link you to them directly.
            </InfoNote>
          </div>

          <Link to="/privacy" className="mt-6 inline-block">
            <Button variant="secondary" iconRight={<ArrowRight size={16} />}>
              {c('How Kawach Protects You')}
            </Button>
          </Link>
        </div>

        <Card tone="safe" className="shadow-mid lg:justify-self-end lg:max-w-md">
          <SectionLabel labeled className="text-safe-bright">{c('The full data path')}</SectionLabel>
          <div className="mt-5 space-y-2.5">
            {flow.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={f.label}>
                  <div className="flex items-center gap-3 rounded-md border border-safe/25 bg-safe/[0.08] px-4 py-3.5">
                    <Icon size={17} className="shrink-0 text-safe-bright" aria-hidden="true" />
                    <span className="font-sans text-[14.5px] font-bold text-safe-bright">
                      {c(f.label)}
                    </span>
                  </div>
                  {i < flow.length - 1 && (
                    <div className="flex justify-center py-1" aria-hidden="true">
                      <ChevronDown size={15} className="text-safe/60" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-5 border-t border-safe/20 pt-4 text-[13px] leading-relaxed text-ink-2">
            {c('Nothing in this diagram involves a network request. You can watch it happen with your connection turned off.')}
          </p>
        </Card>
      </div>
    </Slide>
  );
}

/* ==========================================================================
   Slide 5 — Evidence + Report
   ========================================================================== */

function EvidenceAndReport() {
  const c = useLandingCopy();
  return (
    <Slide id="paths" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-low">
            <Pill tone="brand">{c('Evidence')}</Pill>
            <h3 className="mt-4 text-[22px] font-bold">{c('Two paths, handled differently.')}</h3>
            <div className="mt-5 space-y-4">
              <div className="rounded-md border border-line bg-canvas px-4 py-3.5">
                <p className="font-sans text-[14.5px] font-bold">{c('Conversation screenshots')}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">
                  {c('Threats, usernames, timestamps, payment demands. Saved in this browser, never uploaded.')}
                </p>
              </div>
              <div className="rounded-md border border-safe/25 bg-safe/[0.07] px-4 py-3.5">
                <p className="font-sans text-[14.5px] font-bold text-safe-bright">{c('The private image')}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">
                  {c('Hashed on your device. Never displayed, never stored, never sent.')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-low">
            <Pill tone="brand">{c('Report')}</Pill>
            <h3 className="mt-4 text-[22px] font-bold">{c('A complaint you can actually file.')}</h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">
              {c('Built from the answers you tapped — incident summary, timeline, platform, threat type, financial demand, evidence held, and the action requested.')}
            </p>
            <ul className="mt-4 space-y-2">
              {[
                'Fully editable before anything is sent',
                'Nothing is submitted automatically',
                'Prints as a clean A4 document',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[14px] text-ink-2">
                  <Check size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-safe-bright" />
                  {c(t)}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </Slide>
  );
}

/* ==========================================================================
   Slide 6 — Pricing
   ========================================================================== */

function Pricing() {
  const c = useLandingCopy();
  return (
    <Slide id="pricing" className="border-t border-line bg-surface/60">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionLabel labeled>{c('Pricing')}</SectionLabel>
        <h2 className="mt-3 max-w-xl text-[32px] font-bold sm:text-[38px]">
          {c('Help is free. The paperwork is NPR 5.')}
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Card className="shadow-low">
            <div className="mb-5 flex items-baseline justify-between">
              <h3 className="font-sans text-lg font-bold">{c('Emergency response')}</h3>
              <span className="font-display text-2xl font-bold text-safe-bright">{c('Free')}</span>
            </div>
            <ul className="space-y-2.5">
              {[
                'Full guided response flow',
                'Tailored do and do-not guidance',
                'Evidence tools and local image hashing',
                'Every official resource and hotline',
                'Works offline',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[14.5px] text-ink-2">
                  <Check size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-safe-bright" />
                  {c(t)}
                </li>
              ))}
            </ul>
          </Card>

          <Card tone="brand" className="shadow-low">
            <div className="mb-5 flex items-baseline justify-between">
              <h3 className="font-sans text-lg font-bold">{c('Formal report')}</h3>
              <span className="font-display text-2xl font-bold">NPR 5</span>
            </div>
            <ul className="space-y-2.5">
              {[
                'Structured cybercrime complaint',
                'Reviewable and fully editable',
                'PDF export',
                'Evidence summary with fingerprints',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[14.5px] text-ink-2">
                  <Check size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-brand-bright" />
                  {c(t)}
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <Pill tone="caution">{c('Demo payment — no real gateway')}</Pill>
            </div>
          </Card>
        </div>

        <p className="mt-6 text-center text-[14px] font-semibold text-safe-bright">
          {c('Emergency resources remain free. The fee only applies to the optional report.')}
        </p>
      </div>
    </Slide>
  );
}

/* ==========================================================================
   Slide 7 — FAQ
   ========================================================================== */

function Faq() {
  const c = useLandingCopy();
  const [open, setOpen] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do you upload my intimate image?',
      a: 'No. If you choose to fingerprint one, your browser reads it, computes a SHA-256 hash on your device, and clears the file. The image is never uploaded, stored, or sent to any AI model. We never even display it back to you.',
    },
    {
      q: 'What does the hash actually do?',
      a: 'It proves a specific file existed, unaltered, at a specific time — useful tamper-evidence for your complaint. It does not find copies online. SHA-256 changes completely if a single pixel changes, so matching re-encoded copies needs perceptual hashing, which StopNCII and Take It Down do inside their own flows.',
    },
    {
      q: 'Does Kawach file the report for me?',
      a: 'No, and we would not claim to. There is no public API for filing with the Cyber Bureau. Kawach drafts the complaint and gives you the portal, email, and phone number so you can file it yourself.',
    },
    {
      q: 'What if someone under 18 is involved?',
      a: 'Kawach will not ask you to open that file at all — the image hashing step is removed entirely. You are routed to NCMEC Take It Down and Child Helpline 1098, which are built for exactly this.',
    },
    {
      q: 'Does it work without internet?',
      a: 'Yes. Install it once and the whole flow works offline, including generating your report from a local template.',
    },
    {
      q: 'Do I have to pay to get help?',
      a: 'No. Every piece of guidance, the evidence tools, and all official contacts are free. The NPR 5 fee only covers generating the formal written complaint.',
    },
  ];

  return (
    <Slide id="faq" className="border-t border-line">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionLabel labeled>{c('Questions')}</SectionLabel>
        <h2 className="mt-3 text-[32px] font-bold sm:text-[38px]">{c('Straight answers.')}</h2>

        <div className="mt-8 space-y-2.5">
          {faqs.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-lg border border-line bg-surface shadow-low">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex min-h-[60px] w-full items-center justify-between gap-4 px-5 py-4 text-left font-sans text-[15px] font-semibold transition-colors hover:bg-surface-2"
              >
                {c(f.q)}
                <ChevronDown
                  size={17}
                  className={`shrink-0 text-ink-3 transition-transform duration-200 ${
                    open === i ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              {open === i && (
                <p className="border-t border-line px-5 py-4 text-[14.5px] leading-relaxed text-ink-2">
                  {c(f.a)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}

/* ==========================================================================
   Slide 8 — Final CTA, then the footer
   ========================================================================== */

function FinalCta() {
  const c = useLandingCopy();
  return (
    <Slide
      id="start"
      className="border-t border-line"
      innerClassName="flex min-h-[72svh] items-center"
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24">
        <h2 className="text-[34px] font-bold leading-tight sm:text-[44px]">
          {c('You can start now, and stop whenever you want.')}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[15.5px] leading-relaxed text-ink-2">
          {c('No account, no typing, no explanation required. Just tap through what happened.')}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/response">
            <Button size="lg" iconRight={<ArrowRight size={18} />}>
              {c('I Need Help Now')}
            </Button>
          </Link>
          <Link to="/resources">
            <Button variant="secondary" size="lg">
              {c('Just show me the hotlines')}
            </Button>
          </Link>
        </div>
      </div>
    </Slide>
  );
}

function Footer() {
  const c = useLandingCopy();
  return (
    <footer className="border-t border-line bg-surface/70">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="max-w-sm">
            <Wordmark size={22} />
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-3">
              {c('A digital safety response kit for Nepal. Built as a hackathon prototype — not a substitute for the Cyber Bureau, a lawyer, or a counsellor.')}
            </p>
          </div>

          <nav className="flex gap-10" aria-label={c('Footer')}>
            <div>
              <p className="k-label mb-2.5 font-sans">{c('Product')}</p>
              <ul className="space-y-2 text-[13.5px]">
                <li><Link to="/response" className="font-medium text-ink-2 transition-colors hover:text-ink">{c('Response')}</Link></li>
                <li><Link to="/evidence" className="font-medium text-ink-2 transition-colors hover:text-ink">{c('Evidence')}</Link></li>
                <li><Link to="/report" className="font-medium text-ink-2 transition-colors hover:text-ink">{c('Report')}</Link></li>
              </ul>
            </div>
            <div>
              <p className="k-label mb-2.5 font-sans">{c('Help')}</p>
              <ul className="space-y-2 text-[13.5px]">
                <li><Link to="/resources" className="font-medium text-ink-2 transition-colors hover:text-ink">{c('Resources')}</Link></li>
                <li><Link to="/privacy" className="font-medium text-ink-2 transition-colors hover:text-ink">{c('Privacy')}</Link></li>
                <li><a href="tel:100" className="font-medium text-ink-2 transition-colors hover:text-ink">{c('Police · 100')}</a></li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-line pt-6 text-[12.5px] text-ink-3 sm:flex-row sm:justify-between">
          <p>{c('Payments shown in this build are simulated. No real transaction occurs.')}</p>
          <p>{c('Verify all hotline numbers before relying on them.')}</p>
        </div>
      </div>
    </footer>
  );
}

/* ========================================================================== */

export function LandingPage() {
  // Snap-scroll belongs to the presentation only — other pages scroll free.
  useEffect(() => {
    document.documentElement.classList.add('k-snap-page');
    return () => document.documentElement.classList.remove('k-snap-page');
  }, []);

  return (
    <>
      <SlideDots />
      <Hero />
      <ImmediateHelp />
      <HowItWorks />
      <PrivacyArchitecture />
      <EvidenceAndReport />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </>
  );
}
