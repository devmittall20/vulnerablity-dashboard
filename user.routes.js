const express = require('express');
const { getUsers } = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware, getUsers);

module.exports = router;
