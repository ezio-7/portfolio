// Studio helpers: application tracker (browser storage), ref links, outreach messages, GoatCounter insights.

export type Status = 'saved' | 'applied' | 'screen' | 'interview' | 'offer' | 'rejected';
export const STATUSES: Status[] = ['saved', 'applied', 'screen', 'interview', 'offer', 'rejected'];

export type App = {
  id: string;
  company: string;
  role: string;
  ref: string;
  date: string; // YYYY-MM-DD
  status: Status;
  jd: string;
  trim: boolean;
  summary: boolean;
  notes: string;
  // added for reminders, stats and sync (filled in by normalize() for older entries)
  statusDate: string; // when the status last changed
  best: Status; // furthest stage reached, kept even after a rejection
  score: number; // JD match % when saved
  nudgedAt: string; // last follow-up / thank-you sent
  updated: string; // ISO time of the last edit, used to merge synced copies
};

const KEY = 'studio.apps', TOKEN = 'studio.gcToken', DELETED = 'studio.deleted';
const read = <T>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) ?? '') ?? d; } catch { return d; } };
export const RANK: Record<Status, number> = { saved: 0, applied: 1, screen: 2, interview: 3, offer: 4, rejected: -1 };
export const normalize = (a: Partial<App>): App => ({
  id: a.id!, company: a.company ?? '', role: a.role ?? '', ref: a.ref ?? '', date: a.date ?? today(),
  status: a.status ?? 'saved', jd: a.jd ?? '', trim: a.trim ?? true, summary: a.summary ?? true, notes: a.notes ?? '',
  statusDate: a.statusDate ?? a.date ?? today(),
  best: a.best ?? (a.status && a.status !== 'rejected' ? a.status : 'applied'),
  score: a.score ?? 0, nudgedAt: a.nudgedAt ?? '', updated: a.updated ?? new Date(0).toISOString(),
});
export const loadApps = (): App[] => read<Partial<App>[]>(KEY, []).map(normalize);
export const saveApps = (apps: App[]) => { localStorage.setItem(KEY, JSON.stringify(apps)); onSave?.(); };
let onSave: (() => void) | undefined;
export const onAppsSaved = (fn: () => void) => (onSave = fn);
export const touch = (a: App) => { a.updated = new Date().toISOString(); };
export const setStatus = (a: App, s: Status) => {
  a.status = s;
  a.statusDate = today();
  if (RANK[s] > RANK[a.best]) a.best = s;
  touch(a);
};
// deletions are remembered so a synced copy doesn't bring them back
export const loadDeleted = (): Record<string, string> => read(DELETED, {});
export const markDeleted = (id: string) => localStorage.setItem(DELETED, JSON.stringify({ ...loadDeleted(), [id]: new Date().toISOString() }));
export const getToken = () => { try { return localStorage.getItem(TOKEN) ?? ''; } catch { return ''; } };
export const setToken = (t: string) => (t ? localStorage.setItem(TOKEN, t.trim()) : localStorage.removeItem(TOKEN));

export const slug = (company: string) =>
  company.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'company';
export const SITE = 'https://ezio-7.github.io/portfolio/';
export const refLink = (ref: string) => `${SITE}?ref=${ref}`;
/** Tracked résumé link: logs who opened it, then shows the PDF */
export const resumeLink = (ref: string) => (ref ? `${SITE}resume/?ref=${ref}` : `${SITE}Ayush_Anand_Resume.pdf`);
export const today = () => new Date().toISOString().slice(0, 10);

