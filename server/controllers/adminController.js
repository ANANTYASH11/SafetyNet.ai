'use strict';

const fs     = require('fs');     // already used in new endpoints below
const path   = require('path');
const logger = require('../config/logger');

const USERS_FILE = path.join(__dirname, '..', 'users.json');
const DATA_FILE  = path.join(__dirname, '..', 'data.json');

function readUsers() {
  try { if (fs.existsSync(USERS_FILE)) return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
  catch (e) { logger.error('admin readUsers error', { error: e.message }); }
  return [];
}

function readData() {
  try { if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch (e) {}
  return [];
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

/* ── GET /api/admin/stats ──────────────────────────────────────── */

const getStats = (req, res) => {
  try {
    const users   = readUsers();
    const records = readData();
    const today   = new Date().toDateString();

    const todayCount = records.filter(r => {
      const d = r.savedAt || r.createdAt || r.timestamp;
      return d && new Date(d).toDateString() === today;
    }).length;

    const scores = records.map(r => r.riskScore).filter(s => typeof s === 'number');
    const avgRisk = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const riskDist = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    records.forEach(r => { if (r.riskLevel && riskDist[r.riskLevel] !== undefined) riskDist[r.riskLevel]++; });

    const totalFunds = records.map(r => r.recommendedFund).filter(f => typeof f === 'number');
    const avgFund    = totalFunds.length ? Math.round(totalFunds.reduce((a, b) => a + b, 0) / totalFunds.length) : 0;

    return res.json({
      success: true,
      stats: {
        totalUsers:       users.length,
        totalAnalyses:    records.length,
        analysesToday:    todayCount,
        avgRiskScore:     avgRisk,
        avgFundTarget:    avgFund,
        riskDistribution: riskDist,
        adminCount:       users.filter(u => u.role === 'admin').length,
      },
    });
  } catch (e) {
    logger.error('Admin stats error', { error: e.message });
    return res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

/* ── GET /api/admin/users ──────────────────────────────────────── */

const getUsers = (req, res) => {
  try {
    const users = readUsers().map(u => ({
      id:            u.id,
      name:          u.name,
      email:         u.email,
      role:          u.role,
      createdAt:     u.createdAt,
      analysesCount: u.analysesCount || 0,
    }));
    return res.json({ success: true, users });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};

/* ── GET /api/admin/analyses ───────────────────────────────────── */

const getRecentAnalyses = (req, res) => {
  try {
    const limit   = Math.min(parseInt(req.query.limit) || 50, 100);
    const records = readData().slice(-limit).reverse().map(r => ({
      id:           r._id || r.id,
      riskScore:    r.riskScore,
      riskLevel:    r.riskLevel,
      fund:         r.recommendedFund,
      monthsCovered:r.monthsCovered,
      jobType:      r.inputs?.jobType,
      income:       r.inputs?.monthlyIncome,
      cityTier:     r.inputs?.cityTier,
      savedAt:      r.savedAt || r.createdAt,
      aiSource:     r.aiSource,
    }));
    return res.json({ success: true, records, total: readData().length });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to fetch analyses' });
  }
};

/* ── PATCH /api/admin/users/:id/role ───────────────────────────── */
const patchUserRole = (req, res) => {
  try {
    const { id }   = req.params;
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Role must be admin or user' });
    }
    const users = readUsers();
    const idx   = users.findIndex(u => u.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'User not found' });
    // Prevent demoting the only admin
    if (role === 'user' && users[idx].role === 'admin') {
      const admins = users.filter(u => u.role === 'admin').length;
      if (admins <= 1) return res.status(400).json({ success: false, error: 'Cannot demote the only admin' });
    }
    users[idx].role = role;
    writeUsers(users);
    return res.json({ success: true, user: { id: users[idx].id, name: users[idx].name, role } });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to update role' });
  }
};

/* ── DELETE /api/admin/users/:id ─────────────────────────────── */
const removeUser = (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id === id) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own account' });
    }
    const users  = readUsers();
    const target = users.find(u => u.id === id);
    if (!target) return res.status(404).json({ success: false, error: 'User not found' });
    if (target.role === 'admin') {
      const admins = users.filter(u => u.role === 'admin').length;
      if (admins <= 1) return res.status(400).json({ success: false, error: 'Cannot delete the only admin' });
    }
    writeUsers(users.filter(u => u.id !== id));
    return res.json({ success: true, deletedId: id });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
};

/* ── GET /api/admin/system ───────────────────────────────────── */
const getSystemHealth = (req, res) => {
  try {
    const users   = readUsers();
    const records = readData();
    const uStat   = fs.existsSync(USERS_FILE) ? fs.statSync(USERS_FILE) : null;
    const dStat   = fs.existsSync(DATA_FILE)  ? fs.statSync(DATA_FILE)  : null;
    return res.json({
      success: true,
      system: {
        uptime:          Math.round(process.uptime()),
        nodeVersion:     process.version,
        platform:        process.platform,
        memoryMB:        Math.round(process.memoryUsage().heapUsed / 1048576),
        userCount:       users.length,
        adminCount:      users.filter(u => u.role === 'admin').length,
        demoCount:       users.filter(u => u.isDemo).length,
        recordCount:     records.length,
        usersFileSizeKB: uStat ? Math.round(uStat.size / 1024) : 0,
        dataFileSizeKB:  dStat ? Math.round(dStat.size / 1024) : 0,
        lastRecord:      records.length > 0 ? (records[records.length - 1]?.savedAt || null) : null,
        serverTime:      new Date().toISOString(),
        port:            process.env.PORT || 5001,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to fetch system info' });
  }
};

module.exports = { getStats, getUsers, getRecentAnalyses, patchUserRole, removeUser, getSystemHealth };
