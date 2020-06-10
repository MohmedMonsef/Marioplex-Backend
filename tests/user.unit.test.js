const mockTrack = require('../source/track-api');
const mockUser = require('../source/user-api');
const mockArtist = require('../source/artist-api');
const sendmail = require('../source/sendmail');
const mockAlbum = require('../source/album-api');
const mongoose = require('mongoose');
const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dbHandler = require('./db-handler');
const mongod = new MongoMemoryServer();
const ObjectId = mongoose.Types.ObjectId;
let users = [{
      
        'displayName': 'dina alaa',
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
        'product':'premium',
        'premium':{}
        
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
    '_id':'1',
    'artistId':'2',
    'hasTracks':[],
    'name':'album gamed',
    'images':[]

},
{
    '_id':'2',
    'artistId':'2',
    'hasTracks':[]

},
{
    '_id':'3',
    'artistId':'2',
    'hasTracks':[],
    'name':'ay haga1'

},
{
'_id':'4',
'artistId':'20',
'hasTracks':[],
'name':'ay haga'


},
{
  '_id':'5',
  'name':'haytham',
  'images':[],
  'hasTracks':[]
}]

beforeAll(async () => {
    await dbHandler.connect();
    let i = 0;
    for(let user of users){
    let u = await mockUser.createUser(user.displayName,user.password,user.email,user.gender,user.country,user.birthDate);
    
    if(i == 1){
        u.product = 'premium'
        u.isFacebook = true;
        await u.save()
    }
    usersInDB.push(u);
    i++;
    }
     i=0;
    for(let user of usersInDB){
        if(i==1)break;
        await mockUser.promoteToArtist(user._id,'artist info','artist'+i,['pop']);
        let artist =  await mockArtist.findMeAsArtist(user._id);
        artists.push(artist);
        i++;
        if(i==1){
            let j=0;
            for(let album of albumsObjs){
                let album1 = await mockArtist.addAlbum(artist._id,album.name,'label1',['eg'],'Single','1/1/2020','pop');
                albums.push(album1);
                if(j==0){
                    let track =   await mockTrack.createTrack('','track1',12,['eg'],artist._id,album1._id,100,'12','13',['pop']);
                    tracks.push(track);
                    await mockArtist.addTrack(artist._id, track._id);
                    await mockAlbum.addTrack(album1._id, track);
                } 
                j++;
            }
        }
    }
   
   
   
    
});
afterEach(async () => {
    await userDocument.find({},(err,files)=>{
        usersInDB = [];
        for(let user of files) usersInDB.push(user);
    })
    tracks = [];
    albums = [];
    artists = [];
    await albumDocument.find({},(err,files)=>{
        for(let file of files) albums.push(file)
    })
    await artistDocument.find({},(err,files)=>{
        for(let file of files) artists.push(file)
    })
    await trackDocument.find({},(err,files)=>{
        for(let file of files) tracks.push(file)
    })
   await new Promise(resolve => setTimeout(resolve, 10));

 });
afterAll(async () => {
    await dbHandler.clearDatabase();
     await dbHandler.closeDatabase();
 });
 

test(' update user', async () => {
    expect(await mockUser.update(undefined,usersInDB[0]._id, undefined, undefined, 'dai alaa', '1223345677',undefined, undefined,undefined, undefined, undefined, undefined)).toBeTruthy()
})
test('update user with incorrect password', async () => {
    expect(await mockUser.update(undefined,usersInDB[0]._id, undefined, undefined, 'dai alaa', '2',undefined, undefined,undefined, undefined, undefined, undefined)).toBeFalsy()
})

