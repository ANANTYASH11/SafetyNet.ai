/**
 * server/index.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SafetyNet.ai — AI Emergency Fund Calculator  |  Entry Point v3.0
 *
 * Architecture:
 *   config/logger.js    → structured logging
 *   config/db.js        → MongoDB connection (file fallback if unset)
 *   models/UserData.js  → Mongoose schema
 *   services/
 *     calculationService.js → financial intelligence engine
 *     aiService.js          → Groq API integration with fallback
 *   controllers/
 *     analyzeController.js  → POST /api/analyze, POST /api/calculate
 *     historyController.js  → POST /api/save, GET /api/history
 *   routes/
 *     analyze.js, history.js
 *
 * Endpoints:
 *   POST /api/analyze        — full AI analysis (new primary endpoint)
 *   POST /api/calculate      — calculation only, no AI (fast alias)
 *   POST /api/save           — persist a result (new)
 *   POST /api/history/save   — legacy alias
 *   GET  /api/history        — paginated saved records
 *   GET  /api/health         — service health check
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

// Load env vars FIRST — before any other require that reads process.env
require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const connectDB    = require('./config/db');
const logger       = require('./config/logger');
const analyzeRoutes= require('./routes/analyze');
const historyRoutes= require('./routes/history');
const authRoutes   = require('./routes/auth');
const adminRoutes  = require('./routes/admin');
const chatRoutes   = require('./routes/chat');

const app  = express();
const PORT = process.env.PORT || 5001;

// ── Security & parsing middleware ────────────────────────────────────────────
app.use(cors({
  origin:  process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));   // guard against large-payload attacks

// ── HTTP request logging (morgan → custom logger) ────────────────────────────
const morganFmt = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFmt, {
  stream: { write: (msg) => logger.http(msg.trim()) },
  skip:   (_req, res) => process.env.NODE_ENV === 'test',
}));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', analyzeRoutes);
app.use('/api', historyRoutes);
app.use('/api', authRoutes);
app.use('/api', adminRoutes);
app.use('/api', chatRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status:    'ok',
    version:   '3.0.0',
    db:        mongoose.connection.readyState === 1 ? 'mongodb' : 'file',
    env:       process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime:    Math.round(process.uptime()) + 's',
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    error:   process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const { seedDemoUsers } = require('./seed');

(async () => {
  await connectDB();        // attempt Mongo; logs its own status
  await seedDemoUsers(logger); // idempotent — adds missing demo accounts

  app.listen(PORT, () => {
    logger.info('═══════════════════════════════════════════════════');
    logger.info(`  SafetyNet.ai API  v3.0  —  port ${PORT}`);
    logger.info('  POST /api/analyze       → AI-powered analysis');
    logger.info('  POST /api/calculate     → calculation only');
    logger.info('  POST /api/save          → persist result');
    logger.info('  GET  /api/history       → saved records');
    logger.info('  POST /api/auth/register → create account');
    logger.info('  POST /api/auth/login    → login');
    logger.info('  GET  /api/auth/me       → verify token');
    logger.info('  GET  /api/admin/stats   → admin stats (admin only)');
    logger.info('  POST /api/chat          → AI chatbot');
    logger.info('  GET  /api/health        → service health');
    logger.info('═══════════════════════════════════════════════════');
  });
})();
