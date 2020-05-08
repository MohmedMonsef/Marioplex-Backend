const request = require('request-promise');
const fs = require('fs');
const password = "12345678";
const imagegrils = ['dai.jpg', 'dina.jpg', 'nada1.jpg', 'nihal.jpg', 'hager.jpg', 'menna.jpg', 'nada1.jpg', 'nerdeen.jpg', 'asmaa.jpg', 'bassant.jpg']
const imagePlaylist = ['quran1.jpg', 'quran2.jpg', 'quran3.jpg', 'quran4.jpg', 'quran5.jpg']
const menImage = 'men.jpg';
const emails = [
    //  "dai.a.elrihany@gmail.com",
    // "dinaalaaahmed@gmail.com",
    //"nada5aled52@gmail.com",
    //"nihalmansour0599@gmail.com",
    ///"hager.aismail@gmail.com",
    //"menna123mahmoud@gmail.com",
    //"ayasabohadima@gmail.com",
    //'nerdeen.ahmad15@gmail.com',
    //'lenaa.sayed7@gmail.com',
    //'bassantmohamed945@yahoo.com',
    //"omar.abdelfatah.h@gmail.com",
    //"kareem.mohamed9711@gmail.com",
    //"mohmedmonsef70@gmail.com",
    //"tarek.saad99@eng-st.cu.edu.eg",
    //'abdofdl99@gmail.com',
    //'bahaaeldeen1999@gmail.com',
    //'belalelhossany12@gmail.com',
    'mohamedsherifwagdy@hotmail.com'

];
const playlists = [
    ['My Playlist', 'Quran'],
    //['It is mine'],
    //['my favorite', 'Ayat', 'Soura'],
    //['Playlist1', 'frist playlist'],
    //['the best', 'Which need'],
    //['Wonderful', 'for me'],
    ['The Spirit of Serenity', 'contentment'],
    // ['life'],
    ['My frist Playlist'],
    ['holy quran', 'WOW'],
    ['my favorite'],
    ['Ayat el quran', 'Soura'],
    ['Playlist4'],
    [' playlist5'],
    ['Which need'],
    ['the Wonderful']
    [' Spirit of Serenity'],
    ['the contentment', 'the life'],
]
const e = {

    "expiresDate": "2020-12-03",
    "cardNumber": "374245455400126",
    "isMonth": false
};
const tracks = [
    '5eb0a499ec0c444e9c489820',
    '5eb0a4dcec0c444e9c489825',
    '5eb0a51eec0c444e9c48982a',
    '5eb0a55eec0c444e9c48982f',
    '5eb0a5e3ec0c444e9c489839',
    '5eb0a626ec0c444e9c48983e',
    '5eb0a668ec0c444e9c489843',
    '5eb0a6ebec0c444e9c48984d',
    '5eb0a72dec0c444e9c489852',
    '5eb0a76fec0c444e9c489857',
    '5eb0a7f1ec0c444e9c489861',
    '5eb0a877ec0c444e9c48986b',
    '5eb0a8b7ec0c444e9c489870',
    '5eb1a3d8a5ebd959e08d5731',
    '5eb1a419a5ebd959e08d5734',
    '5eb1a459a5ebd959e08d5737',
    '5eb1ac71371bc537ec792bb8'
]

main();
async function main() {


    for (let i = 0; i < emails.length; i++) {
        let token = await login(emails[i], password);
        await delay(4000);
        // await addImageToPlaylist(token, 'user', tracks[i], i < 10 ? imagegrils[i] : menImage);
        await addImageToPlaylist(token, 'user', tracks[i], menImage);
        //await delay(4000);
        for (let j = 0; j < playlists[i].length; j++) {
            let playlistId = await addPlaylist(token, playlists[i][j]);
            console.log(playlistId);
            await delay(4000);
            await addImageToPlaylist(token, 'playlist', playlistId, imagePlaylist[await Math.floor(Math.random() * 5)]);
            await delay(4000);
            await addTrackToPlaylist(token, playlistId, tracks[Math.floor(Math.random() * (tracks.length - 1 - 0 + 1) + 0)] + ',' + tracks[Math.floor(Math.random() * (tracks.length - 1 - 0 + 1) + 0)] + ',' + tracks[Math.floor(Math.random() * (tracks.length - 1 - 0 + 1) + 0)] + ',' + tracks[Math.floor(Math.random() * (tracks.length - 1 - 0 + 1) + 0)] + ',' + tracks[Math.floor(Math.random() * (tracks.length - 1 - 0 + 1) + 0)])
            await delay(4000);
        }
    }

    await delay(1000);


}
async function addImageToPlaylist(token, belongsTo, sourceId, filename) {
    try {
        var options = {
            'method': 'POST',
            'url': 'http://localhost:3000/api/images/upload/' + sourceId + '?height=100&width=100&belongs_to=' + belongsTo,
            'headers': {
                'x-auth-token': token
            },
            formData: {
                'image': {
                    'value': fs.createReadStream('D:/aya/ayas2/9180351_AyaSamir_Task2 _V2/Marioplex-Backend/images/' + filename),
                    'options': {
                        'filename': 'filename',
                        'contentType': null
                    }
                }
            }
        };
        request(options, function(error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
        });
    } catch (ex) {
        return 0;
    }


}
async function addTrackToPlaylist(token, playlistId, tracksIds) {

    var options = {
        'method': 'POST',
        'url': 'http://localhost:3000/api/playlists/' + playlistId + '/tracks',
        'headers': {
            'x-auth-token': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "tracks": tracksIds })

    }
    try {
        let _id = await request(options, function(error, response) {
            if (error) return 0;

            // console.log(response.body.token);
            let body = JSON.parse(response.body)
            return body._id;
        });
        // console.log(token);
        return JSON.parse(_id)._id;
    } catch (ex) {
        return 0;
    }
}
async function addPlaylist(token, playlistName) {
    console.log(playlistName)
    console.log(token)
    var options = {
        'method': 'POST',
        'url': 'http://localhost:3000/api/users/playlists',
        'headers': {
            'x-auth-token': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "name": playlistName })

    };
    try {
        let _id = await request(options, function(error, response) {
            if (error) return 0;

            // console.log(response.body.token);
            let body = JSON.parse(response.body)
            return body._id;
        });
        // console.log(token);
        return JSON.parse(_id)._id;
    } catch (ex) {
        return 0;
    }


}
async function login(email, password) {

    var options = {
        'method': 'POST',
        'url': 'http://localhost:3000/api/login',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "email": email, "password": password })

    };
    try {
        let token = await request(options, function(error, response) {
            if (error) return 0;

            // console.log(response.body.token);
            let body = JSON.parse(response.body)
            return body.token
        });
        // console.log(token);
        return JSON.parse(token).token;
    } catch (ex) {
        return 0;
    }

}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function rondom(low, high) {
    const randomValue = await Math.floor(Math.random() * (high - low + 1) + low);
    return randomValue;
}