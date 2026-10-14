const express = require('express');
const multer = require('multer');
const { uploadScan } = require('../controllers/scan.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temporary storage before parsing

// Only Admins and Analysts can upload scans
router.post('/import', authMiddleware, roleMiddleware(['ADMIN', 'ANALYST']), upload.single('file'), uploadScan);

module.exports = router;
