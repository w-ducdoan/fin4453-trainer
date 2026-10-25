/* ===== CONTENT: skills, prep-note checklist, lessons, practice midterm with worked key, review sheet ===== */
const C = (() => {
  const { table, comma, acct } = E;
  const T = (h, rows, o) => table(h, rows, o);

  // weight w = how much of Midterm II the skill carries (from the prep note and the practice exam)
  const SKILLS = {
    npv: { name: 'NPV and what really changes it', w: 1.1, lesson: 'L1', drill: 'npvchange' },
    irr: { name: 'IRR vs. the discount rate', w: 0.8, lesson: 'L2', drill: 'irrbasics' },
    mutex: { name: 'NPV profiles and mutually exclusive projects', w: 1.4, lesson: 'L3', drill: 'mutex' },
    unconv: { name: 'Unconventional cash flows and multiple IRRs', w: 1.2, lesson: 'L4', drill: 'unconv' },
    ocf: { name: 'Operating cash flow (four-step recipe)', w: 1.2, lesson: 'L5', drill: 'ocf' },
    salvage: { name: 'After-tax salvage (terminal cash flow)', w: 0.8, lesson: 'L6', drill: 'salvage' },
    lives: { name: 'Unequal lives: replacement chain and EAC', w: 0.7, lesson: 'L7', drill: 'lives' },
    midyear: { name: 'Mid-year discounting', w: 0.7, lesson: 'L8', drill: 'midyear' },
    fcf: { name: 'Free cash flow from EBIT', w: 1.2, lesson: 'L9', drill: 'fcf' },
    tv: { name: 'WACC, g and the terminal value', w: 0.9, lesson: 'L10', drill: 'tv' },
    bridge: { name: 'Equity bridge and Buy / Hold / Sell', w: 1.2, lesson: 'L11', drill: 'bridge' },
    sens: { name: 'Reading sensitivity tables', w: 1.2, lesson: 'L12', drill: 'sens' }
  };

  // the professor's "Concepts you are expected to know", word for word in substance, each tied to a skill
  const CHECKLIST = [
    ['1. The decision rules', [
      ['NPV: what it measures, the accept/reject rule, and why it is the decision rule', 'npv'],
      ['What genuinely changes a project\'s NPV and what does not', 'npv'],
      ['IRR: definition, accept/reject rule, IRR vs. the discount rate', 'irr'],
      ['The NPV profile: what it is and how to read it', 'mutex'],
      ['Why NPV and IRR disagree on mutually exclusive projects: scale, timing, crossover rate', 'mutex'],
      ['Unconventional cash flows: what they do to the IRR rule, and why NPV still works', 'unconv']]],
    ['2. Getting the cash flows right', [
      ['The four-step recipe for operating cash flow', 'ocf'],
      ['Why net income understates and EBITDA overstates cash flow', 'ocf'],
      ['Depreciation as a non-cash charge, and the depreciation tax shield', 'ocf'],
      ['Terminal cash flow: book value, gain or loss, after-tax salvage (including below book)', 'salvage'],
      ['Mid-year discounting: what it assumes, why NPV rises, why not r ÷ 2, why Year 0 stays at t = 0', 'midyear'],
      ['Unequal lives: replacement chain and EAC, their shared assumption, when neither is needed', 'lives']]],
    ['3. From projects to firms: DCF valuation', [
      ['Free cash flow: EBIT → taxes on EBIT → NOPAT, + depreciation − CapEx − ΔNWC, and why', 'fcf'],
      ['Why FCF starts from EBIT, before interest', 'fcf'],
      ['Why CapEx = ΔNFA + depreciation', 'fcf'],
      ['WACC as the discount rate for free cash flows', 'tv'],
      ['Terminal value: Gordon Growth, why WACC must exceed g, why TV dominates EV', 'tv']]],
    ['4. From firm value to stock price', [
      ['The equity bridge: EV → equity value → value per share', 'bridge'],
      ['Buy / Hold / Sell with a Hold band, and the four common mistakes', 'bridge'],
      ['Reading one-way and two-way sensitivity tables', 'sens']]]
  ];

  // ---------- shared exhibits ----------
  const WACC_G = { rows: [0.10, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18], cols: [0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10], v: [
    [29.91, 33.43, 38.13, 44.72, 54.59, 71.05, 103.96, 202.71, null], [26.25, 28.90, 32.30, 36.83, 43.18, 52.71, 68.58, 100.32, 195.56], [23.34, 25.38, 27.93, 31.21, 35.59, 41.71, 50.90, 66.21, 96.84],
    [20.96, 22.57, 24.54, 27.01, 30.17, 34.40, 40.31, 49.17, 63.95], [18.99, 20.28, 21.84, 23.74, 26.12, 29.18, 33.25, 38.96, 47.52], [17.32, 18.38, 19.63, 21.14, 22.97, 25.27, 28.22, 32.16, 37.67],
    [15.90, 16.77, 17.80, 19.01, 20.46, 22.23, 24.45, 27.30, 31.11], [14.67, 15.40, 16.25, 17.24, 18.41, 19.81, 21.53, 23.67, 26.42], [13.60, 14.22, 14.93, 15.75, 16.70, 17.83, 19.19, 20.85, 22.92]] };
  const COGS_G = { rows: [0.40, 0.45, 0.50, 0.55, 0.60, 0.65], cols: [0.04, 0.06, 0.08, 0.10, 0.12, 0.14, 0.16, 0.18], v: [
    [32.78, 33.78, 34.74, 35.65, 36.50, 37.28, 37.99, 38.60], [29.05, 29.73, 30.34, 30.89, 31.34, 31.71, 31.96, 32.10], [25.31, 25.67, 25.94, 26.12, 26.19, 26.13, 25.94, 25.60],
    [21.57, 21.61, 21.54, 21.35, 21.03, 20.55, 19.91, 19.10], [17.83, 17.56, 17.15, 16.59, 15.87, 14.98, 13.89, 12.59], [14.09, 13.50, 12.75, 11.82, 10.71, 9.40, 7.87, 6.09]] };
  const WACC_1WAY = [[0.10, 9414966, 47577136, 0.835, 54.59], [0.12, 9003190, 28985470, 0.763, 35.59], [0.14, 8621687, 19897910, 0.698, 26.12], [0.16, 8267606, 14592569, 0.638, 20.46], [0.18, 7938413, 11164273, 0.584, 16.70]];
  const callOf = (v, p, band = 0.05) => v == null ? 'n/a' : p < v * (1 - band) ? 'Buy' : p > v * (1 + band) ? 'Sell' : 'Hold';
  // grid: {rows, cols, v}; base: [ri, ci]; price colors the cells by recommendation
  function grid(g, rowName, colName, base, price, opts = {}) {
    const head = [`${rowName} ↓ \\ ${colName} →`, ...g.cols.map(c => E.pc(c, 0))];
    const rows = g.rows.map((r, i) => [E.pc(r, 0), ...g.cols.map((c, j) => { const v = g.v[i][j]; const call = price != null ? callOf(v, price) : ''; return { v: v == null ? 'N/A' : '$' + v.toFixed(2), cls: [price != null ? 'c-' + call.toLowerCase() : '', base && base[0] === i && base[1] === j ? 'base' : '', opts.hi && opts.hi.some(h => h[0] === i && h[1] === j) ? 'hl' : ''].join(' ') }; })]);
    return table(head, rows, { cls: 'grid', label: opts.label || 'Sensitivity table' });
  }
  const wacc1way = () => table(['WACC', 'Sum of PV of FCFs, 2021–2025', 'PV of terminal value', 'Terminal value as % of EV', 'Value per share'], WACC_1WAY.map(r => [{ v: E.pc(r[0], 0), cls: r[0] === 0.14 ? 'base' : '' }, '$' + comma(r[1]), '$' + comma(r[2]), E.pc(r[3]), '$' + r[4].toFixed(2)]), { label: 'One-way WACC table' });

  // ---------- lessons ----------
  const mc = (q, options, answer, explain) => ({ q, options, answer, explain });
  const LESSONS = [
    { id: 'L1', part: 'Part 1 · Decision rules', slides: 'Slides 4–6, 9', title: 'NPV: the dollar answer', skills: ['npv'],
      take: 'NPV is the dollars of value a project adds today after it has paid back its cost and the return investors require. NPV > 0 means accept.',
      body: `<h3>Plain English</h3>
<p>Amazon wants to spend $50 million on a fulfillment center and Pfizer wants to spend $50 million on a drug program. Both expect to get back more than they spend. Should both invest? Capital budgeting answers that with three ingredients:</p>
<ol><li><b>The right cash flows.</b> After-tax, incremental cash: only what changes because of this project.</li><li><b>A discount rate.</b> The <dfn>required return</dfn>, also called the opportunity cost of capital: what investors could earn elsewhere at similar risk.</li><li><b>A decision rule.</b> Time value of money gives you a number. The rule tells you what to do with it. The two rules in this module are NPV and IRR.</li></ol>
<h3>The formula</h3>
<p class="formula">NPV = CF<sub>0</sub> + CF<sub>1</sub>/(1+r)<sup>1</sup> + CF<sub>2</sub>/(1+r)<sup>2</sup> + … + CF<sub>n</sub>/(1+r)<sup>n</sup></p>
<p>CF<sub>0</sub> is usually negative (the upfront cost) and r is the required return. Each term is the <dfn>present value</dfn> of one year's cash: what that future dollar is worth today.</p>
<div class="rules3"><div class="ok"><b>NPV &gt; 0</b><span>Accept. The project creates value.</span></div><div class="no"><b>NPV &lt; 0</b><span>Reject. The project destroys value.</span></div><div><b>NPV = 0</b><span>Indifferent. It earns exactly the required return.</span></div></div>
<h3>Class example: Amazon and Pfizer</h3>
<p>Amazon: −$50M today, then $12M, $14M, $16M, $15M and $18M (Year 5 includes $5M of after-tax equipment sale proceeds). Required return 10%.</p>
${T(['Year', '0', '1', '2', '3', '4', '5', 'NPV'], [['Cash flow ($M)', '(50.0)', '12.0', '14.0', '16.0', '15.0', '18.0', ''], ['Present value at 10%', '(50.0)', '10.91', '11.57', '12.02', '10.25', '11.18', { v: '+5.92', cls: 'pos' }]], { label: 'Amazon NPV' })}
<p>NPV = +$5.92M, so Amazon builds it. That $5.92M is surplus wealth on top of the 10% investors demanded.</p>
<p>Pfizer: −$10M, −$15M, −$25M (three trial phases), $0 in Year 3 (waiting on the FDA), then $12M, $18M, $22M, $20M, $15M. Undiscounted, inflows beat outflows by $37M. Discounted at 13% (higher because a trial can fail), the NPV is <b>−$1.01M</b>. Reject. Big total cash does not guarantee value when the cost comes first, the revenue comes late, and the risk is high.</p>
<h3>What genuinely changes NPV</h3>
<p>This is Question A1 on the practice exam. NPV depends on three things only: how much cash, when it arrives, and how risky it is. Anything that changes the <i>project</i> along those lines changes NPV. Anything that only changes the <i>arithmetic</i> or the <i>label</i> does not create value.</p>
${T(['Raises NPV (real)', 'Does not create value'], [['More cash each year (higher revenue, lower operating costs)', 'Typing a lower discount rate when the risk has not changed'], ['The same total cash, but earlier (front-loaded)', 'Changing the guess in Excel\'s IRR function'], ['Paying the cost later (installments instead of all today)', 'Reporting the result in different units or format'], ['Making the project safer, so investors require less', 'Making it riskier: the required return rises, so NPV falls']], { leftAll: true, plainFirst: true, label: 'What changes NPV' })}
<p class="warn"><b>Trap:</b> "Use 9% instead of 12%" sounds like it raises NPV, and the number does go up. But the required return is set by the project's risk and the market, not by the analyst. Picking a lower rate just mismeasures the same project.</p>
<h3>Excel note</h3>
<p><code>=NPV(rate, CF1:CFn) + CF0</code>. Excel's NPV starts discounting at Period 1, so the Year-0 cost is added outside the function.</p>
<h3>On the exam</h3>
<p>You will not compute NPVs by hand. You will be told the NPV and asked what it means, what decision follows, and which changes would move it. Always tie your answer to cash amount, cash timing or risk.</p>`,
      check: [
        mc('A project has NPV = +$3,000 at its 10% required return. What does the $3,000 mean?', ['The project returns 3% more than required', 'After earning the 10% investors require, the project adds $3,000 of value today', 'The project\'s total cash inflows exceed its cost by $3,000', 'The project will earn $3,000 in Year 1'], 1, 'NPV is measured in today\'s dollars, after the required return is already paid. It is not a percentage and not an undiscounted total.'),
        mc('Which change genuinely raises a project\'s NPV?', ['Re-running Excel\'s IRR with a different guess', 'Switching to a lower discount rate with the same risk', 'Receiving the same total cash, but more of it in the early years', 'Raising the required return to be conservative'], 2, 'Earlier cash is discounted less, so the same total is worth more today. The other choices change only the calculation (or lower NPV).'),
        mc('Pfizer\'s undiscounted cash flows sum to +$37M, yet its NPV at 13% is −$1.01M. Why?', ['The cash flows were added wrong', 'Large costs come first while revenue arrives in Years 4–8, so discounting shrinks the inflows much more than the outflows', 'NPV ignores the Year-3 zero', 'A 13% rate is too low for drugs'], 1, 'Timing and risk. Late inflows discounted at a high rate lose much of their value; early outflows barely shrink.'),
        mc('A project\'s redesign makes it riskier, raising its required return from 12% to 15%, with the same cash flows. NPV will:', ['Rise, because the project now earns more', 'Fall, because the same cash flows are discounted at a higher rate', 'Stay the same, because cash flows did not change', 'Depend on the IRR guess'], 1, 'Higher required return means each future dollar is worth less today. Same cash, more risk, less value.')
      ] },
    { id: 'L2', part: 'Part 1 · Decision rules', slides: 'Slides 7–9, 17–18', title: 'IRR: the percentage answer', skills: ['irr'],
      take: 'IRR is the project\'s own rate of return: the discount rate that makes NPV = 0. The required return comes from the market. Accept when IRR > r.',
      body: `<h3>Plain English</h3>
<p>NPV answers "how many dollars of value?" The <dfn>internal rate of return (IRR)</dfn> answers "what rate of return is baked into these cash flows?" It is found by asking which discount rate would make the NPV exactly zero.</p>
<p class="formula">0 = CF<sub>0</sub> + CF<sub>1</sub>/(1+IRR)<sup>1</sup> + … + CF<sub>n</sub>/(1+IRR)<sup>n</sup></p>
<div class="rules3 two"><div class="ok"><b>IRR &gt; r</b><span>Accept. The project earns more than required.</span></div><div class="no"><b>IRR &lt; r</b><span>Reject. The project falls short.</span></div></div>
<h3>The critical distinction</h3>
${T(['', 'IRR', 'Discount rate (r)'], [['Where it comes from', 'Inside the project: its own cash flows', 'Outside the project: the market'], ['What it says', '"What the project earns"', '"What the market requires"'], ['Changes when…', 'The project\'s cash flows change', 'The risk or market conditions change']], { leftAll: true, label: 'IRR vs discount rate' })}
<p><b>NPV is the dollar value of the gap between IRR and r.</b> To compute NPV you discount at r, never at the IRR (discounting at the IRR gives NPV = 0 by definition).</p>
<h3>Simple math</h3>
<p>Invest $100 today, receive $115 in one year. IRR: 0 = −100 + 115/(1 + IRR), so IRR = 15%. NPV at r = 10%: −100 + 115/1.10 = <b>+$4.55</b>. The project earns 15% while the market requires 10%; the $4.55 is the surplus.</p>
<h3>Class example</h3>
<p>Amazon's IRR is 14.26% against a 10% hurdle: accept (NPV +$5.92M). Pfizer's IRR is 12.42% against 13%: reject (NPV −$1.01M). For a <dfn>standalone</dfn> project (you can take it or not, nothing else depends on it) with <dfn>conventional cash flows</dfn> (one sign change: outflow, then inflows), NPV and IRR <b>always agree</b>.</p>
<h3>If NPV always wins, why does IRR exist?</h3>
<ul><li><b>Easy to communicate.</b> "15.1% against a 10% hurdle" shows the margin of safety instantly.</li><li><b>A fast screen.</b> For standalone, conventional projects it gives the same accept/reject call as NPV.</li><li><b>No rate needed up front.</b> The decision-maker can apply whatever hurdle they believe in.</li></ul>
<p>The professor's analogy: NPV is the final exam score, the definitive measure. IRR is the GPA, a quick summary. When they disagree, trust the exam score. <b>NPV is the decision rule; IRR is the communication tool.</b></p>
<h3>Master decision table (slide 18)</h3>
${T(['Situation', 'NPV', 'IRR'], [['Standalone, conventional cash flows', { v: '✓ Works', cls: 'pos' }, { v: '✓ Works', cls: 'pos' }], ['Standalone, unconventional cash flows', { v: '✓ Works', cls: 'pos' }, { v: '✗ May give multiple answers', cls: 'neg' }], ['Mutually exclusive, conventional', { v: '✓ Works', cls: 'pos' }, { v: '✗ May rank incorrectly', cls: 'neg' }], ['Mutually exclusive, unconventional', { v: '✓ Works', cls: 'pos' }, { v: '✗ Breaks down completely', cls: 'neg' }]], { leftAll: true, label: 'Master decision table' })}`,
      check: [
        mc('Which statement about IRR is correct?', ['IRR is the rate you should use to compute NPV', 'IRR is determined entirely by the project\'s own cash flows', 'IRR rises when the market\'s required return rises', 'IRR and r mean the same thing'], 1, 'IRR is internal: it comes only from the cash flows. The required return r comes from outside.'),
        mc('A standalone project with conventional cash flows has IRR = 18% and r = 12%. Its NPV is:', ['Negative', 'Zero', 'Positive', 'Cannot tell without the cash flows'], 2, 'For standalone, conventional projects the rules always agree: IRR above r means NPV above zero. You can tell the sign without the cash flows.'),
        mc('If you discount a project\'s cash flows at its own IRR, the NPV equals:', ['The project\'s value', 'Zero', 'The IRR minus r', 'The cost of the project'], 1, 'IRR is defined as the rate that sets NPV to zero.'),
        mc('Why does the professor call NPV the decision rule and IRR the communication tool?', ['IRR is harder to compute', 'NPV works in every situation, while IRR can misrank exclusive projects or give several answers', 'IRR ignores cash flows', 'NPV is a percentage'], 1, 'See the master table: NPV works in all four cases, IRR only in the first.')
      ] },
    { id: 'L3', part: 'Part 1 · Decision rules', slides: 'Slides 10–11, 15–16', title: 'NPV profiles and mutually exclusive projects', skills: ['mutex'],
      take: 'When you can pick only one project, pick the one with the higher NPV at your required return. The higher IRR can be the wrong choice because IRR ignores scale and favors early cash.',
      body: `<h3>The NPV profile</h3>
<p>An <dfn>NPV profile</dfn> plots NPV (y-axis) against the discount rate (x-axis). It is a sensitivity analysis: change one input (the rate), report the output (NPV). In Excel you build it with a data table and a scatter chart. For a conventional project the line slopes down, and <b>where it crosses zero is the IRR</b>.</p>
{{fig:timing}}
<h3>Mutually exclusive projects</h3>
<p><dfn>Mutually exclusive</dfn> means taking one rules out the other (one lot, one machine). Here NPV and IRR can rank the projects differently, for two reasons.</p>
<p><b>1. The scale problem.</b> You own one corner lot. A coffee kiosk costs $10,000 and returns $8,000 and $7,000. A restaurant costs $100,000 and returns $60,000 and $70,000. At 10%:</p>
${T(['Proposal', 'Cost', 'IRR', 'NPV at 10%'], [['A · Kiosk', '$10,000', { v: '32.7%', cls: 'hl' }, '$3,058'], ['B · Restaurant', '$100,000', '18.9%', { v: '$12,397', cls: 'hl' }]], { label: 'Scale problem' })}
<p>IRR picks the kiosk; NPV picks the restaurant. Choosing the kiosk costs you $9,339 of value. A 33% return on $10,000 creates less wealth than a 19% return on $100,000. <b>Shareholders deposit dollars, not percentages.</b></p>
<p><b>2. The timing problem.</b> Two ventures each cost $50,000. The pop-up shop front-loads cash ($35k, $25k, $15k); the tech product back-loads it ($10k, $25k, $50k). IRRs: 27.6% vs. 24.6%. NPVs at 10%: $13,749 vs. <b>$17,318</b>. NPV picks Tech. At 20%, the pop-up wins on both rules. The chart above shows why: the lines cross.</p>
<h3>The crossover rate</h3>
<p>The <dfn>crossover rate</dfn> is the discount rate where the two NPV profiles intersect, so both projects have the same NPV. Find it as the IRR of the year-by-year difference in cash flows (C − D = 0, +25,000, 0, −35,000 → 18.3%).</p>
<ul><li><b>Below the crossover</b>, the steeper project wins (Tech: later and larger total cash).</li><li><b>Above the crossover</b>, the flatter project wins (Pop-up: earlier cash).</li><li><b>Above both IRRs</b>, both NPVs are negative: reject both, and the ranking no longer matters.</li></ul>
<p class="tip"><b>Reading slope:</b> the project whose NPV falls faster as r rises is the one whose cash arrives later or that is larger. Later and bigger cash is hit harder by discounting.</p>
<h3>Why IRR misranks: the reinvestment assumption</h3>
<p>Take −$1,000, +$600, +$600: IRR ≈ 13.1% with a 10% market rate. Where does the Year-1 $600 go? IRR implicitly assumes you reinvest it at 13.1%, the project's own rate, as if another equally good deal appears the moment cash arrives. NPV assumes you reinvest at 10%, what comparable deals actually earn. Projects are not piggy banks: Amazon cannot pour Year-1 cash back into the same warehouse to make it earn more. So IRR flatters front-loaded projects, and NPV values every project's early cash at the same market rate, an apples-to-apples comparison.</p>
<h3>Independent projects</h3>
<p>If the projects are <dfn>independent</dfn> (you can do both and have the funds), there is no ranking problem: accept every project with NPV &gt; 0.</p>
<h3>On the exam (B1 pattern)</h3>
<ol><li>Say which project each rule favors at the required return, then choose the higher NPV and say why (dollars of value; exclusive choice).</li><li>Explain with the cash flows: the bigger or later-paying project has the lower IRR but the higher NPV at low rates.</li><li>At a required return above both IRRs, reject both; ranking is irrelevant.</li><li>If they become independent, build every positive-NPV project.</li></ol>`,
      check: [
        mc('Two exclusive projects: X has IRR 18%, Y has IRR 15%, and their profiles cross at 11% (Y higher below 11%). At an 8% required return you should choose:', ['X, because it has the higher IRR', 'Y, because it has the higher NPV at 8%', 'Neither', 'Either; they are equal'], 1, 'Below the crossover, Y has the higher NPV, and with IRR 15% > 8% that NPV is positive.'),
        mc('Same projects, required return 20%:', ['Choose X', 'Choose Y', 'Reject both, because 20% is above both IRRs', 'Choose the one with the larger investment'], 2, 'Above both IRRs, both NPVs are negative.'),
        mc('The crossover rate is:', ['The average of the two IRRs', 'The discount rate at which the two projects\' NPVs are equal', 'The rate at which both NPVs equal zero', 'Always the required return'], 1, 'It is where the two profiles intersect; compute it as the IRR of the difference in cash flows.'),
        mc('Why does IRR tend to favor projects that front-load cash?', ['It assumes interim cash is reinvested at the project\'s own (high) IRR', 'It ignores Year 0', 'It discounts early cash more heavily', 'It uses the market rate for reinvestment'], 0, 'IRR\'s implied reinvestment at its own rate inflates the value of early cash; NPV reinvests at the market rate for every project.'),
        mc('A small project has the higher IRR; a big project has the higher NPV at r. They are mutually exclusive. The right choice is:', ['The small project: percentages measure efficiency', 'The big project: it adds more dollars of value', 'Whichever pays back sooner', 'Split the capital'], 1, 'The scale problem. Value is measured in dollars.')
      ] },
    { id: 'L4', part: 'Part 1 · Decision rules', slides: 'Slides 11–14, 18', title: 'Unconventional cash flows and multiple IRRs', skills: ['unconv'],
      take: 'When the cash flows change sign more than once, the IRR can have two answers or none. The NPV at the required return still gives one clear answer, so use NPV.',
      body: `<h3>Plain English</h3>
<p>Conventional cash flows change sign once: −, +, +, +. <dfn>Unconventional cash flows</dfn> change sign more than once, usually because of a big cost at the end (cleanup, restoration, asbestos removal): −, +, −.</p>
<h3>Descartes' rule gives a ceiling, not a count</h3>
<ul><li>The number of IRRs is <b>at most</b> the number of sign changes.</li><li>The actual count can fall short of that maximum. With two sign changes you can get <b>two IRRs</b> (the profile crosses zero twice), <b>one</b> (it just touches zero) or <b>none</b> (it never reaches zero).</li><li>Some possible IRRs are not real numbers or are meaningless (below −100%). So unconventional cash flows can leave no usable IRR at all.</li><li>Shortcut: <b>one sign change means exactly one IRR</b>, guaranteed.</li></ul>
<h3>Class example: the strip mine</h3>
<p>−$100,000 today, +$320,000 in Year 1 from ore, −$250,000 in Year 2 to restore the land. The three flows sum to −$30,000 before any discounting.</p>
{{fig:mine}}
<p>The profile is a hill (a parabola). NPV is negative at 0% (−$30,000, the plain sum), rises, crosses zero at <b>35.5%</b>, peaks, and crosses back down at <b>84.5%</b>. NPV is positive only <b>between</b> the two IRRs. At a 50% rate, NPV is +$2,222, yet one IRR (35.5%) is below 50% and says reject while the other (84.5%) says accept. The IRR rule gives contradictory advice; NPV gives one answer.</p>
<p class="tip"><b>Why discounting can help:</b> the big outflow comes last, so discounting shrinks it more than the earlier inflow. That is why NPV rises at first as r rises. Past the peak, the shrinking Year-1 inflow dominates and NPV falls again.</p>
<h3>Three profiles for the same pattern</h3>
<p>As the final outflow grows, the hill sinks: two crossings, then one (touching), then none. Practice question B2 (Gulf Breeze Festival: −100k, +230k, −140k) is the "none" case: NPV is negative at every rate, peaking around −$5,556 near 20%, so there is no IRR and no rate at which to accept.</p>
{{fig:three}}
<h3>Excel's IRR traps</h3>
<ul><li><code>=IRR()</code> returns only one rate. It walks from its guess to the nearest root and stops, and stays silent about any other IRR.</li><li>Change the guess to surface a hidden root: <code>=IRR(range, 0.4)</code>.</li><li><b>#NUM! does not mean you did it wrong.</b> The solver could not converge, often because no real IRR exists.</li><li>The NPV profile is the source of truth: count the zero crossings. Each crossing is one real IRR; no crossing means no real IRR.</li></ul>
<h3>Second class example: the concert venue</h3>
<p>−$200,000, +$500,000, +$100,000, −$400,000 (asbestos removal). The undiscounted sum is exactly $0, so NPV at 0% is $0: <b>0% is one of the IRRs</b>. The other is about 135%. At 10%, NPV = +$36,664: the $500k arrives early (discounted little) and the $400k leaves late (discounted heavily). Accept on NPV. Note the board's 40% rate gives an even higher NPV ($62,391), because a higher rate shrinks the Year-3 cost most.</p>
<h3>On the exam</h3>
<p>Count sign changes for the maximum, read the profile (or the NPV table) for the actual count, and make the decision with the NPV at the required return. If NPV is negative everywhere, say so: reject at every rate.</p>`,
      check: [
        mc('Cash flows −200, +520, −330 have IRRs of 10% and 50%. At a 12% required return the NPV is +$1,212. The right call:', ['Reject: 12% is above the 10% IRR', 'Accept: NPV at the required return is positive', 'No decision is possible with two IRRs', 'Accept only if the 50% IRR is the "true" one'], 1, 'With unconventional flows, decide on NPV at r. The IRR rule gives conflicting signals here.'),
        mc('A −, +, − project has two sign changes. Its number of real IRRs could be:', ['Exactly 2', 'At most 2: it could be 2, 1 or 0', 'At least 2', 'Exactly 1'], 1, 'Descartes gives a ceiling. The profile can cross twice, touch once, or never reach zero.'),
        mc('Excel returns #NUM! for a −, +, − project, and the NPV table is negative at every rate. This means:', ['The analyst made a typing error', 'The project has no real IRR; NPV is negative everywhere, so reject', 'The IRR is 0%', 'Try more guesses until one works'], 1, 'No zero crossing means no real IRR. Not an error.'),
        mc('For −100k, +320k, −250k, why is NPV higher at 20% than at 0%?', ['Higher rates always raise NPV', 'The large outflow comes last, so discounting shrinks it more than the earlier inflow', 'The project is conventional', 'Because the IRR is 20%'], 1, 'Late costs lose the most present value as r rises.')
      ] },
    { id: 'L5', part: 'Part 2 · Cash flows', slides: 'Slides 20–23', title: 'Operating cash flow: the four-step recipe', skills: ['ocf'],
      take: 'OCF = net income + depreciation. Taxes are real cash; depreciation is not. Net income understates cash flow and EBITDA overstates it.',
      body: `<h3>Which number goes into NPV?</h3>
${T(['Candidate', 'Verdict'], [['Revenue', 'Not a cash flow measure: ignores costs and taxes'], ['EBITDA', 'Ignores taxes entirely: overstates cash flow'], ['Net income', 'Subtracts depreciation and never adds it back: understates cash flow'], [{ v: 'After-tax operating cash flow (OCF)', cls: 'pos' }, 'Correct: taxes paid, non-cash charge restored']], { leftAll: true, label: 'Which cash flow' })}
<p>Every cash flow in an NPV must be an <b>after-tax cash flow</b>.</p>
<h3>The four-step recipe</h3>
<ol class="steps"><li><b>Project the income statement:</b> Revenue − Operating expenses − Depreciation = EBT</li><li><b>Compute taxes:</b> EBT × tax rate = Tax</li><li><b>Net income:</b> EBT − Tax = Net income</li><li><b>Add back depreciation:</b> Net income + Depreciation = OCF</li></ol>
<h3>Class example: Tesla Gigafactory, Year 1</h3>
<p>$200M of equipment, 5-year life, straight-line to zero, so depreciation is $40M a year. Year-1 revenue $80M, operating expenses $30M, tax rate 25%.</p>
${T(['Year 1', '$M'], [['Revenue', '80.0'], ['− Operating expenses', '(30.0)'], ['− Depreciation', '(40.0)'], ['= EBT', '10.0'], ['− Tax (25%)', '(2.5)'], ['= Net income', '7.5'], ['+ Depreciation', '40.0'], [{ v: '= Operating cash flow', cls: 'b' }, { v: '47.5', cls: 'b' }]], { label: 'Tesla OCF' })}
<p>Compare: revenue $80M (not a cash measure), EBITDA $50M (too high: pretends taxes do not exist), net income $7.5M (far too low: a $40M non-cash charge was subtracted), OCF <b>$47.5M</b> (correct). On a $200M investment, NI = $7.5M looks terrible; OCF tells the true story.</p>
<h3>Why add back depreciation?</h3>
<p>Depreciation is an accounting allocation of a past purchase. No cash leaves the building when it is recorded. It did one real job: it lowered taxable income. Once taxes are computed, we restore it.</p>
<p class="formula">Depreciation tax shield = Depreciation × Tax rate</p>
<p>Tesla: $40M × 25% = <b>$10M</b> of real cash saved in tax. Without depreciation, OCF would be $37.5M instead of $47.5M. The slide's example: $40M depreciation at 25% saves $10M.</p>
<h3>A shortcut that answers most select-all statements</h3>
<p class="formula">OCF = (Revenue − Operating expenses) × (1 − t) + Depreciation × t</p>
<ul><li>More depreciation (faster depreciation) lowers net income but <b>raises OCF</b>, by ΔDepreciation × t.</li><li>If t = 0, depreciation has no effect on OCF: OCF = Revenue − Operating expenses.</li><li>If depreciation rises by $10,000 at a 30% tax rate, net income falls by $7,000 and OCF rises by $3,000.</li></ul>
<h3>Two common mistakes</h3>
<p><b>Using net income</b> double-counts a non-cash expense and systematically <b>undervalues</b> projects. <b>Using EBITDA</b> ignores taxes and systematically <b>overstates</b> cash flow.</p>
<h3>On the exam (A3 pattern)</h3>
<p>You get a short income statement. OCF = NI + depreciation. Then reason through what-ifs with the shortcut: faster depreciation, a 0% tax rate, selling at book value (next lesson), using EBITDA or NI by mistake.</p>`,
      check: [
        mc('Revenue 90,000, operating expenses 50,000, depreciation 20,000, tax 30%. Net income is 14,000. OCF is:', ['14,000', '34,000', '40,000', '28,000'], 1, 'OCF = NI + depreciation = 14,000 + 20,000 = 34,000.'),
        mc('Same project, but depreciation rises to 30,000. What happens?', ['NI falls and OCF falls', 'NI falls and OCF rises (by 10,000 × 30% = 3,000)', 'NI and OCF both rise', 'Nothing changes'], 1, 'EBT 10,000, tax 3,000, NI 7,000, OCF 37,000. The extra depreciation saves 3,000 of tax.'),
        mc('Using net income as the project\'s cash flow would:', ['Overstate the project\'s value', 'Understate the project\'s value', 'Give the right value', 'Overstate taxes'], 1, 'NI subtracts a non-cash charge and never adds it back, so cash flow and NPV come out too low.'),
        mc('The depreciation tax shield on $40M of depreciation at a 25% tax rate is:', ['$40M', '$30M', '$10M', '$2.5M'], 2, 'Shield = Depreciation × t = 40 × 0.25 = 10.')
      ] },
    { id: 'L6', part: 'Part 2 · Cash flows', slides: 'Slide 24', title: 'Terminal cash flow: after-tax salvage', skills: ['salvage'],
      take: 'When you sell the asset at the end, tax depends on the gap between sale price and book value. A gain is taxed; a loss gives a tax benefit.',
      body: `<h3>The four steps</h3>
<ol class="steps"><li><b>Book value</b> = Initial cost − Accumulated depreciation</li><li><b>Gain (or loss)</b> = Market value − Book value</li><li><b>Tax on the gain (or loss)</b> = Gain × marginal tax rate</li><li><b>Tax treatment:</b> pay tax on a gain; receive a tax benefit on a loss</li></ol>
<p class="formula">After-tax salvage = Market value − Tax paid (gain) &nbsp;or&nbsp; Market value + Tax benefit (loss)</p>
<p>Straight-line depreciation each year = (Cost − Ending book value) ÷ Life.</p>
<h3>Three cases you must handle</h3>
${T(['Case', 'Example', 'Tax effect', 'After-tax salvage'], [['Sold above book (gain)', 'Tesla: fully depreciated (book $0), sold for $30M, t = 25%', 'Gain $30M × 25% = $7.5M tax paid', { v: '$22.5M', cls: 'b' }], ['Sold below book (loss)', 'Bay Breeze canning line: book $18,000, sold for $10,000, t = 21%', 'Loss $8,000 × 21% = $1,680 tax benefit', { v: '$11,680', cls: 'b' }], ['Sold at book', 'Book = market', 'No gain, no loss: no tax', 'Market value']], { leftAll: true, label: 'Salvage cases' })}
<p class="tip">Below-book is the case students get wrong. The after-tax salvage is <b>higher</b> than the sale price, because the loss is deductible and saves tax.</p>
<h3>Putting it into the cash flows</h3>
<p>Final-year cash flow = that year's OCF + after-tax salvage. The Year-0 flow is the initial investment. Tesla: Year-5 cash flow = 52 + 22.5 = $74.5M, and the project NPV at 12% is +$11.31M (IRR 14.1%).</p>
<h3>Why the tax matters</h3>
<p>If Tesla's analyst used the full $30M sale price, Year 5 would be overstated by $7.5M. Discounted at 12% for 5 years, that is a $4.26M NPV error on a project worth $11.31M, enough to flip a marginal decision. Bay Breeze shows the other side: its NPV flips from reject to accept once the salvage value passes about $14,454.</p>`,
      check: [
        mc('An asset with book value $0 sells for $30M at a 25% tax rate. After-tax salvage is:', ['$30M', '$22.5M', '$37.5M', '$7.5M'], 1, 'The whole $30M is a gain. Tax = 7.5. After-tax = 30 − 7.5.'),
        mc('An asset with book value $18,000 sells for $10,000 at 21%. After-tax salvage is:', ['$10,000', '$8,320', '$11,680', '$18,000'], 2, 'Loss of 8,000 × 21% = 1,680 tax benefit, added to the 10,000 sale price.'),
        mc('If equipment sells for exactly its book value:', ['Tax is paid on the full sale price', 'There is no tax effect', 'There is a tax benefit', 'Depreciation must be recomputed'], 1, 'Gain = market − book = 0, so tax = 0.'),
        mc('Forgetting the tax on a salvage gain will:', ['Understate NPV', 'Overstate NPV', 'Not affect NPV', 'Only affect IRR'], 1, 'You count cash the firm never keeps, so the final cash flow and the NPV are too high.')
      ] },
    { id: 'L7', part: 'Part 2 · Cash flows', slides: 'Slides 25–26', title: 'Unequal lives: replacement chain and EAC', skills: ['lives'],
      take: 'If the chosen asset will be replaced again and again, compare value per year (EAC = NPV ÷ PVIFA), not total NPV. If it is a one-time project, just compare NPVs.',
      body: `<h3>Why total NPV is unfair here</h3>
<p>Comparing a 4-year project with a 6-year project by NPV alone is like comparing a 4-year lease and a 6-year lease by total rent. The longer one has extra years to pile up value. When the need is ongoing (a delivery route served forever, a laundry that always needs a washer), you must make the lives comparable.</p>
<h3>Method 1: replacement chain</h3>
<ol><li>Find the least common multiple (LCM) of the lives.</li><li>Repeat each project until it fills the LCM (at each replacement date, that year's inflow and the new purchase net out).</li><li>Compute each chain's NPV; choose the higher.</li></ol>
<h3>Method 2: equivalent annual cash flow (EAC)</h3>
<p class="formula">EAC = NPV ÷ PVIFA(r, n), &nbsp; PVIFA = [1 − (1 + r)<sup>−n</sup>] ÷ r</p>
<p><dfn>PVIFA</dfn> answers: if someone promised you $1 a year for n years at rate r, what is that stream worth today? EAC turns a project's NPV into the level annual amount with the same value. The higher EAC wins.</p>
<h3>Class example: FedEx delivery fleet (10%)</h3>
${T(['', 'Electric van', 'Diesel truck'], [['Life', '4 years', '6 years'], ['Single-cycle NPV (unfair)', '$9,774', '$26,512'], ['12-year chain NPV', '$21,009', { v: '$41,477', cls: 'hl' }], ['PVIFA(10%, n)', '3.1699', '4.3553'], ['EAC = NPV ÷ PVIFA', '$3,083', { v: '$6,087', cls: 'hl' }]], { label: 'FedEx fleet' })}
<p>Both methods pick the diesel truck. Here the naive comparison happens to agree, but it does not have to.</p>
<h3>Where the naive answer is wrong: Bay Breeze washers (14%)</h3>
${T(['', 'Compact (3 yr)', 'Industrial (6 yr)'], [['Single-cycle NPV', '$6,919', { v: '$8,363', cls: 'neg' }], ['PVIFA(14%, n)', '2.3216', '3.8887'], ['EAC', { v: '$2,980', cls: 'hl' }, '$2,151']], { label: 'Washers' })}
<p>The Industrial washer only looks better because it lasts twice as long. Per year, the Compact washer creates $830 more value. Buy the Compact.</p>
<h3>Which method, and when?</h3>
<ul><li><b>They always agree.</b> EAC is faster and scales better: lives of 7 and 11 years need a 77-year chain.</li><li><b>Shared hidden assumption:</b> both assume the asset is replaced with an identical one at the same cost, forever. If technology or prices change, a more careful analysis is needed.</li><li><b>When NOT to apply:</b> if the project is one-time (a 3-year campaign vs. a 5-year R&amp;D program that will not be repeated), just compare NPVs directly. Also unnecessary when lives are equal.</li></ul>`,
      check: [
        mc('Machine A (3 years) has NPV $6,919 and EAC $2,980. Machine B (6 years) has NPV $8,363 and EAC $2,151. The machine will be replaced forever. Choose:', ['B: higher NPV', 'A: higher value per year', 'Either', 'Neither: NPVs are positive but lives differ'], 1, 'With ongoing replacement, compare EACs.'),
        mc('Replacement chain and EAC both assume:', ['The cheaper machine is chosen', 'Each asset is replaced with an identical one at the same cost', 'Cash flows grow each cycle', 'Rates fall over time'], 1, 'Identical replication at the same cost.'),
        mc('A firm compares a one-time 3-year marketing campaign with a one-time 5-year R&D program. Which method?', ['EAC', 'Replacement chain over 15 years', 'Compare NPVs directly', 'Compare IRRs'], 2, 'Neither project will be repeated, so no adjustment is needed.'),
        mc('EAC is computed as:', ['NPV × PVIFA', 'NPV ÷ PVIFA', 'NPV ÷ n', 'IRR × NPV'], 1, 'Divide NPV by the annuity factor to get a level annual amount.')
      ] },
    { id: 'L8', part: 'Part 2 · Cash flows', slides: 'Slides 27–29', title: 'Mid-year discounting', skills: ['midyear'],
      take: 'A running business earns cash all year, so discount Year t\'s cash at t − 0.5. NPV goes up. The rate stays annual (never r ÷ 2), and the Year-0 cost stays at t = 0.',
      body: `<h3>The problem with year-end discounting</h3>
<p>Excel's NPV assumes every year's cash arrives on December 31 and nothing arrives from January 1 to December 30. A coffee shop takes in money every day. On average, the cash shows up around the middle of the year. Year-end discounting pushes every dollar to the latest possible moment, which understates present value and <b>biases NPV downward</b>.</p>
${T(['Year', 'Standard exponent', 'Mid-year exponent'], [['1', '1.0', '0.5'], ['2', '2.0', '1.5'], ['3', '3.0', '2.5'], ['4', '4.0', '3.5'], ['5', '5.0', '4.5']], { label: 'Exponents' })}
<p class="warn"><b>Common slip:</b> exponents of 0.25, 1.25, 2.25… are not mid-year. They move cash only a quarter year earlier. Mid-year is always t − 0.5.</p>
<h3>Why not use r ÷ 2?</h3>
${T(['Semi-annual compounding', 'Mid-year discounting'], [['Changes <b>how often</b> interest accrues: 10% a year becomes 5% applied twice', 'Changes <b>when</b> the cash arrives: the rate is still annual'], ['Divide the rate and double the periods', 'Keep the rate; the exponent becomes a fractional year']], { leftAll: true, plainFirst: true, label: 'r over 2' })}
<h3>Why Year 0 stays at t = 0</h3>
<p>The initial investment is a discrete, dated transaction: you sign the check on day one. Only the operating cash that flows during each year shifts.</p>
<h3>Shortcut</h3>
<p class="formula">Mid-year PV of future CFs = End-of-year PV of future CFs × (1 + r)<sup>0.5</sup></p>
<p>Then subtract the Year-0 investment as usual.</p>
<h3>Class example: Starbucks drive-through (9%)</h3>
<p>−$500,000, then $150k, $160k, $170k, $155k, $140k. End-of-year NPV = $104,351, so the PV of the future cash flows is $604,351. Multiply by (1.09)<sup>0.5</sup> = 1.0440: $630,961. Mid-year NPV = <b>$130,961</b>, about $26,600 more.</p>
<p>Bay Breeze's canning line shows the decision can flip: end-of-year NPV −$1,603 (reject; IRR 13.4% vs. 14%), mid-year NPV +$4,382 (accept).</p>
<h3>Size of the boost</h3>
<p>The boost is (1 + r)<sup>0.5</sup> − 1 on the future cash: about 2.5% at r = 5%, 4.4% at 9%, 7.2% at 15%. It matters more for high-risk projects.</p>
<h3>When to use it</h3>
<p>For continuous-revenue businesses (retail, restaurants, SaaS, manufacturing). Not for lumpy, date-specific cash flows like a single annual contract payment. The Cooper Dental model uses mid-year exponents for its five FCFs.</p>`,
      check: [
        mc('Mid-year discounting uses which exponents for Years 1–3?', ['1, 2, 3', '0.5, 1.5, 2.5', '0.25, 1.25, 2.25', '0, 1, 2'], 1, 'Each year\'s cash is moved half a year earlier: t − 0.5.'),
        mc('Mid-year discounting raises NPV because:', ['The rate is halved', 'Each future cash flow is discounted for half a year less', 'The initial cost is discounted', 'It adds a terminal value'], 1, 'Less time means less discounting, so a higher PV.'),
        mc('Why is using r ÷ 2 wrong?', ['It changes compounding frequency, not when the cash arrives', 'It is too conservative', 'Excel cannot do it', 'It discounts Year 0'], 0, 'Semi-annual compounding is a different idea. The rate stays annual.'),
        mc('End-of-year PV of future cash flows is $604,351 at r = 9%, and the investment is $500,000. Mid-year NPV is about:', ['$104,351', '$130,961', '$302,175', '$630,961'], 1, '604,351 × 1.044 = 630,961; subtract 500,000.')
      ] },
    { id: 'L9', part: 'Part 3 · DCF valuation', slides: 'Slides 31–38, 51–53', title: 'From projects to firms: free cash flow', skills: ['fcf'],
      take: 'FCF = NOPAT + depreciation − CapEx − ΔNWC. It is the cash left for all capital providers, lenders and shareholders, after the firm runs its business and invests in its future.',
      body: `<h3>Same NPV logic, bigger asset</h3>
${T(['Concept', 'Project level', 'Firm level (DCF)'], [['Cash flows', 'OCF = NI + Depr', 'Free cash flow (FCF)'], ['Discount rate', 'Project required return', 'WACC'], ['Time horizon', 'Finite (project life)', 'Infinite (going concern)'], ['Terminal event', 'Salvage value', 'Terminal value (perpetual growth)'], ['Decision', 'Accept / Reject', 'Buy / Sell / Hold']], { leftAll: true, label: 'Project vs firm' })}
<p>DCF values a company on its own fundamentals: the cash it will generate and the risk of that cash. Relative valuation (P/E, EV/EBITDA) assumes the market prices peers correctly: quick, but circular.</p>
<h3>The DCF process</h3>
<p>Build pro forma (projected) income statements and balance sheets for 5+ years. Project every line with reasonable assumptions, using cash as the <dfn>plug</dfn> so total assets always equal liabilities plus equity. Then compute FCF each year.</p>
<h3>FCF as computed in class</h3>
${T(['Line', 'Why it is there'], [['EBIT', 'Operating profit before interest: the whole firm\'s earnings, before any payment to lenders'], ['− Taxes on EBIT (EBIT × t)', 'Taxes are real cash. Taxed as if there were no debt; the debt tax shield lives in WACC'], ['= NOPAT', 'Net operating profit after tax'], ['+ Depreciation', 'Non-cash charge: add it back, as in project OCF'], ['− Capital expenditures', 'Real cash spent on new fixed assets. With net fixed assets, CapEx = ΔNFA + Depreciation'], ['− Change in net working capital', 'ΔCA ties up cash (inventory, receivables); ΔCL frees cash (suppliers finance you). ΔNWC = ΔCA − ΔCL'], [{ v: '= Free cash flow', cls: 'b' }, 'Cash available to lenders and shareholders together']], { leftAll: true, label: 'FCF lines' })}
<h3>Class example: Cooper Dental, 2021</h3>
${T(['2021', '$'], [['EBIT', '4,691,500'], ['− Taxes on EBIT (40%)', '(1,876,600)'], ['= NOPAT', '2,814,900'], ['+ Depreciation', '808,500'], ['− CapEx (ΔNFA 770,000 + Dep 808,500)', '(1,578,500)'], ['− ΔNWC (ΔCA 150,000 − ΔCL 80,000)', '(70,000)'], [{ v: '= Free cash flow', cls: 'b' }, { v: '1,974,900', cls: 'b' }]], { label: 'Cooper FCF 2021' })}
<h3>Why start from EBIT, before interest?</h3>
<p>FCF is defined as cash available to <b>all</b> capital providers. Interest is a payment <i>to</i> one of them (the lenders), so it is a way FCF gets shared out, not a cost that shrinks it. Starting from net income would subtract the lenders' share before counting it. The slide's net-income version reaches the same FCF by adding back after-tax interest on debt and removing after-tax interest earned on cash (cash is not part of operations; it is added separately in the equity bridge).</p>
<p class="formula">FCF = NI + Depr − ΔCA + ΔCL − CapEx + After-tax Int(Debt) − After-tax Int(Cash)</p>
<h3>Why CapEx = ΔNFA + Depreciation</h3>
<p>The identity for net fixed assets: NFA<sub>end</sub> = NFA<sub>begin</sub> + CapEx − Depreciation. Rearranged: <b>CapEx = ΔNFA + Depreciation</b>. NFA shows only the net change, but depreciation was eroding NFA all year; add it back to recover the cash actually spent. Cooper Dental: NFA 7.70M → 8.47M, depreciation 0.81M, CapEx = 0.77 + 0.81 = $1.58M.</p>
<h3>Is depreciation double counted?</h3>
<p><b>No.</b> It appears twice, +Dep and −Dep inside CapEx, but the two terms do different jobs. +Dep reverses a non-cash deduction from earnings. −Dep converts ΔNFA back to gross capital spending. They cancel exactly, so depreciation has zero net effect on FCF, exactly what a non-cash charge should have. The net investment that remains is ΔNFA (Cooper: −$0.77M).</p>
<p>A gross fixed-asset model (like TexMex) uses CapEx = ΔGross FA and keeps +Dep. Both paths give the same FCF. Match the CapEx formula to the balance sheet.</p>
<h3>What does NOT change FCF</h3>
<p><b>Dividends.</b> Paying out more or less is a financing decision about how FCF is distributed. In the Cooper model, value per share is $26.12 at every payout ratio from 0% to 100%.</p>`,
      check: [
        mc('EBIT 2,336,000, tax 25%, depreciation 364,000, ΔNFA 280,000, ΔCA 72,000, ΔCL 40,000. FCF is:', ['1,752,000', '1,440,000', '1,472,000', '1,804,000'], 1, 'NOPAT 1,752,000 + 364,000 − (280,000 + 364,000) − (72,000 − 40,000) = 1,440,000.'),
        mc('Depreciation is added back and also subtracted inside CapEx. This is:', ['Double counting that understates FCF', 'Correct: the two terms do different jobs and cancel, so depreciation has zero net effect', 'An error unless the firm tracks gross fixed assets', 'Only correct when depreciation is zero'], 1, 'Reverse the non-cash charge; recover gross CapEx from ΔNFA.'),
        mc('Why does FCF start from EBIT instead of net income?', ['EBIT is larger', 'FCF is cash for lenders and shareholders, and interest is a payment to lenders, so it must not be subtracted first', 'Taxes are ignored', 'Net income includes depreciation'], 1, 'FCF is the whole pie; interest is one slice.'),
        mc('Raising the dividend payout ratio will:', ['Raise FCF', 'Lower FCF', 'Leave FCF and value per share unchanged', 'Raise WACC'], 2, 'Dividends distribute cash; they do not change the cash the operations produce.'),
        mc('Current liabilities rise by $40,000 (suppliers give longer terms). Holding all else equal, FCF:', ['Falls by $40,000', 'Rises by $40,000', 'Is unchanged', 'Falls by $40,000 × t'], 1, 'Suppliers are financing you; cash stays in the firm.')
      ] },
    { id: 'L10', part: 'Part 3 · DCF valuation', slides: 'Slides 33, 39–40', title: 'WACC, growth and the terminal value', skills: ['tv'],
      take: 'Discount FCF at WACC. Capture everything after the forecast with TV = FCF<sub>N</sub>(1 + g) ÷ (WACC − g). WACC must exceed g, and the TV is usually 60–80% of enterprise value.',
      body: `<h3>WACC: the discount rate for FCF</h3>
<p>FCF belongs to both lenders and shareholders, so it is discounted at a blend of what both require: the <dfn>weighted average cost of capital</dfn>.</p>
<p class="formula">WACC = W<sub>e</sub> × R<sub>e</sub> + W<sub>d</sub> × R<sub>d</sub> × (1 − T<sub>c</sub>)</p>
<p>W<sub>e</sub>, W<sub>d</sub> are the shares of equity and debt; R<sub>e</sub> is the cost of equity (CAPM); R<sub>d</sub> is the cost of debt; (1 − T<sub>c</sub>) is the tax shield on debt, since interest is deductible. Example: 60% equity at 12%, 40% debt at 5%, tax 25%: 0.60 × 12% + 0.40 × 5% × 0.75 = 7.2% + 1.5% = <b>8.7%</b>.</p>
<h3>Growth rate g</h3>
<p>g is the long-term, sustainable FCF growth rate, usually anchored to nominal GDP growth (2–3%). No company can outgrow the economy forever. (The Cooper Dental class model uses g = 6% as its base case.)</p>
<h3>The terminal value</h3>
<p>We can forecast only so many years, but the firm can last forever. The Gordon Growth Model applied to FCF:</p>
<p class="formula">TV at end of Year N = FCF<sub>N</sub> × (1 + g) ÷ (WACC − g)</p>
<p class="warn"><b>WACC &gt; g, always.</b> If WACC ≤ g the formula gives a negative or infinite value, which is economically nonsense. WACC should exceed g by a meaningful margin.</p>
<p>Cooper Dental: FCF<sub>2025</sub> = $2,891,451. TV = 2,891,451 × 1.06 ÷ (0.14 − 0.06) = <b>$38,311,727</b> at the end of 2025. Discounted five years at 14%, the PV of TV = <b>$19,897,910</b>.</p>
<h3>Enterprise value</h3>
<p class="formula">Enterprise value = Sum of PV of forecast FCFs + PV of terminal value</p>
<p>Cooper: $8,621,687 + $19,897,910 = <b>$28,519,598</b>. The TV is 69.8% of EV. That is normal: most of a company's value comes from its long-run earning power, not the next five years.</p>
<h3>Why the TV is so sensitive to WACC (B4a pattern)</h3>
<ul><li>WACC sits in the TV's denominator as the spread (WACC − g). At g = 6%, WACC 10% → 18% widens the spread from 4% to 12%, cutting the undiscounted TV to about a third.</li><li>The TV is also discounted from the farthest date (Year 5), so a higher WACC hits it with the most compounding.</li><li>Forecast FCFs are discounted only 0.5–4.5 years and have no denominator effect. Result: PV of FCFs falls about 16% while PV of TV falls about 77%.</li></ul>
<p class="tip"><b>Extending the forecast to ten years does not remove the TV.</b> The firm is a going concern; the cash beyond Year 10 still has to be valued.</p>`,
      check: [
        mc('50% equity at 14%, 50% debt at 6%, tax 25%. WACC is:', ['10.0%', '8.25%', '9.25%', '10.75%'], 2, '0.5 × 14% + 0.5 × 6% × 0.75 = 7% + 2.25% = 9.25%.'),
        mc('FCF in the last forecast year is $1,000, g = 2%, WACC = 10%. TV at that date is:', ['$10,000', '$12,500', '$12,750', '$8,500'], 2, '1,000 × 1.02 ÷ 0.08 = 12,750.'),
        mc('Why must WACC exceed g?', ['Otherwise the formula gives a negative or infinite value, which is nonsense', 'Because g is a percentage', 'Because WACC includes taxes', 'It does not need to'], 0, 'Growth faster than the discount rate forever implies infinite value.'),
        mc('Why does the terminal value usually make up most of enterprise value?', ['Analysts inflate it', 'It captures all cash flows beyond the forecast, which is most of the firm\'s long-run earning power', 'It is not discounted', 'Forecast FCFs are taxed'], 1, 'Five years of FCF is a small part of a going concern\'s life.')
      ] },
    { id: 'L11', part: 'Part 4 · Firm value to stock price', slides: 'Slides 42–44, 48', title: 'Equity bridge and Buy / Hold / Sell', skills: ['bridge'],
      take: 'Enterprise value + cash − debt = equity value; ÷ diluted shares = value per share. Buy if the price is below the Hold band, Sell if above, Hold if inside.',
      body: `<h3>The three-step equity bridge</h3>
<ol class="steps"><li><b>Enterprise value</b> = Sum of PV of FCFs + PV of terminal value</li><li><b>Equity value</b> = Enterprise value + Cash today − Debt today</li><li><b>Value per share</b> = Equity value ÷ Diluted shares outstanding</li></ol>
<p><b>Add cash</b> because it was excluded from FCF (interest on cash was removed). <b>Subtract debt</b> to isolate the shareholders' claim: equity holders get what remains after lenders are paid.</p>
{{fig:bridge}}
<p>Cooper Dental: $28.52M + $0.80M − $3.20M = $26.12M of equity; ÷ 1,000,000 shares = <b>$26.12 per share</b>.</p>
<h3>Making the decision</h3>
<p>Same logic as accept/reject: the "project" is buying the stock, the "cost" is the market price, the "value" is the DCF value per share. If value &gt; cost, invest.</p>
<p>The model uses a <dfn>Hold band</dfn> of 5% around value per share. The stock is fairly valued (Hold) when the price is within 5% of value per share.</p>
${T(['Market price', 'vs. $26.12 (band $24.81 – $27.43)', 'Decision'], [['$22', 'Below the band: undervalued by $4.12', { v: 'Buy', cls: 'c-buy' }], ['$26', 'Inside the band', { v: 'Hold', cls: 'c-hold' }], ['$31', 'Above the band: overvalued by $4.88', { v: 'Sell / Avoid', cls: 'c-sell' }]], { label: 'Cooper decisions' })}
<p class="tip">To find the band, multiply value per share by 0.95 and 1.05. To find the value per share below which a given price becomes a Sell, divide the price by 1.05 (at $10: $9.52). Above price ÷ 0.95 (at $10: $10.53) it is a Buy.</p>
<h3>Four mistakes that will cost you</h3>
${T(['Mistake', 'Effect on value per share', 'Cooper example'], [['Forgetting to add cash', 'Understated by cash ÷ shares', '−$0.80'], ['Forgetting to subtract debt', 'Overstated by debt ÷ shares', '+$3.20'], ['Wrong share count (basic instead of diluted)', 'Overstated: diluted includes options and convertibles', 'depends'], ['Confusing NPV of FCFs with enterprise value', 'EV = PV of FCFs + PV of TV; dropping the TV loses ~70% of value', '$8.62 instead of $26.12']], { leftAll: true, label: 'Mistakes' })}
<h3>Practice B3(d): the intern's shortcut</h3>
<p>Palmetto: EV $24,725,240, cash $800,000, debt $2,000,000, 300,000 shares. Correct value per share $78.42. The intern's EV ÷ shares = $82.42 leaves out +cash and −debt, overstating value by (2.0M − 0.8M) ÷ 300,000 = <b>$4.00</b>. The Sell call at $90 survives by luck. With more debt, or a price closer to value, the shortcut would give the wrong call, and EV ÷ shares is the whole firm per share, not what a shareholder owns.</p>
<h3>What-ifs to rehearse</h3>
<ul><li>$2M more cash, 1M shares: value per share +$2.00.</li><li>Market price moves from $10 to $27, value $26.12: inside the band, Buy becomes Hold.</li><li>g up from 6% to 7% (WACC 14%): value per share rises to $29.18, mostly through a higher TV.</li></ul>`,
      check: [
        mc('EV $50M, cash $4M, debt $14M, 2M diluted shares. Value per share:', ['$25', '$20', '$32', '$18'], 1, '(50 + 4 − 14) ÷ 2 = 20.'),
        mc('Value per share $40, Hold band 5%, market price $43. Recommendation:', ['Buy', 'Hold', 'Sell', 'Need WACC'], 2, 'Band is $38–$42. $43 is above it: overvalued, Sell.'),
        mc('An analyst forgets to subtract $6M of debt with 2M shares. Value per share is:', ['Understated by $3', 'Overstated by $3', 'Overstated by $6', 'Unchanged'], 1, 'Debt ÷ shares = 3, added by mistake.'),
        mc('Why is cash added in the equity bridge?', ['Because it was excluded from FCF (interest on cash removed), so the DCF never counted it', 'Because cash is debt', 'To offset taxes', 'Because WACC includes it'], 0, 'Cash is a separate asset that belongs to the owners.')
      ] },
    { id: 'L12', part: 'Part 4 · Firm value to stock price', slides: 'Slides 45–47, 54–55', title: 'Reading sensitivity tables', skills: ['sens'],
      take: 'Find the base case, color the Buy / Hold / Sell regions, then explain each pattern with the inputs that drive FCF and the terminal value.',
      body: `<h3>Why sensitivity analysis is non-negotiable</h3>
<p>$26.12 rests on a stack of assumptions. A point estimate without a range is like a weather forecast without a confidence interval. The inputs that matter most are <b>WACC and g</b>, because they set the terminal value, which dominates enterprise value.</p>
<h3>How to read any table, in four moves</h3>
<ol class="steps"><li><b>Locate the base case</b> (Cooper: WACC 14%, g 6%, COGS 50%, growth 10% → $26.12).</li><li><b>Mark the regions</b> at the market price using the Hold band: at $10, Buy above $10.53, Hold between $9.52 and $10.53, Sell below $9.52.</li><li><b>Read the direction</b> along a row and down a column.</li><li><b>Explain with the drivers:</b> which part of FCF or TV moves, and why.</li></ol>
<h3>One-way table: WACC (g = 6%)</h3>
${wacc1way()}
<p>As WACC rises, the PV of forecast FCFs falls a little (−16% from 10% to 18%) while the PV of TV collapses (−77%). So the TV's share of EV falls, from 83.5% to 58.4%. But it is the larger part at every WACC, which is why WACC and g matter most.</p>
<h3>Two-way table: WACC × g (colored at a $10 price)</h3>
${grid(WACC_G, 'WACC', 'g', [4, 4], 10, { label: 'WACC by g' })}
<ul><li><b>Down a column</b> (WACC up): value falls. A higher WACC discounts every FCF and the TV more, and widens (WACC − g).</li><li><b>Across a row</b> (g up): value rises, and faster as g approaches WACC. At WACC 10%, g 9% gives $202.71; at g = WACC the formula breaks (N/A).</li><li><b>Safety:</b> every cell is a Buy at $10. Even the worst corner (18%, 2%) is $13.60.</li><li><b>WACC vs. g:</b> 12%/4% gives $27.93; 16%/8% gives $24.45. Same 8-point spread, yet the higher-WACC pair is lower, because WACC also discounts the forecast FCFs and the TV itself, while g only enters the TV.</li><li><b>Getting g wrong by 1 point:</b> at 14%, g 6% → 5% drops value from $26.12 to $23.74, −$2.38 or −9.1%.</li></ul>
<h3>Two-way table: COGS % × sales growth (WACC 14%, g 6%)</h3>
${grid(COGS_G, 'COGS %', 'growth', [2, 3], 10, { label: 'COGS by growth' })}
<ul><li><b>Down a column</b> (COGS up): value falls sharply. COGS drives the margin, so NOPAT and every FCF shrink. At 10% growth, 40% vs. 60% COGS is $35.65 − $16.59 = $19.06 per share.</li><li><b>Across a row, it depends on the margin.</b> Growth requires investment: current assets are 15% of sales and current liabilities 8%, so each extra dollar of sales ties up 7 cents of working capital, and fixed assets are 77% of sales. At COGS 40%, each sales dollar earns enough to repay that investment, so growth adds value ($32.78 → $38.60). At 50%, growth roughly breaks even (flat row). At 65%, growth destroys value ($14.09 → $6.09).</li><li><b>Growing your way out of a cost problem fails:</b> in the 65% row, faster growth only means investing more in a business that does not earn its cost of capital. Fix the margin first.</li><li><b>Sell threshold in the 65% row:</b> Sell below $10 ÷ 1.05 = $9.52. That first happens at 14% growth ($9.40).</li><li><b>Management's trade-off:</b> cut COGS 50% → 45% but slow growth 10% → 6%: $26.12 → $29.73, +$3.61 per share or +13.8%. Worth it.</li></ul>`,
      check: [
        mc('In the WACC × g table, value per share falls as you move down a column because:', ['g falls', 'A higher WACC discounts FCFs and the TV more and widens WACC − g', 'COGS rises', 'Shares increase'], 1, 'WACC hits both legs of EV.'),
        mc('Price $10, Hold band 5%. A value per share of $9.40 is:', ['Buy', 'Hold', 'Sell', 'Cannot tell'], 2, 'Sell below 10 ÷ 1.05 = 9.52.'),
        mc('At COGS 65%, faster sales growth lowers value per share because:', ['Growth raises WACC', 'Margins are too thin to repay the working capital and fixed assets growth requires', 'Taxes rise faster than sales', 'The TV formula breaks'], 1, 'Growth only creates value when each new sales dollar earns more than its cost of capital.'),
        mc('Cutting COGS from 50% to 45% while growth slows from 10% to 6% changes value per share from $26.12 to:', ['$25.67', '$29.73', '$30.89', '$21.61'], 1, 'Row 45%, column 6%: $29.73, up $3.61 (+13.8%).')
      ] }
  ];

  // ---------- practice midterm II (the real questions; key written for this trainer) ----------
  const sata = (q, options, skill) => ({ kind: 'sata', label: '', skill, pts: 2, q, options: options.map(([t, ok, why]) => ({ t, ok, why })) });
  const txt = (label, q, pts, skill, model, points) => ({ kind: 'text', label, q, pts, skill, model, points });
  function practice() {
    const B1t = E.cfTable([{ name: 'Pedal Shack', cf: [-25000, 15000, 15000, 5000], extra: '22.4%' }, { name: 'Bayline', cf: [-250000, 100000, 110000, 120000], extra: '14.8%' }], 3, { extra: 'IRR' });
    const B1p = table(['NPV ($) at a discount rate of:', '0%', '5%', '10%', '15%', '20%', '25%'], [['Pedal Shack', '10,000', '7,210', '4,790', '2,673', '810', '−840'], ['Bayline', '80,000', '48,672', '21,976', '−966', '−20,833', '−38,160']], { label: 'B1 NPV profile' });
    return [
      { num: 'A1', gen: 'practice', title: 'What genuinely increases NPV?', examRef: 'Section A · 2 points', stem: 'A project costs $500,000 today and is expected to produce operating cash flows of $200,000 at the end of each of the next four years. At the firm\'s 12% required return the NPV is +$107,470 and the IRR is 21.9%. A manager wants to make the project more valuable. Which of the following changes would genuinely increase the project\'s NPV?', exhibits: [], parts: [sata('Tick every correct statement.', [
        ['Negotiating with the equipment supplier to pay the $500,000 in four annual installments instead of all of it today.', true, 'Correct. Paying later means the cost is discounted, so its present value is less than $500,000. A lower PV of costs raises NPV (assuming no extra interest is charged).'],
        ['Receiving the same $800,000 of aggregate operating cash flows, but front-loaded: $300,000, $250,000, $150,000 and $100,000 in Years 1 to 4.', true, 'Correct. Same total, but more of it arrives early, when it is discounted less. Earlier cash is worth more today.'],
        ['Using a 9% discount rate instead of 12% to arrive at the NPV.', false, 'Incorrect. The NPV number would rise, but the project is unchanged. The 12% is the required return set by the project\'s risk; choosing a lower rate only mismeasures the same project.'],
        ['Redesigning the project so that it is riskier, which raises its required return to 15%.', false, 'Incorrect. Same cash flows discounted at a higher rate give a lower NPV.'],
        ['Entering a different guess in Excel\'s IRR function so that it reports a higher IRR.', false, 'Incorrect. A conventional project has exactly one IRR, and the guess does not change cash flows. NPV is unaffected.'],
        ['Cutting annual operating costs so that each year\'s operating cash flow rises to $220,000.', true, 'Correct. More cash each year means a higher PV of inflows: +$20,000 a year for four years.']], 'npv')] },
      { num: 'A2', gen: 'practice', title: 'Crossover rate and the ranking', examRef: 'Section A · 2 points', stem: 'A firm must choose between two mutually exclusive projects. Project X has an IRR of 18%; Project Y has an IRR of 15%. The NPV profiles of the two projects intersect at a discount rate of 11%: below 11% Project Y has the higher NPV, above 11% Project X does. Which of the following statements are correct?', exhibits: [], parts: [sata('Tick every correct statement.', [
        ['If the required return is 8%, the firm should choose Project Y.', true, 'Correct. 8% is below the crossover, where Y has the higher NPV, and Y\'s NPV is positive since 8% < 15%.'],
        ['If the required return is 13%, the firm should choose Project X.', true, 'Correct. Above 11%, X has the higher NPV, and X\'s NPV is positive since 13% < 18%.'],
        ['If the required return is 16%, the firm should choose Project Y, because it has the higher NPV at low rates.', false, 'Incorrect. At 16% X has the higher NPV (above the crossover), and Y\'s NPV is negative because 16% exceeds its 15% IRR. Only X is acceptable.'],
        ['If the required return is 20%, the firm should reject both projects.', true, 'Correct. 20% is above both IRRs, so both NPVs are negative.'],
        ['Because Project X has the higher IRR, it should be chosen whatever the required return.', false, 'Incorrect. Below 11% Y has the higher NPV. Rank exclusive projects by NPV at the required return, not by IRR.'],
        ['Project Y\'s NPV falls faster than Project X\'s as the discount rate rises, which is consistent with Y\'s cash flows arriving later, or Y being the larger project.', true, 'Correct. Y starts higher and ends lower, so its profile is steeper. Steeper profiles come from later or larger cash flows, which are hit harder by discounting.']], 'mutex')] },
      { num: 'A3', gen: 'practice', title: 'Operating cash flow', examRef: 'Section A · 2 points', stem: 'A project\'s Year-1 income statement is shown below. The effective tax rate is 30%. Which of the following statements are correct?', exhibits: [{ html: table(['Year 1', 'Amount ($)'], [['Revenue', '90,000'], ['− Operating Expenses', '(50,000)'], ['− Depreciation', '(20,000)'], ['= EBT', '20,000'], ['− Tax', '(6,000)'], ['= Net Income', '14,000']], { label: 'A3 income statement' }) }], parts: [sata('Tick every correct statement.', [
        ['The project\'s Year-1 operating cash flow is $34,000.', true, 'Correct. OCF = Net income + Depreciation = 14,000 + 20,000 = 34,000.'],
        ['If the firm were allowed to depreciate faster, say $30,000 in Year 1, Year-1 net income would fall but Year-1 operating cash flow would rise.', true, 'Correct. EBT 10,000, tax 3,000, NI 7,000, OCF 37,000. The extra $10,000 of depreciation saves $3,000 of tax.'],
        ['If the tax rate were 0%, the amount of depreciation would have no effect on operating cash flow.', true, 'Correct. With no tax, the shield is zero: OCF = Revenue − Operating expenses = 40,000 whatever the depreciation.'],
        ['If the equipment is eventually sold for exactly its book value, the sale has no tax effect.', true, 'Correct. Gain = Market value − Book value = 0, so no tax is due and no benefit arises.'],
        ['EBITDA (Revenue − Operating Expenses) of $40,000 would be the correct Year-1 cash flow, because depreciation is not a cash expense.', false, 'Incorrect. EBITDA ignores the $6,000 of tax, which is real cash. It overstates cash flow.'],
        ['Using net income of $14,000 as the Year-1 cash flow would overstate the project\'s value.', false, 'Incorrect. Net income subtracts $20,000 of non-cash depreciation, so it understates cash flow and value.']], 'ocf')] },
      { num: 'A4', gen: 'practice', title: 'Two IRRs', examRef: 'Section A · 2 points', stem: 'An analyst evaluates a project with total cash flows of −$200,000 today, +$520,000 in Year 1 and −$330,000 in Year 2 (a negative operating cash flow arising from a cleanup cost). Excel\'s =IRR(range) returns 10%; =IRR(range, 0.5) returns 50%. At the firm\'s 12% required return the NPV is +$1,212. Which of the following statements are correct?', exhibits: [], parts: [sata('Tick every correct statement.', [
        ['The project has two IRRs, 10% and 50%.', true, 'Correct. Two sign changes (−, +, −) allow up to two IRRs, and Excel found both by changing the guess.'],
        ['The first Excel result is a mistake and the second one is the project\'s true IRR.', false, 'Incorrect. Both are genuine roots of the NPV equation. Neither is "the" IRR.'],
        ['At the 12% required return the project should be accepted, because its NPV is positive.', true, 'Correct. With unconventional cash flows, decide with NPV at the required return: +$1,212 means accept.'],
        ['Because 12% is above the 10% IRR, the IRR rule says reject; this shows that the IRR rule cannot be trusted for this project.', true, 'Correct. Read against the 10% IRR, the rule says reject, while NPV says accept (and the 50% IRR says accept). Conflicting IRR signals are exactly why the IRR rule fails here.'],
        ['The project has a positive NPV at any required return between 10% and 50%.', true, 'Correct. For a −, +, − pattern the profile is a hill: NPV is positive only between the two IRRs.'],
        ['At a 5% required return the NPV would be higher than at 12%.', false, 'Incorrect. 5% is below the first IRR, where NPV is negative (about −$4,100). The usual "lower rate, higher NPV" does not hold for this pattern.']], 'unconv')] },
      { num: 'A5', gen: 'practice', title: 'Cooper Dental equity bridge', examRef: 'Section A · 2 points', stem: 'The Cooper Dental DCF model from class gives an enterprise value of $28.52 million. The firm has $0.8 million of cash, $3.2 million of debt and 1,000,000 shares, so equity value is $26.12 million and value per share is $26.12 against a market price of $10.00. The model applies a 5% Hold band around the value per share: the stock is Fairly Valued (Hold) when the market price is within 5% of the value per share. Which of the following statements are correct?', exhibits: [], parts: [sata('Tick every correct statement.', [
        ['If the firm had $2 million more cash on its balance sheet today, everything else unchanged, value per share would be about $2 higher.', true, 'Correct. Cash is added in the bridge: +$2M ÷ 1M shares = +$2.00.'],
        ['If the analyst had forgotten to subtract debt, value per share would have been overstated by $3.20.', true, 'Correct. $3.2M ÷ 1M shares = $3.20 too high.'],
        ['If management raised the dividend payout ratio, free cash flow and value per share would rise.', false, 'Incorrect. Dividends distribute cash; they do not change FCF. The Cooper model shows $26.12 at every payout ratio.'],
        ['If the analyst used g = 7% instead of 6% with WACC unchanged at 14%, value per share would rise, mainly through a higher terminal value.', true, 'Correct. g raises TV = FCF(1+g)/(WACC − g) by narrowing the spread. The sensitivity table shows $29.18.'],
        ['If the market price rose to $27 with no change in the model, the recommendation would switch from Buy to Hold.', true, 'Correct. The band is $26.12 × 0.95 = $24.81 to $26.12 × 1.05 = $27.43. $27 is inside it.'],
        ['Because the terminal value is about 70% of enterprise value, the analyst should extend the forecast to ten years so that no terminal value is needed.', false, 'Incorrect. The firm is a going concern; a ten-year forecast still needs a terminal value for the years after it. A large TV share is normal (60–80%).']], 'bridge')] },
      { num: 'B1', gen: 'practice', title: 'Pedal Shack vs. Bayline Boat Rentals', examRef: 'Section B · 4 points', stem: 'A leisure company holds the concession for one waterfront lot at a Tampa marina and must choose between a small bike-rental stand (Pedal Shack) and a boat-and-paddleboard rental operation with a dock (Bayline Boat Rentals). Only one can be built. The required return for both projects is 10%.', exhibits: [{ html: B1t }, { html: B1p }, { html: '{{fig:b1}}' }], parts: [
        txt('a', 'At the 10% required return, which project does the IRR rule favor and which does the NPV rule favor? Which should the company build, and why? [1.5]', 1.5, 'mutex', 'The IRR rule favors Pedal Shack (22.4% vs. 14.8%). The NPV rule favors Bayline ($21,976 vs. $4,790 at 10%). The company should build Bayline: the projects are mutually exclusive, and NPV measures the dollars of value each creates. Bayline adds about $17,186 more value. IRR is a percentage and can rank exclusive projects incorrectly.', ['IRR favors Pedal Shack (22.4% > 14.8%)', 'NPV favors Bayline ($21,976 > $4,790)', 'Build Bayline', 'Reason: exclusive projects are ranked by NPV, which measures dollars of value created; IRR can misrank']),
        txt('b', 'Explain why the IRR rule favors one project while the NPV rule favors the other. Be specific: refer to the operating cash flows and how they affect each project\'s IRR and NPV. [1]', 1, 'mutex', 'Scale: Bayline invests ten times as much ($250,000 vs. $25,000). A modest 14.8% return on a large base produces more dollars than a high 22.4% return on a small one, and IRR, being a percentage, ignores scale. Timing reinforces it: Pedal Shack gets most of its cash back early ($15,000 in each of Years 1 and 2, only $5,000 in Year 3), while Bayline\'s cash grows over time ($100k, $110k, $120k). Back-loaded, larger cash is hit harder by discounting, so Bayline\'s NPV falls faster as the rate rises. Its profile is steeper and crosses Pedal Shack\'s around 14%: below that rate Bayline has the higher NPV.', ['Scale: Bayline is ten times larger, and IRR ignores the size of the investment', 'Timing: Pedal Shack\'s cash is front-loaded, Bayline\'s grows over time', 'Bayline\'s NPV falls faster as r rises (steeper profile); the profiles cross between 10% and 15%', 'At 10%, below the crossover, Bayline has the higher NPV']),
        txt('c', 'Now suppose the firm\'s required return were 25% or higher. Using the NPV profile, what should the firm do, and why? Does it matter at this required return which of the two projects ranks higher? [1]', 1, 'mutex', 'Reject both. At 25%, both NPVs are negative (−$840 and −$38,160), because 25% is above both IRRs (22.4% and 14.8%), and NPV keeps falling at higher rates. The ranking no longer matters: the choice is between two value-destroying projects, and the right answer is neither.', ['Reject both projects', 'Both NPVs are negative at 25% (above both IRRs)', 'Ranking does not matter when both destroy value']),
        txt('d', 'Suppose a second waterfront lot became available, so that building one project no longer rules out the other, and the firm has enough funds to build both. What should it do at the 10% required return, and why? [0.5]', 0.5, 'mutex', 'Build both. The projects are now independent, so the rule is to accept every project with a positive NPV. At 10% both are positive ($4,790 and $21,976), together adding $26,766 of value.', ['Build both', 'Independent projects: accept every positive-NPV project; both are positive at 10%'])] },
      { num: 'B2', gen: 'practice', title: 'Gulf Breeze Festival', examRef: 'Section B · 3 points', stem: 'A promoter can stage a two-day music festival on city parkland. The project requires an initial investment of $100,000 today. After-tax OCF is $230,000 in Year 1. In Year 2 there is no operating cash flow, but the city requires the parkland to be restored, an after-tax cash outflow of $140,000. The required return is 10%. Excel\'s IRR function returned #NUM!. At discount rates above 50% the NPV continues to fall; as the rate becomes very large, NPV approaches the Year-0 cash flow of −$100,000.', exhibits: [{ html: table(['Gulf Breeze Festival ($)', 'Year 0', 'Year 1', 'Year 2', 'Sum'], [['Total cash flow (OCF + investment / restoration)', '−100,000', '+230,000', '−140,000', '−10,000']], { label: 'B2 cash flows' }) }, { html: table(['Discount rate', '0%', '10%', '20%', '25%', '30%', '40%', '50%'], [['NPV ($)', '−10,000', '−6,612', '−5,556', '−5,600', '−5,917', '−7,143', '−8,889']], { label: 'B2 NPV profile' }) }, { html: '{{fig:b2}}' }], parts: [
        txt('a', 'How many IRRs does this project have? Does the #NUM! result mean the analyst made a mistake? Explain using the pattern of the cash flows and the shape of the NPV profile. [1]', 1, 'unconv', 'None. The cash flows change sign twice (−, +, −), so Descartes\' rule allows up to two IRRs, but that is a maximum, not a count. The NPV profile is a hill that peaks around −$5,556 near 20% and never reaches zero: negative at 0%, still negative at its highest point, and falling toward −$100,000 at very high rates. No zero crossing means no real IRR. The #NUM! is not an analyst error; Excel cannot find a rate that does not exist.', ['Zero IRRs', 'Two sign changes allow at most two IRRs (a ceiling, not a count)', 'The profile peaks below zero and never crosses it', '#NUM! is not a mistake: there is no real IRR to find']),
        txt('b', 'Should the promoter stage the festival at the 10% required return? Is there any required return at which it should be accepted? Why or why not? [1]', 1, 'unconv', 'No. At 10% the NPV is −$6,612, so the festival destroys value. There is no required return at which to accept it: NPV is negative at every rate, from −$10,000 at 0%, to a best case of about −$5,556 near 20%, down toward −$100,000 at very high rates. The restoration cost is too large relative to the Year-1 inflow.', ['Reject at 10%: NPV = −$6,612', 'No rate makes it acceptable', 'NPV is negative at every discount rate (even the peak is about −$5,556)']),
        txt('c', 'The undiscounted sum of the cash flows is −$10,000, yet the NPV at 20% is only −$5,556. Why does discounting make this project look better rather than worse? [1]', 1, 'unconv', 'The largest outflow, the $140,000 restoration, comes last, in Year 2. Discounting shrinks distant cash flows the most, so as the rate rises, the PV of the Year-2 cost falls faster than the PV of the Year-1 inflow. Up to about 20%, that makes the NPV less negative. Beyond that, the shrinking Year-1 inflow dominates and NPV falls again.', ['The big outflow comes last (Year 2)', 'Discounting shrinks later cash flows more than earlier ones', 'So the PV of the cost falls faster than the PV of the inflow, up to a point'])] },
      { num: 'B3', gen: 'practice', title: 'Palmetto Urgent Care', examRef: 'Section B · 4 points', stem: 'Palmetto Urgent Care trades at $90.00 per share. An analyst has built a DCF model with the same structure as Cooper Dental. The valuation date is the end of 2025, with a five-year forecast (2026–2030) and a terminal value at the end of 2030. Every figure has already been computed.', exhibits: [
        { html: table(['2026 income statement (bottom half)', 'Amount ($)'], [['EBIT', '2,336,000'], ['− Interest payments on debt', '(152,000)'], ['+ Interest earned on cash', '16,000'], ['= Profit before tax', '2,200,000'], ['− Taxes at 25%', '(550,000)'], ['= Profit after tax (net income)', '1,650,000']], { label: 'B3 income statement' }) },
        { html: table(['2026 free cash flow', 'How it was computed', 'Amount ($)'], [['EBIT', 'From the income statement', '2,336,000'], ['− Taxes on EBIT', '25% × 2,336,000', '(584,000)'], ['= NOPAT', 'EBIT × (1 − 25%)', '1,752,000'], ['+ Depreciation', '', '364,000'], ['− Capital expenditures', 'Δ Net fixed assets 280,000 + Depreciation 364,000', '(644,000)'], ['− Change in net working capital', 'Δ Current assets 72,000 − Δ Current liabilities 40,000', '(32,000)'], ['= Free cash flow', '', '1,440,000']], { label: 'B3 FCF' }) },
        { html: table(['Valuation summary (end-of-2025 dollars)', 'How it was computed', 'Amount'], [['WACC', '', '9.50%'], ['Sum of PV of FCFs, 2026–2030', 'Discounted at WACC to end of 2025', '$6,465,962'], ['PV of terminal value', 'FCF₂₀₃₀ × (1 + g) ÷ (WACC − g), g = 2.5%, discounted to end of 2025', '$18,259,278'], ['Enterprise value', 'Sum of PV of FCFs + PV of TV', '$24,725,240'], ['+ Cash', '', '$800,000'], ['− Debt', '', '($2,000,000)'], ['Equity value', 'EV + cash − debt', '$23,525,240'], ['Diluted shares outstanding', '', '300,000'], ['Value per share', 'Equity value ÷ diluted shares', '$78.42'], ['Current market price', '', '$90.00']], { label: 'B3 valuation' }) }], parts: [
        txt('a', 'NOPAT for 2026 is $1,752,000 but free cash flow is only $1,440,000. Identify each item that takes you from NOPAT to FCF and explain why it is a real source or use of cash. [1]', 1, 'fcf', 'Three items. (1) + Depreciation $364,000: a non-cash charge subtracted in computing EBIT, so it is added back; no cash left the firm. (2) − Capital expenditures $644,000: real cash spent on new fixed assets (ΔNFA $280,000 + depreciation $364,000). (3) − Change in net working capital $32,000: current assets grew $72,000 (inventory and receivables tie up cash), partly financed by a $40,000 rise in current liabilities (suppliers lending to the firm). Net: 1,752,000 + 364,000 − 644,000 − 32,000 = 1,440,000.', ['+ Depreciation $364,000: non-cash, added back', '− CapEx $644,000: real cash spent on fixed assets', '− ΔNWC $32,000: growth in current assets uses cash, partly offset by growth in current liabilities', 'Sum reconciles to $1,440,000']),
        txt('b', 'Depreciation of $364,000 appears twice: added back on its own line and subtracted inside capital expenditures. Is this double counting? Explain. [1]', 1, 'fcf', 'No. The two terms do different jobs. The +$364,000 reverses the non-cash depreciation charge that reduced EBIT. The −$364,000 inside CapEx converts the change in net fixed assets back into gross capital spending: NFA rose only $280,000 because depreciation was eroding it, so the firm actually spent $644,000. The two cancel exactly, so depreciation has zero net effect on FCF, as a non-cash charge should, and the net investment left is ΔNFA = $280,000.', ['Not double counting', '+Dep reverses the non-cash charge in EBIT', '−Dep inside CapEx converts ΔNFA to gross spending (CapEx = ΔNFA + Dep)', 'They cancel: zero net effect of depreciation on FCF']),
        txt('c', 'FCF was defined as the cash available to all capital providers. Using this definition, explain why the FCF computation starts from EBIT, before interest, rather than from net income. [1]', 1, 'fcf', 'Because FCF is the cash available to both lenders and shareholders, it must be measured before anything is paid to either group. Interest is the lenders\' share of that cash, so subtracting it first (as net income does) would remove part of what FCF is supposed to capture. Net income also includes interest earned on cash, which is not operating; cash is added separately in the equity bridge.', ['FCF is cash for lenders and shareholders together', 'Interest is a payment to lenders, a distribution of FCF, not an operating cost', 'Net income has already subtracted the lenders\' share (and includes non-operating interest on cash)']),
        txt('d', 'An intern computes value per share as EV ÷ shares = $24,725,240 ÷ 300,000 = $82.42 and says: "It\'s still below $90, so skipping the extra steps made no difference." Identify the two items the intern left out, and explain why the shortcut is wrong even though the recommendation happens to be unchanged. [1]', 1, 'bridge', 'The intern left out adding cash ($800,000) and subtracting debt ($2,000,000). EV is the value of the whole firm, owned by lenders and shareholders together; shareholders own only what is left after the debt is repaid, plus the cash. The shortcut overstates value per share by (2,000,000 − 800,000) ÷ 300,000 = $4.00 ($82.42 vs. $78.42). The Sell call survives only by luck: with more debt or a price closer to value, the error would flip the recommendation, and any price target built on $82.42 would be wrong.', ['Left out + cash $800,000 and − debt $2,000,000', 'EV belongs to all capital providers; equity is EV + cash − debt', 'Overstates value per share by $4.00 ($82.42 vs. $78.42)', 'Same call only by luck: a larger gap or closer price would flip it'])] },
      { num: 'B4', gen: 'practice', title: 'Sensitivity analyses', examRef: 'Section B · 4 points', stem: 'Both tables come from the Cooper Dental DCF model. The base case is WACC = 14%, g = 6%, COGS = 50% of sales and sales growth = 10%, giving a value per share of $26.12 against a market price of $10.00. The model applies a 5% Hold band. Table 1 varies WACC with g held at 6%. Table 2 shows value per share for COGS % (rows) and sales growth (columns), holding WACC at 14% and g at 6%.', exhibits: [{ html: '<p class="exlbl">Table 1</p>' + wacc1way() }, { html: '<p class="exlbl">Table 2</p>' + grid(COGS_G, 'COGS %', 'growth', [2, 3], null, { label: 'Table 2' }) }], parts: [
        txt('a', 'As WACC rises from 10% to 18%, the sum of the PVs of the forecast FCFs falls by about 16%, while the PV of the terminal value falls by about 77%. Explain why the terminal value is so much more sensitive to WACC. [1]', 1, 'tv', 'The TV is a growing perpetuity: TV = FCF(1 + g) ÷ (WACC − g). WACC sits in the denominator, so raising it from 10% to 18% with g = 6% triples the spread (4% to 12%) and cuts the undiscounted TV to about a third. On top of that, the TV is discounted from the end of the forecast, the farthest date, so it takes the most compounding. The 2021–2025 FCFs are discounted only half a year to four and a half years and have no denominator effect.', ['TV = FCF(1+g)/(WACC − g): WACC is in the denominator', 'The spread WACC − g triples (4% → 12%), so TV shrinks to about a third', 'The TV is discounted from the farthest date, so compounding hits it hardest', 'Forecast FCFs are discounted only a few years']),
        txt('b', 'Using the last two columns, explain why the terminal value\'s share of EV falls as WACC rises. Given that the TV is the larger part of EV at every WACC, why does this make WACC and g the two inputs that matter most? [1]', 1, 'tv', 'Because the PV of TV falls much faster than the PV of the forecast FCFs as WACC rises, the TV\'s share of EV drops from 83.5% to 58.4%, and value per share falls from $54.59 to $16.70. Even at 18% the TV is still more than half of EV. Since the TV dominates EV everywhere and its formula is driven by WACC and g, small changes in those two inputs move value per share far more than changes to the five forecast years.', ['TV falls faster than forecast FCFs, so its share drops (83.5% → 58.4%)', 'TV is still more than half of EV at every WACC', 'TV is set by WACC and g, so those two inputs drive most of the value']),
        txt('c', 'Management says: "We can cut COGS from 50% to 45%, but the cost-cutting will slow sales growth from 10% to 6%." Using Table 2, is the trade-off worth it? By how much per share and by what percentage? [1]', 1, 'sens', 'Yes. Value per share moves from $26.12 (COGS 50%, growth 10%) to $29.73 (COGS 45%, growth 6%), a gain of $3.61 per share, or about 13.8%. The margin gain outweighs the slower growth.', ['Worth it', '$26.12 → $29.73', '+$3.61 per share', '≈ +13.8%']),
        txt('d', 'Look at the COGS = 65% row. Market price $10.00, 5% Hold band. Below what value per share does the recommendation become a Sell? At what growth rate in this row does that first happen? Then explain why faster growth lowers value per share here, and what that says about "growing your way out" of a cost problem. [1]', 1, 'sens', 'It is a Sell when the price is more than 5% above value per share, so below $10 ÷ 1.05 ≈ $9.52. In the 65% row that first happens at 14% growth ($9.40). Faster growth lowers value because growth requires investment in working capital and fixed assets (current assets 15% of sales, net fixed assets 77% of sales), and at a 65% COGS each new sales dollar earns too little to repay that investment at the 14% WACC. Growing a business that does not earn its cost of capital only destroys value faster: you cannot grow your way out of a cost problem; fix the margin first.', ['Sell below about $9.52 (= $10 ÷ 1.05)', 'First at 14% growth ($9.40)', 'Growth needs investment in NWC and fixed assets; at a 65% COGS margin it does not earn its cost of capital', 'You cannot grow your way out of a cost problem'])] }
    ];
  }

  // ---------- review sheet: everything to memorize for a closed-book exam ----------
  const REVIEW = `
<div class="rv"><h3>Decision rules</h3><ul>
<li><b>NPV</b> = Σ CF<sub>t</sub>/(1+r)<sup>t</sup>. &gt; 0 accept, &lt; 0 reject, = 0 indifferent.</li>
<li><b>IRR</b>: the rate where NPV = 0. Inside the project. <b>r</b>: required return, outside. Accept if IRR &gt; r.</li>
<li>NPV = dollar value of the gap between IRR and r. Discount at r, never at the IRR.</li>
<li>Only cash amount, cash timing and risk change NPV. A different rate "choice" or an IRR guess does not.</li>
<li>Standalone + conventional: NPV and IRR always agree. NPV works everywhere; IRR is the communication tool.</li></ul></div>
<div class="rv"><h3>Exclusive projects and profiles</h3><ul>
<li>Pick the higher NPV at r. Scale problem: IRR ignores size. Timing problem: IRR favors early cash (reinvests at its own rate).</li>
<li>Profile crosses zero at the IRR. Crossover = IRR of the difference in cash flows; NPVs equal there.</li>
<li>Below crossover: steeper (later / larger) project wins. Above both IRRs: reject both.</li>
<li>Independent: accept every positive-NPV project.</li></ul></div>
<div class="rv"><h3>Unconventional cash flows</h3><ul>
<li>Max IRRs = number of sign changes (a ceiling). −, +, − can have 2, 1 or 0 IRRs.</li>
<li>Hill-shaped profile: NPV positive only between the IRRs. NPV at 0% = plain sum.</li>
<li>Excel IRR finds one root near the guess; #NUM! can mean no real IRR. One sign change = exactly one IRR.</li>
<li>A late outflow shrinks most when discounted, so NPV can rise with r at first.</li></ul></div>
<div class="rv"><h3>Operating cash flow</h3><ul>
<li>Revenue − Opex − Dep = EBT; × t = Tax; EBT − Tax = NI; NI + Dep = <b>OCF</b>.</li>
<li>OCF = (Rev − Opex)(1 − t) + Dep × t. Tax shield = Dep × t.</li>
<li>Net income understates (undervalues); EBITDA overstates (ignores tax).</li>
<li>Faster depreciation: NI down, OCF up by ΔDep × t. If t = 0, depreciation does not matter.</li></ul></div>
<div class="rv"><h3>Salvage</h3><ul>
<li>Book value = Cost − Accumulated depreciation. Gain = Market − Book. Tax = Gain × t.</li>
<li>Gain: after-tax = Market − Tax. Loss: after-tax = Market + Tax benefit. At book: no tax.</li>
<li>Final-year CF = OCF + after-tax salvage.</li></ul></div>
<div class="rv"><h3>Unequal lives</h3><ul>
<li>Only when the asset is replaced indefinitely. EAC = NPV ÷ PVIFA(r, n); higher EAC wins.</li>
<li>PVIFA = [1 − (1+r)<sup>−n</sup>]/r. Replacement chain over the LCM gives the same answer.</li>
<li>Assumes identical replacement at the same cost. One-time projects: compare NPVs.</li></ul></div>
<div class="rv"><h3>Mid-year discounting</h3><ul>
<li>Exponents 0.5, 1.5, 2.5, … Year 0 stays at t = 0. Rate stays annual: never r ÷ 2.</li>
<li>Mid-year PV of future CFs = end-year PV × (1+r)<sup>0.5</sup>. NPV rises, more so at higher r.</li></ul></div>
<div class="rv"><h3>Free cash flow</h3><ul>
<li>EBIT − EBIT × t = NOPAT; + Dep − CapEx − ΔNWC = <b>FCF</b>.</li>
<li>CapEx = ΔNFA + Dep (net fixed assets). ΔNWC = ΔCA − ΔCL.</li>
<li>Start at EBIT: FCF is for lenders and shareholders; interest is the lenders' slice.</li>
<li>+Dep and −Dep (in CapEx) cancel: not double counting. Dividends do not change FCF.</li></ul></div>
<div class="rv"><h3>WACC and terminal value</h3><ul>
<li>WACC = W<sub>e</sub>R<sub>e</sub> + W<sub>d</sub>R<sub>d</sub>(1 − T<sub>c</sub>).</li>
<li>TV = FCF<sub>N</sub>(1 + g)/(WACC − g), WACC &gt; g always, g ≈ long-run GDP (2–3%).</li>
<li>EV = PV of FCFs + PV of TV. TV ≈ 60–80% of EV. TV is far more sensitive to WACC and g.</li></ul></div>
<div class="rv"><h3>Equity bridge and the call</h3><ul>
<li>Equity = EV + Cash − Debt. Value per share = Equity ÷ <b>diluted</b> shares.</li>
<li>5% band: Hold if price is within ±5% of value per share. Buy below, Sell above.</li>
<li>Sell threshold for a price P: value per share below P ÷ 1.05. Buy above P ÷ 0.95.</li>
<li>Mistakes: forget cash (understates), forget debt (overstates), basic shares, NPV of FCFs ≠ EV.</li></ul></div>
<div class="rv"><h3>Sensitivity tables</h3><ul>
<li>Base case first, then Buy / Hold / Sell regions at the price, then direction, then drivers.</li>
<li>WACC up: value down. g up: value up, explosively as g → WACC.</li>
<li>Growth adds value only when margins are high enough to repay the investment growth needs.</li></ul></div>
<div class="rv"><h3>Select-all scoring</h3><ul>
<li>2 × (correct ticked ÷ correct total) − 1 per wrong tick, floor 0. Blank costs nothing.</li>
<li>Every question has at least two wrong statements. Tick only what you can explain.</li></ul></div>`;

  return { SKILLS, CHECKLIST, LESSONS, practice, REVIEW, WACC_G, COGS_G, WACC_1WAY, grid, wacc1way, callOf };
})();
if (typeof module !== 'undefined') module.exports = C;
