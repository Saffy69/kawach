import { useEffect, useMemo, useState } from 'react';
import { Check, ExternalLink, FileText, Search, ShieldAlert, Trash2, X } from 'lucide-react';
import { Button, Card, Pill, SectionLabel } from '@/components/ui/primitives';
import { deleteLocalReport, listLocalReports, updateLocalReportStatus } from '@/storage/db';
import type { LocalReportRecord, ReportReviewStatus } from '@/types';

const CYBER_BUREAU_URL = 'https://cyberbureau.nepalpolice.gov.np/report-cyber-crime';

type Filter = 'all' | ReportReviewStatus;

const COPY = {
  title: 'Report review', intro: 'Review incoming reports, verify the available details, and manage each case from one workspace.', pending: 'Pending', verified: 'Verified', rejected: 'Rejected', all: 'All reports', empty: 'No reports in this view.', search: 'Search by case ID or report text', details: 'Report details', answers: 'Structured answers', evidence: 'Evidence summary', notes: 'Verification checks', checkAnswers: 'Answers are present', checkDraft: 'Draft text is present', checkEvidence: 'Evidence counts are recorded', verify: 'Mark verified', reject: 'Reject', restore: 'Return to pending', delete: 'Delete record', handoff: 'Continue to Cyber Bureau', handoffText: 'Review the full report and confirm the complainant’s details before continuing to the official submission form.', status: 'Status', submitted: 'Submitted', source: 'Draft source', edited: 'Edited by complainant', yes: 'Yes', no: 'No', noSelection: 'Select a report to review.', confirmDelete: 'Delete this local record?',
};

function statusTone(status: ReportReviewStatus): 'safe' | 'caution' | 'neutral' {
  return status === 'verified' ? 'safe' : status === 'rejected' ? 'neutral' : 'caution';
}

function checks(report: LocalReportRecord) {
  return [
    { label: COPY.checkAnswers, pass: Object.keys(report.answers).length > 0 },
    { label: COPY.checkDraft, pass: report.reportText.trim().length > 0 },
    { label: COPY.checkEvidence, pass: report.fingerprintCount + report.screenshotCount >= 0 },
  ];
}

