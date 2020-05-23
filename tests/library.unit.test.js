const mockTrack = require('../source/track-api');
const mockUser = require('../source/user-api');
const mockArtist = require('../source/artist-api');
const mockAlbum = require('../source/album-api');
const mockLibrary = require('../source/library-api');
const mongoose = require('mongoose');
const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dbHandler = require('./db-handler');
const mongod = new MongoMemoryServer();
const ObjectId = mongoose.Types.ObjectId;

jest.setTimeout(100000);

let album0Id, tracks0Id;
let users = [{

        'displayName': 'm alaa',
        'email': 'dinaalaaahmed@gmail.com',
        'password': '1223345677',
        'country': 'egypt',
        'isFacebook': false,

        'userType': 'user'
    }, {
        '_id': '2',
        'displayName': 'Arwa alaa',
        'email': 'Arwaalaaahmed@gmail.com',
        'password': '1223345678',
        'country': 'egypt',
        'isFacebook': true,
        'userType': 'user',
        'product': 'premium',
        'premium': {}

    },
    {
        '_id': '3',
        'displayName': 'Alaa Alaa',
        'email': 'Arwalaaalaaahmed@gmail.com',
        'password': '12345678',
        'country': 'egypt',
        'userType': 'user',
        'isFacebook': true,

    }
]
let playlists = [];
let usersInDB = [];
let albums = [];
let artists = [];
let tracks = [];

let albumsObjs = [{
        '_id': '1',
        'artistId': '2',
        'hasTracks': [],
        'name': 'album gamed',
        'images': []

    },
    {
        '_id': '2',
        'artistId': '2',
        'hasTracks': []

    },
    {
        '_id': '3',
        'artistId': '2',
        'hasTracks': [],
        'name': 'ay haga1'

    },
    {
        '_id': '4',
        'artistId': '20',
        'hasTracks': [],
        'name': 'ay haga'


    },
    {
        '_id': '5',
        'name': 'haytham',
        'images': [],
        'hasTracks': []
    }
]

beforeAll(async() => {
    await dbHandler.connect();
    let i = 0;
    for (let user of users) {
        let u = await mockUser.createUser(user.displayName, user.password, user.email, user.gender, user.country, user.birthDate);

        if (i == 1) {
            u.product = 'premium'
            u.isFacebook = true;
            await u.save()
        }
        usersInDB.push(u);
        i++;
    }
    i = 0;
    for (let user of usersInDB) {
        if (i == 1) break;
        await mockUser.promoteToArtist(user._id, 'artist info', 'artist' + i, ['pop']);
        let artist = await mockArtist.findMeAsArtist(user._id);
        artists.push(artist);
        i++;
        if (i == 1) {
            let j = 0;
            for (let album of albumsObjs) {
                let album1 = await mockArtist.addAlbum(artist._id, album.name, 'label1', ['eg'], 'Single', '1/1/2020', 'pop');
                albums.push(album1);
                if (j == 0) {
                    let track = await mockTrack.createTrack('', 'track1', 12, ['eg'], artist._id, album1._id, 100, '12', '13', ['pop']);
                    tracks.push(track);
                    await mockArtist.addTrack(artist._id, track._id);
                    await mockAlbum.addTrack(album1._id, track);
                    track = await mockTrack.createTrack('', 'track1', 12, ['eg'], artist._id, album1._id, 100, '12', '13', ['pop']);
                    tracks.push(track);
                    await mockArtist.addTrack(artist._id, track._id);
                    await mockAlbum.addTrack(album1._id, track);
                    track = await mockTrack.createTrack('', 'track1', 12, ['eg'], artist._id, album1._id, 100, '12', '13', ['pop']);
                    tracks.push(track);
                    await mockArtist.addTrack(artist._id, track._id);
                    await mockAlbum.addTrack(album1._id, track);

                }
                j++;
            }
        }

    }
    await mockUser.likeTrack(usersInDB[0]._id, tracks[0]._id);
    await mockUser.likeTrack(usersInDB[0]._id, tracks[1]._id);
    await mockUser.likeTrack(usersInDB[0]._id, tracks[2]._id);
    await mockUser.likeTrack(usersInDB[1]._id, tracks[0]._id);
    await mockUser.unlikeTrack(usersInDB[1]._id, tracks[0]._id);
    await userDocument.find({}, (err, files) => {
        usersInDB = [];
        for (let user of files) usersInDB.push(user);
    })
    await mockAlbum.saveAlbum(usersInDB[0], [albums[0]._id]);
    await mockAlbum.saveAlbum(usersInDB[0], [albums[2]._id]);
    await mockAlbum.saveAlbum(usersInDB[0], [albums[1]._id]);
    await mockAlbum.saveAlbum(usersInDB[1], [albums[0]._id]);
    await mockAlbum.saveAlbum(usersInDB[1], [albums[1]._id]);

    await userDocument.find({}, (err, files) => {
        usersInDB = [];
        for (let user of files) usersInDB.push(user);
    })

    //console.log(usersInDB[0].saveAlbum);
    //console.log(albums[0]._id);

    album0Id = albums[0]._id;
    tracks0Id = tracks[0]._id;
    //console.log(tracks);


});
afterEach(async() => {
    await userDocument.find({}, (err, files) => {
        usersInDB = [];
        for (let user of files) usersInDB.push(user);
    })
    tracks = [];
    albums = [];
    artists = [];
    await artistDocument.find({}, (err, files) => {
        for (let file of files) artists.push(file)
    })
    await trackDocument.find({}, (err, files) => {
        for (let file of files) tracks.push(file)
    })
    await albumDocument.find({}, (err, files) => {
        for (let file of files) albums.push(file)
    })
    process.env.LIMIT = 20;
})

