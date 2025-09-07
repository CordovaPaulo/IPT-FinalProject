const multer = require('multer');

const storage = multer.memoryStorage();

const multerUploads = multer({ storage }).single('image');

const multerUploadsMultiple = multer({ storage }).array('files', 10); 

const mentorSignup = multer({ storage }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'credentials', maxCount: 10 }
]);

module.exports = { multerUploads, multerUploadsMultiple, mentorSignup };