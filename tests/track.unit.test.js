const mockTrack = require('../source/track-api');
const mockUser = require('../source/user-api');
const mockArtist = require('../source/artist-api');
const mockAlbum = require('../source/album-api');
const mongoose = require('mongoose');
const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dbHandler = require('./db-handler');
const ObjectId = mongoose.Types.ObjectId;


let artist;
let album;
let track ;
let user;
let user2;
let user3;
let track2;
let artist2;
let track3;
let track4;
/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => {
    await dbHandler.connect();

    user = await mockUser.createUser("user1","123","b@b.com","male","eg","1/1/2020");
    user2 = await mockUser.createUser("user2","123","b2@b.com","male","eg","1/1/2020");
    user3 = await mockUser.createUser("user3","123","b3@b.com","male","eg","1/1/2020");
   user2.product = "premium";
   await user2.save();
   await mockUser.promoteToArtist(user._id,"artist info","artist1",["pop"]);
   await mockUser.promoteToArtist(user2._id,"artist info","artist1",["pop"]);
   artist =  await mockArtist.findMeAsArtist(user._id);
   artist2 =  await mockArtist.findMeAsArtist(user2._id);
   user = await mockUser.getUserById(user._id);
   album = await mockArtist.addAlbum(artist._id,"album1","label1",["eg"],"Single","1/1/2020","pop");

   track =  await mockTrack.createTrack("","track1",12,["eg"],artist._id,album._id,100,"12","13",["pop"]);
   track2 =  await mockTrack.createTrack("","track2",12,["eg"],artist._id,album._id,100,"12","13",["pop"]);
   track3 =  await mockTrack.createTrack("","track2",12,null,artist._id,album._id,100,"12","13",null);
   track4 =  await mockTrack.createTrack("","track2",12,["eg"],artist._id,album._id,100,"12","13",["rock"]);
  
   await mockArtist.addTrack(artist._id, track._id);
   await mockAlbum.addTrack(album._id, track);
   await mockArtist.addTrack(artist._id, track2);
   //await mockAlbum.addTrack(album._id, track2);
  
    
});



afterEach(async () => {
   // console.log(user);
    user = await mockUser.getUserById(user._id);
    user2 = await mockUser.getUserById(user2._id);
    user3 = await mockUser.getUserById(user3._id);
    album = await mockAlbum.getAlbumById(album._id);
    artist = await mockArtist.getArtist(artist._id);
    artist2 = await mockArtist.getArtist(artist2._id);
    track = await mockTrack.getTrack(track._id,user);
    track2 = await mockTrack.getTrack(track2._id,user);
    track3 = await mockTrack.getTrack(track3._id,user);
    track4 = await mockTrack.getTrack(track4._id,user);
    //await dbHandler.clearDatabase();
});

/**
 * Remove and close the db and server.
 */
afterAll(async () => {
   await dbHandler.clearDatabase();
    await dbHandler.closeDatabase();
});



test('get track with id',async () => {
 
    const getTrack = await mockTrack.getTrack(track._id);
    expect(getTrack.albumId).toEqual(album._id);

 
})
test('get unauthorized track track with id',async () => {
 
    const getTrack = await mockTrack.getTrackWithoutAuth(track._id);
    expect(getTrack.albumId).toEqual(album._id);

 
})
test('get unauthorized track track with wrong id',async () => {
 
    const getTrack = await mockTrack.getTrackWithoutAuth(ObjectId());
    //console.log(getTrack)
    expect(getTrack).toBeFalsy();

 
})
test('get unauthorized track track with wrong nogoose id',async () => {
 
    const getTrack = await mockTrack.getTrackWithoutAuth("1");
    //console.log(getTrack)
    expect(getTrack).toBeFalsy();

 
})
test('get track with wrong id  ',async () => {
    const id = ObjectId();
    const getTrack = await mockTrack.getTrack(id);
    expect(getTrack).toBeFalsy();

 
})



test('get tracks all correct ids',async ()=>{
    const getTrack = await mockTrack.getTracks([track._id]);
    expect(getTrack.length).toEqual(1);
})

