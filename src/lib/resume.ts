// Résumé engine for the studio: parse the LaTeX résumé, score it against a JD,
// tailor the .tex in place (reorder / trim lines only), and render an HTML preview.
import { fitSkills } from '../data/fitcheck';

export type Bullet = { tex: string; text: string; score: number };
export type Block = { title: string; stack: string; bullets: Bullet[]; score: number };
export type Role = { title: string; dates: string; context?: string; blocks: Block[]; bullets: Bullet[] };
export type Section =
  | { kind: 'summary'; title: string; tex: string }
  | { kind: 'roles'; title: string; roles: Role[] }
  | { kind: 'skills'; title: string; rows: { label: string; items: string[] }[] }
  | { kind: 'education'; title: string; school: string; dates: string; degree: string; gpa: string }
  | { kind: 'list'; title: string; bullets: Bullet[] };
export type Header = { name: string; email: string; phone: string; links: { href: string; text: string }[] };
export type Model = { header: Header; sections: Section[] };

// ---------- LaTeX helpers ----------
/** Balanced {…} arguments of `macro` on a line, e.g. args('\\a{x}{y}', '\\a') → ['x', 'y'] */
export const args = (line: string, macro: string): string[] => {
  const i = line.indexOf(macro + '{');
  if (i < 0) return [];
  const out: string[] = [];
  let p = i + macro.length;
  while (line[p] === '{') {
    let depth = 0, j = p;
    for (; j < line.length; j++) {
      if (line[j] === '{' && line[j - 1] !== '\\') depth++;
      else if (line[j] === '}' && line[j - 1] !== '\\') { depth--; if (!depth) break; }
    }
    out.push(line.slice(p + 1, j));
    p = j + 1;
  }
  return out;
};

