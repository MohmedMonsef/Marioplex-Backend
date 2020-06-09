const mockTrack = require('../source/track-api');
const mockUser = require('../source/user-api');
const mockArtist = require('../source/artist-api');
const mockAlbum = require('../source/album-api');
const mockPlaylist = require('../source/playlist-api');
const mockPlayer = require('../source/player-api');
const mongoose = require('mongoose');
const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dbHandler = require('./db-handler');
const mongod = new MongoMemoryServer();
let usersInDB = [];
let userNotHaveArray;
let playlists = [];
let tracks = [];
let albums = [];
let artist;
let playlisId0;
jest.setTimeout(100000);
beforeAll(async() => {
    await dbHandler.connect();
    for (let i = 0; i < 5; i++) {
        let user = await mockUser.createUser('user' + i, '123', '77' + i + '@gmail.com', 'male', 'eg', '1/1/2020');
        usersInDB.push(user);
    }
    await mockUser.promoteToArtist(usersInDB[0]._id, 'artist info', 'artist1', ['pop', 'rock', 'genre1']);
    artist = await mockArtist.findMeAsArtist(usersInDB[0]._id);
    for (let i = 0; i < 4; i++) {
        let album = await mockArtist.addAlbum(artist._id, 'album1', 'label1', ['eg'], 'Album', '1/1/2020', 'pop');
        albums.push(album);
    }
    for (let i = 0; i < 5; i++) {
        let track = await mockTrack.createTrack('', 'track1', 12, ['eg'], artist._id, albums[0]._id, 100, '12', '13', ['pop']);
        tracks.push(track);
        await mockArtist.addTrack(artist._id, track._id);
        await mockAlbum.addTrack(albums[0]._id, track);
    }
    for (let i = 0; i < 5; i++) {
        let track = await mockTrack.createTrack('', 'track1', 12, ['eg'], artist._id, albums[1]._id, 100, '12', '13', ['pop']);
        tracks.push(track);
        await mockArtist.addTrack(artist._id, track._id);
        await mockAlbum.addTrack(albums[1]._id, track);
    }
    for (let i = 0; i < 5; i++) {
        let track = await mockTrack.createTrack('', 'track1', 12, i == 4 ? ['fr'] : ['eg'], artist._id, albums[2]._id, 100, '12', '13', ['pop']);
        tracks.push(track);
        await mockArtist.addTrack(artist._id, track._id);
        await mockAlbum.addTrack(albums[2]._id, track);
    }
    for (let i = 0; i < 3; i++) {
        let playlist = await mockUser.createdPlaylist(user._id, 'playlist' + i, 'playlist');
        playlists.push(playlist);
        await mockPlaylist.addTrackToPlaylist(playlist._id, [tracks[i]._id, tracks[i + 1]._id, tracks[i + 2]._id, tracks[i + 3]._id]);
        if (i = 2) {
            playlist = await mockUser.createdPlaylist(user._id, 'playlist' + i, 'playlist');
            playlists.push(playlist);
        }
    }
    playlisId0 = playlists[0]._id;
    userNotHaveArray = new userDocument({
        email: 'aiui@eyey.com',
        password: '327378732187x88x8',
        displayName: 'userw',
        gender: 'male',
        country: 'eg',
        birthDate: '2020-02-20',
        product: 'free',
        userType: 'user',
        type: 'user',
        fcmToken: 'none',
        confirm: false,
        premiumConfirm: false,
        isFacebook: false,
        images: []
    });
    await userNotHaveArray.save();
    await userDocument.find({}, (err, files) => {
        usersInDB = [];
        for (let user of files) usersInDB.push(user);
    })
    tracks = [];
    albums = [];
    playlists = [];
    await trackDocument.find({}, (err, files) => {
        for (let file of files) tracks.push(file)
    })
    await albumDocument.find({}, (err, files) => {
        for (let file of files) albums.push(file)
    })

    await playlistDocument.find({}, (err, files) => {
        for (let file of files) playlists.push(file)
    })

})

afterEach(async() => {
    await userDocument.find({}, (err, files) => {
        usersInDB = [];
        for (let user of files) usersInDB.push(user);
    })
    tracks = [];
    albums = [];
    playlists = [];
    await trackDocument.find({}, (err, files) => {
        for (let file of files) tracks.push(file)
    })
    await albumDocument.find({}, (err, files) => {
        for (let file of files) albums.push(file)
    })

    await playlistDocument.find({}, (err, files) => {
        for (let file of files) playlists.push(file)
    })
    await new Promise(resolve => setTimeout(resolve, 20));

})

