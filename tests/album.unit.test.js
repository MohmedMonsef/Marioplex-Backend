const mockTrack = require('../source/track-api');
const mockUser = require('../source/user-api');
const mockArtist = require('../source/artist-api');
const mockAlbum = require('../source/album-api');
const mockPlayer = require('../source/player-api');
const mongoose = require('mongoose');
const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dbHandler = require('./db-handler');
const mongod = new MongoMemoryServer();
const ObjectId = mongoose.Types.ObjectId;

let track;
let user;
let artist;
let user2;
let track2;
let album;
let albumId;
/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async() => {
    await dbHandler.connect();

    user3 = await mockUser.createUser("samah", "123", "b@b.com", "male", "eg", "1/1/2020");

    user = await mockUser.createUser("dina", "123", "b@b.com", "male", "eg", "1/1/2020");
    user2 = await mockUser.createUser("nawal", "123", "b2@b.com", "male", "eg", "1/1/2020");
    await mockUser.promoteToArtist(user._id, "artist info", "DINA", ["pop"]);
    await mockUser.promoteToArtist(user3._id, "artist info", "samah", ["pop"]);
    artist = await mockArtist.findMeAsArtist(user._id);
    album = await mockArtist.addAlbum(artist._id, "album gamed", "label1", ["eg"], "SINGLE", "1/1/2020", "pop");
    album2 = await mockArtist.addAlbum(artist._id, "swswswsw", "label1", ["eg"], "SINGLE", "1/1/2020", "pop");
    album3 = await mockArtist.addAlbum(artist._id, "alby", "label1", ["eg"], "SINGLE", "1/1/2020", "pop");

    track = await mockTrack.createTrack("", "alby etmnah", 12, ["eg"], artist._id, album._id, 100, "12", "13", ["pop"]);
    track2 = await mockTrack.createTrack("", "track2", 12, ["eg"], artist._id, album._id, 100, "12", "13", ["pop"]);
    track3 = await mockTrack.createTrack("", "track3", 12, ["eg"], artist._id, album._id, 100, "12", "13", ["pop"]);


    await mockArtist.addTrack(artist._id, track._id);
    await mockAlbum.addTrack(album._id, track);
    await mockArtist.addTrack(artist._id, track2._id);
    await mockAlbum.addTrack(album._id, track2);


    user = await mockUser.getUserById(user._id);
    user2 = await mockUser.getUserById(user2._id);
    user3 = await mockUser.getUserById(user3._id);
    albumId = album._id;

});



afterEach(async() => {
    user3 = await mockUser.getUserById(user3._id);
    user = await mockUser.getUserById(user._id);
    user2 = await mockUser.getUserById(user2._id);
    if (album) {
        album = await mockAlbum.getAlbumById(album._id);


    }
    artist = await mockArtist.getArtist(artist._id);
    track = await mockTrack.getTrack(track._id, user);
    track2 = await mockTrack.getTrack(track2._id, user);
    track2 = await mockTrack.getTrack(track3._id, user);
    //await dbHandler.clearDatabase();
});

/**
 * Remove and close the db and server.
 */
afterAll(async() => {
    await dbHandler.clearDatabase();
    await dbHandler.closeDatabase();
});



test('get album', async() => {

    expect((await mockAlbum.getAlbumById(album._id)).name).toEqual('album gamed');
})
test('get album with id that does not exist', async() => {

    expect((await mockAlbum.getAlbumById("1"))).toBeFalsy()
})
test('get albums right', async() => {
    expect((await mockAlbum.getAlbums([album._id])).length).toEqual(1)
})

test('get albums album dont exist', async() => {
    expect((await mockAlbum.getAlbums(['1']))).toEqual(0)
})

test('get albums no parameter', async() => {
    expect(await mockAlbum.getAlbums()).toEqual(0)
})


