const mockTrack = require('../source/track-api');
const mockUser = require('../source/user-api');
const mockArtist = require('../source/artist-api');
const mockAlbum = require('../source/album-api');
const mockImage = require('../source/image-api');
const mockPlaylist = require('../source/playlist-api')
const mongoose = require('mongoose');
const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const dbHandler = require('./db-handler');
const ObjectId = mongoose.Types.ObjectId;
const fs = require('fs')



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

let playlist;
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
        playlist=await mockUser.createdPlaylist(user._id,'lili','hello kids');
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
    playlist = await playlistDocument.findById(playlist._id)
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

let image = {
    height:100,
    width:100,

}

 test('upload image for user',async ()=>{
     const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,usersInDB[0]._id,'user',image) 
    // console.log(usersInDB[0].images)
    let writestream = gfsImages.createWriteStream({
        filename: 'not_found',
        metadata: {userId: usersInDB[0]._id, belongsTo: 'user', imageId: uploadedImageId },
        content_type: 'image/jpeg',
        bucketName: 'images',
        root: 'images',
    });
    fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 
    
    //await new Promise(fulfill => writestream.on('close', fulfill));
   
    let h = 0;
    // while(!h){
         writestream.on('close',async (file)=>{
             console.log(file)
             console.log(uploadedImageId)
          await gfsImages.files.find({},(err,file)=>{
              console.log(err,file)
          })
            expect(uploadedImageId).toBeTruthy();
         })
    // }
   // writestream.on('pipe',(file)=>{console.log("sime");h=1;})
    //console.log(await gfsImages.files.findOne({"metadata.imageId":uploadedImageId}))
     
 })
 
 test('upload image for artist',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,artists[0]._id,'artist',image) 
    let writestream = gfsImages.createWriteStream({
        filename: 'not_found',
        metadata: {userId: usersInDB[0]._id, belongsTo: 'artist', imageId: uploadedImageId },
        content_type: 'image/jpeg',
        bucketName: 'images',
        root: 'images',
    });
    fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 
    
    await new Promise(fulfill => writestream.on('close', fulfill));
    expect(uploadedImageId).toBeTruthy();
})
test('upload image for playlist',async ()=>{
   // console.log(usersInDB[0],playlist)
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,playlist._id,'playlist',image)
    let writestream = gfsImages.createWriteStream({
        filename: 'not_found',
        metadata: {userId: usersInDB[0]._id, belongsTo: 'playlist', imageId: uploadedImageId },
        content_type: 'image/jpeg',
        bucketName: 'images',
        root: 'images',
    });
    fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 
    
    await new Promise(fulfill => writestream.on('close', fulfill)); 
    expect(uploadedImageId).toBeTruthy();
})

test('upload image for track',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,tracks[0]._id,'track',image) 
    let writestream = gfsImages.createWriteStream({
        filename: 'not_found',
        metadata: {userId: usersInDB[0]._id, belongsTo: 'track', imageId: uploadedImageId },
        content_type: 'image/jpeg',
        bucketName: 'images',
        root: 'images',
    });
    fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 
    
    await new Promise(fulfill => writestream.on('close', fulfill));
    expect(uploadedImageId).toBeTruthy();
})

test('upload image for album',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,albums[0]._id,'album',image) 
    let writestream = gfsImages.createWriteStream({
        filename: 'not_found',
        metadata: {userId: usersInDB[0]._id, belongsTo: 'album', imageId: uploadedImageId },
        content_type: 'image/jpeg',
        bucketName: 'images',
        root: 'images',
    });
    fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 
    
    await new Promise(fulfill => writestream.on('close', fulfill));
    expect(uploadedImageId).toBeTruthy();
})

test('upload image for category',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,usersInDB[0]._id,'category',image) 
    expect(uploadedImageId).toBeFalsy();
})

