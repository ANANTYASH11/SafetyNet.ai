/**
 * models/UserData.js
 * Mongoose schema for persisting analysis records.
 *
 * Schema design:
 *  - inputs     → raw user-submitted fields (validated before storage)
 *  - results    → full calculated output from calculationService
 *  - aiInsights → Groq-generated (or fallback) insights block
 *  - savedAt    → indexed for efficient reverse-chronological queries
 */

'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/* ── Sub-schemas ──────────────────────────────────────────────── */

const InputsSchema = new Schema({
  monthlyIncome:      { type: Number, required: true, min: [0, 'Income cannot be negative'] },
  monthlyExpenses:    { type: Number, required: true, min: [0, 'Expenses cannot be negative'] },
  emi:                { type: Number, default: 0,    min: 0 },
  savings:            { type: Number, default: 0,    min: 0 },
  jobType:            { type: String, default: 'corporate',
                        enum: ['govt', 'corporate', 'freelancer', 'business', 'gig',
                               // Also accept display labels from the frontend
                               'Government / PSU', 'Private / Corporate',
                               'Freelancer / Consultant', 'Business Owner', 'Gig / Part-time'] },
  dependents:         { type: Number, default: 0, min: 0, max: 10 },
  cityTier:           { type: String, default: '2', enum: ['1', '2', '3'] },
  age:                { type: Number, default: 30,  min: 18, max: 90 },
  lifeStage:          { type: String, default: 'mid_career' },
  hasHealthInsurance: { type: String, default: 'no', enum: ['yes', 'partial', 'no', true, false] },
  rentOrOwn:          { type: String, default: 'rent', enum: ['rent', 'own_loan', 'own_free'] },
}, { _id: false });

const AiInsightsSchema = new Schema({
  insights:    { type: String, default: '' },
  suggestions: { type: [String], default: [] },
  warnings:    { type: [String], default: [] },
  /** groq = live Groq API  |  fallback = rule-based engine */
  source:      { type: String, enum: ['groq', 'fallback'], default: 'fallback' },
}, { _id: false });

/* ── Main schema ──────────────────────────────────────────────── */

const UserDataSchema = new Schema({
  inputs:     { type: InputsSchema,      required: true },
  results:    { type: Schema.Types.Mixed, required: true },  // stores full calcResult blob
  aiInsights: { type: AiInsightsSchema,  default: () => ({}) },
  savedAt:    { type: Date, default: Date.now, index: true },
}, {
  timestamps: true,      // adds createdAt / updatedAt
  collection: 'userdata',
  versionKey: false,
});

/* ── Indexes ──────────────────────────────────────────────────── */
UserDataSchema.index({ savedAt: -1 });                      // history queries
UserDataSchema.index({ 'inputs.jobType': 1, savedAt: -1 }); // future analytics

/* ── Virtuals ─────────────────────────────────────────────────── */

/** Convenience accessor for the top-level risk level */
UserDataSchema.virtual('riskLevel').get(function () {
  return this.results?.riskLevel ?? null;
});

/* ── Instance methods ─────────────────────────────────────────── */

/** Returns a lightweight summary card (used in history list) */
UserDataSchema.methods.toCard = function () {
  return {
    id:             this._id,
    savedAt:        this.savedAt,
    riskLevel:      this.results?.riskLevel,
    riskScore:      this.results?.riskScore,
    recommendedFund:this.results?.recommendedFund,
    monthsRecommended: this.results?.monthsRecommended,
    percentFunded:  this.results?.percentFunded,
    monthlyIncome:  this.inputs?.monthlyIncome,
    jobType:        this.inputs?.jobType,
    cityTier:       this.inputs?.cityTier,
  };
};

/* ── Static methods ───────────────────────────────────────────── */

/** Paginated history fetch */
UserDataSchema.statics.getHistory = async function (page = 1, limit = 20) {
  const skip = (Math.max(page, 1) - 1) * Math.min(limit, 100);
  const [docs, total] = await Promise.all([
    this.find({}, { __v: 0 }).sort({ savedAt: -1 }).skip(skip).limit(limit).lean(),
    this.countDocuments(),
  ]);
  return { data: docs, total, page, limit, pages: Math.ceil(total / limit) };
};

module.exports = mongoose.model('UserData', UserDataSchema);
