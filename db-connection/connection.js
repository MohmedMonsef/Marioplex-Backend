const mongoose=require('mongoose');
mongoose.Promise=global.Promise;
const spotify=require('../models/db');
const bcrypt=require('bcrypt');
mongoose.Promise=global.Promise;

module.exports= function(app){
    const atlasSpotify ='mongodb+srv://Spotify:spotifyapp@spotifycluster-i2m7n.mongodb.net/Spotify?retryWrites=true&w=majority';
   
    const atlas ='mongodb+srv://nada:nada@spotifycluster-i2m7n.mongodb.net/Spotify?retryWrites=true&w=majority';

    const localhost = 'mongodb://localhost:27017/test' ;
    const localhostnada='mongodb://localhost/spotifytest';
    const bahaa ="mongodb+srv://bahaaEldeen:123@spotifycluster-i2m7n.mongodb.net/test?retryWrites=true&w=majority";
    mongoose.connect(atlas,{  useNewUrlParser: true, useCreateIndex: true ,useUnifiedTopology:true});

    
    mongoose.connection.once('open',()=>{
    console.log("connection is made");
    }).on('error',function(error){
    console.log("connection got error : ",error);
    }); 
   
  
};