test('get albums parameter but empty id', async() => {
    expect(await mockAlbum.getAlbums([])).toEqual(0)
})
test('get albums parameter but not album id', async() => {
    expect(await mockAlbum.getAlbums([mongoose.Types.ObjectId()])).toEqual(0)
})


test('get tracks album no parameter', async() => {
    expect(await mockAlbum.getTracksAlbum()).toEqual(0)
})


test('get tracks album right', async() => {
    let h = await mockAlbum.getTracksAlbum(album._id, user2);
    expect((h[0]).name).toEqual("alby etmnah");
})

test('get tracks album wrong id', async() => {
    expect(await mockAlbum.getTracksAlbum("4")).toBeFalsy()
})
test('get album with artist right', async() => {
    let h = await mockAlbum.getAlbumArtist(album._id, user2._id);
    expect(h).toHaveProperty('name', 'album gamed')

})

test('get album with artist wrong id', async() => {
    expect(await mockAlbum.getAlbumArtist('1')).toEqual(0);

})
test('get album with artist wrong user id', async() => {
    let h = await mockAlbum.getAlbumArtist(album._id, mongoose.Types.ObjectId(), 1);
    expect(h).toHaveProperty('name', 'album gamed')

})


test('get album with artist with wrong artist woth user parameter', async() => {
    expect(await mockAlbum.getAlbumArtist('10', user2)).toEqual(0);

})

test('get album with artist with false is saved', async() => {
    expect(await mockAlbum.getAlbumArtist(album._id, user2._id)).toHaveProperty('_id', album._id);

})
test('get album with artist with false is saved', async() => {
    expect(await mockAlbum.getAlbumArtist(album._id, user2._id, true)).toHaveProperty('_id', album._id);

})


test('get album with artist with wrong parameters', async() => {
    expect(await mockAlbum.getAlbumArtist('15', 0)).toEqual(0);

})
test('get album with artist with wrong id', async() => {
    expect(await mockAlbum.getAlbumArtist('15', user2)).toEqual(0);

})
test('get album with artist with wrong id', async() => {
    expect(await mockAlbum.getAlbumArtist(mongoose.Types.ObjectId(), user2._id)).toEqual(0);

})



test('add track to album', async() => {
    expect(await mockAlbum.addTrack(album._id, track3._id)).toEqual(1);
})
test('add track to album', async() => {
    expect(await mockAlbum.addTrack(mongoose.Types.ObjectId(), track3._id)).toEqual(0);
})

test('add track to invalid album', async() => {
    expect(await mockAlbum.addTrack('1', track3._id)).toEqual(0);
})

test('get number of likes for an album per day', async() => {
    expect(await mockAlbum.getAlbumNumberOfLikesInDay(album._id)).toEqual(0);
})
test('get number of likes for an album per day', async() => {
    expect(await mockAlbum.getAlbumNumberOfLikesInDay('1')).toEqual(-1);
})
test('get number of likes for an album per month', async() => {
    expect(await mockAlbum.getAlbumNumberOfLikesInMonth(album._id)).toEqual(0);
})
test('get number of likes for an album per month', async() => {
    expect(await mockAlbum.getAlbumNumberOfLikesInMonth('1')).toEqual(-1);
})
test('get number of likes for an album per year', async() => {
    expect(await mockAlbum.getAlbumNumberOfLikesInYear(album._id)).toEqual(0);
})
test('get number of likes for an album per year', async() => {
    expect(await mockAlbum.getAlbumNumberOfLikesInYear('1')).toEqual(-1);
})


test('check if user does not saves album', async() => {
    expect(await mockAlbum.checkIfUserSaveAlbum(user2, album._id)).toBeFalsy();
})

test('user saves album that does not exist', async() => {
    expect(await mockAlbum.saveAlbum(user2, [mongoose.Types.ObjectId()])).toEqual(0);
})
test('user saves album that does not exist', async() => {
    expect(await mockAlbum.unsaveAlbum(user2, [mongoose.Types.ObjectId()])).toBeFalsy();
})

