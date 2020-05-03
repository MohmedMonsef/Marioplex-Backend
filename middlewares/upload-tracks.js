const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
//const GridFsStorage = require('multer-gridfs-storage');
//const mongoURI = "mongodb+srv://nada:nada@spotifycluster-i2m7n.mongodb.net/Spotify?retryWrites=true&w=majority";
//const localhostnada = 'mongodb://localhost/spotifytest';
//const localhost = 'mongodb://localhost:27017/test';

//const mlab = "mongodb://bahaa:123456b@ds157834.mlab.com:57834/spotify-demo"

const multerDrive = require('../config/google-drive-multer')
let storage;
// eventEmiller.on('connection made', () => {
//     // storage = new GridFsStorage({
//     //     url: String(process.env.CONNECTION_STRING) ? String(process.env.CONNECTION_STRING) : mlab, // env var
//     //     file: async(req, file) => {
//     //         // check extension of the track to be webm audio/video 
//     //         if (file.mimetype != "video/webm" && file.mimetype != 'audio/webm') { throw Error("file not supported"); };
//     //         // add track to mongodc then to gridFs
//     //         return new Promise(async(resolve, reject) => {
//     //             // console.log(req.body);
//     //             // create track only for high quality
//     //             const fileInfo = {
//     //                 filename: req.filename,
//     //                 bucketName: 'tracks',
//     //                 metadata: { originalName: req.query.name, type: file.fieldname, userId: req.user._id, trackId: req.trackID }

//     //             };
//     //             resolve(fileInfo);

//     //         });
//     //     }
//     // });

//     //storage =  multerDrive({auth});
// });
const upload = multer({
    storage:multerDrive({auth})
   
});
module.exports = { upload };