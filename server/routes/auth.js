'use strict';

const router = require('express').Router();
const { register, login, me, adminLogin } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/auth/register',    register);
router.post('/auth/login',       login);
router.post('/auth/admin-login', adminLogin);
router.get ('/auth/me',          verifyToken, me);

module.exports = router;
