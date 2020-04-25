const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const mongoURI = "mongodb+srv://nada:nada@spotifycluster-i2m7n.mongodb.net/Spotify?retryWrites=true&w=majority";
const localhostnada = 'mongodb://localhost/spotifytest';
const localhost = 'mongodb://localhost:27017/test';
const Track = require('../public-api/track-api');
const Artist = require('../public-api/artist-api');

const mlab = "mongodb://bahaa:123456b@ds157834.mlab.com:57834/spotify-demo";
let storage;
eventEmiller.on('connection made', () => {
    storage = new GridFsStorage({
        url: String(process.env.CONNECTION_STRING) ? String(process.env.CONNECTION_STRING) : mlab, // env variable
        file: async(req, file) => {
            //console.log(file);
            //console.log(req.user)
            // check extension of the track to be webm audio/video 
            let acceptedExtensions = ["image/jpeg", "image/bmp", "image/png", "image/jpg"]
            if (!acceptedExtensions.includes(file.mimetype)) { throw Error("file not supported"); }

            return new Promise(async(resolve, reject) => {

                const fileInfo = {
                    filename: req.filename,
                    bucketName: 'images',
                    metadata: { userId: req.user._id, belongsTo: req.belongsTo, sourcrId: req.sourcrId, imageId: req.imageId }

                };
                resolve(fileInfo);

            });
        }
    });
});
const upload = multer({
    storage,
    onError: function(err, next) {

        next(err);
    }
});
module.exports = { upload };