/**
 * controllers/analyzeController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles POST /api/analyze  (primary endpoint)
 *       POST /api/calculate  (backward-compatible alias — no AI, instant response)
 *
 * Flow for /api/analyze:
 *  1. Validate & normalise inputs
 *  2. Run financial calculation engine (sync, fast)
 *  3. Call Groq AI for insights (async, 8s timeout, auto-fallback)
 *  4. Return structured JSON with both spec fields and full dashboard data
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const calculationService = require('../services/calculationService');
const aiService          = require('../services/aiService');
const mlService          = require('../services/mlService');
const logger             = require('../config/logger');

/* ── Input validation ─────────────────────────────────────────── */

/**
 * Returns an array of error strings.
 * Empty array = valid.
 */
function validateInputs(body) {
  const errors = [];

  const income   = Number(body.monthlyIncome ?? body.income);
  const expenses = Number(body.monthlyExpenses ?? body.expenses);

  // Required fields
  if (body.monthlyIncome === undefined && body.income === undefined) {
    errors.push('monthlyIncome is required');
  } else if (isNaN(income) || income <= 0) {
    errors.push('monthlyIncome must be a positive number');
  }

  if (body.monthlyExpenses === undefined && body.expenses === undefined) {
    errors.push('monthlyExpenses is required');
  } else if (isNaN(expenses) || expenses < 0) {
    errors.push('monthlyExpenses must be a non-negative number');
  }

  if (!isNaN(income) && !isNaN(expenses) && expenses > income * 5) {
    errors.push('monthlyExpenses seems unrealistically high relative to income');
  }

  // Optional field constraints
  if (body.emi !== undefined && Number(body.emi) < 0) {
    errors.push('emi cannot be negative');
  }
  if (body.savings !== undefined && Number(body.savings) < 0) {
    errors.push('savings cannot be negative');
  }
  if (body.dependents !== undefined) {
    const d = Number(body.dependents);
    if (isNaN(d) || d < 0 || d > 10) errors.push('dependents must be between 0 and 10');
  }
  if (body.age !== undefined) {
    const a = Number(body.age);
    if (isNaN(a) || a < 18 || a > 90) errors.push('age must be between 18 and 90');
  }

  return errors;
}

/** Normalise field name aliases so the service always sees the same shape */
function normaliseBody(raw) {
  return {
    monthlyIncome:      raw.income      ?? raw.monthlyIncome,
    monthlyExpenses:    raw.expenses    ?? raw.monthlyExpenses,
    emi:                raw.emi         ?? 0,
    savings:            raw.savings     ?? 0,
    jobType:            raw.jobType     ?? 'corporate',
    dependents:         raw.dependents  ?? 0,
    cityTier:           raw.cityType    ?? raw.cityTier ?? '2',
    age:                raw.age         ?? 30,
    lifeStage:          raw.lifestyle   ?? raw.lifeStage ?? 'mid_career',
    hasHealthInsurance: raw.hasHealthInsurance ?? 'no',
    rentOrOwn:          raw.rentOrOwn   ?? 'rent',
  };
}

/* ── POST /api/analyze ────────────────────────────────────────── */

const analyze = async (req, res) => {
  const t0 = Date.now();

  try {
    const body = normaliseBody(req.body);

    // 1. Validate
    const errors = validateInputs(body);
    if (errors.length) {
      logger.warn('Validation failed on /api/analyze', { errors, ip: req.ip });
      return res.status(422).json({
        success: false,
        error:   'Validation failed',
        details: errors,
      });
    }

    // 2. Financial calculations (synchronous — typically <5ms)
    logger.debug('Running calculation engine', {
      income:   body.monthlyIncome,
      expenses: body.monthlyExpenses,
    });
    const calcResult = calculationService.calculateEmergencyFund(body);

    // 3. Run Groq AI insights + XGBoost ML prediction in PARALLEL
    const [aiResult, mlResult] = await Promise.all([
      aiService.generateAIInsights(calcResult, body),
      mlService.getMLPrediction(body),
    ]);

    // 4. Agreement signal: compare rule-based vs ML risk levels
    const mlAgreement = mlResult.source === 'xgboost'
      ? mlResult.mlRiskLevel === calcResult.riskLevel
        ? 'agree'
        : 'disagree'
      : 'unavailable';

    // 5. Build unified response
    const response = {
      // ── Full dashboard fields (spread first) ─────────────────
      ...calcResult,

      // ── Spec-required fields (override spread) ───────────────
      success:        true,
      emergencyFund:  calcResult.recommendedFund,
      survivalMonths: calcResult.survivalMonths,
      riskScore:      calcResult.riskScore,
      riskLevel:      calcResult.riskLevel,
      insights:       aiResult.insights,
      suggestions:    aiResult.suggestions,
      warnings:       aiResult.warnings,

      // ── Groq LLM metadata ────────────────────────────────────
      aiSource:       aiResult.source,

      // ── XGBoost ML prediction ────────────────────────────────
      ml: mlResult.source === 'xgboost' ? {
        riskScore:    mlResult.mlRiskScore,
        riskLevel:    mlResult.mlRiskLevel,
        confidence:   mlResult.confidence,
        probabilities: mlResult.probabilities,
        agreement:    mlAgreement,
        source:       'XGBoost (trained on 8,000 Indian household profiles)',
      } : null,

      generatedAt:    new Date().toISOString(),
      processingMs:   Date.now() - t0,
    };

    logger.info('Analysis complete', {
      riskLevel:    calcResult.riskLevel,
      riskScore:    calcResult.riskScore,
      aiSource:     aiResult.source,
      mlSource:     mlResult.source,
      mlAgreement,
      ms:           response.processingMs,
    });

    return res.json(response);

  } catch (err) {
    logger.error('Unexpected error in /api/analyze', { error: err.message, stack: err.stack });
    return res.status(500).json({
      success: false,
      error:   'Analysis failed. Please try again.',
    });
  }
};

/* ── POST /api/calculate (backward-compatible, no AI) ────────── */

const calculate = async (req, res) => {
  const t0 = Date.now();

  try {
    const body   = normaliseBody(req.body);
    const errors = validateInputs(body);

    if (errors.length) {
      return res.status(422).json({ success: false, error: 'Validation failed', details: errors });
    }

    const result = calculationService.calculateEmergencyFund(body);

    logger.debug('/api/calculate complete', { ms: Date.now() - t0 });
    return res.json({ success: true, ...result });

  } catch (err) {
    logger.error('Error in /api/calculate', { error: err.message });
    return res.status(500).json({ success: false, error: 'Calculation failed.' });
  }
};

module.exports = { analyze, calculate };