test('update facebook user with country', async () => {
    expect(await mockUser.update(undefined,usersInDB[1]._id, undefined, undefined, 'dai alaa', '1223345678',undefined, 'eg',undefined, undefined, undefined, undefined)).toBeTruthy()
})
test('update  user with gender', async () => {
    expect(await mockUser.update(undefined,usersInDB[0]._id, 'female', undefined, 'dai alaa', '1223345677',undefined, 'eg',undefined, undefined, undefined, undefined)).toBeTruthy()
})
test('update  user with birthdate', async () => {
    expect(await mockUser.update(undefined,usersInDB[0]._id, 'female', '1/1/2010', 'dai alaa', '1223345677',undefined, 'eg',undefined, undefined, undefined, undefined)).toBeTruthy()
})
test('update facebook premium user data', async () => {
    expect(await mockUser.update(undefined,usersInDB[1]._id, 'female', '1/1/2010', 'dai alaa', '1223345678',undefined, 'eg','1/1/2020','123', true, '123')).toBeTruthy()
})
test('update  user email', async () => {
    expect(await mockUser.update(undefined,usersInDB[2]._id, 'female', '1/1/2010', 'dai alaa', '12345678','n@n.com', 'eg','1/1/2020','123', true, '123')).toBeTruthy()
})
test('update  user same email', async () => {
    expect(await mockUser.update(undefined,usersInDB[2]._id, 'female', '1/1/2010', 'dai alaa', '12345678','n@n.com', 'eg','1/1/2020','123', true, '123')).toBeTruthy()
})
test('update non mongoose user', async () => {
    expect(await mockUser.update(undefined,'1', 'female', '1/1/2010', 'dai alaa', '1223345678',undefined, 'eg','1/1/2020','123', true, '123')).toBeFalsy()
})






test('get user', async () => {
    let user = await mockUser.getUserById(usersInDB[0]._id);
    expect(user.displayName).toEqual( 'dina alaa');
})

test('get user not fount', async () => {
    expect(await mockUser.getUserById('10')).toBeFalsy();
})
test('test me ', async () => {

    expect((await mockUser.me(usersInDB[0]._id)).displayName).toEqual( 'dina alaa');
})
test('bad test me ', async () => {

    expect(await mockUser.me('7')).toBeFalsy();
})
test(' test me non exist', async () => {

    expect(await mockUser.me(ObjectId())).toBeFalsy();
})


test('update player for user without player',async ()=>{
    expect(await mockUser.updatePlayerInfoLogOut(usersInDB[1],1,true,5)).toEqual(undefined);
})

test('update player for user without player',async ()=>{
    expect(await mockUser.updatePlayerInfoLogOut(usersInDB[1],undefined,undefined,undefined)).toEqual(undefined);
})













test('test GET user followed artist ', async () => {
    expect(await mockUser.getUserFollowingArtist(usersInDB[0]._id)).toEqual([]);
})

test('test check email', async () => {
    expect((await mockUser.checkmail('dinaalaaahmed@gmail.com')).displayName).toEqual( 'dina alaa');
})
test('update password by forget password', async () => {
    expect(await mockUser.updateforgottenpassword(usersInDB[1],'123')).toEqual('123')
})









test('create playlist', async () => {
    let p = await mockUser.createdPlaylist(usersInDB[0]._id, 'playlist1', 'this is my playlist');
    playlists.push(p);
    expect((p).Description).toEqual('this is my playlist')
})
test('create playlist with wrong mongoose id', async () => {
    let p = await mockUser.createdPlaylist('1', 'playlist1', 'this is my playlist');
    expect((p)).toBeFalsy()
})
test('create playlist with non existing user', async () => {
    let p = await mockUser.createdPlaylist(ObjectId(), 'playlist1', 'this is my playlist');
    expect((p)).toBeFalsy()
})
test('get non mongoose id playlist', async () => {
    let p = await mockUser.getPlaylist('1', undefined, '1');
    expect((p)).toBeFalsy()
})
test('get playlist for non existing user', async () => {
    let p = await mockUser.getPlaylist(ObjectId(), undefined, ObjectId());
    expect((p)).toBeFalsy()
})
test('get non existing  playlist for user', async () => {
    let p = await mockUser.getPlaylist(ObjectId(), undefined, usersInDB[0]._id);
    expect((p)).toBeFalsy()
})
test('get   playlist for user', async () => {
    let p = await mockUser.getPlaylist(playlists[0]._id, undefined, usersInDB[0]._id);
    expect((p)).toBeTruthy()
})
test(('check Authorized Playlist'), async () => {
    
    expect(await mockUser.checkAuthorizedPlaylist(usersInDB[0]._id, playlists[0]._id)).toBeTruthy()
})

