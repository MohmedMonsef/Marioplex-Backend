const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');
var FuzzySearch = require('fuzzy-search');


// initialize db 
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
    getPlaylists : async function(){
        let playlist = await playlistDocument.find( {isPublic:true} ,(err,playlist)=>{
            if(err) return 0;
           return playlist;
        }).catch((err)=> 0);
        return playlist;


    
    },
    
    getUserByname  : async function(name){
        
        
        const user= await this.getUsers();
        if(user.length==0)return 0;
        return Fuzzysearch(name,'displayName',user);
        
            
},
    getArtist  : async function(name){
        
        // connect to db and find album with the same id then return it as json file
        // if found return album else return 0            
        Artist=[]
        let User = await this.getUserByname(name);
        if(User.length==0)return Artist;
        else{
            for( let i=0;i<User.length;i++){
            let artist = await artistDocument.find({user:{userId:User[i]._id}},(err,artist)=>{
                if(!err) Artist.push(artist);
            });
            }
            return Artist;
        
        }
    
    },
    getProfile  : async function(name){
        
        // connect to db and find album with the same id then return it as json file
        // if found return album else return 0            
        Artist=[]
        let User = await this.getUserByname(name);
        if(User.length==0) return Artist;
        let Artist = await this.getArtist(name);
        return User.filter(n => !Artist.includes(n));

    },
    getAlbum  : async function(albumName){
        
        // connect to db and find album with the same id then return it as json file
        // if found return album else return 0
        const album= await this.getAlbums();
        if(album.length==0)return 0;
        return Fuzzysearch(albumName,'name',album);
        
        

    },
    getPlaylist  : async function(Name){
        
        
        const playlist= await this.getPlaylists();
        if(playlist.length==0)return 0;
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