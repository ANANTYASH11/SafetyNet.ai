/**
 * controllers/historyController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles:
 *   POST /api/save           → persist an analysis record
 *   POST /api/history/save   → alias for backward compatibility
 *   GET  /api/history        → paginated list of past records
 *
 * Storage strategy:
 *   Primary  → MongoDB (when MONGO_URI is set and connection is live)
 *   Fallback → data.json flat file (always available, max 100 records)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const UserData = require('../models/UserData');
const { isMongoLive } = require('../config/db');
const logger  = require('../config/logger');

const FILE_PATH = path.join(__dirname, '..', 'data.json');
const FILE_MAX  = 100;

/* ── File-based helpers ───────────────────────────────────────── */

function readFile() {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    logger.error('data.json read error', { error: e.message });
  }
  return [];
}

function writeFile(records) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(records, null, 2), 'utf8');
  } catch (e) {
    logger.error('data.json write error', { error: e.message });
  }
}

/* ── POST /api/save  (and /api/history/save alias) ───────────── */

const save = async (req, res) => {
  try {
    const payload = req.body;

    // Accept both shaped { inputs, results } and a flat result blob
    const inputsData  = payload.inputs   ?? payload;
    const resultsData = payload.results  ?? payload;

    if (isMongoLive()) {
      // ── MongoDB path ──────────────────────────────────────────
      const doc = await UserData.create({
        inputs:  {
          monthlyIncome:      Number(inputsData.monthlyIncome  ?? inputsData.inputs?.monthlyIncome  ?? 0),
          monthlyExpenses:    Number(inputsData.monthlyExpenses ?? inputsData.inputs?.monthlyExpenses ?? 0),
          emi:                Number(inputsData.emi        ?? 0),
          savings:            Number(inputsData.savings    ?? 0),
          jobType:            String(inputsData.jobType    ?? 'corporate'),
          dependents:         Number(inputsData.dependents ?? 0),
          cityTier:           String(inputsData.cityTier   ?? '2'),
          age:                Number(inputsData.age        ?? 30),
          lifeStage:          String(inputsData.lifeStage  ?? 'mid_career'),
          hasHealthInsurance: String(inputsData.hasHealthInsurance ?? 'no'),
          rentOrOwn:          String(inputsData.rentOrOwn  ?? 'rent'),
        },
        results:    resultsData,
        aiInsights: {
          insights:    String(resultsData.insights    ?? ''),
          suggestions: Array.isArray(resultsData.suggestions) ? resultsData.suggestions : [],
          warnings:    Array.isArray(resultsData.warnings)    ? resultsData.warnings    : [],
          source:      String(resultsData.aiSource ?? 'fallback'),
        },
      });

      logger.info('Record saved to MongoDB', { id: doc._id });
      return res.status(201).json({ success: true, id: doc._id, savedAt: doc.savedAt });
    }

    // ── File fallback path ────────────────────────────────────
    const item = {
      id:      Date.now(),
      savedAt: new Date().toISOString(),
      ...payload,
    };

    const records = readFile();
    records.unshift(item);
    if (records.length > FILE_MAX) records.splice(FILE_MAX);
    writeFile(records);

    logger.info('Record saved to file', { id: item.id });
    return res.status(201).json({ success: true, item });

  } catch (err) {
    // Mongoose validation errors → 422 with field details
    if (err.name === 'ValidationError') {
      const details = Object.values(err.errors).map(e => e.message);
      logger.warn('Mongoose validation error on save', { details });
      return res.status(422).json({ success: false, error: 'Validation failed', details });
    }

    logger.error('Save failed', { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, error: 'Failed to save record.' });
  }
};

/* ── GET /api/history ─────────────────────────────────────────── */

const getHistory = async (req, res) => {
  // Query params: ?page=1&limit=20
  const page  = Math.max(1, parseInt(req.query.page  ?? '1',  10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? '20', 10)));

  try {
    if (isMongoLive()) {
      // ── MongoDB path ──────────────────────────────────────────
      const result = await UserData.getHistory(page, limit);
      logger.info('History fetched from MongoDB', { count: result.data.length, total: result.total });
      return res.json({ success: true, ...result });
    }

    // ── File fallback path ────────────────────────────────────
    const all    = readFile();
    const skip   = (page - 1) * limit;
    const paged  = all.slice(skip, skip + limit);

    logger.info('History fetched from file', { count: paged.length });
    // Return flat array for frontend backward-compatibility
    return res.json(paged);

  } catch (err) {
    logger.error('History fetch failed', { error: err.message });
    return res.status(500).json({ success: false, error: 'Failed to fetch history.' });
  }
};

module.exports = { save, getHistory };
