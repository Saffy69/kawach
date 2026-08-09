# Kavach — Build Context

**Sextortion & deepfake blackmail response kit for Nepal.** Guided, button-driven chat that takes a victim from panic to a filed complaint, builds a legally usable evidence record, and never lets an explicit image leave the device.

This file is the single source of truth. If an instruction conflicts with this doc, raise the conflict before building.

---

## 0. Four invariants — never break these

1. **The explicit image is never stored, never uploaded, never sent to any model.** It is hashed in-browser and the bytes are dropped. Any code path that puts image bytes into React state, storage, or a network body is a bug.
2. **No free-text required to advance.** Every step is a tap. Free text exists in exactly one place: editing the drafted complaint.
3. **AI drafts, human sends.** Nothing is transmitted to any authority without an explicit tap on a screen showing the full final text.
4. **No accounts, no user DB, no analytics, no third-party CDN.** Only two outbound calls exist: the drafting proxy (text only) and whatever the user explicitly opens in a new tab.

Also non-negotiable, and worth stating because the flow can go wrong quietly:

5. **Never advise deleting the conversation, the account, or the attacker's messages.** That is the evidence. Lock down, don't delete.
6. **Never present paying as an option that works.** It escalates.

---

## 1. Three corrections to the original spec

These change the architecture, so they come before anything else.

### 1.1 The Anthropic call cannot run in the browser

The spec's `draftReport.js` calls `api.anthropic.com` directly from client JS with no auth header. That fails three ways: the request needs `x-api-key` and `anthropic-version`; browser origins are blocked by CORS unless explicitly opted in; and any key in a Vite bundle is public the moment you deploy.

**Resolution:** a single serverless function (`/api/draft`) holds the key in an env var and proxies the call. The client posts structured answers to your own origin. See §7.

### 1.2 There is no public StopNCII hash-submission API, and SHA-256 is the wrong hash for takedowns

StopNCII and NCMEC Take It Down both use **perceptual** hashing (PDQ-family), which produces similar hashes for visually similar images so a re-encoded or lightly cropped copy still matches. SHA-256 is cryptographic: flip one pixel and the hash is completely unrelated. It cannot match content. Their submission also runs through their own client-side hashing in their own flow — there is no free open REST endpoint to POST a hash to.

**Resolution — do not fake an integration.** A judge who knows this will catch it, and the honest version is stronger:

- **SHA-256 = tamper-evident evidence fingerprint.** It proves the file the user holds later is byte-identical to the file that existed at the recorded timestamp. That is genuinely useful in a complaint and it is what we claim.
- **StopNCII / Take It Down = deep-link handoff.** One tap opens their official flow in a new tab, with on-screen copy explaining that their system hashes on-device too. We route users to real infrastructure instead of pretending to wrap it.
- If time remains at the end, a WASM PDQ implementation could be evaluated — but treat it as stretch, not scope, and never ship a claim that our hash was submitted to their database.

Rename `api/stopNCII.js` → `api/takedownHandoff.js`. It builds URLs and copy; it makes no network call.

### 1.3 The minor branch must hard-block image handling

The spec asks whether a minor is involved and then still offers the image-hashing step. If a minor is involved, asking the user to select that file is asking them to handle CSAM. Even with a local-only hash, do not build a UI that invites it.

**Resolution:** the minor branch sets `minorInvolved: true`, which permanently disables the image-hash entry point for the session and routes to a dedicated flow: NCMEC Take It Down, Child Helpline 1098, Cyber Bureau, tell a trusted adult. Conversation screenshots stay available. The gate lives in the engine, not just in tree content, so no tree edit can accidentally re-open it.

---

