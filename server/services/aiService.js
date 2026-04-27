/**
 * services/aiService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Groq AI Integration — generates personalised financial insights.
 *
 * Strategy:
 *  1. If GROQ_API_KEY is present → call Groq chat completions API
 *  2. Parse the JSON response from the model
 *  3. On any failure (network, timeout, bad JSON, missing key) → fall back to
 *     the rule-based insight engine (always returns a useful response)
 *
 * The fallback is intentionally high-quality so the app feels "AI-powered"
 * even without a Groq key configured.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const axios  = require('axios');
const logger = require('../config/logger');

const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = process.env.GROQ_MODEL  || 'llama-3.1-8b-instant';
const TIMEOUT_MS   = parseInt(process.env.GROQ_TIMEOUT_MS || '8000', 10);

/* ─────────────────────────────────────────────────────────────── */

/**
 * Main export — returns { insights, suggestions, warnings, source }
 *
 * @param {object} calcResult  Full output from calculationService
 * @param {object} rawInputs   Normalised inputs (as sent to the calc engine)
 */
async function generateAIInsights(calcResult, rawInputs) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    logger.warn('GROQ_API_KEY not configured — using rule-based insight engine');
    return buildFallbackInsights(calcResult, rawInputs);
  }

  const prompt = buildPrompt(calcResult, rawInputs);

  try {
    logger.debug('Calling Groq API', { model: GROQ_MODEL, timeout: TIMEOUT_MS });

    const response = await axios.post(GROQ_URL, {
      model:       GROQ_MODEL,
      messages:    [{ role: 'user', content: prompt }],
      temperature: 0.35,          // lower = more deterministic financial advice
      max_tokens:  600,
      response_format: { type: 'json_object' },
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      timeout: TIMEOUT_MS,
    });

    const raw = response.data?.choices?.[0]?.message?.content;
    if (!raw) throw new Error('Groq returned an empty message content');

    const parsed = JSON.parse(raw);
    logger.info('Groq insights generated', { model: GROQ_MODEL });

    return {
      insights:    sanitiseString(parsed.insights),
      suggestions: sanitiseArray(parsed.suggestions),
      warnings:    sanitiseArray(parsed.warnings),
      source:      'groq',
    };

  } catch (err) {
    // Categorise the failure for better log context
    const reason =
      err.code === 'ECONNABORTED'  ? 'timeout'         :
      err.response?.status === 401 ? 'invalid_api_key' :
      err.response?.status === 429 ? 'rate_limited'    :
      err.message.includes('JSON') ? 'bad_json'        :
      'network_error';

    logger.error('Groq API call failed — activating fallback engine', {
      reason,
      status: err.response?.status,
      error:  err.message,
    });

    return buildFallbackInsights(calcResult, rawInputs);
  }
}

/* ── Private: build the Groq prompt ──────────────────────────── */

function buildPrompt(calc, inp) {
  const {
    riskLevel, riskScore, percentFunded, monthsCovered,
    monthsRecommended, surplusIncome, recommendedFund, savingsGap, suggestedMonthly,
  } = calc;

  const income   = Number(inp.monthlyIncome   ?? inp.income   ?? 0).toLocaleString('en-IN');
  const expenses = Number(inp.monthlyExpenses ?? inp.expenses ?? 0).toLocaleString('en-IN');
  const emi      = Number(inp.emi    ?? 0).toLocaleString('en-IN');
  const savings  = Number(inp.savings ?? 0).toLocaleString('en-IN');
  const city     = inp.cityTier === '1' ? 'Tier-1 Metro' : inp.cityTier === '3' ? 'Tier-3 Town' : 'Tier-2 City';

  return `You are a certified financial planner specialising in personal finance for Indian households.
Analyse this financial profile and respond with ONLY a valid JSON object (no markdown, no preamble).

## User Profile
- Monthly Income:          ₹${income}
- Monthly Expenses:        ₹${expenses}
- Monthly EMI / Debt:      ₹${emi}
- Current Liquid Savings:  ₹${savings}
- Employment Type:         ${inp.jobType ?? 'corporate'}
- Financial Dependents:    ${inp.dependents ?? 0}
- City:                    ${city}
- Has Health Insurance:    ${inp.hasHealthInsurance ?? 'no'}
- Risk Level:              ${riskLevel} (${riskScore}/100)
- Emergency Fund Target:   ₹${Number(recommendedFund).toLocaleString('en-IN')}
- Currently Funded:        ${percentFunded}% (${monthsCovered} months of ${monthsRecommended} months target)
- Monthly Surplus:         ₹${Number(surplusIncome).toLocaleString('en-IN')}
- Monthly Savings Goal:    ₹${Number(suggestedMonthly).toLocaleString('en-IN')}

## Response Format (valid JSON only)
{
  "insights": "2-3 sentence personalised assessment mentioning specific numbers from the profile",
  "suggestions": [
    "Concrete step 1 with specific amounts",
    "Concrete step 2",
    "Concrete step 3"
  ],
  "warnings": [
    "Specific risk or warning if risk score >= 50, otherwise empty array"
  ]
}`;
}

