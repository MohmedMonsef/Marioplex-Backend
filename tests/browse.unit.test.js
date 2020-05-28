const mockTrack = require('../source/track-api');
const mockUser = require('../source/user-api');
const mockArtist = require('../source/artist-api');
const mockAlbum = require('../source/album-api');
const mockBrowse = require('../source/browse-api');
const mockPlaylist = require('../source/playlist-api');
const mongoose = require('mongoose');
const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dbHandler = require('./db-handler');
const mongod = new MongoMemoryServer();
const ObjectId = mongoose.Types.ObjectId;
let track, track2, track4, track3;
let album;
let category1, category2, category3;
let user, user1;
let playlist1, playlist2, playlist3, playlist4, playlist5, playlist6;
let artist, artist2;
let playlistId1;
beforeAll(async() => {
    await dbHandler.connect();

    user = await mockUser.createUser('user88', '123', 'b77@b.com', 'male', 'eg', '1/1/2020');
    user1 = await mockUser.createUser('user1', '123', 'b3@b.com', 'male', 'eg', '1/1/2020');
    await mockUser.promoteToArtist(user._id, 'artist info', 'artist1', ['pop', 'rock', 'genre1']);
    await mockUser.promoteToArtist(user1._id, 'artist info', 'artist1', ['pop', 'rock', 'genre1']);

    artist = await mockArtist.findMeAsArtist(user._id);
    artist2 = await mockArtist.findMeAsArtist(user1._id);
    album = await mockArtist.addAlbum(artist._id, 'album1', 'label1', ['eg'], 'Album', '1/1/2020', 'pop');

    track = await mockTrack.createTrack('', 'track1', 12, ['eg'], artist._id, album._id, 100, '12', '13', ['pop']);
    track2 = await mockTrack.createTrack('', 'track2', 12, ['eg'], artist._id, album._id, 100, '12', '13', ['pop']);
    track3 = await mockTrack.createTrack('', 'track3', 12, ['eg'], artist._id, album._id, 100, '12', '13', ['genre1', 'pop']);
    track4 = await mockTrack.createTrack('', 'track4', 12, ['eg'], artist._id, album._id, 100, '12', '13', ['rock']);
    track5 = await mockTrack.createTrack('', 'track5', 12, ['eg'], artist._id, album._id, 100, '12', '13', ['rock']);

    await mockArtist.addTrack(artist._id, track._id);
    await mockAlbum.addTrack(album._id, track);
    await mockArtist.addTrack(artist._id, track2._id);
    await mockAlbum.addTrack(album._id, track2);
    await mockArtist.addTrack(artist._id, track3._id);
    await mockAlbum.addTrack(album._id, track3);
    await mockArtist.addTrack(artist._id, track4._id);
    await mockAlbum.addTrack(album._id, track4);
    await mockArtist.addTrack(artist._id, track5._id);
    await mockAlbum.addTrack(album._id, track5);
    playlist1 = await mockUser.createdPlaylist(user._id, 'playlist1', 'playlist');
    playlistId1 = playlist1._id;
    playlist2 = await mockUser.createdPlaylist(user._id, 'playlist2', 'playlist');
    playlist3 = await mockUser.createdPlaylist(user._id, 'playlist3', 'playlist');
    playlist4 = await mockUser.createdPlaylist(user._id, 'playlist4', 'playlist');
    playlist5 = await mockUser.createdPlaylist(user1._id, 'playlist5', 'playlist');
    playlist6 = await mockUser.createdPlaylist(user1._id, 'playlist6', 'playlist');
    await mockUser.createdPlaylist(user1._id, 'playlist7', 'playlist');

    user = await mockUser.getUserById(user._id);
    await mockPlaylist.addTrackToPlaylist(playlist1._id, [track._id, track2._id, track3._id, track4._id]);
    await mockPlaylist.addTrackToPlaylist(playlist2._id, [track3._id, track2._id, track3._id, track4._id]);
    await mockPlaylist.addTrackToPlaylist(playlist3._id, [track._id, track2._id, track3._id, track4._id]);
    await mockPlaylist.addTrackToPlaylist(playlist4._id, [track2._id, track2._id, track3._id, track4._id]);
    await mockPlaylist.addTrackToPlaylist(playlist5._id, [track._id, track2._id, track3._id, track4._id]);
    await mockPlaylist.addTrackToPlaylist(playlist6._id, []);
    category1 = await new categoryDocument({
        name: 'category1',
        playlist: [playlist1._id, playlist2._id, playlist4._id, playlist6._id]
    })
    await category1.save();
    category2 = await new categoryDocument({
        name: 'category2',
        playlist: [playlist1._id, playlist3._id, playlist2._id, playlist6._id]
    })
    await category2.save();
    category3 = await new categoryDocument({
        name: 'category3',
        playlist: []
    })
    await category3.save();


    user = await mockUser.getUserById(user._id);
    user1 = await mockUser.getUserById(user1._id);
});