const unwrap = (s: string, macro: string, open: string, close: string) => {
  const re = new RegExp(`\\\\${macro}\\{([^{}]*)\\}`, 'g');
  let prev;
  do { prev = s; s = s.replace(re, `${open}$1${close}`); } while (s !== prev);
  return s;
};
const symbols = (s: string) =>
  s.replace(/(?<!\\)~/g, '\u00a0').replace(/\$\\sim\$/g, '∼').replace(/\$\\times\$/g, '×').replace(/\$\\rightarrow\$/g, '→').replace(/\$\\mid\$/g, '|')
    .replace(/\\textbar\{\}/g, '|').replace(/\\%/g, '%').replace(/\\\$/g, '$').replace(/\\#/g, '#').replace(/\\_/g, '_')
    .replace(/--/g, '–');

/** Plain text, for scoring */
export const texToText = (tex: string) =>
  symbols(['textbf', 'textit', 'texttt', 'emph'].reduce((s, m) => unwrap(s, m, '', ''), tex)).replace(/\\&/g, '&').replace(/[{}]/g, '');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Inline LaTeX → HTML for the preview */
export const texToHtml = (tex: string) => {
  let s = esc(tex).replace(/\\&amp;/g, '&amp;');
  s = s.replace(/\\href\{([^{}]*)\}\{([^{}]*)\}/g, '<a href="$1">$2</a>');
  s = unwrap(s, 'textbf', '<b>', '</b>');
  s = unwrap(s, 'textit', '<i>', '</i>');
  s = unwrap(s, 'texttt', '<code>', '</code>');
  return symbols(s).replace(/[{}]/g, '');
};

// ---------- parse ----------
export const parse = (tex: string): Model => {
  const lines = tex.split('\n');
  const header: Header = { name: '', email: '', phone: '', links: [] };
  const body = tex.slice(tex.indexOf('\\begin{document}'), tex.indexOf('\\section{'));
  header.name = body.match(/\\LARGE\s+([^}]+)\}/)?.[1].trim() ?? '';
  header.email = body.match(/mailto:([^}]+)\}/)?.[1] ?? '';
  header.phone = body.match(/tel:([^}]+)\}\{([^}]+)\}/)?.[2] ?? '';
  for (const m of body.matchAll(/\\href\{(https?:[^}]+)\}\{([^}]+)\}/g)) header.links.push({ href: m[1], text: m[2] });

  const sections: Section[] = [];
  let sec: Section | null = null, role: Role | null = null, block: Block | null = null;
  let inSub = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('%')) continue;
    const title = args(line, '\\section')[0];
    if (title) {
      const t = title.toLowerCase();
      sec = t.includes('summary') ? { kind: 'summary', title, tex: '' }
        : t.includes('skill') ? { kind: 'skills', title, rows: [] }
        : t.includes('education') ? { kind: 'education', title, school: '', dates: '', degree: '', gpa: '' }
        : t.includes('award') || t.includes('achievement') ? { kind: 'list', title, bullets: [] }
        : { kind: 'roles', title, roles: [] };
      sections.push(sec);
      role = null; block = null;
      continue;
    }
    if (!sec || line.startsWith('\\end{document}')) continue;
    if (sec.kind === 'summary') { if (!line.startsWith('\\')) sec.tex = sec.tex ? `${sec.tex} ${line}` : line; continue; }
    if (sec.kind === 'skills') {
      const m = line.match(/^\\textbf\{(.+?):\}\s*(.*?)(\s*\\\\(\[[^\]]*\])?)?$/);
      if (m) sec.rows.push({ label: m[1].replace(/\\&/g, '&'), items: m[2].split(',').map((x) => x.trim()).filter(Boolean) });
      continue;
    }
    if (sec.kind === 'education') {
      const a = args(line, '\\resumeSubheadingTwo');
      if (a.length) { sec.school = a[0]; sec.dates = a[1]; const nxt = args('\\x' + lines[i + 1].trim(), '\\x'); sec.degree = nxt[0] ?? ''; sec.gpa = nxt[1] ?? ''; }
      continue;
    }
    if (line.startsWith('\\resumeSubPointListStart')) { inSub = true; continue; }
    if (line.startsWith('\\resumeSubPointListEnd')) { inSub = false; continue; }
    const item = args(line, '\\resumeItem')[0];
    if (item !== undefined) {
      const b: Bullet = { tex: item, text: texToText(item), score: 0 };
      if (sec.kind === 'list') sec.bullets.push(b);
      else if (sec.kind === 'roles' && inSub && block) block.bullets.push(b);
      else if (sec.kind === 'roles' && role) role.bullets.push(b);
      continue;
    }
    if (sec.kind !== 'roles') continue;
    const sh = args(line, '\\resumeSubheading');
    if (sh.length) { role = { title: sh[0], dates: sh[1], blocks: [], bullets: [] }; sec.roles.push(role); block = null; continue; }
    const ctx = args(line, '\\resumeContext')[0];
    if (ctx && role) { role.context = ctx; continue; }
    const ph = args(line, '\\resumeProjectHeading');
    if (ph.length && role) { block = { title: ph[0], stack: ph[1], bullets: [], score: 0 }; role.blocks.push(block); }
  }
  return { header, sections };
};