afterAll(async() => {
    await dbHandler.clearDatabase();
    await dbHandler.closeDatabase();
});
test('set prev next not player data', async() => {
    expect(await mockPlayer.setNextPrev(userNotHaveArray, usersInDB[0]._id)).toEqual(0);
})

//set Player Instance
test('set player instance  no user ', async() => {

    expect(await mockPlayer.setPlayerInstance()).toEqual(0);
});

test('set player instance  no user.player ', async() => {
    // await userDocument.updateOne({ _id: usersInDB[4]._id }, { player: undefined });
    expect(await mockPlayer.setPlayerInstance(userNotHaveArray)).toEqual(0);
});

test('set player instance  no user.player ', async() => {
    // await userDocument.updateOne({ _id: usersInDB[4]._id }, { player: undefined });
    expect(await mockPlayer.setPlayerInstance(usersInDB[0], true, '3ewd3e', 'e32ee', ['eewrew', 'fewfewf'], 'ratio')).toEqual(0);
});


test('add to recently not user ', async() => {

    expect(await mockPlayer.addRecentTrack()).toEqual(0);
});

test('add to recently   without history ', async() => {
    // await userDocument.updateOne({ _id: usersInDB[4]._id }, { playHistory: undefined });
    expect(await mockPlayer.addRecentTrack(userNotHaveArray, tracks[0]._id, 'artist', artist._id)).toEqual(1);
});

test('add to recently ', async() => {

    expect(await mockPlayer.addRecentTrack(usersInDB[0], tracks[0]._id, 'artist', artist._id)).toEqual(1);
});

test('add to recently ', async() => {

    expect(await mockPlayer.addRecentTrack(usersInDB[0], tracks[0]._id, 'album', albums[0]._id)).toEqual(1);
});

test('add to recently ', async() => {

    expect(await mockPlayer.addRecentTrack(usersInDB[0], tracks[0]._id, 'playlist', playlists[0]._id)).toEqual(1);
});

test('add to recently ', async() => {

    expect(await mockPlayer.addRecentTrack(usersInDB[0], tracks[0]._id, 'playlist', usersInDB[0]._id)).toEqual(1);
});

test('add to recently ', async() => {

    expect(await mockPlayer.addRecentTrack(usersInDB[0], tracks[0]._id, 'artist', usersInDB[0]._id)).toEqual(1);
});

test('add to recently ', async() => {

    expect(await mockPlayer.addRecentTrack(usersInDB[0], tracks[0]._id, 'album', usersInDB[0]._id)).toEqual(1);
});


test('add to recently ', async() => {

    expect(await mockPlayer.addRecentTrack(usersInDB[0], 'tracks[0]._id', 'album', ' usersInDB[0]._id')).toEqual(0);
});

test('add to recently ', async() => {

    expect(await mockPlayer.addRecentTrack(usersInDB[0], usersInDB[0]._id, 'artist', artist._id)).toEqual(1);
});

test('add to recently ', async() => {

    expect(await mockPlayer.addRecentTrack(usersInDB[0], usersInDB[0]._id, 'album', albums[0]._id)).toEqual(1);
});

test('add to recently ', async() => {

    expect(await mockPlayer.addRecentTrack(usersInDB[0], usersInDB[0]._id, 'playlist', playlists[0]._id)).toEqual(1);
});

test('get history for home for user not have recently ', async() => {
    userNotHaveArray = new userDocument({
        email: 'aiui@eyey.com',
        password: '327378732187x88x8',
        displayName: 'userw',
        gender: 'male',
        country: 'eg',
        birthDate: '2020-02-20',
        product: 'free',
        userType: 'user',
        type: 'user',
        fcmToken: 'none',
        confirm: false,
        premiumConfirm: false,
        isFacebook: false,
        images: []
    });
    await userNotHaveArray.save();
    let homePageRecntly = await mockPlayer.getRecentlyHomePage(userNotHaveArray);
    expect(homePageRecntly).toBeFalsy();
})

