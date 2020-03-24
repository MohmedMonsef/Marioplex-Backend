const mongoose=require('mongoose');
mongoose.Promise=global.Promise;
const spotify=require('../models/db');
const bcrypt=require('bcrypt');
mongoose.Promise=global.Promise;

module.exports= async function(app){

    mongoose.connect('mongodb+srv://nada:nada@spotifycluster-i2m7n.mongodb.net/Spotify?retryWrites=true&w=majority' ,{  useNewUrlParser: true, useCreateIndex: true ,useUnifiedTopology:true});
    mongoose.connection.once('open',()=>{
    console.log("connection is made");
    }).on('error',function(error){
    console.log("connection got error : ",error);
    });
/* let users=spotify.user;
const salt=await bcrypt.genSalt(10);
let hashed=await bcrypt.hash("Ringmybells5",salt);
let user=new users({
    email:"nada5aled52@gmail.com",
    password:hashed,
    userType:"Artist"
});
user.save(); */
};


