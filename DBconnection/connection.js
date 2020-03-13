const mongoose=require('mongoose');
mongoose.Promise=global.Promise;
const spotify=require('../models/DB');

mongoose.Promise=global.Promise;

module.exports= function(app){

    mongoose.connect('mongodb+srv://Spotify:spotifyapp@spotifycluster-i2m7n.mongodb.net/Spotify?retryWrites=true&w=majority' ,{ useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
    mongoose.connection.once('open',()=>{
    console.log("connection is made");
    }).on('error',function(error){
    console.log("connection got error : ",error);
    });

};