test('get history for home for user not have recently ', async() => {

    let homePageRecntly = await mockPlayer.getRecentlyHomePage(usersInDB[0]);
    expect(homePageRecntly.recentlyArtist.length).toEqual(1);
})

test('get history for user ', async() => {

    let tracksHistory = await mockPlayer.getRecentTracks(usersInDB[0]);
    expect(tracksHistory.length).toEqual(9);
})

test('get history for user with limit  ', async() => {

    let tracksHistory = await mockPlayer.getRecentTracks(usersInDB[0], 2);
    expect(tracksHistory.length).toEqual(0);
})

test('get history for user with invalid limit ', async() => {

    let tracksHistory = await mockPlayer.getRecentTracks(usersInDB[0], 100);
    expect(tracksHistory.length).toEqual(0);
})
test('get history for user with invalid limit ', async() => {

    let tracksHistory = await mockPlayer.getRecentTracks();
    expect(tracksHistory).toEqual(0);
})
test('clear recently tracks ', async() => {

    let tracksHistory = await mockPlayer.clearRecentTracks(usersInDB[0]);
    expect(tracksHistory).toEqual(1);
})
test('add to queue', async() => {
    expect(await mockPlayer.addToQueue(usersInDB[0], tracks[0]._id, false, albums[0]._id)).toEqual(1);
})
test('create queue playlist ', async() => {
    let createQueue = await mockPlayer.createQueue(usersInDB[0], true, playlisId0, tracks[0]._id);
    expect(createQueue).toEqual(1);
})
test('update instance', async() => {
    expect(await mockPlayer.setPlayerInstance(usersInDB[0], true, playlisId0, tracks[0]._id)).toEqual(1);
})
test('set shuffle : no user', async() => {
    expect(await mockPlayer.setShuffle(true, usersInDB[0])).toBe(1);
})
test('get queue with shuffle', async() => {
    const queue = await mockPlayer.getQueue(usersInDB[0]);
    expect(queue.length).toEqual(3);
})

test('set shuffle : no user', async() => {
    expect(await mockPlayer.setShuffle(false, usersInDB[0])).toBe(1);
})
test('get queue with shuffle', async() => {
    const queue = await mockPlayer.getQueue(usersInDB[0]);
    expect(queue.length).toEqual(3);
})
test('create queue albums ', async() => {
    let createQueue = await mockPlayer.createQueue(usersInDB[0], false, albums[0]._id, tracks[0]._id);
    expect(createQueue).toEqual(1);
})
test('update instance', async() => {
    expect(await mockPlayer.setPlayerInstance(usersInDB[0], false, albums[0]._id, tracks[0]._id)).toEqual(1);
})
test('set shuffle : ', async() => {
    expect(await mockPlayer.setShuffle(true, usersInDB[0])).toBe(1);
})
test('get queue with shuffle', async() => {
    const queue = await mockPlayer.getQueue(usersInDB[0]);
    expect(queue.length).toEqual(4);
})

test('set shuffle : ', async() => {
    expect(await mockPlayer.setShuffle(false, usersInDB[0])).toBe(1);
})
test('get queue with shuffle', async() => {
    const queue = await mockPlayer.getQueue(usersInDB[0]);
    expect(queue.length).toEqual(4);
})
test('create queue array ', async() => {
    let createQueue = await mockPlayer.createQueue(usersInDB[0], false, undefined, tracks[0]._id, [tracks[0]._id, tracks[1]._id, tracks[2]._id], 'ratio');
    expect(createQueue).toEqual(1);
})
test('set shuffle : no user', async() => {
    expect(await mockPlayer.setShuffle(true, usersInDB[0])).toBe(1);
})
test('get queue with shuffle', async() => {
    const queue = await mockPlayer.getQueue(usersInDB[0]);
    expect(queue.length).toEqual(2);
})
test('set shuffle : no user', async() => {
    expect(await mockPlayer.setShuffle(false, usersInDB[0])).toBe(1);
})
test('get queue with shuffle', async() => {
    const queue = await mockPlayer.getQueue(usersInDB[0]);
    expect(queue).toBeTruthy();
})
test('update instance', async() => {
    expect(await mockPlayer.setPlayerInstance(usersInDB[0], false, undefined, tracks[0]._id, [tracks[0]._id, tracks[1]._id, tracks[2]._id], 'ratio')).toEqual(1);
})
test('create queue playlist invalid', async() => {
    let createQueue = await mockPlayer.createQueue(usersInDB[0], true, playlists[playlists.length - 1]._id, tracks[0]._id);
    expect(createQueue).toEqual(0);
})