export function AdminPage() {
  const [reports, setReports] = useState<LocalReportRecord[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function refresh() { setReports(await listLocalReports()); }
  useEffect(() => { void refresh(); }, []);

  const visible = useMemo(() => reports.filter((report) => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const haystack = `${report.caseId} ${report.reportText}`.toLowerCase();
    return matchesFilter && haystack.includes(query.toLowerCase());
  }), [filter, query, reports]);
  const selected = reports.find((report) => report.id === selectedId) ?? null;
  const counts = { all: reports.length, pending: reports.filter((r) => r.status === 'pending').length, verified: reports.filter((r) => r.status === 'verified').length, rejected: reports.filter((r) => r.status === 'rejected').length };

  async function setStatus(status: ReportReviewStatus) {
    if (!selected) return;
    const notes = checks(selected).filter((check) => check.pass).map((check) => check.label);
    await updateLocalReportStatus(selected.id, status, notes);
    await refresh();
  }

  async function removeSelected() {
    if (!selected || !window.confirm(COPY.confirmDelete)) return;
    await deleteLocalReport(selected.id);
    setSelectedId(null);
    await refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8"><SectionLabel>{COPY.title}</SectionLabel><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Manage reports.</h1><p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2">{COPY.intro}</p></header>

      <div className="grid gap-3 sm:grid-cols-4">{(['all', 'pending', 'verified', 'rejected'] as const).map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-lg border p-4 text-left transition-colors ${filter === item ? 'border-brand bg-brand/10' : 'border-line bg-surface hover:bg-surface-2'}`}><p className="text-xs font-semibold uppercase tracking-wider text-ink-3">{COPY[item]}</p><p className="mt-1 text-2xl font-bold">{counts[item]}</p></button>)}</div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card padded={false} className="overflow-hidden"><div className="border-b border-line p-4"><label className="flex items-center gap-2 rounded-md border border-line-strong bg-canvas px-3"><Search size={15} className="text-ink-3" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={COPY.search} className="min-h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" /></label></div><div className="max-h-[620px] overflow-y-auto">{visible.length === 0 ? <p className="p-6 text-sm text-ink-3">{COPY.empty}</p> : visible.map((report) => <button key={report.id} type="button" onClick={() => setSelectedId(report.id)} className={`block w-full border-b border-line p-4 text-left transition-colors ${selectedId === report.id ? 'bg-brand/10' : 'hover:bg-surface-2'}`}><div className="flex items-center justify-between gap-3"><span className="font-mono text-sm font-bold">{report.caseId}</span><Pill tone={statusTone(report.status)}>{COPY[report.status]}</Pill></div><p className="mt-2 line-clamp-2 text-sm text-ink-2">{report.reportText}</p><p className="mt-2 text-xs text-ink-3">{new Date(report.updatedAt).toLocaleString()}</p></button>)}</div></Card>

        {!selected ? <Card><div className="flex min-h-[280px] flex-col items-center justify-center text-center text-ink-3"><FileText size={28} /><p className="mt-3 text-sm">{COPY.noSelection}</p></div></Card> : <Card><div className="flex flex-wrap items-start justify-between gap-3"><div><SectionLabel>{COPY.details}</SectionLabel><h2 className="mt-1 font-mono text-xl font-bold">{selected.caseId}</h2></div><Pill tone={statusTone(selected.status)}>{COPY[selected.status]}</Pill></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div><p className="text-xs text-ink-3">{COPY.submitted}</p><p className="text-sm font-semibold">{new Date(selected.submittedAt).toLocaleString()}</p></div><div><p className="text-xs text-ink-3">{COPY.source}</p><p className="text-sm font-semibold">{selected.draftSource}</p></div><div><p className="text-xs text-ink-3">{COPY.edited}</p><p className="text-sm font-semibold">{selected.editedByVictim ? COPY.yes : COPY.no}</p></div></div><div className="mt-5"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">{COPY.evidence}</p><div className="flex gap-2"><Pill>{selected.fingerprintCount} fingerprints</Pill><Pill>{selected.screenshotCount} screenshots</Pill></div></div><div className="mt-5"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">{COPY.notes}</p><ul className="space-y-2">{checks(selected).map((check) => <li key={check.label} className={`flex items-center gap-2 text-sm ${check.pass ? 'text-safe-bright' : 'text-danger-bright'}`}>{check.pass ? <Check size={15} /> : <X size={15} />}{check.label}</li>)}</ul></div><pre className="mt-5 max-h-[300px] overflow-y-auto whitespace-pre-wrap rounded-md border border-line bg-canvas p-4 font-mono text-xs leading-relaxed text-ink-2">{selected.reportText}</pre><div className="mt-5 flex flex-wrap gap-2"><Button variant="safe" icon={<Check size={16} />} onClick={() => void setStatus('verified')}>{COPY.verify}</Button><Button variant="secondary" icon={<ShieldAlert size={16} />} onClick={() => void setStatus('rejected')}>{COPY.reject}</Button><Button variant="ghost" onClick={() => void setStatus('pending')}>{COPY.restore}</Button><Button variant="ghost" className="text-danger-bright" icon={<Trash2 size={15} />} onClick={() => void removeSelected()}>{COPY.delete}</Button></div>{selected.status === 'verified' && <Card tone="brand" className="mt-5"><p className="text-sm leading-relaxed text-ink-2">{COPY.handoffText}</p><a className="mt-4 block" href={CYBER_BUREAU_URL} target="_blank" rel="noopener noreferrer"><Button fullWidth iconRight={<ExternalLink size={15} />}>{COPY.handoff}</Button></a></Card>}</Card>}
      </div>
    </div>
  );
}