/* ── Private: rule-based fallback ─────────────────────────────── */

function buildFallbackInsights(calc, inp) {
  const {
    riskLevel, riskScore, percentFunded, monthsCovered, monthsRecommended,
    savingsGap, suggestedMonthly, surplusIncome, recommendedFund,
  } = calc;

  const income   = Number(inp.monthlyIncome ?? inp.income ?? 0);
  const emi      = Number(inp.emi ?? 0);
  const emiRatio = income > 0 ? emi / income : 0;
  const hasIns   = inp.hasHealthInsurance;
  const insured  = hasIns === true || hasIns === 'yes' || hasIns === 'partial';

  /* Insights paragraph */
  let insights;
  if (percentFunded >= 100) {
    insights = `Excellent work — your emergency fund fully covers the ${monthsRecommended}-month target. ` +
               `With ₹${Number(surplusIncome).toLocaleString('en-IN')} monthly surplus, redirect savings to equity mutual funds or NPS to build long-term wealth.`;
  } else if (riskScore >= 70) {
    insights = `Your financial position carries ${riskLevel.toLowerCase()} risk — current savings cover only ${monthsCovered} months against a ${monthsRecommended}-month target. ` +
               `At ₹${Math.round(Number(suggestedMonthly)).toLocaleString('en-IN')}/month, you can reach ₹${Number(recommendedFund).toLocaleString('en-IN')} in roughly ${Math.ceil(Number(savingsGap) / Number(suggestedMonthly))} months. This should be your top financial priority.`;
  } else if (riskScore >= 40) {
    insights = `You have moderate financial resilience with ${monthsCovered} months covered toward a ${monthsRecommended}-month goal. ` +
               `Consistent contributions of ₹${Math.round(Number(suggestedMonthly)).toLocaleString('en-IN')}/month will close the ₹${Number(savingsGap).toLocaleString('en-IN')} gap. Focus on the risk factors in your report.`;
  } else {
    insights = `Strong position — ${monthsCovered} months covered, meeting or exceeding the ${monthsRecommended}-month recommendation. ` +
               `Optimise your allocation across the 3-tier structure and review every 6 months as your income grows.`;
  }

  /* Actionable suggestions */
  const suggestions = [
    `Open a dedicated emergency savings account and automate ₹${Math.round(Number(suggestedMonthly)).toLocaleString('en-IN')}/month via standing instruction`,
    `Allocate 40% (₹${Math.round(Number(recommendedFund) * 0.40).toLocaleString('en-IN')}) of your target to a liquid mutual fund for T+1 access and better returns`,
    Number(surplusIncome) > 0
      ? `Direct ₹${Math.round(Number(surplusIncome) * 0.60).toLocaleString('en-IN')} of monthly surplus to the emergency fund until fully funded`
      : 'Audit subscriptions and discretionary spend — redirect ₹2,000–5,000/month to emergency savings',
  ];

  /* Targeted warnings */
  const warnings = [];
  if (!insured) {
    warnings.push('No health insurance: a single medical emergency can exhaust years of savings. Get a ₹5–10L family floater policy immediately.');
  }
  if (emiRatio > 0.40) {
    warnings.push(`EMI-to-income ratio at ${(emiRatio * 100).toFixed(0)}% is dangerously high. Use any windfalls (bonus, refund) to prepay high-interest loans.`);
  }
  if (monthsCovered < 1) {
    warnings.push('Savings cover less than 1 month of expenses — you are highly vulnerable to any financial shock. Treat this as a financial emergency.');
  }

  return { insights, suggestions, warnings, source: 'fallback' };
}

/* ── Helpers ─────────────────────────────────────────────────── */

function sanitiseString(val) {
  return typeof val === 'string' && val.trim() ? val.trim() : '';
}

function sanitiseArray(val) {
  if (!Array.isArray(val)) return [];
  return val.filter(v => typeof v === 'string' && v.trim()).map(v => v.trim());
}

module.exports = { generateAIInsights };
