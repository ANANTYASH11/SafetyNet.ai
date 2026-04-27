/**
 * routes/history.js
 * POST /api/save          → save a record (MongoDB or file fallback)
 * POST /api/history/save  → alias for backward compatibility with the frontend
 * GET  /api/history       → paginated list of saved records
 */

'use strict';

const router = require('express').Router();
const { save, getHistory } = require('../controllers/historyController');

/**
 * @route  POST /api/save
 * @desc   Persist an analysis result to MongoDB (or data.json fallback)
 * @access Public
 */
router.post('/save', save);

/**
 * @route  POST /api/history/save
 * @desc   Alias kept for existing frontend calls
 * @access Public
 */
router.post('/history/save', save);

/**
 * @route  GET /api/history
 * @desc   Fetch past records — paginated
 * @access Public
 *
 * Query params:
 *   page  {number}  default 1
 *   limit {number}  default 20, max 100
 */
router.get('/history', getHistory);

module.exports = router;
