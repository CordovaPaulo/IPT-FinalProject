const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { multerUploads, multerUploadsMultiple, mentorSignup } = require('../service/multer');

router.post('/learner/signup', multerUploads, authController.learnerSignup);
router.post('/mentor/signup', mentorSignup, authController.mentorSignup);
router.post('/forgot-password', authController.forgotPassword);
router.post('/logout', authController.logout);

// verify token (existing) and alias for convenience (added)
router.get('/reset-password/verify', authController.verifyResetToken);
router.get('/reset-password', authController.verifyResetToken); // <-- alias so ?token=... works in browser

router.post('/reset-password', authController.resetPassword);
router.post('/login', authController.login);

module.exports = router;