test('upload image for non mongoose user',async ()=>{
    const uploadedImageId = await mockImage.uploadImage('1',usersInDB[0]._id,'user',image) 
    expect(uploadedImageId).toBeFalsy();
})
test('upload image for non existing user',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(ObjectId(),usersInDB[0]._id,'user',image) 
    expect(uploadedImageId).toBeFalsy();
})
test('upload image for user with no belongs to and no imaghe',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,usersInDB[0]._id) 
    expect(uploadedImageId).toBeFalsy();
})
test('upload image for user with not same source id',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,ObjectId(),'user',image) 
    expect(uploadedImageId).toBeFalsy();
})
test('upload image for playlist that is not authoeized for user',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[1]._id,playlist._id,'playlist',image) 
    expect(uploadedImageId).toBeFalsy();
})
test('upload image for playlist not existing',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,ObjectId(),'playlist',image) 
    expect(uploadedImageId).toBeFalsy();
})
test('upload image for track thats is unauthorized',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[1]._id,tracks[0]._id,'track',image) 
    expect(uploadedImageId).toBeFalsy();
})
test('upload image for track that doesnt exist',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,ObjectId(),'track',image) 
    expect(uploadedImageId).toBeFalsy();
})

test('upload image for album thats is unauthorized',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[1]._id,albums[0]._id,'album',image) 
    expect(uploadedImageId).toBeFalsy();
})
test('upload image for album that doesnt exist',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,ObjectId(),'album',image) 
    expect(uploadedImageId).toBeFalsy();
})
test('upload image for artist thats is unauthorized',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[1]._id,artists[0]._id,'artist',image) 
    expect(uploadedImageId).toBeFalsy();
})
test('upload image for album that doesnt exist',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,ObjectId(),'artist',image) 
    expect(uploadedImageId).toBeFalsy();
})
test('upload image for not entity',async ()=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,ObjectId(),'none',image) 
    expect(uploadedImageId).toBeFalsy();
})










test('update image for user',async ()=>{
   // console.log(usersInDB[0])
    const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,usersInDB[0]._id,'user',image);
    let writestream = gfsImages.createWriteStream({
        filename: 'not_found',
        metadata: {userId: usersInDB[0]._id, belongsTo: 'user', imageId: uploadedImageId },
        content_type: 'image/jpeg',
        bucketName: 'images',
        root: 'images',
    });
    fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 
    
    await new Promise(fulfill => writestream.on('close', fulfill));
    //await delay(5000)
   // console.log(await userDocument.findById(usersInDB[0]._id))
    expect(uploadedImageId).toBeTruthy();
})
test('update image for artist',async ()=>{
    
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,artists[0]._id,'artist',image) 
   let writestream = gfsImages.createWriteStream({
    filename: 'not_found',
    metadata: {userId: usersInDB[0]._id, belongsTo: 'artist', imageId: uploadedImageId },
    content_type: 'image/jpeg',
    bucketName: 'images',
    root: 'images',
});
fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 

//await delay(5000)
   expect(uploadedImageId).toBeTruthy();
})
test('update image for playlist',async ()=>{
  // console.log(usersInDB[0],playlist)
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,playlist._id,'playlist',image) 
   let writestream = gfsImages.createWriteStream({
    filename: 'not_found',
    metadata: {userId: usersInDB[0]._id, belongsTo: 'playlist', imageId: uploadedImageId },
    content_type: 'image/jpeg',
    bucketName: 'images',
    root: 'images',
});
fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 

await new Promise(fulfill => writestream.on('close', fulfill));
//await delay(5000)
   expect(uploadedImageId).toBeTruthy();
})

test('update image for track',async ()=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,tracks[0]._id,'track',image) 
   let writestream = gfsImages.createWriteStream({
    filename: 'not_found',
    metadata: {userId: usersInDB[0]._id, belongsTo: 'track', imageId: uploadedImageId },
    content_type: 'image/jpeg',
    bucketName: 'images',
    root: 'images',
});
fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 