## 2. Tech stack (final)

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18 + Vite | |
| Styling | Tailwind CSS | |
| Routing | `react-router-dom` | 3 routes: `/`, `/report`, `/resources` |
| PWA | `vite-plugin-pwa` (`generateSW`) | precache shell + JSON data; **never** cache `/api/*` |
| Chat UI | Hand-rolled bubble components | no chat library |
| Structured storage | `localStorage`, versioned single key | tree progress, answers, fingerprints, draft |
| Screenshots | IndexedDB via `idb` | conversation screenshots only |
| Hashing | Web Crypto `crypto.subtle.digest('SHA-256')` | requires HTTPS or localhost |
| AI drafting | serverless proxy → Anthropic Messages API | text only |
| Offline drafting | local template generator | flow must never dead-end offline |
| PDF | `window.print()` + print stylesheet | |
| Deploy | Vercel | serverless function + instant HTTPS in one place |

Model ID goes in `ANTHROPIC_MODEL` as an env var. The string in the original spec (`claude-sonnet-4-6`) is not a verified model ID — read the current ID from the Anthropic docs when you set the env var and don't hardcode a guess, or the first real call 404s.

Everything self-hosted: system font stack, no Google Fonts, no icon CDN. Privacy and offline both require it.

---

## 3. Architecture

```
Browser (all logic)                        Your origin              Third party
─────────────────────────────────────      ────────────────         ──────────────
decisionTree.json ─┐
                   ├─> TreeEngine ──> chat transcript
localStorage ──────┘        │
                            ├─> EvidenceCapture
                            │      ├─ screenshots ──> IndexedDB (local)
                            │      └─ explicit image ─> SHA-256 ─> hash+timestamp
                            │            └─ bytes discarded, input cleared
                            │
                            └─> answers (structured) ──> POST /api/draft ──> Anthropic
                                     │                        (text only)     Messages API
                                     ├─ offline/failure ─> local template
                                     ▼
                               ReportPreview (editable)
                                     ├─> mailto: / portal (new tab)
                                     ├─> window.print()
                                     └─> StopNCII / Take It Down (new tab)
```

The image path terminates at the hash. There is no arrow from image bytes to anything else — that shape is the pitch.

---

## 4. Folder structure

```
Kavach/
├── api/
│   └── draft.js                 # Vercel serverless fn — holds ANTHROPIC_API_KEY
├── public/
│   ├── manifest.json
│   └── icons/                   # 192, 512, maskable
├── src/
│   ├── main.jsx
│   ├── App.jsx                  # routes + LanguageProvider + PanicBar
│   ├── data/
│   │   ├── decisionTree.json    # all branching + all bilingual copy
│   │   ├── resources.json
│   │   └── promptTemplates.json # system prompt + offline template
│   ├── engine/
│   │   ├── TreeEngine.js        # pure, no React
│   │   └── useDecisionTree.js   # hook: state, history, persistence
│   ├── storage/
│   │   ├── localState.js        # versioned load/save/wipe
│   │   ├── db.js                # IndexedDB, screenshots only
│   │   └── hashEvidence.js      # SHA-256, bytes never persisted
│   ├── api/
│   │   ├── draftReport.js       # calls /api/draft, falls back to template
│   │   └── takedownHandoff.js   # builds external URLs, no network call
│   ├── i18n/
│   │   ├── LanguageContext.jsx
│   │   └── ui.json              # chrome strings; tree copy lives in the tree
│   ├── components/
│   │   ├── ChatBubble.jsx
│   │   ├── QuickReplyButtons.jsx
│   │   ├── EvidenceCapture.jsx
│   │   ├── HashResult.jsx
│   │   ├── ReportPreview.jsx
│   │   ├── ResourceDirectory.jsx
│   │   ├── CrisisCard.jsx
│   │   ├── PanicBar.jsx         # Erase everything + Quick exit
│   │   └── LanguageToggle.jsx
│   ├── pages/
│   │   ├── Chat.jsx
│   │   ├── Report.jsx
│   │   └── Resources.jsx
│   └── styles/
│       ├── index.css
│       └── print.css
├── vite.config.js
└── package.json
```

---

## 5. Data contracts

Write these before any component. Every ambiguity later traces back to a loose schema here.

