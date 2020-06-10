const mockTrack = require('../source/track-api');
const mockUser = require('../source/user-api');
const mockArtist = require('../source/artist-api');
const mockPlaylist = require('../source/playlist-api');
const mockAlbum = require('../source/album-api');
const mongoose = require('mongoose');
const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dbHandler = require('./db-handler');
const ObjectId = mongoose.Types.ObjectId;
const searchTest = require('../source/search-api');
let playlist1;
let track ;
let user;
let artist;
let user2;
let track2;
/**
 * Connect to a new in-memory database before running any tests.
 */

beforeAll(async () => {
   await dbHandler.connect();

   user = await mockUser.createUser('dina','123','b@b.com','male','eg','1/1/2020');
   user2 = await mockUser.createUser('nawal','123','b2@b.com','male','eg','1/1/2020');
   await mockUser.promoteToArtist(user._id,'artist info','DINA',['pop']);
   artist =  await mockArtist.findMeAsArtist(user._id);
   album = await mockArtist.addAlbum(artist._id,'album gamed','label1',['eg'],'SINGLE','1/1/2020','pop');
   album2 = await mockArtist.addAlbum(artist._id,'swswswsw','label1',['eg'],'SINGLE','1/1/2020','pop');

   track =  await mockTrack.createTrack('','alby etmnah',12,['eg'],artist._id,album._id,100,'12','13',['pop']);
   track2 =  await mockTrack.createTrack('','track2',12,['eg'],artist._id,album._id,100,'12','13',['pop']);
   

   await mockArtist.addTrack(artist._id, track._id);
   await mockAlbum.addTrack(album._id, track);
   await mockArtist.addTrack(artist._id, track2._id);
   await mockAlbum.addTrack(album._id, track2);
   playlist1=await mockUser.createdPlaylist(user._id,'hello kids','lili');
   
   user = await mockUser.getUserById(user._id);
   user2 = await mockUser.getUserById(user2._id);
   await mockPlaylist.addTrackToPlaylist(playlist1._id,[track._id,track2._id]);


});



afterEach(async () => {
    playlist1=await mockPlaylist.getPlaylist(playlist1._id);
    user = await mockUser.getUserById(user._id);
    user2 = await mockUser.getUserById(user2._id);
    album = await mockAlbum.getAlbumById(album._id);
    artist = await mockArtist.getArtist(artist._id);
    track = await mockTrack.getTrack(track._id,user);
    track2 = await mockTrack.getTrack(track2._id,user);
    //await dbHandler.clearDatabase();
});

/**
 * Remove and close the db and server.
 */
afterAll(async () => {
   await dbHandler.clearDatabase();
    await dbHandler.closeDatabase();
});


test('get user by name',async () => {
    expect(await searchTest.getUserByname('nawal')).toHaveLength(1)
})

test('get user by name that does not exist',async () => {
    expect(await searchTest.getUserByname('samir')).toEqual([])
})
test('get user profile', async() => {
    expect(await searchTest.getUserProfile('nawal')).toHaveLength(1)
        
})
test('get user profile of name does not exist',async () => {
    expect(await searchTest.getUserProfile('wewewe')).toEqual([])
})
test('get user profile of an artist',async () => {
    expect(await searchTest.getUserProfile('DINA')).toEqual([])
})
test('get playlist', async() => {
    expect(await searchTest.getPlaylist('hello')).toHaveLength(1)
})
test('get playlist of name doesnot exists', async() => {
    expect(await searchTest.getPlaylist('WEWE')).toEqual([])
})
test('get playlist of name doesnot exists', async() => {
    expect(await searchTest.getPlaylist('tot')).toHaveLength(0)
})
test('get artist',async () => {
    expect(await searchTest.getArtistProfile('dina')).toHaveLength(1)
})
test('get artist with name doesnot exists', async() => {
    expect(await searchTest.getArtistProfile('lele')).toBeFalsy()
})
test('get track',async () => {
    expect(await searchTest.getTrack('alby')).toHaveLength(1)
})
test('get track that does not exist',async () => {
    expect(await searchTest.getTrack('lele')).toEqual([])
})

test('get top of profile',async () => {
    expect(await searchTest.getTopResults('nawal')).toHaveProperty('displayName', 'nawal')
})
test('get top of an artist',async () => {
    expect(await searchTest.getTopResults('DINA')).toHaveProperty('name', 'DINA')
})
test('get tracks of artist',async () => {
    expect(await searchTest.getTrack('DINA')).toHaveLength(2)
})

test('get albums of artist',async () => {
    expect(await searchTest.getAlbum('DINA')).toHaveLength(2)
})
test('get album',async () => {
    expect(await searchTest.getAlbum('DINA','SINGLE','eg',1,0)).toHaveLength(2)
}) 
test('get album of name doesnot exist',async () => {
    expect(await searchTest.getAlbum('nnn',undefined,'eg',0,1)).toHaveLength(0)
})
 test('get album', async() => {
     expect(await searchTest.getAlbum('DINA','SINGLE',undefined,1,0)).toHaveLength(2)
 })