test('create queue albums invalid ', async() => {
    let createQueue = await mockPlayer.createQueue(usersInDB[0], false, albums[albums.length - 1]._id, tracks[0]._id);
    expect(createQueue).toEqual(0);
})

test('create queue array invalid', async() => {
    let createQueue = await mockPlayer.createQueue(usersInDB[0], false, undefined, tracks[0]._id, [tracks[5]._id, tracks[1]._id, tracks[2]._id], 'ratio');
    expect(createQueue).toEqual(0);
})

test('create queue playlist invalid', async() => {
    let createQueue = await mockPlayer.createQueue(undefined, true, 'playlists[playlists.length - 1]._id', tracks[0]._id);
    expect(createQueue).toEqual(0);
})

test('create queue albums invalid mongoose id ', async() => {
    let createQueue = await mockPlayer.createQueue(usersInDB[0], false, 'playlist', tracks[0]._id);
    expect(createQueue).toEqual(0);
})
test('create queue albums invalid track mongoose id ', async() => {
    let createQueue = await mockPlayer.createQueue(usersInDB[0], false, 'playlist', 'tracks[0]._id');
    expect(createQueue).toEqual(0);
})

test('create queue array invalid', async() => {
    let createQueue = await mockPlayer.createQueue(usersInDB[0], false, undefined, 'fdfdsfdsdsgs', [tracks[5]._id, tracks[1]._id, 'ffdfds'], 'ratio');
    expect(createQueue).toEqual(0);
})


test('create queue array invalid array', async() => {
    let createQueue = await mockPlayer.createQueue(usersInDB[0], false, undefined, tracks[1]._id, [tracks[5]._id, tracks[1]._id, 'ffdfds'], 'ratio');
    expect(createQueue).toEqual(0);
})


// test add to queue
test('add to queue invalid ids ', async() => {
    let addQueue = await mockPlayer.addToQueue(usersInDB[0], 'der32r2', false, 'dfgegeht');
    expect(addQueue).toEqual(0);
})

test('add to queue invalid ids ', async() => {
    let addQueue = await mockPlayer.addToQueue(usersInDB[0], usersInDB[0]._id, false, playlisId0);
    expect(addQueue).toEqual(0);
})

test('add to queue ', async() => {
    let addQueue = await mockPlayer.addToQueue(usersInDB[0], tracks[5]._id, false, albums[1]._id);
    expect(addQueue).toEqual(1);
})


test('add to queue no queue for user ', async() => {
    let addQueue = await mockPlayer.addToQueue(usersInDB[2], tracks[5]._id, false, albums[1]._id);
    expect(addQueue).toEqual(1);
})

test('add to queue no user ', async() => {
    let addQueue = await mockPlayer.addToQueue(undefined, tracks[5]._id, false, albums[1]._id);
    expect(addQueue).toEqual(0);
})

test('skip next : without user', async() => {
    expect(await mockPlayer.skipNext()).toEqual(0);
})

test('create queue array ', async() => {
    let createQueue = await mockPlayer.createQueue(usersInDB[0], false, undefined, tracks[0]._id, [tracks[0]._id, tracks[1]._id, tracks[2]._id], 'ratio');
    expect(createQueue).toEqual(1);
})
test('update instance', async() => {
    expect(await mockPlayer.setPlayerInstance(usersInDB[0], false, undefined, tracks[0]._id, [tracks[0]._id, tracks[1]._id, tracks[2]._id], 'ratio')).toEqual(1);
})
test('skip next : not  user  ', async() => {
    expect(await mockPlayer.skipNext(usersInDB[0]._id)).toEqual(0);
})
test('add to queue ', async() => {
        let addQueue = await mockPlayer.addToQueue(usersInDB[0], tracks[5]._id, false, albums[1]._id);
        expect(addQueue).toEqual(1);
    })
    /* test('skip next :  user  ', async() => {
        let nextTrackName = await mockPlayer.skipNext(usersInDB[0]);
        expect(nextTrackName).toEqual('track1');
    })
    test('skip next :  user  ', async() => {
        let user = await 
        expect(nextTrackName).toEqual('track1');
    })

    test('skip next :  user  ', async() => {
        const nextTrackName = await mockPlayer.skipNext(usersInDB[0]).track.name;
        expect(nextTrackName).toEqual('track1');
    })
    test('skip next :  user  ', async() => {
        const nextTrackName = await mockPlayer.skipNext(usersInDB[0]).track.name;
        expect(nextTrackName).toEqual('track1');
    })
    test('skip next :  user  ', async() => {
        const nextTrackName = await mockPlayer.skipNext(usersInDB[0]).track.name;
        expect(nextTrackName).toEqual('track1');
    })

     */
