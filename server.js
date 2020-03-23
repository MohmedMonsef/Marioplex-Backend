
const forgpass=require('./routes/Forgpass-route');

const express = require('express');
const app=express();
const connection=require('./DBconnection/connection');
//connect to database
connection(app);
const cors = require('cors');
const bodyparser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session')
const browse=require('./routes/browse')
const album=require('./routes/album')
const Track=require('./routes/Track-routes')
const playlist=require('./routes/playlist-routes');
const Artist=require('./routes/Artist-route');
const userProfile=require('./routes/userprofile')
const login=require('./routes/login');
const signup=require('./routes/signup');
const search=require('./routes/search')
const facebook = require('./authentication/facebook-routes');
require('./config/passport');

app.use(cors());
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(logger('dev'));
app.use(session({ secret: 'anything' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(search);
app.use(album);
app.use(login);
app.use(signup);
app.use(Track);
app.use(playlist);
app.use(forgpass);
app.use('/auth',facebook);
app.use(userProfile);
app.use(browse);
app.use(Artist);
app.use(login);
app.use(signup);
app.use(forgpass);
app.use(userProfile)

//connect to db before test run
const API_PORT= process.env.API_PORT||3000;

app.use(function(error,req,res,next){
    res.status(500);
    res.send({error:error.message});
    
});
app.listen(process.env.port||API_PORT,function(){
    console.log('listening for a request');
});

module.exports = app;
