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
let playlist1;
let playlist2;
let playlist3;
let playlist4;
let playlist5;
let playlist6;

let track ;
let user;
let user2;
let user3;
let track2;
let track3;
let track4;
let track5;

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => {
    await dbHandler.connect();

    user = await mockUser.createUser("user1","123","b@b.com","male","eg","1/1/2020");
    user2 = await mockUser.createUser("user2","123","b2@b.com","male","eg","1/1/2020");
    user3 = await mockUser.createUser("user3","123","b3@b.com","male","eg","1/1/2020");
   await mockUser.promoteToArtist(user._id,"artist info","artist1",["pop"]);

   artist =  await mockArtist.findMeAsArtist(user._id);

   album = await mockArtist.addAlbum(artist._id,"album1","label1",["eg"],"Album","1/1/2020","pop");

   track =  await mockTrack.createTrack("","track1",12,["eg"],artist._id,album._id,100,"12","13",["pop"]);
   track2 =  await mockTrack.createTrack("","track2",12,["eg"],artist._id,album._id,100,"12","13",["pop"]);
   track3 =  await mockTrack.createTrack("","track3",12,["eg"],artist._id,album._id,100,"12","13",null);
   track4 =  await mockTrack.createTrack("","track4",12,["eg"],artist._id,album._id,100,"12","13",["rock"]);
   track5 =  await mockTrack.createTrack("","track5",12,["eg"],artist._id,album._id,100,"12","13",["rock"]);

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
 playlist1=await mockUser.createdPlaylist(user._id,"lili","hello kids");
 playlist2=await mockUser.createdPlaylist(user._id,"nini","hello kids");
 playlist3=await mockUser.createdPlaylist(user._id,"riri","hello kids");
 playlist4=await mockUser.createdPlaylist(user._id,"aiai","hello kids");
 playlist5=await mockUser.createdPlaylist(user2._id,"wiwi","hello kids");
 playlist6=await mockUser.createdPlaylist(user2._id,"jiji","hello kids");
 user = await mockUser.getUserById(user._id);
 user2 = await mockUser.getUserById(user2._id);
 await mockPlaylist.addTrackToPlaylist(playlist1._id,[track._id,track2._id,track3._id,track4._id]);


});



afterEach(async () => {
    playlist1=await mockPlaylist.getPlaylist(playlist1._id);
    playlist2=await mockPlaylist.getPlaylist(playlist2._id);
    playlist3=await mockPlaylist.getPlaylist(playlist3._id);
    playlist4=await mockPlaylist.getPlaylist(playlist4._id);
    playlist5=await mockPlaylist.getPlaylist(playlist5._id);
    playlist6=await mockPlaylist.getPlaylist(playlist6._id);
    user = await mockUser.getUserById(user._id);
    user2 = await mockUser.getUserById(user2._id);
    user3 = await mockUser.getUserById(user3._id);
    album = await mockAlbum.getAlbumById(album._id);
    artist = await mockArtist.getArtist(artist._id);
    track = await mockTrack.getTrack(track._id,user);
    track2 = await mockTrack.getTrack(track2._id,user);
    track3 = await mockTrack.getTrack(track3._id,user);
    track4 = await mockTrack.getTrack(track4._id,user);
    track5 = await mockTrack.getTrack(track5._id,user);
    //await dbHandler.clearDatabase();
});

/**
 * Remove and close the db and server.
 */
afterAll(async () => {
   await dbHandler.clearDatabase();
    await dbHandler.closeDatabase();
});

