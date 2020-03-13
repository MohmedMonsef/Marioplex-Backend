const mongoose = require('mongoose');
const {user,artist,album,track,playlist,category} = require('../models/db');

const mongoURL = "mongodb://localhost:27017/test";
mongoose.connect(mongoURL,{useNewUrlParser: true})
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('connected to db');
});