### 5.1 `decisionTree.json`

```json
{
  "start": "entry",
  "nodes": {
    "entry": {
      "type": "question",
      "text": { "en": "I can help you respond to this right now. What's happening?", "ne": "…" },
      "options": [
        { "label": { "en": "Someone is threatening to share my images", "ne": "…" },
          "set": { "stage": "threatened" }, "next": "q_authenticity" },
        { "label": { "en": "Images of me have already been shared", "ne": "…" },
          "set": { "stage": "published" }, "next": "q_authenticity" },
        { "label": { "en": "Just messages and demands so far", "ne": "…" },
          "set": { "stage": "demands_only" }, "next": "q_platform" }
      ]
    }
  }
}
```

Node types:

| type | shape | renders as |
|---|---|---|
| `question` | `options[]` | bubble + quick-reply buttons |
| `info` | `text`, `next` | bubble + single "Next" |
| `checklist` | `items[]`, `next` | do/don't list, tap to continue |
| `action` | `action: "evidence" \| "report" \| "resources"` | hands off to a component |
| `end` | terminal | summary + resource shortcuts |

Rules:
- Every string is `{ en, ne }`. No bare strings anywhere in the tree.
- `set` merges flat key/values into `answers`. Flat only — no nesting.
- Optional `guard: { minorInvolved: false }` skips a node when the guard fails.
- Optional `crisis: true` renders `CrisisCard` alongside the node.
- Every node id is referenced by at least one `next`, and every `next` resolves. Write a 20-line validation script and run it in CI or as an npm script; a dangling id is a dead demo.

### 5.2 `answers` (the AI's only input)

```js
{
  stage: "threatened" | "published" | "demands_only",
  authenticity: "real" | "suspected_deepfake" | "unsure",
  platform: "facebook" | "instagram" | "whatsapp" | "viber" | "tiktok" | "telegram" | "snapchat" | "other",
  contactMethod: "dm" | "call" | "email" | "unknown",
  paidOrComplied: boolean,
  amountDemandedNPR: number | null,
  paymentChannel: "esewa" | "khalti" | "bank" | "crypto" | "gift_card" | "other" | null,
  attackerIdentifier: "known" | "unknown",
  contactsThreatened: boolean,
  minorInvolved: boolean | "undisclosed",
  firstContactDate: "YYYY-MM-DD" | null,
  reportedToPlatform: boolean
}
```

Enums only, plus numbers and dates. No free-text describing image content ever enters this object — that is what keeps the AI call safe by construction.

### 5.3 Evidence record (`localStorage`, key `kavach.case.v1`)

```json
{
  "schemaVersion": 1,
  "caseId": "kavach-8f2a1c",
  "createdAt": "2026-08-08T10:12:00+05:45",
  "answers": {},
  "fingerprints": [
    { "algo": "SHA-256", "hash": "<64 hex>", "hashedAt": "…", "sizeBytes": 184320, "label": "Image 1" }
  ],
  "screenshotIds": [1, 2],
  "draft": { "text": "…", "source": "ai" | "template", "generatedAt": "…", "edited": false },
  "nodeId": "q_paid",
  "history": ["entry", "q_authenticity"]
}
```

`localState.js` reads through a version check: unknown `schemaVersion` → discard and start clean rather than crash. Never store a filename or a data URL in `fingerprints`.

### 5.4 `resources.json`

```json
{
  "resources": [
    { "id": "police", "name": { "en": "Nepal Police", "ne": "नेपाल प्रहरी" },
      "type": "phone", "value": "100", "tags": ["emergency"], "verifiedOn": "2026-08-08" }
  ]
}
```

`type` ∈ `phone | email | url`. `ResourceDirectory` renders `tel:`, `mailto:`, `https:` from `type` — no per-resource UI code.

---

## 6. Evidence pipeline

### 6.1 Explicit image → hash only

