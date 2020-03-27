const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');
var FuzzySearch = require('fuzzy-search');


// initialize db 
const artistApi=require('./Artist-api');
const connection=require('../DBconnection/connection');
const user_api=require('./user-api');
const track=require('./track-api');
const artist_api=require('./Artist-api');
const album_api=require('./album-api');

const Search =  {
    getUsers  : async function(){
        let user = await userDocument.find({} ,(err,user)=>{
            if(err) return 0;
            return user;
        }).catch((err)=> 0);
        return user;

    },
    getAlbums : async function(){
        let album = await albumDocument.find({} ,(err,album)=>{
            if(err) return 0;
            return album;
        }).catch((err)=> 0);
        return album;
    },
    getUserByname  : async function(name){
        
        
        const user= await this.getUsers();
        if(user.length==0)return 0;
        return Fuzzysearch(name,'displayName',user);
        
            
    },
    getTop :async function(Name){
        
        const artist= await this.getArtistProfile(Name);
        if(artist){
            console.log(artist)
            return artist[0]._id;
        }
        return 0;
    },
    getPlaylists : async function(){
        let playlist = await playlistDocument.find( {isPublic:true} ,(err,playlist)=>{
            if(err) return 0;
           return playlist;
        }).catch((err)=> 0);
        return playlist;
    },
    getTracks :async function(){
        let track = await trackDocument.find({} ,(err,track)=>{
            if(err) return 0;
           return track;
        }).catch((err)=> 0);
        return track;
    },
    
    
    getAlbum  : async function(albumName,groups,country,limit,offset){
            
            var album;
            let artist=await this.getTop(albumName)
            if(artist){
                console.log(artist)
                album=await artistApi.getAlbums(artist,groups,country,limit,offset);
            }
            else{
                console.log(artist)
                album= await this.getAlbums();
                if(album.length==0) return album;
                album= Fuzzysearch(albumName,'name',album);  
            
            }
            Album={}
            for(let i=0;i<album.length;i++){
                let albums=await album_api.getAlbumArtist(album[i]._id);
                if(albums){
                    album={}
                    album["_id"]=albums.Album._id
                    album["name"]=albums.Album.name
                    album["images"]=albums.Album.images
                    album["type"]=albums.Album.type
                    artist={}
                    artist["_id"]=albums.Artist._id
                    artist["name"]=albums.Artist.Name
                    artist["images"]=albums.Artist.images
                    artist["info"]=albums.Artist.info
                    artist["type"]=albums.Artist.type
                    artist["genre"]=albums.Artist.genre
                    Album[i]={album,artist}
                    
                }
            }
            return Album;
    
    
    },
    getTrack : async function(Name){
        
            var Track;
            let artist=await this.getTop(Name)
            if(artist){
                Track=await artistApi.getTracks(artist);
            }
            else{
                const track= await this.getTracks();
                if(track==0)return track;
                Track= Fuzzysearch(Name,'name',track); 
            
            }
            trackInfo={}
            for( let i=0;i<Track.length;i++){
                let artist=await artist_api.getArtist(Track[i].artistId)
                Artist={}
                if(artist){
                    
                    Artist["_id"]=artist._id
                    Artist["name"]=artist.Name
                    Artist["images"]=artist.images
                    Artist["info"]=artist.info
                    Artist["type"]=artist.type
                }
                Album={}
                let album=await album_api.getAlbumById(Track[i].albumId)
                if(album){
                    
                    Album["_id"]=album._id
                    Album["name"]=album.name
                    Album["images"]=album.images
                    Album["type"]=album.type
                }
                tracks={}
                tracks["_id"]=Track[i]._id
                tracks["name"]=Track[i].name
                tracks["type"]=Track[i].type
                tracks["images"]=Track[i].images
                trackInfo[i]={track:tracks,artist:Artist,album:Album}
            
        }
        return trackInfo;
            

    },
    getTopResults :async function(Name){
        
        const artist= await this.getTop(Name);
        if(artist){
            return await this.getTracks(Name)[0]
        }
        
        return await this.getArtistProfile(Name)[0];
    },
    getArtistProfile  : async function(name){
        
        let ArtistInfo={};
        let User = await this.getUserByname(name);
        if(User.length==0)return ArtistInfo;
        else{
            for( let i=0;i<User.length;i++){
                if(User[i].userType=="Artist"){

                   let artist= await this.getArtist(User[i]._id);
                   console.log(artist);
                   if(!artist){
                       Artist={}
                       Artist["_id"]=artist[0]._id
                       Artist["name"]=artist[0].Name
                       Artist["images"]=artist[0].images
                       Artist["info"]=artist[0].info
                       Artist["type"]=artist[0].type
                       Artist["genre"]=artist[0].genre
                       ArtistInfo[i]=Artist

                   }

                }
            }
            return ArtistInfo;
        
        }
    
    },
    getArtist  : async function(artistID){
        let artist = await artistDocument.find({userId:artistID} ,(err,artist)=>{
            if(err) return 0;
           return artist;
        }).catch((err)=> 0);
        return artist;
    },
    
    getUserProfile  : async function(name){
        
        UserInfo={}
        let User = await this.getUserByname(name);
        if(User.length==0)return User;
        else{
            for( let i=0;i<User.length;i++){
                if(User[i].userType=="Artist"){
                    User.splice(i,1);
                }
                else{
                    user={}
                    user["_id"]=User[i]._id
                    user["displayName"]=User[i].displayName
                    user["images"]=User[i].images
                    user["type"]=User[i].type
                    UserInfo[i]=user
                }
            }
            
            return UserInfo;
        }
    
    },
    getPlaylist  : async function(Name){

        let playlist= await this.getPlaylists();
        if(playlist.length==0) return playlist;
        playlist= Fuzzysearch(Name,'name',playlist);
        playlistInfo={}
        for( let i=0;i<playlist.length;i++){
                let User=await user_api.getUserById(playlist[i].ownerId)
                if(User){
                    user={}
                    user["_id"]=User._id
                    user["displayName"]=User.displayName
                    user["images"]=User.images
                    user["type"]=User.type
                }
                Playlist={}
                Playlist["_id"]=playlist[i]._id
                Playlist["name"]=playlist[i].name
                Playlist["type"]=playlist[i].type
                Playlist["images"]=playlist[i].images
                playlistInfo[i]={playlist:Playlist,owner:user}
            
        }
        return playlistInfo;
    

    }
}
module.exports=Search;

function search(name,field,schema){
    const searcher = new FuzzySearch(schema, [field], {
        caseSensitive: false, sort:true
      });
      const users = searcher.search(name);
      return users;
}

function Fuzzysearch(name,field,schema){
    Results=[]
    subName=name.split(' ');
    let results = search(name,field,schema);
    Results=Results.concat(results);
    for( let i=0;i<subName.length;i++){
        results = search(subName[i],field,schema);
        Results=Results.concat(results);
    }
   
    return removeDupliactes(results);
}

const removeDupliactes = (values) => {
    var Unique = values.filter(function(x) {
        return x._id ;
      });
    return Unique;
}
