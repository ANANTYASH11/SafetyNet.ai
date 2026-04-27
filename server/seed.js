'use strict';
/**
 * server/seed.js
 * Idempotent seeder – runs on every server start.
 * Only inserts users that don't already exist (matched by email).
 */

const fs     = require('fs');
const path   = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, 'users.json');

const DEMO_ACCOUNTS = [
  { email: 'admin@safetynet.ai', name: 'Admin',     password: 'Admin@123', role: 'admin' },
  { email: 'demo@safetynet.ai',  name: 'Demo User', password: 'Demo@123',  role: 'user'  },
];

/** Public list of demo credentials (no passwords exposed beyond what's shown on screen) */
const DEMO_CREDENTIALS = DEMO_ACCOUNTS.map(({ email, password, role }) => ({ email, password, role }));

async function seedDemoUsers(logger) {
  try {
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch {}
    }

    let seeded = 0;
    for (const acct of DEMO_ACCOUNTS) {
      if (users.find(u => u.email === acct.email)) continue; // already exists
      const hash = await bcrypt.hash(acct.password, 12);
      users.push({
        id:            `u_seed_${acct.role}_${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
        name:          acct.name,
        email:         acct.email,
        passwordHash:  hash,
        role:          acct.role,
        createdAt:     new Date().toISOString(),
        analysesCount: 0,
        isDemo:        true,
      });
      seeded++;
    }

    if (seeded > 0) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
      if (logger) logger.info(`Seeded ${seeded} demo user(s)`, { seeded: DEMO_ACCOUNTS.slice(0, seeded).map(a => a.email) });
    }
  } catch (e) {
    if (logger) logger.warn('Demo seed failed (non-fatal)', { error: e.message });
  }
}

module.exports = { seedDemoUsers, DEMO_CREDENTIALS };
