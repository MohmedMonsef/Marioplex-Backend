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
  externalId:mongoose.Schema.Types.ObjectId ,
  artistId:mongoose.Schema.Types.ObjectId,
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
  snapshot:[{
  hasTracks:[mongoose.Schema.Types.ObjectId ],  //ref: 'Track',
  action:String
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
    trackId: mongoose.Schema.Types.ObjectId,
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
    id: mongoose.Schema.Types.ObjectId,
    //ref: 'User'
  }],
  followedBy:[{
    id: mongoose.Schema.Types.ObjectId,
    //ref: 'User'
  }],
  like:[{
    trackId: mongoose.Schema.Types.ObjectId
    //ref: 'Track'
  }],
  createPlaylist:[{
    playListId: mongoose.Schema.Types.ObjectId,
    //ref: 'Playlist',
    addedAt:Date ,
    isPrivate:Boolean ,
    collaboratorsId:[mongoose.Schema.Types.ObjectId ]
  }],
  followPlaylist:[{
    playListId: mongoose.Schema.Types.ObjectId,
    isPrivate:Boolean
    //ref: 'Playlist'
    
  }],
  saveAlbum:[{
    savedAt:Date,
    albumId: mongoose.Schema.Types.ObjectId,
    //ref: 'Album'
  }],
  playHistory:[{
    tracks:{
      trackId: mongoose.Schema.Types.ObjectId
      //ref: 'Track'
    },
  addedAt:Date,
  type:String ,
  link:Link ,
  }]
});

const Artist=new Schema({ 
    info:String ,
    popularity:Number,
    genre:[String] ,
    type:String ,
    Name:String,
    images:[Image],
    userId: mongoose.Schema.Types.ObjectId
      //ref: 'User'
    ,
    addAlbums:[{
      albumId: mongoose.Schema.Types.ObjectId
      //ref: 'Album'
    }],
    addTracks:[{
      trackId: mongoose.Schema.Types.ObjectId
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

