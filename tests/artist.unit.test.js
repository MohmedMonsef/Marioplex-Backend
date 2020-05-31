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
let artist2;
let artist3;
let album;
let album2;
let track ;
let user;
let user2;
let user3;
let user4;
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
    user4 = await mockUser.createUser("user4","123","b3@b.com","male","eg","1/1/2020");
   await mockUser.promoteToArtist(user._id,"artist info","artist1",["pop"]);
   await mockUser.promoteToArtist(user2._id,"artist info","artist2",["pop"]);
   await mockUser.promoteToArtist(user3._id,"artist info","artist3",["jazz"]);

   artist =  await mockArtist.findMeAsArtist(user._id);
   artist2 =  await mockArtist.findMeAsArtist(user2._id);
   artist3 =  await mockArtist.findMeAsArtist(user3._id);
   await mockUser.userFollowArtist(user2._id,artist._id);
   await mockUser.userFollowArtist(user3._id,artist._id);

   user = await mockUser.getUserById(user._id);
   album = await mockArtist.addAlbum(artist._id,"album1","label1",["eg"],"Album","1/1/2020","pop");
   album2 = await mockArtist.addAlbum(artist2._id,"album2","label2",["eg"],"Album","1/1/2020","pop");

   track =  await mockTrack.createTrack("","track1",12,["eg"],artist._id,album._id,100,"12","13",["pop"]);
   track2 =  await mockTrack.createTrack("","track2",12,["eg"],artist._id,album._id,100,"12","13",["pop"]);
   track3 =  await mockTrack.createTrack("","track2",12,null,artist._id,album._id,100,"12","13",null);
   track4 =  await mockTrack.createTrack("","track2",12,["eg"],artist._id,album._id,100,"12","13",["rock"]);
   track.popularity=100;
   track2.popularity=200;
   track3.popularity=300;
   track4.popularity=400;
await track.save();
await track2.save();
await track3.save();
await track4.save();
   await mockArtist.addTrack(artist._id, track._id);
   await mockAlbum.addTrack(album._id, track);
   await mockArtist.addTrack(artist._id, track2._id);
   await mockAlbum.addTrack(album._id, track2);
   await mockArtist.addTrack(artist._id, track3._id);
   await mockAlbum.addTrack(album._id, track3);
   
    
});