test('check if saves album with user does not exist', async() => {
    expect(await mockAlbum.checkIfUserSaveAlbum("1", album._id)).toBeFalsy();
})
test('check if saves album that does not exist', async() => {
    expect(await mockAlbum.checkIfUserSaveAlbum(user2, "1")).toBeFalsy();
})
test('user saves album', async() => {
    expect(await mockAlbum.saveAlbum(user2, [album._id])).toBeTruthy()
})
test('get number of likes for an album per year', async() => {
    expect(await mockAlbum.getAlbumNumberOfLikesInYear(album._id)).toEqual(1);
})
test('get number of likes for an album per year', async() => {
    expect(await mockAlbum.getAlbumNumberOfLikesInMonth(album._id)).toEqual(1);
})
test('get number of likes for an album per year', async() => {
    expect(await mockAlbum.getAlbumNumberOfLikesInDay(album._id)).toEqual(1);
})
test('get album with artist with false is saved', async() => {
    expect(await mockAlbum.getAlbumArtist(album._id, user2._id, true)).toHaveProperty('_id', album._id);

})
test('get album  new releases', async() => {
    expect(await mockAlbum.getNewReleases()).toHaveProperty('albums');
})
test('get album popular albums', async() => {
    expect(await mockAlbum.getPopularAlbums()).toHaveProperty('albums');
})

test('check if user saves album', async() => {
    expect(await mockAlbum.checkIfUserSaveAlbum(user2, album._id)).toBeTruthy();
})


test('user saves album already saved', async() => {
    expect(await mockAlbum.saveAlbum(user2, [album._id])).toBeFalsy()
})


test('user saves album with empty array', async() => {
    expect(await mockAlbum.saveAlbum(user2, [])).toEqual(0)
})


test('user saves album with undefined parameter', async() => {
    expect(await mockAlbum.saveAlbum(user2)).toEqual(2)
})
test('user saves album with id does not exist', async() => {
    expect(await mockAlbum.saveAlbum(user2, ["1"])).toBeFalsy()
})


test('user unsaves album', async() => {
    expect(await mockAlbum.unsaveAlbum(user2, [album._id])).toBeTruthy()
})
test('user unsaves album with id does not exist', async() => {
    expect(await mockAlbum.unsaveAlbum(user2, ["1"])).toBeFalsy()
})


test('user unsaves album is already unsaved', async() => {
    expect(await mockAlbum.unsaveAlbum(user2, [album._id])).toBeFalsy()
})


test('user unsaves album with empty array', async() => {
    expect(await mockAlbum.unsaveAlbum(user2, [])).toBeTruthy()
})
test('user unsaves album with invalid input', async() => {
    expect(await mockAlbum.unsaveAlbum(user2)).toBeFalsy()
})
test('get track index in album', async() => {
    console.log(await mockAlbum.findIndexOfTrackInAlbum(track._id, album));
    expect(await mockAlbum.findIndexOfTrackInAlbum(track._id, album)).toEqual(0)
})

test('get track index in album', async() => {
    expect(await mockAlbum.findIndexOfTrackInAlbum('20', album)).toEqual(-1)
})

test('get track index in album', async() => {
    expect(await mockAlbum.findIndexOfTrackInAlbum(mongoose.Types.ObjectId(), album)).toEqual(-1)
})
test('delete album with id does not exist', async() => {
    expect(await mockAlbum.deleteAlbum("1", album._id)).toBeFalsy()
})

test('delete album with id does not exist', async() => {
    expect(await mockAlbum.deleteAlbum(user3._id, mongoose.Types.ObjectId())).toBeFalsy()
})


test('delete album', async() => {
    expect(await mockAlbum.deleteAlbum(user._id, album._id)).toBeTruthy()
})

test('delete album with id does not exist', async() => {
    expect(await mockAlbum.deleteAlbum(user._id, "1")).toBeFalsy()
})