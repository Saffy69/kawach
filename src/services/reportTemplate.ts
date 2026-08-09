import type { Language } from '@/components/LanguageContext';
import type { Answers, CaseState } from '@/types';

const PLATFORM_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  viber: 'Viber',
  tiktok: 'TikTok',
  telegram: 'Telegram',
  snapchat: 'Snapchat',
  other: 'an online platform',
};

const CHANNEL_LABELS: Record<string, string> = {
  esewa: 'eSewa',
  khalti: 'Khalti',
  bank: 'bank transfer',
  crypto: 'cryptocurrency',
  gift_card: 'gift cards',
  other: 'an unspecified method',
};

function formatDate(iso: string, language: Language = 'en'): string {
  return new Date(iso).toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function renderNepaliTemplate(answers: Answers, caseState: CaseState): string {
  const platform = answers.platform ? PLATFORM_LABELS[answers.platform] : 'अनलाइन प्लेटफर्म';
  const lines = [
    'नेपाल प्रहरी, साइबर ब्यूरोसमक्ष,',
    '',
    'म अनलाइन यौन दुर्व्यवहार तथा मेरो सहमतिबिना अन्तरङ्ग तस्बिर वितरणको धम्कीसम्बन्धी उजुरी दर्ता गर्न चाहन्छु।',
    '',
    'घटनाको प्रकृति',
    answers.stage === 'published'
      ? `कुनै व्यक्तिले मेरो सहमतिबिना मेरो अन्तरङ्ग तस्बिर प्रकाशित वा वितरण गरेको छ। प्रारम्भिक सम्पर्क ${platform} मा भएको थियो।`
      : `कुनै व्यक्तिले ${platform} मार्फत मलाई सम्पर्क गरी अन्तरङ्ग तस्बिर सार्वजनिक गर्ने धम्की दिएको छ।`,
    '',
    'प्रमाण',
    caseState.screenshotCount > 0
      ? `मसँग कुराकानीका ${caseState.screenshotCount} वटा स्क्रिनसट छन्, जसमा धम्की र खातासम्बन्धी विवरण समावेश छन्।`
      : 'प्रमाण उपलब्ध छ र आवश्यक परेमा पेश गर्न सक्छु।',
    ...(caseState.fingerprints.length > 0
      ? ['मेरो उपकरणमा तयार गरिएका SHA-256 फिंगरप्रिन्टहरू:', ...caseState.fingerprints.map((fp) => `  - ${fp.label}: ${fp.hash} (${formatDate(fp.hashedAt, 'ne')})`)]
      : []),
    '',
    'माग गरिएको कारबाही',
    '१. यो उजुरी दर्ता गरी अनुसन्धान सुरु गरियोस्।',
    '२. जिम्मेवार खाताधनीको पहिचान गर्न आवश्यक कदम चालियोस्।',
    '३. माथि उल्लिखित सामग्री थप वितरण हुन नदिन सहयोग गरियोस्।',
    '',
    `केस सन्दर्भ (स्व-निर्धारित): ${caseState.caseId}`,
    `तयार गरिएको मिति: ${formatDate(new Date().toISOString(), 'ne')}`,
    '',
    'नाम: ______________________________',
    'सम्पर्क नम्बर: _____________________',
    'ठेगाना: ____________________________',
    'हस्ताक्षर: __________________________',
  ];
  return lines.join('\n');
}

/**
 * Deterministic complaint builder.
 *
 * This is the offline path AND the fallback when drafting is unavailable.
 * Less fluent than a model draft, but it always works — which is what keeps
 * the flow from dead-ending on a bad connection.
 *
 * Rules mirrored from the drafting prompt: state only what the user selected,
 * omit absent facts rather than guessing, cite no statute, describe no image
 * content.
 */
export function renderTemplate(answers: Answers, caseState: CaseState, language: Language = 'en'): string {
  if (language === 'ne') return renderNepaliTemplate(answers, caseState);
  const a = answers;
  const platform = a.platform ? PLATFORM_LABELS[a.platform] : 'an online platform';
  const lines: string[] = [];

  lines.push('To the Cyber Bureau, Nepal Police,');
  lines.push('');
  lines.push(
    'I wish to file a complaint regarding online sexual extortion and threatened non-consensual distribution of intimate images.',
  );
  lines.push('');

  /* --- Nature of the incident --- */
  lines.push('NATURE OF THE INCIDENT');
  if (a.stage === 'threatened') {
    lines.push(
      `An individual contacted me on ${platform} and is threatening to publish intimate images of me unless I comply with their demands.`,
    );
  } else if (a.stage === 'published') {
    lines.push(
      `An individual has already published or distributed intimate images of me without my consent. Initial contact took place on ${platform}.`,
    );
  } else if (a.stage === 'demands_only') {
    lines.push(
      `An individual contacted me on ${platform} and has made demands accompanied by threats relating to intimate images.`,
    );
  } else {
    lines.push(
      `An individual contacted me on ${platform} in connection with intimate images and has made threats against me.`,
    );
  }

  if (a.authenticity === 'suspected_deepfake') {
    lines.push(
      'I believe the material is artificially generated or digitally manipulated, and does not depict a real event. It is being used to threaten and coerce me regardless of its authenticity.',
    );
  } else if (a.authenticity === 'unsure') {
    lines.push(
      'I am unable to confirm whether the material is authentic or digitally manipulated.',
    );
  }

  if (a.minorInvolved === 'yes') {
    lines.push(
      'A person under the age of 18 is involved in this matter. I request that this complaint be treated with corresponding priority.',
    );
  }
  lines.push('');

  /* --- Financial demand --- */
  if (a.moneyDemanded) {
    lines.push('FINANCIAL DEMAND');
    const amount = a.amountDemandedNPR
      ? `The sum demanded was approximately NPR ${a.amountDemandedNPR.toLocaleString('en-IN')}.`
      : 'A sum of money was demanded.';
    lines.push(amount);
    if (a.paymentChannel) {
      lines.push(`Payment was requested via ${CHANNEL_LABELS[a.paymentChannel]}.`);
    }
    if (a.paidOrComplied) {
      lines.push(
        'I complied with the demand on at least one occasion. The demands continued afterwards.',
      );
    } else {
      lines.push('I have not complied with the demand.');
    }
    lines.push('');
  }

  /* --- Offender --- */
  lines.push('OFFENDER');
  lines.push(
    a.attackerIdentifier === 'known'
      ? 'The person responsible is known to me. I can provide identifying details to investigators on request.'
      : 'The person responsible is not known to me and contacted me from an account I do not recognise.',
  );
  if (a.contactsThreatened) {
    lines.push(
      'They have additionally threatened to send the material to my family, friends, or workplace.',
    );
  }
  lines.push('');

  /* --- Evidence --- */
  lines.push('EVIDENCE HELD');
  if (caseState.screenshotCount > 0) {
    lines.push(
      `I hold ${caseState.screenshotCount} screenshot(s) of the conversation, including the threats and any account identifiers, which I can supply on request.`,
    );
  }
  if (caseState.fingerprints.length > 0) {
    lines.push(
      'I hold the following SHA-256 cryptographic fingerprints, generated on my own device at the times shown. Each fingerprint establishes that a specific file existed in unaltered form at that time. The files themselves have not been transmitted or published by me.',
    );
    for (const fp of caseState.fingerprints) {
      lines.push(`  - ${fp.label}: ${fp.hash} (recorded ${formatDate(fp.hashedAt)})`);
    }
  }
  if (caseState.screenshotCount === 0 && caseState.fingerprints.length === 0) {
    lines.push('Evidence is available and can be supplied on request.');
  }
  if (a.reportedToPlatform) {
    lines.push(`I have also reported the account to ${platform}.`);
  }
  lines.push('');

  /* --- Request --- */
  lines.push('ACTION REQUESTED');
  lines.push('I request that the Cyber Bureau:');
  lines.push('  1. Register this complaint and open an investigation.');
  lines.push('  2. Take steps to identify the account holder responsible.');
  lines.push(
    '  3. Assist in preventing further distribution of the material described above.',
  );
  lines.push('');
  lines.push(`Case reference (self-assigned): ${caseState.caseId}`);
  lines.push(`Prepared on: ${formatDate(new Date().toISOString())}`);
  lines.push('');
  lines.push('Name: ______________________________');
  lines.push('Contact number: _____________________');
  lines.push('Address: ____________________________');
  lines.push('Signature: __________________________');

  return lines.join('\n');
}