test('get tracks all correct ids excpet two ',async ()=>{
    const getTrack = await mockTrack.getTracks([track._id,String(ObjectId()),String(ObjectId())]);
    expect(getTrack.length).toEqual(1);
})
test('get tracks wrong id ',async ()=>{
    const getTrack = await mockTrack.getTracks(["10"]);
    expect(getTrack).toBeFalsy();
})

test('get track with id 10 which is not found',async () => {
    expect(await mockTrack.getTrack("10")).toEqual(0);
})


test("get audio featureof non existing track",async ()=>{
    const audioFeatures = await mockTrack.getAudioFeaturesTrack(ObjectId());
    expect(audioFeatures).toBeFalsy();
})
test("get audio features with correct tracks id",async ()=>{
    const audioFeatures = await mockTrack.getAudioFeaturesTracks([track._id]);
    expect(audioFeatures).toBeTruthy();
})
test("get audio features with correct track id and one wrong id",async ()=>{
    const audioFeatures = await mockTrack.getAudioFeaturesTracks([track._id,ObjectId()]);
    expect(audioFeatures).toBeTruthy();
})
test("get audio features with wrong tracks id",async ()=>{
    const audioFeatures = await mockTrack.getAudioFeaturesTracks([ObjectId()]);
    expect(audioFeatures).toBeFalsy();
})
test("get audio features with non mongoose tracks id",async ()=>{
    const audioFeatures = await mockTrack.getAudioFeaturesTracks(["1"]);
    expect(audioFeatures).toBeFalsy();
})


test("check if user like track he dont like",async ()=>{
    expect(await mockTrack.checkIfUserLikeTrack(user,track._id)).toBeFalsy();
})
test('user like track with wrong mongoose id',async () => {
    const likedTrack = await mockTrack.likeTrack("1");
    expect(likedTrack).toBeFalsy();
   
})
test('user like non existing track track ',async () => {
    const likedTrack = await mockTrack.likeTrack(ObjectId());
    expect(likedTrack).toBeFalsy();
   
})
test('user like track with wrong mongoose id',async () => {
    const likedTrack = await mockTrack.likeTrack("1");
    expect(likedTrack).toBeFalsy();

   
})
test('user like track',async () => {
    const likedTrack = await mockUser.likeTrack(user._id,track._id);
    expect(likedTrack).toBeTruthy();

   
})
test('user2 like track',async () => {
    const likedTrack = await mockUser.likeTrack(user2._id,track._id);
    expect(likedTrack).toBeTruthy();

   
})

test('user2 like non mongoose id track',async () => {
    const likedTrack = await mockUser.likeTrack(user2._id,"1");
    expect(likedTrack).toBeFalsy(); 
})
test('non existing user like  track',async () => {
    const likedTrack = await mockUser.likeTrack(ObjectId(),track._id);
    expect(likedTrack).toBeFalsy(); 
})






test(' unlike non mongoose id track',async () => {
    const likedTrack = await mockTrack.unlikeTrack("1");
    expect(likedTrack).toBeFalsy();
   
})
test(' unlike non existing id track',async () => {
    const likedTrack = await mockTrack.unlikeTrack(ObjectId());
    expect(likedTrack).toBeFalsy();
   
})

test('check if user like track 1 which is false',async () => {
    expect(await mockTrack.checkIfUserLikeTrack(user, "1")).toBeFalsy();
})

test('check if user like track ',async () => {
    expect(await mockTrack.checkIfUserLikeTrack(user,track._id)).toBeTruthy();
})




test('user like already liked  track ',async () => {
    expect(await mockUser.likeTrack(user._id,track._id)).toBeFalsy();
})

test('user unlike  track  which he liked before',async () => {
    expect(await mockUser.unlikeTrack(user._id,track._id)).toBeTruthy();
})

test('user unlike   track with  which he already unliked',async () => {
    expect(await mockUser.unlikeTrack(user._id,track._id)).toBeFalsy();
})

test('non existing user unlike  track  which he liked before',async () => {
    expect(await mockUser.unlikeTrack(ObjectId(),track._id)).toBeFalsy();
})

