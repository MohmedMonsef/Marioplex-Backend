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
const player = require('./routes/player-routes')
const facebook = require('./authentication/facebook-routes');
const forgpass = require('./routes/forgpass-route');
const images = require('./routes/image-route')
require('./config/passport');

app.use(cors());
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(logger('dev'));
app.use(session({ secret: 'anything' }));
app.use(passport.initialize());
app.use(passport.session());

//routes
app.use('/api',homePage);
app.use('/api',Library);
app.use('/api',forgpass);
app.use('/api',userProfile)
app.use('/api',search);
app.use('/api',album);
app.use('/api',login);
app.use('/api',signup);
app.use('/api',Track);
app.use('/api',player);
app.use('/api',playlist);
app.use('/api/auth',facebook);
app.use('/api',browse);
app.use('/api',Artist);
app.use('/api',images);

//connect to db before test run
const API_PORT= process.env.PORT||3000;

app.use(function(error,req,res,next){
    res.status(500);
    res.send({error:error.message});
    
});
app.listen(process.env.port||API_PORT,function(){
    console.log('listening for a request');
});

module.exports = app;
