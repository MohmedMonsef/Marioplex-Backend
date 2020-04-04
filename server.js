const connection=require('./db-connection/connection');
const express = require('express');
const app =express();
//connect to database
connection(app);
const cors = require('cors');
const bodyparser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const browse=require('./routes/browse');
const album=require('./routes/album');
const Track=require('./routes/track-routes');
const playlist=require('./routes/playlist-routes');
const Artist=require('./routes/artist-route');
const Library=require('./routes/library-routes');
const userProfile=require('./routes/user-profile-routes');
const homePage =require('./routes/home-page-routes');
const login=require('./routes/login');
const signup=require('./routes/signup-routes');
const search=require('./routes/search');
require('./config/passport');


const player = require('./routes/player-routes')
const facebook = require('./authentication/facebook-routes');
const forgpass = require('./routes/forgpass-route');


app.use(cors());
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(logger('dev'));
app.use(session({ secret: 'anything' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(homePage);
app.use(Library);
app.use(forgpass);
app.use(userProfile)
app.use(search);
app.use(album);

app.use(login);
app.use(signup);
app.use(Track);
app.use(player);
app.use(playlist);
app.use('/auth',facebook);
app.use(browse);
app.use(Artist);

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