test('user un like non existing track',async () => {
    expect(await mockUser.unlikeTrack(user._id,ObjectId())).toBeFalsy();
})
test('non mongoose id unlike track',async () => {
    expect(await mockUser.unlikeTrack("1",track._id)).toBeFalsy();
})

test("create track with no artist or album",async ()=>{
    expect(await mockTrack.createTrack()).toBeFalsy();
})
test('create track with wrong artist and albumid',async () => {
    const track = await mockTrack.createTrack("","track3",12,undefined,"2","1",100,"12","13",["pop"]);
    expect(track).toBeFalsy();
})
test('create track with no available market',async () => {
    const track = await mockTrack.createTrack("","track3",12,undefined,artist._id,album._id,100,"12","13",["pop"]);
    expect(track).toBeTruthy();
})





test('get audio features for track with id 1',async () => {
    expect(await mockTrack.getAudioFeaturesTrack(track._id)).toBeTruthy();
})

test('get audio features for track with id 0 which doesnt exist',async () => {
    expect(await mockTrack.getAudioFeaturesTrack("0")).toBeFalsy();
})




test('get full track with right parameters',async ()=>{
    const getFullTrack = await mockTrack.getFullTrack(track._id,user);
    expect(getFullTrack).toBeTruthy();
});
test('get full track with rwrong mongoose id',async ()=>{
    const getFullTrack = await mockTrack.getFullTrack('1',user);
    expect(getFullTrack).toBeFalsy();
});
test('get full track with non existing trackid',async ()=>{
    const getFullTrack = await mockTrack.getFullTrack(ObjectId(),user);
    expect(getFullTrack).toBeFalsy();
});



test("delete track with wrong mongoose id",async ()=>{
    const deletedTrack = await mockTrack.deleteTrack("1","2");
    expect(deletedTrack).toBeFalsy();
})

test("delete track with non existing user",async ()=>{
    const deletedTrack = await mockTrack.deleteTrack(ObjectId(),track2._id);
    expect(deletedTrack).toBeFalsy();
})

test("delete track with non existing track",async ()=>{
    const deletedTrack = await mockTrack.deleteTrack(user._id,ObjectId());
    expect(deletedTrack).toBeFalsy();
})

test("delete track with non existing artist",async ()=>{
    const deletedTrack = await mockTrack.deleteTrack(user3._id,track2._id);
    expect(deletedTrack).toBeFalsy();
})

test("delete track with not same artist",async ()=>{
    const deletedTrack = await mockTrack.deleteTrack(user2._id,track2._id);
    expect(deletedTrack).toBeFalsy();
})
/*
test("delete track with of artist which is not in album",async ()=>{
    const deletedTrack = await mockTrack.deleteTrack(user._id,track2._id);
    expect(deletedTrack).toBeFalsy();
})
*/
test("get related tracks of non existing track",async ()=>{
    const relatedTracks = await mockTrack.getRelatedTrack(ObjectId());
    expect(relatedTracks).toBeFalsy();
})
test("get related tracks of non mongoose id of track",async ()=>{
    const relatedTracks = await mockTrack.getRelatedTrack("1");
    expect(relatedTracks).toBeFalsy();
})

test("get related tracks of track",async ()=>{
    const relatedTracks = await mockTrack.getRelatedTrack(track._id);
    expect(relatedTracks).toBeTruthy();
})
test("get related tracks of track with no genre",async ()=>{
    const relatedTracks = await mockTrack.getRelatedTrack(track3._id);
    expect(relatedTracks).toBeFalsy();
})
test("get related tracks of track with no relations",async ()=>{
    const relatedTracks = await mockTrack.getRelatedTrack(track4._id);
    expect(relatedTracks).toBeFalsy();
})



test("get full related tracks of non existing track",async ()=>{
    const relatedTracks = await mockTrack.getFullRelatedTracks(user._id,ObjectId());
    expect(relatedTracks).toBeFalsy();
})

