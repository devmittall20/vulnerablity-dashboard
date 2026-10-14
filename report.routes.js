const express = require('express');
const { downloadReport } = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/download', authMiddleware, downloadReport);

module.exports = router;
