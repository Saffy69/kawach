import { decisionTree } from '@/data/decisionTree';
import type { Answers, TreeNode } from '@/types';

/** Resolves a node id, honouring guards. Returns null if the id is unknown. */
export function getNode(id: string): TreeNode | null {
  return decisionTree.nodes[id] ?? null;
}

function guardPasses(node: TreeNode, answers: Answers): boolean {
  if (!node.guard) return true;
  return (Object.keys(node.guard) as (keyof Answers)[]).every(
    (key) => answers[key] === node.guard![key],
  );
}

/**
 * Walks forward from `id` until it finds a node whose guard passes.
 * Guards are how safety-critical branches stay closed regardless of tree
 * content edits.
 */
export function resolveNext(id: string | undefined, answers: Answers): TreeNode | null {
  let cursor = id;
  const seen = new Set<string>();

  while (cursor) {
    if (seen.has(cursor)) return null;
    seen.add(cursor);

    const node = getNode(cursor);
    if (!node) return null;
    if (guardPasses(node, answers)) return node;

    cursor = node.next ?? node.options?.[0]?.next;
  }
  return null;
}

/**
 * Longest path from a node to a terminal, used for the progress indicator.
 * Depth-limited because the tree is authored by hand and a bad edit could
 * otherwise hang the UI.
 */
function longestPathFrom(id: string, depth = 0): number {
  if (depth > 40) return depth;
  const node = getNode(id);
  if (!node) return depth;

  const nextIds = node.options?.map((o) => o.next) ?? (node.next ? [node.next] : []);
  if (nextIds.length === 0) return depth + 1;

  return Math.max(...nextIds.map((n) => longestPathFrom(n, depth + 1)));
}

export interface Progress {
  step: number;
  total: number;
}

/**
 * "Step 3 of 7" framing. The total is an estimate of the remaining path, so
 * it can shift slightly between branches — that is preferable to showing a
 * fixed total that would be wrong on most routes.
 */
export function computeProgress(nodeId: string, historyLength: number): Progress {
  const remaining = longestPathFrom(nodeId);
  const step = historyLength + 1;
  return { step, total: Math.max(step, historyLength + remaining) };
}

export function mergeAnswers(answers: Answers, set?: Partial<Answers>): Answers {
  return set ? { ...answers, ...set } : answers;
}

/** Dev-time integrity check: every `next` must resolve to a real node. */
export function validateTree(): string[] {
  const errors: string[] = [];
  for (const [id, node] of Object.entries(decisionTree.nodes)) {
    if (node.id !== id) errors.push(`Node "${id}" has mismatched id "${node.id}".`);

    const targets = [
      ...(node.options?.map((o) => o.next) ?? []),
      ...(node.next ? [node.next] : []),
    ];
    for (const target of targets) {
      if (!decisionTree.nodes[target]) {
        errors.push(`Node "${id}" points to missing node "${target}".`);
      }
    }
    if (node.type === 'question' && !node.options?.length) {
      errors.push(`Question node "${id}" has no options.`);
    }
    if (node.type === 'action' && !node.action) {
      errors.push(`Action node "${id}" has no action target.`);
    }
  }
  return errors;
}
