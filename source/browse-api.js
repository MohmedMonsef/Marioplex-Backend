const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');


// initialize db 
const User = require('./user-api');
const Playlist = require('./playlist-api');
const checkMonooseObjectId = require('../validation/mongoose-objectid');
/** @namespace */
const Browse = {

    //get category by id
    /**
     * get category by id .
     * @param {String} categoryId -the id of category
     * @returns {object} - category object
     */
    getCategoryById: async function(categoryId) {
        try {
            if (!checkMonooseObjectId([categoryId])) throw new Error('no id');

            let category = await categoryDocument.findById(categoryId, (err, category) => {
                if (err) return 0;
                return category;
            }).catch((err) => 0);
            if (!category) return 0;
            if (category.playlist[0]) {
                let playlist = await Playlist.getPlaylist(category.playlist[0]);
                category.images = playlist.images;
            }
            return category;
        } catch (ex) {
            return 0;
        }
    },
    /**
     * Get list of playlists of one category
     * @param {String} categoryId -the id of category
     * @param {Number} limit
     * @param {Number} offset
     * @returns {Array<object>} -array of playlist object
     */
    getCategoryPlaylists: async function(categoryId, limit, offset) {
        try {
            if (!checkMonooseObjectId([categoryId])) throw new Error('no id');
            let category = await this.getCategoryById(categoryId);
            if (!category) return 0;
            let playlists = []
            for (let i = 0; i < category.playlist.length; i++) {
                let playlist = await Playlist.getPlaylist(category.playlist[i]);
                if (playlist) {
                    let playlistInfo = {};
                    playlistInfo['_id'] = playlist._id;
                    playlistInfo['name'] = playlist.name;
                    playlistInfo['images'] = playlist.images;
                    let owner = await User.getUserById(playlist.ownerId);
                    if (owner) {
                        playlistInfo['ownerId'] = owner._id;
                        playlistInfo['ownerName'] = owner.displayName;
                    }
                    playlists.push(playlistInfo);
                }
            }
            return limitOffset(limit, offset, playlists);
        } catch (ex) {
            return 0;
        }
    },

    // get categories
    /**
     * get all categories
     * @returns {Array<object>} -array of categories object
     * 
     */
    getCategoryies: async function() {
        try {
            let category = await categoryDocument.find({}, (err, category) => {
                if (err) return 0;
                return category;
            }).catch((err) => 0);
            for (let i = 0; i < category.length; i++) {
                if (category[i].playlist[0]) {
                    let playlist = await Playlist.getPlaylist(category[i].playlist[0]);
                    category[i].images = playlist.images;
                }
            }
            return category;
        } catch (ex) {
            return 0;
        }
    },
    // to get genre list
    /**
     * get list of genre from artist object
     * @returns {Array<String>} -array of genres
     * 
     */
    getGenreList: async function() {
        try {
            let artists = await artistDocument.find({}, (err, artists) => {
                if (err) return 0;
                return artists;
            }).catch((err) => 0);

            if (artists.length == 0) return 0;
            var genre = [];
            genre.push(artists[0].genre[0])
            for (let i = 0; i < artists.length; i++) {
                if (genre.length == (Number(process.env.GENRE_LIMIT) ? Number(process.env.GENRE_LIMIT) : 10))
                    continue;
                for (let j = 0; j < artists[i].genre.length; j++) {
                    if (genre.length == (Number(process.env.GENRE_LIMIT) ? Number(process.env.GENRE_LIMIT) : 10))
                        continue;
                    for (let k = 0; k < genre.length; k++) {
                        if (artists[i].genre[j] == genre[k])
                            break;
                        if (k == genre.length - 1)
                            genre.push(artists[i].genre[j]);
                    }
                }
            }
            return this.getPlaylistGenre(genre);
        } catch (ex) {
            return 0;
        }
    },
    /**
     * get playlists of genre
     * @param {Array<string>} genres -array of genre  
     * @returns {Array<object>}
     */
    getPlaylistGenre: async function(genres) {
        try {
            if (!genres) throw new Error('no genres');
            let playlists = await playlistDocument.find({}, (err, playlists) => {
                if (err) return 0;
                return playlists;
            }).catch((err) => 0);
            if (!playlists) return 0;
            var allGenre = [];
            var playlistsGenre = [];
            for (let k = 0; k < genres.length; k++) {
                for (let i = 0; i < playlists.length; i++) {
                    if (!playlists[i].snapshot) continue;
                    if (!playlists[i].snapshot[playlists[i].snapshot.length - 1]) continue;
                    if (!playlists[i].snapshot[playlists[i].snapshot.length - 1].hasTracks) continue;
                    let track = await trackDocument.findById(playlists[i].snapshot[playlists[i].snapshot.length - 1].hasTracks[0], (err, track) => {
                        if (err) return 0;
                        return track;
                    }).catch((err) => 0);
                    if (track && track.genre && (track.genre[0] == genres[k] || track.genre[1] == genres[k])) {
                        const user1 = await userDocument.findById(playlists[i].ownerId);
                        playlistsGenre.push({ playlist: playlists[i], owner: { id: playlists[i].ownerId, name: user1 ? user1.name : '' } });
                        playlistsGenre[playlistsGenre.length - 1].playlist.snapshot = undefined;
                    }
                    if (playlistsGenre.length == 10) break;
                }
                if (playlistsGenre.length != 0)

                    allGenre.push({ genre: genres[k], 'playlists': playlistsGenre });
                playlistsGenre = [];
            }
            return allGenre;
        } catch (ex) {
            return 0;
        }
    }


}
module.exports = Browse;
/**
 * set array by limit and offset
 * @param {Number} limit 
 * @param {Number} offset 
 * @param {Array} categories 
 */
function limitOffset(limit, offset, categories) {
    try {
        let start = 0;
        let end = categories.length;
        if (offset != undefined) {
            if (offset >= 0 && offset <= categories.length) {
                start = offset;
            }
        }
        if (limit != undefined) {
            if ((start + limit) > 0 && (start + limit) <= categories.length) {
                end = start + limit;
            }
        } else {
            limit = Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;
            if ((start + limit) > 0 && (start + limit) <= categories.length) {
                end = start + limit;
            }
        }
        return categories.slice(start, end);
    } catch (ex) {
        return 0;
    }
}