test('skip next :  user without player  ', async() => {
    const userNew = new userDocument({
        email: 'aiui@eyey.com',
        password: '327378732187x88x8',
        displayName: 'userw',
        gender: 'male',
        country: 'eg',
        birthDate: '2020-02-20',
        product: 'free',
        userType: 'user',
        type: 'user',
        fcmToken: 'none',
        confirm: false,
        premiumConfirm: false,
        isFacebook: false,
        images: []
    });
    await userNew.save();
    expect(await mockPlayer.skipNext(userNew)).toEqual(0);
})

test('skip next :  user without next player  ', async() => {
    const userNew = new userDocument({
        email: 'aiui@eyey.com',
        password: '327378732187x88x8',
        displayName: 'userw',
        gender: 'male',
        country: 'eg',
        birthDate: '2020-02-20',
        product: 'free',
        userType: 'user',
        type: 'user',
        player: {}
    });
    await userNew.save();
    expect(await mockPlayer.skipNext(userNew)).toEqual(0);
})

test('skip prev :  user without player  ', async() => {
    const userNew = new userDocument({
        email: 'aiui@eyey.com',
        password: '327378732187x88x8',
        displayName: 'userw',
        product: 'free',
        userType: 'user',
        type: 'user',
        fcmToken: 'none',
        confirm: false,
        premiumConfirm: false,
        isFacebook: false,
        images: []
    });
    await userNew.save();
    expect(await mockPlayer.skipPrevious(userNew)).toEqual(0);
})

test('skip prev :  user without next player  ', async() => {
    const userNew = new userDocument({
        email: 'aiui@eyey.com',
        password: '327378732187x88x8',
        displayName: 'userw',
        gender: 'male',
        birthDate: '2020-02-20',
        product: 'free',
        userType: 'user',
        type: 'user',
        player: {}
    });
    await userNew.save();
    expect(await mockPlayer.skipPrevious(userNew)).toEqual(0);
})

test('skip prev :  user', async() => {
    expect(await mockPlayer.skipPrevious(usersInDB[0])['isLiked']).toBeFalsy();
})


test('skip next :  user', async() => {
    expect(await mockPlayer.skipNext(usersInDB[0])['isLiked']).toBeFalsy();
})
test('skip prev :  user', async() => {
    expect(await mockPlayer.skipPrevious(usersInDB[0])['isLiked']).toBeFalsy();
})
test('skip next :  user', async() => {
    expect(await mockPlayer.skipNext(usersInDB[0])['isLiked']).toBeFalsy();
})
test('skip prev :  user', async() => {
    expect(await mockPlayer.skipPrevious(usersInDB[0])['isLiked']).toBeFalsy();
})

test('skip prev : no user', async() => {
    expect(await mockPlayer.skipPrevious()).toEqual(0);
})

test('queue has not playable', async() => {
    expect(await mockPlayer.createQueue(usersInDB[0], false, albums[2]._id, tracks[13]._id)).toEqual(1);
})

test('skip next :  user', async() => {
    expect(await mockPlayer.skipNext(usersInDB[0])['isLiked']).toBeFalsy();
})

test('skip next :  user', async() => {
    expect(await mockPlayer.skipNext(usersInDB[0])['isLiked']).toBeFalsy();
})

test('skip next :  user', async() => {
    expect(await mockPlayer.skipNext(usersInDB[0])['isLiked']).toBeFalsy();
})
test('skip prev :  user', async() => {
    expect(await mockPlayer.skipPrevious(usersInDB[0])['isLiked']).toBeFalsy();
})

