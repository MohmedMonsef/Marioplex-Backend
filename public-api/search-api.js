const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');
var FuzzySearch = require('fuzzy-search');


// initialize db 
const artistApi=require('./artist-api');
const connection=require('../DBconnection/connection');
const User=require('./user-api');
const track=require('./track-api');

const Search =  {
    getUsers  : async function(){
        let user = await userDocument.find( {} ,(err,user)=>{
            if(err) return 0;
            return user;
        }).catch((err)=> 0);
        return user;

    },
    getAlbums : async function(){
        let album = await albumDocument.find( {} ,(err,album)=>{
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
    getPlaylists : async function(){
        let playlist = await playlistDocument.find( {isPublic:true} ,(err,playlist)=>{
            if(err) return 0;
           return playlist;
        }).catch((err)=> 0);
        return playlist;
    },
    getTracks :async function(){
        let track = await trackDocument.find( {} ,(err,track)=>{
            if(err) return 0;
           return track;
        }).catch((err)=> 0);
        return track;
    },
    
    
    getAlbum  : async function(albumName){
        
        let artist=this.getTopResults();
        if(artist==0){
        const album= await this.getAlbums();
        if(album.length==0)return album;
        return Fuzzysearch(albumName,'name',album);
        }
        else{
            return artistApi.getAlbums(artist);
        }
    },
    getTrack : async function(Name){
        const track= await this.getTracks();
        if(track.length==0)return track;
        return Fuzzysearch(Name,'name',track);

    },
    getTopResults :async function(Name){
        
        const artist= await this.getArtist(Name);
        if(artist.length==0){
            let tracks=this.getTrack(Name);
            if(tracks.length>0)return tracks[0];
            else return 0;
        }
        return artist[0];
    },
    getArtist  : async function(name){
        
        Artist=[]
        let User = await this.getUserByname(name);
        if(User.length==0)return Artist;
        else{
            for( let i=0;i<User.length;i++){
            if(User[i].userType=="Artist"){
                await artistDocument.find({user:{userId:User[i]._id}},(err,artist)=>{
                if(!err) Artist.push(User[i]);
            
            });
            }
            }
            return Artist;
        
        }
    
    },
    getUserProfile  : async function(name){
        
        let User = await this.getUserByname(name);
        if(User.length==0)return User;
        else{
            for( let i=0;i<User.length;i++){
            if(User[i].userType=="Artist"){
                User.splice(i,1);
            }
            }
            return User;
        }
    
    },
    getPlaylist  : async function(Name){

        const playlist= await this.getPlaylists();
        if(playlist.length==0)return playlist;
        return Fuzzysearch(Name,'name',playlist);
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
        if(Results.length==0){
            halfSubName=[]
            for( let i=0;i<subName.length;i++){
            len=subName.length;
            halfSubName.push(subName[i].substring(0, len / 2));
            halfSubName.push(subName[i].substring(len / 2));
            }
            for( let i=0;i<halfSubName.length;i++){
                results = search(halfSubName[i],field,schema);
                Results=Results.concat(results);
            }
        }
        
        return Results;
}