// ---------- outreach messages (templates; no AI) ----------
export type MsgKind = 'cover' | 'linkedin' | 'referral' | 'followup' | 'thanks';
export type MsgCtx = {
  company: string; role: string; person: string; resume: string; portfolio: string;
  matched: string[]; proofs: string[]; email: string; phone: string; applied?: string;
};
const and = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export const message = (kind: MsgKind, c: MsgCtx): string => {
  const company = c.company || '[Company]', role = c.role || 'Backend Engineer';
  const skills = and(c.matched.slice(0, 3));
  if (kind === 'cover') {
    return [
      `Dear ${c.person || `Hiring Team at ${company}`},`,
      '',
      `I'm applying for the ${role} role at ${company}. I'm a backend engineer with 2+ years of experience building services in Python and Java. At HiLabs I work on the backend of a data platform that processes 1,000+ files a day: ingestion pipelines, Spring Boot services, and SQL that stays fast at tens of millions of rows.`,
      '',
      ...(c.proofs.length ? ['A few things that map to what you are looking for:', ...c.proofs.map((p) => `- ${p}`), ''] : []),
      ...(skills ? [`I work day to day with ${skills}, which your description calls out.`, ''] : []),
      "I've attached my résumé.",
      `More detail, with architecture diagrams and live demos: ${c.portfolio}`,
      '',
      "I'd welcome the chance to talk.",
      '',
      'Best regards,',
      'Ayush Anand',
      [c.email, c.phone].filter(Boolean).join(' · '),
    ].join('\n');
  }
  if (kind === 'followup') {
    return [
      `Hi ${c.person || 'there'},`,
      '',
      `I applied for the ${role} role at ${company}${c.applied ? ` on ${fmtDate(c.applied)}` : ''} and wanted to follow up. I'm still very interested${skills ? `; my day-to-day work with ${skills} lines up closely with the role` : ''}.`,
      '',
      "I've attached my résumé again for convenience. Happy to share anything else that would help.",
      '',
      'Thanks,',
      'Ayush Anand',
    ].join('\n');
  }
  if (kind === 'thanks') {
    return [
      `Hi ${c.person || 'there'},`,
      '',
      `Thank you for taking the time to talk with me about the ${role} role at ${company}. I enjoyed learning about the team and the problems you are working on, and it made me even more interested in the role.`,
      ...(skills ? ['', `The role's focus on ${skills} is exactly the work I enjoy doing.`] : []),
      '',
      'Looking forward to hearing about next steps.',
      '',
      'Best regards,',
      'Ayush Anand',
    ].join('\n');
  }
  if (kind === 'linkedin') {
    // LinkedIn connection notes are capped at 300 characters: keep the first proof point only if it fits
    const note = (proof: string) =>
      `Hi ${c.person || 'there'}, I just applied for the ${role} role at ${company}. Backend engineer (Python/Java, 2+ yrs) at HiLabs.${proof} Résumé: ${c.resume}`;
    const withProof = c.proofs[0] ? note(` Recently ${lc(c.proofs[0]).replace(/\.$/, '')}.`) : '';
    return withProof && withProof.length <= 300 ? withProof : note('');
  }
  return [
    `Hi ${c.person || '[name]'}, hope you're doing well!`,
    '',
    `I'm interested in the ${role} role at ${company}. It lines up closely with what I do at HiLabs${skills ? `: ${skills}` : ''}${c.proofs[0] ? `, most recently ${lc(c.proofs[0]).replace(/\.$/, '')}` : ''}.`,
    '',
    "Would you be open to referring me? I've attached my résumé.",
    '',
    'Thanks a lot, and happy to answer anything!',
  ].join('\n');
};

