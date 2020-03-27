const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');
const spotify=require('../models/db');
const Album=require('./album-api');
const Track=require('./track-api');

 const Artist =  {


    createArtist: async function(userID,Info,name,Genre){

        let artist=new artistDocument({
            info:Info ,
            popularity:0,
            genre:Genre ,
            type:"Artist" ,
            Name:name,
            userId:userID,
            popularity:0,
            images:[], 
            addAlbums:[],
            addTracks:[]

        });
        await artist.save();
        console.log(artist);
        return artist;
    },
    // get artist by id
    // params : artist-id
    getArtist  : async function(ArtistID){
                    
            const artist = await artistDocument.findById(ArtistID,(err,artist)=>{
                if(err) return 0;
                return artist;
            }).catch((err)=> 0);
            return artist;
    },

    // create album for an artist
    // params : artist-id
    addAlbum  : async function(ArtistID,Name,Label,Avmarkets,Albumtype,ReleaseDate,Genre){
        let spotifyAlbums=spotify.album;
        let album=await new spotifyAlbums({
            name:Name ,
            albumType:Albumtype ,
            popularity:0 ,
            genre:Genre ,
            releaseDate:ReleaseDate ,
            availableMarkets: Avmarkets ,
            label:Label ,
            images:[] ,
            artistId:ArtistID ,
            type:"Album" ,
            popularity:0 ,
            hasTracks:[]
    
        }); 
        await album.save(function(err,albumobj){
            album=albumobj;
        });   
        const artist = await artistDocument.findById(ArtistID);
        artist.addAlbums.push({
            albumId:album._id
        });
        console.log(album);
       await artist.save();
         return album;
},
   // create album for an artist
    // params : artist-id
    addTrack  : async function(ArtistID,trackid){   
        const artist = await artistDocument.findById(ArtistID);
        artist.addTracks.push({
            trackId:trackid
        });
       await artist.save();
         
},
    // get several Artists
    // params : array of Artists ids
    getArtists : async function(artistsIDs){
        let artists = {};
        for(let artistID of artistsIDs){
            artists[artistID] = await this.getArtist(artistID);
            if(!artists[artistID])return 0;
        }
        return artists;
},
    // get specific Albums for an Artist
    getAlbums : async function(artistID,groups,country,limit,offset){
            let SpecificAlbums=[];
            let albums={};
            let artist = await this.getArtist(artistID);
            if(!artist)return 0;
        for(let i=0;i<artist.addAlbums.length;i++){
            albums[artist.addAlbums[i].albumId]=await Album.getAlbumById(artist.addAlbums[i].albumId);
        }

        if(groups!=undefined&&country!=undefined){
        for(let Album in albums){
            if(groups.includes(albums[Album].albumType)&&albums[Album].availableMarkets.includes(country)){
                SpecificAlbums.push(albums[Album]);
            }
        }
        }
        else if(groups==undefined&&country!=undefined){
            for(let Album in albums){
                if(albums[Album].availableMarkets.includes(country)){
                    SpecificAlbums.push(albums[Album]);
                }
            }
        }
        else if(groups!=undefined&&country==undefined) {
            for(let Album in albums){
                if(groups.includes(albums[Album].albumType)){
                    SpecificAlbums.push(albums[Album]);
                }
            }
        }
        else {
            for(let Album in albums){
                SpecificAlbums.push(albums[Album]); 
            }
        }
        
        let start=0;
        let end=SpecificAlbums.length;
        if(offset!=undefined){
        if(offset>=0&&offset<=SpecificAlbums.length){
            start=offset;
        }
    }
    if(limit!=undefined){
        if((start+limit)>0&&(start+limit)<=SpecificAlbums.length){
            end=start+limit;
        }
    }
      SpecificAlbums.slice(start,end);
        return SpecificAlbums;
},
getRelatedArtists : async function(artistID){
    let Artists;
    artistDocument.find({},function(err,artists){
        Artists=artists;
    });
    let artist = await this.getArtist(artistID);
    if(!Artists) return 0;
    if(!artist) return 0;
    let RelatedArtists=[];
    for(let Artist in Artists) {
        for(var i=0;i<Artists[Artist].genre.length;i++){
            for(var j=0;j<artist.genre.length;j++){
                if(Artists[Artist].genre[i]==artist.genre[j]){
                    RelatedArtists.push(Artists[Artist]);
                    continue;
                }
            }
        }
   } 
if(RelatedArtists.length>20) RelatedArtists.slice(0,20);
return RelatedArtists;
},
    // get top tracks of a country for an Artist
getTopTracks : async function(artistID,country){
        let TopTracks=[];
        let tracks={};
        let artist = await this.getArtist(artistID);
        if(!artist)return 0;
    for(let i=0;i<artist.addTracks.length;i++){
        let track=await Track.getTrack(artist.addTracks[i].trackId);
        if(track){tracks[artist.addTracks[i].trackId]=track;}
    }
    for(let track in tracks){
        console.log(tracks[track]);
        if(tracks[track].availableMarkets.includes(country)){
            TopTracks.push(tracks[track]);
        }
    }

    TopTracks.sort((a, b) => (a.popularity > b.popularity) ? -1 : 1);
    TopTracks.slice(0,10);
    return TopTracks;
},
getTracks : async function(artistID){
    let SpecificTracks=[];
    let tracks={};
    let artist = await this.getArtist(artistID);
    if(!artist)return 0;
for(let i=0;i<artist.addTracks.length;i++){
    let track=await Track.getTrack(artist.addTracks[i].trackId);
        if(track){tracks[artist.addTracks[i].trackId]=track;}
}
for(let Track in tracks){
        SpecificTracks.push(tracks[Track]);
}


return SpecificTracks;
},
}

module.exports = Artist;


