/**
 * test-all.js  —  Full backend endpoint test suite
 * Run: node test-all.js
 */

'use strict';

const http = require('http');

const BASE = 'http://localhost:5001';
let passed = 0;
let failed = 0;

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'localhost', port: 5001, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = http.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(BASE + path, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    }).on('error', reject);
  });
}

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✔  ${label}${detail ? '  →  ' + detail : ''}`);
    passed++;
  } else {
    console.error(`  ✘  ${label}${detail ? '  →  ' + detail : ''}`);
    failed++;
  }
}

async function run() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  SafetyNet.ai  —  Backend Test Suite');
  console.log('══════════════════════════════════════════════════════\n');

  const CALC_BODY = {
    monthlyIncome: 85000, monthlyExpenses: 45000, emi: 15000,
    savings: 120000, jobType: 'corporate', dependents: 1,
    cityTier: '1', age: 32,
  };

  // ── 1. Health ──────────────────────────────────────────────────────────────
  console.log('1.  GET /api/health');
  const { body: h } = await get('/api/health');
  check('status = ok',        h.status === 'ok',    h.status);
  check('version = 3.0.0',    h.version === '3.0.0', h.version);
  check('db field present',   ['mongodb','file'].includes(h.db), h.db);
  check('timestamp present',  !!h.timestamp);
  check('uptime present',     !!h.uptime, h.uptime);

  // ── 2. /api/calculate (no AI) ──────────────────────────────────────────────
  console.log('\n2.  POST /api/calculate');
  const { status: s2, body: c } = await post('/api/calculate', CALC_BODY);
  check('HTTP 200',           s2 === 200, String(s2));
  check('success: true',      c.success === true);
  check('riskLevel present',  typeof c.riskLevel === 'string', c.riskLevel);
  check('riskScore 0–100',    c.riskScore >= 0 && c.riskScore <= 100, String(c.riskScore));
  check('recommendedFund > 0',c.recommendedFund > 0, String(c.recommendedFund));
  check('emergencyFund > 0',  c.emergencyFund > 0, String(c.emergencyFund));
  check('survivalMonths > 0', c.survivalMonths > 0, String(c.survivalMonths));
  check('monthsCovered ≥ 0',  c.monthsCovered >= 0, String(c.monthsCovered));
  check('surplusIncome num',  typeof c.surplusIncome === 'number', String(c.surplusIncome));
  check('insights array',     Array.isArray(c.insights), `len=${c.insights?.length}`);
  check('actionSteps array',  Array.isArray(c.actionSteps), `len=${c.actionSteps?.length}`);
  check('projection array',   Array.isArray(c.projection), `len=${c.projection?.length}`);
  check('benchmarks object',  typeof c.benchmarks === 'object');
  check('tiers array',        Array.isArray(c.tiers), `len=${c.tiers?.length}`);
  check('investmentSplit arr',Array.isArray(c.investmentSplit), `len=${c.investmentSplit?.length}`);
  check('no AI fields',       c.aiSource === undefined, 'aiSource should be absent');

  // ── 3. /api/calculate — alias inputs (income/expenses) ────────────────────
  console.log('\n3.  POST /api/calculate  (alias field names: income/expenses/cityType)');
  const { status: s3, body: c3 } = await post('/api/calculate', {
    income: 85000, expenses: 45000, emi: 15000, savings: 120000,
    jobType: 'corporate', dependents: 1, cityType: '1', age: 32,
  });
  check('HTTP 200',           s3 === 200, String(s3));
  check('same riskScore',     c3.riskScore === c.riskScore, `${c3.riskScore} == ${c.riskScore}`);

  // ── 4. /api/analyze (AI endpoint) ─────────────────────────────────────────
  console.log('\n4.  POST /api/analyze  (AI endpoint with fallback)');
  const { status: s4, body: a } = await post('/api/analyze', CALC_BODY);
  check('HTTP 200',           s4 === 200, String(s4));
  check('success: true',      a.success === true);
  check('aiSource present',   ['groq','fallback'].includes(a.aiSource), a.aiSource);
  check('insights string',    typeof a.insights === 'string' && a.insights.length > 10);
  check('suggestions array',  Array.isArray(a.suggestions) && a.suggestions.length > 0, `len=${a.suggestions?.length}`);
  check('warnings array',     Array.isArray(a.warnings), `len=${a.warnings?.length}`);
  check('generatedAt present',!!a.generatedAt);
  check('processingMs ≥ 0',   a.processingMs >= 0, String(a.processingMs) + 'ms');
  check('riskLevel merged',   typeof a.riskLevel === 'string', a.riskLevel);
  check('emergencyFund merged',a.emergencyFund > 0, String(a.emergencyFund));

  // ── 5. /api/calculate — validation: missing income ────────────────────────
  console.log('\n5.  POST /api/calculate  (validation: missing monthlyIncome)');
  const { status: s5, body: v1 } = await post('/api/calculate', { monthlyExpenses: 30000 });
  check('HTTP 422',           s5 === 422, String(s5));
  check('success: false',     v1.success === false);
  check('error message',      typeof v1.error === 'string', v1.error);

  // ── 6. /api/calculate — validation: expenses > 5× income ──────────────────
  console.log('\n6.  POST /api/calculate  (validation: expenses > 5× income)');
  const { status: s6, body: v2 } = await post('/api/calculate', { monthlyIncome: 10000, monthlyExpenses: 60000 });
  check('HTTP 422',           s6 === 422, String(s6));
  check('error present',      typeof v2.error === 'string', v2.error);

  // ── 7. /api/save (new endpoint) ────────────────────────────────────────────
  console.log('\n7.  POST /api/save');
  const savePayload = { ...CALC_BODY, riskLevel: 'High', riskScore: 66, recommendedFund: 552240, aiSource: 'fallback' };
  const { status: s7, body: sv } = await post('/api/save', savePayload);
  check('HTTP 201',           s7 === 201, String(s7));
  check('success: true',      sv.success === true);
  check('id present',         !!sv.id || !!sv.item?.id, String(sv.id || sv.item?.id));

  // ── 8. /api/history/save (legacy alias) ────────────────────────────────────
  console.log('\n8.  POST /api/history/save  (legacy alias)');
  const { status: s8, body: lv } = await post('/api/history/save', savePayload);
  check('HTTP 201',           s8 === 201, String(s8));
  check('success: true',      lv.success === true);

  // ── 9. /api/history (GET) ─────────────────────────────────────────────────
  console.log('\n9.  GET /api/history');
  const { status: s9, body: hist } = await get('/api/history');
  check('HTTP 200',           s9 === 200, String(s9));
  const isArray = Array.isArray(hist);
  const isPaged = hist && typeof hist === 'object' && Array.isArray(hist.data);
  check('data returned',      isArray || isPaged, isArray ? `array[${hist.length}]` : `paged total=${hist.total}`);

  // ── 10. /api/history?page&limit ────────────────────────────────────────────
  console.log('\n10. GET /api/history?page=1&limit=2');
  const { status: s10, body: pg } = await get('/api/history?page=1&limit=2');
  check('HTTP 200',           s10 === 200, String(s10));
  const pgData = Array.isArray(pg) ? pg : pg.data;
  check('max 2 items',        pgData.length <= 2, `got ${pgData.length}`);

  // ── 11. 404 handler ────────────────────────────────────────────────────────
  console.log('\n11. GET /api/nonexistent  (404 handler)');
  const { status: s11, body: nf } = await get('/api/nonexistent');
  check('HTTP 404',           s11 === 404, String(s11));
  check('success: false',     nf.success === false);
  check('error message',      typeof nf.error === 'string', nf.error);

  // ── 12. Payload size guard (10 kb limit) ───────────────────────────────────
  console.log('\n12. POST /api/calculate  (oversized payload > 10kb)');
  try {
    const big = { monthlyIncome: 50000, monthlyExpenses: 30000, padding: 'x'.repeat(15000) };
    const { status: s12 } = await post('/api/calculate', big);
    check('HTTP 413 (blocked)', s12 === 413, String(s12));
  } catch {
    check('Connection rejected', true, 'payload too large — request rejected at TCP level');
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Results:  ${passed} passed  |  ${failed} failed`);
  console.log('══════════════════════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Test runner error:', err.message);
  process.exit(1);
});
