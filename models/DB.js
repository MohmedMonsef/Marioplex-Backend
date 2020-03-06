const mongoose = require('mongoose');
const Schema= mongoose.Schema;

const Image=new Schema({ 
    height:Int8Array ,
    wedth:Int8Array ,
    URL:String
});

const ExternalId=new Schema({ 
  key:string ,
  value:string 
});

const Link=new Schema({
  URI:String,
  URI:String,
  href:String
});

const Track=new Schema({ 
  link:Link ,
  externalId:ExternalId ,
  availableMarkets:[String] ,
  discNumber:Int8Array ,
  trackNumber:Int8Array ,
  durationMs:Int32Array ,
  explicit:Boolean ,
  previewURL:String ,
  popularity:Int8Array ,
  name:String ,
  type:String ,
  isPlayable:Boolean ,
  acousticness:Float32Array ,
  analysisURL:String ,
  danceability:Float32Array ,
  energy:Float32Array ,
  instrumentalness:Float32Array ,
  key:Int8Array ,
  liveness:Float32Array ,
  loudness:Float32Array ,
  mode:Int32Array ,
  speechiness:Float32Array ,
  tempo:Float32Array ,
  timeSignature:Int32Array ,
  valence:Float32Array
});

const Playlist=new Schema({
  link:Link ,
  type:String ,
  collaborative:Boolean ,
  name:String ,
  isPublic:Boolean ,
  images:[Image] ,
  hasTracks:[{
    trackId: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }]
  
});

const Album=new Schema({
  images:[Image] ,
  link:Link ,
  externalId:ExternalId ,
  name:String ,
  type:String ,
  albumType:String ,
  popularity:Int8Array ,
  genre:String ,
  releaseDate:Date ,
  availableMarkets: [String] ,
  releaseDatePercision: String ,
  label:String ,
  hasTracks:[{
    trackId: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }]
  
});

const Category=new Schema({
  name:String ,
  href:String ,
  images:[Image] ,
  playlist:[Playlist]
});


const User=new Schema({ 
  email:String ,
  type:String ,
  password:String ,
  gender:String ,
  country:String ,
  isLogged:Boolean ,
  link:Link ,
  images:[Image] ,
  userType:String ,
  displayName:String ,
  product:String ,
  follow:[{
    id: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followedBy:[{
    id: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  like:[{
    trackId: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }],
  createPlaylist:[{
    playListId: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    addedAt:Date ,
    isLocal:Boolean ,
    collaboratorsId:[{
      id: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  followPlaylist:[{
    playListId: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist'
    
  }],
  saveAlbum:[{
    savedAt:Date,
    albumId: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  }],
  playHistory:[{
    tracks:{
      trackId: mongoose.Schema.Types.ObjectId,
      ref: 'Track'
    },
  addedAt:Date,
  type:string ,
  link:Link ,
  }]
});

const Artist=new Schema({ 
    info:String ,
    popularity:Int8Array,
    genre:[String] ,
    type:String ,
    user:{
      userId: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addAlbums:[{
      albumId: mongoose.Schema.Types.ObjectId,
      ref: 'Album'
    }],
    addTracks:[{
      trackId: mongoose.Schema.Types.ObjectId,
      ref: 'Track'
    }]

});

const Spotify=new Schema({
  artist:[Artist] ,
  album:[Album] ,
  user:[User] ,
  playlist:[Playlist] ,
  category:[Category] ,
  track:[Track]
});

module.exports=Spotify;