test("get full related tracks of non existing user",async ()=>{
    const relatedTracks = await mockTrack.getFullRelatedTracks(ObjectId(),ObjectId());
    expect(relatedTracks).toBeFalsy();
})
test("get  full related tracks of non mongoose id of track",async ()=>{
    const relatedTracks = await mockTrack.getFullRelatedTracks(user._id,"1");
    expect(relatedTracks).toBeFalsy();
})

test("get full related tracks of track",async ()=>{
    const relatedTracks = await mockTrack.getFullRelatedTracks(user._id,track._id);
    expect(relatedTracks).toBeTruthy();
})
test("get full related tracks of track with no genre",async ()=>{
    const relatedTracks = await mockTrack.getFullRelatedTracks(user._id,track3._id);
    expect(relatedTracks).toBeTruthy();
})
test("get full related tracks of track with no relations",async ()=>{
    const relatedTracks = await mockTrack.getFullRelatedTracks(user._id,track4._id);
    expect(relatedTracks).toBeTruthy();
})

test("check playable for track in my country",async ()=>{
    const isPlayable = await mockTrack.checkPlayable(user,track._id);
    expect(isPlayable).toBeTruthy();
})
test("check playable whith no user supplied",async ()=>{
    const isPlayable = await mockTrack.checkPlayable(undefined,track._id);
    expect(isPlayable).toBeFalsy();
})
test("check playable whith false track id",async ()=>{
    const isPlayable = await mockTrack.checkPlayable(user,"1");
    expect(isPlayable).toBeFalsy();
})
test("check playable for premium",async ()=>{
    const isPlayable = await mockTrack.checkPlayable(user2,track._id);
    expect(isPlayable).toBeTruthy();
})
test("check playable for track with no available markets",async ()=>{
  //  console.log(track3)
    const isPlayable = await mockTrack.checkPlayable(user,track3._id);
    expect(isPlayable).toBeFalsy();
})

test("check playable for non existing tracks",async ()=>{
    //  console.log(track3)
      const isPlayable = await mockTrack.checkPlayable(user,ObjectId());
      expect(isPlayable).toBeFalsy();
})


test("update track with non mongoose id",async ()=>{
    const updatedTrack = await mockTrack.updateTrack(user._id,"1",undefined);
    expect(updatedTrack).toBeFalsy();
})
test("update track with no body",async ()=>{
    const updatedTrack = await mockTrack.updateTrack(user._id,ObjectId(),undefined);
    expect(updatedTrack).toBeFalsy();
})
test("update track with non existing track",async ()=>{
    const updatedTrack = await mockTrack.updateTrack(user._id,ObjectId(),{name:"track4"});
    expect(updatedTrack).toBeFalsy();
})
test("update track with non existing user",async ()=>{
    const updatedTrack = await mockTrack.updateTrack(ObjectId(),ObjectId(),{name:"track4"});
    expect(updatedTrack).toBeFalsy();
})
test("update track artist that is not user",async ()=>{
    const updatedTrack = await mockTrack.updateTrack(user3._id,track3._id,{name:"track4"});
    expect(updatedTrack).toBeFalsy();
})
test("update track with right parameters",async ()=>{
    const updatedTrack = await mockTrack.updateTrack(user._id,track2._id,{name:"track4"});
    expect(updatedTrack).toBeTruthy();
})
test("update track with right parameters",async ()=>{
    const updatedTrack = await mockTrack.updateTrack(user._id,track2._id,{key:"track4"});
    expect(updatedTrack).toBeTruthy();
})
test("update track with right parameters",async ()=>{
    const updatedTrack = await mockTrack.updateTrack(user._id,track2._id,{keyId:"track4"});
    expect(updatedTrack).toBeTruthy();
})
test("update track with right parameters",async ()=>{
    const updatedTrack = await mockTrack.updateTrack(user._id,track2._id,{genre:["g"]});
    expect(updatedTrack).toBeTruthy();
})
test("update track with wrong body parameters",async ()=>{
    const updatedTrack = await mockTrack.updateTrack(user._id,track2._id,{leg:["g"]});
    expect(updatedTrack).toBeTruthy();
})