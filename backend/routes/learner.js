var express = require('express');
var router = express.Router();
const learnerController = require('../controllers/learner');
const jwtService = require('../service/jwt');

router.get('/learner/mentors', jwtService.authenticateToken('learner'), learnerController.getAllMentors);
router.get('/learner/mentors/:id', jwtService.authenticateToken('learner'), learnerController.getMentorById);
router.post('/learner/schedule/:id', jwtService.authenticateToken('learner'), learnerController.setSchedule);

module.exports = router;