test('add track to  other user playlist',async ()=>{
    const addTrack = await mockUser.addTrack(usersInDB[0]._id,tracks[0]._id,playlists[0]._id);
    expect(addTrack).toBeTruthy()
})
test('add second track to other user playlist',async ()=>{
    const addTrack = await mockUser.addTrack(usersInDB[0]._id,tracks[0]._id,playlists[0]._id);
    expect(addTrack).toBeTruthy()
})
test('add track to  other user playlist with non mongoose id',async ()=>{
    const addTrack = await mockUser.addTrack('1','1',playlists[0]._id);
    expect(addTrack).toBeFalsy()
})

test('add track to  other user playlist with non existing user',async ()=>{
    const addTrack = await mockUser.addTrack(ObjectId(),tracks[0]._id,playlists[0]._id);
    expect(addTrack).toBeTruthy()
})
test('add track to  other user playlist non existing playlist',async ()=>{
    const addTrack = await mockUser.addTrack(usersInDB[0]._id,tracks[0]._id,ObjectId());
    expect(addTrack).toBeFalsy()
})
test('add track to  other user playlist non existing track',async ()=>{
    const addTrack = await mockUser.addTrack(usersInDB[0]._id,ObjectId(),playlists[0]._id);
    expect(addTrack).toBeFalsy()
})

test('add track to   playlist',async ()=>{
   // console.log(usersInDB[0])
    const addTrack = await mockUser.AddTrackToPlaylist(usersInDB[0]._id,tracks[0]._id,playlists[0]._id);
    expect(addTrack).toBeTruthy()
})
test('add second track to other user playlist',async ()=>{
    const addTrack = await mockUser.AddTrackToPlaylist(usersInDB[0]._id,tracks[0]._id,playlists[0]._id);
    expect(addTrack).toBeTruthy()
})
test('add track to  other user playlist with non mongoose id',async ()=>{
    const addTrack = await mockUser.AddTrackToPlaylist('1','1',playlists[0]._id);
    expect(addTrack).toBeFalsy()
})

test('add track to  other user playlist with non existing user',async ()=>{
    const addTrack = await mockUser.AddTrackToPlaylist(ObjectId(),tracks[0]._id,playlists[0]._id);
    expect(addTrack).toBeFalsy()
})
test('add track to  other user playlist non existing playlist',async ()=>{
    const addTrack = await mockUser.AddTrackToPlaylist(usersInDB[0]._id,tracks[0]._id,ObjectId());
    expect(addTrack).toBeFalsy()
})
test('add track to  other user playlist non existing track',async ()=>{
    const addTrack = await mockUser.AddTrackToPlaylist(usersInDB[0]._id,ObjectId(),playlists[0]._id);
    expect(addTrack).toBeFalsy()
})




test('check if user follow artist when he doesnt ',async ()=>{
    const following = await mockUser.checkIfUserFollowArtist(usersInDB[1]._id,artists[0]._id);
    expect(following).toBeFalsy();
})
test('check if non existing user follow artist when he doesnt ',async ()=>{
    const following = await mockUser.checkIfUserFollowArtist(ObjectId(),artists[0]._id);
    expect(following).toBeFalsy();
})
test('check if user follow non existing artist when he doesnt ',async ()=>{
    const following = await mockUser.checkIfUserFollowArtist(usersInDB[1]._id,ObjectId());
    expect(following).toBeFalsy();
})
test('check if non mongoose  user follow artist when he doesnt ',async ()=>{
    const following = await mockUser.checkIfUserFollowArtist('1',artists[0]._id);
    expect(following).toEqual(-1);
})
test('user unfollow artist that he didnt follow before',async ()=>{
    const unfollow = await mockUser.userUnfollowArtist(usersInDB[1]._id,artists[0]._id);
    expect(unfollow).toBeFalsy();
})
test('user follow artist',async ()=>{
    const follow = await mockUser.userFollowArtist(usersInDB[1]._id,artists[0]._id);
    expect(follow).toBeTruthy();
})
test('user follow artist again',async ()=>{
    const follow = await mockUser.userFollowArtist(usersInDB[1]._id,artists[0]._id);
    expect(follow).toBeTruthy();
})
test('gwt user followings',async ()=>{
    const follow = await mockUser.getUserFollowingUser(usersInDB[1]._id);
    expect(follow).toBeTruthy();
})
test('check if user follow artist when he does ',async ()=>{
    const following = await mockUser.checkIfUserFollowArtist(usersInDB[1]._id,artists[0]._id);
    expect(following).toBeTruthy();
})
test('non existing user follow artist',async ()=>{
    const follow = await mockUser.userFollowArtist(ObjectId(),artists[0]._id);
    expect(follow).toBeFalsy();
})
test('non mongoose user follow artist',async ()=>{
    const follow = await mockUser.userFollowArtist('1',artists[0]._id);
    expect(follow).toBeFalsy();
})
test('get user following artist', async ()=>{
    const following = await mockUser.getUserFollowingArtist(usersInDB[1]._id);
    expect(following).toBeTruthy();
})