```js
// storage/hashEvidence.js
const MAX_BYTES = 25 * 1024 * 1024;

export async function fingerprintFile(file) {
  if (!crypto?.subtle) throw new Error('INSECURE_CONTEXT');
  if (file.size > MAX_BYTES) throw new Error('TOO_LARGE');

  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const hash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return { algo: 'SHA-256', hash, hashedAt: new Date().toISOString(), sizeBytes: file.size };
}
```

Caller contract in `EvidenceCapture.jsx`:

```js
async function onPick(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const fp = await fingerprintFile(file);
    setFingerprint(fp);          // hash string only
    appendFingerprint(fp);       // localStorage
  } finally {
    e.target.value = '';         // clears the input, on success and on failure
  }
}
```

Hard rules:
- The `File`, the `ArrayBuffer`, and any object URL never enter state, storage, or a request body.
- No `<img>` preview, no thumbnail, no canvas. Never render the picked file.
- `e.target.value = ''` is in a `finally`. A thrown error must not leave the file selected.
- `accept="image/*,video/*"`, and `capture` is **not** set — never open a camera here.
- `INSECURE_CONTEXT` means someone is serving over plain HTTP. Show a real message, not a silent failure.

`HashResult.jsx` shows the full 64-hex hash in monospace with a copy button, the timestamp, and the privacy statement verbatim:

> Your image was fingerprinted on your device. The image itself was never uploaded, never stored, and never seen by anyone — including us. Only the fingerprint below was saved.

Then, plainly, what the fingerprint is for: it proves this exact file existed at this exact time and has not been altered since. It is not a takedown request. Say that, or the user will expect a takedown that never happens.

### 6.2 Conversation screenshots → IndexedDB

Store threat messages, usernames, profile URLs, payment handles, timestamps. Before the picker: *"Only the conversation, please — if the screenshot includes the actual image, crop or blur it first."* We cannot enforce it, so also offer a per-item delete and make the wipe control obvious.

Wrap every IndexedDB call in try/catch. Safari private mode can reject storage outright; degrade to "screenshots unavailable on this device" and keep the rest of the flow alive.

### 6.3 Minor gate

`minorInvolved: true` sets a session flag that:
- removes the explicit-image entry point from `EvidenceCapture` entirely (not disabled — absent),
- routes to the minor flow: NCMEC Take It Down, 1098, Cyber Bureau, tell a trusted adult,
- adds a line to the drafted complaint that a minor is involved, which changes how the Bureau prioritizes it.

Enforce in the engine and re-check inside `EvidenceCapture` before render. Two independent checks, because this one must not regress.

`minorInvolved: "undisclosed"` routes to the general flow but still surfaces 1098.

---

## 7. AI drafting

### 7.1 Serverless proxy

```js
// api/draft.js — Vercel
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { answers, language } = req.body ?? {};
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'bad_request' });
  }

  const safe = pickAllowedFields(answers); // whitelist of §5.2 keys, drops anything else

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL,
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Language: ${language === 'ne' ? 'Nepali' : 'English'}\nFacts:\n${JSON.stringify(safe, null, 2)}`,
      }],
    }),
  });

  if (!r.ok) return res.status(502).json({ error: 'upstream', status: r.status });

  const data = await r.json();
  const text = data.content?.find((b) => b.type === 'text')?.text;
  return res.status(200).json({ text, source: 'ai' });
}
```

- `pickAllowedFields` is a whitelist, so a client bug cannot forward anything unexpected upstream.
- Add a coarse per-IP rate limit (e.g. 10/hour) and keep `max_tokens` capped. An unauthenticated public proxy to a paid API will get scraped otherwise.
- Env vars: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`. Never `VITE_`-prefixed — that ships to the client.
- Netlify variant: same body under `netlify/functions/draft.js` with the handler signature swapped.

### 7.2 System prompt (`promptTemplates.json`)

Constrain hard:

