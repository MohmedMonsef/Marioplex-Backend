const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const mongoURI="mongodb+srv://nada:nada@spotifycluster-i2m7n.mongodb.net/Spotify?retryWrites=true&w=majority";
const localhostnada='mongodb://localhost/spotifytest';
const localhost = 'mongodb://localhost:27017/test';
const Track =require('../public-api/track-api');
const Artist =require('../public-api/artist-api');

// all file qualities must have same name
const storage = new GridFsStorage({
    url: mongoURI ,
    file:async  (req, file) => {
      //console.log(file);
      //console.log(req.user)
      // check extension of the track to be webm audio/video 
     
      if(file.mimetype != "video/webm" && file.mimetype  != 'audio/webm'){throw Error("file not supported");};
       // add track to mongodc then to gridFs
      
     
     
      return new Promise(async (resolve, reject) => {
        
       // console.log(req.body);
        // create track only for high quality
      
          const fileInfo = {
            filename: req.filename,
            bucketName: 'tracks',
            metadata:{originalName: req.query.name,type:file.fieldname,userId:req.user._id,trackId:req.trackID}
             
          };
          resolve(fileInfo);
        
      });
    }
  });
  const upload = multer({
     storage,
     onError : function(err, next) {
    
    next(err);
  } });
  module.exports= {upload};
