var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth');

router.post('/learner/signup', authController.learnerSignup);
router.post('/mentor/signup', authController.mentorSignup);
router.post('/login', authController.login);

module.exports = router;
