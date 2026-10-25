/* ===== ENGINE: random numbers, finance math, money formatting, tables, NPV-profile charts, select-all scoring ===== */
const E = (() => {
  // ---------- seeded RNG ----------
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    const u = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    return {
      u,
      range: (lo, hi) => lo + (hi - lo) * u(),
      int: (lo, hi) => lo + Math.floor(u() * (hi - lo + 1)),
      pick: arr => arr[Math.floor(u() * arr.length)],
      chance: p => u() < p,
      shuffle: arr => { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(u() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; },
      step: (lo, hi, s) => lo + s * Math.floor(u() * (Math.round((hi - lo) / s) + 1))
    };
  }
  const newSeed = () => (Math.floor(Math.random() * 2 ** 31) ^ Date.now()) >>> 0;

  // ---------- formatting ----------
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  function comma(v, d = 0) { if (!isFinite(v)) return String(v); const s = Math.abs(v).toFixed(d).split('.'); s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (v < 0 ? '−' : '') + s.join('.'); }
  const usd = (v, d = 0) => (v < 0 ? '−$' : '$') + comma(Math.abs(v), d);            // −$840
  const acct = (v, d = 0) => (v < 0 ? '(' + comma(Math.abs(v), d) + ')' : comma(v, d)); // (50,000), the way the exam prints outflows
  const pc = (v, d = 1) => (+(v * 100).toFixed(d)).toString() + '%';
  const r2 = v => Math.round(v * 100) / 100;

  // ---------- finance math ----------
  const npv = (r, cf) => cf.reduce((s, c, t) => s + c / Math.pow(1 + r, t), 0);
  const npvMid = (r, cf, shift = 0.5) => cf.reduce((s, c, t) => s + c / Math.pow(1 + r, t === 0 ? 0 : t - shift), 0);
  const pvifa = (r, n) => (1 - Math.pow(1 + r, -n)) / r;
  function irrs(cf, lo = -0.5, hi = 3) {
    const out = []; let a = lo, fa = npv(a, cf);
    for (let x = lo + 0.0025; x <= hi + 1e-9; x += 0.0025) {
      const fx = npv(x, cf);
      if (fa === 0) out.push(a);
      else if (fa * fx < 0) { let l = a, h = x; for (let k = 0; k < 60; k++) { const m = (l + h) / 2; (npv(l, cf) * npv(m, cf) <= 0) ? (h = m) : (l = m); } out.push((l + h) / 2); }
      a = x; fa = fx;
    }
    return out.filter((v, i) => i === 0 || Math.abs(v - out[i - 1]) > 1e-4);
  }
  const irr = cf => { const r = irrs(cf); return r.length ? r[0] : NaN; };
  function crossover(a, b) { const d = a.map((v, i) => v - (b[i] || 0)); return irrs(d, -0.2, 2); }
  const signChanges = cf => { let n = 0, prev = 0; cf.forEach(c => { const s = Math.sign(c); if (s && prev && s !== prev) n++; if (s) prev = s; }); return n; };
  // the professor's rule: 2 × (correct ticked ÷ correct total) − 1 per wrong tick, floored at 0
  function sataScore(options, ticks, pts = 2) {
    const C = options.filter(o => o.ok).length; let c = 0, w = 0;
    options.forEach((o, i) => { if (ticks.includes(i)) { if (o.ok) c++; else w++; } });
    const raw = pts * (C ? c / C : 0) - w;
    return { pts: Math.max(0, raw), raw, c, C, w, max: pts };
  }

  // ---------- tables ----------
  // rows: arrays of cells; a cell may be a string or {v, cls}. First column is the label.
  function table(head, rows, opts = {}) {
    const cell = (c, tag, i) => { const o = (c && typeof c === 'object') ? c : { v: c }; const cls = [i > 0 && !opts.leftAll ? 'n' : '', o.cls || ''].join(' ').trim(); return `<${tag}${cls ? ` class="${cls}"` : ''}>${o.v}</${tag}>`; };
    return `<div class="tw"${opts.label ? ` role="region" aria-label="${esc(opts.label)}" tabindex="0"` : ''}><table class="fin${opts.cls ? ' ' + opts.cls : ''}">${head ? `<thead><tr>${head.map((h, i) => cell(h, 'th', i)).join('')}</tr></thead>` : ''}<tbody>${rows.map(r => `<tr${r.cls ? ` class="${r.cls}"` : ''}>${(r.cells || r).map((c, i) => cell(c, i === 0 && !opts.plainFirst ? 'th' : 'td', i)).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  const cfTable = (rows, n, opts = {}) => table(['Total cash flows ($)', ...Array.from({ length: n + 1 }, (_, t) => 'Year ' + t), ...(opts.extra ? [opts.extra] : [])], rows.map(r => [r.name, ...r.cf.map(v => comma(v)), ...(r.extra != null ? [r.extra] : [])]));

  // ---------- NPV profile chart ----------
  function niceStep(span, n = 5) { const raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }
  // series: [{name, cf, cls}] ; opts: {lo, hi, mark, title, h, irr:true, cross:true}
  function profile(series, opts = {}) {
    const lo = opts.lo ?? 0, hi = opts.hi ?? 0.3, W = 640, H = opts.h || 300, ml = 66, mr = 18, mt = opts.title ? 30 : 14, mb = 40;
    const N = 120, xs = Array.from({ length: N + 1 }, (_, i) => lo + (hi - lo) * i / N);
    const ys = series.map(s => xs.map(x => npv(x, s.cf)));
    let ymin = Math.min(0, ...ys.flat()), ymax = Math.max(0, ...ys.flat()); const pad = (ymax - ymin) * 0.08 || 1; ymin -= pad; ymax += pad;
    const X = x => ml + (x - lo) / (hi - lo) * (W - ml - mr), Y = y => mt + (ymax - y) / (ymax - ymin) * (H - mt - mb);
    const ys0 = niceStep(ymax - ymin), xs0 = niceStep((hi - lo) * 100, 6) / 100;
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.title || 'NPV profile')}">`;
    if (opts.title) s += `<text class="ttl" x="${ml}" y="18">${esc(opts.title)}</text>`;
    for (let v = Math.ceil(ymin / ys0) * ys0; v <= ymax; v += ys0) s += `<line class="grid" x1="${ml}" x2="${W - mr}" y1="${Y(v)}" y2="${Y(v)}"/><text class="tick" x="${ml - 8}" y="${Y(v) + 4}" text-anchor="end">${compact(v)}</text>`;
    for (let v = Math.ceil(lo / xs0 - 1e-9) * xs0; v <= hi + 1e-9; v += xs0) s += `<text class="tick" x="${X(v)}" y="${H - mb + 18}" text-anchor="middle">${Math.round(v * 100)}%</text>`;
    s += `<line class="zero" x1="${ml}" x2="${W - mr}" y1="${Y(0)}" y2="${Y(0)}"/>`;
    s += `<text class="tick" x="${(ml + W - mr) / 2}" y="${H - 6}" text-anchor="middle">Discount rate</text><text class="tick" x="14" y="${(mt + H - mb) / 2}" transform="rotate(-90 14 ${(mt + H - mb) / 2})" text-anchor="middle">NPV ($)</text>`;
    if (opts.mark != null) s += `<line class="mark" x1="${X(opts.mark)}" x2="${X(opts.mark)}" y1="${mt}" y2="${H - mb}"/><text class="anno" x="${X(opts.mark) + 5}" y="${mt + 12}">r = ${pc(opts.mark, 0)}</text>`;
    series.forEach((ser, k) => {
      s += `<polyline class="p${k + 1}" points="${xs.map((x, i) => `${X(x).toFixed(1)},${Y(ys[k][i]).toFixed(1)}`).join(' ')}"/>`;
      if (opts.irr !== false) irrs(ser.cf, lo, hi).forEach(r => { s += `<circle class="d${k + 1}" cx="${X(r)}" cy="${Y(0)}" r="5"/><text class="anno" x="${X(r)}" y="${Y(0) + (k ? 20 : -10)}" text-anchor="middle">IRR ${pc(r)}</text>`; });
    });
    if (opts.cross && series.length === 2) crossover(series[0].cf, series[1].cf).filter(r => r > lo && r < hi).forEach(r => { const v = npv(r, series[0].cf); s += `<circle class="dx" cx="${X(r)}" cy="${Y(v)}" r="6"/><text class="anno b" x="${X(r) + 9}" y="${Y(v) - 9}">crossover ${pc(r)}</text>`; });
    s += `<g class="legend">${series.map((ser, k) => `<line class="p${k + 1}" x1="${W - mr - 150}" x2="${W - mr - 126}" y1="${mt + 8 + k * 18}" y2="${mt + 8 + k * 18}"/><text x="${W - mr - 120}" y="${mt + 12 + k * 18}">${esc(ser.name)}</text>`).join('')}</g>`;
    return s + '</svg>';
  }
  function compact(v) { const a = Math.abs(v); const t = a >= 1e6 ? (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + 'M' : a >= 1e3 ? (v / 1e3).toFixed(a >= 1e4 ? 0 : 1) + 'k' : v.toFixed(0); return t.replace('-', '−'); }

  return { rng, newSeed, esc, comma, usd, acct, pc, r2, npv, npvMid, pvifa, irrs, irr, crossover, signChanges, sataScore, table, cfTable, profile, compact };
})();
if (typeof module !== 'undefined') module.exports = E;
