'use strict';

const router = require('express').Router();
const { getStats, getUsers, getRecentAnalyses, patchUserRole, removeUser, getSystemHealth } = require('../controllers/adminController');
const { verifyToken, requireAdmin }             = require('../middleware/auth');

// Auth applied per-route so router.use() doesn't bleed into other /api/* mounts
const adminAuth = [verifyToken, requireAdmin];

router.get   ('/admin/stats',           ...adminAuth, getStats);
router.get   ('/admin/users',           ...adminAuth, getUsers);
router.get   ('/admin/analyses',        ...adminAuth, getRecentAnalyses);
router.patch ('/admin/users/:id/role',  ...adminAuth, patchUserRole);
router.delete('/admin/users/:id',       ...adminAuth, removeUser);
router.get   ('/admin/system',          ...adminAuth, getSystemHealth);

module.exports = router;
