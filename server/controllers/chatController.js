/**
 * controllers/chatController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SafetyNet.ai — AI Chatbot Controller
 * Handles conversational queries about personal finance (India-focused).
 * Uses Groq LLaMA-3.3-70b with streaming-friendly single response.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const axios  = require('axios');
const logger = require('../config/logger');

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const TIMEOUT_MS = 12000;

const SYSTEM_PROMPT = `You are SafetyNet.ai's AI financial assistant — a friendly, knowledgeable guide specialised in Indian personal finance.

Your expertise:
- Emergency fund planning (RBI, SEBI, NHA benchmarks)
- Indian savings instruments: FDs, Liquid MFs, PPF, EPF, NPS, ELSS, SIPs
- Debt management, EMI calculations, debt-to-income ratios
- Insurance planning (health, term, life)
- Budget optimisation for Indian households
- Risk assessment for different income types (govt, corporate, freelancer, gig)
- City-wise cost of living differences (Tier 1/2/3 India)
- Tax-saving strategies under Indian Income Tax Act

Communication style:
- Be warm, concise, and non-judgmental
- Use ₹ (INR) for all amounts
- Keep answers under 180 words unless user explicitly asks for detail
- Give specific, actionable advice — not vague suggestions
- Include relevant numbers/benchmarks when useful
- End with ONE follow-up question to deepen the conversation

Important disclaimers:
- You provide educational information only, not SEBI-registered financial advice
- Do not recommend specific stocks or guarantee any returns
- Suggest consulting a SEBI-registered advisor for personalised investment planning

If user provides their financial analysis context, reference it naturally in your responses.`;

/**
 * POST /api/chat
 * Body: { message: string, history: [{role, content}], context?: object }
 */
async function chat(req, res) {
  const { message, history = [], context } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'message is required' });
  }
  if (message.length > 1000) {
    return res.status(400).json({ error: 'message too long (max 1000 chars)' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.json({
      reply: "I'm in offline mode — Groq API key not configured. Please add GROQ_API_KEY to your .env file to enable the AI assistant.",
      source: 'offline',
    });
  }

  /* Build messages array */
  const systemContent = context
    ? `${SYSTEM_PROMPT}\n\n--- USER'S FINANCIAL PROFILE ---\nRisk Level: ${context.riskLevel || 'N/A'} (Score: ${context.riskScore || 'N/A'}/100)\nTarget Emergency Fund: ₹${(context.recommendedFund || 0).toLocaleString('en-IN')}\nMonthly Income: ₹${((context.inputs?.monthlyIncome) || 0).toLocaleString('en-IN')}\nMonthly Expenses: ₹${((context.inputs?.monthlyExpenses) || 0).toLocaleString('en-IN')}\nEMI: ₹${((context.inputs?.emi) || 0).toLocaleString('en-IN')}\nCurrent Savings: ₹${((context.inputs?.savings) || 0).toLocaleString('en-IN')}\nJob Type: ${context.inputs?.jobType || 'N/A'}\nMonths Covered: ${context.monthsCovered || 0}\nSurplus: ₹${(context.surplusIncome || 0).toLocaleString('en-IN')}\n---\nWhen the user asks about "my" finances, reference this profile.`
    : SYSTEM_PROMPT;

  /* Keep last 8 turns max to stay within context limits */
  const recentHistory = (Array.isArray(history) ? history : []).slice(-8);

  const messages = [
    { role: 'system', content: systemContent },
    ...recentHistory.map(m => ({
      role:    m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || '').slice(0, 800),  // sanitise
    })),
    { role: 'user', content: message.trim() },
  ];

  try {
    logger.debug('Chat request', { model: GROQ_MODEL, turns: recentHistory.length });

    const response = await axios.post(GROQ_URL, {
      model:       GROQ_MODEL,
      messages,
      temperature: 0.6,
      max_tokens:  380,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      timeout: TIMEOUT_MS,
    });

    const reply = response.data?.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error('Empty response from Groq');

    logger.info('Chat response generated', { model: GROQ_MODEL, chars: reply.length });
    return res.json({ reply, source: 'groq' });

  } catch (err) {
    const status = err.response?.status;
    logger.warn('Chat Groq error', { status, message: err.message });

    if (status === 429) {
      return res.json({
        reply: "I'm receiving too many requests right now. Please wait a moment and try again.",
        source: 'rate_limited',
      });
    }

    return res.json({
      reply: "I couldn't connect to the AI right now. Try asking again in a moment — or check if your server is running.",
      source: 'error',
    });
  }
}

module.exports = { chat };
