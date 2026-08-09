# Kavach (कवच)

**A digital safety response kit for sextortion and intimate-image abuse in Nepal.**

Kavach guides someone from the moment of panic to a filed complaint. It answers the three questions a victim actually has — *what do I do right now*, *how do I keep proof*, and *who do I tell* — through a tap-only flow that requires no account, no typing, and no explanation of what happened.

Built for Nepal: bilingual English/Nepali throughout, wired to the Nepal Police Cyber Bureau, Child Helpline 1098, and the National Women Commission.

---

## Why this exists

Sextortion victims in Nepal face three compounding problems: they don't know that paying makes it worse, they destroy the evidence by deleting the conversation, and they don't know the Cyber Bureau handles this. Kavach addresses all three in the first sixty seconds of use.

Two rules shape every screen:

- **Lock down, don't delete.** The app never tells anyone to delete the conversation, the account, or the attacker's messages. That is the evidence.
- **Paying is never presented as a solution.** It escalates.

---

## Features

### Guided response flow
A decision-tree conversation that branches on what actually happened — threatened vs. already published, real image vs. suspected deepfake, money demanded or not, attacker known or anonymous. Every answer is a tap. A Back button always works, and the flow can be stopped at any point.

### Tailored action steps
Do / don't checklists generated from the specific situation, not generic advice. Screenshot before blocking. Lock down your accounts. Don't pay. Don't delete the thread.

### Evidence Center
- **Conversation screenshots** — capture the threats, usernames, timestamps, and payment demands that a complaint needs, with a prompt to crop out any intimate content first.
- **Private image fingerprinting** — produces a tamper-evident fingerprint proving a specific file existed unaltered at a specific time. The image is never displayed back, never transmitted, and never sent to any AI model.

### Exposure Scan
A media-reference workflow: add related media, watch a staged scan run across public web indexes, social platforms, and image-hosting sources, then review the resulting reference cards. Findings can be selected for review, and each one links straight to the correct platform's non-consensual-imagery report form. Result imagery is censored by default.

### Report generation
A structured cybercrime complaint assembled from the answers already given — incident summary, timeline, platform, threat type, financial demand, evidence held, and the action requested. Fully editable before it goes anywhere. Exports as a clean A4 print/PDF document with an evidence fingerprint appendix.

### Report review panel
An administrative workspace at `/admin` for triaging incoming reports:
- Status dashboard — pending, verified, rejected, total
- Search across case IDs and report text
- Full report inspection with evidence summary and metadata
- Verification checks on each submission
- Verify / reject / return-to-pending transitions
- Record management
- Handoff to the official Cyber Bureau complaint form once a report is verified

### Official resource directory
Every number and portal a victim needs, grouped by purpose and marked with a verification date so nothing unconfirmed is presented as trustworthy:

| Service | Contact |
|---|---|
| Nepal Police | 100 |
| Cyber Bureau (toll free) | 166-001-41516 |
| Cyber Bureau hotline | +977 9851286770 |
| National Women Commission | 1145 |
| Child Helpline | 1098 |
| Mental Health Helpline | 1166 |
| Cyber Bureau online complaint | cyberbureau.nepalpolice.gov.np |

Plus direct deep links to the NCII report forms for Facebook, Instagram, WhatsApp, Viber, TikTok, Telegram, and Snapchat.

### Minor-safety gate
If anyone under 18 is involved, the image-handling path is disabled entirely — the app will not ask a user to open or select that file. The flow routes to NCMEC Take It Down and Child Helpline 1098 instead. The gate is enforced in the engine, not just in content, so no copy change can accidentally re-open it.

### Panic controls
- **Erase everything** — one confirmation wipes all app data. Shared and family devices are a live threat model here; the person being blackmailed may not own the phone they're holding.
- **Quick exit** — leave immediately.
- Neutral app name and icon, so a home screen visible to an abuser gives nothing away.

### Bilingual — English & नेपाली
Every screen, question, checklist, resource, and report template exists in both languages. One tap switches, and the choice persists.

### Works offline
Installable as a PWA. Once installed, the entire response flow — guidance, evidence tools, resource directory, and report generation — works with no connection.

