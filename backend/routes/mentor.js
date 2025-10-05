const express = require('express');   
const router = express.Router();
const mentorController = require('../controllers/mentor');
const jwtService = require('../service/jwt');
const uploadController = require('../controllers/upload');
const { multerUploadsMultiple } = require('../service/multer');

// POST routes
router.post('/schedule/:id', jwtService.authenticateToken('mentor'), mentorController.setSchedule);
router.post('/cancel-sched/:id', jwtService.authenticateToken('mentor'), mentorController.cancelSched);
router.post('/resched-sched/:id', jwtService.authenticateToken('mentor'), mentorController.reschedSched);
router.post('/remind-sched/:id', jwtService.authenticateToken('mentor'), mentorController.sendReminder);
router.post('/files/upload', jwtService.authenticateToken('mentor'), multerUploadsMultiple, uploadController.uploadLearningMaterials);
router.post('/send-offer/:learnerId', jwtService.authenticateToken('mentor'), mentorController.sendOffer);

// GET routes
router.get('/profile', jwtService.authenticateToken('mentor'), mentorController.getProfileInfo);
router.get('/schedules', jwtService.authenticateToken('mentor'), mentorController.getSchedules);
router.get('/learners', jwtService.authenticateToken('mentor'), mentorController.getAllLearners);
router.get('/learners/:id', jwtService.authenticateToken('mentor'), mentorController.getLearnerById);
router.get('/feedbacks', jwtService.authenticateToken('mentor'), mentorController.getFeedbacks);
router.get('/feedbacks/reviewer/:id', jwtService.authenticateToken('mentor'), mentorController.getReviewer);
router.get('/files', jwtService.authenticateToken('mentor'), mentorController.getLearningMaterialsList);
router.get('/files/:fileId', jwtService.authenticateToken('mentor'), mentorController.getLearningMaterial);

// DELETE routes
router.delete('/files/:fileId', jwtService.authenticateToken('mentor'), mentorController.deleteLearningMaterial);

// PATCH routes (you can add editProfile later if needed)
// router.patch('/mentor/profile/edit', jwtService.authenticateToken('mentor'), mentorController.editProfile);

module.exports = router;
