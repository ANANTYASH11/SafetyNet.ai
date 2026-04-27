/**
 * services/calculationService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Financial Intelligence Engine — AI Emergency Fund Calculator
 *
 * Core algorithm:
 *  1. Base = totalMonthlyObligations × 3 months minimum
 *  2. Additions for: job instability, dependents, high EMI ratio,
 *     city cost-of-living, age, health insurance gap, life stage
 *  3. City cost multiplier applied to final fund amount
 *  4. Risk score (0–100) is a weighted composite of 6 factors
 *  5. Investment split across 3 liquidity tiers
 *  6. 12-month projection at the suggested monthly savings rate
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ── Job stability map ─────────────────────────────────────────
 * addMonths  → extra months added to base recommendation
 * score      → raw risk contribution (out of ~50)
 * label      → display name
 */
const JOB_MAP = {
  govt:       { addMonths: 0.0, score: 5,  label: 'Government / PSU',        desc: 'Strong income stability with pension benefits' },
  corporate:  { addMonths: 1.5, score: 22, label: 'Private / Corporate',      desc: 'Susceptible to layoffs during economic downturns' },
  freelancer: { addMonths: 4.5, score: 48, label: 'Freelancer / Consultant',  desc: 'Irregular income with project gap risks' },
  business:   { addMonths: 3.5, score: 38, label: 'Business Owner',           desc: 'Revenue volatility and business liability risk' },
  gig:        { addMonths: 3.5, score: 42, label: 'Gig / Part-time',          desc: 'Platform dependency and high income variability' },
};

/* ── Risk score thresholds ─────────────────────────────────────
 * Financial health buckets:
 *  0–25   → Low Risk    (fully funded / stable)
 *  26–50  → Medium Risk (partially funded / manageable)
 *  51–72  → High Risk   (under-funded / volatile income)
 *  73–100 → Critical    (dangerously exposed)
 */
const RISK_LEVELS = [
  { max: 25, level: 'Low',      color: '#059669' }, // emerald
  { max: 50, level: 'Medium',   color: '#d97706' }, // amber
  { max: 72, level: 'High',     color: '#ea580c' }, // orange
  { max: 100,level: 'Critical', color: '#dc2626' }, // red
];

/* ─────────────────────────────────────────────────────────────── */

/**
 * @param {object} inputs  Raw request body (field names as sent by the frontend)
 * @returns {object}       Full analysis result object
 *
 * Input fields accepted (all optional except monthlyIncome + monthlyExpenses):
 *   monthlyIncome, monthlyExpenses, emi, savings, jobType, dependents,
 *   cityTier, age, lifeStage, hasHealthInsurance, rentOrOwn
 *
 * Also accepts spec-style aliases:
 *   income → monthlyIncome
 *   expenses → monthlyExpenses
 *   cityType → cityTier
 *   lifestyle → lifeStage
 */
