/**
 * Core domain types for Kawach.
 *
 * The `Answers` shape is deliberately enum-only. It is the sole input to
 * report drafting, so keeping it free of open text is what makes the drafting
 * call safe by construction rather than by discipline.
 */

export type Stage = 'threatened' | 'published' | 'demands_only' | 'unsure';

export type Authenticity = 'real' | 'suspected_deepfake' | 'unsure';

export type Platform =
  | 'facebook'
  | 'instagram'
  | 'whatsapp'
  | 'viber'
  | 'tiktok'
  | 'telegram'
  | 'snapchat'
  | 'other';

export type PaymentChannel =
  | 'esewa'
  | 'khalti'
  | 'bank'
  | 'crypto'
  | 'gift_card'
  | 'other';

export type MinorInvolved = 'yes' | 'no' | 'undisclosed';

export interface Answers {
  stage?: Stage;
  authenticity?: Authenticity;
  platform?: Platform;
  moneyDemanded?: boolean;
  paidOrComplied?: boolean;
  amountDemandedNPR?: number | null;
  paymentChannel?: PaymentChannel | null;
  attackerIdentifier?: 'known' | 'unknown';
  contactsThreatened?: boolean;
  minorInvolved?: MinorInvolved;
  reportedToPlatform?: boolean;
}

/** A cryptographic fingerprint. Never accompanied by image bytes or a filename. */
export interface Fingerprint {
  algo: 'SHA-256';
  hash: string;
  hashedAt: string;
  sizeBytes: number;
  label: string;
}

export interface ReportDraft {
  text: string;
  source: 'ai' | 'template';
  generatedAt: string;
  edited: boolean;
}

export interface PaymentRecord {
  paid: boolean;
  transactionId: string | null;
  method: 'esewa' | 'khalti' | 'demo' | null;
  amountNPR: number;
  paidAt: string | null;
  /** Always true in this build. No real gateway is integrated. */
  simulated: boolean;
}

export interface CaseState {
  schemaVersion: 1;
  caseId: string;
  createdAt: string;
  answers: Answers;
  fingerprints: Fingerprint[];
  screenshotCount: number;
  draft: ReportDraft | null;
  payment: PaymentRecord;
  nodeId: string;
  history: string[];
  completedGuidance: boolean;
}

/* -------------------------------------------------------------------------
   Decision tree
   ------------------------------------------------------------------------- */

export type NodeType = 'question' | 'info' | 'checklist' | 'action' | 'end';

export interface TreeOption {
  label: string;
  /** Flat key/values merged into `answers`. Flat only — no nesting. */
  set?: Partial<Answers>;
  next: string;
  /** Renders the option in a cautionary tone without implying blame. */
  tone?: 'neutral' | 'caution';
}

export interface ChecklistItem {
  text: string;
  detail?: string;
  kind: 'do' | 'dont';
}

export interface TreeNode {
  id: string;
  type: NodeType;
  /** Bubble copy. Short sentences: the reader may be panicking. */
  text: string;
  /** Secondary line, used for reassurance or clarification. */
  sub?: string;
  options?: TreeOption[];
  items?: ChecklistItem[];
  next?: string;
  /** Terminal handoff target. */
  action?: 'evidence' | 'report' | 'resources';
  /** Surfaces the crisis support card alongside this node. */
  crisis?: boolean;
  /** Node is skipped when the guard does not match current answers. */
  guard?: Partial<Answers>;
}

export interface DecisionTree {
  start: string;
  nodes: Record<string, TreeNode>;
}

/* -------------------------------------------------------------------------
   Resources
   ------------------------------------------------------------------------- */

export type ResourceKind = 'phone' | 'url' | 'email';

export type ResourceGroup = 'emergency' | 'crisis' | 'reporting' | 'takedown';

export interface Resource {
  id: string;
  name: string;
  description: string;
  kind: ResourceKind;
  value: string;
  /** Human-readable form shown on the card, e.g. formatted phone number. */
  display?: string;
  group: ResourceGroup;
  availability?: string;
  /** ISO date the contact detail was last confirmed. Null = unconfirmed. */
  verifiedOn: string | null;
}
