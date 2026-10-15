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
};

const KEY = 'studio.apps', TOKEN = 'studio.gcToken';
const read = <T>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) ?? '') ?? d; } catch { return d; } };
export const loadApps = (): App[] => read<App[]>(KEY, []);
export const saveApps = (apps: App[]) => localStorage.setItem(KEY, JSON.stringify(apps));
export const getToken = () => { try { return localStorage.getItem(TOKEN) ?? ''; } catch { return ''; } };
export const setToken = (t: string) => (t ? localStorage.setItem(TOKEN, t.trim()) : localStorage.removeItem(TOKEN));

export const slug = (company: string) =>
  company.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'company';
export const SITE = 'https://ezio-7.github.io/portfolio/';
export const refLink = (ref: string) => `${SITE}?ref=${ref}`;
export const today = () => new Date().toISOString().slice(0, 10);

// ---------- outreach messages (templates; no AI) ----------
export type MsgKind = 'cover' | 'linkedin' | 'referral';
export type MsgCtx = {
  company: string; role: string; person: string; link: string;
  matched: string[]; proofs: string[]; email: string; phone: string;
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
      `I'm applying for the ${role} role at ${company}. I'm a backend engineer with 2+ years of experience building services in Python and Java, currently on a healthcare data platform at HiLabs that processes 1,000+ files a day for US health plans.`,
      '',
      ...(c.proofs.length ? ['A few things that map to what you are looking for:', ...c.proofs.map((p) => `- ${p}`), ''] : []),
      ...(skills ? [`I work day to day with ${skills}, which your description calls out.`, ''] : []),
      `You can see the systems I have built, with architecture diagrams and live demos, here: ${c.link}`,
      '',
      "I'd welcome the chance to talk.",
      '',
      'Best regards,',
      'Ayush Anand',
      [c.email, c.phone].filter(Boolean).join(' · '),
    ].join('\n');
  }
  if (kind === 'linkedin') {
    // LinkedIn connection notes are capped at 300 characters: keep the first proof point only if it fits
    const note = (proof: string) =>
      `Hi ${c.person || 'there'}, I just applied for the ${role} role at ${company}. Backend engineer (Python/Java) on healthcare data at HiLabs.${proof} Portfolio: ${c.link}`;
    const withProof = c.proofs[0] ? note(` Recently ${lc(c.proofs[0]).replace(/\.$/, '')}.`) : '';
    return withProof && withProof.length <= 300 ? withProof : note('');
  }
  return [
    `Hi ${c.person || '[name]'}, hope you're doing well!`,
    '',
    `I'm interested in the ${role} role at ${company}. It lines up closely with what I do at HiLabs${skills ? `: ${skills}` : ''}${c.proofs[0] ? `, most recently ${lc(c.proofs[0]).replace(/\.$/, '')}` : ''}.`,
    '',
    `Would you be open to referring me? Here's my portfolio (my résumé is linked there): ${c.link}`,
    '',
    'Thanks a lot, and happy to answer anything!',
  ].join('\n');
};

const ASK: Record<MsgKind, string> = {
  cover: 'a short cover letter (under 250 words)',
  linkedin: 'a LinkedIn connection note to the recruiter (under 300 characters)',
  referral: 'a friendly message asking a friend at the company for a referral (under 120 words)',
};
export const messagePrompt = (kind: MsgKind, c: MsgCtx, jd: string, tex: string) => `Write ${ASK[kind]} for the ${c.role || 'role'} at ${c.company || 'this company'}${c.person ? `, addressed to ${c.person}` : ''}.

Rules:
- Use ONLY facts from my résumé below. Do not invent experience, numbers or skills.
- Pick the 2–3 achievements most relevant to the job description.
- Include this link to my portfolio exactly as written: ${c.link}
- Sound like a person, not a template. No buzzwords.

Job description:
"""
${jd.trim()}
"""

My résumé (.tex):
\`\`\`latex
${tex}
\`\`\``;

// ---------- GoatCounter insights ----------
export type RefStats = { visits: number; last: string; actions: { label: string; count: number }[] };

const label = (name: string) => {
  if (name === 'resume-download') return 'downloaded the résumé';
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
