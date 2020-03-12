

const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/spotify', { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
mongoose.Promise=global.Promise;
const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');
const app=express();
const login=require('./routes/login');
const signup=require('./routes/signup');
require('./config/passport');


app.use(cors());
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(logger('dev'));
app.use(passport.initialize());


app.use(login);
app.use(signup);

//connect to db before test run
const API_PORT= process.env.API_PORT||3000;


app.listen(process.env.port||5000,function(){
    console.log('listening for a request');
});