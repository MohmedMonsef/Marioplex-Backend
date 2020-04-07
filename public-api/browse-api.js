const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');


// initialize db 
const connection = require('../db-connection/connection');
const User = require('./user-api');
const track = require('./track-api');
const playlist = require('./playlist-api');

const Browse = {

    //get category by id
    getCategoryById: async function(categoryID) {

        let category = await categoryDocument.findById(categoryID, (err, category) => {
            if (err) return 0;
            return category;
        }).catch((err) => 0);
        return category;

    },
    // get categories
    getCategoryies: async function() {

        let category = await categoryDocument.find({}, (err, category) => {
            if (err) return 0;
            return category;
        }).catch((err) => 0);
        return category;

    }
}
module.exports = Browse;