await new Promise(fulfill => writestream.on('close', fulfill));
//await delay(5000)
   expect(uploadedImageId).toBeTruthy();
})

test('update image for album',async ()=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,albums[0]._id,'album',image) 
   let writestream = gfsImages.createWriteStream({
    filename: 'not_found',
    metadata: {userId: usersInDB[0]._id, belongsTo: 'album', imageId: uploadedImageId },
    content_type: 'image/jpeg',
    bucketName: 'images',
    root: 'images',
});
fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 
//await delay(5000)
await new Promise(fulfill => writestream.on('close', fulfill));
   expect(uploadedImageId).toBeTruthy();
})



test('update image for category',async ()=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,usersInDB[0]._id,'category',image) 
   expect(uploadedImageId).toBeFalsy();
})

test('update image for non mongoose user',async ()=>{
   const uploadedImageId = await mockImage.updateImage('1',usersInDB[0]._id,'user',image) 
   expect(uploadedImageId).toBeFalsy();
})
test('update image for non existing user',async ()=>{
   const uploadedImageId = await mockImage.updateImage(ObjectId(),usersInDB[0]._id,'user',image) 
   expect(uploadedImageId).toBeFalsy();
})
test('update image for user with no belongs to and no imaghe',async ()=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,usersInDB[0]._id) 
   expect(uploadedImageId).toBeFalsy();
})
test('update image for user with not same source id',async ()=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,ObjectId(),'user',image) 
   expect(uploadedImageId).toBeFalsy();
})
test('update image for playlist that is not authoeized for user',async ()=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[1]._id,playlist._id,'playlist',image) 
   expect(uploadedImageId).toBeFalsy();
})
test('update image for playlist not existing',async ()=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,ObjectId(),'playlist',image) 
   expect(uploadedImageId).toBeFalsy();
})
test('update image for track thats is unauthorized',async ()=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[1]._id,tracks[0]._id,'track',image) 
   expect(uploadedImageId).toBeFalsy();
})
test('update image for track that doesnt exist',async ()=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,ObjectId(),'track',image) 
   expect(uploadedImageId).toBeFalsy();
})

test('update image for album thats is unauthorized',async ()=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[1]._id,albums[0]._id,'album',image) 
   expect(uploadedImageId).toBeFalsy();
})
test('update image for album that doesnt exist',async ()=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,ObjectId(),'album',image) 
   expect(uploadedImageId).toBeFalsy();
})
test('update image for artist thats is unauthorized',async ()=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[1]._id,artists[0]._id,'artist',image) 
   expect(uploadedImageId).toBeFalsy();
})
test('update image for album that doesnt exist',async ()=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,ObjectId(),'artist',image) 
   expect(uploadedImageId).toBeFalsy();
})
test('update image for not entity',async ()=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,ObjectId(),'none',image) 
   expect(uploadedImageId).toBeFalsy();
})





test('get image for user',async ()=>{
    
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    expect(imageId).toBeTruthy();
})
test('get image for album',async ()=>{
    const imageId = await mockImage.getImage(albums[0]._id,'album');
    expect(imageId).toBeTruthy();
})
test('get image for track',async ()=>{
    const imageId = await mockImage.getImage(tracks[0]._id,'track');
    expect(imageId).toBeTruthy();
})
test('get image for artist',async ()=>{
    const imageId = await mockImage.getImage(artists[0]._id,'artist');
    expect(imageId).toBeTruthy();
})
test('get image for album',async ()=>{
    const imageId = await mockImage.getImage(playlist._id,'playlist');
    expect(imageId).toBeTruthy();
})