test('get non existing user following artist', async ()=>{
    const following = await mockUser.getUserFollowingArtist(ObjectId());
    expect(following).toBeFalsy();
})
test('get non mongoose user following artist', async ()=>{
    const following = await mockUser.getUserFollowingArtist('1');
    expect(following).toBeFalsy();
})
test('non existing user unfollow artist',async ()=>{
    const unfollow = await mockUser.userUnfollowArtist(ObjectId(),artists[0]._id);
    expect(unfollow).toBeFalsy();
})
test('non existing user unfollow non existing artist',async ()=>{
    const unfollow = await mockUser.userUnfollowArtist(ObjectId(),ObjectId());
    expect(unfollow).toBeFalsy();
})
test('non mongoose user unfollow artist',async ()=>{
    const unfollow = await mockUser.userUnfollowArtist('1',artists[0]._id);
    expect(unfollow).toBeFalsy();
})
test('user unfollow artist',async ()=>{
    const unfollow = await mockUser.userUnfollowArtist(usersInDB[1]._id,artists[0]._id);
    expect(unfollow).toBeTruthy();
})
test('get user following user', async ()=>{
    const following = await mockUser.getUserFollowingUser(usersInDB[1]._id);
    expect(following.length).toBeFalsy();
})

test('get non existing user following user', async ()=>{
    const following = await mockUser.getUserFollowingUser(ObjectId());
    expect(following).toBeFalsy();
})
test('get non mongoose user following user', async ()=>{
    const following = await mockUser.getUserFollowingUser('1');
    expect(following).toBeFalsy();
})



test('confirm email of user',async ()=>{
    let confirm = await mockUser.confirmEmail(usersInDB[0]);
    expect(confirm).toBeTruthy();
})
test('confirm email of user again',async ()=>{
    usersInDB[0].confirm = false;
    let confirm = await mockUser.confirmEmail(usersInDB[0]);
    expect(confirm).toBeTruthy();
})
test('confirm premium of user',async ()=>{
    let confirm = await mockUser.confirmPremium(usersInDB[0]);
    expect(confirm).toBeTruthy();
})
test('confirm premium of user again',async ()=>{
    usersInDB[0].premiumConfirm = false;
    let confirm = await mockUser.confirmPremium(usersInDB[0]);
    expect(confirm).toBeTruthy();
})



test('user follow playlist' , async ()=>{
    let followedPlaylist = await mockUser.followPlaylist(usersInDB[0]._id,playlists[0]._id,false);
    expect(followedPlaylist).toBeFalsy();
})

test('non mongose user follow playlist' , async ()=>{
    let followedPlaylist = await mockUser.followPlaylist('1',playlists[0]._id,false);
    expect(followedPlaylist).toBeFalsy();
})
test('non existing user follow playlist' , async ()=>{
    let followedPlaylist = await mockUser.followPlaylist(ObjectId(),playlists[0]._id,false);
    expect(followedPlaylist).toBeFalsy();
})

test('user unfollow playlist' , async ()=>{
    let followedPlaylist = await mockUser.unfollowPlaylist(usersInDB[0]._id,playlists[0]._id);
    expect(followedPlaylist).toBeTruthy();
})

