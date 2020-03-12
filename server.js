//which equal inde

const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');
const app=express();
const API_PORT= process.env.API_PORT||3000;

require('./config/passport');
app.use(cors());
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(logger('dev'));
app.use(passport.initialize());
require('./routes/deleteuser');
const signin=require('./routes/login');
const signup=require('./routes/signup');
const mongoose=require('mongoose');
app.use(signin);
app.use(signup);
mongoose.Promise=global.Promise;

//connect to db before test run

mongoose.connect('mongodb://localhost/spotify', { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });

app.listen(process.env.port||5000,function(){
    console.log('listening for a request');
});