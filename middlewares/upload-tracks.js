const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const multerDrive = require('../config/google-drive-multer')

const upload = multer({
    storage:multerDrive({auth})
   
});
module.exports = { upload };