test('non mongose user unfollow playlist' , async ()=>{
    let followedPlaylist = await mockUser.unfollowPlaylist('1',playlists[0]._id);
    expect(followedPlaylist).toBeFalsy();
})
test('non existing user unfollow playlist' , async ()=>{
    let followedPlaylist = await mockUser.unfollowPlaylist(ObjectId(),playlists[0]._id);
    expect(followedPlaylist).toBeFalsy();
})





test('create queu for user',async ()=>{
    const q = await mockUser.createQueue(usersInDB[0]._id,false,albums[0]._id ,tracks[0]._id);
    expect(q).toBeTruthy()
})
test('create queu for non mogoose user',async ()=>{
    const q = await mockUser.createQueue('1',true,playlists[0]._id ,tracks[0]._id);
    expect(q).toBeFalsy()
})
test('create queu for non existing user',async ()=>{
    const q = await mockUser.createQueue(ObjectId(),true,playlists[0]._id ,tracks[0]._id);
    expect(q).toBeFalsy()
})
test('not create queu for user',async ()=>{
    const q = await mockUser.createQueue(usersInDB[0]._id,true,ObjectId() ,tracks[0]._id);
    expect(q).toBeFalsy()
})
test('add to queu',async ()=>{
    const q = await mockUser.addToQueue(usersInDB[0]._id,tracks[0]._id,false,albums[0]._id);
    expect(q).toBeTruthy()
})
test('add queu for non mogoose user',async ()=>{
    const q = await mockUser.addToQueue('1',tracks[0]._id,false,albums[0]._id);
    expect(q).toBeFalsy()
})
test('add queu for non existing user',async ()=>{
    const q = await mockUser.addToQueue(ObjectId(),tracks[0]._id,false,albums[0]._id);
    expect(q).toBeFalsy()
})
test('not add  queu for user',async ()=>{
    const q = await mockUser.addToQueue(usersInDB[0]._id,tracks[0]._id,false,ObjectId());
    expect(q).toBeFalsy()
})

test('update player',async ()=>{
    const p = await mockUser.updateUserPlayer(usersInDB[0]._id,false,albums[0]._id,tracks[0]._id);
    expect(p).toBeTruthy()
})
test('update player for non user',async ()=>{
    const p = await mockUser.updateUserPlayer(ObjectId(),false,albums[0]._id,tracks[0]._id);
    expect(p).toBeFalsy()
})
test('update player for non mongoose user',async ()=>{
    const p = await mockUser.updateUserPlayer('1',false,albums[0]._id,tracks[0]._id);
    expect(p).toBeFalsy()
})
test('repeat playlist ',async ()=>{
    const x = await mockUser.repreatPlaylist(usersInDB[0]._id,0);
    expect(x).toBeTruthy();
})
test('repeat playlist non mongoose user ',async ()=>{
    const x = await mockUser.repreatPlaylist('1',0);
    expect(x).toBeFalsy();
})
test('repeat playlist non user',async ()=>{
    const x = await mockUser.repreatPlaylist(ObjectId(),0);
    expect(x).toBeFalsy();
})
test('shuffle playlist ',async ()=>{
    const x = await mockUser.setShuffle(0,usersInDB[0]._id);
    expect(x).toBeTruthy();
})
test('shuffle playlist non mongoose user ',async ()=>{
    const x = await mockUser.setShuffle(0,'1');
    expect(x).toBeFalsy();
})
test('shuffle playlist non user',async ()=>{
    const x = await mockUser.setShuffle(0,ObjectId());
    expect(x).toBeFalsy();
})
test('get user queue',async ()=>{
    const x = await mockUser.getQueue(usersInDB[0]._id);
    expect(x).toBeTruthy()
})
test('get non  user queue',async ()=>{
    const x = await mockUser.getQueue(ObjectId());
    expect(x).toBeFalsy()
})
test('get non mongoose user queue',async ()=>{
    const x = await mockUser.getQueue('1');
    expect(x).toBeFalsy()
})
test('resume playing for user',async ()=>{
    const x = await mockUser.resumePlaying(usersInDB[0]._id);
    expect(x).toBeTruthy()
})
test('resume playing for non  user',async ()=>{
    const x = await mockUser.resumePlaying(ObjectId());
    expect(x).toBeFalsy()
})
test('resume playing for non mongoose user',async ()=>{
    const x = await mockUser.resumePlaying('!');
    expect(x).toBeFalsy()
})
test('pause playing for user',async ()=>{
    const x = await mockUser.pausePlaying(usersInDB[0]._id);
    expect(x).toBeTruthy()
})
test('pause playing for non  user',async ()=>{
    const x = await mockUser.pausePlaying(ObjectId());
    expect(x).toBeFalsy()
})
test('pause playing for non mongoose user',async ()=>{
    const x = await mockUser.pausePlaying('!');
    expect(x).toBeFalsy()
})




