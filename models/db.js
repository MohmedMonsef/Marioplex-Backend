
const mongoose = require('mongoose');
const Schema= mongoose.Schema;

const Image=new Schema({ 
    height:Number ,
    wedth:Number ,
    URL:String
});

const ExternalId=new Schema({ 
  key:String ,
  value:String 
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
  discNumber:Number ,
  trackNumber:Number ,
  durationMs:Number ,
  explicit:Boolean ,
  previewURL:String ,
  popularity:Number ,
  name:String ,
  type:String ,
  isPlayable:Boolean ,
  acousticness:Number ,
  analysisURL:String ,
  danceability:Number ,
  energy:Number ,
  instrumentalness:Number ,
  key:Number ,
  liveness:Number ,
  loudness:Number ,
  mode:Number ,
  speechiness:Number ,
  tempo:Number ,
  timeSignature:Date ,
  valence:Number
});

const Playlist=new Schema({
  link:Link ,
  type:String ,
  collaborative:Boolean ,
  name:String ,
  isPublic:Boolean ,
  images:[Image] ,
  hasTracks:[{
    trackId: String,
    //ref: 'Track'
  }]
  
});

const Album=new Schema({
  images:[Image] ,
  link:Link ,
  externalId:ExternalId ,
  name:String ,
  type:String ,
  albumType:String ,
  popularity:Number ,
  genre:String ,
  releaseDate:Date ,
  availableMarkets: [String] ,
  releaseDatePercision: String ,
  label:String ,
  hasTracks:[{
    trackId: String,
    //ref: 'Track'
  }]
  
});

const Category=new Schema({
  name:String ,
  href:String ,
  images:[Image] ,
  playlist:[Playlist]
});


const User=new Schema({ 
  birthDate:Date ,
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
    id: String,
    //ref: 'User'
  }],
  followedBy:[{
    id: String,
    //ref: 'User'
  }],
  like:[{
    trackId: String
    //ref: 'Track'
  }],
  createPlaylist:[{
    playListId: String,
    //ref: 'Playlist',
    addedAt:Date ,
    isLocal:Boolean ,
    collaboratorsId:[{
      id: String,
      //ref: 'User'
    }]
  }],
  followPlaylist:[{
    playListId: String
    //ref: 'Playlist'
    
  }],
  saveAlbum:[{
    savedAt:Date,
    albumId: String,
    //ref: 'Album'
  }],
  playHistory:[{
    tracks:{
      trackId: String
      //ref: 'Track'
    },
  addedAt:Date,
  type:String ,
  link:Link ,
  }],
  player:{
    current_track:String,
    next_track:String,
    prev_track:String,
    is_playing:Boolean,
    is_shuffled:Boolean,
    is_repeat:Boolean,
    volume:Number
  }
});

const Artist=new Schema({ 
    info:String ,
    popularity:Number,
    genre:[String] ,
    type:String ,
    user:{
      userId: String
      //ref: 'User'
    },
    addAlbums:[{
      albumId: String
      //ref: 'Album'
    }],
    addTracks:[{
      trackId: String
      //ref: 'Track'
    }]

});

const user=mongoose.model('User',User);
const artist=mongoose.model('Artist',Artist);
const album=mongoose.model('Album',Album);
const track=mongoose.model('Track',Track);
const playlist=mongoose.model('Playlist',Playlist);
const category=mongoose.model('Category',Category);


module.exports={user,artist,album,track,playlist,category}