const ASK: Record<MsgKind, string> = {
  cover: 'a short cover letter (under 250 words)',
  linkedin: 'a LinkedIn connection note to the recruiter (under 300 characters)',
  referral: 'a friendly message asking a friend at the company for a referral (under 120 words)',
  followup: 'a short, polite follow-up email on my application (under 100 words)',
  thanks: 'a thank-you email after my interview (under 120 words)',
};
const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
export const messagePrompt = (kind: MsgKind, c: MsgCtx, jd: string, tex: string) => `Write ${ASK[kind]} for the ${c.role || 'role'} at ${c.company || 'this company'}${c.person ? `, addressed to ${c.person}` : ''}.

Rules:
- Use ONLY facts from my résumé below. Do not invent experience, numbers or skills.
- ${jd.trim() ? 'Pick the 2–3 achievements most relevant to the job description, and mirror its priorities.' : 'Pick my 2–3 strongest achievements for a backend role.'}
- Describe what I build (backend services, pipelines, SQL performance). Don't lead with the healthcare domain unless the job is in healthcare.
- ${kind === 'linkedin' ? `Include this link to my résumé exactly as written: ${c.resume}` : `Say that my résumé is attached (I attach it myself; don't include a résumé link).`}${kind === 'cover' ? `\n- You may add my portfolio link as a secondary line: ${c.portfolio}` : ''}
- Sound like a person, not a template. No buzzwords.
${jd.trim() ? `\nJob description:\n"""\n${jd.trim()}\n"""\n` : ''}
My résumé (.tex):
\`\`\`latex
${tex}
\`\`\``;

// ---------- GoatCounter insights ----------
export type RefStats = { visits: number; last: string; actions: { label: string; count: number }[] };

const label = (name: string) => {
  if (name === 'resume-download') return 'downloaded the résumé';
  if (name === 'resume-open') return 'opened the résumé link';
  if (name.startsWith('case-')) return `opened ${name.slice(5).replace(/-/g, ' ')}`;
  if (name.startsWith('play-')) return `playground: ${name.slice(5)}`;
  if (name === 'tour-start') return 'took the tour';
  if (name.startsWith('demo-')) return 'ran the pipeline demo';
  if (name === 'fit-check') return 'ran a fit check';
  if (name === 'present') return 'opened presentation mode';
  if (name === 'platform-map') return 'opened the platform map';
  if (name === 'link-copied') return 'copied a link';
  if (name === 'view-rec') return 'switched to recruiter view';
  return '';
};

/** Per-ref activity from GoatCounter event hits tagged "<event>@<ref>" over the last `days` days. */
export const fetchRefStats = async (token: string, days = 120): Promise<Map<string, RefStats>> => {
  const end = new Date(), start = new Date(Date.now() - days * 86400000);
  const ymd = (d: Date) => d.toISOString().slice(0, 10);
  const hits: any[] = [];
  let exclude: number[] = [];
  for (let page = 0; page < 10; page++) {
    // full timestamps: date-only values make the range end at 00:00 and miss today
    const q = new URLSearchParams({ start: `${ymd(start)}T00:00:00Z`, end: `${ymd(end)}T23:59:59Z`, limit: '100' });
    if (exclude.length) q.set('exclude_paths', exclude.join(','));
    const r = await fetch(`https://ayushanand.goatcounter.com/api/v0/stats/hits?${q}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (r.status === 401 || r.status === 403) throw new Error('GoatCounter rejected the API key (needs "read statistics" permission).');
    if (!r.ok) throw new Error(`GoatCounter returned ${r.status}.`);
    const data = await r.json();
    const batch: any[] = data.hits ?? [];
    hits.push(...batch);
    exclude = [...exclude, ...batch.map((h) => h.path_id).filter(Boolean)];
    if (!data.more || !batch.length) break;
    await new Promise((res) => setTimeout(res, 300)); // stay under the rate limit
  }
  const out = new Map<string, RefStats>();
  for (const h of hits) {
    const path: string = (h.path ?? '').replace(/^\//, '');
    const at = path.lastIndexOf('@');
    if (at < 1) continue;
    const name = path.slice(0, at), ref = path.slice(at + 1);
    const st = out.get(ref) ?? { visits: 0, last: '', actions: [] };
    const count = Number(h.count ?? 0);
    const days: string[] = (h.stats ?? []).filter((d: any) => Number(d.daily) > 0).map((d: any) => String(d.day));
    const last = days.sort().pop() ?? '';
    if (last > st.last) st.last = last;
    if (name === 'visit') st.visits += count;
    else {
      const l = label(name);
      if (l) st.actions.push({ label: l, count });
    }
    out.set(ref, st);
  }
  return out;
};

export const ago = (day: string) => {
  if (!day) return 'not opened yet';
  const d = Math.round((Date.parse(today()) - Date.parse(day)) / 86400000);
  return d <= 0 ? 'opened today' : d === 1 ? 'opened yesterday' : `opened ${d} days ago`;
};

// ---------- follow-up reminders ----------
export const daysSince = (d: string) => Math.round((Date.parse(today()) - Date.parse(d)) / 86400000);
export type Nudge = { app: App; kind: 'followup' | 'thanks'; reason: string };
/** Applications that need a message now. A sent nudge snoozes the next one for 7 days. */
export const nudges = (apps: App[]): Nudge[] => {
  const out: Nudge[] = [];
  for (const a of apps) {
    if (a.nudgedAt && daysSince(a.nudgedAt) < 7 && a.nudgedAt >= a.statusDate) continue;
    const d = daysSince(a.statusDate);
    if (a.status === 'applied' && d >= 7) out.push({ app: a, kind: 'followup', reason: `applied ${d} days ago, no reply yet` });
    if (a.status === 'screen' && d >= 5) out.push({ app: a, kind: 'followup', reason: `screen ${d} days ago, check in on next steps` });
    if (a.status === 'interview' && d >= 0 && d <= 2 && !(a.nudgedAt >= a.statusDate)) out.push({ app: a, kind: 'thanks', reason: d === 0 ? 'interview today, send a thank-you' : `interview ${d} day${d === 1 ? '' : 's'} ago, send a thank-you` });
    if (a.status === 'interview' && d >= 7) out.push({ app: a, kind: 'followup', reason: `interview ${d} days ago, ask about next steps` });
  }
  return out;
};

/** A calendar reminder (.ics) for the next working morning, 10:00 local time. */
export const ics = (title: string, body: string) => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  const p = (n: number) => String(n).padStart(2, '0');
  const day = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  const escIcs = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ayush//studio//EN', 'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}@studio`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART:${day}T100000`, `DTEND:${day}T101500`,
    `SUMMARY:${escIcs(title)}`, `DESCRIPTION:${escIcs(body)}`,
    'BEGIN:VALARM', 'TRIGGER:-PT0M', 'ACTION:DISPLAY', `DESCRIPTION:${escIcs(title)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
};

// ---------- pipeline stats ----------
export type Stats = {
  total: number; funnel: { stage: Status; n: number }[]; response: number; opened: number | null;
  scoreWith: number | null; scoreWithout: number | null;
};
export const stats = (apps: App[], insights?: Map<string, { visits: number; last: string }>): Stats => {
  const sent = apps.filter((a) => RANK[a.best] >= 1);
  const reached = (s: Status) => sent.filter((a) => RANK[a.best] >= RANK[s]).length;
  const avg = (xs: App[]) => (xs.length && xs.some((a) => a.score) ? Math.round(xs.reduce((t, a) => t + a.score, 0) / xs.length) : null);
  const progressed = sent.filter((a) => RANK[a.best] >= RANK.interview);
  return {
    total: apps.length,
    funnel: (['applied', 'screen', 'interview', 'offer'] as Status[]).map((stage) => ({ stage, n: reached(stage) })),
    response: sent.length ? Math.round((reached('screen') / sent.length) * 100) : 0,
    opened: insights && insights.size ? Math.round((sent.filter((a) => insights.get(a.ref)?.last).length / Math.max(sent.length, 1)) * 100) : null,
    scoreWith: avg(progressed),
    scoreWithout: avg(sent.filter((a) => RANK[a.best] < RANK.interview)),
  };
};

// ---------- sync through a private GitHub Gist ----------
const GH = 'studio.ghToken', GIST = 'studio.gistId', FILE = 'portfolio-studio.json', DESC = 'portfolio studio · application tracker (private)';
export const getGh = () => { try { return localStorage.getItem(GH) ?? ''; } catch { return ''; } };
export const setGh = (t: string) => { if (t) localStorage.setItem(GH, t.trim()); else { localStorage.removeItem(GH); localStorage.removeItem(GIST); } };
const gh = async (path: string, token: string, init: RequestInit = {}) => {
  const r = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (r.status === 401) throw new Error('GitHub rejected the token.');
  if (r.status === 403 || r.status === 404) throw new Error('The token needs the "gist" permission.');
  if (!r.ok) throw new Error(`GitHub returned ${r.status}.`);
  return r.json();
};
type Payload = { apps: App[]; deleted: Record<string, string> };

/** Pull the gist, merge (newest edit wins, deletions stick), push the result. Returns the merged apps. */
export const syncGist = async (token: string, local: App[]): Promise<App[]> => {
  let id = localStorage.getItem(GIST) ?? '';
  if (!id) {
    const mine: any[] = await gh('/gists?per_page=100', token);
    id = mine.find((g) => g.files?.[FILE])?.id ?? '';
  }
  let remote: Payload = { apps: [], deleted: {} };
  if (id) {
    const g = await gh(`/gists/${id}`, token);
    try { remote = JSON.parse(g.files?.[FILE]?.content ?? '{}'); } catch {}
  }
  const deleted = { ...(remote.deleted ?? {}), ...loadDeleted() };
  const byId = new Map<string, App>();
  for (const a of [...(remote.apps ?? []).map(normalize), ...local]) {
    const prev = byId.get(a.id);
    if (!prev || a.updated > prev.updated) byId.set(a.id, a);
  }
  const merged = [...byId.values()]
    .filter((a) => !(deleted[a.id] && deleted[a.id] >= a.updated))
    .sort((a, b) => b.date.localeCompare(a.date));
  const body = JSON.stringify({ description: DESC, ...(id ? {} : { public: false }), files: { [FILE]: { content: JSON.stringify({ apps: merged, deleted }, null, 2) } } });
  const saved = await gh(id ? `/gists/${id}` : '/gists', token, { method: id ? 'PATCH' : 'POST', body });
  localStorage.setItem(GIST, saved.id);
  localStorage.setItem(DELETED, JSON.stringify(deleted));
  return merged;
};