afterEach(async () => {
   // console.log(user);
    user = await mockUser.getUserById(user._id);
    user2 = await mockUser.getUserById(user2._id);
    user3 = await mockUser.getUserById(user3._id);
    user4 = await mockUser.getUserById(user4._id);
    album = await mockAlbum.getAlbumById(album._id);
    album2 = await mockAlbum.getAlbumById(album2._id);
    artist = await mockArtist.getArtist(artist._id);
    artist2 = await mockArtist.getArtist(artist2._id);
    artist3 = await mockArtist.getArtist(artist3._id);
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


test('Create Artist',async ()=>{
    artistCreated=await mockArtist.createArtist(user,"this is me","NADA",["DANCE"]);
    expect(Array(...artistCreated.genre)).toEqual(  
        ['DANCE']
      );
 })

 
 test('Check if Artist has Album which he hasnot',async ()=>{
    expect(await mockArtist.checkArtisthasAlbum(artist._id,album2._id)).toBeFalsy();  
     
 })
 test('Check if invalid Artist has Album ',async ()=>{
    expect(await mockArtist.checkArtisthasAlbum(artist3,"4")).toEqual(0); 
 })
 test('Check if invalid Artist has Album ',async ()=>{
   expect(await mockArtist.checkArtisthasAlbum(user4._id,album._id)).toEqual(0); 
})
 test('Check if Artist has Album which he has',async()=>{
    
    expect((await mockArtist.checkArtisthasAlbum(artist._id,album._id))).toBeTruthy();
 })
 test('get Artist which exists',async ()=>{
    expect((await mockArtist.getArtist(artist._id)).Name).toEqual(  
          "artist1"
        );
 })

 test('get Artist with id which doesnt exist',async ()=>{
    expect(await mockArtist.getArtist("123456789")).toBeFalsy();
 })
 test('get Artists with many ids ',async ()=>{
    expect((await mockArtist.getArtists([artist._id,artist2._id])).length).toEqual(2);    
 })
 test('get Artists with ids one exist and one doesnt',async ()=>{
    expect((await mockArtist.getArtists([artist._id,"22312312"]))).toEqual(0);
 })
 test('get Artist albums without specifications',async ()=>{
    expect((await mockArtist.getAlbums(artist._id,undefined,undefined,undefined,undefined)).length).toEqual(1);  
   
 })
 test('get Artist albums with album type specified',async ()=>{
    expect((await mockArtist.getAlbums(artist._id,"Album",undefined,undefined,undefined)).length).toEqual(1); 
 })
 test('get Artist albums with album type & country specified',async ()=>{
    expect((await mockArtist.getAlbums(artist._id,"Album","eg",undefined,undefined)).length).toEqual(1);
 })
 test('get Artist albums with country specifed',async ()=>{
    expect((await mockArtist.getAlbums(artist._id,undefined,"eg",undefined,undefined)).length).toEqual(1);
       
 })
 test('get Artist albums with album type & country & limit & offset specified',async ()=>{
    expect((await mockArtist.getAlbums(artist._id,"Album","eg",20,0)).length).toEqual(1);
  
 })
 test('get Related Artist to artist 1 which do exist',async ()=>{
    expect((await mockArtist.getRelatedArtists(artist._id)).length).toEqual(1); 
       
 })
 test('get Related Artist to artist 3 which dont exist',async ()=>{
    expect((await mockArtist.getRelatedArtists(artist3._id)).length).toEqual(0);  
 
 })
 test('find me as Artist',async ()=>{
    expect((await mockArtist.findMeAsArtist(user._id)).Name).toEqual("artist1");
 })
 test('find me as Artist',async ()=>{
    expect(await mockArtist.findMeAsArtist("122324")).toBeFalsy();
 })
 test('get top tracks for Artist in eg',async ()=>{
    expect((await mockArtist.getTopTracks(artist._id,"eg",user2)).length).toEqual(2);
 
 })
 test('get top tracks for invalid Artist in eg',async ()=>{
    expect(await mockArtist.getTopTracks("1023223","eg",user2)).toBeFalsy(); 
 })
 test('get tracks for Artist ',async ()=>{
    expect((await mockArtist.getTracks(artist._id,user2)).length).toEqual(3); 
 })
 
 test('get tracks for Artist ',async ()=>{
    expect(await mockArtist.getTracks("10",user2)).toEqual(  
 0);
 })
 
 test('add track for Artist ',async ()=>{
    expect(await mockArtist.addTrack(artist._id,track4._id)).toEqual(1);
 })
  

 test('add track for invalid Artist ',async ()=>{
    expect(await mockArtist.addTrack("1111230",track4._id)).toBeFalsy();
 })
 test('add Album for Artist ',async ()=>{
    expect((await mockArtist.addAlbum(artist._id,"OHAYO","KIDS",["eg"],"Album","2-1-2000","POP")).name).toEqual("OHAYO"); 
     
 })
 test('add Album for invalid Artist ',async ()=>{
   expect((await mockArtist.addAlbum("43434","OHAYO","KIDS",["eg"],"Album","2-1-2000","POP"))).toEqual(0); 
    
})
test('add invalid Album for Artist ',async ()=>{
   expect((await mockArtist.addAlbum(artist._id,2,1,["eg"],"Album","2-1-2000","POP"))).toEqual(0); 
    
})
 test('Popular Artists',async ()=>{
    expect((await mockArtist.getPopularArtists()).artists.length).toEqual(4);  
   
 })

 test('Check if Artist has Track which he hasnot',async ()=>{
    expect(await mockArtist.checkArtistHasTrack(artist2,track._id)).toBeFalsy();  
     
 })
 test('Check if invalid Artist has Track ',async ()=>{
    expect(await mockArtist.checkArtistHasTrack(artist3,track._id)).toEqual(0); 
 })
 test('Check if  Artist has Invalid Track ',async ()=>{
    expect(await mockArtist.checkArtistHasTrack(artist,"4")).toEqual(0); 
 })
 test('Check if Artist has Track which he has',async()=>{
    
    expect((await mockArtist.checkArtistHasTrack(artist,track._id))).toBeTruthy();
 })

 test('update the Artist name',async()=>{
    
    expect((await mockArtist.updateArtist(user._id,"Nada")).Name).toEqual("Nada");
 })
 test('update Artist genre',async()=>{
    
    expect(Array(...(await mockArtist.updateArtist(user._id,undefined,["pop,jazz"])).genre)).toEqual(["pop,jazz"]);
 })
 test('update Artist info',async()=>{
    
    expect((await mockArtist.updateArtist(user._id,undefined,undefined,"this is nada")).info).toEqual("this is nada");
 })

 test('get Artist no of followers in day',async()=>{
    
   expect(await mockArtist.getArtistNumberOfFollowersInDay(artist._id)).toEqual(2);
})
test('get Artist no of followers in month',async()=>{
    
   expect(await mockArtist.getArtistNumberOfFollowersInMonth(artist._id)).toEqual(2);
})
test('get Artist no of followers in year',async()=>{
    
   expect(await mockArtist.getArtistNumberOfFollowersInYear(artist._id)).toEqual(2);
})

test('get Artist no of followers in day',async()=>{
    
   expect(await mockArtist.getArtistNumberOfFollowersInDay(artist2._id)).toEqual(0);
})
test('get Artist no of followers in month',async()=>{
    
   expect(await mockArtist.getArtistNumberOfFollowersInMonth(artist2._id)).toEqual(0);
})
test('get Artist no of followers in year',async()=>{
    
   expect(await mockArtist.getArtistNumberOfFollowersInYear(artist2._id)).toEqual(0);
})
test('get Invalid Artist no of followers in day',async()=>{
    
   expect(await mockArtist.getArtistNumberOfFollowersInDay("1233242")).toEqual(-1);
})
test('get Invalid Artist no of followers in month',async()=>{
    
   expect(await mockArtist.getArtistNumberOfFollowersInMonth("1233242")).toEqual(-1);
})
test('get Invalid Artist no of followers in year',async()=>{
    
   expect(await mockArtist.getArtistNumberOfFollowersInYear("1233242")).toEqual(-1);
})
test('update Invalid Artist name',async()=>{
    
   expect(await mockArtist.updateArtist("14343","Nada")).toEqual(0);
})

test('update Invalid Artist name',async()=>{
    
   expect(await mockArtist.updateArtist(user4._id,"Nada")).toEqual(0);
})

test('Create Artist without name ',async ()=>{
   artistCreated=await mockArtist.createArtist(user4,"this is me",undefined,["DANCE"]);
   expect(Array(...artistCreated.genre)).toEqual(  
       ['DANCE']
     );
})
test('add track for Artist ',async ()=>{
   artistCreated=await mockArtist.findMeAsArtist(user4._id);
   expect(await mockArtist.addTrack(artistCreated._id,track3._id)).toEqual(1);
})