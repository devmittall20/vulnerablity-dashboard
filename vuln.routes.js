const express = require('express');
const { getVulnerabilities, updateVulnerability } = require('../controllers/vuln.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware, getVulnerabilities);
router.put('/:id', authMiddleware, updateVulnerability);

module.exports = router;