afterEach(async() => {
    playlist1 = await mockPlaylist.getPlaylist(playlist1._id);

    playlist2 = await mockPlaylist.getPlaylist(playlist2._id);
    playlist3 = await mockPlaylist.getPlaylist(playlist3._id);
    playlist4 = await mockPlaylist.getPlaylist(playlist4._id);
    playlist5 = await mockPlaylist.getPlaylist(playlist5._id);
    playlist6 = await mockPlaylist.getPlaylist(playlist6._id);
    user = await mockUser.getUserById(user._id);
    user1 = await mockUser.getUserById(user1._id);
    album = await mockAlbum.getAlbumById(album._id);
    artist = await mockArtist.getArtist(artist._id);
    artist2 = await mockArtist.getArtist(artist2._id);
    track = await mockTrack.getTrack(track._id, user);
    track2 = await mockTrack.getTrack(track2._id, user);
    track3 = await mockTrack.getTrack(track3._id, user);
    track4 = await mockTrack.getTrack(track4._id, user);
    track5 = await mockTrack.getTrack(track5._id, user);
    category1 = await mockBrowse.getCategoryById(category1._id);
    category2 = await mockBrowse.getCategoryById(category2._id);
    category3 = await mockBrowse.getCategoryById(category3._id);
    process.env.limit = 20;

    // console.log(category1);
    //await dbHandler.clearDatabase();
});


/**
 * Remove and close the db and server.
 */
afterAll(async() => {
    await dbHandler.clearDatabase();
    await dbHandler.closeDatabase();
});
//get category
test('get category without mongoose id ', async() => {
    //console.log(await mockBrowse.getCategoryById('556766'));
    expect(await mockBrowse.getCategoryById('556766')).toEqual(0);
});

test('get category with id  no belongs to category', async() => {
    //console.log(await mockBrowse.getCategoryById('556766'));
    expect(await mockBrowse.getCategoryById(user._id)).toEqual(0);
});

test('get category has playlists ', async() => {
    let category = await mockBrowse.getCategoryById(category1._id);
    expect(category.name).toEqual('category1');
});

test('get category not has playlists ', async() => {
    let category = await mockBrowse.getCategoryById(category3._id);
    expect(category.name).toEqual('category3')
});

// get playlists of category
test('get playlists of category not has playlists ', async() => {
    let playlists = await mockBrowse.getCategoryPlaylists(category3._id);
    expect(playlists).toEqual([])
});

test('get playlists of category  ', async() => {
    let playlists = await mockBrowse.getCategoryPlaylists(category1._id);
    // console.log(playlists)
    expect(playlists.length).toEqual(4)
});
test('get playlists of category with change env(limit) ', async() => {
    process.env.limit = 1;
    let playlists = await mockBrowse.getCategoryPlaylists(category1._id);
    // console.log(playlists)
    expect(playlists.length).toEqual(1);
});

test('get playlists of category with change env(limit)=welcome ', async() => {
    process.env.limit = 'welcome';
    let playlists = await mockBrowse.getCategoryPlaylists(category1._id);
    // console.log(playlists)
    expect(playlists.length).toEqual(4);
});


test('get playlists of category not mongoose id ', async() => {
    let playlists = await mockBrowse.getCategoryPlaylists('category1._id');
    // console.log(playlists)
    expect(playlists).toBeFalsy();
});

test('get playlists of category with mongoose id but not category id', async() => {
    let playlists = await mockBrowse.getCategoryPlaylists(playlistId1);
    expect(playlists.length).toBeFalsy();
});

test('get playlists of category with limit ', async() => {
    let playlists = await mockBrowse.getCategoryPlaylists(category1._id, 2, 1);
    // console.log(playlists)
    expect(playlists.length).toEqual(2);
});

test('get playlists of category with invalid limit ', async() => {
    let playlists = await mockBrowse.getCategoryPlaylists(category1._id, 20, 1);
    // console.log(playlists)
    expect(playlists.length).toEqual(3);
});

test('get playlists of category not has playlists invalid offset ', async() => {
    let playlists = await mockBrowse.getCategoryPlaylists(category1._id, 2, 10);
    // console.log(playlists)
    expect(playlists.length).toEqual(2);
});

// get categories
test('get  categories  ', async() => {
    let Categoryies = await mockBrowse.getCategoryies();
    // console.log(playlists)
    expect(Categoryies.length).toEqual(3);
});

//get genere list 
test('get  genres for home page   ', async() => {

    let genres = await mockBrowse.getGenreList();
    expect(genres.length).toEqual(2)
});

test('get  genres for home page  with def env(process.env.GENRE_LIMIT ) ', async() => {
    process.env.GENRE_LIMIT = 1;
    let genres = await mockBrowse.getGenreList();
    expect(genres.length).toEqual(1)
});
// get playlists of genre

test('get  genre playlist  ', async() => {
    let playlists = await mockBrowse.getPlaylistGenre(['pop']);
    expect(playlists.length).toEqual(1)
});

test('get  genre playlist with empty array of genre  ', async() => {
    let playlists = await mockBrowse.getPlaylistGenre([]);
    expect(playlists.length).toEqual(0)
});

test('get  genre playlist for undefined genres ', async() => {
    let playlists = await mockBrowse.getPlaylistGenre();
    expect(playlists).toEqual(0)
});

test('get  genre playlist  ', async() => {
    let playlists = await mockBrowse.getPlaylistGenre(['pop', 'genre5']);
    expect(playlists.length).toEqual(1)
});

test('get  genre playlist with playlist not have snapshot  ', async() => {
    await playlistDocument.updateOne({ _id: playlist6._id }, { snapshot: 0 });
    let playlists = await mockBrowse.getPlaylistGenre(['pop', 'genre5']);
    expect(playlists.length).toEqual(1)
});

test('get  genre playlist with playlist not hasTracks  ', async() => {
    await playlistDocument.updateOne({ _id: playlist6._id }, { snapshot: [{}] });
    let playlists = await mockBrowse.getPlaylistGenre(['pop', 'genre5']);
    expect(playlists.length).toEqual(1)
});
test('get  genre list with playlist no artist  ', async() => {
    await artistDocument.deleteMany();
    let playlists = await mockBrowse.getGenreList();
    expect(playlists).toEqual(0)
});