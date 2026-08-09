import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { ActionChecklist, ChatBubble, QuickReplyButtons, UserEcho } from '@/components/chat';
import { CrisisCard } from '@/components/shared';
import { Button } from '@/components/ui/primitives';
import { ProgressIndicator } from '@/components/ui/feedback';
import { useLanguage } from '@/components/LanguageContext';
import { localizeNode } from '@/data/decisionTree.i18n';
import { computeProgress, getNode, mergeAnswers, resolveNext } from '@/engine/TreeEngine';
import { loadOrCreateCase, patchCase } from '@/storage/localState';
import type { Answers, TreeNode, TreeOption } from '@/types';

interface Turn {
  node: TreeNode;
  answer?: string;
}

export function ResponsePage() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const scrollAnchor = useRef<HTMLDivElement>(null);

  const [answers, setAnswers] = useState<Answers>(() => loadOrCreateCase().answers);
  const [turns, setTurns] = useState<Turn[]>(() => {
    const start = getNode('entry');
    return start ? [{ node: start }] : [];
  });
  const [locked, setLocked] = useState(false);

  const current = turns[turns.length - 1]?.node;

  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns]);

  const advance = useCallback(
    (nextId: string | undefined, nextAnswers: Answers, chosenLabel?: string) => {
      const next = resolveNext(nextId, nextAnswers);
      if (!next) return;

      setLocked(true);
      setTurns((prev) => {
        const updated = [...prev];
        if (chosenLabel && updated.length) {
          updated[updated.length - 1] = { ...updated[updated.length - 1], answer: chosenLabel };
        }
        return [...updated, { node: next }];
      });

      patchCase({
        answers: nextAnswers,
        nodeId: next.id,
        completedGuidance: next.type === 'action',
      });

      // Brief pause so the answer registers before the next question lands.
      // Long enough to read, short enough not to feel like waiting.
      setTimeout(() => setLocked(false), 260);
    },
    [],
  );

  function pick(option: TreeOption) {
    if (locked) return;
    const next = mergeAnswers(answers, option.set);
    setAnswers(next);
    advance(option.next, next, option.label);
  }

  function goBack() {
    if (turns.length <= 1) return;
    setTurns((prev) => {
      const trimmed = prev.slice(0, -1);
      return trimmed.map((t, i) =>
        i === trimmed.length - 1 ? { node: t.node, answer: undefined } : t,
      );
    });
  }

  function restart() {
    setAnswers({});
    const start = getNode('entry');
    setTurns(start ? [{ node: start }] : []);
    patchCase({ answers: {}, nodeId: 'entry', completedGuidance: false });
  }

  // Terminal nodes hand off to a dedicated screen.
  useEffect(() => {
    if (current?.type !== 'action' || !current.action) return;
    const target = { evidence: '/evidence', report: '/report', resources: '/resources' }[
      current.action
    ];
    const timer = setTimeout(() => navigate(target), 700);
    return () => clearTimeout(timer);
  }, [current, navigate]);

  if (!current) return null;

  const progress = computeProgress(current.id, turns.length - 1);

  return (
    <div className="min-h-[calc(100dvh-62px)] overflow-x-hidden bg-[radial-gradient(circle_at_28%_36%,rgba(17,105,90,0.23),transparent_38%),radial-gradient(circle_at_80%_85%,rgba(17,105,90,0.18),transparent_35%)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[700px]">
        <div className="mb-7 space-y-5">
        <ProgressIndicator step={progress.step} total={progress.total} />
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-ink-2 hover:bg-surface-2 hover:text-ink"
            onClick={goBack}
            disabled={turns.length <= 1}
            icon={<ArrowLeft size={15} />}
          >
            Back
          </Button>
          <Button variant="ghost" size="sm" className="text-ink-2 hover:bg-surface-2 hover:text-ink" onClick={restart} icon={<RotateCcw size={14} />}>
            Start over
          </Button>
        </div>
      </div>

        <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-mid">
          <div className="border-b border-line bg-surface-2/60 px-4 py-3 sm:px-6">
            <p className="k-label text-ink-3">{language === 'ne' ? 'सुरक्षित प्रतिक्रिया मार्गदर्शन' : 'Guided safety response'}</p>
          </div>
          <div className="divide-y divide-line/70">
            {turns.map((turn, i) => {
              const node = localizeNode(turn.node, language);
              const answer = turn.answer && turn.node.options
                ? node.options?.[turn.node.options.findIndex((option) => option.label === turn.answer)]?.label
                : turn.answer;
              return (
                <div key={`${turn.node.id}-${i}`} className="space-y-4 px-4 py-5 sm:px-6 sm:py-6">
            <ChatBubble sub={node.sub}>{node.text}</ChatBubble>

            {answer && <UserEcho>{answer}</UserEcho>}

            {i === turns.length - 1 && (
              <>
                {node.crisis && (
                  <div className="pl-11">
                    <CrisisCard />
                  </div>
                )}

                {node.type === 'question' && node.options && (
                  <QuickReplyButtons
                    options={node.options}
                    onPick={(option) => {
                      const source = turn.node.options?.[node.options!.indexOf(option)];
                      if (source) pick(source);
                    }}
                    disabled={locked}
                  />
                )}

                {node.type === 'checklist' && node.items && (
                  <div className="space-y-4 pl-11">
                    <ActionChecklist items={node.items} />
                    <Button
                      fullWidth
                      onClick={() => advance(turn.node.next, answers)}
                      disabled={locked}
                    >
                      {t.continue}
                    </Button>
                  </div>
                )}

                {node.type === 'info' && (
                  <div className="pl-11">
                    <Button
                      fullWidth
                      onClick={() => advance(turn.node.next, answers)}
                      disabled={locked}
                    >
                      {t.next}
                    </Button>
                  </div>
                )}

                {node.type === 'action' && (
                  <div className="pl-11">
                    <div className="flex items-center gap-2.5 text-sm text-ink-3">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand/30 border-t-brand-bright" />
                      {t.takingYouThere}
                    </div>
                  </div>
                )}
              </>
            )}
                </div>
              );
            })}
            <div ref={scrollAnchor} />
          </div>
        </div>
      </div>
    </div>
  );
}
