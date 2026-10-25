/* ===== GENERATORS: fresh exam-style questions with computed keys and per-statement explanations ===== */
const G = (() => {
  const { comma, usd, pc, npv, irrs, crossover, pvifa, table, cfTable, rng } = E;
  const $ = v => usd(v);
  const P = v => pc(v, 1);
  const P0 = v => pc(v, 0);
  const round = (v, s = 1000) => Math.round(v / s) * s;
  const st = (t, ok, why) => ({ t, ok, why });

  // pick 6 statements: 2–4 true, the rest false (every question keeps at least two incorrect statements, as on the exam)
  function sata(r, pool, skill, q = 'Tick every correct statement.', n = 6) {
    const T = r.shuffle(pool.filter(s => s.ok)), F = r.shuffle(pool.filter(s => !s.ok));
    let nT = Math.min(T.length, r.int(2, 4)); if (n - nT > F.length) nT = n - F.length; nT = Math.max(1, nT);
    const opts = r.shuffle([...T.slice(0, nT), ...F.slice(0, Math.max(2, n - nT))]);
    return { kind: 'sata', label: '', skill, pts: 2, q, options: opts };
  }
  const num = (label, q, answer, skill, explain, o = {}) => ({ kind: 'num', label, q, answer, skill, explain, tol: o.tol || { rel: 0.005, abs: 1 }, unit: o.unit || '', prefix: o.prefix ?? '$' });
  const txt = (label, q, pts, skill, model, points) => ({ kind: 'text', label, q, pts, skill, model, points });
  const npvRow = (rates, list) => table(['NPV ($) at a discount rate of:', ...rates.map(P0)], list.map(x => [x.name, ...rates.map(rt => comma(Math.round(npv(rt, x.cf))))]), { label: 'NPV profile table' });

  // ===== NPV: what genuinely changes it =====
  function npvchange(r) {
    const n = r.pick([3, 4, 5]), rate = r.pick([0.08, 0.1, 0.12]), cost = r.pick([200, 300, 400, 500, 600]) * 1000;
    const A = round(cost / pvifa(rate, n) * r.range(1.1, 1.3), 10000), cf = [-cost, ...Array(n).fill(A)], NPV = npv(rate, cf), IRR = irrs(cf)[0];
    const total = A * n, bump = round(A * 0.1, 5000);
    const front = (() => { const w = Array.from({ length: n }, (_, i) => n - i); const s = w.reduce((a, b) => a + b, 0); const v = w.map(x => round(total * x / s, 10000)); v[0] += total - v.reduce((a, b) => a + b, 0); return v; })();
    const back = front.slice().reverse(), lo = rate - 0.03, hi = rate + 0.03;
    const pool = [
      st(`Cutting operating costs so that each year's operating cash flow rises to ${$(A + bump)}.`, true, `More cash every year raises the PV of the inflows: +${$(bump)} a year for ${n} years.`),
      st(`Receiving the same ${$(total)} in total, but front-loaded: ${front.map($).join(', ')} in Years 1 to ${n}.`, true, 'Same total, but more of it arrives early, when it is discounted less. Earlier cash is worth more today.'),
      st(`Paying the ${$(cost)} in ${n} equal annual installments instead of all of it today, with no extra charge.`, true, 'Paying later means the cost is discounted, so its present value is below ' + $(cost) + '. A cheaper cost in PV terms raises NPV.'),
      st(`Finding a lower-risk design with the same cash flows, so that investors require only ${P0(lo)}.`, true, 'Lower risk genuinely lowers the required return. The same cash flows discounted at a lower required return are worth more.'),
      st(`Arranging to sell the equipment at the end of Year ${n} for an extra after-tax ${$(round(cost * 0.1, 10000))}.`, true, 'An extra cash inflow at the end adds its present value to NPV.'),
      st(`Using a ${P0(lo)} discount rate instead of ${P0(rate)} to arrive at the NPV, with the project unchanged.`, false, `The number would rise, but nothing about the project changed. The ${P0(rate)} required return reflects the project's risk; picking a lower rate mismeasures the same project.`),
      st('Entering a different guess in Excel\'s IRR function so that it reports a higher IRR.', false, `A conventional project has exactly one IRR (${P(IRR)}), and a guess changes no cash flow. NPV is unaffected.`),
      st(`Redesigning the project so that it is riskier, which raises its required return to ${P0(hi)}.`, false, 'Same cash flows discounted at a higher rate: NPV falls.'),
      st(`Receiving the same ${$(total)} in total, but back-loaded: ${back.map($).join(', ')} in Years 1 to ${n}.`, false, 'Pushing cash later means more discounting, so NPV falls even though the total is unchanged.'),
      st('Delaying the whole project by one year, with every cash flow shifted one year later.', false, `Every flow is discounted one more year, so NPV becomes ${$(Math.round(NPV))} ÷ ${(1 + rate).toFixed(2)}: lower, since NPV is positive.`),
      st(`Spreading the same ${$(total)} over ${n + 2} years instead of ${n}.`, false, 'The same dollars arrive later on average, so their PV falls.'),
      st('Reporting the NPV in thousands of dollars instead of dollars.', false, 'A change of units changes nothing about the cash or the risk.')
    ];
    return { gen: 'npvchange', title: 'What genuinely increases NPV?', examRef: 'Section A style · 2 points', stem: `A project costs ${$(cost)} today and is expected to produce operating cash flows of ${$(A)} at the end of each of the next ${n} years. At the firm's ${P0(rate)} required return the NPV is +${$(Math.round(NPV))} and the IRR is ${P(IRR)}. A manager wants to make the project more valuable. Which changes would genuinely increase the project's NPV?`, exhibits: [], parts: [sata(r, pool, 'npv')] };
  }

  // ===== IRR basics =====
  function irrbasics(r) {
    const Pv = r.pick([100, 200, 400, 500, 1000]), ret = r.pick([0.08, 0.1, 0.12, 0.15, 0.2, 0.25]), Q = Pv * (1 + ret), rq = r.pick([0.06, 0.08, 0.1, 0.12, 0.15, 0.18, 0.2].filter(x => Math.abs(x - ret) > 0.01));
    const N = -Pv + Q / (1 + rq), acc = ret > rq;
    const pool = [
      st(`The project's IRR is ${P0(ret)}.`, true, `0 = −${Pv} + ${comma(Q)} ÷ (1 + IRR), so 1 + IRR = ${comma(Q)} ÷ ${Pv} = ${(1 + ret).toFixed(2)}.`),
      st(`At the ${P0(rq)} required return, the IRR rule says ${acc ? 'accept' : 'reject'}.`, true, `IRR ${P0(ret)} is ${acc ? 'above' : 'below'} the ${P0(rq)} required return.`),
      st(`At the ${P0(rq)} required return, the IRR rule says ${acc ? 'reject' : 'accept'}.`, false, `IRR ${P0(ret)} is ${acc ? 'above' : 'below'} ${P0(rq)}, so the rule says ${acc ? 'accept' : 'reject'}.`),
      st(`The NPV at ${P0(rq)} is ${N >= 0 ? 'positive' : 'negative'} (${usd(N, 2)}), which agrees with the IRR rule.`, true, `−${Pv} + ${comma(Q)} ÷ ${(1 + rq).toFixed(2)} = ${usd(N, 2)}. Standalone and conventional: the two rules always agree.`),
      st(`If the market's required return rose to ${P0(rq + 0.05)}, the project's IRR would also rise.`, false, 'IRR comes only from the project\'s own cash flows. The market rate does not change it.'),
      st('To compute this project\'s NPV, discount its cash flows at the IRR.', false, 'Discounting at the IRR always gives NPV = 0, by definition. NPV uses the required return.'),
      st('The IRR is determined entirely by the project\'s own cash flows.', true, 'That is why it is called internal.'),
      st('NPV is the dollar value of the gap between what the project earns (IRR) and what the market requires (r).', true, 'Slide 8: the IRR is "inside", r is "outside", and NPV prices the gap in dollars.'),
      st('If a mutually exclusive alternative had a higher IRR, it would automatically be the better choice.', false, 'IRR can misrank exclusive projects (scale and timing). Compare NPVs at the required return.'),
      st('IRR implicitly assumes that interim cash is reinvested at the IRR itself.', true, 'NPV assumes reinvestment at the required return, which is what comparable deals actually earn.'),
      st('For a standalone project with conventional cash flows, IRR and NPV can give opposite accept/reject decisions.', false, 'In that case they always agree. Conflicts come from exclusive projects or unconventional flows.'),
      st('IRR is useful mainly for communication: "it earns X% against our Y% hurdle."', true, 'The professor\'s GPA analogy: a quick summary. NPV, the exam score, is the decision rule.')
    ];
    return { gen: 'irrbasics', title: 'IRR vs. the required return', examRef: 'Section A style · 2 points', stem: `A standalone project costs $${comma(Pv)} today and returns $${comma(Q)} in one year. The firm's required return is ${P0(rq)}. Which statements are correct?`, exhibits: [], parts: [sata(r, pool, 'irr')] };
  }

  // ===== mutually exclusive projects =====
  const PAIRS = [['Coffee Kiosk', 'Full Restaurant'], ['Food Truck', 'Bistro'], ['Pop-Up Shop', 'Flagship Store'], ['Bike Stand', 'Boat Rental Dock'], ['Mobile App', 'Software Platform'], ['Kayak Hut', 'Marina Café'], ['Car Wash Bay', 'Full-Service Garage']];
  function mutexData(r) {
    for (let k = 0; k < 400; k++) {
      const a0 = r.step(20, 60, 5) * 1000, scale = r.chance(0.35) ? 1 : r.pick([3, 4, 5, 8, 10]);
      const A = [-a0, round(a0 * r.range(0.5, 0.75)), round(a0 * r.range(0.35, 0.55)), round(a0 * r.range(0.05, 0.25))];
      const b0 = a0 * scale, B = [-b0, round(b0 * r.range(0.25, 0.4), scale > 1 ? 5000 : 1000), round(b0 * r.range(0.38, 0.48), scale > 1 ? 5000 : 1000), round(b0 * r.range(0.45, 0.62), scale > 1 ? 5000 : 1000)];
      const ia = irrs(A), ib = irrs(B), cx = crossover(A, B).filter(x => x > 0.02 && x < 0.3);
      if (ia.length !== 1 || ib.length !== 1 || cx.length !== 1) continue;
      if (!(ia[0] > ib[0] + 0.03 && ib[0] > cx[0] + 0.02 && cx[0] > 0.06 && ia[0] < 0.45)) continue;
      const names = r.pick(PAIRS);
      return { A, B, ia: ia[0], ib: ib[0], cx: cx[0], names, scale };
    }
    return { A: [-25000, 15000, 15000, 5000], B: [-250000, 100000, 110000, 120000], ia: 0.2238, ib: 0.1477, cx: 0.1407, names: ['Pedal Shack', 'Bayline'], scale: 10 };
  }
  function mutexExhibits(d) {
    const top = Math.min(0.45, Math.ceil((d.ia + 0.03) / 0.05) * 0.05), rates = []; for (let x = 0; x <= top + 1e-9; x += 0.05) rates.push(+x.toFixed(2));
    return { rates, ex: [{ html: cfTable([{ name: d.names[0], cf: d.A, extra: P(d.ia) }, { name: d.names[1], cf: d.B, extra: P(d.ib) }], 3, { extra: 'IRR' }) }, { html: npvRow(rates, [{ name: d.names[0], cf: d.A }, { name: d.names[1], cf: d.B }]) }] };
  }
  function mutex(r) {
    const d = mutexData(r), [a, b] = d.names, { rates, ex } = mutexExhibits(d);
    const lowR = rates.filter(x => x > 0 && x < d.cx - 0.005), midR = rates.filter(x => x > d.cx + 0.005 && x < d.ib - 0.005), bothR = rates.filter(x => x > d.ia + 0.005);
    const rq = lowR.length ? r.pick(lowR) : 0.05, NA = npv(rq, d.A), NB = npv(rq, d.B);
    const loC = Math.floor(d.cx / 0.05) * 0.05, hiC = loC + 0.05;
    const pool = [
      st(`At the ${P0(rq)} required return, the firm should choose ${b}.`, true, `Below the crossover, ${b} has the higher NPV (${$(Math.round(NB))} vs. ${$(Math.round(NA))}).`),
      st(`At the ${P0(rq)} required return, the firm should choose ${a}, because it has the higher IRR.`, false, `IRR ignores ${d.scale > 1 ? 'scale and ' : ''}timing. At ${P0(rq)}, ${b}'s NPV is higher: ${$(Math.round(NB))} vs. ${$(Math.round(NA))}.`),
      st(`Because ${a} has the higher IRR, it should be chosen whatever the required return.`, false, 'Below the crossover rate the other project has the higher NPV. Rank exclusive projects by NPV.'),
      st(`${b}'s NPV falls faster than ${a}'s as the discount rate rises, which is consistent with ${b}'s cash arriving later${d.scale > 1 ? ' and ' + b + ' being larger' : ''}.`, true, 'Later and larger cash flows lose more value as the rate rises, so the profile is steeper.'),
      st(`The NPV profiles cross between ${P0(loC)} and ${P0(hiC)}.`, true, `The crossover is about ${P(d.cx)}: ${b} is ahead at ${P0(loC)} and behind at ${P0(hiC)}.`),
      st(`The NPV profiles cross between ${P0(hiC)} and ${P0(hiC + 0.05)}.`, false, `Check the table: ${a} already has the higher NPV at ${P0(hiC)}. The crossover is about ${P(d.cx)}.`),
      st('At the crossover rate, both projects have an NPV of zero.', false, 'At the crossover the two NPVs are equal to each other, not to zero. Zero NPV happens at each project\'s own IRR.'),
      st(`At ${P0(rq)}, the IRR rule and the NPV rule rank the projects the same way.`, false, `IRR prefers ${a}; NPV at ${P0(rq)} prefers ${b}. They agree only above the crossover.`),
      st(`If the two projects were independent and funds allowed, the firm should build both at ${P0(rq)}.`, NA > 0 && NB > 0, NA > 0 && NB > 0 ? 'Independent projects: accept every positive-NPV project. Both are positive.' : 'Only positive-NPV projects should be built.'),
      st(`The crossover rate can be found as the IRR of the year-by-year difference in the two projects' cash flows.`, true, 'Where the difference has zero NPV, the two NPVs are equal.')
    ];
    if (midR.length) { const m = r.pick(midR); pool.push(st(`At a ${P0(m)} required return, the firm should choose ${a}.`, true, `${P0(m)} is above the crossover (${P(d.cx)}), where ${a} has the higher NPV, and below ${a}'s IRR, so its NPV is positive.`), st(`At a ${P0(m)} required return, the firm should choose ${b}, because it has the higher NPV at low rates.`, false, `${P0(m)} is above the crossover, where ${a} leads.`)); }
    if (bothR.length) { const m = r.pick(bothR); pool.push(st(`At a ${P0(m)} required return, the firm should reject both projects.`, true, `${P0(m)} is above both IRRs, so both NPVs are negative.`)); }
    return { gen: 'mutex', title: `${a} vs. ${b}`, examRef: 'Section A style · 2 points', stem: `A firm can build only one of two projects on the same site: ${a} or ${b}. Cash flows, IRRs and the NPV at several discount rates are below. The required return is ${P0(rq)} unless a statement says otherwise. Which statements are correct?`, exhibits: ex, parts: [sata(r, pool, 'mutex')], _d: d };
  }

  // ===== unconventional cash flows =====
  function unconvData(r) {
    if (r.chance(0.62)) {
      const r1 = r.pick([0.05, 0.1, 0.2, 0.25]), r2 = r.pick([0.4, 0.5, 0.6, 0.8]), K = r.pick([100, 200, 400]) * 1000;
      return { kind: 'two', cf: [-K, Math.round(K * (2 + r1 + r2)), -Math.round(K * (1 + r1) * (1 + r2))], r1, r2 };
    }
    const K = r.pick([100, 150, 200]) * 1000, B = round(K * r.range(2.15, 2.45), 10000), D = round(B * B / (4 * K) * r.range(1.04, 1.12), 10000);
    return { kind: 'none', cf: [-K, B, -D] };
  }
  const CLEANUP = [['strip mine', 'ore sales', 'land restoration'], ['music festival', 'ticket sales', 'park restoration'], ['oil well', 'oil sales', 'well plugging'], ['construction contract', 'client payment', 'warranty repairs'], ['landfill cell', 'tipping fees', 'site closure']];
  function unconv(r) {
    const d = unconvData(r), [nm, inflow, cleanup] = r.pick(CLEANUP), cf = d.cf, sum = cf.reduce((s, v) => s + v, 0);
    const rq = r.pick([0.1, 0.12, 0.15]), Nq = npv(rq, cf), rates = d.kind === 'two' ? [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0].filter(x => x <= d.r2 + 0.25) : [0, 0.1, 0.2, 0.3, 0.4, 0.5];
    const ex = [{ html: table(['Cash flow ($)', 'Year 0', 'Year 1', 'Year 2', 'Sum'], [['Total cash flow', comma(cf[0]), comma(cf[1]), comma(cf[2]), comma(sum)]], { label: 'Cash flows' }) }, { html: table(['Discount rate', ...rates.map(P0)], [['NPV ($)', ...rates.map(x => comma(Math.round(npv(x, cf))))]], { label: 'NPV profile' }) }];
    const pool = [
      st('The cash flows change sign twice, so Descartes\' rule allows at most two IRRs.', true, '−, +, −: two sign changes. That is a ceiling, not a guaranteed count.'),
      st('Because there are two sign changes, the project must have exactly two IRRs.', false, 'Descartes gives a maximum. The profile can cross twice, touch once, or never reach zero.'),
      st(`At a 0% discount rate the NPV equals the plain sum of the cash flows, ${$(sum)}.`, true, 'With no discounting, every dollar counts at face value.'),
      st(`At the ${P0(rq)} required return the project should be ${Nq > 0 ? 'accepted' : 'rejected'}, because its NPV is ${Nq > 0 ? 'positive' : 'negative'} (${$(Math.round(Nq))}).`, true, 'With unconventional cash flows, decide with NPV at the required return.'),
      st('Excel\'s =IRR() reports every IRR the project has.', false, 'It walks from its guess to the nearest root and stops. Change the guess to find another; the NPV profile is the source of truth.')
    ];
    if (d.kind === 'two') {
      const Nlow = npv(Math.max(0, d.r1 - 0.05), cf);
      pool.push(
        st(`The project has two IRRs, ${P0(d.r1)} and ${P0(d.r2)}.`, true, 'The profile crosses zero twice, at those two rates.'),
        st(`The ${P0(d.r1)} result is a mistake and ${P0(d.r2)} is the true IRR.`, false, 'Both are genuine roots of the NPV equation. Neither is "the" IRR.'),
        st(`The project has a positive NPV at any required return between ${P0(d.r1)} and ${P0(d.r2)}.`, true, 'For −, +, − the profile is a hill: positive only between the two IRRs.'),
        st(`At a ${P0(Math.max(0, d.r1 - 0.05))} required return the NPV would be higher than at ${P0(rq)}.`, Nlow > Nq, `NPV at ${P0(Math.max(0, d.r1 - 0.05))} is ${$(Math.round(Nlow))}; below the first IRR it is negative.`),
        st(`Because ${P0(rq)} is ${rq > d.r1 ? 'above the ' + P0(d.r1) + ' IRR, the IRR rule says reject' : 'below the ' + P0(d.r2) + ' IRR, the IRR rule says accept'}; the conflicting IRR signals show the IRR rule cannot be trusted here.`, true, 'One IRR says accept and the other says reject. That contradiction is why NPV decides.'),
        st('There is no required return at which this project should be accepted.', false, `NPV is positive between ${P0(d.r1)} and ${P0(d.r2)}.`)
      );
    } else {
      const peak = Math.max(...Array.from({ length: 101 }, (_, i) => npv(i / 100, cf)));
      pool.push(
        st('The project has no real IRR: the NPV profile never reaches zero.', true, `The NPV peaks at about ${$(Math.round(peak))}, still below zero, then falls toward ${$(cf[0])}.`),
        st('Excel\'s #NUM! means the analyst typed the cash flows wrong.', false, '#NUM! here means there is no rate to find. Not an error.'),
        st('There is no required return at which this project should be accepted.', true, 'NPV is negative at every discount rate.'),
        st(`Trying more guesses in =IRR() will eventually reveal the project's IRR.`, false, 'There is no real IRR to reveal.'),
        st(`Discounting makes the project look less bad at moderate rates because the ${cleanup} outflow comes last.`, npv(0.2, cf) > sum, 'Late outflows shrink most when discounted, so the NPV is less negative than the plain sum for a while.')
      );
    }
    return { gen: 'unconv', title: `A ${nm} with a cleanup cost`, examRef: 'Section A style · 2 points', stem: `A ${nm} costs ${$(-cf[0])} today, brings in ${$(cf[1])} from ${inflow} in Year 1, and requires ${$(-cf[2])} for ${cleanup} in Year 2. ${d.kind === 'none' ? 'Excel\'s =IRR() returns #NUM!.' : `Excel's =IRR(range) returns ${P0(d.r1)}; =IRR(range, 0.6) returns ${P0(d.r2)}.`} The required return is ${P0(rq)}. Which statements are correct?`, exhibits: ex, parts: [sata(r, pool, 'unconv')], _d: Object.assign({ rq, nm, inflow, cleanup }, d) };
  }

  // ===== operating cash flow =====
  function ocf(r) {
    const t = r.pick([0.2, 0.25, 0.3, 0.4]), dep = r.step(10, 40, 5) * 1000, rev = r.step(80, 200, 10) * 1000, opex = round(rev * r.range(0.35, 0.55), 10000);
    const ebt = rev - opex - dep; if (ebt <= 0) return ocf(r);
    const tax = ebt * t, ni = ebt - tax, o = ni + dep, ebitda = rev - opex, dd = 10000;
    const ex = [{ html: table(['Year 1', 'Amount ($)'], [['Revenue', comma(rev)], ['− Operating expenses', `(${comma(opex)})`], ['− Depreciation', `(${comma(dep)})`], ['= EBT', comma(ebt)], [`− Tax (${P0(t)})`, `(${comma(tax)})`], ['= Net income', comma(ni)]], { label: 'Income statement' }) }];
    const pool = [
      st(`The Year-1 operating cash flow is ${$(o)}.`, true, `OCF = NI + depreciation = ${comma(ni)} + ${comma(dep)} = ${comma(o)}.`),
      st(`The Year-1 operating cash flow is ${$(ni)}, the net income.`, false, `Net income subtracts ${$(dep)} of non-cash depreciation. OCF adds it back: ${$(o)}.`),
      st(`EBITDA of ${$(ebitda)} would be the correct Year-1 cash flow, because depreciation is not a cash expense.`, false, `EBITDA ignores the ${$(tax)} of tax, which is real cash. It overstates cash flow.`),
      st(`If depreciation were ${$(dep + dd)} instead, net income would fall but OCF would rise, by ${$(dd * t)}.`, true, `The extra ${$(dd)} of depreciation saves ${$(dd)} × ${P0(t)} = ${$(dd * t)} of tax.`),
      st(`If depreciation were ${$(dep + dd)} instead, both net income and OCF would fall.`, false, `OCF rises by the tax saved, ${$(dd * t)}. Only net income falls.`),
      st('If the tax rate were 0%, the amount of depreciation would have no effect on OCF.', true, `No tax means no tax shield: OCF = revenue − operating expenses = ${$(ebitda)}.`),
      st('If the equipment is eventually sold for exactly its book value, the sale has no tax effect.', true, 'Gain = market − book = 0.'),
      st('Using net income as the cash flow would overstate the project\'s value.', false, 'Net income is too low (it subtracts a non-cash charge), so it understates value.'),
      st('Using net income as the cash flow would understate the project\'s value.', true, 'It subtracts depreciation and never adds it back.'),
      st(`The depreciation tax shield this year is ${$(dep * t)}.`, true, `Depreciation × tax rate = ${comma(dep)} × ${P0(t)}.`),
      st(`The depreciation tax shield this year is ${$(dep * (1 - t))}.`, false, `The shield is depreciation × t = ${$(dep * t)}, not × (1 − t).`),
      st(`OCF also equals (revenue − operating expenses) × (1 − t) + depreciation × t.`, true, `${comma(ebitda)} × ${(1 - t).toFixed(2)} + ${comma(dep)} × ${t} = ${comma(o)}.`),
      st('Depreciation is a cash outflow in the year it is recorded.', false, 'It is an accounting allocation of a past purchase. No cash leaves when it is recorded.')
    ];
    return { gen: 'ocf', title: 'Operating cash flow', examRef: 'Section A style · 2 points + a quick number', stem: `A project's Year-1 income statement is shown below. The tax rate is ${P0(t)}.`, exhibits: ex, parts: [num('1', 'What is the Year-1 operating cash flow?', o, 'ocf', `Step 4 of the recipe: NI ${comma(ni)} + depreciation ${comma(dep)} = ${comma(o)}.`), sata(r, pool, 'ocf', 'Which statements are correct? Tick every one.')] };
  }

  // ===== after-tax salvage =====
  function salvage(r) {
    const cost = r.step(60, 300, 20) * 1000, life = r.pick([4, 5, 6, 8]), t = r.pick([0.21, 0.25, 0.3, 0.4]);
    const bv = r.chance(0.3) ? 0 : round(cost * r.range(0.1, 0.3), 2000), kind = r.pick(['gain', 'gain', 'loss', 'book']);
    let mv = kind === 'book' ? bv : kind === 'gain' ? bv + round(cost * r.range(0.05, 0.2), 2000) : Math.max(0, bv - round(cost * r.range(0.04, 0.1), 2000));
    if (kind === 'loss' && bv === 0) return salvage(r);
    const dep = (cost - bv) / life, g = mv - bv, tx = g * t, ats = mv - tx;
    const pool = [
      st(`Annual straight-line depreciation is ${$(dep)}.`, true, `(${comma(cost)} − ${comma(bv)}) ÷ ${life}.`),
      st(`The book value at the end of Year ${life} is ${$(bv)}.`, true, 'Cost minus accumulated depreciation.'),
      st(`The ${g >= 0 ? 'gain' : 'loss'} on the sale is ${$(Math.abs(g))}.`, true, `Market value ${comma(mv)} − book value ${comma(bv)}.`),
      st(`The after-tax salvage value is ${$(ats)}.`, true, g > 0 ? `Tax on the gain: ${comma(g)} × ${P0(t)} = ${comma(tx)}. After-tax = ${comma(mv)} − ${comma(tx)}.` : g < 0 ? `Tax benefit on the loss: ${comma(-g)} × ${P0(t)} = ${comma(-tx)}. After-tax = ${comma(mv)} + ${comma(-tx)}.` : 'Sold at book: no gain, no tax.'),
      ...(bv > 0 && g !== 0 ? [st(`The after-tax salvage value is ${$(mv * (1 - t))}.`, false, 'Tax applies to the gain (market − book), not to the whole sale price.')] : []),
      st(`Using the full ${$(mv)} sale price as the terminal cash flow would ${g > 0 ? 'overstate' : g < 0 ? 'understate' : 'not change'} the project's NPV.`, true, g > 0 ? `It ignores ${$(tx)} of tax.` : g < 0 ? `It ignores a ${$(-tx)} tax benefit.` : 'No tax effect at book value.'),
      st(`Because the asset sells ${g < 0 ? 'below' : 'above'} book value, the after-tax salvage is ${g < 0 ? 'greater' : 'less'} than the sale price.`, g !== 0, g === 0 ? 'Here it sells exactly at book: after-tax equals the sale price.' : g < 0 ? 'A loss is deductible, so the firm saves tax on top of the sale price.' : 'A gain is taxed, so the firm keeps less than the sale price.'),
      st(`Because the asset sells ${g < 0 ? 'below' : 'above'} book value, the after-tax salvage is ${g < 0 ? 'less' : 'greater'} than the sale price.`, false, g < 0 ? 'Below book means a deductible loss: a tax benefit, so after-tax salvage is higher.' : 'Above book means a taxable gain, so after-tax salvage is lower.'),
      st(`The final-year cash flow is the year's OCF plus ${$(ats)}.`, true, 'Terminal cash flow = OCF + after-tax salvage.'),
      st('Salvage value should be left out of NPV, since it is not an operating cash flow.', false, 'It is real cash at the end of the project and belongs in the final year\'s cash flow.')
    ];
    return { gen: 'salvage', title: 'Selling the equipment at the end', examRef: 'Section A style · 2 points + a quick number', stem: `Equipment costs ${$(cost)} and is depreciated straight-line over ${life} years to a book value of ${$(bv)}. At the end of Year ${life} it is sold for ${$(mv)}. The tax rate is ${P0(t)}.`, exhibits: [], parts: [num('1', 'What is the after-tax salvage value?', ats, 'salvage', `Book ${comma(bv)}, market ${comma(mv)}, ${g >= 0 ? 'gain' : 'loss'} ${comma(Math.abs(g))}, ${g >= 0 ? 'tax' : 'tax benefit'} ${comma(Math.abs(tx))}. After-tax salvage = ${comma(ats)}.`), sata(r, pool, 'salvage', 'Which statements are correct? Tick every one.')] };
  }

  // ===== unequal lives =====
  function lives(r) {
    for (let k = 0; k < 200; k++) {
      const pair = r.pick([[3, 6], [4, 6], [2, 4], [3, 4], [4, 8]]), rate = r.pick([0.08, 0.1, 0.12, 0.14]);
      const mk = n => { const c0 = r.step(20, 150, 10) * 1000; const ann = c0 / pvifa(rate, n) * r.range(1.06, 1.25); return [-c0, ...Array.from({ length: n }, (_, i) => round(ann * (1 + 0.04 * (n / 2 - i)), 1000))]; };
      const A = mk(pair[0]), B = mk(pair[1]), na = npv(rate, A), nb = npv(rate, B); if (na <= 0 || nb <= 0 || na >= nb) continue;
      const fa = pvifa(rate, pair[0]), fb = pvifa(rate, pair[1]), ea = na / fa, eb = nb / fb; if (Math.abs(ea - eb) < 200) continue;
      const lcm = pair[0] * pair[1] / gcd(pair[0], pair[1]), short = ea > eb, win = short ? 'the short-lived' : 'the long-lived';
      const nm = r.pick([['Compact washer', 'Industrial washer'], ['Electric van', 'Diesel truck'], ['Budget printer', 'Heavy-duty printer'], ['Leased server', 'Owned server rack']]);
      const ex = [{ html: table(['', nm[0], nm[1]], [['Life', pair[0] + ' years', pair[1] + ' years'], ['Single-cycle NPV', $(Math.round(na)), $(Math.round(nb))], [`PVIFA(${P0(rate)}, n)`, fa.toFixed(4), fb.toFixed(4)], ['EAC = NPV ÷ PVIFA', $(Math.round(ea)), $(Math.round(eb))]], { label: 'Unequal lives' }) }];
      const winner = short ? nm[0] : nm[1], loser = short ? nm[1] : nm[0];
      const pool = [
        st(`Comparing single-cycle NPVs, the ${nm[1]} looks better.`, true, `${$(Math.round(nb))} > ${$(Math.round(na))}. But it has ${pair[1] - pair[0]} more years to pile up value.`),
        st(`If the machine will be replaced indefinitely, the firm should choose the ${winner}.`, true, `Higher EAC: ${$(Math.round(Math.max(ea, eb)))} a year vs. ${$(Math.round(Math.min(ea, eb)))}.`),
        st(`If the machine will be replaced indefinitely, the firm should choose the ${loser}.`, false, `Its EAC is lower. With ongoing replacement, compare value per year.`),
        st('EAC is the NPV divided by the present value annuity factor for the asset\'s life.', true, 'EAC = NPV ÷ PVIFA(r, n): the level annual amount with the same value.'),
        st('EAC is the NPV multiplied by the present value annuity factor.', false, 'Divide, do not multiply.'),
        st(`A replacement chain over ${lcm} years would rank the two the same way as EAC.`, true, `${lcm} is the LCM of ${pair[0]} and ${pair[1]}. The two methods always agree.`),
        st('Both methods assume each machine is replaced with an identical one at the same cost.', true, 'That is the shared hidden assumption. Technology or price changes need a richer analysis.'),
        st(`If this is a one-time need that will not be repeated, the firm should simply compare NPVs and choose the ${nm[1]}.`, true, 'With no replacement, no adjustment is needed.'),
        st('The longer-lived machine always wins, because it produces cash for more years.', false, 'More years inflate total NPV, which is exactly why EAC is needed when the asset is replaced.'),
        st('Comparing the IRRs is the correct way to rank machines with different lives.', false, 'IRR ignores scale and life. Use EAC (or a replacement chain) when the need is ongoing.')
      ];
      return { gen: 'lives', title: `${nm[0]} vs. ${nm[1]}`, examRef: 'Section A style · 2 points', stem: `A firm needs one machine for an operation it plans to run indefinitely. The ${nm[0]} lasts ${pair[0]} years; the ${nm[1]} lasts ${pair[1]} years. The discount rate is ${P0(rate)}. Which statements are correct?`, exhibits: ex, parts: [sata(r, pool, 'lives')], _d: { win } };
    }
    return lives(rng(7));
  }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }

  // ===== mid-year discounting =====
  function midyear(r) {
    const rate = r.pick([0.08, 0.09, 0.1, 0.12, 0.15]), c0 = r.step(300, 800, 50) * 1000, n = 5;
    const cf = [-c0, ...Array.from({ length: n }, () => round(c0 * r.range(0.24, 0.32), 5000))];
    const end = npv(rate, cf), pvF = end + c0, f = Math.pow(1 + rate, 0.5), mid = pvF * f - c0, wrong = end * f;
    const ex = [{ html: cfTable([{ name: 'Cash flow', cf }], n) }, { html: table(['Given', 'Value'], [['End-of-year NPV', $(Math.round(end))], ['PV of Years 1–5 cash flows (end-of-year)', $(Math.round(pvF))], [`(1 + ${P0(rate)})^0.5`, f.toFixed(4)]], { label: 'Given values' }) }];
    const pool = [
      st('Mid-year discounting uses exponents of 0.5, 1.5, 2.5, 3.5 and 4.5 for Years 1 to 5.', true, 'Each year\'s cash is moved half a year earlier: t − 0.5.'),
      st('Mid-year discounting uses exponents of 0.25, 1.25, 2.25, 3.25 and 4.25.', false, 'That moves cash only a quarter year. Mid-year is t − 0.5.'),
      st(`The correct approach is to discount at ${P(rate / 2)} (half the annual rate).`, false, 'r ÷ 2 changes compounding frequency. Mid-year keeps the annual rate and changes when the cash arrives.'),
      st('The initial investment stays at t = 0.', true, 'It is a discrete, dated payment made on day one.'),
      st('The initial investment moves to t = −0.5 so that every flow shifts equally.', false, 'Only the operating cash that flows during each year shifts.'),
      st(`The mid-year NPV is about ${$(round(mid, 100))}.`, true, `${comma(Math.round(pvF))} × ${f.toFixed(4)} = ${comma(Math.round(pvF * f))}; minus ${comma(c0)}.`),
      st(`The mid-year NPV is about ${$(round(wrong, 100))}, the end-of-year NPV times ${f.toFixed(4)}.`, false, `Only the future cash flows are multiplied. The Year-0 cost stays as is: ${$(round(mid, 100))}.`),
      st('Mid-year discounting raises NPV, because each future cash flow is discounted for half a year less.', true, 'Less discounting, higher PV.'),
      st('The percentage boost from mid-year discounting is larger at higher discount rates.', true, `The boost on future cash is (1 + r)^0.5 − 1: ${P((Math.sqrt(1.05) - 1))} at 5% but ${P((Math.sqrt(1.15) - 1))} at 15%.`),
      st('The boost is the same percentage at every discount rate.', false, 'It grows with r: (1 + r)^0.5 − 1.'),
      st('Mid-year discounting suits a business that earns cash continuously, like a store or a clinic.', true, 'On average its cash arrives mid-year.'),
      st('Mid-year discounting suits a single contract payment received every December 31.', false, 'Lumpy, date-specific cash should be discounted at its actual date.')
    ];
    return { gen: 'midyear', title: 'Mid-year discounting', examRef: 'Section A style · 2 points + a quick number', stem: `A retail expansion costs ${$(c0)} today and produces the cash flows below, earned evenly through each year. The required return is ${P0(rate)}.`, exhibits: ex, parts: [num('1', 'What is the mid-year NPV?', mid, 'midyear', `Mid-year PV of future CFs = ${comma(Math.round(pvF))} × ${f.toFixed(4)} = ${comma(Math.round(pvF * f))}. Subtract the ${comma(c0)} investment, which stays at t = 0: ${comma(Math.round(mid))}.`, { tol: { rel: 0.004 } }), sata(r, pool, 'midyear', 'Which statements are correct? Tick every one.')] };
  }

  // ===== free cash flow =====
  function fcfData(r) {
    const t = r.pick([0.21, 0.25, 0.3, 0.4]), ebit = r.step(1000, 6000, 100) * 1000, dep = round(ebit * r.range(0.12, 0.2), 1000), dnfa = round(ebit * r.range(0.08, 0.16), 1000), dca = round(ebit * r.range(0.02, 0.05), 1000), dcl = round(dca * r.range(0.3, 0.7), 1000), intr = round(ebit * r.range(0.04, 0.08), 1000);
    const nopat = ebit * (1 - t), capex = dnfa + dep, dnwc = dca - dcl, fcf = nopat + dep - capex - dnwc;
    return { t, ebit, dep, dnfa, dca, dcl, intr, nopat, capex, dnwc, fcf };
  }
  function fcf(r) {
    const d = fcfData(r);
    const ex = [{ html: table(['Given (forecast year)', 'Amount ($)'], [['EBIT', comma(d.ebit)], ['Interest paid on debt', comma(d.intr)], ['Tax rate', P0(d.t)], ['Depreciation', comma(d.dep)], ['Δ Net fixed assets', comma(d.dnfa)], ['Δ Current assets', comma(d.dca)], ['Δ Current liabilities', comma(d.dcl)]], { label: 'Inputs' }) }];
    const pool = [
      st(`NOPAT is ${$(d.nopat)}.`, true, `EBIT × (1 − t) = ${comma(d.ebit)} × ${(1 - d.t).toFixed(2)}.`),
      st(`Capital expenditures are ${$(d.capex)}.`, true, `CapEx = ΔNFA + depreciation = ${comma(d.dnfa)} + ${comma(d.dep)}.`),
      st(`Capital expenditures are ${$(d.dnfa)}, the change in net fixed assets.`, false, `ΔNFA is net of depreciation. Gross spending is ΔNFA + Dep = ${$(d.capex)}.`),
      st(`The change in net working capital is ${$(d.dnwc)}.`, true, `ΔCA − ΔCL = ${comma(d.dca)} − ${comma(d.dcl)}.`),
      st(`Free cash flow is ${$(d.fcf)}.`, true, `${comma(d.nopat)} + ${comma(d.dep)} − ${comma(d.capex)} − ${comma(d.dnwc)}.`),
      st(`Free cash flow equals NOPAT − ΔNFA − ΔNWC, because depreciation cancels out.`, true, `+Dep and the −Dep inside CapEx cancel: ${comma(d.nopat)} − ${comma(d.dnfa)} − ${comma(d.dnwc)} = ${comma(d.fcf)}.`),
      st(`The ${$(d.intr)} of interest should be subtracted to get free cash flow.`, false, 'FCF is cash for lenders and shareholders together. Interest is the lenders\' share, so it is not subtracted.'),
      st('Depreciation is double counted, because it is added back and also included in CapEx.', false, 'The two terms do different jobs and cancel: zero net effect, as a non-cash charge should have.'),
      st('If current liabilities had risen by more, free cash flow would be higher.', true, 'Suppliers financing the firm keep cash inside it.'),
      st('If current assets had risen by more, free cash flow would be higher.', false, 'More inventory and receivables tie up cash, lowering FCF.'),
      st('Taxes in the FCF calculation are computed on EBIT, not on profit before tax.', true, 'FCF is measured as if the firm had no debt; the debt tax shield is in WACC.'),
      st('If the firm doubled its dividend, free cash flow would fall.', false, 'Dividends distribute FCF; they do not change it.'),
      st('Free cash flow is the cash available to shareholders only.', false, 'It is available to all capital providers: lenders and shareholders.')
    ];
    return { gen: 'fcf', title: 'Free cash flow from EBIT', examRef: 'Section A style · 2 points + a quick number', stem: 'A firm\'s forecast for next year is below. The model tracks net fixed assets, like Cooper Dental.', exhibits: ex, parts: [num('1', 'What is free cash flow?', d.fcf, 'fcf', `NOPAT ${comma(d.nopat)} + Dep ${comma(d.dep)} − CapEx ${comma(d.capex)} − ΔNWC ${comma(d.dnwc)} = ${comma(d.fcf)}.`), sata(r, pool, 'fcf', 'Which statements are correct? Tick every one.')] };
  }

  // ===== WACC, g and terminal value =====
  function tv(r) {
    const w = r.pick([0.09, 0.1, 0.11, 0.12, 0.14]), g = r.pick([0.02, 0.025, 0.03, 0.04]), F = r.step(1000, 5000, 100) * 1000;
    const TV = F * (1 + g) / (w - g), df = 1 / Math.pow(1 + w, 5), pvtv = TV * df, pvf = round(F * r.range(3.0, 3.6), 1000), ev = pvf + pvtv, share = pvtv / ev;
    const we = r.pick([0.5, 0.6, 0.7, 0.8]), re = r.pick([0.1, 0.12, 0.14]), rd = r.pick([0.05, 0.06, 0.08]), tc = r.pick([0.21, 0.25]), wacc = we * re + (1 - we) * rd * (1 - tc), noTax = we * re + (1 - we) * rd;
    const ex = [{ html: table(['Given', 'Value'], [['FCF in Year 5 (last forecast year)', $(F)], ['WACC', P0(w)], ['Long-term growth g', P(g)], [`Discount factor for Year 5, 1 ÷ (1 + ${P0(w)})^5`, df.toFixed(4)], ['Sum of PV of FCFs, Years 1–5', $(pvf)]], { label: 'Given' }) }];
    const pool = [
      st(`The terminal value at the end of Year 5 is about ${$(round(TV, 1000))}.`, true, `${comma(F)} × ${(1 + g).toFixed(3)} ÷ (${P0(w)} − ${P(g)}) = ${comma(Math.round(TV))}.`),
      st(`The terminal value at the end of Year 5 is about ${$(round(F / (w - g), 1000))}.`, false, `That forgets the (1 + g): the TV is built on next year's FCF, ${comma(F)} × ${(1 + g).toFixed(3)}.`),
      st(`The terminal value is about ${P0(share)} of enterprise value.`, true, `PV of TV ${comma(Math.round(pvtv))} ÷ EV ${comma(Math.round(ev))}. Normal range: 60–80%.`),
      st('Raising g, with WACC unchanged, raises the terminal value.', true, 'A larger numerator and a smaller WACC − g spread.'),
      st('Raising WACC, with g unchanged, raises the terminal value.', false, 'It widens WACC − g and discounts the TV more: TV falls.'),
      st('If g were set equal to WACC, the formula would give an infinite value, which is why WACC must exceed g.', true, 'Dividing by zero. WACC ≤ g is economically nonsense.'),
      st('A fast-growing company can use a long-term g above its WACC.', false, 'No company outgrows the economy forever; WACC > g always.'),
      st('Extending the forecast to ten years would remove the need for a terminal value.', false, 'The firm is a going concern. Cash after Year 10 still needs valuing.'),
      st('g should be anchored to long-run nominal GDP growth, around 2–3%.', true, 'Slide 40.'),
      st(`With ${P0(we)} equity at ${P0(re)}, ${P0(1 - we)} debt at ${P0(rd)} and a ${P0(tc)} tax rate, WACC is ${P(wacc)}.`, true, `${we} × ${P0(re)} + ${(1 - we).toFixed(1)} × ${P0(rd)} × ${(1 - tc).toFixed(2)} = ${P(wacc)}.`),
      st(`With ${P0(we)} equity at ${P0(re)}, ${P0(1 - we)} debt at ${P0(rd)} and a ${P0(tc)} tax rate, WACC is ${P(noTax)}.`, false, `That ignores the tax shield on debt. Multiply the cost of debt by (1 − ${P0(tc)}): ${P(wacc)}.`),
      st('FCF is discounted at WACC because it belongs to lenders and shareholders together.', true, 'The discount rate matches whose cash it is.')
    ];
    return { gen: 'tv', title: 'Terminal value and WACC', examRef: 'Section A style · 2 points', stem: 'A five-year DCF has the inputs below. The terminal value uses the Gordon Growth formula. Which statements are correct?', exhibits: ex, parts: [sata(r, pool, 'tv')] };
  }

  // ===== equity bridge and the call =====
  function bridgeData(r) {
    for (;;) {
      const sh = r.pick([0.5, 1, 2, 4, 5]) * 1e6, ev = r.step(20, 300, 5) * 1e6 * (sh / 1e6) / 2, cash = round(ev * r.range(0.02, 0.08), 1e5), debt = round(ev * r.range(0.1, 0.3), 1e5);
      const eq = ev + cash - debt, vps = eq / sh; if (vps < 5) continue;
      const call = r.pick(['Buy', 'Hold', 'Sell']), price = Math.round(call === 'Buy' ? vps * r.range(0.6, 0.9) : call === 'Sell' ? vps * r.range(1.1, 1.4) : vps * r.range(0.97, 1.03));
      if (C.callOf(vps, price) !== call) continue;
      return { sh, ev, cash, debt, eq, vps, price, call };
    }
  }
  function bridge(r) {
    const d = bridgeData(r), M = v => '$' + (v / 1e6).toFixed(2) + 'M', S = v => '$' + v.toFixed(2), add = round(d.sh * r.pick([1, 2, 3]), 1e5);
    const p2 = d.call === 'Hold' ? Math.round(d.vps * 1.12) : Math.round(d.vps);
    const ex = [{ html: table(['Valuation summary', 'Amount'], [['Enterprise value', M(d.ev)], ['Cash', M(d.cash)], ['Debt', M(d.debt)], ['Diluted shares', comma(d.sh)], ['Market price', '$' + d.price.toFixed(2)], ['Hold band', '±5% around value per share']], { label: 'Bridge inputs' }) }];
    const pool = [
      st(`Equity value is ${M(d.eq)}.`, true, `EV + cash − debt = ${M(d.ev)} + ${M(d.cash)} − ${M(d.debt)}.`),
      st(`Value per share is ${S(d.vps)}.`, true, `${M(d.eq)} ÷ ${comma(d.sh)} shares.`),
      st(`Value per share is ${S(d.ev / d.sh)}.`, false, `That is EV ÷ shares, which skips + cash and − debt. Correct: ${S(d.vps)}.`),
      st(`At the market price of $${d.price.toFixed(2)} the recommendation is ${d.call}.`, true, `Band: ${S(d.vps * 0.95)} to ${S(d.vps * 1.05)}. The price is ${d.call === 'Buy' ? 'below' : d.call === 'Sell' ? 'above' : 'inside'} it.`),
      st(`At the market price of $${d.price.toFixed(2)} the recommendation is ${d.call === 'Buy' ? 'Sell' : 'Buy'}.`, false, `Band: ${S(d.vps * 0.95)} to ${S(d.vps * 1.05)}; the call is ${d.call}.`),
      st(`If the firm had ${M(add)} more cash today, value per share would be about ${S(add / d.sh)} higher.`, true, 'Cash passes straight through the bridge: + cash ÷ shares.'),
      st(`If the analyst forgot to subtract debt, value per share would be overstated by ${S(d.debt / d.sh)}.`, true, 'Debt ÷ shares.'),
      st(`If the analyst forgot to add cash, value per share would be overstated by ${S(d.cash / d.sh)}.`, false, `Leaving out cash understates value per share, by ${S(d.cash / d.sh)}.`),
      st('Using basic shares instead of diluted shares would understate value per share.', false, 'Basic shares are fewer, so dividing by them overstates value per share. Use diluted shares.'),
      st('Raising the dividend payout ratio would raise value per share.', false, 'Dividends do not change FCF, so they do not change value.'),
      st(`If the market price moved to $${p2.toFixed(2)}, the recommendation would be ${C.callOf(d.vps, p2)}.`, true, `Band ${S(d.vps * 0.95)} to ${S(d.vps * 1.05)}.`),
      st('Enterprise value is the same thing as the NPV of the forecast-period free cash flows.', false, 'EV = PV of forecast FCFs + PV of terminal value. Dropping the TV loses most of the value.')
    ];
    return { gen: 'bridge', title: 'From enterprise value to a call', examRef: 'Section A style · 2 points + a quick number', stem: 'A DCF model produces the valuation summary below. The stock is fairly valued (Hold) when the market price is within 5% of value per share.', exhibits: ex, parts: [num('1', 'What is the value per share?', d.vps, 'bridge', `(${M(d.ev)} + ${M(d.cash)} − ${M(d.debt)}) ÷ ${comma(d.sh)} = ${S(d.vps)}.`, { tol: { abs: 0.02 } }), sata(r, pool, 'bridge', 'Which statements are correct? Tick every one.')] };
  }

  // ===== sensitivity tables =====
  function sens(r) {
    const useCogs = r.chance(0.5), g0 = useCogs ? C.COGS_G : C.WACC_G, price = r.pick([10, 20, 25, 30]), base = useCogs ? [2, 3] : [4, 4];
    const ri = r.int(0, g0.rows.length - 1), ci = r.int(0, g0.cols.length - 1), v = g0.v[ri][ci]; if (v == null) return sens(r);
    const sell = price / 1.05, buy = price / 0.95, call = C.callOf(v, price), rn = useCogs ? 'COGS' : 'WACC', cn = useCogs ? 'sales growth' : 'g';
    const ex = [{ html: C.grid(g0, useCogs ? 'COGS %' : 'WACC', useCogs ? 'growth' : 'g', null, null, { label: 'Sensitivity table' }) }];
    const cells = g0.v.flat().filter(x => x != null), allBuy = cells.every(x => C.callOf(x, price) === 'Buy');
    const pool = [
      st(`The base case ($26.12) is at ${rn} = ${P0(g0.rows[base[0]])} and ${cn} = ${P0(g0.cols[base[1]])}.`, true, 'Locate the base case first.'),
      st(`At ${rn} = ${P0(g0.rows[ri])} and ${cn} = ${P0(g0.cols[ci])}, with a $${price} price, the call is ${call}.`, true, `Value $${v.toFixed(2)}. Sell below $${sell.toFixed(2)} (= ${price} ÷ 1.05), Buy above $${buy.toFixed(2)} (= ${price} ÷ 0.95).`),
      st(`At ${rn} = ${P0(g0.rows[ri])} and ${cn} = ${P0(g0.cols[ci])}, with a $${price} price, the call is ${call === 'Buy' ? 'Sell' : 'Buy'}.`, false, `Value $${v.toFixed(2)} gives ${call}.`),
      st(`With a $${price} price, a Sell needs a value per share below about $${sell.toFixed(2)}.`, true, `The price must be more than 5% above value: value < ${price} ÷ 1.05.`),
      st(`With a $${price} price, a Sell needs a value per share below $${(price * 0.95).toFixed(2)}.`, false, `The band is around value per share, so the threshold is ${price} ÷ 1.05 = $${sell.toFixed(2)}, not ${price} × 0.95.`),
      st(`With a $${price} price, every cell in the table is a Buy.`, allBuy, allBuy ? 'Even the lowest cell clears the Buy threshold.' : `Some cells fall below $${buy.toFixed(2)}.`)
    ];
    if (useCogs) pool.push(
      st('Moving down any column (higher COGS), value per share falls.', true, 'COGS sets the margin: NOPAT and every FCF shrink.'),
      st('In the 65% COGS row, faster growth lowers value per share because thin margins cannot repay the working capital and fixed assets growth requires.', true, 'Each sales dollar needs about 7 cents of NWC and 77 cents of fixed assets; at a 35% gross margin the return falls below WACC.'),
      st('In the 65% COGS row, faster growth lowers value per share because taxes rise faster than sales.', false, 'The tax rate is constant. The problem is the investment growth requires.'),
      st('Cutting COGS from 50% to 45% while growth slows from 10% to 6% raises value per share by $3.61, about 13.8%.', true, '$26.12 → $29.73.'),
      st('At 40% COGS, growth adds value; at 50% the row is nearly flat.', true, 'High margins earn more than the cost of the investment growth needs; at 50% growth roughly breaks even.'));
    else pool.push(
      st('Moving down any column (higher WACC), value per share falls.', true, 'A higher WACC discounts FCFs and the TV more and widens WACC − g.'),
      st('Moving right along a row (higher g), value per share falls.', false, 'g raises the TV, so value rises, explosively as g approaches WACC.'),
      st('At WACC = 10% and g = 10% the table shows N/A, because the TV formula breaks when WACC = g.', true, 'Dividing by zero.'),
      st('At WACC 14%, lowering g from 6% to 5% cuts value per share by about 9%.', true, '$26.12 → $23.74: −$2.38, −9.1%.'),
      st('WACC 12% / g 4% and WACC 16% / g 8% give the same value, since the spread is 8 points in both.', false, '$27.93 vs. $24.45. WACC also discounts the forecast FCFs and the TV, so a higher WACC hurts more than a higher g helps.'));
    return { gen: 'sens', title: useCogs ? 'COGS % × sales growth table' : 'WACC × g table', examRef: 'Section A style · 2 points', stem: `This two-way table comes from the Cooper Dental model (${useCogs ? 'WACC 14% and g 6% held constant' : 'COGS 50% and growth 10% held constant'}). Suppose the market price is $${price.toFixed(2)} and the model applies a 5% Hold band. Which statements are correct?`, exhibits: ex, parts: [sata(r, pool, 'sens')] };
  }

  // ===== Section B scenarios (written answers) =====
  function scMutex(r) {
    const d = mutexData(r), [a, b] = d.names, { rates, ex } = mutexExhibits(d), rq = rates.filter(x => x > 0 && x < d.cx - 0.005)[0] || 0.05;
    const NA = npv(rq, d.A), NB = npv(rq, d.B), hiR = rates.filter(x => x > d.ia + 0.005)[0];
    const parts = [
      txt('a', `At the ${P0(rq)} required return, which project does the IRR rule favor and which does the NPV rule favor? Which should the firm build, and why? [1.5]`, 1.5, 'mutex', `The IRR rule favors ${a} (${P(d.ia)} vs. ${P(d.ib)}). The NPV rule favors ${b} (${$(Math.round(NB))} vs. ${$(Math.round(NA))} at ${P0(rq)}). Build ${b}: the projects are mutually exclusive, and NPV measures the dollars of value each creates, here ${$(Math.round(NB - NA))} more. IRR is a percentage and can misrank exclusive projects.`, [`IRR favors ${a}`, `NPV favors ${b}`, `Build ${b}`, 'Exclusive projects are ranked by NPV, the dollars of value created']),
      txt('b', 'Explain why the two rules disagree, referring to the cash flows. [1]', 1, 'mutex', `${d.scale > 1 ? `Scale: ${b} invests ${d.scale} times as much, and IRR, being a percentage, ignores the size of the investment. ` : 'Both cost the same, so scale is not the reason. '}Timing: ${a}'s cash is front-loaded (${d.A.slice(1).map(comma).join(', ')}) while ${b}'s grows over time (${d.B.slice(1).map(comma).join(', ')}). Later cash is hit harder by discounting, so ${b}'s NPV falls faster as the rate rises; the profiles cross at about ${P(d.cx)}. Below that rate ${b} has the higher NPV; IRR also implicitly reinvests ${a}'s early cash at its own high rate.`, [d.scale > 1 ? `Scale: ${b} is ${d.scale}× larger; IRR ignores scale` : 'Same cost, so the difference is timing', `Timing: ${a} front-loaded, ${b} back-loaded`, `${b}'s profile is steeper; they cross near ${P0(d.cx)}`, 'Below the crossover the steeper project has the higher NPV'])
    ];
    if (hiR) parts.push(txt('c', `Suppose the required return were ${P0(hiR)} or higher. What should the firm do, and does the ranking matter? [1]`, 1, 'mutex', `Reject both. At ${P0(hiR)} both NPVs are negative (${$(Math.round(npv(hiR, d.A)))} and ${$(Math.round(npv(hiR, d.B)))}) because the rate is above both IRRs. The ranking does not matter when both projects destroy value.`, ['Reject both', 'Both NPVs negative: rate above both IRRs', 'Ranking is irrelevant']));
    parts.push(txt(hiR ? 'd' : 'c', `If the projects became independent and funds allowed, what should the firm do at ${P0(rq)}? [0.5]`, 0.5, 'mutex', NA > 0 && NB > 0 ? `Build both: independent projects are accepted whenever NPV > 0, and both are positive at ${P0(rq)}.` : `Build only the positive-NPV project(s).`, ['Accept every positive-NPV independent project', NA > 0 && NB > 0 ? 'Both are positive, so build both' : 'Only the positive one']));
    return { gen: 'sc-mutex', title: `${a} vs. ${b}`, examRef: 'Section B style · 3.5–4 points', stem: `A firm holds one site and must choose between ${a} and ${b}. Only one can be built. The required return is ${P0(rq)}.`, exhibits: [...ex, { html: E.profile([{ name: a, cf: d.A }, { name: b, cf: d.B }], { lo: 0, hi: Math.min(0.45, d.ia + 0.08), mark: rq, cross: true, title: 'NPV profiles' }) }], parts };
  }
  function scUnconv(r) {
    const q = unconv(r), d = q._d, cf = d.cf, sum = cf.reduce((s, v) => s + v, 0), Nq = npv(d.rq, cf);
    const parts = d.kind === 'two' ? [
      txt('a', 'How many IRRs does this project have? Explain using the cash-flow signs and the NPV profile. [1]', 1, 'unconv', `Two: ${P0(d.r1)} and ${P0(d.r2)}. The cash flows change sign twice (−, +, −), so up to two IRRs are possible, and the profile, a hill, crosses zero at both rates. Excel's =IRR() returns whichever root is nearest the guess, which is why two different guesses gave two answers. Neither is a mistake.`, ['Two IRRs, at both reported rates', 'Two sign changes: up to two IRRs', 'Hill-shaped profile crosses zero twice', 'Different guesses find different roots; neither is wrong']),
      txt('b', `Should the firm accept the project at ${P0(d.rq)}? Why is the IRR rule unreliable here? [1]`, 1, 'unconv', `${Nq > 0 ? 'Accept' : 'Reject'}: the NPV at ${P0(d.rq)} is ${$(Math.round(Nq))}. The IRR rule gives conflicting signals: ${P0(d.rq)} is ${d.rq > d.r1 ? 'above' : 'below'} ${P0(d.r1)} but below ${P0(d.r2)}, so one IRR says ${d.rq > d.r1 ? 'reject' : 'accept'} and the other says accept. NPV at the required return gives one clear answer.`, [`${Nq > 0 ? 'Accept' : 'Reject'} based on NPV at the required return`, 'The two IRRs give contradictory accept/reject signals', 'NPV positive only between the IRRs']),
      txt('c', `The undiscounted sum is ${$(sum)}. Why is the NPV ${npv(0.2, cf) > sum ? 'higher at moderate discount rates' : 'different'}? [1]`, 1, 'unconv', `The large ${d.cleanup} outflow comes last. Discounting shrinks later cash flows the most, so as the rate rises the PV of that cost falls faster than the PV of the earlier inflow. Up to a point that raises NPV; past the peak, the shrinking inflow dominates and NPV falls.`, ['The large outflow is last', 'Discounting shrinks later flows more', 'So NPV rises with r at first, then falls'])
    ] : [
      txt('a', 'How many IRRs does this project have? Does #NUM! mean the analyst made a mistake? [1]', 1, 'unconv', 'None. Two sign changes allow up to two IRRs, but that is a ceiling. The NPV profile peaks below zero and never crosses it, so there is no real IRR. #NUM! is Excel saying there is no rate to find, not an analyst error.', ['Zero IRRs', 'Descartes gives a maximum, not a count', 'Profile never reaches zero', '#NUM! is not a mistake']),
      txt('b', `Should the firm accept at ${P0(d.rq)}? Is there any rate at which it should be accepted? [1]`, 1, 'unconv', `No. NPV at ${P0(d.rq)} is ${$(Math.round(Nq))}, and NPV is negative at every rate: ${$(sum)} at 0%, a peak still below zero, and toward ${$(cf[0])} at very high rates. Reject at any required return.`, ['Reject', 'NPV negative at every rate', 'Even the peak is below zero']),
      txt('c', `Why is the NPV at 20% (${$(Math.round(npv(0.2, cf)))}) ${npv(0.2, cf) > sum ? 'less negative than' : 'different from'} the plain sum of ${$(sum)}? [1]`, 1, 'unconv', `The ${d.cleanup} outflow comes last, so discounting shrinks it more than the earlier inflow, which makes NPV less negative at moderate rates.`, ['The outflow is last', 'Later flows shrink most when discounted'])
    ];
    return { gen: 'sc-unconv', title: q.title, examRef: 'Section B style · 3 points', stem: q.stem.replace(' Which statements are correct?', ''), exhibits: [...q.exhibits, { html: E.profile([{ name: 'NPV', cf }], { lo: 0, hi: d.kind === 'two' ? Math.min(1.2, d.r2 + 0.3) : 0.6, mark: d.rq, title: 'NPV profile' }) }], parts };
  }
  function scDcf(r) {
    const d = fcfData(r), M = v => '$' + comma(Math.round(v)), w = r.pick([0.09, 0.095, 0.1, 0.11]), sh = r.pick([200000, 300000, 500000, 1000000]);
    const pvf = round(d.fcf * r.range(3.6, 4.1), 1000), pvtv = round(pvf * r.range(2.2, 3.0), 1000), ev = pvf + pvtv, cash = round(ev * r.range(0.02, 0.05), 10000), debt = round(ev * r.range(0.08, 0.18), 10000);
    const vps = (ev + cash - debt) / sh, short = ev / sh, price = Math.round(vps * r.pick([0.75, 1.2, 1.25])), call = C.callOf(vps, price), call2 = C.callOf(short, price);
    const nm = r.pick(['Seaside Veterinary', 'Harbor Physical Therapy', 'Bayshore Dental Labs', 'Gulf Coast Optometry']);
    const ex = [{ html: table(['Forecast-year free cash flow', 'How it was computed', 'Amount ($)'], [['EBIT', 'From the income statement', comma(d.ebit)], ['− Taxes on EBIT', `${P0(d.t)} × ${comma(d.ebit)}`, `(${comma(d.ebit * d.t)})`], ['= NOPAT', `EBIT × (1 − ${P0(d.t)})`, comma(d.nopat)], ['+ Depreciation', '', comma(d.dep)], ['− Capital expenditures', `Δ NFA ${comma(d.dnfa)} + Depreciation ${comma(d.dep)}`, `(${comma(d.capex)})`], ['− Change in NWC', `Δ CA ${comma(d.dca)} − Δ CL ${comma(d.dcl)}`, `(${comma(d.dnwc)})`], ['= Free cash flow', '', comma(d.fcf)]], { label: 'FCF' }) },
      { html: table(['Valuation summary', 'Amount'], [['WACC', P(w)], ['Sum of PV of FCFs', M(pvf)], ['PV of terminal value', M(pvtv)], ['Enterprise value', M(ev)], ['+ Cash', M(cash)], ['− Debt', `(${M(debt)})`], ['Equity value', M(ev + cash - debt)], ['Diluted shares', comma(sh)], ['Value per share', '$' + vps.toFixed(2)], ['Market price', '$' + price.toFixed(2)]], { label: 'Valuation' }) }];
    const flip = call !== call2;
    const parts = [
      txt('a', `NOPAT is ${M(d.nopat)} but FCF is ${M(d.fcf)}. Identify each item between them and explain why it is a real source or use of cash. [1]`, 1, 'fcf', `+ Depreciation ${M(d.dep)}: non-cash, added back. − CapEx ${M(d.capex)}: real cash spent on fixed assets (ΔNFA ${M(d.dnfa)} + depreciation). − ΔNWC ${M(d.dnwc)}: current assets grew ${M(d.dca)}, tying up cash, partly financed by a ${M(d.dcl)} rise in current liabilities.`, ['+ Depreciation: non-cash add-back', '− CapEx: cash spent on fixed assets', '− ΔNWC: growth in current assets uses cash, offset by current liabilities']),
      txt('b', 'Depreciation appears twice in the table. Is this double counting? [1]', 1, 'fcf', `No. +${M(d.dep)} reverses the non-cash charge in EBIT; the −${M(d.dep)} inside CapEx converts ΔNFA into gross spending (CapEx = ΔNFA + Dep). They cancel, so depreciation has zero net effect, and the net investment left is ΔNFA = ${M(d.dnfa)}.`, ['Not double counting', '+Dep reverses the non-cash charge', '−Dep inside CapEx recovers gross spending from ΔNFA', 'They cancel: zero net effect']),
      txt('c', 'Why does FCF start from EBIT rather than net income? [1]', 1, 'fcf', 'FCF is the cash available to all capital providers, lenders and shareholders. Interest is the lenders\' share of that cash, so subtracting it first (as net income does) would remove part of what FCF measures.', ['FCF is for lenders and shareholders', 'Interest is a payment to lenders, not an operating cost', 'Net income has already removed the lenders\' share']),
      txt('d', `An analyst divides enterprise value by shares and gets $${short.toFixed(2)}. Identify what was left out, the size of the error, and whether it changes the call at $${price.toFixed(2)} (5% Hold band). [1]`, 1, 'bridge', `Left out: + cash ${M(cash)} and − debt ${M(debt)}. EV belongs to lenders and shareholders together; shareholders own EV + cash − debt. Correct value per share is $${vps.toFixed(2)}, so the shortcut overstates it by $${(short - vps).toFixed(2)}. ${flip ? `It changes the call: ${call2} instead of the correct ${call}.` : `The call (${call}) is unchanged here only by luck; a bigger gap or a closer price would flip it.`}`, ['Left out + cash and − debt', `Correct value $${vps.toFixed(2)}; overstated by $${(short - vps).toFixed(2)}`, flip ? `The call flips from ${call} to ${call2}` : 'Same call only by luck', 'EV is the whole firm, not the equity'])
    ];
    return { gen: 'sc-dcf', title: nm, examRef: 'Section B style · 4 points', stem: `${nm} trades at $${price.toFixed(2)}. An analyst built a DCF with the same structure as Cooper Dental. Every figure has been computed.`, exhibits: ex, parts };
  }
  function scSens(r) {
    const price = r.pick([10, 20, 25]), sell = price / 1.05, buy = price / 0.95, g0 = C.COGS_G;
    const ri = r.int(0, 5), row = g0.v[ri], firstSell = row.findIndex(v => C.callOf(v, price) === 'Sell');
    const from = [2, 3], to = r.pick([[1, 1], [1, 0], [0, 2], [3, 5], [1, 2]]), v0 = g0.v[from[0]][from[1]], v1 = g0.v[to[0]][to[1]];
    const parts = [
      txt('a', 'Using Table 1, explain why the terminal value is much more sensitive to WACC than the forecast-period FCFs are. [1]', 1, 'tv', 'The TV is a growing perpetuity, FCF(1 + g)/(WACC − g), so WACC sits in its denominator: from 10% to 18% at g = 6%, the spread triples and the TV shrinks to about a third. It is also discounted from the farthest date, so compounding hits it hardest. The forecast FCFs are discounted only a few years and have no denominator effect.', ['WACC is in the TV denominator (WACC − g)', 'The spread triples from 10% to 18%', 'TV is discounted from the farthest date', 'Forecast FCFs are discounted only a few years']),
      txt('b', `Management proposes moving from COGS ${P0(g0.rows[from[0]])} / growth ${P0(g0.cols[from[1]])} to COGS ${P0(g0.rows[to[0]])} / growth ${P0(g0.cols[to[1]])}. Is it worth it? By how much per share and by what percentage? [1]`, 1, 'sens', `${v1 > v0 ? 'Yes' : 'No'}. Value per share moves from $${v0.toFixed(2)} to $${v1.toFixed(2)}, ${v1 > v0 ? 'a gain' : 'a loss'} of $${Math.abs(v1 - v0).toFixed(2)} per share, or ${P(Math.abs(v1 - v0) / v0)}.`, [v1 > v0 ? 'Worth it' : 'Not worth it', `$${v0.toFixed(2)} → $${v1.toFixed(2)}`, `${v1 > v0 ? '+' : '−'}$${Math.abs(v1 - v0).toFixed(2)} per share`, `≈ ${P(Math.abs(v1 - v0) / v0)}`]),
      txt('c', `Look at the COGS = ${P0(g0.rows[ri])} row with a market price of $${price.toFixed(2)} and a 5% Hold band. Below what value per share is it a Sell, and at what growth rate does that first happen in this row (if ever)? Explain the pattern across the row. [1]`, 1, 'sens', `Sell when value per share is below $${price} ÷ 1.05 ≈ $${sell.toFixed(2)}. ${firstSell >= 0 ? `In this row that first happens at ${P0(g0.cols[firstSell])} growth ($${row[firstSell].toFixed(2)}).` : 'In this row it never happens.'} ${ri <= 1 ? 'Across the row, value rises with growth: at this margin each new sales dollar earns more than the cost of the working capital and fixed assets growth requires.' : ri === 2 ? 'The row is nearly flat: at a 50% COGS, growth roughly earns its cost of capital.' : 'Across the row, value falls with growth: growth requires investment in working capital and fixed assets, and at this thin margin it does not earn its cost of capital, so you cannot grow your way out of a cost problem.'}`, [`Sell below about $${sell.toFixed(2)} (price ÷ 1.05)`, firstSell >= 0 ? `First at ${P0(g0.cols[firstSell])} growth` : 'Never a Sell in this row', 'Growth requires investment in NWC and fixed assets', ri <= 1 ? 'High margins: growth adds value' : 'Thin margins: growth destroys value']),
      txt('d', 'Using the last two columns of Table 1, explain why the terminal value\'s share of EV falls as WACC rises, and why WACC and g are still the two inputs that matter most. [1]', 1, 'tv', 'The PV of the TV falls much faster than the PV of the forecast FCFs as WACC rises, so its share of EV drops from 83.5% to 58.4% while value per share falls from $54.59 to $16.70. But the TV is still more than half of EV at every WACC, and the TV is set by WACC and g, so those two inputs move value per share far more than any change to the five forecast years.', ['TV falls faster than forecast FCFs, so its share drops (83.5% → 58.4%)', 'TV is still the larger part of EV at every WACC', 'TV depends on WACC and g, so they drive most of the value'])
    ];
    return { gen: 'sc-sens', title: 'Cooper Dental sensitivity', examRef: 'Section B style · 3 points', stem: `Both tables come from the Cooper Dental model (base case WACC 14%, g 6%, COGS 50%, growth 10%: $26.12). Assume a market price of $${price.toFixed(2)}.`, exhibits: [{ html: '<p class="exlbl">Table 1</p>' + C.wacc1way() }, { html: '<p class="exlbl">Table 2</p>' + C.grid(g0, 'COGS %', 'growth', [2, 3], null, { label: 'Table 2' }) }], parts };
  }
  function scCash(r) {
    const t = r.pick([0.21, 0.25, 0.3]), cost = r.step(100, 300, 20) * 1000, life = r.pick([4, 5]), dep = cost / life, rev = round(cost * r.range(0.6, 0.8), 10000), opex = round(rev * r.range(0.3, 0.45), 10000);
    const ebt = rev - opex - dep, ni = ebt * (1 - t), o = ni + dep, ebitda = rev - opex, mv = round(cost * r.range(0.1, 0.2), 5000), ats = mv * (1 - t);
    const parts = [
      txt('a', `A junior analyst used net income (${$(ni)}) as each year's cash flow; a second analyst used EBITDA (${$(ebitda)}). What is the correct annual cash flow, and in which direction does each mistake bias the NPV? [1.5]`, 1.5, 'ocf', `The correct cash flow is OCF = NI + depreciation = ${comma(ni)} + ${comma(dep)} = ${$(o)}. Net income subtracts ${$(dep)} of non-cash depreciation and never adds it back, so it understates cash flow and NPV. EBITDA ignores ${$(ebt * t)} of tax, which is real cash, so it overstates cash flow and NPV.`, [`OCF = NI + Dep = ${$(o)}`, 'Net income understates (non-cash depreciation subtracted)', 'EBITDA overstates (ignores taxes)']),
      txt('b', `The equipment is fully depreciated by Year ${life} and sells for ${$(mv)}. What is the after-tax salvage value, and what happens to NPV if the analyst forgets the tax? [1]`, 1, 'salvage', `Book value is $0, so the whole ${$(mv)} is a gain, taxed at ${P0(t)}: ${$(mv * t)}. After-tax salvage = ${$(ats)}. Forgetting the tax overstates the final-year cash flow by ${$(mv * t)} and overstates NPV by its present value.`, ['Book value $0, so the whole price is a gain', `Tax ${$(mv * t)}; after-tax salvage ${$(ats)}`, 'Forgetting it overstates NPV']),
      txt('c', `What is the depreciation tax shield each year, and why does depreciation raise OCF even though it lowers net income? [0.5]`, 0.5, 'ocf', `Shield = ${$(dep)} × ${P0(t)} = ${$(dep * t)}. Depreciation is a non-cash charge: it lowers taxable income and therefore the tax bill, but no cash leaves the firm.`, [`Shield = ${$(dep * t)}`, 'Non-cash charge that lowers taxes'])
    ];
    return { gen: 'sc-cash', title: 'Getting the cash flows right', examRef: 'Section B style · 3 points', stem: `Equipment costs ${$(cost)}, is depreciated straight-line to zero over ${life} years (${$(dep)} a year), and supports revenue of ${$(rev)} and operating expenses of ${$(opex)} each year. The tax rate is ${P0(t)}.`, exhibits: [{ html: table(['Each year', 'Amount ($)'], [['Revenue', comma(rev)], ['− Operating expenses', `(${comma(opex)})`], ['− Depreciation', `(${comma(dep)})`], ['= EBT', comma(ebt)], [`− Tax (${P0(t)})`, `(${comma(ebt * t)})`], ['= Net income', comma(ni)]], { label: 'Income statement' }) }], parts };
  }

  const DRILLS = [
    { id: 'npvchange', name: 'What changes NPV', sub: 'Decision rules', skills: ['npv'], fn: npvchange },
    { id: 'irrbasics', name: 'IRR vs. required return', sub: 'Decision rules', skills: ['irr'], fn: irrbasics },
    { id: 'mutex', name: 'Exclusive projects and crossover', sub: 'Decision rules', skills: ['mutex'], fn: mutex },
    { id: 'unconv', name: 'Multiple IRRs', sub: 'Decision rules', skills: ['unconv'], fn: unconv },
    { id: 'ocf', name: 'Operating cash flow', sub: 'Cash flows', skills: ['ocf'], fn: ocf },
    { id: 'salvage', name: 'After-tax salvage', sub: 'Cash flows', skills: ['salvage'], fn: salvage },
    { id: 'lives', name: 'Unequal lives and EAC', sub: 'Cash flows', skills: ['lives'], fn: lives },
    { id: 'midyear', name: 'Mid-year discounting', sub: 'Cash flows', skills: ['midyear'], fn: midyear },
    { id: 'fcf', name: 'Free cash flow', sub: 'DCF valuation', skills: ['fcf'], fn: fcf },
    { id: 'tv', name: 'WACC and terminal value', sub: 'DCF valuation', skills: ['tv'], fn: tv },
    { id: 'bridge', name: 'Equity bridge and the call', sub: 'Firm value to price', skills: ['bridge'], fn: bridge },
    { id: 'sens', name: 'Sensitivity tables', sub: 'Firm value to price', skills: ['sens'], fn: sens }
  ];
  const SCEN = [
    { id: 'sc-mutex', name: 'Two projects, one site', sub: 'Like B1', skills: ['mutex'], fn: scMutex },
    { id: 'sc-unconv', name: 'Cleanup-cost project', sub: 'Like B2', skills: ['unconv'], fn: scUnconv },
    { id: 'sc-dcf', name: 'DCF and the intern\'s shortcut', sub: 'Like B3', skills: ['fcf', 'bridge'], fn: scDcf },
    { id: 'sc-sens', name: 'Reading the sensitivity tables', sub: 'Like B4', skills: ['tv', 'sens'], fn: scSens },
    { id: 'sc-cash', name: 'OCF and salvage mistakes', sub: 'Cash-flow scenario', skills: ['ocf', 'salvage'], fn: scCash }
  ];
  const ALL = [...DRILLS, ...SCEN];
  const byId = id => ALL.find(d => d.id === id);

  // mock: five select-all questions and four scenarios, 25 points, mirroring the practice exam's layout
  function mock(seed) {
    const r = rng(seed), mk = (fn, s) => fn(rng(s));
    const A = [r.pick([npvchange, npvchange, irrbasics]), mutex, r.pick([ocf, salvage, midyear, lives]), unconv, r.pick([bridge, fcf, tv, sens])];
    const qs = A.map((fn, i) => { const q = mk(fn, seed + 101 * (i + 1)); q.parts = q.parts.filter(p => p.kind === 'sata'); q.num = 'A' + (i + 1); q.examRef = 'Section A · 2 points'; return q; });
    const B = [scMutex, r.pick([scUnconv, scUnconv, scCash]), scDcf, scSens];
    B.forEach((fn, i) => { const q = mk(fn, seed + 977 * (i + 1)); q.num = 'B' + (i + 1); const tot = q.parts.reduce((s, p) => s + p.pts, 0); q.examRef = `Section B · ${+tot.toFixed(1)} points`; qs.push(q); });
    return qs;
  }

  return { DRILLS, SCEN, ALL, byId, mock, sata };
})();
if (typeof module !== 'undefined') module.exports = G;
