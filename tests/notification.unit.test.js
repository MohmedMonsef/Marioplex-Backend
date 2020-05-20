require("../config/firebase-config")(); // set up google drive
const mockTrack = require('../source/track-api');
const mockPlaylist = require('../source/playlist-api');
const mockUser = require('../source/user-api');
const mockArtist = require('../source/artist-api');
const mockAlbum = require('../source/album-api');
const mockNotification = require('../source/notification-api');
const mongoose = require('mongoose');
const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dbHandler = require('./db-handler');
const ObjectId = mongoose.Types.ObjectId;
let playlist1;
let artist;
let artist2;
let artist3;
let album;
let album2;
let track ;
let user;
let user2;
let user3;
let track2;
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
   await mockUser.promoteToArtist(user._id,"artist info","artist1",["pop"]);
   await mockUser.promoteToArtist(user2._id,"artist info","artist2",["pop"]);
   await mockUser.promoteToArtist(user3._id,"artist info","artist3",["jazz"]);
   artist =  await mockArtist.findMeAsArtist(user._id);
   artist2 =  await mockArtist.findMeAsArtist(user2._id);
   artist3 =  await mockArtist.findMeAsArtist(user3._id);
   await mockUser.userFollowArtist(user2._id,artist._id);
   playlist1=await mockUser.createdPlaylist(user2._id,"lili","hello kids");

   user = await mockUser.getUserById(user._id);
   user2 = await mockUser.getUserById(user2._id);
   user3 = await mockUser.getUserById(user3._id);
   user2.fcmToken="e9vWf4uchpbXb6i91xZL25:APA91bFLbqGvC9GO4OjCgMMvTCVzCDa06bxyE9jaXEFeGy8w2tIrBXvVHlzQAragc49O0Y86WfIZ5TZ5tEcYjNHpILPHrNtd6yFHkAzdfcsH6EoJUuocDVSXLe4hJEwEwtAxxN6V4972";
  await user2.save();
  user2 = await mockUser.getUserById(user2._id);
   album = await mockArtist.addAlbum(artist._id,"album1","label1",["eg"],"Album","1/1/2020","pop");

   track =  await mockTrack.createTrack("","track1",12,["eg"],artist._id,album._id,100,"12","13",["pop"]);

   
    
});



afterEach(async () => {
   // console.log(user);
   playlist1=await mockPlaylist.getPlaylist(playlist1._id);
    user = await mockUser.getUserById(user._id);
    user2 = await mockUser.getUserById(user2._id);
    user3 = await mockUser.getUserById(user3._id);
    album = await mockAlbum.getAlbumById(album._id);
    artist = await mockArtist.getArtist(artist._id);
    artist2 = await mockArtist.getArtist(artist2._id);
    artist3 = await mockArtist.getArtist(artist3._id);
    track = await mockTrack.getTrack(track._id,user);

    //await dbHandler.clearDatabase();
});

/**
 * Remove and close the db and server.
 */
afterAll(async () => {
   await dbHandler.clearDatabase();
    await dbHandler.closeDatabase();
});


test('Artist upload track online notification',async ()=>{
    
    expect(await mockNotification.sendArtistNotification(artist,track)).toEqual(  
        1
      );
 })
 test('Artist upload album online notification',async ()=>{
    
    expect(await mockNotification.sendArtistAlbumNotification(artist,album)).toEqual(  
        1
      );
 })


 test('User viewed user profile online notification',async ()=>{
    
    expect(await mockNotification.sendProfileNotification(user,user2)).toEqual(  
        1
      );
 })

 test('User followed user playlist online notification',async ()=>{

    expect(await mockNotification.sendPlaylistNotification(user,user2,playlist1)).toEqual(  
        1
      );
 })
 test('Artist upload track offline notification',async ()=>{
    user2.fcmToken="none";
    await user2.save();
    expect(await mockNotification.sendArtistNotification(artist,track)).toEqual(  
        1
      );
 })
 test('Artist upload album offline notification',async ()=>{
    user2.fcmToken="none";
    await user2.save();
    expect(await mockNotification.sendArtistAlbumNotification(artist,album)).toEqual(  
        1
      );
 })

 test('User viewed user profile offline notification',async ()=>{
    user2.fcmToken="none";
    await user2.save();
    expect(await mockNotification.sendProfileNotification(user,user2)).toEqual(  
        0
      );
 })
 test('User followed user playlist offline notification',async ()=>{
    user2.fcmToken="none";
    await user2.save();
    expect(await mockNotification.sendPlaylistNotification(user,user2,playlist1)).toEqual(  
        0
      );
 })