function calculateEmergencyFund(inputs) {
  // ── 1. Normalise & parse inputs ──────────────────────────────
  const income   = Math.max(0, Number(inputs.monthlyIncome   ?? inputs.income    ?? 0));
  const expenses = Math.max(0, Number(inputs.monthlyExpenses ?? inputs.expenses  ?? 0));
  const emiAmt   = Math.max(0, Number(inputs.emi ?? 0));
  const savings  = Math.max(0, Number(inputs.savings ?? 0));
  const deps     = Math.max(0, Math.min(10, Number(inputs.dependents ?? 0)));
  const age      = Math.max(18, Math.min(90, Number(inputs.age ?? 30)));
  const cityTier = String(inputs.cityTier ?? inputs.cityType ?? '2');
  const jobType  = (inputs.jobType ?? 'corporate').toLowerCase();
  const lifeStage= inputs.lifeStage ?? inputs.lifestyle ?? 'mid_career';
  const hasIns   = inputs.hasHealthInsurance;
  const rentOrOwn= inputs.rentOrOwn ?? 'rent';

  // Normalised insurance flag (accepts boolean, string 'yes'/'no'/'partial')
  const insured  = hasIns === true || hasIns === 'yes' || hasIns === 'partial';

  // ── 2. Derived base figures ──────────────────────────────────
  const totalObligations = expenses + emiAmt;           // monthly cash needed
  const emiRatio         = income > 0 ? emiAmt / income   : 0;   // debt load
  const expenseRatio     = income > 0 ? expenses / income : 0;   // spending rate
  const surplus          = Math.max(0, income - totalObligations);

  // survivalMonths: bare savings / expenses (spec-required field)
  const survivalMonths   = expenses > 0 ? parseFloat((savings / expenses).toFixed(2)) : 0;

  // ── 3. Risk score & month accumulator ───────────────────────
  let riskScore          = 0;
  let monthsRecommended  = 3;   // base minimum
  const riskFactors      = [];
  const protectiveFactors= [];

  /* ── 3a. Employment type ── (weight ~20%) ────────────────── */
  const jobKey  = JOB_MAP[jobType] ? jobType : 'corporate';
  const jobData = JOB_MAP[jobKey];
  monthsRecommended += jobData.addMonths;
  riskScore         += jobData.score;
  if (jobData.score > 30) {
    riskFactors.push({ factor: 'Employment Type', impact: 'High', detail: jobData.desc });
  } else {
    protectiveFactors.push({ factor: jobData.label, impact: 'Protective', detail: jobData.desc });
  }

  /* ── 3b. Dependents ── (weight ~15%) ────────────────────── */
  if (deps > 0) {
    monthsRecommended += deps * 0.8;
    riskScore         += deps * 7;
    riskFactors.push({
      factor: `${deps} Dependent${deps > 1 ? 's' : ''}`,
      impact: deps >= 3 ? 'High' : 'Medium',
      detail: `${deps} family member${deps > 1 ? 's' : ''} depend on your income — larger buffer required`,
    });
  } else {
    protectiveFactors.push({ factor: 'No Dependents', impact: 'Protective', detail: 'No family reliance reduces financial obligations' });
  }

  /* ── 3c. EMI / debt load ── (weight ~25%) ───────────────── */
  if (emiRatio > 0.5) {
    monthsRecommended += 2.5; riskScore += 32;
    riskFactors.push({ factor: 'Critical Debt Load', impact: 'High',
      detail: `EMI at ${(emiRatio * 100).toFixed(0)}% of income — far above the safe 30% threshold` });
  } else if (emiRatio > 0.3) {
    monthsRecommended += 1.5; riskScore += 16;
    riskFactors.push({ factor: 'Moderate Debt Burden', impact: 'Medium',
      detail: `EMI at ${(emiRatio * 100).toFixed(0)}% of income — RBI recommends below 30%` });
  } else if (emiRatio > 0) {
    monthsRecommended += 0.5; riskScore += 6;
  } else {
    protectiveFactors.push({ factor: 'Zero EMI / Debt-Free', impact: 'Protective',
      detail: 'No loan obligations give you a lower monthly burn rate' });
  }

  /* ── 3d. City tier — cost-of-living multiplier ─────────── */
  const cityMultiplier = { '1': 1.18, '2': 1.0, '3': 0.82 }[cityTier] ?? 1.0;
  if (cityTier === '1') {
    monthsRecommended += 1; riskScore += 8;
    riskFactors.push({ factor: 'Tier-1 Metro Living', impact: 'Medium',
      detail: 'Higher rental, healthcare, and utility costs in metro cities' });
  } else if (cityTier === '3') {
    monthsRecommended -= 0.5;
    protectiveFactors.push({ factor: 'Tier-3 City', impact: 'Mildly Protective',
      detail: 'Lower cost of living reduces monthly burn rate' });
  }

  /* ── 3e. Age bracket ─────────────────────────────────────── */
  if (age > 50) {
    monthsRecommended += 1; riskScore += 10;
    riskFactors.push({ factor: 'Pre-Retirement Phase (50+)', impact: 'Medium',
      detail: 'Less time to rebuild depleted savings before retirement' });
  } else if (age < 27) {
    riskScore -= 5;
    protectiveFactors.push({ factor: 'Young Age Advantage', impact: 'Mildly Protective',
      detail: 'More working years to recover if savings are depleted' });
  }

  /* ── 3f. Health insurance gap ────────────────────────────── */
  if (!insured) {
    monthsRecommended += 1; riskScore += 18;
    riskFactors.push({ factor: 'No Health Insurance', impact: 'High',
      detail: 'Medical emergencies are the #1 cause of financial ruin in India — bills of ₹2–10L are common' });
  } else {
    protectiveFactors.push({ factor: 'Health Insurance Active', impact: 'Protective',
      detail: 'Insurance absorbs catastrophic medical expense risk' });
  }

  /* ── 3g. Rent vs own ─────────────────────────────────────── */
  if (rentOrOwn === 'rent') {
    riskScore += 5;
    riskFactors.push({ factor: 'Renting', impact: 'Low',
      detail: 'Monthly rent is a fixed obligation even during income loss' });
  } else {
    protectiveFactors.push({ factor: 'Home Owner', impact: 'Mildly Protective',
      detail: 'Owning removes rent as a mandatory expense during crisis' });
  }

  /* ── 3h. Savings / expense ratio ── (weight ~40%) ─────────── */
  if (expenseRatio > 0.85) {
    riskScore += 20;
    riskFactors.push({ factor: 'Very Low Savings Rate', impact: 'High',
      detail: 'Spending >85% of income leaves little room to build the fund' });
  } else if (expenseRatio < 0.55) {
    protectiveFactors.push({ factor: 'Strong Savings Rate', impact: 'Protective',
      detail: `Spending only ${(expenseRatio * 100).toFixed(0)}% of income — great position to build this fund fast` });
  }

  /* ── 3i. Life stage bonus ────────────────────────────────── */
  if (lifeStage === 'married_with_kids' || lifeStage === 'single_parent' || lifeStage === 'family') {
    monthsRecommended += 1; riskScore += 8;
  }

  // ── 4. Clamp & final figures ─────────────────────────────────
  monthsRecommended = Math.min(15, Math.max(3, monthsRecommended));
  riskScore         = Math.min(100, Math.max(0, Math.round(riskScore)));

  // Apply city cost multiplier to the fund target
  const targetFund   = Math.round(totalObligations * monthsRecommended * cityMultiplier);
  const savingsGap   = Math.max(0, targetFund - savings);
  const percentFunded= targetFund > 0 ? Math.min(100, Math.round((savings / targetFund) * 100)) : 100;
  const monthsCovered= totalObligations > 0 ? Math.min(99, parseFloat((savings / totalObligations).toFixed(1))) : 99;

  // Adjust risk score based on actual funding state
  const adjustedScore = savings >= targetFund
    ? Math.max(10, riskScore - 28)                      // fully funded → lower risk
    : monthsCovered < 1
      ? Math.min(100, riskScore + 22)                   // dangerously underfunded → higher
      : riskScore;

  // Derive risk level & colour
  const { level: riskLevel, color: riskColor } =
    RISK_LEVELS.find(r => adjustedScore <= r.max) ?? RISK_LEVELS[RISK_LEVELS.length - 1];

  // Monthly savings recommendation (≥10% of income, max 60% of surplus)
  const suggestedMonthly = surplus > 0
    ? Math.max(Math.round(income * 0.10), Math.round(surplus * 0.60))
    : Math.round(income * 0.10);

  const monthsToGoal = savingsGap > 0 && suggestedMonthly > 0
    ? Math.ceil(savingsGap / suggestedMonthly)
    : 0;

  // ── 5. Investment split across 3 tiers ───────────────────────
  const investmentSplit = [
    {
      type: 'High-Yield Savings Account', percentage: 30,
      amount:  Math.round(targetFund * 0.30),
      reason:  'Instant access — covers first month of any emergency',
      liquidity: 'Instant', expectedReturn: '3.5–7% p.a.',
      examples: 'SBI Wecare, Kotak 811, IDFC First Bank',
    },
    {
      type: 'Liquid Mutual Fund', percentage: 40,
      amount:  Math.round(targetFund * 0.40),
      reason:  'Core reserve with T+1 redemption and better returns',
      liquidity: '1 Business Day', expectedReturn: '6.5–7.5% p.a.',
      examples: 'Parag Parikh Liquid, Axis Liquid Fund',
    },
    {
      type: 'Short-Term FD (3–6 month ladder)', percentage: 30,
      amount:  Math.round(targetFund * 0.30),
      reason:  'Deeper buffer for extended emergencies; break in tranches',
      liquidity: '3–7 Days', expectedReturn: '7.5–8.25% p.a.',
      examples: 'Stagger across 3-month tranches at 2–3 banks',
    },
  ];

  // ── 6. 3-Tier architecture breakdown ─────────────────────────
  const tier1M = 1;
  const tier2M = Math.max(1, Math.round((monthsRecommended - tier1M) * 0.55));
  const tier3M = Math.max(1, Math.round(monthsRecommended - tier1M - tier2M));

  const tiers = [
    { name: 'Tier 1 — Instant Cash',   months: tier1M, amount: Math.round(totalObligations * tier1M),
      purpose: 'Rent, groceries, utilities in first month of crisis',
      where: 'High-yield savings account', accessTime: 'Instant', color: '#059669' },
    { name: 'Tier 2 — Liquid Reserve', months: tier2M, amount: Math.round(totalObligations * tier2M),
      purpose: 'Extended job search, medical bills, major repairs',
      where: 'Liquid Mutual Fund',        accessTime: '1 business day', color: '#4338ca' },
    { name: 'Tier 3 — Deep Buffer',    months: tier3M, amount: Math.round(totalObligations * tier3M),
      purpose: 'Career transition, serious illness, family emergency',
      where: 'Short-term FD ladder',      accessTime: '3–7 days', color: '#d97706' },
  ];

  // ── 7. 12-month savings projection ───────────────────────────
  const projection = [];
  let runningBalance = savings;
  for (let i = 0; i <= 12; i++) {
    projection.push({
      month:        i === 0 ? 'Now' : `M${i}`,
      balance:      Math.round(runningBalance),
      target:       targetFund,
      gap:          Math.max(0, targetFund - runningBalance),
      percentFunded:Math.min(100, Math.round((runningBalance / targetFund) * 100)),
    });
    runningBalance += suggestedMonthly;
  }

  // ── 8. Contextual insights ────────────────────────────────────
  const insights = [];

  if (savingsGap > 0) {
    insights.push({ severity: 'warning', category: 'Funding Gap',
      message: `You need ₹${savingsGap.toLocaleString('en-IN')} more to reach your target. Saving ₹${suggestedMonthly.toLocaleString('en-IN')}/month closes this gap in ${monthsToGoal} month${monthsToGoal !== 1 ? 's' : ''}.` });
  } else {
    insights.push({ severity: 'success', category: 'Goal Met',
      message: `Outstanding! Your emergency reserve is fully funded. Redirect your monthly surplus (₹${surplus.toLocaleString('en-IN')}) to equity mutual funds or NPS.` });
  }

  if (['freelancer', 'business', 'gig'].includes(jobKey)) {
    insights.push({ severity: 'info', category: 'Income Volatility',
      message: `${jobData.label}s experience income gaps regularly. Your ${monthsRecommended.toFixed(1)}-month target accounts for lean periods. Keep a separate 1-month income buffer at all times.` });
  }

  if (emiRatio > 0.30) {
    insights.push({ severity: 'warning', category: 'Debt Load',
      message: `EMI at ${(emiRatio * 100).toFixed(0)}% of income is above the safe threshold. Use the debt avalanche method — minimums on all loans, then extra cash to the highest-interest one.` });
  }

  if (!insured) {
    insights.push({ severity: 'danger', category: 'Insurance Gap',
      message: `83% of Indian households face financial hardship from medical emergencies. A ₹5–10L family floater costs ₹700–1,200/month. Get this before building beyond Tier 1.` });
  }

  if (monthsCovered < 1) {
    insights.push({ severity: 'danger', category: 'Critical Buffer',
      message: `Current savings cover only ${monthsCovered.toFixed(1)} months of expenses. Pause all non-essential spending and redirect everything here today.` });
  } else if (monthsCovered < 3) {
    insights.push({ severity: 'warning', category: 'Below Minimum',
      message: `${monthsCovered.toFixed(1)} months covered — below the 3-month baseline. A single unexpected event could put you in debt.` });
  }

  if (deps >= 2) {
    insights.push({ severity: 'info', category: 'Life Insurance',
      message: `With ${deps} dependents, verify your term life cover is 10–15× annual income (≈₹${((income * 12) * 12).toLocaleString('en-IN')}).` });
  }

  if (percentFunded >= 80 && savingsGap > 0) {
    insights.push({ severity: 'info', category: 'Almost There',
      message: `You're ${percentFunded}% funded — only ₹${savingsGap.toLocaleString('en-IN')} away. A bonus, tax refund, or one-time transfer could close this instantly.` });
  }

  // ── 9. Priority action steps ──────────────────────────────────
  const actionSteps = [];

  if (!insured) {
    actionSteps.push({
      title: 'Get Health Insurance — Urgent',
      description: 'A ₹5–10L floater policy typically costs ₹8,000–15,000/year. Uninsured medical emergencies are the #1 cause of financial ruin.',
      action: 'Apply for a family floater health policy this week',
      urgency: 'critical',
    });
  }

  actionSteps.push({
    title: 'Open Dedicated Emergency Account',
    description: 'Keep this fund in a completely separate account from your spending account. Prevents accidental dipping.',
    action: `Park ₹${totalObligations.toLocaleString('en-IN')} in a high-yield savings account as Tier 1`,
    urgency: 'high',
  });

  actionSteps.push({
    title: 'Automate Monthly Contributions',
    description: 'A standing instruction moves money before you can spend it. Automation is the most reliable savings system.',
    action: `Set standing instruction for ₹${suggestedMonthly.toLocaleString('en-IN')}/month to your emergency fund`,
    urgency: 'high',
  });

  if (emiRatio > 0.35) {
    actionSteps.push({
      title: 'Reduce High-Interest Debt',
      description: 'Elevated EMI ratio increases your monthly burn. Any windfall should prepay your highest-rate loan.',
      action: 'Apply bonus / tax refund to prepay highest-interest loan first',
      urgency: 'medium',
    });
  }

  actionSteps.push({
    title: 'Build Tier 2 with Liquid Mutual Fund',
    description: 'Liquid MFs deliver 6–7% returns vs 3–4% in savings accounts, with T+1 redemption. Build this after Tier 1 is complete.',
    action: `Start Liquid MF SIP of ₹${Math.round(suggestedMonthly * 0.40).toLocaleString('en-IN')}/month`,
    urgency: 'medium',
  });

  actionSteps.push({
    title: 'Review Every 6 Months',
    description: 'Recalculate your target whenever income, EMI, or family size changes. This should grow with you.',
    action: 'Set a recurring calendar reminder to recalculate every 6 months',
    urgency: 'low',
  });

  // ── 10. Benchmark comparisons ─────────────────────────────────
  const benchmarks = {
    nationalAvgMonths:  2.3,
    nationalAvgFund:    totalObligations * 2.3,
    userMonthsCovered:  monthsCovered,
    recommendedMonths:  parseFloat(monthsRecommended.toFixed(1)),
    nationalAverage:    Math.round(totalObligations * 2.3),
    typicalMin:         3,
    typicalMax:         6,
    percentileRank:
      monthsCovered >= 12 ? 97 :
      monthsCovered >= 6  ? 88 :
      monthsCovered >= 3  ? 62 :
      monthsCovered >= 1  ? 32 : 11,
  };

  // ── 11. AI narrative summary (rule-based; Groq upgrades this) ─
  const jobLabel = jobData.label;
  const cityDesc = { '1': 'Tier-1 metro', '2': 'Tier-2 city', '3': 'Tier-3 town' }[cityTier] ?? 'your city';
  const depStr   = deps > 0 ? ` with ${deps} financial dependent${deps > 1 ? 's' : ''}` : '';

  let riskSummary;
  if (adjustedScore >= 70) {
    riskSummary = `As a ${jobLabel} in a ${cityDesc}${depStr}, your financial safety net carries significant risk. Current savings cover only ${monthsCovered.toFixed(1)} months — well below the ${monthsRecommended.toFixed(1)}-month target. Without an adequate buffer, a single income disruption or medical emergency could force expensive personal loans at 36%+ interest. Building this fund is your highest-priority financial action right now.`;
  } else if (adjustedScore >= 40) {
    riskSummary = `As a ${jobLabel} in a ${cityDesc}${depStr}, you have moderate financial resilience. Your savings cover ${monthsCovered.toFixed(1)} months today; target is ${monthsRecommended.toFixed(1)} months. Consistent contributions of ₹${suggestedMonthly.toLocaleString('en-IN')}/month will close the gap. Address the key risk factors above to improve your score.`;
  } else {
    riskSummary = `As a ${jobLabel} in a ${cityDesc}${depStr}, you're in a strong financial position. Savings already cover ${monthsCovered.toFixed(1)} months — meeting or exceeding the ${monthsRecommended.toFixed(1)}-month target. Focus now on optimising your 3-tier split for the best balance of liquidity and returns, and review annually.`;
  }

  // ── 12. Assemble final response ───────────────────────────────
  return {
    // Spec-required fields
    emergencyFund:          targetFund,
    survivalMonths,
    riskScore:              adjustedScore,
    riskLevel,

    // Extended calculation fields (used by the dashboard)
    recommendedFund:        targetFund,
    monthsRecommended:      parseFloat(monthsRecommended.toFixed(1)),
    riskColor,
    monthsCovered,
    percentFunded,
    savingsGap,
    surplusIncome:          surplus,
    suggestedMonthly,
    monthsToGoal,
    totalMonthlyObligations:totalObligations,

    // Analysis blocks
    insights,
    riskFactors,
    protectiveFactors,
    actionSteps,
    benchmarks,
    investmentSplit,
    tiers,
    projection,
    riskSummary,

    // Raw inputs echoed back (useful for history cards)
    inputs: {
      monthlyIncome:       income,
      monthlyExpenses:     expenses,
      emi:                 emiAmt,
      savings,
      jobType:             jobLabel,
      cityTier,
      dependents:          deps,
      age,
      lifeStage,
      hasHealthInsurance:  insured,
      rentOrOwn,
    },
  };
}

module.exports = { calculateEmergencyFund };
