/**
 * routes/analyze.js
 * POST /api/analyze   → full AI-powered analysis
 * POST /api/calculate → backward-compatible alias (calc only, no AI)
 */

'use strict';

const router = require('express').Router();
const { analyze, calculate } = require('../controllers/analyzeController');

/**
 * @route  POST /api/analyze
 * @desc   Run full financial analysis + AI insights via Groq
 * @access Public
 *
 * Body (application/json):
 *   monthlyIncome    {number} required  — or alias: income
 *   monthlyExpenses  {number} required  — or alias: expenses
 *   emi              {number} optional  default 0
 *   savings          {number} optional  default 0
 *   jobType          {string} optional  govt|corporate|freelancer|business|gig
 *   dependents       {number} optional  0–10
 *   cityTier         {string} optional  1|2|3  — or alias: cityType
 *   age              {number} optional  18–90
 *   lifeStage        {string} optional  — or alias: lifestyle
 *   hasHealthInsurance {string} optional yes|partial|no
 *   rentOrOwn        {string} optional  rent|own_loan|own_free
 */
router.post('/analyze', analyze);

/**
 * @route  POST /api/calculate
 * @desc   Pure financial calculations (no Groq call) — fast, synchronous
 * @access Public
 */
router.post('/calculate', calculate);

module.exports = router;
