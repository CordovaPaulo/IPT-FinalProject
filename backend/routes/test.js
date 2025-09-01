var express = require('express');
var router = express.Router();
const testController = require('../controllers/test');
const { authenticateToken } = require('../service/jwt');

router.get('/ping', authenticateToken, testController.ping);

module.exports = router;