test('get image for non mongoose user',async ()=>{
    const imageId = await mockImage.getImage('1','user');
    expect(imageId).toBeFalsy();
})
test('get image without belongs to',async ()=>{
    const imageId = await mockImage.getImage(ObjectId());
    expect(imageId).toBeFalsy();
})
test('get image for non existing user',async ()=>{
    const imageId = await mockImage.getImage(ObjectId(),'user');
    expect(imageId).toBeFalsy();
})
test('get image for non existing playlist',async ()=>{
    const imageId = await mockImage.getImage(ObjectId(),'playlist');
    expect(imageId).toBeFalsy();
})
test('get image for non existing album',async ()=>{
    const imageId = await mockImage.getImage(ObjectId(),'album');
    expect(imageId).toBeFalsy();
})
test('get image for non existing artist',async ()=>{
    const imageId = await mockImage.getImage(ObjectId(),'artist');
    expect(imageId).toBeFalsy();
})
test('get image for non existing track',async ()=>{
    const imageId = await mockImage.getImage(ObjectId(),'track');
    expect(imageId).toBeFalsy();
})
test('get image for non existing category',async ()=>{
    const imageId = await mockImage.getImage(ObjectId(),'category');
    expect(imageId).toBeFalsy();
})
test('get image for non existing entity',async ()=>{
    const imageId = await mockImage.getImage(ObjectId(),'none');
    expect(imageId).toBeFalsy();
})











