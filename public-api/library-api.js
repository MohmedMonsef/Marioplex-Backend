const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const spotify = require('../models/db');
const Album = require('./album-api');
const Track = require('./track-api');
const artist_api = require('./artist-api');
const checkMonooseObjectID = require('../validation/mongoose-objectid')
 const Library =  {
     /**
     * check if user saves albums
     * @param {Array<string>} albumsIds - array of albums' id
     * @param {string} userId - user id
     * @returns {Array<boolean>} 
     */   
    //check if user saves albums
    //params: array of AlbumsIDs, UserID
    checkSavedAlbums  : async function(albumsIds,userId){
        if(!checkMonooseObjectID(albumsIds)) return 0;
        if(!checkMonooseObjectID([userId])) return 0;
        let checks=[];
        let found=false;
        const user = await userDocument.findById(userId,(err,user)=>{
            if(err) return 0;
            return user;
        }).catch((err)=> 0);
        if(!user.saveAlbum) user.saveAlbum = [];
        for (var i=0;i<albumsIds.length;i++){
            found=false;
            
            for(let Album in user.saveAlbum){
                if(user.saveAlbum[Album].albumId==albumsIds[i]){
                    checks.push(true);
                    found=true;
                }
            }
            if(!found){
                checks.push(false);
            }
        }    
        return checks;   

    },
    /**
     * check if user saves tracks
     * @param {Array<string>} tracksIds - array of tracks' id
     * @param {string} userId - user id
     * @returns {Array<boolean>} 
     */
    //check if user saves tracks
    //params: array of TracksIDs, UserID
    checkSavedTracks  : async function(tracksIds,userId){
        if(!checkMonooseObjectID([userId])) return 0;
        if(!checkMonooseObjectID(tracksIds)) return 0;
        let checks=[];
        let found=false;
        const user = await userDocument.findById(userId,(err,user)=>{
            if(err) return 0;
            return user;
        }).catch((err)=> 0);
        if(!user.like) user.like = [];
        for (var i=0;i<tracksIds.length;i++){
            found=false;
            for(let Track in user.like){
                if(user.like[Track].trackId==tracksIds[i]){
                    checks.push(true);
                    found=true;
                }
            }
            if(!found){
                checks.push(false);
            }
        }
        return checks;
       
    },
    /**
     * get  saved albums for a specific user
     * @param {number} [limit] - the maximum number of objects to return
     * @param {number} [offset] - the index of the first object to return
     * @param {string} userId - user id
     * @returns {Array<object>} - array of albums' object
     */
    //get  saved albums for a user
    //params: UserID, limit, offset
    getSavedAlbums : async function(userId,limit,offset){
        if(!checkMonooseObjectID([userId])) return 0;
        let albums = [];
        let user = await userDocument.findById(userId);
        if(!user) return 0;
        if(!user.saveAlbum) user.saveAlbum = [];
        if(!user.saveAlbum.length) return 0;
        for(let i=0;i<user.saveAlbum.length;i++){ 
            let album=await Album.getAlbumById(user.saveAlbum[i].albumId);
            if(album) albums.push(album);
        }

        let start=0;
        let end=(albums.length>20)?20:albums.length;
        if(offset!=undefined){
            if(offset>=0&&offset<=albums.length){
                start=offset;
            }
        }
        if(limit!=undefined){
            if((start+limit)>0&&(start+limit)<=albums.length){
                end=start+limit;
            }
        }
        albums.slice(start,end);
        albumInfo=[]
        for(let i=0;i<albums.length;i++){
            let album=await Album.getAlbumArtist(albums[i]._id,UserID);
            if(album){
                albumInfo.push(album);
            }

        }
        return albumInfo;

    },
    /**
     * get  saved tracks for a specific user
     * @param {number} [limit] - the maximum number of objects to return
     * @param {number} [offset] - the index of the first object to return
     * @param {string} userId - user id
     * @returns {Array<object>} - array of tracks' object
     */  
    //get  saved traks for a user
    //params: UserID, limit, offset
    getSavedTracks : async function(userId,limit,offset){
        if(!checkMonooseObjectID([userId])) return 0;
        let tracksAll=[];
        let user = await userDocument.findById(userId);
        if(!user)return 0;
        if(!user.like) user.like = [];
        if(!user.like.length){return 0;}
        for(let i=0;i<user.like.length;i++){
            let track=await Track.getTrack(user.like[i].trackId);
            if(track) tracksAll.push(track);
        }
        let start=0;
        let end=(tracksAll.length>20)?20:tracksAll.length;
        if(offset!=undefined){
            if(offset>=0&&offset<=tracksAll.length){
                start=offset;
            }
        }
        if(limit!=undefined){
            if((start+limit)>0&&(start+limit)<=tracksAll.length){
                end=start+limit;
            }

        }
        tracksAll.slice(start,end);
        trackInfo=[]
        for( let i=0;i<tracksAll.length;i++){
            let artist=await artist_api.getArtist(tracksAll[i].artistId)
            tracks={}
            if(artist){               
                tracks["artistId"]=artist._id
                tracks["artistName"]=artist.Name
                tracks["artistimages"]=artist.images
                tracks["artistType"]=artist.type
            }
            let album=await Album.getAlbumById(tracksAll[i].albumId)
            if(album){
                tracks["albumId"]=album._id
                tracks["albumName"]=album.name
                tracks["albumImages"]=album.images
                tracks["albumType"]=album.type
            }
            tracks["_id"]=tracksAll[i]._id
            tracks["name"]=tracksAll[i].name
            tracks["type"]=tracksAll[i].type
            tracks["images"]=tracksAll[i].images
            trackInfo.push(tracks);
        }
        return { "tracks": trackInfo, "ownerName": user.displayName, playlistId: user['likesTracksPlaylist'] };

    }


}

module.exports = Library;