afterAll(async() => {
    await dbHandler.clearDatabase();
    await dbHandler.closeDatabase();
});
// check saved albums

test(' check saved albums without mongoose ids', async() => {
    expect(await mockLibrary.checkSavedAlbums(['10'], usersInDB[0]._id)).toEqual(0);
})

test(' check saved albums without mongoose ids for user ', async() => {
    expect(await mockLibrary.checkSavedAlbums([album0Id], '10')).toEqual(0)
})

test(' check saved albums without mongoose ids for user ', async() => {
    expect(await mockLibrary.checkSavedAlbums([album0Id], album0Id)).toEqual(0)
})
test(' check saved albums true ', async() => {
    //console.log(await usersInDB[0].saveAlbum)
    let y = await mockLibrary.checkSavedAlbums([album0Id], usersInDB[0]._id);
    expect(y[0]).toBeTruthy();
})

test(' check saved albums false ', async() => {
    let y = await mockLibrary.checkSavedAlbums([album0Id], usersInDB[2]._id);
    expect(y[0]).toBeFalsy();
})

// check saved tracks

test(' check saved tracks without mongoose ids', async() => {
    expect(await mockLibrary.checkSavedTracks(['10'], usersInDB[0]._id)).toEqual(0);
})

test(' check saved tracks without mongoose ids for user ', async() => {
        expect(await mockLibrary.checkSavedTracks([tracks0Id], '10')).toEqual(0)
    })
    // need  to check again
test(' check saved tracks without mongoose ids for user ', async() => {
    expect(await mockLibrary.checkSavedTracks([tracks0Id], tracks0Id)).toEqual(0)
})

test(' check saved tracks true ', async() => {
    //  console.log(await usersInDB[0].saveAlbum)

    let y = await mockLibrary.checkSavedTracks([tracks0Id], usersInDB[0]._id);
    expect(y[0]).toBeTruthy();

})

test(' check saved tracks false ', async() => {

    let y = await mockLibrary.checkSavedTracks([tracks0Id], usersInDB[2]._id);
    expect(y[0]).toBeFalsy();
})

// test get saved albums 
test('get saved albums no has albums', async() => {
    let y = await mockLibrary.getSavedAlbums(usersInDB[2]._id);
    expect(y).toBeFalsy();
});

test('get saved albums no has albums not array save  albums', async() => {
    await userDocument.updateOne({ _id: usersInDB[2]._id }, { saveAlbum: 0 });
    let y = await mockLibrary.getSavedAlbums(usersInDB[2]._id);
    expect(y).toEqual([]);
});

test('get saved albums ', async() => {
    let y = await mockLibrary.getSavedAlbums(usersInDB[0]._id);
    //console.log(y);
    expect(y.length).toEqual(2);
});


test('get saved albums with not valid offset limit  ', async() => {
    let y = await mockLibrary.getSavedAlbums(usersInDB[0]._id, 7, 10);
    //console.log(y);
    expect(y.length).toEqual(2);
});

test('get saved albums with valid  ', async() => {
    let y = await mockLibrary.getSavedAlbums(usersInDB[0]._id, 1, 0);
    //console.log(y);
    expect(y.length).toEqual(1);
});


test('get saved albums no mongoose id', async() => {
    let y = await mockLibrary.getSavedAlbums('123');

    expect(await mockLibrary.getSavedAlbums('123')).toBeFalsy();
});

test('get saved albums no user', async() => {
    let y = await mockLibrary.getSavedAlbums(tracks0Id);

    expect(y).toBeFalsy();
});
// test get saved tracks
test('get saved tracks no has tracks', async() => {
    let y = await mockLibrary.getSavedTracks(usersInDB[2]._id);
    expect(await mockLibrary.getSavedTracks(usersInDB[2]._id)).toBeFalsy();
});

test('get saved tracks env(limit) =1 ', async() => {
    let y = await mockLibrary.getSavedTracks(usersInDB[0]._id);
    process.env.LIMIT = 1;
    //console.log(y);
    expect(y.tracks.length).toEqual(3);
});

test('get saved tracks env(limit) = welcome ', async() => {
    let y = await mockLibrary.getSavedTracks(usersInDB[0]._id);
    process.env.LIMIT = 'welcome';
    //console.log(y);
    expect(y.tracks.length).toEqual(3);
});

test('get saved tracks with not valid offset limit  ', async() => {
    let y = await mockLibrary.getSavedTracks(usersInDB[0]._id, 7, 10);
    //console.log(y);
    expect(y.tracks.length).toEqual(3);
});

test('get saved tracks with valid limit offset  ', async() => {
    let y = await mockLibrary.getSavedTracks(usersInDB[0]._id, 1, 0);
    //console.log(y);
    expect(y.tracks.length).toEqual(1);
});

test('get saved tracks with valid  ', async() => {
    process.env.LIMIT = 1;
    let y = await mockLibrary.getSavedTracks(usersInDB[0]._id);
    //console.log(y);
    expect(y.tracks.length).toEqual(1);
});


test('get saved tracks no mongoose id', async() => {
    let y = await mockLibrary.getSavedTracks('123');
    expect(y).toBeFalsy();
});

test('get saved tracks no user', async() => {
    let y = await mockLibrary.getSavedTracks(tracks0Id);
    expect(y).toBeFalsy();
});

test('get saved tracks no user', async() => {
    let y = await mockLibrary.getSavedTracks(usersInDB[1]._id);
    expect(y).toBeFalsy();
});