// ---------- scoring ----------
const STOP = new Set('about above after again against all also although among and any are because been before being below between both but cannot could does doing down during each experience few from further have having here into itself just more most must other over own same should some such than that their them then there these they this those through under until very were what when where which while with within without would your will work working team teams strong ability skills years role using build building good great well looking join plus preferred required responsibilities requirements including across ensure'.split(' '));
const tokens = (s: string) => new Set((s.toLowerCase().match(/[a-z][a-z+#.]{4,}/g) ?? []).filter((w) => !STOP.has(w)));

export type JdSignal = { skills: { name: string; re: RegExp; weight: number; have: boolean }[]; words: Set<string> };
export const readJd = (jd: string): JdSignal => ({
  skills: fitSkills
    .map((s) => {
      const hits = jd.match(new RegExp(s.jd, (s.flags ?? 'i') + 'g'))?.length ?? 0;
      const re = new RegExp([s.jd, s.find].filter(Boolean).join('|'), s.flags ?? 'i');
      return { name: s.name, re, weight: Math.min(hits, 3), have: s.have };
    })
    .filter((s) => s.weight > 0),
  words: tokens(jd),
});

const scoreText = (text: string, sig: JdSignal) => {
  let s = 0;
  for (const k of sig.skills) if (k.re.test(text)) s += k.weight;
  let overlap = 0;
  for (const w of tokens(text)) if (sig.words.has(w)) overlap += 0.25;
  return s + Math.min(overlap, 1);
};

// ---------- tailor (.tex in, .tex out; only reorders, trims and appends) ----------
export type TailorOpts = { trim: boolean; summary: boolean };
export type TailorResult = { tex: string; matched: string[]; gaps: string[]; score: number; proofs: string[] };

export const tailor = (tex: string, jd: string, opts: TailorOpts): TailorResult => {
  const sig = readJd(jd);
  const matched = sig.skills.filter((s) => s.have).map((s) => s.name);
  const gaps = sig.skills.filter((s) => !s.have).map((s) => s.name);
  const score = sig.skills.length ? Math.round((matched.length / sig.skills.length) * 100) : 0;
  if (!jd.trim()) return { tex, matched, gaps, score, proofs: [] };

  const lines = tex.split('\n');
  // bullets with a bolded metric (220×, $94K, 43M+…) are proof points: never trim them
  const itemScore = (l: string) => {
    const tex = args(l.trim(), '\\resumeItem')[0] ?? '';
    return scoreText(texToText(tex), sig) + (/\\textbf\{[^}]*\d/.test(tex) ? 0.5 : 0);
  };
  const isItem = (l: string) => l.trim().startsWith('\\resumeItem{');

  // reorder (and optionally trim) the \resumeItem lines between two markers
  const reorderItems = (seg: string[], keepMin: number) => {
    const idx = seg.map((l, i) => (isItem(l) ? i : -1)).filter((i) => i >= 0);
    if (idx.length < 2) return seg;
    const items = idx.map((i, order) => ({ line: seg[i], s: itemScore(seg[i]), order }));
    const sorted = [...items].sort((a, b) => b.s - a.s || a.order - b.order);
    const kept = opts.trim ? sorted.filter((it, k) => it.s > 0 || k < keepMin) : sorted;
    const out = seg.filter((_, i) => !idx.includes(i));
    out.splice(idx[0], 0, ...kept.map((k) => k.line));
    return out;
  };

  // strongest bullets for this JD (metric bullets preferred), used in cover letters and notes
  const proofs = lines.filter(isItem).map((l) => ({ l, s: itemScore(l) }))
    .filter((x) => /\\textbf\{[^}]*\d/.test(x.l)).sort((a, b) => b.s - a.s).slice(0, 3)
    .map((x) => texToText(args(x.l.trim(), '\\resumeItem')[0]).replace(/\u00a0/g, ' ').replace(/∼/g, '~'));

  const out: string[] = [];
  let section = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i], t = line.trim();
    const title = args(t, '\\section')[0];
    if (title) section = title.toLowerCase();

    // project blocks: reorder blocks by relevance, and bullets inside each block
    if (t.startsWith('\\resumeProjectListStart')) {
      const end = lines.findIndex((l, j) => j > i && l.trim().startsWith('\\resumeProjectListEnd'));
      const region = lines.slice(i + 1, end);
      const blocks: { lines: string[]; s: number; order: number }[] = [];
      let cur: string[] | null = null;
      for (const l of region) {
        if (l.trim().startsWith('\\resumeProjectHeading')) { cur = [l]; blocks.push({ lines: cur, s: 0, order: blocks.length }); }
        else if (cur && l.trim()) cur.push(l);
      }
      for (const b of blocks) {
        const stack = texToText(args(b.lines[0].trim(), '\\resumeProjectHeading')[1] ?? '');
        const bullets = b.lines.filter(isItem).map(itemScore).sort((x, y) => y - x);
        b.s = bullets.slice(0, 3).reduce((a, x) => a + x, 0) + sig.skills.filter((k) => k.re.test(stack)).length;
        b.lines = reorderItems(b.lines, 3);
      }
      blocks.sort((a, b) => b.s - a.s || a.order - b.order);
      out.push(line, '');
      blocks.forEach((b) => out.push(...b.lines, ''));
      i = end - 1;
      continue;
    }

    // plain bullet lists under a role (not awards)
    if (t.startsWith('\\resumeItemListStart') && !section.includes('award')) {
      const end = lines.findIndex((l, j) => j > i && l.trim().startsWith('\\resumeItemListEnd'));
      out.push(line, ...reorderItems(lines.slice(i + 1, end), 3));
      i = end - 1;
      continue;
    }

    // skills: JD-matched items first
    const sk = t.match(/^(\\textbf\{.+?:\}\s*)(.*?)(\s*\\\\(\[[^\]]*\])?)?$/);
    if (section.includes('skill') && sk) {
      const items = sk[2].split(',').map((x) => x.trim());
      const hit = (x: string) => sig.skills.some((k) => k.re.test(x));
      const lead = line.match(/^\s*/)![0];
      out.push(`${lead}${sk[1]}${[...items.filter(hit), ...items.filter((x) => !hit(x))].join(', ')}${sk[3] ?? ''}`);
      continue;
    }

    // summary: name up to three matched strengths the summary doesn't already mention
    if (opts.summary && section.includes('summary') && t && !t.startsWith('\\') && !t.startsWith('%')) {
      const plain = texToText(t).toLowerCase();
      const extra = matched.filter((m) => !plain.includes(m.toLowerCase().split(' ')[0])).slice(0, 3);
      out.push(extra.length ? `${line.replace(/\s+$/, '')} Also hands-on with ${list(extra)}.` : line);
      continue;
    }

    out.push(line);
  }
  return { tex: out.join('\n').replace(/\n{3,}/g, '\n\n'), matched, gaps, score, proofs };
};
const list = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`).replace(/&/g, '\\&');

// ---------- Claude prompt ----------
export const claudePrompt = (jd: string, tex: string) => `I'm applying for the job below. Tailor my résumé for it.

Rules:
- Use ONLY facts that are already in my LaTeX résumé. Do not invent experience, employers, dates, numbers or skills.
- You may reorder sections, project blocks and bullets, trim less relevant bullets, and rephrase bullets to mirror the job's wording where it stays truthful.
- Keep my LaTeX template, macros and formatting exactly as they are, and keep it to two pages.
- Return the complete .tex file first. Then list: (1) requirements in the job I don't meet, (2) the bullets you changed and why.

Job description:
"""
${jd.trim()}
"""

My résumé (.tex):
\`\`\`latex
${tex}
\`\`\``;

// ---------- ATS keyword check ----------
/** JD terms (known skills + repeated words) that don't appear anywhere in the résumé text */
export const atsMissing = (jd: string, tex: string): { term: string; skill: boolean }[] => {
  const text = texToText(tex).toLowerCase();
  const sig = readJd(jd);
  const missing: { term: string; skill: boolean; n: number }[] = [];
  for (const k of sig.skills) if (!k.re.test(text)) missing.push({ term: k.name, skill: true, n: 10 + k.weight });
  const counts = new Map<string, number>();
  for (const raw of jd.toLowerCase().match(/[a-z][a-z+#.-]{4,}/g) ?? []) {
    const w = raw.replace(/[.-]+$/, '');
    if (w.length >= 5 && !STOP.has(w)) counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  for (const [w, n] of counts) {
    const stem = w.replace(/(ing|ed|es|s)$/, '');
    if (stem.length >= 4 && !text.includes(stem) && !missing.some((m) => m.term.toLowerCase() === w)) missing.push({ term: w, skill: false, n });
  }
  return missing.sort((a, b) => b.n - a.n).slice(0, 18).map(({ term, skill }) => ({ term, skill }));
};
