const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Image = new Schema({
    height: Number,
    width: Number,

});


const Track = new Schema({
    artistId: mongoose.Schema.Types.ObjectId,
    albumId: mongoose.Schema.Types.ObjectId,
    availableMarkets: [String],
    url: String,
    images: [Image],
    duration: Number,
    discNumber: Number,
    trackNumber: Number,
    durationMs: Number,
    explicit: Boolean,
    previewURL: String,
    popularity: Number,
    name: String,
    type: String,
    isPlayable: Boolean,
    acousticness: Number,
    analysisURL: String,
    danceability: Number,
    energy: Number,
    instrumentalness: Number,
    key: Number,
    liveness: Number,
    loudness: Number,
    mode: Number,
    speechiness: Number,
    tempo: Number,
    timeSignature: Date,
    valence: Number,
    like: Number,
    key: String,
    keyId: String,
    genre: [String]
});

const Playlist = new Schema({
    ownerId: mongoose.Schema.Types.ObjectId,
    type: String,
    collaborative: Boolean,
    Description: String,
    name: String,
    popularity: Number,
    isPublic: Boolean,
    images: [Image],
    snapshot: [{
        hasTracks: [mongoose.Schema.Types.ObjectId], //ref: 'Track',
        action: String
    }]
});

const Album = new Schema({
    images: [Image],
    artistId: mongoose.Schema.Types.ObjectId,
    name: String,
    type: String,
    albumType: String,
    popularity: Number,
    genre: String,
    releaseDate: Date,
    availableMarkets: [String],
    releaseDatePercision: String,
    label: String,
    hasTracks: [{
        trackId: mongoose.Schema.Types.ObjectId,
        //ref: 'Track'
    }]

});

const Category = new Schema({
    name: String,
    images: [Image],
    playlist: [mongoose.Schema.Types.ObjectId]
});


const User = new Schema({
    birthDate: Date,
    email: String,
    type: String,
    password: String,
    gender: String,
    country: String,
    fcmToken: String,
    confirm: Boolean,
    premiumConfirm: Boolean,
    isLogged: Boolean,
    recentlySearch: [{
        id: mongoose.Schema.Types.ObjectId,
        objectType: String
    }],
    images: [Image],
    premium: {
        expiresDate: Date,
        cardNumber: String,
        isMonth: Boolean,
        ParticipateDate: Date
    },
    userType: String,
    displayName: String,
    product: String,
    isFacebook: Boolean,
    offlineNotifications: [{

    }],
    deletedPlaylists: [{
        id: mongoose.Schema.Types.ObjectId,
        date: Date
    }],
    follow: [{
        id: mongoose.Schema.Types.ObjectId,
        //ref: 'User'
    }],
    likesTracksPlaylist: mongoose.Schema.Types.ObjectId,
    createPlaylist: [{
        playListId: mongoose.Schema.Types.ObjectId,
        //ref: 'Playlist',
        addedAt: Date,
        isPrivate: Boolean,
        collaboratorsId: [mongoose.Schema.Types.ObjectId]
    }],
    followPlaylist: [{
        playListId: mongoose.Schema.Types.ObjectId,
        isPrivate: Boolean
            //ref: 'Playlist'

    }],
    saveAlbum: [{
        savedAt: Date,
        albumId: mongoose.Schema.Types.ObjectId,
        //ref: 'Album'
    }],
    playHistory: [{
        trackId: mongoose.Schema.Types.ObjectId,
        //ref: 'Track'
        sourceId: mongoose.Schema.Types.ObjectId,
        sourceType: String

    }],
    queue: {
        lastInPlaylistIndex: Number,
        queuIndex: Number,
        tracksInQueue: [{
            trackId: mongoose.Schema.Types.ObjectId,
            //ref: 'Track'
            isQueue: Boolean,
            isPlaylist: Boolean,
            playlistId: mongoose.Schema.Types.ObjectId,
            indexInSource: Number
        }]
    },
    player: {
        lastPlaylistTrackIndex: Number,
        currentTrack: {
            trackId: mongoose.Schema.Types.ObjectId,
            isPlaylist: Boolean,
            playlistId: mongoose.Schema.Types.ObjectId
        },
        nextTrack: {
            trackId: mongoose.Schema.Types.ObjectId,
            isPlaylist: Boolean,
            playlistId: mongoose.Schema.Types.ObjectId
        },
        prevTrack: {
            trackId: mongoose.Schema.Types.ObjectId,
            isPlaylist: Boolean,
            playlistId: mongoose.Schema.Types.ObjectId
        },
        sourceName: String,
        isPlaying: Boolean,
        isShuffled: Boolean,
        currentSource: mongoose.Schema.Types.ObjectId,
        isPlaylist: Boolean,
        isRepeat: Boolean,
        volume: Number,
        currentTimeStampe: Number,
        isRepeatTrack: Boolean
    }
});

const Artist = new Schema({
    images: [Image],
    info: String,
    popularity: Number,
    genre: [String],
    type: String,
    Name: String,
    date: Date,
    images: [Image],
    userId: mongoose.Schema.Types.ObjectId
        //ref: 'User'
        ,
    addAlbums: [{
        albumId: mongoose.Schema.Types.ObjectId
            //ref: 'Album'
    }],
    addTracks: [{
        trackId: mongoose.Schema.Types.ObjectId
            //ref: 'Track'
    }],
    followed: [{
        date: Date,
        id: mongoose.Schema.Types.ObjectId
    }]

});

const user = mongoose.model('User', User);
const artist = mongoose.model('Artist', Artist);
const album = mongoose.model('Album', Album);
const track = mongoose.model('Track', Track);
const playlist = mongoose.model('Playlist', Playlist);
const category = mongoose.model('Category', Category);


module.exports = { user, artist, album, track, playlist, category }