> You draft formal cybercrime complaints for Nepal's Cyber Bureau. You receive structured facts only. Rules: use every fact provided and invent nothing beyond them; where a fact is absent, omit it rather than guessing or writing a placeholder. Plain factual language, no emotive framing, no reassurance, no advice to the victim. Structure: complainant statement, chronological timeline, platform and account identifiers, nature of the threat, financial demands, evidence held (referenced by fingerprint and timestamp only), request for action. State no legal conclusion and cite no statute. Do not describe image content. Output the complaint body only, no preamble and no commentary.

Two things that will otherwise embarrass you on stage: an invented case number, and a hallucinated legal citation. The "cite no statute" and "omit rather than guess" clauses are load-bearing.

### 7.3 Offline / failure fallback

`draftReport.js`:

```js
export async function draftComplaint(answers, language) {
  try {
    const r = await fetch('/api/draft', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ answers, language }),
    });
    if (!r.ok) throw new Error('upstream');
    const { text } = await r.json();
    if (!text) throw new Error('empty');
    return { text, source: 'ai' };
  } catch {
    return { text: renderTemplate(answers, language), source: 'template' };
  }
}
```

`renderTemplate` is a deterministic string builder over the same fields — a fixed skeleton with facts slotted in. Less fluent, completely offline, always works. Label it in the UI ("drafted offline — review wording") so the user knows which they got.

This is also the airplane-mode demo: the flow keeps producing a filable complaint with the network off.

### 7.4 ReportPreview

Editable `<textarea>` seeded with the draft, autosaving to `draft.text` and flipping `draft.edited` on first keystroke. Appended below, generated client-side and never AI-written: the case id, the fingerprint list with timestamps, and a screenshot count.

Send options: `mailto:` to the Bureau email with the complaint as the body; open the Bureau portal in a new tab with a copy-to-clipboard; `window.print()`; save and exit. Note in the UI that `mailto:` cannot attach screenshots automatically — the user attaches them from their gallery.

---

## 8. Takedown handoff

`takedownHandoff.js` returns links and copy only:

- **StopNCII.org** — adults, 18+, for intimate images. Explain: they hash on your device too, using a perceptual hash that survives re-encoding, and partner platforms match against it.
- **NCMEC Take It Down** — anyone under 18 at the time the image was taken. Primary CTA on the minor branch.
- **Platform report link** for the `platform` in `answers` (deep-link to the NCII/harassment report form, one per platform).

State clearly that Kavach does not submit on the user's behalf and that our SHA-256 fingerprint is a different thing serving a different purpose. Undersell the integration and oversell nothing.

---

## 9. Resources

Carried from the spec. **Re-verify every entry the day of the demo and set `verifiedOn`** — a dead hotline in a safety app is worse than no hotline.

| Resource | Contact |
|---|---|
| Nepal Police | 100 |
| Cyber Bureau — toll free | 16600141516 |
| Cyber Bureau — hotline | +977 9851286770 / 9851286771 |
| Cyber Bureau — office | 01-5319044, Bhotahiti, Kathmandu |
| Cyber Bureau — email | cyberbureau@nepalpolice.gov.np |
| Cyber Bureau — portal | cyberbureau.nepalpolice.gov.np/report-cyber-crime |
| Child Helpline | 1098 |
| National Women Commission | 1145 |
| StopNCII.org | adults, perceptual-hash takedown |
| NCMEC Take It Down | under-18 |

**Add a crisis line.** Sextortion has driven victims — disproportionately teenage boys — to suicide, and a response kit without a crisis contact has a hole in it. Include Nepal's mental health helpline (1166) and a TPO Nepal counselling line, both verified before the demo. `CrisisCard` renders automatically on any node with `crisis: true`: the published-image branch, the minor branch, and the "already paid" branch.

---

## 10. UX rules for a panic state

