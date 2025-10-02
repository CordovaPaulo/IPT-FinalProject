const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { multerUploads, multerUploadsMultiple, mentorSignup } = require('../service/multer');

router.post('/learner/signup', multerUploads, authController.learnerSignup);
router.post('/mentor/signup', mentorSignup, authController.mentorSignup);
router.post('/login', authController.login);

module.exports = router;