test('get album of name doesnot exist',async () => {
    expect(await searchTest.getAlbum('lele')).toEqual([])
})
test('get albums', async() => {
    expect(await searchTest.getAlbum('gamed')).toHaveLength(1)
})
test('get top results of artist',async () => {
    expect(await searchTest.getTopResults('DINA')).toHaveProperty(
        'name', 'DINA')
})

test('get top results of album',async () => {
    expect(await searchTest.getTopResults('gamed')).toHaveProperty('name', 'album gamed')
})
test('get top results of playlist',async () => {
    expect(await searchTest.getTopResults('hello')).toHaveProperty('name', 'hello kids')
})
test('get top results of name does not exist',async () => {
    expect(await searchTest.getTopResults('blablabla')).toBeFalsy()
})
test('get top',async () => {
    expect(await searchTest.getTop('alby')).toBeFalsy()
})
test('get top of artist', async() => {
    expect(await searchTest.getTop('DINA')).toEqual(artist._id)
})

test('get top results of track',async () => {
    expect(await searchTest.getTopResults('alby')).toHaveProperty('name', 'alby etmnah')
})

test('get user by name with empty array',async () => {
    expect(await searchTest.getUserByname('salwa')).toEqual([])
})
test('get artist by name with empty array',async () => {
    expect(await searchTest.getArtistProfile('salwa')).toBeFalsy()
})
test('get track by name with empty array',async () => {
    expect(await searchTest.getTrack('salwa')).toEqual([])
})
test('get album by name with empty array',async () => {
    expect(await searchTest.getAlbum('salwa')).toEqual([])
})
test('get playlist by name with empty array',async () => {
    expect(await searchTest.getPlaylist('salwa')).toEqual([])
})
test('get artist by name',async () => {
    expect(await searchTest.getArtistByname('DINA')).toHaveLength(1)
})
test('get artist by name that does not exists',async () => {
    expect(await searchTest.getArtistByname('bla')).toHaveLength(0)
})
test('get artist by name that does not exists',async () => {
    expect(await searchTest.exactmatch(0,'dina')).toBeFalsy()
})
test('add to recentlySearch',async () => {
    expect(await searchTest.addToRecentlySearch(user2._id,artist._id,'artist')).toBeTruthy()
})
test('add to recentlySearch',async () => {
    expect(await searchTest.addToRecentlySearch(user2._id,album._id,'album')).toBeTruthy()
})
test('add to recentlySearch',async () => {
    expect(await searchTest.addToRecentlySearch(user2._id,playlist1._id,'playlist')).toBeTruthy()
})
test('add to recentlySearch',async () => {
    expect(await searchTest.addToRecentlySearch(user2._id,user2._id,'user')).toBeTruthy()
})
test('add to recentlySearch',async () => {
    expect(await searchTest.addToRecentlySearch(user2._id,track._id,'track')).toBeTruthy()
})
test('add to recentlySearch',async () => {
    expect(await searchTest.addToRecentlySearch(user2._id,track._id,'blabla')).toBeFalsy()
})
test('add to recentlySearch',async () => {
    expect(await searchTest.addToRecentlySearch(track._id,track,'track')).toBeFalsy()
})
test('add to recentlySearch',async () => {
    expect(await searchTest.addToRecentlySearch('1',track,'track')).toBeFalsy()
})
test('add to recentlySearch',async () => {
    expect(await searchTest.addToRecentlySearch(mongoose.Types.ObjectId(),track._id,'track')).toBeFalsy()
})

test('add to getRecentlySearch',async () => {
    expect(await searchTest.getRecentlySearch(user2._id)).toHaveProperty('playlists')
})
test('add to removeRecently',async () => {
    expect(await searchTest.removeRecently(user2._id,'artist',artist._id)).toBeTruthy()
})
test('add to removeRecently',async () => {
    expect(await searchTest.removeRecently(user2,'artist',artist._id)).toBeFalsy()
})
test('add to removeRecently',async () => {
    expect(await searchTest.removeRecently(mongoose.Types.ObjectId(),'artist',artist._id)).toBeFalsy()
})
test('add to removeRecently',async () => {
    expect(await searchTest.removeRecently(user2._id,'album',album._id)).toBeTruthy()
})
test('add to removeRecently',async () => {
    expect(await searchTest.removeRecently(user2._id,'playlist',playlist1._id)).toBeTruthy()
})
test('add to removeRecently',async () => {
    expect(await searchTest.removeRecently(user2._id,'user',user2._id)).toBeTruthy()
})
test('add to removeRecently',async () => {
    expect(await searchTest.removeRecently(user2._id,'track',track._id)).toBeTruthy()
})
test('getRecentlySearch',async () => {
    expect(await searchTest.getRecentlySearch(user2._id)).toHaveProperty('playlists',[])
})
test('getRecentlySearch',async () => {
    expect(await searchTest.getRecentlySearch(mongoose.Types.ObjectId())).toBeFalsy()
})
test('getRecentlySearch',async () => {
    expect(await searchTest.getRecentlySearch('1')).toBeFalsy()
})

 