- Minimum 48px tap targets, 16px+ body text, high contrast. Someone shaking will use this.
- One question per screen. Never two decisions in one bubble.
- 3–6 words per button where possible. The label is the whole decision.
- **Back always works.** `history` in the engine; a wrong tap must never be a dead end.
- No timers, no countdowns, no urgency animations. The situation supplies the urgency.
- Bubble reveal ≤200ms and honour `prefers-reduced-motion`. Skip typing-indicator theatre — this is not a personality demo.
- Resources reachable in one tap from every screen (persistent bar).
- Calm, plain tone. No exclamation marks, no "Don't worry!", no emoji in threat copy.
- Say "you are not in trouble" early on the minor branch and on the "already paid" branch. Shame is what keeps victims silent, and it is the attacker's leverage.
- `aria-live="polite"` on the transcript so new bubbles are announced; buttons are real `<button>`s; visible focus rings.

### PanicBar

Two controls, always visible:

- **Erase everything** — one confirm tap, then clear the `kavach.*` localStorage keys, `deleteDB()` the IndexedDB store, reload to a clean state. Shared and family devices are a live threat model here.
- **Quick exit** — immediately `location.replace()` to a neutral site. Standard in abuse-response tooling. Note that it does not clear browser history, because pretending otherwise is dangerous.

### i18n

`{ en, ne }` on every tree string; `ui.json` for chrome. `LanguageContext` exposes `t(obj)` returning `obj[lang] ?? obj.en`. Toggle persists to localStorage. Build English first, fill Nepali once the tree stops changing — translating a moving tree wastes hours. `language` is passed to the drafting call so the complaint comes back in the same language.

---

## 11. Privacy and security posture

- No analytics, no error reporting SDK, no third-party script or font. Anything else is a beacon on a page about sextortion.
- CSP: `default-src 'self'`, `connect-src 'self'`, `img-src 'self' data: blob:`, `frame-ancestors 'none'`. Plus `Referrer-Policy: no-referrer` and `X-Content-Type-Options: nosniff`. On Vercel this is `vercel.json` headers.
- All external links: `target="_blank" rel="noopener noreferrer"`.
- Never log `answers` or a fingerprint server-side. The proxy logs status codes, nothing else.
- The API key exists only as a serverless env var. Grep the built bundle for it before demoing.
- No secrets in the repo. `.env` in `.gitignore` from commit one.

---

## 12. PWA and offline

- `vite-plugin-pwa`, `registerType: 'autoUpdate'`, precache the app shell, `decisionTree.json`, `resources.json`, icons, CSS.
- `navigateFallback` to the shell so a deep refresh works offline.
- **Exclude `/api/*` from the service worker.** A cached complaint draft served to a later session on a shared device is a serious leak.
- `manifest.json`: `display: standalone`, 192/512/maskable icons, `theme_color`, neutral `name` and `short_name` (**"Kavach"**, no "sextortion" on the home screen — the icon may be seen by the abuser).
- iOS: no `beforeinstallprompt`, so show Safari "Add to Home Screen" instructions on iOS. `apple-touch-icon` required.

---

## 13. Build order (20h)

Re-sequenced from the original plan to prove the risky external dependency first — the proxy is the one thing that can eat four hours at 2am.

| Hours | Task |
|---|---|
| 0–1 | Repo, Vite + Tailwind + `vite-plugin-pwa`, deploy an empty shell to get a live HTTPS URL |
| 1–2 | `api/draft.js` deployed with the key set; confirm a real 200 from `curl` against the live URL. **Do not proceed until this returns text.** |
| 2–3 | `decisionTree.json` (English) + `resources.json` + the validation script |
| 3–4 | App shell, routing, manifest, `LanguageContext`, `PanicBar` |
| 4–8 | `TreeEngine` + `useDecisionTree` + `ChatBubble` + `QuickReplyButtons` — full flow end to end, Back working |
| 8–10 | `EvidenceCapture` + `hashEvidence` + minor gate + `HashResult` |
| 10–12 | `draftReport` + template fallback + `ReportPreview` |
| 12–13 | `takedownHandoff` + `ResourceDirectory` with `tel:`/`mailto:` |
| 13–14 | `window.print()` + `print.css` |
| 14–15 | Service worker verified offline in airplane mode, including the template fallback |
| 15–17 | Visual polish, loading and error states, `CrisisCard` |
| 17–18 | Real devices: Chrome Android + Safari iOS, PWA install, private-mode IndexedDB |
| 18–19 | Nepali strings, resource re-verification, demo rehearsal |
| 19–20 | Buffer |

