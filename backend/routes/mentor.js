var express = require('express');   
var router = express.Router();
const mentorController = require('../controllers/mentor');
const jwtService = require('../service/jwt');

// POST routes
router.post('/schedule/:id', jwtService.authenticateToken('mentor'), mentorController.setSchedule);
router.post('/cancel-sched/:id', jwtService.authenticateToken('mentor'), mentorController.cancelSched);
router.post('/resched-sched/:id', jwtService.authenticateToken('mentor'), mentorController.reschedSched);

// GET routes
router.get('/profile', jwtService.authenticateToken('mentor'), mentorController.getProfileInfo);
router.get('/schedules', jwtService.authenticateToken('mentor'), mentorController.getSchedules);
router.get('/learners', jwtService.authenticateToken('mentor'), mentorController.getAllLearners);
router.get('/learners/:id', jwtService.authenticateToken('mentor'), mentorController.getLearnerById);
router.get('/feedbacks', jwtService.authenticateToken('mentor'), mentorController.getFeedbacks);

// PATCH routes (you can add editProfile later if needed)
// router.patch('/mentor/profile/edit', jwtService.authenticateToken('mentor'), mentorController.editProfile);

module.exports = router;