// the image is deleted but returned 0 as it is not in grid fs but it does cover the seleted branch that's how i know it was deleted successfully
test('delete image for user',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    console.log(imageId)
    const isDeleted = await mockImage.deleteImage(imageId,usersInDB[0]._id,usersInDB[0]._id,'user');
    expect(isDeleted).toBeTruthy();
})
/*
test('delete image for album',async ()=>{
    const imageId = await mockImage.getImage(albums[0]._id,'album');
    const isDeleted = await mockImage.deleteImage(imageId,usersInDB[0]._id,albums[0]._id,'album');
    expect(isDeleted).toBeTruthy();
})
test('delete image for playlist',async ()=>{
    const imageId = await mockImage.getImage(playlist._id,'playlist');
    const isDeleted = await mockImage.deleteImage(imageId,usersInDB[0]._id,playlist._id,'playlist');
    expect(isDeleted).toBeTruthy();
})
test('delete image for track',async ()=>{
    const imageId = await mockImage.getImage(tracks[0]._id,'track');
    const isDeleted = await mockImage.deleteImage(imageId,usersInDB[0]._id,tracks[0]._id,'track');
    expect(isDeleted).toBeTruthy();
})
test('delete non existing image for artist',async ()=>{
    const imageId = await mockImage.getImage(artists[0]._id,'artist');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeFalsy();
})
test('delete image for artist',async ()=>{
    const imageId = await mockImage.getImage(artists[0]._id,'artist');
    const isDeleted = await mockImage.deleteImage(imageId,usersInDB[0]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeTruthy();
})

test('delete image for non mongoose id',async ()=>{
    const imageId = await mockImage.getImage(artists[0]._id,'artist');
    const isDeleted = await mockImage.deleteImage(ObjectId(),'1',artists[0]._id,'artist');
    expect(isDeleted).toBeFalsy();
})
test('delete image for with no belons to or source id',async ()=>{
     const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
     const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id);
     expect(isDeleted).toBeFalsy();
 })
 test('delete image for non existing user',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),ObjectId(),usersInDB[0]._id,'user');
    expect(isDeleted).toBeFalsy();
})
test('delete image for user with no images',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,usersInDB[0]._id,'user');
    expect(isDeleted).toBeFalsy();
})
test('delete image for user unauthorized',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[1]._id,usersInDB[0]._id,'user');
    expect(isDeleted).toBeFalsy();
})
test('delete image for non existing playlist',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,ObjectId(),'playlist');
    expect(isDeleted).toBeFalsy();
})
test('delete image for non authorized playlist',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[1]._id,playlist._id,'playlist');
    expect(isDeleted).toBeFalsy();
})
test('delete image for playlist with no images',async ()=>{
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,playlist._id,'playlist');
    expect(isDeleted).toBeFalsy();
})
test('delete image for non existing track',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,ObjectId(),'track');
    expect(isDeleted).toBeFalsy();
})
test('delete image for non authorized track',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[1]._id,tracks[0]._id,'track');
    expect(isDeleted).toBeFalsy();
})
test('delete image for track with no images',async ()=>{
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,tracks[0]._id,'track');
    expect(isDeleted).toBeFalsy();
})
test('delete image for non existing albums',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,ObjectId(),'album');
    expect(isDeleted).toBeFalsy();
})
test('delete image for non authorized album',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[1]._id,albums[0]._id,'album');
    expect(isDeleted).toBeFalsy();
})
test('delete image for track with no images',async ()=>{
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,albums[0]._id,'album');
    expect(isDeleted).toBeFalsy();
})
test('delete image for non existing albums',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,ObjectId(),'artist');
    expect(isDeleted).toBeFalsy();
})
test('delete image for non authorized artist',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[1]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeFalsy();
})
test('delete image for artist with no images',async ()=>{
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeFalsy();
})
test('delete image for category',async ()=>{
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,artists[0]._id,'category');
    expect(isDeleted).toBeFalsy();
})
test('delete image for non entity',async ()=>{
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,artists[0]._id,'none');
    expect(isDeleted).toBeFalsy();
})

// add back images to database



test('update image for user 1',async ()=>{
    // console.log(usersInDB[0])
     const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,usersInDB[0]._id,'user',image);
     let writestream = gfsImages.createWriteStream({
         filename: 'not_found',
         metadata: {userId: usersInDB[0]._id, belongsTo: 'user', imageId: uploadedImageId },
         content_type: 'image/jpeg',
         bucketName: 'images',
         root: 'images',
     });
     fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 
     
     await new Promise(fulfill => writestream.on('close', fulfill));
     //await delay(5000)
    // console.log(await userDocument.findById(usersInDB[0]._id))
     expect(uploadedImageId).toBeTruthy();
 })
 test('update image for artist 1',async ()=>{
     
    const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,artists[0]._id,'artist',image) 
    let writestream = gfsImages.createWriteStream({
     filename: 'not_found',
     metadata: {userId: usersInDB[0]._id, belongsTo: 'artist', imageId: uploadedImageId },
     content_type: 'image/jpeg',
     bucketName: 'images',
     root: 'images',
 });
 fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 
 
 //await delay(5000)
    expect(uploadedImageId).toBeTruthy();
 })
 test('update image for playlist 1',async ()=>{
   // console.log(usersInDB[0],playlist)
    const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,playlist._id,'playlist',image) 
    let writestream = gfsImages.createWriteStream({
     filename: 'not_found',
     metadata: {userId: usersInDB[0]._id, belongsTo: 'playlist', imageId: uploadedImageId },
     content_type: 'image/jpeg',
     bucketName: 'images',
     root: 'images',
 });
 fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 
 
 await new Promise(fulfill => writestream.on('close', fulfill));
 //await delay(5000)
    expect(uploadedImageId).toBeTruthy();
 })
 
 test('update image for track 1',async ()=>{
    const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,tracks[0]._id,'track',image) 
    let writestream = gfsImages.createWriteStream({
     filename: 'not_found',
     metadata: {userId: usersInDB[0]._id, belongsTo: 'track', imageId: uploadedImageId },
     content_type: 'image/jpeg',
     bucketName: 'images',
     root: 'images',
 });
 fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 
 
 await new Promise(fulfill => writestream.on('close', fulfill));
 //await delay(5000)
    expect(uploadedImageId).toBeTruthy();
 })
 
 test('update image for album 1',async ()=>{
    const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,albums[0]._id,'album',image) 
    let writestream = gfsImages.createWriteStream({
     filename: 'not_found',
     metadata: {userId: usersInDB[0]._id, belongsTo: 'album', imageId: uploadedImageId },
     content_type: 'image/jpeg',
     bucketName: 'images',
     root: 'images',
 });
 fs.createReadStream('../static/not_found.jpeg').pipe(writestream); 
 //await delay(5000)
 await new Promise(fulfill => writestream.on('close', fulfill));
    expect(uploadedImageId).toBeTruthy();
 })
 










// the image is deleted but returned 0 as it is not in grid fs but it does cover the seleted branch that's how i know it was deleted successfully
test('delete images for user',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,usersInDB[0]._id,'user');
    expect(isDeleted).toBeTruthy();
})
test('delete images for album',async ()=>{
    const imageId = await mockImage.getImage(albums[0]._id,'album');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,albums[0]._id,'album');
    expect(isDeleted).toBeTruthy();
})
test('delete images for playlist',async ()=>{
    const imageId = await mockImage.getImage(playlist._id,'playlist');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,playlist._id,'playlist');
    expect(isDeleted).toBeTruthy();
})
test('delete images for track',async ()=>{
    const imageId = await mockImage.getImage(tracks[0]._id,'track');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,tracks[0]._id,'track');
    expect(isDeleted).toBeTruthy();
})
test('delete non existing images for artist',async ()=>{
    const imageId = await mockImage.getImage(artists[0]._id,'artist');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeFalsy();
})
test('delete images for artist',async ()=>{
    const imageId = await mockImage.getImage(artists[0]._id,'artist');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeTruthy();
})

test('delete images for non mongoose id',async ()=>{
    const imageId = await mockImage.getImage(artists[0]._id,'artist');
    const isDeleted = await mockImage.deleteImages('1',artists[0]._id,'artist');
    expect(isDeleted).toBeFalsy();
})
test('delete images for with no belons to or source id',async ()=>{
     const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
     const isDeleted = await mockImage.deleteImages(usersInDB[0]._id);
     expect(isDeleted).toBeFalsy();
 })
 test('delete images for non existing user',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(ObjectId(),usersInDB[0]._id,'user');
    expect(isDeleted).toBeFalsy();
})
test('delete images for user with no images',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,usersInDB[0]._id,'user');
    expect(isDeleted).toBeFalsy();
})
test('delete images for user unauthorized',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[1]._id,usersInDB[0]._id,'user');
    expect(isDeleted).toBeFalsy();
})
test('delete image for non existing playlist',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,ObjectId(),'playlist');
    expect(isDeleted).toBeFalsy();
})
test('delete images for non authorized playlist',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[1]._id,playlist._id,'playlist');
    expect(isDeleted).toBeFalsy();
})
test('delete images for playlist with no images',async ()=>{
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,playlist._id,'playlist');
    expect(isDeleted).toBeFalsy();
})
test('delete images for non existing track',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,ObjectId(),'track');
    expect(isDeleted).toBeFalsy();
})
test('delete images for non authorized track',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[1]._id,tracks[0]._id,'track');
    expect(isDeleted).toBeFalsy();
})
test('delete images for track with no images',async ()=>{
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,tracks[0]._id,'track');
    expect(isDeleted).toBeFalsy();
})
test('delete images for non existing albums',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,ObjectId(),'album');
    expect(isDeleted).toBeFalsy();
})
test('delete images for non authorized album',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[1]._id,albums[0]._id,'album');
    expect(isDeleted).toBeFalsy();
})
test('delete images for track with no images',async ()=>{
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,albums[0]._id,'album');
    expect(isDeleted).toBeFalsy();
})
test('delete images for non existing albums',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,ObjectId(),'artist');
    expect(isDeleted).toBeFalsy();
})
test('delete images for non authorized artist',async ()=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[1]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeFalsy();
})
test('delete images for artist with no images',async ()=>{
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeFalsy();
})
test('delete images for category',async ()=>{
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,artists[0]._id,'category');
    expect(isDeleted).toBeFalsy();
})
test('delete images for non entity',async ()=>{
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,artists[0]._id,'none');
    expect(isDeleted).toBeFalsy();
})
*/