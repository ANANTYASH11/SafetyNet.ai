'use strict';

const fs           = require('fs');
const path         = require('path');
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const logger       = require('../config/logger');
const { sendWelcomeEmail } = require('../services/emailService');

const USERS_FILE = path.join(__dirname, '..', 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'safetynet-ai-jwt-secret-2025';
const JWT_EXPIRY = '7d';

/* ── File helpers ──────────────────────────────────────────────── */

function readUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (e) { logger.error('users.json read error', { error: e.message }); }
  return [];
}

function writeUsers(users) {
  try { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8'); }
  catch (e) { logger.error('users.json write error', { error: e.message }); }
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

function sanitize(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt };
}

/* ── POST /api/auth/register ───────────────────────────────────── */

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    const emailLc = email.toLowerCase().trim();
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(emailLc)) {
      return res.status(400).json({ success: false, error: 'Invalid email address' });
    }

    const users = readUsers();
    if (users.find(u => u.email === emailLc)) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = {
      id:           `u_${Date.now()}`,
      name:         name.trim(),
      email:        emailLc,
      passwordHash: hash,
      role:         users.length === 0 ? 'admin' : 'user',  // first user → admin
      createdAt:    new Date().toISOString(),
      analysesCount: 0,
    };

    users.push(user);
    writeUsers(users);
    logger.info('User registered', { email: user.email, role: user.role });

    // Send welcome email in background — non-blocking
    sendWelcomeEmail(user.email, user.name);

    return res.status(201).json({ success: true, token: signToken(user), user: sanitize(user) });
  } catch (e) {
    logger.error('Register error', { error: e.message });
    return res.status(500).json({ success: false, error: 'Registration failed' });
  }
};

/* ── POST /api/auth/login ──────────────────────────────────────── */

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const users = readUsers();
    const user  = users.find(u => u.email === email.toLowerCase().trim());

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    logger.info('User logged in', { email: user.email });
    return res.json({ success: true, token: signToken(user), user: sanitize(user) });
  } catch (e) {
    logger.error('Login error', { error: e.message });
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
};

/* ── GET /api/auth/me ──────────────────────────────────────────── */

const me = (req, res) => res.json({ success: true, user: req.user });

/* ── POST /api/auth/admin-login ─────────────────────────────────── */
// Like login, but rejects non-admin accounts with a 403.
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const users = readUsers();
    const user  = users.find(u => u.email === email.toLowerCase().trim());

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'This account does not have admin privileges' });
    }

    logger.info('Admin login', { email: user.email });
    return res.json({ success: true, token: signToken(user), user: sanitize(user) });
  } catch (e) {
    logger.error('Admin login error', { error: e.message });
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
};

module.exports = { register, login, me, adminLogin };
