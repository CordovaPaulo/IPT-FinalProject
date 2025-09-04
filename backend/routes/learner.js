var express = require('express');
var router = express.Router();
const learnerController = require('../controllers/learner');
const jwtService = require('../service/jwt');

// POST routes
router.post('/schedule/:id', jwtService.authenticateToken('learner'), learnerController.setSchedule);
router.post('/feedback/:id', jwtService.authenticateToken('learner'), learnerController.setFeedback);

// GET routes
router.get('/mentors', jwtService.authenticateToken('learner'), learnerController.getAllMentors);
router.get('/mentors/:id', jwtService.authenticateToken('learner'), learnerController.getMentorById);
router.get('/schedules', jwtService.authenticateToken('learner'), learnerController.getSchedules);

//PATCH routes
router.patch('/profile/edit', jwtService.authenticateToken('learner'), learnerController.editProfile);

module.exports = router;