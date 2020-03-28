const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');
var FuzzySearch = require('fuzzy-search');


// initialize db 
const artistApi=require('./Artist-api');
const connection=require('../DBconnection/connection');
const User=require('./user-api');
const track=require('./track-api');
const artist_api=require('./Artist-api');

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
    
    //problem
    getAlbum  : async function(albumName){
        
            const album= await this.getAlbums();
            if(album.length==0) return album;
            return Fuzzysearch(albumName,'name',album);   
    
    
    },
    getTrack : async function(Name){
        
            
            const track= await this.getTracks();
            if(track==0)return track;
            return Fuzzysearch(Name,'name',track); 
        
       
    
    },
    getTopResults :async function(Name){
        
        const artist= await this.getArtistProfile(Name);
        if(artist.length==0){
            let tracks = this.getTrack(Name);
            if(tracks.length==0) return [];
            else return tracks;
        }
        
        return artist[0]
    },
    getArtistProfile  : async function(name){
        
        Artist=[]
        let User = await this.getUserByname(name);
        if(User.length==0)return Artist;
        else{
            for( let i=0;i<User.length;i++){
                if(User[i].userType=="Artist"){
                    Artist.push(User[i]);
                }
            }
            return Artist;
        
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
   
    return removeDupliactes(results);
}

const removeDupliactes = (values) => {
    var Unique = values.filter(function(x) {
        return x._id ;
      });
    return Unique;
}
