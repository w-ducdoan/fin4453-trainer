/* ===== APP: state, sync, rendering, grading ===== */
(() => {
  const { esc, comma, rng, newSeed, sataScore } = E;
  const $ = (s, r = document) => r.querySelector(s);
  const EXAM_DAY = new Date(2026, 9, 27); // Tue Oct 27, in class
  const LS_KEY = 'fin4453-trainer-v1', LS_MOCK = 'fin4453-mock-v1', LS_VIEW = 'fin4453-view';
  const lsGet = k => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } };
  const lsDel = k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } };

  // ---------- progress ----------
  const blank = () => ({ v: 1, updated: 0, attempts: [], lessons: {}, mocks: [], practice: [], mistakes: [] });
  const S = { view: 'home', prog: Object.assign(blank(), lsGet(LS_KEY) || {}), sync: 'local', ref: null, sample: null, drill: null, lesson: null, mock: null, prac: null };
  const QS = new Map();
  const SID = Date.now().toString(36) + '-';

  function merge(a, b) {
    const out = blank(), key = x => x.t + '|' + x.g + '|' + x.s + '|' + (x.k || '');
    const byT = (arr, n) => { const m = new Map(); arr.forEach(x => m.set(x.t + '|' + (x.k || x.q || ''), x)); return [...m.values()].sort((x, y) => x.t - y.t).slice(-n); };
    const seen = new Map(); [...(a.attempts || []), ...(b.attempts || [])].forEach(x => seen.set(key(x), x));
    out.attempts = [...seen.values()].sort((x, y) => x.t - y.t).slice(-2000);
    out.lessons = Object.assign({}, a.lessons || {}); Object.entries(b.lessons || {}).forEach(([k, v]) => { if (!out.lessons[k] || (v.sc || 0) > (out.lessons[k].sc || 0)) out.lessons[k] = v; });
    out.mocks = byT([...(a.mocks || []), ...(b.mocks || [])], 60);
    out.practice = byT([...(a.practice || []), ...(b.practice || [])], 200);
    out.mistakes = byT([...(a.mistakes || []), ...(b.mistakes || [])], 60);
    out.updated = Math.max(a.updated || 0, b.updated || 0);
    return out;
  }
  let saveTimer = null, writing = false, again = false;
  function save() { S.prog.updated = Date.now(); lsSet(LS_KEY, S.prog); if (!S.ref) return; clearTimeout(saveTimer); saveTimer = setTimeout(flush, 1200); }
  async function flush() {
    if (!S.ref) return; if (writing) { again = true; return; }
    writing = true; setSync('saving');
    try { await S.ref.set({ prog: JSON.parse(JSON.stringify(S.prog)) }); setSync('synced'); } catch (e) { setSync('local'); }
    writing = false; if (again) { again = false; flush(); }
  }
  const SYNC_TXT = { local: 'Saved on this device', saving: 'Saving…', synced: 'Synced to your account' };
  function setSync(s) { S.sync = s; const el = $('#sync'); if (el) { el.dataset.state = s; el.textContent = SYNC_TXT[s]; } }
  function record(skill, gen, sc, mode, k, x) { const a = { t: Date.now(), s: skill, g: gen, sc: Math.round(sc * 100) / 100, m: mode, k: k ? SID + k : '' }; if (x) a.x = x; S.prog.attempts.push(a); }

  async function connect() {
    if (!window.claude || typeof window.claude.use !== 'function') return;
    try {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      const uid = user ? await user.id() : null;
      if (db && uid) {
        S.ref = db.collection('data/users/' + uid).doc('progress');
        const snap = await S.ref.get();
        if (snap.exists && snap.data() && snap.data().prog) { S.prog = merge(S.prog, snap.data().prog); lsSet(LS_KEY, S.prog); render(); }
        setSync('synced'); if (S.prog.attempts.length) flush();
      }
    } catch (e) { setSync('local'); }
    try { S.sample = await window.claude.use('sample'); } catch (e) { S.sample = null; }
    render();
  }

  // ---------- mastery ----------
  function mastery() {
    const M = {}; Object.keys(C.SKILLS).forEach(k => (M[k] = { n: 0, m: 0, last: [] }));
    S.prog.attempts.forEach(a => { const x = M[a.s]; if (!x) return; const w = a.m === 'lesson' ? 0.15 : 0.3; x.m = x.n === 0 ? a.sc * (a.m === 'lesson' ? 0.6 : 1) : x.m * (1 - w) + a.sc * w; x.n++; x.last.push(a.sc); if (x.last.length > 10) x.last.shift(); });
    Object.values(M).forEach(x => { x.acc = x.last.length ? x.last.reduce((s, v) => s + v, 0) / x.last.length : 0; x.level = x.n === 0 ? 'new' : x.m < 0.5 ? 'weak' : (x.m >= 0.8 && x.n >= 5) ? 'solid' : 'mid'; });
    return M;
  }
  const LEVEL = { new: 'Not started', weak: 'Needs work', mid: 'Getting there', solid: 'Solid' };
  function readiness(M) { let a = 0, b = 0; Object.entries(C.SKILLS).forEach(([k, s]) => { a += s.w * (M[k].n ? M[k].m : 0); b += s.w; }); return a / b; }
  function nextUp(M, n = 3) {
    return Object.entries(C.SKILLS).map(([k, s]) => ({ k, s, pr: s.w * (1 - (M[k].n ? M[k].m : 0)) * (M[k].n < 3 ? 1.25 : 1) })).sort((a, b) => b.pr - a.pr).slice(0, n).map(({ k, s }) => {
      const L = C.LESSONS.find(l => l.id === s.lesson), done = S.prog.lessons[s.lesson];
      return { k, s, L, act: done ? 'drill' : 'lesson', why: M[k].n === 0 ? 'Not tried yet' : `${pct(M[k].m)} mastery over ${M[k].n} answers` };
    });
  }

  // ---------- helpers ----------
  const pct = v => Math.round(v * 100) + '%';
  const pts = v => (+v.toFixed(2)).toString();
  function fmtAns(a, p) { const d = Math.abs(a) < 1000 && !Number.isInteger(a) ? 2 : 0; return (p.prefix || '') + comma(a, d) + (p.unit ? ' ' + p.unit : ''); }
  function parseNum(s) { if (s == null) return NaN; s = String(s).trim().replace(/[−–—]/g, '-').replace(/^\((.*)\)$/, '-$1').replace(/[,\s$%]/g, ''); if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return NaN; return parseFloat(s); }
  function md(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split(/\n{2,}/).map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join(''); }
  const plain = h => String(h).replace(/<sub>(.*?)<\/sub>/g, '_$1').replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<br\s*\/?>/g, '\n').replace(/<\/(td|th)>/g, ' | ').replace(/<\/tr>/g, '\n').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  function daysLeft() { const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((EXAM_DAY - t) / 864e5); }
  function countdown() { const d = daysLeft(); return d > 1 ? `${d} days to go` : d === 1 ? 'Tomorrow' : d === 0 ? 'Exam day. You\'ve got this.' : 'Exam done'; }
  const when = t => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // ---------- figures ----------
  const FIG = {
    timing: () => E.profile([{ name: 'C · Pop-up (front-loaded)', cf: [-50000, 35000, 25000, 15000] }, { name: 'D · Tech (back-loaded)', cf: [-50000, 10000, 25000, 50000] }], { lo: 0, hi: 0.35, mark: 0.1, cross: true, title: 'Timing problem: the profiles cross at 18.3%' }),
    mine: () => E.profile([{ name: 'Strip mine', cf: [-100000, 320000, -250000] }], { lo: 0, hi: 1.2, title: 'A −, +, − project: the profile is a hill' }),
    three: () => E.profile([{ name: 'Final outflow 250k: two IRRs', cf: [-100000, 320000, -250000] }, { name: 'Final outflow 256k: touches zero', cf: [-100000, 320000, -256000] }, { name: 'Final outflow 280k: no IRR', cf: [-100000, 320000, -280000] }], { lo: 0, hi: 1.2, irr: false, title: 'As the final outflow grows, the hill sinks' }),
    b1: () => E.profile([{ name: 'Pedal Shack', cf: [-25000, 15000, 15000, 5000] }, { name: 'Bayline', cf: [-250000, 100000, 110000, 120000] }], { lo: 0, hi: 0.3, mark: 0.1, cross: true, title: 'B1: NPV profiles' }),
    b2: () => E.profile([{ name: 'Gulf Breeze', cf: [-100000, 230000, -140000] }], { lo: 0, hi: 0.8, mark: 0.1, title: 'B2: the hill never reaches zero' }),
    bridge() {
      const W = 640, H = 250, steps = [['Enterprise value', 28.52, 0, 'p'], ['+ Cash', 0.8, 28.52, 'up'], ['− Debt', -3.2, 29.32, 'dn'], ['= Equity value', 26.12, 0, 'p']], max = 31, X0 = 70, bw = 110, gap = 26, Y = v => 200 - v / max * 170;
      let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cooper Dental equity bridge: 28.52 plus 0.8 minus 3.2 equals 26.12 million">`;
      steps.forEach(([lab, v, base, k], i) => { const x = X0 + i * (bw + gap), top = Math.max(base, base + v), bot = Math.min(base, base + v); s += `<rect class="wf-${k}" x="${x}" y="${Y(top)}" width="${bw}" height="${Math.max(2, Y(bot) - Y(top))}" rx="3"/><text class="anno b" x="${x + bw / 2}" y="${Y(top) - 7}" text-anchor="middle">$${Math.abs(v).toFixed(2)}M</text><text class="tick" x="${x + bw / 2}" y="222" text-anchor="middle">${lab}</text>`; });
      s += `<line class="zero" x1="${X0 - 10}" x2="${W - 20}" y1="200" y2="200"/><text class="anno" x="${W - 20}" y="244" text-anchor="end">÷ 1,000,000 shares = $26.12 per share</text>`;
      return s + '</svg>';
    }
  };
  const figCache = {};
  const fillFigs = h => String(h).replace(/\{\{fig:(\w+)\}\}/g, (_, k) => `<div class="fig">${figCache[k] || (figCache[k] = FIG[k] ? FIG[k]() : '')}</div>`);

  // ---------- question component ----------
  let qSeq = 0;
  function makeQ(q, mode, meta) { const id = 'q' + (++qSeq); QS.set(id, { q, mode, ans: {}, res: {}, graded: false, meta: meta || {} }); return id; }
  const exhibitsHTML = q => q.exhibits.map(x => `<div class="exh">${fillFigs(x.html)}</div>`).join('');
  function partHTML(id, pi) {
    const st = QS.get(id), p = st.q.parts[pi], a = st.ans[pi], r = st.res[pi], locked = st.graded;
    let body = '';
    if (p.kind === 'sata') {
      const tk = a || [];
      body = `<div class="sata" role="group" aria-label="Select all that apply">${p.options.map((o, i) => {
        const on = tk.includes(i); let c = 'sopt' + (on ? ' on' : ''), chip = '';
        if (locked) { if (on && o.ok) { c += ' right'; chip = '<span class="chip good">ticked · correct</span>'; } else if (on && !o.ok) { c += ' wrong'; chip = '<span class="chip bad">ticked · wrong · −1</span>'; } else if (!on && o.ok) { c += ' missed'; chip = '<span class="chip mid">missed · correct statement</span>'; } else { c += ' fine'; chip = '<span class="chip">left blank · correctly</span>'; } }
        return `<div class="${c}"><button class="sbox" role="checkbox" aria-checked="${on}" data-act="tick" data-q="${id}" data-p="${pi}" data-i="${i}" ${locked ? 'disabled' : ''}><span class="cb" aria-hidden="true"></span><span class="sl">(${String.fromCharCode(97 + i)})</span><span class="stx">${o.t}</span></button>${locked ? `<div class="why">${chip}<span>${o.why}</span></div>` : ''}</div>`;
      }).join('')}</div>`;
    } else if (p.kind === 'mc') body = `<div class="opts" role="radiogroup">${p.options.map((o, i) => { let c = 'opt'; if (a === i) c += ' sel'; if (locked) { if (i === p.answer) c += ' right'; else if (a === i) c += ' wrong'; } return `<button class="${c}" role="radio" aria-checked="${a === i}" data-act="mc" data-q="${id}" data-p="${pi}" data-i="${i}" ${locked ? 'disabled' : ''}><span class="dotsel"></span><span>${o}</span></button>`; }).join('')}</div>`;
    else if (p.kind === 'num') body = `<div class="numrow">${p.prefix ? `<span class="unit">${esc(p.prefix)}</span>` : ''}<input id="in-${id}-${pi}" class="num ${locked ? (r && r.sc === 1 ? 'right' : 'wrong') : ''}" inputmode="decimal" autocomplete="off" data-num data-q="${id}" data-p="${pi}" value="${esc(a == null ? '' : a)}" ${locked ? 'disabled' : ''} placeholder="Your answer" aria-label="Numeric answer">${p.unit ? `<span class="unit">${esc(p.unit)}</span>` : ''}</div>`;
    else body = `<textarea id="in-${id}-${pi}" class="txt" rows="5" data-text data-q="${id}" data-p="${pi}" ${locked ? 'disabled' : ''} placeholder="State your conclusion in a full sentence, then the reasoning…" aria-label="Written answer">${esc(a || '')}</textarea>`;
    let fb = '';
    if (locked && r) {
      if (p.kind === 'sata') { const s = r.s; fb = `<div class="fb ${s.pts >= 1.99 ? 'ok' : s.pts > 0 ? 'mid' : 'no'}"><b>${pts(s.pts)} / 2 points.</b> ${s.C} correct statement${s.C > 1 ? 's' : ''}; you ticked ${s.c} of them (+${pts(2 * s.c / s.C)})${s.w ? ` and ${s.w} wrong one${s.w > 1 ? 's' : ''} (−${s.w})` : ''}.${s.raw < 0 ? ' The score is floored at 0.' : ''}${s.w && s.c ? ` Leaving the wrong tick${s.w > 1 ? 's' : ''} blank would have scored ${pts(Math.max(0, 2 * s.c / s.C))}.` : ''}</div>`; }
      else if (p.kind === 'mc') fb = `<div class="fb ${r.sc === 1 ? 'ok' : 'no'}"><b>${r.sc === 1 ? 'Correct.' : 'Not quite.'}</b> ${p.explain || ''}</div>`;
      else if (p.kind === 'num') fb = `<div class="fb ${r.sc === 1 ? 'ok' : 'no'}"><b>${r.sc === 1 ? 'Correct.' : (isNaN(parseNum(a)) ? 'No number entered.' : 'Not quite.')}</b> Answer: <b>${fmtAns(p.answer, p)}</b>. ${p.explain || ''}</div>`;
      else fb = textFeedback(id, pi);
    }
    const ptag = p.kind === 'text' && p.pts ? `<span class="ptag">${pts(p.pts)} pt${p.pts === 1 ? '' : 's'}</span>` : '';
    return `<div class="part" id="p-${id}-${pi}"><div class="pq">${p.label ? `<span class="plabel">${esc(p.label)}</span>` : ''}<div>${p.q}${ptag}</div></div>${body}${fb}</div>`;
  }
  function textFeedback(id, pi) {
    const st = QS.get(id), p = st.q.parts[pi], r = st.res[pi] || {};
    let h = '';
    if (r.status === 'grading') h += `<div class="fb wait"><span class="spin"></span> Claude is grading your answer…</div>`;
    else if (r.status === 'claude') h += `<div class="fb ${r.sc >= 0.7 ? 'ok' : r.sc >= 0.4 ? 'mid' : 'no'}"><b>Claude's grade: ${pct(r.sc)}${p.pts ? ` (${pts(r.sc * p.pts)} / ${pts(p.pts)} pts)` : ''}</b>${md(r.feedback || '')}</div>`;
    else if (r.status === 'err') h += `<div class="fb mid">Claude couldn't grade this right now${r.why ? ' (' + esc(r.why) + ')' : ''}. Tick the key points you covered instead.</div>`;
    const covered = r.covered || [];
    h += `<div class="keypts"><div class="kh">Key points the grader looks for ${r.status === 'claude' ? '(✓ = Claude says you covered it)' : '(tick the ones you covered)'}</div>${p.points.map((pt, k) => `<label class="kp"><input type="checkbox" data-self data-q="${id}" data-p="${pi}" data-k="${k}" ${covered.includes(k) ? 'checked' : ''} ${r.status === 'claude' ? 'disabled' : ''}><span>${esc(pt)}</span></label>`).join('')}</div>`;
    h += `<details class="model" ${r.status !== 'grading' ? 'open' : ''}><summary>Model answer</summary><p>${esc(p.model)}</p></details>`;
    return h;
  }
  function qHTML(id, opts = {}) {
    const st = QS.get(id), q = st.q;
    return `<article class="qcard" id="${id}">
      <header class="qhead"><div class="qref">${q.num ? `${esc(q.num)} · ` : ''}${esc(q.examRef || '')}</div><h3>${esc(q.title)}</h3></header>
      ${q.stem ? `<p class="stem">${q.stem}</p>` : ''}${exhibitsHTML(q)}
      <div class="parts">${q.parts.map((_, pi) => partHTML(id, pi)).join('')}</div>
      ${opts.footer || ''}
    </article>`;
  }
  function rerenderPart(id, pi) { const el = document.getElementById(`p-${id}-${pi}`); if (el) el.outerHTML = partHTML(id, pi); }
  function gradeQ(id, mode) {
    const st = QS.get(id); st.graded = true; const textIdx = [];
    st.q.parts.forEach((p, pi) => {
      if (p.kind === 'sata') { const s = sataScore(p.options, st.ans[pi] || [], p.pts || 2); st.res[pi] = { sc: s.pts / s.max, s }; record(p.skill, st.q.gen, st.res[pi].sc, mode, id + pi, { c: s.c, C: s.C, w: s.w }); }
      else if (p.kind === 'mc') { st.res[pi] = { sc: st.ans[pi] === p.answer ? 1 : 0 }; record(p.skill, st.q.gen, st.res[pi].sc, mode, id + pi); }
      else if (p.kind === 'num') { const v = parseNum(st.ans[pi]); const allow = Math.max(p.tol.abs || 0, (p.tol.rel || 0) * Math.abs(p.answer)) + 1e-9; st.res[pi] = { sc: isFinite(v) && Math.abs(v - p.answer) <= allow ? 1 : 0 }; record(p.skill, st.q.gen, st.res[pi].sc, mode, id + pi); }
      else { st.res[pi] = { sc: 0, status: 'self', covered: [] }; textIdx.push(pi); }
    });
    return textIdx;
  }
  async function claudeGrade(items) {
    if (!S.sample || !items.length) return false;
    items.forEach(({ id, pi }) => { QS.get(id).res[pi] = { sc: 0, status: 'grading', covered: [] }; rerenderPart(id, pi); });
    const payload = items.map(({ id, pi }) => { const st = QS.get(id), p = st.q.parts[pi]; return { scenario: plain(st.q.stem + '\n' + st.q.exhibits.map(x => x.html).join('\n')).slice(0, 2500), question: plain(p.q), points: p.pts, model_answer: p.model, key_points: p.points, student_answer: st.ans[pi] || '' }; });
    const prompt = `You are grading short written answers on an undergraduate finance midterm (FIN 4453 Financial Modeling, Module 3: capital budgeting: NPV, IRR, NPV profiles, unconventional cash flows, operating cash flow, salvage, mid-year discounting, free cash flow, WACC, terminal value, the equity bridge, Buy/Hold/Sell, sensitivity tables). The professor's rules: a correct conclusion with no reasoning earns at most half credit; the reasoning is what is graded. For each item compare the student's answer with the model answer and the numbered key points (index from 0). A key point counts as covered if the student states the idea correctly in any wording, with the right numbers where numbers matter. Penalize wrong statements (for example "choose the higher IRR" or "net income overstates cash flow"). A blank answer scores 0.
Return JSON only, no prose: {"results":[{"score": number from 0 to 1, "covered": [indices of key points covered], "feedback": "2-3 short plain-English sentences to the student (use 'you'): what was right, what is missing or wrong, and one concrete fix"}]} with one result per item, in order.
Items:
${JSON.stringify(payload, null, 1)}`;
    try {
      const out = await S.sample.json(prompt, { modelTier: 'default' });
      const res = (out && out.results) || [];
      items.forEach(({ id, pi }, i) => { const r = res[i] || {}; const st = QS.get(id); st.res[pi] = { sc: Math.max(0, Math.min(1, +r.score || 0)), covered: Array.isArray(r.covered) ? r.covered.map(Number) : [], feedback: String(r.feedback || ''), status: 'claude' }; record(st.q.parts[pi].skill, st.q.gen, st.res[pi].sc, st.mode, id + pi); rerenderPart(id, pi); });
      save(); return true;
    } catch (e) {
      const why = e && e.code === 'not_granted' ? 'not allowed in this view' : e && e.code === 'rate_limited' ? 'too many requests, try again in a minute' : '';
      if (e && e.code === 'not_granted') S.sample = null;
      items.forEach(({ id, pi }) => { QS.get(id).res[pi] = { sc: 0, status: 'err', covered: [], why }; rerenderPart(id, pi); });
      return false;
    }
  }
  function selfGrade(id, pi) {
    const st = QS.get(id), p = st.q.parts[pi], boxes = [...document.querySelectorAll(`[data-self][data-q="${id}"][data-p="${pi}"]`)];
    const cov = boxes.filter(b => b.checked).map(b => +b.dataset.k), r = st.res[pi];
    r.covered = cov; r.sc = cov.length / p.points.length;
    S.prog.attempts = S.prog.attempts.filter(a => a.k !== SID + id + pi);
    record(p.skill, st.q.gen, r.sc, st.mode + '-self', id + pi); save();
  }
  function qPts(id) { const st = QS.get(id); let a = 0, b = 0; st.q.parts.forEach((p, pi) => { const w = p.pts || 1; b += w; a += w * ((st.res[pi] && st.res[pi].sc) || 0); }); return { a, b }; }
  const qScore = id => { const { a, b } = qPts(id); return b ? a / b : 0; };
  function logMistake(id) {
    const st = QS.get(id); if (!st.meta.drill || qScore(id) >= 0.999) return;
    S.prog.mistakes.push({ t: Date.now(), d: st.meta.drill, seed: st.meta.seed, title: st.q.title, s: st.q.parts[st.q.parts.length - 1].skill, sc: Math.round(qScore(id) * 100) / 100 });
    S.prog.mistakes = S.prog.mistakes.slice(-60);
  }

  // ask Claude to explain
  function askBox(id) { return `<div class="ask"><div class="askrow"><input class="askin" id="askq-${id}" placeholder="What's still confusing? (optional)" aria-label="What's confusing"><button class="btn ghost" data-act="ask" data-q="${id}">Explain it to me</button></div><div class="askout" id="askout-${id}" aria-live="polite"></div></div>`; }
  async function ask(id) {
    const st = QS.get(id), out = document.getElementById('askout-' + id), q = st.q;
    if (!S.sample) { out.innerHTML = '<p class="muted">Claude explanations aren\'t available in this view. Every statement above has its own explanation, and the Lessons tab has the full walkthrough.</p>'; return; }
    const extra = (document.getElementById('askq-' + id) || {}).value || '';
    const parts = q.parts.map((p, pi) => {
      if (p.kind === 'sata') return 'Select-all statements:\n' + p.options.map((o, i) => `(${String.fromCharCode(97 + i)}) ${plain(o.t)} → ${o.ok ? 'CORRECT' : 'INCORRECT'}; student ${(st.ans[pi] || []).includes(i) ? 'ticked' : 'left blank'}. Key: ${plain(o.why)}`).join('\n');
      return `Part ${p.label}: ${plain(p.q)}\nCorrect answer: ${p.kind === 'mc' ? plain(p.options[p.answer]) : p.kind === 'num' ? fmtAns(p.answer, p) : p.model}\nStudent answered: ${p.kind === 'mc' ? (st.ans[pi] != null ? plain(p.options[st.ans[pi]]) : '(blank)') : (st.ans[pi] || '(blank)')}`;
    }).join('\n\n');
    const prompt = `You are a patient tutor for FIN 4453 (Financial Modeling & Analytics, USF), Module 3 capital budgeting. The student is preparing for a closed-book, no-calculator midterm that tests whether she understands what NPV, IRR, cash-flow and DCF numbers mean and what decisions follow. Explain this question in plain English. Rules: start with the idea in one or two sentences, then walk through the actual numbers from this question, then say exactly how to reason on the exam (for select-all questions: why each statement she got wrong is right or wrong). Focus on what she got wrong${extra ? ' and on her question' : ''}. Under 250 words, short paragraphs, no headings, no tables. Use **bold** for the key takeaway.

Question: ${plain(q.stem)}
${plain(q.exhibits.map(x => x.html).join('\n')).slice(0, 2500)}
${parts}
${extra ? '\nStudent\'s question: ' + extra : ''}`;
    out.innerHTML = '<p class="muted"><span class="spin"></span> Thinking…</p>';
    try { const r = await S.sample(prompt, { onText: ({ text }) => { out.innerHTML = md(text); }, modelTier: 'default' }); out.innerHTML = md(r.text); }
    catch (e) { out.innerHTML = `<p class="muted">${e && e.code === 'rate_limited' ? 'Too many requests. Try again in a minute.' : e && e.code === 'not_granted' ? 'Claude isn\'t allowed in this view.' : 'Couldn\'t reach Claude just now.'}</p>`; if (e && e.code === 'not_granted') S.sample = null; }
  }

  // ---------- views ----------
  const NAV = [['home', 'Progress'], ['lessons', 'Lessons'], ['drills', 'Drills'], ['practice', 'Practice exam'], ['mock', 'Mock exam'], ['review', 'Review sheet']];
  function shell() {
    return `<header class="top"><div class="brand"><div class="mark" aria-hidden="true">NPV</div><div><div class="bt">FIN 4453 Midterm II Trainer</div><div class="bs">Capital budgeting · Tue Oct 27, in class · <span id="cd">${countdown()}</span></div></div></div><div id="sync" class="sync" data-state="${S.sync}">${SYNC_TXT[S.sync]}</div></header>
      <nav class="tabs" role="tablist">${NAV.map(([k, l]) => `<button role="tab" aria-selected="${S.view === k}" class="tab ${S.view === k ? 'on' : ''}" data-act="nav" data-v="${k}">${l}</button>`).join('')}</nav><main id="main"></main>`;
  }
  function render() {
    if (!$('#app').firstChild) $('#app').innerHTML = shell();
    else document.querySelectorAll('.tab').forEach(t => { const on = t.dataset.v === S.view; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
    const m = $('#main');
    if (S.view === 'home') m.innerHTML = homeView();
    else if (S.view === 'lessons') m.innerHTML = S.lesson ? lessonView(S.lesson) : lessonsView();
    else if (S.view === 'drills') m.innerHTML = S.drill ? drillView() : drillsView();
    else if (S.view === 'practice') m.innerHTML = practiceView();
    else if (S.view === 'mock') m.innerHTML = mockView();
    else if (S.view === 'review') m.innerHTML = `<section><h1>Review sheet</h1><p class="muted">The exam is closed-book with no formula sheet. Everything here has to be in your head on Tuesday. Read it once a day; say each rule out loud with its reason.</p><div class="rvgrid">${C.REVIEW}</div></section>`;
  }
  function go(v, extra) { S.view = v; Object.assign(S, extra || {}); lsSet(LS_VIEW, v); render(); window.scrollTo({ top: 0 }); }

  function ring(v, label) { const r = 54, c = 2 * Math.PI * r; return `<svg class="ring" viewBox="0 0 140 140" role="img" aria-label="${label} ${pct(v)}"><circle class="rbg" cx="70" cy="70" r="${r}"/><circle class="rfg" cx="70" cy="70" r="${r}" stroke-dasharray="${c * v} ${c}" transform="rotate(-90 70 70)"/><text x="70" y="70" text-anchor="middle" class="rv">${pct(v)}</text><text x="70" y="92" text-anchor="middle" class="rl">${label}</text></svg>`; }
  function spark(vals) {
    if (vals.length < 2) return '';
    const W = 260, H = 60, X = i => 6 + i * (W - 12) / (vals.length - 1), Y = v => H - 8 - v * (H - 16);
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mock scores over time"><line class="grid" x1="6" x2="${W - 6}" y1="${Y(0.8)}" y2="${Y(0.8)}"/><text class="tick" x="${W - 6}" y="${Y(0.8) - 3}" text-anchor="end">80%</text><polyline class="sp" points="${vals.map((v, i) => `${X(i)},${Y(v)}`).join(' ')}"/>${vals.map((v, i) => `<circle class="${i === vals.length - 1 ? 'spe' : 'spd'}" cx="${X(i)}" cy="${Y(v)}" r="${i === vals.length - 1 ? 4.5 : 3}"/>`).join('')}</svg>`;
  }
  function studyPlan(M) {
    const d = Math.max(1, daysLeft()), P = S.prog, todo = C.LESSONS.filter(l => !P.lessons[l.id]), per = Math.ceil(todo.length / Math.max(1, d - 1 || 1));
    const weak = nextUp(M, 2).map(n => n.s.name);
    const items = [];
    if (todo.length) items.push(`<li><b>Lessons:</b> ${todo.length} left. Do about ${Math.min(todo.length, per)} today, starting with <button class="link" data-act="lesson" data-l="${todo[0].id}">${esc(todo[0].title)}</button>. Each ends with a quick check.</li>`);
    items.push(`<li><b>Drills:</b> 3–4 questions on ${esc(weak.join(' and '))}. Read every statement's explanation, including the ones you got right.</li>`);
    if (!P.practice.length) items.push(`<li><b>Practice midterm:</b> take it once the lessons are done, ideally timed (Mock exam tab → "Practice midterm, timed").</li>`);
    items.push(`<li><b>${daysLeft() <= 1 ? 'Tonight' : 'The night before'}:</b> one fresh mock under 75 minutes, then the Review sheet. Sleep beats a fourth mock.</li>`);
    return `<div class="plan"><h2>Plan for ${daysLeft() <= 0 ? 'today' : daysLeft() === 1 ? 'the last day' : 'the next ' + daysLeft() + ' days'}</h2><ul>${items.join('')}</ul></div>`;
  }
  function homeView() {
    const M = mastery(), R = readiness(M), nu = nextUp(M), P = S.prog;
    const lessonsDone = Object.keys(P.lessons).length, answered = P.attempts.filter(a => a.m !== 'lesson').length;
    const best = P.mocks.length ? Math.max(...P.mocks.map(m => m.sc)) : null;
    const today = P.attempts.filter(a => a.m !== 'lesson' && new Date(a.t).toDateString() === new Date().toDateString()).length;
    const sa = P.attempts.filter(a => a.x), wrongTicks = sa.reduce((s, a) => s + a.x.w, 0), missed = sa.reduce((s, a) => s + (a.x.C - a.x.c), 0), avg = sa.length ? sa.reduce((s, a) => s + a.sc * 2, 0) / sa.length : 0, perfect = sa.filter(a => a.sc >= 0.999).length;
    const skillRows = Object.entries(C.SKILLS).map(([k, s]) => { const x = M[k]; return `<div class="skrow"><div class="skn"><div>${esc(s.name)}</div><div class="sks lv-${x.level}">${LEVEL[x.level]}${x.n ? ` · ${x.n} answered · last ${x.last.length}: ${pct(x.acc)}` : ''}</div></div><div class="bar"><span class="lv-${x.level}" style="width:${x.n ? Math.max(3, x.m * 100) : 0}%"></span></div><div class="skp">${x.n ? pct(x.m) : '–'}</div><div class="skb"><button class="btn sm ghost" data-act="lesson" data-l="${s.lesson}">Lesson</button><button class="btn sm" data-act="drill" data-d="${s.drill}">Drill</button></div></div>`; }).join('');
    const check = C.CHECKLIST.map(([sec, items]) => `<div class="cks"><div class="ckh">${esc(sec)}</div>${items.map(([t, k]) => { const x = M[k]; const lv = x.level; return `<div class="ck"><span class="ckd lv-${lv}" aria-label="${LEVEL[lv]}">${lv === 'solid' ? '✓' : lv === 'mid' ? '◐' : lv === 'weak' ? '!' : '○'}</span><span class="ckt">${esc(t)}</span><span class="ckl lv-${lv}">${LEVEL[lv]}</span></div>`; }).join('')}</div>`).join('');
    const mocks = P.mocks.slice(-8).reverse().map(m => `<li><span>${when(m.t)}</span><span class="muted small">${m.src === 'practice' ? 'Practice midterm' : 'Fresh mock'} · ${m.min} min</span><b>${pts(m.sc * 25)} / 25</b></li>`).join('');
    const mist = P.mistakes.slice(-6).reverse().map(x => `<li><span><b>${esc(x.title)}</b><span class="muted small"> · ${esc((C.SKILLS[x.s] || {}).name || '')} · ${pct(x.sc)}</span></span><button class="btn sm ghost" data-act="retry" data-d="${x.d}" data-s="${x.seed}">Retry</button></li>`).join('');
    const prac = {}; P.practice.forEach(p => { prac[p.q] = Math.max(prac[p.q] || 0, p.sc); });
    const pracRow = ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4'].map(q => `<span class="pq-chip ${prac[q] == null ? '' : prac[q] >= 0.8 ? 'lv-solid' : prac[q] >= 0.5 ? 'lv-mid' : 'lv-weak'}" title="${q}">${q}${prac[q] != null ? ' ' + pct(prac[q]) : ''}</span>`).join('');
    return `<section class="hero">
      ${ring(R, 'ready')}
      <div class="herotext"><h1>${R < 0.35 ? 'Let\'s build the base, Hanh.' : R < 0.7 ? 'Good momentum. Close the gaps.' : 'Exam-ready territory. Keep it warm.'}</h1>
      <p class="muted">Readiness is your mastery across the 12 skills on the professor's prep list, weighted by how much of the exam each one carries. It only rises when you answer correctly.</p>
      <div class="stats"><div><b>${answered}</b><span>answers</span></div><div><b>${today}</b><span>today</span></div><div><b>${lessonsDone}/12</b><span>lessons</span></div><div><b>${P.mocks.length}</b><span>mocks${best != null ? ` · best ${pts(best * 25)}/25` : ''}</span></div></div></div>
    </section>
    ${studyPlan(M)}
    <section><h2>Work on next</h2><div class="nextgrid">${nu.map(n => `<div class="nextcard"><div class="nk">${esc(n.s.name)}</div><div class="muted small">${esc(n.why)}</div>${n.act === 'lesson' ? `<button class="btn" data-act="lesson" data-l="${n.L.id}">Lesson: ${esc(n.L.title)}</button>` : `<button class="btn" data-act="drill" data-d="${n.s.drill}">Drill it</button>`}</div>`).join('')}</div></section>
    <section><h2>Select-all discipline</h2><div class="disc"><div><b>${sa.length ? pts(avg) : '–'}</b><span>average / 2 pts</span></div><div><b>${perfect}</b><span>perfect scores</span></div><div><b class="${wrongTicks ? 'neg' : ''}">${wrongTicks}</b><span>wrong ticks (−1 each)</span></div><div><b>${missed}</b><span>correct statements missed</span></div></div>
      <p class="muted small">${sa.length ? (wrongTicks > missed ? 'Wrong ticks are costing you more than missed statements. When you can\'t explain a statement, leave it blank: blank costs nothing.' : missed > wrongTicks * 2 ? 'You\'re careful, maybe too careful. If you can explain why a statement is true, tick it.' : 'Balanced. Keep ticking only what you can explain.') : 'Each select-all is worth 2 points: 2 × (correct ticked ÷ correct total), minus 1 for every wrong tick, floored at 0.'}</p></section>
    <section><h2>Professor's prep-note checklist</h2><p class="muted small">Every concept from the Midterm II preparation note, with your current level.</p><div class="checklist">${check}</div></section>
    <section><h2>Mastery by skill</h2><div class="sklist">${skillRows}</div></section>
    <section class="two"><div><h2>Mock exams</h2>${spark(P.mocks.map(m => m.sc))}${mocks ? `<ul class="mocklist">${mocks}</ul>` : '<p class="muted">No mock yet. Take one once the lessons feel comfortable: five select-all questions and four scenarios, 25 points, 75 minutes.</p>'}<button class="btn" data-act="nav" data-v="mock">Go to mock exam</button></div>
    <div><h2>Practice midterm</h2><div class="pqrow">${pracRow}</div><p class="muted small">Best score on each of the professor's nine practice questions.</p><button class="btn ghost" data-act="nav" data-v="practice">Open practice midterm</button>
    <h2>Recent misses</h2>${mist ? `<ul class="mistakes">${mist}</ul>` : '<p class="muted small">Questions you miss in drills land here so you can retry the exact same one.</p>'}</div></section>
    <section><h2>Exam-day facts</h2><ul class="facts"><li>Tuesday, October 27, in class. 75 minutes, 25 points (12.5% of the grade).</li><li>Pen and paper, closed book. No notes, formula sheet, calculator or phone.</li><li>Every NPV, IRR and cash-flow figure is printed in the question. Only basic arithmetic.</li><li>Section A: five select-all questions, 2 points each. Section B: four scenarios, 15 points; a conclusion without reasoning earns at most half credit.</li></ul></section>`;
  }

  function lessonsView() {
    const P = S.prog; let part = '';
    return `<section><h1>Lessons</h1><p class="muted">In slide order. Each one gives the one-line idea, plain English, the formula, the class example with its real numbers, and how it shows up on the exam. Finish the quick check to mark it done.</p>
    <div class="lessonlist">${C.LESSONS.map((l, i) => { const d = P.lessons[l.id]; const head = l.part !== part ? `<div class="lpart">${esc((part = l.part))}</div>` : ''; return `${head}<button class="lessonbtn" data-act="lesson" data-l="${l.id}"><span class="ld">${esc(l.slides)}</span><span class="lt">${i + 1}. ${esc(l.title)}</span><span class="lk ${d ? 'done' : ''}">${d ? '✓ ' + pct(d.sc) : 'Start'}</span></button>`; }).join('')}</div></section>`;
  }
  function lessonView(lid) {
    const i = C.LESSONS.findIndex(l => l.id === lid), l = C.LESSONS[i];
    if (!S.lessonQ || S.lessonQ.lid !== lid) {
      const q = { gen: 'lesson', title: 'Quick check', examRef: l.title, stem: '', exhibits: [], parts: l.check.map((c, k) => ({ kind: 'mc', label: String(k + 1), skill: l.skills[0], q: c.q, options: c.options.slice(), answer: c.answer, explain: c.explain })) };
      const r = rng(lid.charCodeAt(1) * 31 + lid.length * 7 + (+lid.slice(1)) * 101);
      q.parts.forEach(p => { const order = r.shuffle(p.options.map((_, j) => j)); p.options = order.map(j => p.options[j]); p.answer = order.indexOf(p.answer); });
      S.lessonQ = { lid, id: makeQ(q, 'lesson') };
    }
    const nxt = C.LESSONS[i + 1], st = QS.get(S.lessonQ.id), sk = C.SKILLS[l.skills[0]];
    return `<div class="crumbs"><button class="link" data-act="lessons">← All lessons</button><span class="muted">Lesson ${i + 1} of ${C.LESSONS.length} · ${esc(l.part)} · ${esc(l.slides)}</span></div>
    <article class="lesson"><h1>${esc(l.title)}</h1><div class="take"><span>The one-line idea</span>${l.take}</div>${fillFigs(l.body)}</article>
    ${qHTML(S.lessonQ.id, { footer: `<div class="qfoot">${st.graded ? `<b>${pct(qScore(S.lessonQ.id))}</b> on the quick check. ` + (nxt ? `<button class="btn" data-act="lesson" data-l="${nxt.id}">Next: ${esc(nxt.title)}</button>` : '<button class="btn" data-act="nav" data-v="practice">Go to the practice midterm</button>') + ` <button class="btn ghost" data-act="drill" data-d="${sk.drill}">Drill this skill</button>` : `<button class="btn" data-act="check" data-q="${S.lessonQ.id}">Check answers</button>`}</div>` })}`;
  }

  function drillCard(d, M) { const ms = d.skills.map(k => M[k]), tried = ms.filter(x => x.n), m = tried.length ? tried.reduce((s, x) => s + x.m, 0) / tried.length : 0; const lv = !tried.length ? 'new' : m < 0.5 ? 'weak' : m >= 0.8 ? 'solid' : 'mid'; return `<button class="drillcard" data-act="drill" data-d="${d.id}"><span class="dsub">${esc(d.sub)}</span><span class="dname">${esc(d.name)}</span><span class="bar"><span class="lv-${lv}" style="width:${tried.length ? Math.max(3, m * 100) : 0}%"></span></span><span class="dlv lv-${lv}">${tried.length ? pct(m) + ' · ' + LEVEL[lv] : 'Not started'}</span></button>`; }
  function drillsView() {
    const M = mastery(), top = nextUp(M, 1)[0];
    return `<section><h1>Drills</h1><p class="muted">Every drill builds a fresh question in the exam's format with new numbers. After you check, every statement shows whether ticking it earned or cost you points, and why.</p>
    <div class="smart"><div><b>Not sure where to start?</b><span class="muted small"> Smart pick: your weakest, highest-weight skill right now is ${esc(top.s.name)}.</span></div><button class="btn" data-act="drill" data-d="${top.s.drill}">Start smart pick</button></div>
    <h2>Section A: select all that apply</h2><div class="drillgrid">${G.DRILLS.map(d => drillCard(d, M)).join('')}</div>
    <h2>Section B: written scenarios</h2><p class="muted small">Write the conclusion in a full sentence, then the reasoning. ${S.sample ? 'Claude grades each part against the key points.' : 'Grade yourself against the key points and the model answer.'}</p><div class="drillgrid">${G.SCEN.map(d => drillCard(d, M)).join('')}</div></section>`;
  }
  function newDrillQ(seed) { const d = G.byId(S.drill.id); const s = seed ?? newSeed(); const q = d.fn(rng(s)); S.drill.qid = makeQ(q, 'drill', { drill: d.id, seed: s }); }
  function drillView() {
    const d = G.byId(S.drill.id); if (!S.drill.qid) newDrillQ(S.drill.seed); S.drill.seed = null;
    const id = S.drill.qid, st = QS.get(id), { a, b } = qPts(id);
    const foot = st.graded ? `<div class="qfoot"><b>${pts(a)} / ${pts(b)}</b> on this one${S.drill.n ? ` · session: ${pct(S.drill.sum / S.drill.n)} over ${S.drill.n}` : ''}. <button class="btn" data-act="next">Next question</button></div>${askBox(id)}` : `<div class="qfoot"><button class="btn" data-act="check" data-q="${id}">Check answers</button> <button class="btn ghost" data-act="next">Skip</button></div>`;
    return `<div class="crumbs"><button class="link" data-act="drills">← All drills</button><span class="muted">${esc(d.name)} · ${esc(d.sub)}</span></div>${qHTML(id, { footer: foot })}`;
  }

  // ----- practice midterm (study mode: check each question) -----
  function practiceView() {
    if (!S.prac) S.prac = { ids: C.practice().map(q => makeQ(q, 'practice')) };
    return `<section><h1>Practice Midterm II</h1><p class="muted">The professor's real practice questions. Check each one on its own and read every explanation. The answer key and model answers were written for this trainer from the slides and class materials, not by the professor. To take it under exam conditions, use Mock exam → Practice midterm, timed.</p></section>
    ${S.prac.ids.map(id => { const st = QS.get(id), { a, b } = qPts(id); return qHTML(id, { footer: st.graded ? `<div class="qfoot"><b>${pts(a)} / ${pts(b)}</b> points. <button class="btn ghost" data-act="pracreset" data-q="${id}">Try again</button></div>${askBox(id)}` : `<div class="qfoot"><button class="btn" data-act="check" data-q="${id}">Check this question</button></div>` }); }).join('')}`;
  }

  // ----- mock exam -----
  const MOCK_MIN = 75;
  function mockView() {
    const saved = S.mock || lsGet(LS_MOCK);
    if (saved && !S.mock) { S.mock = saved; buildMock(); }
    if (!S.mock) return `<section class="mockintro"><h1>Mock exam</h1><p>Same layout as the real Midterm II: 75 minutes, 25 points.</p>
      <ol class="mocklist2"><li><b>Section A (10 pts):</b> five select-all questions, scored exactly like the exam: 2 × (correct ticked ÷ correct total), −1 per wrong tick, never below 0.</li><li><b>Section B (15 pts):</b> four scenarios: two exclusive projects, an unconventional or cash-flow project, a DCF and equity bridge, and the Cooper Dental sensitivity tables.</li></ol>
      <p class="muted">Answers save as you go, so a refresh won't lose your work. No feedback until you submit, just like the real thing. Written answers are graded by Claude when you submit${S.sample ? '' : ' (or by you, against the key points, if Claude isn\'t available here)'}.</p>
      <div class="qfoot"><button class="btn big" data-act="mockstart" data-src="fresh">Start a fresh mock</button><button class="btn big ghost" data-act="mockstart" data-src="practice">Practice midterm, timed</button></div></section>`;
    const ids = S.mock.ids, done = S.mock.done, left = Math.max(0, S.mock.start + MOCK_MIN * 60000 - Date.now());
    const bar = done ? '' : `<div class="mockbar"><span id="timer" class="${left < 600000 ? 'low' : ''}">${fmtLeft(left)}</span><span class="muted small">${answeredCount()} of ${totalParts()} parts answered</span><button class="btn" data-act="mocksubmit">Submit exam</button></div>`;
    return `${bar}${done ? mockResults() : ''}${ids.map(id => qHTML(id, { footer: done ? askBox(id) : '' })).join('')}${done ? '<div class="qfoot"><button class="btn big" data-act="mocknew">Back to mock options</button></div>' : '<div class="qfoot"><button class="btn big" data-act="mocksubmit">Submit exam</button></div>'}`;
  }
  const fmtLeft = ms => { const s = Math.floor(ms / 1000); return ms <= 0 ? 'Time\'s up' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} left`; };
  const totalParts = () => S.mock.ids.reduce((s, i) => s + QS.get(i).q.parts.length, 0);
  function answeredCount() { let n = 0; S.mock.ids.forEach(id => { const st = QS.get(id); st.q.parts.forEach((p, pi) => { const a = st.ans[pi]; if (a !== undefined && a !== '' && a !== null && !(Array.isArray(a) && !a.length)) n++; }); }); return n; }
  function buildMock() {
    const qs = S.mock.src === 'practice' ? C.practice() : G.mock(S.mock.seed); S.mock.ids = qs.map(q => makeQ(q, 'mock'));
    S.mock.ids.forEach((id, i) => { const sv = (S.mock.ans || {})[i]; if (sv) QS.get(id).ans = sv; });
    if (S.mock.done) S.mock.ids.forEach((id, i) => { QS.get(id).graded = true; const r = (S.mock.res || {})[i]; if (r) { Object.values(r).forEach(x => { if (x && x.status === 'grading') x.status = 'err'; }); QS.get(id).res = r; } });
  }
  function persistMock() { if (!S.mock) return; const ans = {}, res = {}; S.mock.ids.forEach((id, i) => { ans[i] = QS.get(id).ans; res[i] = QS.get(id).res; }); lsSet(LS_MOCK, { seed: S.mock.seed, src: S.mock.src, start: S.mock.start, done: S.mock.done, ans, res, score: S.mock.score, min: S.mock.min }); }
  async function submitMock() {
    const textItems = [];
    S.mock.ids.forEach(id => { gradeQ(id, 'mock').forEach(pi => textItems.push({ id, pi })); });
    S.mock.done = true; S.mock.min = Math.max(1, Math.min(MOCK_MIN, Math.round((Date.now() - S.mock.start) / 60000)));
    finalizeMock(); render(); window.scrollTo({ top: 0 });
    if (textItems.length && S.sample) await claudeGrade(textItems);
    finalizeMock(); render();
  }
  function tally() { let a = 0, sa = 0, sb = 0; const per = []; S.mock.ids.forEach(id => { const { a: qa, b: qb } = qPts(id), q = QS.get(id).q; per.push({ num: q.num, title: q.title, a: qa, b: qb }); a += qa; (q.num || '').startsWith('A') ? (sa += qa) : (sb += qb ? qa : 0); }); return { a, sa, sb, per }; }
  function finalizeMock() {
    const t = tally(); S.mock.score = t.a / 25;
    const ex = S.prog.mocks.find(m => m.t === S.mock.start);
    if (ex) { ex.sc = S.mock.score; } else S.prog.mocks.push({ t: S.mock.start, sc: S.mock.score, min: S.mock.min, src: S.mock.src });
    persistMock(); save();
  }
  function mockResults() {
    const t = tally(), pending = S.mock.ids.some(id => Object.values(QS.get(id).res).some(r => r.status === 'grading')), self = S.mock.ids.some(id => Object.values(QS.get(id).res).some(r => r.status === 'self' || r.status === 'err'));
    const weak = t.per.filter(p => p.b && p.a / p.b < 0.7).map(p => p.num + ' ' + p.title);
    return `<section class="results"><div class="resgrid">${ring(t.a / 25, 'of 25')}<div><h1>${pts(t.a)} / 25</h1><p class="muted">Section A ${pts(t.sa)} / 10 · Section B ${pts(t.sb)} / 15 · ${S.mock.min} minutes. ${pending ? '<span class="spin"></span> Claude is still grading the written answers; the score will update.' : self ? 'Tick the key points you covered in each written answer below; the score updates as you tick.' : 'All parts graded.'}</p>
      <div class="tw"><table class="fin res"><thead><tr><th>Question</th><th class="n">Points</th><th>Score</th></tr></thead><tbody>${t.per.map(p => `<tr><th>${esc(p.num)} ${esc(p.title)}</th><td class="n">${pts(p.a)} / ${pts(p.b)}</td><td><span class="bar inline"><span class="${p.a / p.b >= 0.8 ? 'lv-solid' : p.a / p.b >= 0.5 ? 'lv-mid' : 'lv-weak'}" style="width:${Math.max(3, p.a / p.b * 100)}%"></span></span></td></tr>`).join('')}</tbody></table></div>
      ${weak.length ? `<p><b>Work on:</b> ${esc(weak.join('; '))}. Each question below shows the key and why.</p>` : ''}</div></div></section>`;
  }

  // ---------- events ----------
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act, id = b.dataset.q;
    if (act === 'nav') { if (b.dataset.v === 'lessons') S.lesson = null; if (b.dataset.v === 'drills') S.drill = null; go(b.dataset.v); }
    else if (act === 'lessons') go('lessons', { lesson: null });
    else if (act === 'lesson') go('lessons', { lesson: b.dataset.l });
    else if (act === 'drills') go('drills', { drill: null });
    else if (act === 'drill') go('drills', { drill: { id: b.dataset.d, qid: null, n: 0, sum: 0 } });
    else if (act === 'retry') go('drills', { drill: { id: b.dataset.d, qid: null, n: 0, sum: 0, seed: +b.dataset.s } });
    else if (act === 'next') { newDrillQ(); render(); window.scrollTo({ top: 0 }); }
    else if (act === 'tick') { const st = QS.get(id); if (st.graded) return; const pi = +b.dataset.p, i = +b.dataset.i, cur = st.ans[pi] || []; st.ans[pi] = cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i].sort(); rerenderPart(id, pi); const nb = document.querySelector(`[data-act="tick"][data-q="${id}"][data-p="${pi}"][data-i="${i}"]`); if (nb) nb.focus(); if (st.mode === 'mock') persistMock(); }
    else if (act === 'mc') { const st = QS.get(id); if (st.graded) return; st.ans[+b.dataset.p] = +b.dataset.i; rerenderPart(id, +b.dataset.p); if (st.mode === 'mock') persistMock(); }
    else if (act === 'check') {
      const st = QS.get(id), textIdx = gradeQ(id, st.mode);
      if (st.mode === 'lesson') { const l = C.LESSONS.find(x => x.id === S.lessonQ.lid); const sc = qScore(id); const prev = S.prog.lessons[l.id]; if (!prev || sc >= (prev.sc || 0)) S.prog.lessons[l.id] = { t: Date.now(), sc }; }
      save(); render();
      if (textIdx.length && S.sample) await claudeGrade(textIdx.map(pi => ({ id, pi })));
      if (st.mode === 'drill') { S.drill.n++; S.drill.sum += qScore(id); logMistake(id); }
      if (st.mode === 'practice') S.prog.practice.push({ t: Date.now(), q: st.q.num, sc: Math.round(qScore(id) * 100) / 100 });
      save(); render();
    }
    else if (act === 'ask') ask(id);
    else if (act === 'pracreset') { const st = QS.get(id); st.graded = false; st.res = {}; render(); const el = document.getElementById(id); if (el) el.scrollIntoView(); }
    else if (act === 'mockstart') { S.mock = { seed: newSeed(), src: b.dataset.src, start: Date.now(), done: false, ans: {} }; buildMock(); persistMock(); render(); window.scrollTo({ top: 0 }); }
    else if (act === 'mocksubmit') { const n = answeredCount(), tot = totalParts(); if (n < tot && !b.dataset.sure) { b.dataset.sure = '1'; b.textContent = `${tot - n} parts blank. Submit anyway?`; return; } submitMock(); }
    else if (act === 'mocknew') { lsDel(LS_MOCK); S.mock = null; render(); window.scrollTo({ top: 0 }); }
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.matches('[data-num],[data-text]')) { const st = QS.get(t.dataset.q); if (st && !st.graded) { st.ans[+t.dataset.p] = t.value; if (st.mode === 'mock') { clearTimeout(t._pt); t._pt = setTimeout(persistMock, 400); } } }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.matches('[data-self]')) {
      selfGrade(t.dataset.q, +t.dataset.p);
      if (S.view === 'mock' && S.mock && S.mock.done) { finalizeMock(); const r = document.querySelector('.results'); if (r) r.outerHTML = mockResults(); }
      else if (S.view === 'drills' || S.view === 'practice') { const st = QS.get(t.dataset.q); const f = document.querySelector(`#${t.dataset.q} .qfoot b`); if (f) { const { a, b } = qPts(t.dataset.q); f.textContent = `${pts(a)} / ${pts(b)}`; } if (st.mode === 'practice') { S.prog.practice.push({ t: Date.now(), q: st.q.num, sc: Math.round(qScore(t.dataset.q) * 100) / 100 }); save(); } }
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.askin')) ask(e.target.id.replace('askq-', '')); });

  setInterval(() => {
    const cd = $('#cd'); if (cd) cd.textContent = countdown();
    const tm = $('#timer'); if (tm && S.mock && !S.mock.done) { const left = S.mock.start + MOCK_MIN * 60000 - Date.now(); tm.textContent = fmtLeft(left); tm.classList.toggle('low', left < 600000); }
  }, 1000);

  const v = lsGet(LS_VIEW); if (v && NAV.some(n => n[0] === v)) S.view = v;
  render();
  connect();
})();
