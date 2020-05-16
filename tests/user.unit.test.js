const mockTrack = require('../source/track-api');
const mockUser = require('../source/user-api');
const mockArtist = require('../source/artist-api');
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
        "product":"premium",
        "premium":{}
        
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
    'name':"ay haga1"

},
{
'_id':'4',
'artistId':'20',
'hasTracks':[],
'name':"ay haga"


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
        u.product = "premium"
        u.isFacebook = true;
        await u.save()
    }
    usersInDB.push(u);
    i++;
    }
     i=0;
    for(let user of usersInDB){
        if(i==1)break;
        await mockUser.promoteToArtist(user._id,"artist info","artist"+i,["pop"]);
        let artist =  await mockArtist.findMeAsArtist(user._id);
        artists.push(artist);
        i++;
        if(i==1){
            let j=0;
            for(let album of albumsObjs){
                let album1 = await mockArtist.addAlbum(artist._id,album.name,"label1",["eg"],"Single","1/1/2020","pop");
                albums.push(album1);
                if(j==0){
                    let track =   await mockTrack.createTrack("","track1",12,["eg"],artist._id,album1._id,100,"12","13",["pop"]);
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
    ;
    await userDocument.find({},(err,files)=>{
        usersInDB = [];
        for(let user of files) usersInDB.push(user);
    })
    tracks = [];
    albums = [];
    artists = [];
    await artistDocument.find({},(err,files)=>{
        for(let file of files) artists.push(file)
    })
    await trackDocument.find({},(err,files)=>{
        for(let file of files) tracks.push(file)
    })
    await albumDocument.find({},(err,files)=>{
        for(let file of files) albums.push(file)
    })
 });
afterAll(async () => {
    await dbHandler.clearDatabase();
     await dbHandler.closeDatabase();
 });
 

test(' update user', async () => {
    expect(await mockUser.update(usersInDB[0]._id, undefined, undefined, "dai alaa", "1223345677",undefined, undefined,undefined, undefined, undefined, undefined)).toBeTruthy()
})
test('update user with incorrect password', async () => {
    expect(await mockUser.update(usersInDB[0]._id, undefined, undefined, "dai alaa", "2",undefined, undefined,undefined, undefined, undefined, undefined)).toBeFalsy()
})

test('update facebook user with country', async () => {
    expect(await mockUser.update(usersInDB[1]._id, undefined, undefined, "dai alaa", "1223345678",undefined, "eg",undefined, undefined, undefined, undefined)).toBeTruthy()
})
test('update  user with gender', async () => {
    expect(await mockUser.update(usersInDB[0]._id, "female", undefined, "dai alaa", "1223345677",undefined, "eg",undefined, undefined, undefined, undefined)).toBeTruthy()
})
test('update  user with birthdate', async () => {
    expect(await mockUser.update(usersInDB[0]._id, "female", "1/1/2010", "dai alaa", "1223345677",undefined, "eg",undefined, undefined, undefined, undefined)).toBeTruthy()
})
test('update facebook premium user data', async () => {
    expect(await mockUser.update(usersInDB[1]._id, "female", "1/1/2010", "dai alaa", "1223345678",undefined, "eg","1/1/2020","123", true, "123")).toBeTruthy()
})
test('update  user email', async () => {
    expect(await mockUser.update(usersInDB[2]._id, "female", "1/1/2010", "dai alaa", "12345678","n@n.com", "eg","1/1/2020","123", true, "123")).toBeTruthy()
})
test('update  user same email', async () => {
    expect(await mockUser.update(usersInDB[2]._id, "female", "1/1/2010", "dai alaa", "12345678","n@n.com", "eg","1/1/2020","123", true, "123")).toBeTruthy()
})
test('update non mongoose user', async () => {
    expect(await mockUser.update("1", "female", "1/1/2010", "dai alaa", "1223345678",undefined, "eg","1/1/2020","123", true, "123")).toBeFalsy()
})






test('get user', async () => {
    let user = await mockUser.getUserById(usersInDB[0]._id);
    expect(user.displayName).toEqual( 'dai alaa');
})

test('get user not fount', async () => {
    expect(await mockUser.getUserById('10')).toBeFalsy();
})
test('test me ', async () => {

    expect((await mockUser.me(usersInDB[0]._id)).displayName).toEqual( 'dai alaa');
})
test('bad test me ', async () => {

    expect(await mockUser.me('7')).toBeFalsy();
})
test(' test me non exist', async () => {

    expect(await mockUser.me(ObjectId())).toBeFalsy();
})


test("update player for user without player",async ()=>{
    expect(await mockUser.updatePlayerInfoLogOut(usersInDB[1],1,true,5)).toEqual(undefined);
})

test("update player for user without player",async ()=>{
    expect(await mockUser.updatePlayerInfoLogOut(usersInDB[1],undefined,undefined,undefined)).toEqual(undefined);
})













test('test GET user followed artist ', async () => {
    expect(await mockUser.getUserFollowingArtist(usersInDB[0]._id)).toEqual([]);
})

test('test check email', async () => {
    expect((await mockUser.checkmail('dinaalaaahmed@gmail.com')).displayName).toEqual( "dai alaa");
})
test('update password by forget password', async () => {
    expect(await mockUser.updateforgottenpassword(usersInDB[1],"123")).toEqual('123')
})









test('create playlist', async () => {
    let p = await mockUser.createdPlaylist(usersInDB[0]._id, 'playlist1', 'this is my playlist');
    playlists.push(p);
    expect((p).Description).toEqual('this is my playlist')
})
test('create playlist with wrong mongoose id', async () => {
    let p = await mockUser.createdPlaylist("1", 'playlist1', 'this is my playlist');
    expect((p)).toBeFalsy()
})
test('create playlist with non existing user', async () => {
    let p = await mockUser.createdPlaylist(ObjectId(), 'playlist1', 'this is my playlist');
    expect((p)).toBeFalsy()
})
test('get non mongoose id playlist', async () => {
    let p = await mockUser.getPlaylist("1", undefined, "1");
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

test("add track to  other user playlist",async ()=>{
    const addTrack = await mockUser.addTrack(usersInDB[0]._id,tracks[0]._id,playlists[0]._id);
    expect(addTrack).toBeTruthy()
})
test("add second track to other user playlist",async ()=>{
    const addTrack = await mockUser.addTrack(usersInDB[0]._id,tracks[0]._id,playlists[0]._id);
    expect(addTrack).toBeTruthy()
})
test("add track to  other user playlist with non mongoose id",async ()=>{
    const addTrack = await mockUser.addTrack("1","1",playlists[0]._id);
    expect(addTrack).toBeFalsy()
})

test("add track to  other user playlist with non existing user",async ()=>{
    const addTrack = await mockUser.addTrack(ObjectId(),tracks[0]._id,playlists[0]._id);
    expect(addTrack).toBeTruthy()
})
test("add track to  other user playlist non existing playlist",async ()=>{
    const addTrack = await mockUser.addTrack(usersInDB[0]._id,tracks[0]._id,ObjectId());
    expect(addTrack).toBeFalsy()
})
test("add track to  other user playlist non existing track",async ()=>{
    const addTrack = await mockUser.addTrack(usersInDB[0]._id,ObjectId(),playlists[0]._id);
    expect(addTrack).toBeFalsy()
})

test("add track to   playlist",async ()=>{
   // console.log(usersInDB[0])
    const addTrack = await mockUser.AddTrackToPlaylist(usersInDB[0]._id,tracks[0]._id,playlists[0]._id);
    expect(addTrack).toBeTruthy()
})
test("add second track to other user playlist",async ()=>{
    const addTrack = await mockUser.AddTrackToPlaylist(usersInDB[0]._id,tracks[0]._id,playlists[0]._id);
    expect(addTrack).toBeTruthy()
})
test("add track to  other user playlist with non mongoose id",async ()=>{
    const addTrack = await mockUser.AddTrackToPlaylist("1","1",playlists[0]._id);
    expect(addTrack).toBeFalsy()
})

test("add track to  other user playlist with non existing user",async ()=>{
    const addTrack = await mockUser.AddTrackToPlaylist(ObjectId(),tracks[0]._id,playlists[0]._id);
    expect(addTrack).toBeFalsy()
})
test("add track to  other user playlist non existing playlist",async ()=>{
    const addTrack = await mockUser.AddTrackToPlaylist(usersInDB[0]._id,tracks[0]._id,ObjectId());
    expect(addTrack).toBeFalsy()
})
test("add track to  other user playlist non existing track",async ()=>{
    const addTrack = await mockUser.AddTrackToPlaylist(usersInDB[0]._id,ObjectId(),playlists[0]._id);
    expect(addTrack).toBeFalsy()
})




test("check if user follow artist when he doesnt ",async ()=>{
    const following = await mockUser.checkIfUserFollowArtist(usersInDB[1]._id,artists[0]._id);
    expect(following).toBeFalsy();
})
test("check if non existing user follow artist when he doesnt ",async ()=>{
    const following = await mockUser.checkIfUserFollowArtist(ObjectId(),artists[0]._id);
    expect(following).toBeFalsy();
})
test("check if user follow non existing artist when he doesnt ",async ()=>{
    const following = await mockUser.checkIfUserFollowArtist(usersInDB[1]._id,ObjectId());
    expect(following).toBeFalsy();
})
test("check if non mongoose  user follow artist when he doesnt ",async ()=>{
    const following = await mockUser.checkIfUserFollowArtist("1",artists[0]._id);
    expect(following).toBeFalsy();
})
test("user unfollow artist that he didnt follow before",async ()=>{
    const unfollow = await mockUser.userUnfollowArtist(usersInDB[1]._id,artists[0]._id);
    expect(unfollow).toBeFalsy();
})
test("user follow artist",async ()=>{
    const follow = await mockUser.userFollowArtist(usersInDB[1]._id,artists[0]._id);
    expect(follow).toBeTruthy();
})
test("check if user follow artist when he does ",async ()=>{
    const following = await mockUser.checkIfUserFollowArtist(usersInDB[1]._id,artists[0]._id);
    expect(following).toBeTruthy();
})
test("non existing user follow artist",async ()=>{
    const follow = await mockUser.userFollowArtist(ObjectId(),artists[0]._id);
    expect(follow).toBeFalsy();
})
test("non mongoose user follow artist",async ()=>{
    const follow = await mockUser.userFollowArtist("1",artists[0]._id);
    expect(follow).toBeFalsy();
})
test("get user following artist", async ()=>{
    const following = await mockUser.getUserFollowingArtist(usersInDB[1]._id);
    expect(following).toBeTruthy();
})

test("get non existing user following artist", async ()=>{
    const following = await mockUser.getUserFollowingArtist(ObjectId());
    expect(following).toBeFalsy();
})
test("get non mongoose user following artist", async ()=>{
    const following = await mockUser.getUserFollowingArtist("1");
    expect(following).toBeFalsy();
})
test("non existing user unfollow artist",async ()=>{
    const unfollow = await mockUser.userUnfollowArtist(ObjectId(),artists[0]._id);
    expect(unfollow).toBeFalsy();
})
test("non existing user unfollow non existing artist",async ()=>{
    const unfollow = await mockUser.userUnfollowArtist(ObjectId(),ObjectId());
    expect(unfollow).toBeFalsy();
})
test("non mongoose user unfollow artist",async ()=>{
    const unfollow = await mockUser.userUnfollowArtist("1",artists[0]._id);
    expect(unfollow).toBeFalsy();
})
test("user unfollow artist",async ()=>{
    const unfollow = await mockUser.userUnfollowArtist(usersInDB[1]._id,artists[0]._id);
    expect(unfollow).toBeTruthy();
})
test("get user following user", async ()=>{
    const following = await mockUser.getUserFollowingUser(usersInDB[1]._id);
    expect(following).toBeFalsy();
})

test("get non existing user following user", async ()=>{
    const following = await mockUser.getUserFollowingUser(ObjectId());
    expect(following).toBeFalsy();
})
test("get non mongoose user following user", async ()=>{
    const following = await mockUser.getUserFollowingUser("1");
    expect(following).toBeFalsy();
})

test("update artist date",async ()=>{
    expect(await mockUser.updateDate(artists[0])).toEqual(undefined);
})























test(('promote user to artist'), async () => {
    //console.log(usersInDB[1])
    expect( await mockUser.promoteToArtist(usersInDB[1]._id,"artist2 info","artist2",["pop"])).toBeTruthy()
})

test(('promote user to artist'), async () => {;
        expect(await mockUser.promoteToArtist(usersInDB[1]._id)).toBeFalsy()
})


test('updaet facebook user with country',async ()=>{
    expect(await mockUser.update(usersInDB[1]._id, undefined, undefined, "dai alaa", "123",undefined, "eg",undefined, undefined, undefined, undefined)).toBeTruthy();
})


test('update facebook user without country',async ()=>{
    expect(await mockUser.update(usersInDB[1]._id, undefined, undefined, undefined, "123",undefined, undefined,undefined, undefined, undefined, undefined)).toBeTruthy();
})

test('update non existing user',async ()=>{
    expect(await mockUser.update(ObjectId(), undefined, undefined, "dai alaa", "123",undefined, undefined,undefined, undefined, undefined, undefined)).toBeFalsy();
})










test('updaet facebook user with country',async ()=>{
    expect(await mockUser.update(usersInDB[1]._id, undefined, undefined, "dai alaa", "123","b@b", "eg",undefined, undefined, undefined, undefined)).toBeTruthy();
})

test('updaet facebook user with country',async ()=>{
    expect(await mockUser.update(usersInDB[1]._id, undefined, undefined, "dai alaa", "123","b@b", "eg",undefined, undefined, undefined, undefined)).toBeTruthy();
})

test('update user country',async ()=>{
    expect(await mockUser.update(usersInDB[0]._id, undefined, undefined, undefined, "1223345677",undefined, "eg",undefined, undefined, undefined, undefined)).toBeTruthy();
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
    
    expect(await mockUser.deleteAccount("1")).toBeFalsy();
})

test('delete non existing account ', async () => {
    
    expect(await mockUser.deleteAccount(ObjectId())).toBeFalsy();
})