test('skip prev : no user', async() => {
    expect(await mockPlayer.skipPrevious()).toEqual(0);
})
test('add to queue ', async() => {
    let addQueue = await mockPlayer.addToQueue(usersInDB[0], tracks[5]._id, false, albums[1]._id);
    expect(addQueue).toEqual(1);
})

test('skip next :  user', async() => {
    expect(await mockPlayer.skipNext(usersInDB[0])['isLiked']).toBeFalsy();
})
test('get queue : no user', async() => {
    const queue = await mockPlayer.getQueue();
    expect(queue).toEqual(0);
})

test('get queue', async() => {
    const queue = await mockPlayer.getQueue(usersInDB[0]);
    expect(queue).toBeTruthy();
})

test('set resume play no user ', async() => {
    expect(await mockPlayer.resumePlaying()).toBeFalsy();
})


test('set resume play no user ', async() => {
    expect(await mockPlayer.pausePlaying()).toBeFalsy();
})

test('set resume play no user ', async() => {
    expect(await mockPlayer.resumePlaying(usersInDB[0])).toBeTruthy();
})


test('set resume play no user ', async() => {
    expect(await mockPlayer.pausePlaying(usersInDB[0])).toBeTruthy();
})


test('set resume play no user ', async() => {
    expect(await mockPlayer.resumePlaying(usersInDB[5])).toBe(1);
})


test('set resume play no user ', async() => {
    expect(await mockPlayer.pausePlaying(usersInDB[5])).toBe(1);
})

// test shuffle

test('set shuffle : no user', async() => {
    expect(await mockPlayer.setShuffle(true)).toBe(0);
})
test('set shuffle : no user', async() => {
    expect(await mockPlayer.setShuffle(true, usersInDB[0])).toBe(1);
})
test('set shuffle : no user', async() => {
    expect(await mockPlayer.setShuffle(true, usersInDB[5])).toBe(0);
})
test('set shuffle : no user', async() => {
    expect(await mockPlayer.setShuffle(false, usersInDB[5])).toBe(0);
})
test('set shuffle : no user', async() => {
    expect(await mockPlayer.setShuffle(false, usersInDB[0])).toBe(1);
})

test('test repeat : ', async() => {
    expect(await mockPlayer.repreatPlaylist(usersInDB[0], false)).toBe(1);
})

test('test repeat : ', async() => {
    expect(await mockPlayer.repreatPlaylist(usersInDB[0], true)).toBe(1);
})
test('test repeat : with add to queue ', async() => {
    await mockPlayer.addToQueue(usersInDB[0], tracks[5]._id, false, albums[1]._id);
    await mockPlayer.addToQueue(usersInDB[0], tracks[5]._id, false, albums[1]._id);
    expect(await mockPlayer.repreatPlaylist(usersInDB[0], true)).toBe(1);
})

test('add to queue ', async() => {

    expect(await mockPlayer.addToQueue(usersInDB[0], tracks[10]._id, false, albums[0]._id)).toBe(0);
})

test('  add to queue ', async() => {

    expect(await mockPlayer.addToQueue(usersInDB[0], tracks[10]._id, false, playlisId0)).toBe(0);
})
test(' add to queue ', async() => {

    expect(await mockPlayer.addToQueue(usersInDB[0], tracks[10]._id, true, albums[0]._id)).toBe(0);
})

test('test repeat : with add to queue ', async() => {

    expect(await mockPlayer.addToQueue(usersInDB[0], tracks[10]._id, true, playlisId0)).toBe(0);
})

test('get queue with shuffle', async() => {
    const queue = await mockPlayer.getQueue(usersInDB[0]);
    expect(queue.length).toEqual(6);
})
test('test repeat : ', async() => {
    expect(await mockPlayer.repreatPlaylist(false)).toBe(0);
})

test('test repeat : ', async() => {
    expect(await mockPlayer.repreatPlaylist(true)).toBe(0);
})
test('fill function  : ', async() => {
    console.log(await mockPlayer.fillByplaylist(usersInDB[0]));
    expect(await mockPlayer.fillByplaylist(usersInDB[0])).toBe(1);
})
test('fill function  : no user', async() => {
    expect(await mockPlayer.fillByplaylist()).toBe(0);
})
test('random', async() => {
    let random = await mockPlayer.rondom(1, 2);
    expect(random).toBeTruthy();
})