test('user 1 follow user 2',async ()=>{
    //console.log(usersInDB[0])
    const x = await mockUser.userFollowUser(usersInDB[0]._id,usersInDB[1]._id);
    expect(x).toBeTruthy();
})
test('user 1 follow user 3',async ()=>{
    //console.log(usersInDB[0])
    const x = await mockUser.userFollowUser(usersInDB[0]._id,usersInDB[2]._id);
    expect(x).toBeTruthy();
})
test('user 1 follow user 2 which he already followed',async ()=>{
    const x = await mockUser.userFollowUser(usersInDB[0]._id,usersInDB[1]._id);
    expect(x).toBeFalsy();
})

test('non mongoose user 1 follow user 2',async ()=>{
    const x = await mockUser.userFollowUser('1',usersInDB[1]._id);
    expect(x).toBeFalsy();
})

test('non existing user 1 follow user 2',async ()=>{
    const x = await mockUser.userFollowUser(ObjectId(),usersInDB[1]._id);
    expect(x).toBeFalsy();
})

test('non existing user 1 and non existing user2 follow user 2',async ()=>{
    const x = await mockUser.userFollowUser(ObjectId(),ObjectId());
    expect(x).toBeFalsy();
})
test('get users that user1 follows',async ()=>{
    const x = await mockUser.getUserFollowingUser(usersInDB[0]._id);
    expect(x.length).toEqual(2);
})
test('get users that non mongoose user1 follows',async ()=>{
    const x = await mockUser.getUserFollowingUser('1');
    expect(x).toBeFalsy();
})
test('get users that non existing user1 follows',async ()=>{
    const x = await mockUser.getUserFollowingUser(ObjectId());
    expect(x).toBeFalsy();
})

test('get users that follow user1 with no followers',async ()=>{
    const x = await mockUser.getUserFollowers(usersInDB[0]._id);
    expect(x.length).toEqual(0);
})
test('get users that follow user2 ',async ()=>{
    const x = await mockUser.getUserFollowers(usersInDB[1]._id);
    expect(x.length).toEqual(1);
})
test('get users that follow non existing user1 ',async ()=>{
    const x = await mockUser.getUserFollowers(ObjectId());
    expect(x).toBeFalsy();
});

test('get users that follow non mongoose user1 ',async ()=>{
    const x = await mockUser.getUserFollowers('1');
    expect(x).toBeFalsy();
});

test('user1 unfollow user2 ',async ()=>{
    const x = await mockUser.userUnfollowUser(usersInDB[0]._id,usersInDB[1]._id);
    expect(x).toBeTruthy();
})
test('user1 unfollow user2 which he  unfolllowed ',async ()=>{
    const x = await mockUser.userUnfollowUser(usersInDB[0]._id,usersInDB[1]._id);
    expect(x).toBeFalsy();
})
test('non existing user1 unfollow non existing user2 ',async ()=>{
    const x = await mockUser.userUnfollowUser(ObjectId(),ObjectId());
    expect(x).toBeFalsy();
})
test('non mongoose user1 unfollow user2 ',async ()=>{
    const x = await mockUser.userUnfollowUser('1',usersInDB[1]._id);
    expect(x).toBeFalsy();
})




test('delete playlist of user',async ()=>{
   // console.log(usersInDB[0],playlists[0])
    const deleted = await mockUser.deletePlaylist(usersInDB[0]._id,playlists[0]._id);
    expect(deleted).toBeFalsy();
})
test('delete playlist of non mongoose user user',async ()=>{
    const deleted = await mockUser.deletePlaylist('1',playlists[0]._id);
    expect(deleted).toBeFalsy();
})
test('delete playlist of non existing  user',async ()=>{
    const deleted = await mockUser.deletePlaylist(ObjectId(),playlists[0]._id);
    expect(deleted).toBeFalsy();
})
test('delete non existing  playlist of user',async ()=>{
    const deleted = await mockUser.deletePlaylist(usersInDB[0]._id,playlists[0]._id);
    expect(deleted).toBeFalsy();
})

