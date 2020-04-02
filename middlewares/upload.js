const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const mongoURI="mongodb+srv://nada:nada@spotifycluster-i2m7n.mongodb.net/Spotify?retryWrites=true&w=majority";
const localhostnada='mongodb://localhost/spotifytest';
const localhost = 'mongodb://localhost:27017/test';
const Track =require('../public-api/track-api');
let trackID = "";
// all file qualities must have same name
const storage = new GridFsStorage({
    url: localhost ,
    file:async  (req, file) => {
      //console.log(file);
      //console.log(req.user)
      // check extension of the track to be webm audio/video 
      if(file.mimetype != "video/webm" && file.mimetype  != 'audio/webm')return 0;
       // add track to mongodc then to gridFs
      
     
     
      return new Promise(async (resolve, reject) => {
        crypto.randomBytes(16,async  (err, buf) => {
          if (err) {
            return reject(err);
          }
          console.log(req);
        const filename = buf.toString('hex') + path.extname(file.originalname);
        console.log(req.body);
        // create track only for high quality
        if(file.fieldname == "high"){
          let availableMarkets = req.query.availableMarkets.split(",");
        const track = await Track.createTrack(filename,req.query.name,req.query.trackNumber,availableMarkets,req.user._id,req.params.album_id,req.query.duration);
        trackID = track._id;
        }
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads',
            metadata:{originalName: file.originalname,quality:file.fieldname,userId:req.user._id,trackId:trackID}
             
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });
  module.exports= {upload};