test('shuffle no user ', async() => {
    expect(await mockPlayer.shuffleQueue()).toEqual(0);
})

test('shuffle no user ', async() => {
    expect(await mockPlayer.shuffleQueue(usersInDB[0])).toEqual(1);
})

test('queue has not playable', async() => {
    expect(await mockPlayer.createQueue(usersInDB[0], false, albums[2]._id, tracks[13]._id)).toEqual(1);
})
test('update instance', async() => {
    expect(await mockPlayer.setPlayerInstance(usersInDB[0], false, albums[2]._id, tracks[13]._id)).toEqual(1);
})
test('skip next :  user', async() => {
    expect(await mockPlayer.skipNext(usersInDB[0])['isLiked']).toBeFalsy();
})

test('skip prev :  user', async() => {
    expect(await mockPlayer.skipPrevious(usersInDB[0])['isLiked']).toBeFalsy();
})

test('skip prev :  user', async() => {
    expect(await mockPlayer.skipPrevious(usersInDB[0])['isLiked']).toBeFalsy();
})
test('queue has not playable', async() => {
    expect(await mockPlayer.createQueue(usersInDB[0], false, albums[2]._id, tracks[10]._id)).toEqual(1);
})
test('update instance', async() => {
    expect(await mockPlayer.setPlayerInstance(usersInDB[0], false, albums[2]._id, tracks[10]._id)).toEqual(1);
})
test('skip prev :  user', async() => {
    expect(await mockPlayer.skipPrevious(usersInDB[0])['isLiked']).toBeFalsy();
})

test('skip prev :  user', async() => {
    expect(await mockPlayer.skipPrevious(usersInDB[0])['isLiked']).toBeFalsy();
})
test('skip next :  user', async() => {
    expect(await mockPlayer.skipNext(usersInDB[0])['isLiked']).toBeFalsy();
})

test('skip next :  user', async() => {
    expect(await mockPlayer.skipNext(usersInDB[0])['isLiked']).toBeFalsy();
})
test('skip prev :  user', async() => {
    expect(await mockPlayer.skipPrevious(usersInDB[0])['isLiked']).toBeFalsy();
})

test('skip prev : no user', async() => {
    expect(await mockPlayer.skipPrevious()).toEqual(0);
})
test('test album fill by source', async() => {
    expect(await mockPlayer.fillByplaylist(usersInDB[0])).toEqual(1);
})
test('shuffle queue', async() => {
    expect(await mockPlayer.setShuffle(true, usersInDB[0])).toEqual(1);
})

test('queue has not playable', async() => {
    expect(await mockPlayer.createQueue(usersInDB[0], false, albums[2]._id, tracks[14]._id)).toEqual(0);
})

test('add to queue not playable', async() => {
    expect(await mockPlayer.addToQueue(usersInDB[0], tracks[14]._id, false, albums[2]._id)).toEqual(0);
})

test('increament liseners in track error object', async() => {
    expect(await mockPlayer.incrementListeners('iuui', 'track')).toEqual(0);
})

test('increament liseners in track object', async() => {
    expect(await mockPlayer.incrementListeners(tracks[10], 'track')).toEqual(1);
})

test('increament liseners in album object', async() => {
    expect(await mockPlayer.incrementListeners(albums[2], 'album')).toEqual(1);
})


test('increament liseners in album object', async() => {
    expect(await mockPlayer.incrementListeners(albums[1], 'album')).toEqual(1);
})

test('clear Recent Tracks', async() => {
    expect(await mockPlayer.clearRecentTracks()).toEqual(0);
})

test('random function ', async() => {
    await mockPlayer.rondom(2, 4);
    expect(await mockPlayer.rondom()).toEqual(0);
})

test('set next and prev with throw error', async() => {
    expect(await mockPlayer.setNextPrev()).toEqual(0);
})


test('set next and prev without current track', async() => {
    expect(await mockPlayer.setNextPrev(usersInDB[0])).toEqual(0);
})

test('set next and prev', async() => {
    expect(await mockPlayer.setNextPrev(usersInDB[0], usersInDB[0].player.currentTrack.trackId)).toEqual(1);
})

test('repeat with false state', async() => {
    expect(await mockPlayer.repreatPlaylist(usersInDB[0], 'f')).toEqual(0);
})