Cut in this order if time runs short: Nepali translation, then print export, then StopNCII handoff copy. **Never cut** the hash flow, the minor gate, or the template fallback — the first is the pitch, the second is a safety requirement, the third is what keeps the demo alive when the venue wifi dies.

---

## 14. Verification checklist

Run before the demo. Every line is a thing that has broken in a build like this.

**The invariant**
- [ ] DevTools Network tab open for the whole flow: no request contains image bytes; the only calls are `/api/draft` and static assets.
- [ ] After picking an image, the file input reads empty and no `<img>`/`blob:` URL exists in the DOM.
- [ ] Force `fingerprintFile` to throw — the input still clears.
- [ ] `localStorage` and IndexedDB contain no filename, data URL, or blob after hashing.
- [ ] The built bundle does not contain the API key (`grep -r` over `dist/`).

**Flow**
- [ ] Every branch reaches a terminal node. Run the tree validator.
- [ ] Back works from every node, including after the evidence step.
- [ ] Reload mid-flow restores position and answers.
- [ ] Minor branch: the explicit-image control is absent, not merely disabled.
- [ ] `minorInvolved: "undisclosed"` reaches the general flow and still shows 1098.

**Drafting**
- [ ] Online draft returns in a few seconds and reads as a filable complaint.
- [ ] Kill the network → template fallback fires and is labelled as offline.
- [ ] Return a 500 from the proxy → same graceful fallback, no crash, no raw error shown.
- [ ] The draft contains no invented case number, no statute citation, no image description.
- [ ] Edits to the draft persist across reload.

**Platform**
- [ ] Airplane mode: cold-load the installed PWA, run the flow, produce a complaint.
- [ ] Safari iOS: flow completes; IndexedDB failure in private mode degrades instead of crashing.
- [ ] Chrome Android: installs, `tel:` links dial, `mailto:` opens with the body populated.
- [ ] Print preview is legible and paginates — no clipped hashes.
- [ ] Erase everything leaves storage genuinely empty; Quick exit navigates away immediately.
- [ ] Every phone number dials and every URL resolves. Check the day of.

---

## 15. Demo script

1. Open the installed PWA. Tap through the chat — three taps to a tailored action plan. No typing.
2. Evidence step: pick an image. The hash appears, the input clears. Say the line while it happens: *the bytes were read, hashed, and dropped; nothing left the phone.* Have the Network tab visible.
3. Tap for the complaint. It arrives in seconds, fully editable.
4. Toggle airplane mode. Keep going — the flow still drafts, from the local template.
5. Show the minor branch: the image control is gone, and the flow routes to Take It Down and 1098.

Step 5 is the one judges remember, because it shows a decision made against your own feature.

**Framing:** the fastest path from panic to a filed report — guided taps, an AI-drafted complaint in seconds, and one rule never broken: the image never leaves the device. Not to us, not to any model, not to any server. And where real infrastructure already exists, we hand off to it instead of pretending to replace it.

---

## 16. Out of scope

Say so plainly if asked; scope discipline reads as judgment, not as a gap.

- Accounts, sync, multi-device.
- Server-side storage of anything.
- Perceptual (PDQ) hashing and any actual submission to a matching database.
- Automated filing with the Cyber Bureau — no public API exists; we draft and hand off.
- Legal advice. The app drafts a factual complaint and points to real authorities; it does not interpret statute.
- Attacker identification, tracing, or any counter-offensive.
- Content moderation or image classification of any kind.