test('restore playlist',async ()=>{
    const restore = await mockUser.restorePlaylists(usersInDB[0]._id,[playlists[0]._id]);
    expect(restore).toBeFalsy();
})
test('restore non mongoose playlist',async ()=>{
    const restore = await mockUser.restorePlaylists(usersInDB[0]._id,['!']);
    expect(restore).toBeFalsy();
})
test('restore non  user playlist',async ()=>{
    const restore = await mockUser.restorePlaylists('0',[playlists[0]._id]);
    expect(restore).toBeFalsy();
})
test('restore non existing user playlist',async ()=>{
    const restore = await mockUser.restorePlaylists(ObjectId(),[playlists[0]._id]);
    expect(restore).toBeFalsy();
})
test('check aauth playlist non mongoose user',async ()=>{
    expect(await mockUser.checkAuthorizedPlaylist(ObjectId(),ObjectId())).toBeFalsy();
})





test('promote to artist non existing user',async ()=>{
    expect(await mockUser.promoteToArtist(ObjectId())).toBeFalsy()
})

test('promote to artist already artist',async ()=>{
    expect(await mockUser.promoteToArtist(usersInDB[0]._id,'i','i',['i'])).toBeFalsy();
})

test('promote to premium',async ()=>{
   // console.log(usersInDB[1]);
    const p = await mockUser.promoteToPremium(usersInDB[2]._id);
    expect(p).toBeTruthy();
})
test('confirm premium of user',async ()=>{
    let confirm = await mockUser.confirmPremium(usersInDB[2]);
    expect(confirm).toBeTruthy();
})
test('promote to premium non mongoose',async ()=>{
    const p = await mockUser.promoteToPremium('1');
    expect(p).toBeFalsy();
})
test('promote to premium non user',async ()=>{
    const p = await mockUser.promoteToPremium(ObjectId());
    expect(p).toBeFalsy();
})
test('promote to premium already premium',async ()=>{
    const p = await mockUser.promoteToPremium(usersInDB[2]._id);
    expect(p).toBeFalsy();
})

test('promote to free',async ()=>{
    const p = await mockUser.promoteToFree(usersInDB[2]._id);
    expect(p).toBeTruthy();
})
test('promote to free non mongoose',async ()=>{
    const p = await mockUser.promoteToFree('1');
    expect(p).toBeFalsy();
})
test('promote to free non user',async ()=>{
    const p = await mockUser.promoteToFree(ObjectId());
    expect(p).toBeFalsy();
})
test('promote to free already free',async ()=>{
    const p = await mockUser.promoteToFree(usersInDB[2]._id);
    expect(p).toBeFalsy();
})

test('check authorized track for user',async ()=>{
    const t = await mockUser.checkAuthorizedTrack(usersInDB[0]._id,tracks[0]._id);
    expect(t).toBeTruthy();
})
test('check authorized track for non mongoose user',async ()=>{
    const t = await mockUser.checkAuthorizedTrack('1',tracks[0]._id);
    expect(t).toBeFalsy();
})
test('check authorized track for non user',async ()=>{
    const t = await mockUser.checkAuthorizedTrack(ObjectId(),tracks[0]._id);
    expect(t).toBeFalsy();
})
test('check authorized track for non artist user',async ()=>{
    const t = await mockUser.checkAuthorizedTrack(usersInDB[2]._id,tracks[0]._id);
    expect(t).toBeFalsy();
})



