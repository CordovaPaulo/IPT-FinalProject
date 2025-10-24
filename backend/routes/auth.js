const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { multerUploads, multerUploadsMultiple, mentorSignup } = require('../service/multer');
const { authenticateToken } = require('../service/jwt');

router.post('/learner/signup', multerUploads, authController.learnerSignup);
router.post('/mentor/signup', mentorSignup, authController.mentorSignup);
router.post('/learner/alt-signup', multerUploads, authController.learnerAltSignup);
router.post('/mentor/alt-signup', mentorSignup, authController.mentorAltSignup);
router.post('/forgot-password', authController.forgotPassword);
router.post('/logout', authController.logout);

// verify token (existing) and alias for convenience (added)
router.get('/reset-password/verify', authController.verifyResetToken);
router.get('/reset-password', authController.verifyResetToken); // <-- alias so ?token=... works in browser

router.post('/reset-password', authController.resetPassword);
router.post('/login', authController.login);
router.post('/switch-role', authController.switchRole);

module.exports = router;
