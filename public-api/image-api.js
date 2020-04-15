const Artist =require('./artist-api');
const Track =require('./track-api');
const User = require('./user-api');
const Category = require('./browse-api');
const Playlist = require('./playlist-api');
const Album = require('./album-api')
const checkMonooseObjectID = require('../validation/mongoose-objectid')
const Image = {
    // return the id of the image if it can be added or 0 if cant be added to db
    uploadImage: async function(userId,sourceId,belongsTo,image){
        
        if(!checkMonooseObjectID([userId,sourceId])) return 0;
        if( !belongsTo || !image) return 0;
        const user = await User.getUserById(userId);
        if(!user) return 0;
        // check if belongs to is user,playlist,track,album,category,artist
        switch(belongsTo){
            case 'user':
                {// check if source id equals userId
                if(sourceId != userId) return 0;
                
                if(!user.images) user.images = [];
                user.images.push(image);
                // save user
                await user.save();
                // return id of the saved image
                return user.images[user.images.length-1]._id;
                break;}
            case 'playlist':
               { // check if user has access to playlist
                const isAuthorized = await User.checkAuthorizedPlaylist(userId,sourceId);
                // user has no access to playlist
                if(!isAuthorized) return 0;
                const playlist = await Playlist.getPlaylist(sourceId);
                // check if laylist exist
                if(!playlist) return 0;
                if(!playlist.images) playlist.images = [];
                playlist.images.push(image);
                await playlist.save();
                return playlist.images[playlist.images.length-1]._id;
                break;}
            case 'track':{
                {// check if user has access to track
                const hasAccess = await  User.checkAuthorizedTrack(userId,sourceId);
                if(!hasAccess) return 0;
                // get track
                const track = await Track.getTrack(sourceId);
                if(!track) return 0;
                if(!track.images) track.images = [];
                track.images.push(image);
                await track.save();
                return track.images[track.images.length-1]._id;
                break;}
            }
            case 'album':
                {// check if user is artist and has access to album
                const hasAccess = await  User.checkAuthorizedAlbum(userId,sourceId);
                if(!hasAccess) return 0;
                // get track
                const album = await Album.getAlbumById(sourceId);
                if(!album) return 0;
                if(!album.images) album.images = [];
                album.images.push(image);
                await album.save();
                return album.images[album.images.length-1]._id;
                break;}
            case 'artist':
                {// check is user is the artist he claims to be
                const artist = await Artist.findMeAsArtist(userId);
                if(!artist) return 0;
                if(!artist.images) artist.images = [];
                artist.images.push(image);
                await artist.save();
                return artist.images[artist.images.length-1]._id;
                break;}
            case 'category':
                return 0;
                break;
            default:
                return 0;

        }

    }

}

module.exports = Image;