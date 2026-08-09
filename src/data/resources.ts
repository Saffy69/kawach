import type { Platform, Resource } from '@/types';

/**
 * Verified Nepal resources.
 *
 * `verifiedOn: null` means the contact detail has NOT been confirmed by us.
 * ResourceCard renders that state visibly. A safety app that presents an
 * unconfirmed hotline as verified is worse than one that admits the gap —
 * re-confirm every entry and set the date before demoing.
 */
export const resources: Resource[] = [
  /* --- Emergency ------------------------------------------------------- */
  {
    id: 'police',
    name: 'Nepal Police',
    description: 'Emergency response for immediate physical danger.',
    kind: 'phone',
    value: '100',
    display: '100',
    group: 'emergency',
    availability: '24 hours',
    verifiedOn: '2026-08-08',
  },
  {
    id: 'cyber-tollfree',
    name: 'Cyber Bureau — toll free',
    description: 'Nepal Police Cyber Bureau. Report online blackmail and image abuse.',
    kind: 'phone',
    value: '16600141516',
    display: '166-001-41516',
    group: 'emergency',
    availability: 'Office hours',
    verifiedOn: '2026-08-08',
  },
  {
    id: 'cyber-hotline',
    name: 'Cyber Bureau — hotline',
    description: 'Direct line to the Cyber Bureau duty desk.',
    kind: 'phone',
    value: '+9779851286770',
    display: '+977 9851286770',
    group: 'emergency',
    availability: 'Office hours',
    verifiedOn: '2026-08-08',
  },

  /* --- Crisis support --------------------------------------------------- */
  {
    id: 'mental-health',
    name: 'Mental Health Helpline Nepal',
    description:
      'Free counselling if you are feeling hopeless or having thoughts of harming yourself.',
    kind: 'phone',
    value: '1166',
    display: '1166',
    group: 'crisis',
    availability: 'Check current hours',
    verifiedOn: null,
  },
  {
    id: 'tpo-nepal',
    name: 'TPO Nepal',
    description: 'Psychosocial counselling and mental health support services.',
    kind: 'url',
    value: 'https://tponepal.org',
    display: 'tponepal.org',
    group: 'crisis',
    verifiedOn: null,
  },
  {
    id: 'women-commission',
    name: 'National Women Commission',
    description: 'Support and complaint handling for gender-based violence.',
    kind: 'phone',
    value: '1145',
    display: '1145',
    group: 'crisis',
    availability: '24 hours',
    verifiedOn: '2026-08-08',
  },
  {
    id: 'child-helpline',
    name: 'Child Helpline',
    description: 'Free, confidential help for anyone under 18.',
    kind: 'phone',
    value: '1098',
    display: '1098',
    group: 'crisis',
    availability: '24 hours',
    verifiedOn: '2026-08-08',
  },

  /* --- Reporting -------------------------------------------------------- */
  {
    id: 'cyber-portal',
    name: 'Cyber Bureau — online complaint',
    description: 'File a cybercrime complaint online with the Nepal Police Cyber Bureau.',
    kind: 'url',
    value: 'https://cyberbureau.nepalpolice.gov.np/report-cyber-crime',
    display: 'cyberbureau.nepalpolice.gov.np',
    group: 'reporting',
    verifiedOn: '2026-08-08',
  },
  {
    id: 'cyber-email',
    name: 'Cyber Bureau — email',
    description: 'Send your complaint and attach conversation screenshots.',
    kind: 'email',
    value: 'cyberbureau@nepalpolice.gov.np',
    display: 'cyberbureau@nepalpolice.gov.np',
    group: 'reporting',
    verifiedOn: '2026-08-08',
  },
  {
    id: 'cyber-office',
    name: 'Cyber Bureau — office',
    description: 'Bhotahiti, Kathmandu. Walk in with printed evidence.',
    kind: 'phone',
    value: '015319044',
    display: '01-5319044',
    group: 'reporting',
    availability: 'Office hours',
    verifiedOn: '2026-08-08',
  },

  /* --- Takedown --------------------------------------------------------- */
  {
    id: 'stopncii',
    name: 'StopNCII.org',
    description:
      'For adults. Creates a perceptual hash on your device and shares it with partner platforms so matching images can be blocked. Free.',
    kind: 'url',
    value: 'https://stopncii.org',
    display: 'stopncii.org',
    group: 'takedown',
    verifiedOn: '2026-08-08',
  },
  {
    id: 'takeitdown',
    name: 'NCMEC Take It Down',
    description:
      'For anyone who was under 18 in the image. Same on-device hashing approach. Free.',
    kind: 'url',
    value: 'https://takeitdown.ncmec.org',
    display: 'takeitdown.ncmec.org',
    group: 'takedown',
    verifiedOn: '2026-08-08',
  },
];

export const resourceGroupLabels: Record<Resource['group'], string> = {
  emergency: 'Emergency',
  crisis: 'Crisis & counselling',
  reporting: 'Report the crime',
  takedown: 'Image takedown',
};

/** Deep links to each platform's non-consensual imagery report form. */
export const platformReportUrls: Record<Platform, { label: string; url: string }> = {
  facebook: { label: 'Facebook', url: 'https://www.facebook.com/help/contact/567360146613371' },
  instagram: { label: 'Instagram', url: 'https://help.instagram.com/contact/584460464982589' },
  whatsapp: { label: 'WhatsApp', url: 'https://faq.whatsapp.com/1142481766359885' },
  viber: { label: 'Viber', url: 'https://help.viber.com/en/' },
  tiktok: { label: 'TikTok', url: 'https://www.tiktok.com/legal/report/feedback' },
  telegram: { label: 'Telegram', url: 'https://telegram.org/faq#q-there-39s-illegal-content-on-telegram-how-do-i-take-it-down' },
  snapchat: { label: 'Snapchat', url: 'https://help.snapchat.com/hc/en-us/requests/new' },
  other: { label: 'the platform', url: 'https://stopncii.org' },
};
