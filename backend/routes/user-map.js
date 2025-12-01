const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../service/jwt');
const usersController = require('../controllers/role');
const usermapsController = require('../controllers/usermaps');

//learner acces only

router.get('/maps', authenticateToken('learner'), usermapsController.getUserMaps);
router.get('/maps/progress', authenticateToken('learner'), usermapsController.getLearnerProgress);
router.post('/maps/progress/update', authenticateToken('learner'), usermapsController.updateLearnerProgress);

module.exports = router;