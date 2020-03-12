const mongoose=require('mongoose');
mongoose.Promise=global.Promise;
const spotify=require('../models/DB');
let users=spotify.user;

module.exports= function(app){

    mongoose.connect('mongodb://localhost/spotify' ,{ useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
    mongoose.connection.once('open',()=>{
    console.log("connection is made");
    }).on('error',function(error){
    console.log("connection got error : ",error);
    });

};


