import type { DecisionTree } from '@/types';

/**
 * The guided response tree.
 *
 * Copy rules, applied throughout:
 *  - Never advise deleting the conversation or the account. That is evidence.
 *  - Never present paying as something that works. It escalates.
 *  - Never blame. "You are not in trouble" appears on the branches where
 *    shame is most likely to keep someone silent.
 *  - One decision per node. Short sentences.
 */
export const decisionTree: DecisionTree = {
  start: 'entry',
  nodes: {
    /* --- Entry ---------------------------------------------------------- */
    entry: {
      id: 'entry',
      type: 'question',
      text: "You're not alone. Let's take this one step at a time.",
      sub: 'What best describes what is happening?',
      options: [
        {
          label: 'Someone is threatening me',
          set: { stage: 'threatened' },
          next: 'q_authenticity',
        },
        {
          label: 'My image has already been shared',
          set: { stage: 'published' },
          next: 'q_authenticity',
        },
        {
          label: 'They are demanding money',
          set: { stage: 'demands_only', moneyDemanded: true },
          next: 'q_authenticity',
        },
        {
          label: "I'm not sure",
          set: { stage: 'unsure' },
          next: 'q_authenticity',
        },
      ],
    },

    /* --- Authenticity --------------------------------------------------- */
    q_authenticity: {
      id: 'q_authenticity',
      type: 'question',
      text: 'Do you think the image or video is real, or made with AI?',
      sub: "Either way, this is reportable. There is no wrong answer here.",
      options: [
        { label: 'It is real', set: { authenticity: 'real' }, next: 'q_platform' },
        {
          label: 'I think it is AI-generated',
          set: { authenticity: 'suspected_deepfake' },
          next: 'q_platform',
        },
        { label: "I'm not sure", set: { authenticity: 'unsure' }, next: 'q_platform' },
      ],
    },

    /* --- Platform ------------------------------------------------------- */
    q_platform: {
      id: 'q_platform',
      type: 'question',
      text: 'Where is this happening?',
      sub: 'Pick the app where they contacted you.',
      options: [
        { label: 'Facebook', set: { platform: 'facebook' }, next: 'q_money' },
        { label: 'Instagram', set: { platform: 'instagram' }, next: 'q_money' },
        { label: 'WhatsApp', set: { platform: 'whatsapp' }, next: 'q_money' },
        { label: 'Viber', set: { platform: 'viber' }, next: 'q_money' },
        { label: 'TikTok', set: { platform: 'tiktok' }, next: 'q_money' },
        { label: 'Telegram', set: { platform: 'telegram' }, next: 'q_money' },
        { label: 'Snapchat', set: { platform: 'snapchat' }, next: 'q_money' },
        { label: 'Somewhere else', set: { platform: 'other' }, next: 'q_money' },
      ],
    },

    /* --- Money ---------------------------------------------------------- */
    q_money: {
      id: 'q_money',
      type: 'question',
      text: 'Has anyone asked you for money?',
      options: [
        { label: 'Yes', set: { moneyDemanded: true }, next: 'q_paid' },
        { label: 'No', set: { moneyDemanded: false }, next: 'q_known' },
      ],
    },

    q_paid: {
      id: 'q_paid',
      type: 'question',
      text: 'Have you already sent money or more images?',
      sub: 'Answer honestly. This changes the advice, and you are not in trouble.',
      options: [
        { label: 'Yes, I have', set: { paidOrComplied: true }, next: 'info_paid' },
        { label: 'No, not yet', set: { paidOrComplied: false }, next: 'q_channel' },
      ],
    },

    info_paid: {
      id: 'info_paid',
      type: 'info',
      text: 'Thank you for telling me. This happens to a lot of people, and it is not your fault.',
      sub: 'Paying almost never stops the demands — they usually continue. From here, the safest move is to stop paying and start documenting. That is what we will do next.',
      crisis: true,
      next: 'q_channel',
    },

    q_channel: {
      id: 'q_channel',
      type: 'question',
      text: 'How did they ask you to pay?',
      sub: 'This helps investigators trace the account.',
      options: [
        { label: 'eSewa', set: { paymentChannel: 'esewa' }, next: 'q_known' },
        { label: 'Khalti', set: { paymentChannel: 'khalti' }, next: 'q_known' },
        { label: 'Bank transfer', set: { paymentChannel: 'bank' }, next: 'q_known' },
        { label: 'Crypto', set: { paymentChannel: 'crypto' }, next: 'q_known' },
        { label: 'Gift cards', set: { paymentChannel: 'gift_card' }, next: 'q_known' },
        { label: 'Another way', set: { paymentChannel: 'other' }, next: 'q_known' },
      ],
    },

    /* --- Attacker ------------------------------------------------------- */
    q_known: {
      id: 'q_known',
      type: 'question',
      text: 'Do you know who this person is?',
      options: [
        {
          label: 'Yes, I know them',
          set: { attackerIdentifier: 'known' },
          next: 'q_contacts',
        },
        {
          label: 'No, a stranger',
          set: { attackerIdentifier: 'unknown' },
          next: 'q_contacts',
        },
      ],
    },

    q_contacts: {
      id: 'q_contacts',
      type: 'question',
      text: 'Have they threatened to send it to your family, friends, or workplace?',
      options: [
        { label: 'Yes', set: { contactsThreatened: true }, next: 'q_minor' },
        { label: 'No', set: { contactsThreatened: false }, next: 'q_minor' },
      ],
    },

    /* --- Minor gate ----------------------------------------------------- */
    q_minor: {
      id: 'q_minor',
      type: 'question',
      text: 'Is anyone under 18 involved — you, or someone you know?',
      sub: 'This changes which service can help fastest.',
      options: [
        { label: 'Yes', set: { minorInvolved: 'yes' }, next: 'minor_path' },
        { label: 'No', set: { minorInvolved: 'no' }, next: 'actions_now' },
        {
          label: 'Prefer not to say',
          set: { minorInvolved: 'undisclosed' },
          next: 'actions_now',
        },
      ],
    },

    minor_path: {
      id: 'minor_path',
      type: 'checklist',
      text: 'There is a service built specifically for this, and it works faster.',
      sub: 'You are not in trouble. Reporting this is the right thing to do.',
      crisis: true,
      items: [
        {
          kind: 'do',
          text: 'Use NCMEC Take It Down',
          detail:
            'Free, for anyone who was under 18 in the image. It works without you ever sending the image to anyone.',
        },
        {
          kind: 'do',
          text: 'Call Child Helpline 1098',
          detail: 'Free and confidential, available across Nepal.',
        },
        {
          kind: 'do',
          text: 'Tell one adult you trust',
          detail: 'A parent, teacher, or relative. You should not carry this alone.',
        },
        {
          kind: 'do',
          text: 'Keep the messages',
          detail: 'Do not delete the chat or block the account yet — it is evidence.',
        },
        {
          kind: 'dont',
          text: 'Do not send any more images',
          detail: 'Not even to prove anything. It will be used against you.',
        },
        {
          kind: 'dont',
          text: 'Do not pay',
          detail: 'Payment does not stop the demands.',
        },
      ],
      next: 'minor_end',
    },

    minor_end: {
      id: 'minor_end',
      type: 'action',
      text: 'Let me take you to those services now.',
      sub: 'You can still save screenshots of the conversation as evidence.',
      action: 'resources',
    },

    /* --- Immediate actions ---------------------------------------------- */
    actions_now: {
      id: 'actions_now',
      type: 'checklist',
      text: 'Here is what to do right now.',
      sub: 'Five things. None of them require you to reply to that person.',
      items: [
        {
          kind: 'dont',
          text: 'Stop replying to them',
          detail:
            'You do not owe them an answer. Silence is not agreement, and it removes their leverage.',
        },
        {
          kind: 'dont',
          text: 'Do not send more images',
          detail: 'Not even to negotiate. Every extra image becomes more leverage.',
        },
        {
          kind: 'dont',
          text: 'Do not pay',
          detail:
            'Paying usually leads to more demands, not fewer. If money has already been sent, report it through official channels.',
        },
        {
          kind: 'do',
          text: 'Keep everything — do not delete',
          detail:
            'Do not delete the chat, block, or report the account yet. Screenshot it first. That conversation is your evidence.',
        },
        {
          kind: 'do',
          text: 'Lock down your accounts',
          detail:
            'Set profiles to private and turn on two-factor authentication. Lock down, do not delete.',
        },
      ],
      next: 'ask_evidence',
    },

    ask_evidence: {
      id: 'ask_evidence',
      type: 'question',
      text: 'Want to document this now, while it is fresh?',
      sub: 'It takes about two minutes. Your private image never leaves this device.',
      options: [
        { label: 'Yes, let us document it', next: 'go_evidence' },
        { label: 'Show me official help instead', next: 'go_resources' },
      ],
    },

    go_evidence: {
      id: 'go_evidence',
      type: 'action',
      text: 'Opening the Evidence Center.',
      action: 'evidence',
    },

    go_resources: {
      id: 'go_resources',
      type: 'action',
      text: 'Here are the official services that can help.',
      action: 'resources',
    },
  },
};
