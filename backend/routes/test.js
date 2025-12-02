var express = require('express');
var router = express.Router();
const testController = require('../controllers/test');
const testEmailController = require('../controllers/test-email');
const { authenticateToken } = require('../service/jwt');
const uploadController = require('../controllers/upload');
const { multerUploads, multerUploadsMultiple } = require('../service/multer');

router.post('/upload/pfp', multerUploads, uploadController.upToCloudinary);
router.post('/upload/credentials', multerUploadsMultiple, uploadController.uploadMentorCredentials);
router.post('/upload/learning-materials', multerUploadsMultiple, uploadController.uploadLearningMaterials);

// Test email endpoint - GET /api/test/email?to=recipient@example.com
router.get('/email', testEmailController.testEmail);

module.exports = router;