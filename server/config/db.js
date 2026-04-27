/**
 * config/db.js
 * MongoDB connection via Mongoose.
 * Gracefully falls back to file-based storage when MONGO_URI is absent.
 * Includes automatic reconnect and connection event logging.
 */

'use strict';

const mongoose = require('mongoose');
const logger   = require('./logger');

// Track whether Mongo is available so controllers can branch accordingly
let mongoAvailable = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    logger.warn('MONGO_URI not set in .env — running with file-based storage (data.json)');
    logger.warn('To enable MongoDB: add MONGO_URI=mongodb://... to your .env file');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,  // fail fast if unreachable
      socketTimeoutMS:          45000,
      maxPoolSize:              10,    // connection pool
    });

    mongoAvailable = true;

    // Connection lifecycle events
    mongoose.connection.on('disconnected', () => {
      mongoAvailable = false;
      logger.warn('MongoDB disconnected — switching to file fallback');
    });
    mongoose.connection.on('reconnected', () => {
      mongoAvailable = true;
      logger.info('MongoDB reconnected');
    });
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB runtime error', { error: err.message });
    });

    logger.info('MongoDB connected', { host: mongoose.connection.host, db: mongoose.connection.name });
    return true;

  } catch (err) {
    logger.error('MongoDB connection failed — file-based fallback active', { error: err.message });
    return false;
  }
};

/** Returns true when Mongoose has an open connection */
const isMongoLive = () => mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.isMongoLive = isMongoLive;
