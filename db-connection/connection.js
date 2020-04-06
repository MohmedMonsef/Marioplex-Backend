const mongoose=require('mongoose');
mongoose.Promise=global.Promise;
const spotify=require('../models/db');
const bcrypt=require('bcrypt');
const Grid = require('gridfs-stream');
mongoose.Promise=global.Promise;
// set gfs object ot be global
global.gfsTracks = undefined;
global.gfsImages = undefined;
module.exports= function(app){
    const atlasSpotify ='mongodb+srv://Spotify:spotifyapp@spotifycluster-i2m7n.mongodb.net/Spotify?retryWrites=true&w=majority';
   
    const atlas ='mongodb+srv://nada:nada@spotifycluster-i2m7n.mongodb.net/Spotify?retryWrites=true&w=majority';

    const localhost = 'mongodb://localhost:27017/test' ;
    const localhostnada='mongodb://localhost/spotifytest';
    const bahaa ="mongodb+srv://bahaaEldeen:123@spotifycluster-i2m7n.mongodb.net/test?retryWrites=true&w=majority";
    mongoose.connect(atlas,{  useNewUrlParser: true, useCreateIndex: true ,useUnifiedTopology:true});

    
    mongoose.connection.once('open',()=>{
        gfsTracks = new Grid(mongoose.connection.db, mongoose.mongo);
        gfsImages = new Grid(mongoose.connection.db, mongoose.mongo);
        // set gfs collections
        gfsTracks.collection('tracks');
        gfsImages.collection('images');
       
  
    
    console.log("connection is made");
    }).on('error',function(error){
    console.log("connection got error : ",error);
    }); 
   
  
};



