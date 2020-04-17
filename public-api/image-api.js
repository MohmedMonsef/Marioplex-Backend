
const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');

const Artist =require('./artist-api');
const User = require('./user-api');
const Category = require('./browse-api');
const Playlist = require('./playlist-api');
const Album = require('./album-api')
const checkMonooseObjectID = require('../validation/mongoose-objectid');
const mongoose = require('mongoose');
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
                const track = await trackDocument.findById(sourceId);
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

    },
    // update images array and vlear previous images
    updateImage: async function(userId,sourceId,belongsTo,image){
        
        if(!checkMonooseObjectID([userId,sourceId])) return 0;
        if( !belongsTo || !image) return 0;
        const user = await User.getUserById(userId);
        if(!user) return 0;
        // check if belongs to is user,playlist,track,album,category,artist
        // delete old images of entity
        await this.deleteImages(userId,sourceId,belongsTo);
        switch(belongsTo){
            case 'user':
                {// check if source id equals userId
                if(sourceId != userId) return 0;
                
                user.images = [];
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
                playlist.images = [];
                playlist.images.push(image);
                await playlist.save();
                return playlist.images[playlist.images.length-1]._id;
                break;}
            case 'track':{
                {// check if user has access to track
                const hasAccess = await  User.checkAuthorizedTrack(userId,sourceId);
                if(!hasAccess) return 0;
                // get track
                const track = await trackDocument.findById(sourceId);
                if(!track) return 0;
                track.images = [];
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
                album.images = [];
                album.images.push(image);
                await album.save();
                return album.images[album.images.length-1]._id;
                break;}
            case 'artist':
                {// check is user is the artist he claims to be
                const artist = await Artist.findMeAsArtist(userId);
                if(!artist) return 0;
                artist.images = [];
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


    },
    deleteImage: async function(imageId,userId,sourceId,belongsTo){
        // remove image from database and from gridfs
        // check if user has access to delete image then delete the image
        if(!checkMonooseObjectID([userId,sourceId])) return 0;
        if( !belongsTo || !imageId ) return 0;
        const user = await User.getUserById(userId);
        if(!user) return 0;
        // check if belongs to is user,playlist,track,album,category,artist
        switch(belongsTo){
            case 'user':
                {// check if source id equals userId
                if(sourceId != userId) return 0;
                // delete image from user array
                const newImages = this.deleteImageFromArray(user.images,imageId);
                if(!newImages) return 0; 
                // update images array for user
                user.images = newImages;
                // save user
                await user.save();
                // delete image from gridfs
                const imageFile = await gfsImages.files.findOne({"metadata.imageId":mongoose.Types.ObjectId(imageId)});
                
                const imageIdGridfs = imageFile ? imageFile._id : undefined;
               
                if(!imageIdGridfs) return 0;
                const deletedFromGridfs = await gfsImages.files.deleteOne({_id:imageIdGridfs})
                
                
                return 1;
                break;}
            case 'playlist':
               { // check if user has access to playlist
                const isAuthorized = await User.checkAuthorizedPlaylist(userId,sourceId);
                // user has no access to playlist
                if(!isAuthorized) return 0;
                const playlist = await Playlist.getPlaylist(sourceId);
                // check if playlist exist
                if(!playlist) return 0;
                // delete image from playlist array
                const newImages = this.deleteImageFromArray(playlist.images,imageId);
                if(!newImages) return 0; 
                // update images array for playlist
                playlist.images = newImages;
                // save playlist
                await playlist.save();
                // delete image from gridfs
                const imageFile = await gfsImages.files.findOne({"metadata.imageId":mongoose.Types.ObjectId(imageId)});
                 const imageIdGridfs = imageFile ? imageFile._id : undefined;
                 if(!imageIdGridfs) return 0;
                const deletedFromGridfs = await gfsImages.files.deleteOne({_id:imageIdGridfs})
                return 1;
                break;}
            case 'track':{
                {// check if user has access to track
                const hasAccess = await  User.checkAuthorizedTrack(userId,sourceId);
                if(!hasAccess) return 0;
                // get track
                const track = await trackDocument.findById(sourceId);
                if(!track) return 0;
                // delete image from track array
                const newImages = this.deleteImageFromArray(track.images,imageId);
                if(!newImages) return 0; 
                // update images array for track
                track.images = newImages;
                // save track
                await track.save();
                // delete image from gridfs
                const imageFile = await gfsImages.files.findOne({"metadata.imageId":mongoose.Types.ObjectId(imageId)});
                 const imageIdGridfs = imageFile ? imageFile._id : undefined;
                 if(!imageIdGridfs) return 0;
                const deletedFromGridfs = await gfsImages.files.deleteOne({_id:imageIdGridfs})
                return 1;
                break;}
            }
            case 'album':
                {// check if user is artist and has access to album
                const hasAccess = await  User.checkAuthorizedAlbum(userId,sourceId);
                if(!hasAccess) return 0;
                // get album
                const album = await Album.getAlbumById(sourceId);
                if(!album) return 0;
               // delete image from album array
               const newImages = this.deleteImageFromArray(album.images,imageId);
               if(!newImages) return 0; 
               // update images array for album
               album.images = newImages;
               // save album
               await album.save();
               // delete image from gridfs
               const imageFile = await gfsImages.files.findOne({"metadata.imageId":mongoose.Types.ObjectId(imageId)});
                const imageIdGridfs = imageFile ? imageFile._id : undefined;
                if(!imageIdGridfs) return 0;
               const deletedFromGridfs = await gfsImages.files.deleteOne({_id:imageIdGridfs})
               return 1;
                break;}
            case 'artist':
                {// check is user is the artist he claims to be
                const artist = await Artist.findMeAsArtist(userId);
                if(!artist) return 0;
                // delete image from artist array
               const newImages = this.deleteImageFromArray(artist.images,imageId);
               if(!newImages) return 0; 
               // update images array for artist
               artist.images = newImages;
               // save artist
               await artist.save();
               // delete image from gridfs
               const imageFile = await gfsImages.files.findOne({"metadata.imageId":mongoose.Types.ObjectId(imageId)});
                const imageIdGridfs = imageFile ? imageFile._id : undefined;
                if(!imageIdGridfs) return 0;
               const deletedFromGridfs = await gfsImages.files.deleteOne({_id:imageIdGridfs})
               return 1;
                break;}
            case 'category':
                return 0;
                break;
            default:
                return 0;
        }


    },
    // delete single image from the array and return the new array after the deletion 
    deleteImageFromArray: function (images,imageId){
        
        if(!images) return [];
     
        for(let i=0;i<images.length;i++){
         
            if( images[i]._id == imageId  ){
                
                images.splice(i,1);
               
                return images;
            }
        }
        return 0;
    },
    deleteImages: async function(userId,sourceId,belongsTo){
        // remove images from database and from gridfs
        // check if user has access to delete image then delete the image
        if(!checkMonooseObjectID([userId,sourceId])) return 0;
        if( !belongsTo ) return 0;
        const user = await User.getUserById(userId);
        if(!user) return 0;
        // check if belongs to is user,playlist,track,album,category,artist
        switch(belongsTo){
            case 'user':
                {// check if source id equals userId
                if(sourceId != userId) return 0;
                if(!user.images) user.images = [];
                // delete image from gridfs
                for(let image of user.images){
                    const imageFile = gfsImages.files.findOne({"metadata.imageId":mongoose.Types.ObjectId(image._id)});
                     const imageIdGridfs = imageFile ? imageFile._id : undefined;
                     if(!imageIdGridfs) continue;
                    await gfsImages.files.deleteOne({_id:imageIdGridfs});
                }
                // update images array for user
                user.images = [];
                // save user
                await user.save();
                return 1;
                break;}
            case 'playlist':
               { // check if user has access to playlist
                const isAuthorized = await User.checkAuthorizedPlaylist(userId,sourceId);
                // user has no access to playlist
                if(!isAuthorized) return 0;
                const playlist = await Playlist.getPlaylist(sourceId);
                // check if playlist exist
                if(!playlist) return 0;
                if(!playlist.images) playlist.images = [];
                // delete image from gridfs
                for(let image of playlist.images){
                    const imageFile = gfsImages.files.findOne({"metadata.imageId":mongoose.Types.ObjectId(image._id)});
                     const imageIdGridfs = imageFile ? imageFile._id : undefined;
                    if(!imageIdGridfs) continue;
                    await gfsImages.files.deleteOne({_id:imageIdGridfs});
                }
                // update images array
                playlist.images = [];
                // save 
                await playlist.save();
                return 1;
                break;}
            case 'track':{
                {// check if user has access to track
                const hasAccess = await  User.checkAuthorizedTrack(userId,sourceId);
                if(!hasAccess) return 0;
                // get track
                const track = await trackDocument.findById(sourceId);
                if(!track) return 0;
                if(!track.images) track.images = [];
                // delete image from gridfs
                for(let image of track.images){
                    const imageFile = gfsImages.files.findOne({"metadata.imageId":mongoose.Types.ObjectId(image._id)});
                     const imageIdGridfs = imageFile ? imageFile._id : undefined;
                     if(!imageIdGridfs) continue;
                    await gfsImages.files.deleteOne({_id:imageIdGridfs});
                }
                // update images array
                track.images = [];
                // save 
                await track.save();
                return 1;
                break;}
            }
            case 'album':
                {// check if user is artist and has access to album
                const hasAccess = await  User.checkAuthorizedAlbum(userId,sourceId);
                if(!hasAccess) return 0;
                // get album
                const album = await Album.getAlbumById(sourceId);
                if(!album) return 0;
                if(!album.images) album.images = [];
                // delete image from gridfs
                for(let image of album.images){
                    const imageFile = gfsImages.files.findOne({"metadata.imageId":mongoose.Types.ObjectId(image._id)});
                     const imageIdGridfs = imageFile ? imageFile._id : undefined;
                     if(!imageIdGridfs) continue;
                    await gfsImages.files.deleteOne({_id:imageIdGridfs});
                }
                // update images array
                album.images = [];
                // save 
                await album.save();
                return 1;
                break;}
            case 'artist':
                {// check is user is the artist he claims to be
                const artist = await Artist.findMeAsArtist(userId);
                if(!artist) return 0;
                if(!artist.images) artist.images = [];
                // delete image from gridfs
                for(let image of artist.images){
                    const imageFile = gfsImages.files.findOne({"metadata.imageId":mongoose.Types.ObjectId(image._id)});
                     const imageIdGridfs = imageFile ? imageFile._id : undefined;
                     if(!imageIdGridfs) continue;
                    await gfsImages.files.deleteOne({_id:imageIdGridfs});
                }
                // update images array
                artist.images = [];
                // save 
                await artist.save();
                return 1;
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