//Events = require('events');
//global.eventEmiller = new Events();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const spotify = require('../models/db');
const bcrypt = require('bcrypt');
const Grid = require('gridfs-stream');

// set gfs object ot be global
global.gfsTracks = undefined;
global.gfsImages = undefined;
module.exports = function(app) {
    const atlasSpotify = 'mongodb+srv://Spotify:spotifyapp@spotifycluster-i2m7n.mongodb.net/Spotify?retryWrites=true&w=majority';
    const atlas = 'mongodb+srv://nada:nada@spotifycluster-i2m7n.mongodb.net/Spotify?retryWrites=true&w=majority';
    const localhost = 'mongodb://localhost:27017/test';
    const localhostnada = 'mongodb://localhost/spotifynada';
    const bahaa = "mongodb+srv://bahaaEldeen:123@spotifycluster-i2m7n.mongodb.net/test?retryWrites=true&w=majority";
    const mlab = "mongodb://bahaa:123456b@ds157834.mlab.com:57834/spotify-demo"
    const atlasSpotifySeeds = 'mongodb+srv://Spotify:spotify@cluster0-ctnvx.mongodb.net/test' // to generate seeds
        // if not env variable will tack mlab 
    if (process.env.CONNECTION_STRING) {
        mongoose.connect(String(process.env.CONNECTION_STRING), { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })

        mongoose.connection.once('open', () => {
            gfsTracks = new Grid(mongoose.connection.db, mongoose.mongo);
            gfsImages = new Grid(mongoose.connection.db, mongoose.mongo);
            // set gfs collections
            gfsTracks.collection('tracks');
            gfsImages.collection('images');
            //process.env['CONNECTION_STRING'] = String(process.env.CONNECTION_STRING);
            console.log("connection is made   ");
            //eventEmiller.emit('connection made');
        }).on('error', function(error) {
            console.log("connection got error : ", error);
        });
    } else console.log("connection string is require in .env file")

};