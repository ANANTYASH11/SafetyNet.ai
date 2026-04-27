/**
 * services/mlService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SafetyNet.ai — XGBoost ML Model Client
 *
 * Calls the Python Flask ML service (port 5002) which serves the trained
 * XGBoost models. Falls back gracefully if the service is unavailable.
 *
 * Returns:
 *   { mlRiskScore, mlRiskLevel, confidence, probabilities, source }
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const axios  = require('axios');
const logger = require('../config/logger');

const ML_URL     = process.env.ML_SERVICE_URL || 'http://localhost:5002';
const TIMEOUT_MS = parseInt(process.env.ML_TIMEOUT_MS || '4000', 10);

/**
 * Get XGBoost ML prediction for the given input profile.
 *
 * @param {object} inputs  Raw request body (same shape as sent to /api/analyze)
 * @returns {object}       { mlRiskScore, mlRiskLevel, confidence, probabilities, source }
 */
async function getMLPrediction(inputs) {
  try {
    const response = await axios.post(`${ML_URL}/predict`, inputs, {
      headers: { 'Content-Type': 'application/json' },
      timeout: TIMEOUT_MS,
    });

    const d = response.data;
    if (!d.success) throw new Error('ML service returned failure');

    logger.info('ML prediction received', {
      mlRiskScore: d.mlRiskScore,
      mlRiskLevel: d.mlRiskLevel,
      confidence:  d.confidence,
      ms:          d.ms,
    });

    return {
      mlRiskScore:   d.mlRiskScore,
      mlRiskLevel:   d.mlRiskLevel,
      confidence:    d.confidence,
      probabilities: d.probabilities,
      source:        'xgboost',
    };

  } catch (err) {
    const reason =
      err.code === 'ECONNREFUSED' ? 'ml_service_offline' :
      err.code === 'ECONNABORTED' ? 'ml_service_timeout' :
      'ml_service_error';

    logger.warn('ML service unavailable — skipping ML prediction', {
      reason,
      error: err.message,
    });

    return { source: 'unavailable' };
  }
}

/**
 * Check whether the ML service is reachable.
 * @returns {boolean}
 */
async function isMLServiceHealthy() {
  try {
    const r = await axios.get(`${ML_URL}/health`, { timeout: 2000 });
    return r.data?.models_loaded === true;
  } catch {
    return false;
  }
}

module.exports = { getMLPrediction, isMLServiceHealthy };