test('check authorized album for user',async ()=>{
    const t = await mockUser.checkAuthorizedAlbum(usersInDB[0]._id,albums[0]._id);
    expect(t).toBeTruthy();
})
test('check authorized album for non mongoose user',async ()=>{
    console.log(albums[0]);
    const t = await mockUser.checkAuthorizedAlbum('1',albums[0]._id);
    expect(t).toBeFalsy();
})
test('check authorized album for non user',async ()=>{
    const t = await mockUser.checkAuthorizedAlbum(ObjectId(),albums[0]._id);
    expect(t).toBeFalsy();
})
test('check authorized album for non artist user',async ()=>{
    const t = await mockUser.checkAuthorizedAlbum(usersInDB[2]._id,albums[0]._id);
    expect(t).toBeFalsy();
})
























test(('promote user to artist'), async () => {
    //console.log(usersInDB[1])
    expect( await mockUser.promoteToArtist(usersInDB[1]._id,'artist2 info','artist2',['pop'])).toBeTruthy()
})

test(('promote user to artist'), async () => {;
        expect(await mockUser.promoteToArtist(usersInDB[1]._id)).toBeFalsy()
})


test('updaet facebook user with country',async ()=>{
    expect(await mockUser.update(undefined,usersInDB[1]._id, undefined, undefined, 'dai alaa', '123',undefined, 'eg',undefined, undefined, undefined, undefined)).toBeTruthy();
})


test('update facebook user without country',async ()=>{
    expect(await mockUser.update(undefined,usersInDB[1]._id, undefined, undefined, undefined, '123',undefined, undefined,undefined, undefined, undefined, undefined)).toBeTruthy();
})

test('update non existing user',async ()=>{
    expect(await mockUser.update(undefined,ObjectId(), undefined, undefined, 'dai alaa', '123',undefined, undefined,undefined, undefined, undefined, undefined)).toBeFalsy();
})










test('updaet facebook user with country',async ()=>{
    expect(await mockUser.update(undefined,usersInDB[1]._id, undefined, undefined, 'dai alaa', '123','b@b', 'eg',undefined, undefined, undefined, undefined)).toBeTruthy();
})

test('updaet facebook user with country',async ()=>{
    expect(await mockUser.update(undefined,usersInDB[1]._id, undefined, undefined, 'dai alaa', '123','b@b', 'eg',undefined, undefined, undefined, undefined)).toBeTruthy();
})

test('update user country',async ()=>{
    expect(await mockUser.update(undefined,usersInDB[0]._id, undefined, undefined, undefined, '1223345677',undefined, 'eg',undefined, undefined, undefined, undefined)).toBeTruthy();
})

test('get followers of user with no follow',async ()=>{
    expect(await mockUser.getUserFollowingArtist(usersInDB[1]._id)).toEqual([]);
})



test('check email of not exisiting user',async ()=>{
    expect(await mockUser.checkmail('84')).toBeFalsy();
})






test('user doesnt own playlist check for auth',async ()=>{
    expect(await mockUser.checkAuthorizedPlaylist(usersInDB[1]._id,playlists[0]._id)).toBeFalsy();
})


test('promote non user to artist',async ()=>{
    expect(await mockUser.promoteToArtist('84')).toBeFalsy();
})



// delete account at end 
test('delete account ', async () => {
    let id = usersInDB[2]._id
    await mockUser.deleteAccount(id);
    expect(await mockUser.getUserById(id)).toBeFalsy();
})
test('delete artist account ', async () => {
    let id = usersInDB[1]._id
    await mockUser.deleteAccount(id);
    expect(await mockUser.getUserById(id)).toBeTruthy();
})

test('delete non mongoose id account ', async () => {
    
    expect(await mockUser.deleteAccount('1')).toBeFalsy();
})

test('delete non existing account ', async () => {
    
    expect(await mockUser.deleteAccount(ObjectId())).toBeFalsy();
})





// update player errors in param 
test('update user player with error to create queue', async() => {
    expect(await mockUser.updateUserPlayer(usersInDB[0]._id, true, undefined, tracks[0]._id, ['duufuhfh'])).toEqual(0);
})
test('update user player with error to create queue', async() => {
    expect(await mockUser.updateUserPlayer(usersInDB[0]._id, true, tracks[0]._id, tracks[0]._id)).toEqual(0);
})

test('update user player with error to create queue', async() => {
    expect(await mockUser.updateUserPlayer(usersInDB[0]._id, true, 'fsfsdfdsf', tracks[0]._id)).toEqual(0);
})