### Accessibility & crisis-state design
- 44px minimum touch targets, sized for one-handed use during panic
- Colour is never the only signal; every state pairs an icon and a word
- Honours the OS reduced-motion setting
- Light and dark themes
- Progress is always visible, so the user knows the process ends

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Routing | react-router-dom |
| Animation | Framer Motion |
| Icons | lucide-react |
| PWA | vite-plugin-pwa (Workbox) |
| Report export | Print stylesheet → PDF |

No third-party CDN. Fonts, icons, and assets are all self-hosted — required for both privacy and offline operation.

---

## Getting started

```bash
git clone git@github.com:Saffy69/kawach.git
cd kawach
npm install
npm run dev
```

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check without emitting |

> Image fingerprinting uses the Web Crypto API, which requires a secure context — `localhost` or HTTPS.

---

## Routes

| Route | Screen |
|---|---|
| `/` | Landing |
| `/response` | Guided response flow |
| `/evidence` | Evidence Center |
| `/scan` | Exposure Scan |
| `/report` | Report generation and review |
| `/resources` | Official resource directory |
| `/privacy` | Privacy explainer |
| `/dashboard` | Case progress |
| `/admin` | Report review panel |

---

## Planned integrations

The following are **designed and scoped but not yet shipped**. They are documented here so the intended architecture is clear.

### Scrapy-based exposure scanning
A Python [Scrapy](https://scrapy.org/) crawler running as a backend service, feeding the Exposure Scan UI that exists today. The intended design:

- Scrapy spiders sweep public web indexes and image-hosting pages
- A perceptual-hash comparison stage matches candidates against the complainant's reference hash
- Only **metadata** — source, platform, timestamp, confidence — returns to the client
- Matched imagery is never fetched into, stored by, or displayed in the app; the UI's censored result cards are the permanent presentation format

The current Exposure Scan screen is the finished client for this service and renders sample reference cards until the crawler is connected.

### StopNCII / NCMEC hash submission
Perceptual-hash (PDQ-family) generation on-device, submitted to StopNCII.org and NCMEC Take It Down so partner platforms can block matching uploads.

Two notes on the current state:

- Kavach's existing fingerprint is **SHA-256** — cryptographic, not perceptual. It proves a file existed unaltered at a point in time, which is what a complaint needs. It cannot match a re-encoded or cropped copy.
- StopNCII and Take It Down perform their own on-device perceptual hashing inside their own flows, and there is no public submission API. Until a supported integration path exists, Kavach links users directly into those official flows rather than claiming to submit on their behalf.

### AI-assisted drafting
A serverless proxy for LLM-assisted complaint drafting, holding the API key server-side. The client already posts structured, enum-only answers — never an image, never free text describing image content — and falls back to a local template whenever the service is unreachable, so the flow never dead-ends. The template path is what ships today.

### Cyber Bureau submission
There is no public API for filing with the Nepal Police Cyber Bureau. Kavach drafts the complaint and hands off to the official portal, email, and phone number. A direct filing integration would require an official partnership.

---

## Roadmap

- [ ] Connect the Scrapy crawler to Exposure Scan
- [ ] On-device PDQ perceptual hashing
- [ ] StopNCII / Take It Down submission, if a supported path becomes available
- [ ] Deploy the drafting proxy
- [ ] Re-verify every hotline number before each release
- [ ] Nepali translation review by a native speaker
- [ ] Expand the decision tree with counsellor input

---

## Contributing

Two things to know before opening a PR:

1. **Never weaken the minor gate.** If a minor is involved, the app does not ask anyone to handle that file. This is enforced in the engine deliberately.
2. **Never present paying as effective, or advise deleting the conversation.** Both actively harm victims.

Hotline numbers carry a verification date. If you add or change one, confirm it first and update the date.

---

## Disclaimer

Kavach is a response toolkit, not a substitute for the Cyber Bureau, a lawyer, or a counsellor. It does not file complaints on anyone's behalf. Verify hotline numbers before relying on them in an emergency.

**If you are in immediate danger, call 100.**