test('get playlist with existing id ',async()=>{
    expect((await mockPlaylist.getPlaylist(playlist1._id)).name).toEqual(  
     "lili");
 })
 test('get playlist with id 10 which is not found',async ()=>{
    expect(await mockPlaylist.getPlaylist("10")).toEqual(0);
 })
 test('get popular playlist',async ()=>{
    expect((await mockPlaylist.getPopularPlaylists()).playlists.length).toEqual(6  
      
         );
 })
 test('check if user has a playlist which he has ',async ()=>{
    expect((await mockPlaylist.checkIfUserHasPlaylist(user,playlist1._id)).playListId).toEqual( 
        
            playlist1._id
        )
     
 })
 test('check if user has a playlist which he has not ',async ()=>{
    expect(await mockPlaylist.checkIfUserHasPlaylist(user,playlist5._id)).toEqual( 
       undefined)
     
 })
 test('check if user follows a playlist which he does ',async ()=>{
    expect((await mockPlaylist.checkFollowPlaylistByUser(user,playlist1._id)).playListId).toEqual( 
        
                playlist1._id
        )
     
 })
 test('check if user follow a playlist which he has does not ',async ()=>{
    expect(await mockPlaylist.checkFollowPlaylistByUser(user,playlist5._id)).toEqual( 
       undefined)
     
 })
 test('get playlist with tracks for a valid playlist id ',async ()=>{
    expect((await mockPlaylist.getPlaylistWithTracks(playlist1._id,undefined,user))[0].tracks.length).toEqual( 
     4
     )
    })
    test('get playlist with tracks for an private playlist id ',async ()=>{
        await mockPlaylist.changePublic(user2,playlist5._id);
        playlist5=await mockPlaylist.getPlaylist(playlist5._id);
        expect((await mockPlaylist.getPlaylistWithTracks(playlist5._id,undefined,user2))[0].isPublic).toEqual( 
           false)
     })
     test('get playlist with tracks for an invalid playlist id ',async ()=>{
        expect(await mockPlaylist.getPlaylistWithTracks("10",undefined,user)).toEqual( 
          0)
     })
     test('create a playlist',async ()=>{
        expect((await mockPlaylist.createPlaylist(user._id,"RELAX","FUN KIDS")).name).toEqual( 
           "RELAX")
     })
     test('Follow a playlist that the user doesnt follow',async ()=>{
        expect(await mockPlaylist.followPlaylits(user,playlist6._id,false)).toEqual( 
          1)
     })
     test('Follow a playlist that the user doesnt follow',async()=>{
        expect(await mockPlaylist.followPlaylits(user3,playlist6._id,false)).toEqual( 
          1)
     })
     test('unFollow a playlist that the user does follow',async()=>{
        expect(await mockPlaylist.unfollowPlaylist(user3,playlist6._id)).toEqual( 
          1)
     })
     test('Follow a playlist doesnt exist that the user doesnt follow',async ()=>{
        expect(await mockPlaylist.followPlaylits(user,"1000",false)).toEqual( 
          0)
     })
     test('Follow a playlist that the user already follows',async ()=>{
        expect(await mockPlaylist.followPlaylits(user,playlist1._id,false)).toEqual( 
          0)
     })
     test('Unfollow a playlist that the user follows',async()=>{
        expect(await mockPlaylist.unfollowPlaylist(user,playlist6._id)).toEqual( 
          1)
     })
     test('Unfollow a playlist that the user doesnt follow',async()=>{
        expect(await mockPlaylist.unfollowPlaylist(user,playlist6._id)).toEqual( 
          0)
     })
     test('add tracks to a playlist that the user has created',async ()=>{
        expect((await mockPlaylist.addTrackToPlaylist(playlist1._id,[track5._id])).snapshot[1].hasTracks.length).toEqual( 
            5)
     })
     test('get playlist with tracks for a valid playlist id ',async ()=>{
        expect((await mockPlaylist.getPlaylistWithTracks(playlist1._id,undefined,user))[0].tracks.length).toEqual( 
         5)
     })
     test('get playlist with tracks for a valid playlist id with no auth ',async ()=>{
        expect((await mockPlaylist.getPlaylistTracks(playlist1._id))[0].tracks.length).toEqual( 
         5)
     })
     test('get playlist with tracks for an invalid playlist id with no auth ',async ()=>{
        expect((await mockPlaylist.getPlaylistTracks("2113123"))).toEqual( 
         0)
     })
     test('update a playlist that the user has created',async()=>{
        expect((await mockPlaylist.updatePlaylistDetails(playlist2._id,{name:"kill"})).name).toEqual( 
           "kill")
        })
        test('update a playlist that is not found',async()=>{
            expect(await mockPlaylist.updatePlaylistDetails("10d0fs",{name:"kill",description:"OHAYO"})).toEqual(   
              0
              )
         })
         test('get current user playlists',async()=>{
            expect((await mockPlaylist.getUserPlaylists(user._id,undefined,undefined,true)).length).toEqual( 
             4)
         })
         test('get a user empty playlists',async()=>{
            expect(await mockPlaylist.getUserPlaylists(user3._id,undefined,undefined,false)).toEqual( 
              [  
          ])
         })
         test('get a user public playlists',async()=>{
            expect((await mockPlaylist.getUserPlaylists(user2._id,undefined,undefined,false)).length).toEqual( 
            2)
         })
         
         test('get a user public playlists',async()=>{
            expect((await mockPlaylist.getUserPlaylists(user2._id,20,0,false)).length).toEqual( 
            2)
         })
         test('get invalid user playlists',async()=>{
            expect(await mockPlaylist.getUserPlaylists("0",20,0,false)).toEqual( 
              [])
         })
         test('set playlist status that its not collaborative to public ',async()=>{
            expect(await mockPlaylist.changePublic(user2,playlist5._id)).toEqual( 
              true)
         })
         test('toggle collaboration of a palylist the user has',async()=>{
            expect(await mockPlaylist.changeCollaboration(user2,playlist5._id)).toEqual( 
              true)
         })
         test('set playlist status that its collaborative to public ',async()=>{
            expect(await mockPlaylist.changePublic(user2,playlist5._id)).toEqual( 
              false)
         })
         test('toggle collaboration of an invalid palylist ',async()=>{
            expect(await mockPlaylist.changeCollaboration(user2,"10")).toEqual( 
              0)
         })
         test('add invalid tracks to a playlist ',async()=>{
            expect(await mockPlaylist.addTrackToPlaylist(playlist1._id,[])).toEqual( 
              0)
         })
         test('delete tracks to a playlist that the user has ',async()=>{
            expect((await mockPlaylist.removePlaylistTracks(playlist1._id,[track5._id])).snapshot[2].hasTracks.length).toEqual( 
                4)
         })
         test('reorder tracks in a playlist that the user has ',async()=>{
             let tracks=await mockPlaylist.reorderPlaylistTracks(playlist1._id,undefined,2,2,1);
             tracks=tracks.snapshot[3].hasTracks;
            expect(Array(...tracks)).toEqual( 
               [track2._id,track3._id,track._id,track4._id])
         })

         test('delete tracks to a playlist that the user has ',async()=>{
            let tracks=await mockPlaylist.removePlaylistTracks(playlist1._id,[track._id,track4._id],playlist1.snapshot[playlist1.snapshot.length-1]._id);
            tracks=tracks.snapshot[4].hasTracks;
            expect(Array(...tracks)).toEqual( 
                        [track2._id,track3._id]
                            )
         })
         test('reorder tracks in a playlist that the user has ',async()=>{
            let tracks=await mockPlaylist.reorderPlaylistTracks(playlist1._id,playlist1.snapshot[playlist1.snapshot.length-1]._id,2,1,1);
            tracks=tracks.snapshot[5].hasTracks;
           expect(Array(...tracks)).toEqual( 
              [track3._id,track2._id])
            
         })
         test('get user deleted a playlist which the user didnt delete any yet',async()=>{
            expect(await mockPlaylist.getDeletedPlaylists(user2._id,20)).toEqual( 
              [])
         })
         test('delete a playlist that the user has created',async()=>{
            expect(await mockPlaylist.deletePlaylist(user2,playlist5._id)).toEqual( 
              1)
         })
         test('get user deleted a playlist ',async()=>{
             let check=await mockUser.deletePlaylist(user2._id,playlist6._id);
            expect((await mockPlaylist.getDeletedPlaylists(user2._id,20)).length).toEqual( 
              1)
         })
         test('delete a playlist that the user has not',async()=>{
            expect(await mockPlaylist.deletePlaylist(user2,playlist1._id)).toEqual( 
              0)
         })
         test('check if playlist has tracks',async()=>{
            expect(Array(...(await mockPlaylist.checkPlaylistHasTracks(playlist1._id,[track2._id,track._id])))).toEqual( 
              [true,false])
         })
         test('check if invalid playlist has tracks',async()=>{
            expect(await mockPlaylist.checkPlaylistHasTracks("1231",[track2._id,track._id])).toEqual( 
              0)
         })
         test('check if  playlist has invalid tracks',async()=>{
            expect(await mockPlaylist.checkPlaylistHasTracks(playlist1._id,["sdasd"])).toEqual( 
              0)
         })
