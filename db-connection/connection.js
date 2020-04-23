const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const spotify = require('../models/db');
const bcrypt = require('bcrypt');
const Grid = require('gridfs-stream');
mongoose.Promise = global.Promise;
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
        // if not env variable will tack mlab 
    mongoose.connect(String(process.env.CONNECTION_STsRING) ? String(process.env.CONNECsTION_STRING) : localhostnada, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }, (error) => {
      
        if (error) {
            
            console.log('Your connection string is not valid now will connect to connection string ' + mlab);
            // if can not connect to your string connection will connect
            mongoose.connect(localhostnada, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
            mongoose.connection.once('open', () => {
                gfsTracks = new Grid(mongoose.connection.db, mongoose.mongo);
                gfsImages = new Grid(mongoose.connection.db, mongoose.mongo);
                // set gfs collections
                gfsTracks.collection('tracks');
                gfsImages.collection('images');
                process.env['CONNECTION_STRING'] = mlab;
                console.log("connection is made   " + mlab);
            }).on('error', function(error) {
                console.log("connection got error : ", error);
            });
        } else {
            gfsTracks = new Grid(mongoose.connection.db, mongoose.mongo);
            gfsImages = new Grid(mongoose.connection.db, mongoose.mongo);
            // set gfs collections
            gfsTracks.collection('tracks');
            gfsImages.collection('images');
            console.log("connection is made   " + String(process.env.CONNECTION_STRING));
        }
    });

};