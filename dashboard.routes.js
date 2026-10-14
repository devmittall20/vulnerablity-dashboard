const express = require('express');
const { getStats } = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/stats', authMiddleware, getStats);

module.exports = router;
