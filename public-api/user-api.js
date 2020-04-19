const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const Track = require('./track-api');
const Playlist = require('./playlist-api');
// initialize db 
const bcrypt = require('bcrypt');
const Artist = require('./artist-api');
const sendmail = require('../forget-password/sendmail');
const Player = require('./player-api');
const checkMonooseObjectId = require('../validation/mongoose-objectid')
    /** @namespace */
const User = {

    //get user by id
    //params: userId
    /** 
     *  get user by id
     * @param  {string} userId - the user id 
     * @returns {object}
     */
    getUserById: async function(userId) {
        if (!checkMonooseObjectId([userId])) return 0;
        const user = await userDocument.findById(userId, (err, user) => {
            if (err) return 0;
            return user;
        }).catch((err) => 0);

        return user;
    },

    //update user profile information
    //params: userId, Display_Name(optional), Password(optional),
    //        Email(optional), Country(optional) 

    /** 
     *  update user profile information
     * @param  {string} userId - the user id 
     * @param  {string} Display_Name - the user name 
     * @param  {string} Password - the user password 
     * @param  {string} Email - the user email 
     * @param  {string} Country - the user country
     * @returns {Number}
     */
    update: async function(userId, Display_Name, Password, Email, Country) {
        if (!checkMonooseObjectId([userId])) return 0;
        const user = await this.getUserById(userId);
        if (user) {
            if (user.isFacebook) {
                //if from facebok change country only
                if (Country)
                    user.country = Country;

            } else {
                // else update the
                if (Display_Name != undefined) {
                    user.displayName = Display_Name;
                }
                if (Password != undefined) {
                    bcrypt.hash(Password, 10, (err, hash) => {
                        if (!err) {
                            user.password = hash;
                        }
                    })
                }
                if (Email != undefined) {
                    // check email is not used in the website
                    const UserByEmail = await userDocument.findOne({ email: Email });
                    if (!UserByEmail) user.email = Email;
                    else return 0; //email is found before
                }
                if (Country != undefined) {
                    user.country = Country;
                }

            }
            await user.save();
            return 1;

        } else return 0;

    },

    //get user profile public
    //params: userId
    /** 
     * get user profile public
     * @param  {string} userId - the user id 
     * @returns {Object}
     */
    me: async function(userId) {
        if (!checkMonooseObjectId([userId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) {
            return 0;
        }


        userPublic = {}
        userPublic["_id"] = user._id;
        userPublic["displayName"] = user.displayName;
        userPublic["images"] = user.images;
        userPublic["type"] = user.type;
        userPublic["followedBy"] = user.followedBy;
        return userPublic;



    },

    //delete user account
    //params: userId
    /** 
     * delete user account
     * @param  {string} userId - the user id 
     * @returns {Object}
     */
    deleteAccount: async function(userId) {
        if (!checkMonooseObjectId([userId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) { return 0; }
        const User = await userDocument.find({ follow: { id: user._id } }, (err, User) => {
            if (err) return 0;
            return User;
        });
        // delete user himseld from db
        await userDocument.findByIdAndDelete(userId);
        return User;

    },

    //user like a track
    //params: userId, trackId

    /** 
     * user like a track
     * @param  {string} userId - the user id 
     * @param  {string} trackId - the track id 
     * @returns {Number}
     */
    likeTrack: async function(userId, trackId) {
        if (!checkMonooseObjectId([userId, trackId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) { return 0; }
        const likeTrack = await Track.likeTrack(user, trackId).catch();
        return likeTrack;

    },

    //user unlike a track
    //params: userId, trackId

    /** 
     * user unlike a track
     * @param  {string} userId - the user id 
     * @param  {string} trackId - the track id 
     * @returns {Number}
     */
    unlikeTrack: async function(userId, trackId) {
        if (!checkMonooseObjectId([userId, trackId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) { return 0; }
        const unlikeTrack = await Track.unlikeTrack(user, trackId);
        return unlikeTrack;
    },
    /** 
     * user add track to user's playlist
     * @param  {string} userId - the user id 
     * @param  {string} trackId - the track id 
     * @param  {string} playlistId - the playlist id
     * @returns {Number}
     */
    //artist add track to user's playlist
    //params: user, trackId, playlistId
    addTrack: async function(user, trackId, playlistId) {
        if (!checkMonooseObjectId([playlistId, trackId])) return 0;
        const Playlist = await playlist.findById(playlistId);
        const Track = await track.findById(trackId);
        if (!Playlist || !Track) { return 0; }
        if (Playlist.hasTracks) {
            user.hasTracks.push({
                trackId: trackId

            });
            await Playlist.save();
            return 1;

        }
        Playlist.hasTracks = [];
        Playlist.hasTracks.push({
            trackId: trackId

        });
        await Playlist.save();
        return 1;

    },

    //user add track to playlist
    //params: userId, trackId, playlistId

    /** 
     * user add track to playlist
     * @param  {string} userId - the user id 
     * @param  {string} trackId - the track id 
     * @param  {string} playlistId - the playlist id
     * @returns {Number}
     */
    AddTrackToPlaylist: async function(userId, trackId, playlistId) {
        if (!checkMonooseObjectId([userId, trackId, playlistId])) return 0;
        const user = await this.getUserById(userId);
        const userplaylist = await user.createPlaylist.find({ playListId: playlistId });
        if (!user || !userplaylist) { return 0; }
        const addTrack = await this.addTrack(user, trackId, playlistId);
        return addTrack;
    },

    //get user's following artist
    //params: userId

    /** 
     * get user's following artist
     * @param  {string} userId - the user id 
     * @returns {Array<Object>}
     */
    getUserFollowingArtist: async function(userId) {
        if (!checkMonooseObjectId([userId])) return 0;
        const user = await this.getUserById(userId);
        if (!user.follow) user.follow = [];
        if (!user.follow.length) { return 0; }
        let Artist = []
        for (let i = 0; i < user.follow.length; i++) {
            let User = await this.getUserById(user.follow[i].id);
            if (User) {
                let artists = await artistDocument.find({ userId: User._id });
                if (artists) {
                    Artist.push(artists[0]);
                }
            }
        }
        return Artist;

    },
    //check if user email in db
    //params: email

    /** 
     * check if user email in db
     * @param  {string} email - the user email 
     * @returns {Object}
     */
    checkmail: async function(email) {
        let user = await userDocument.findOne({ email: email });
        if (!user) return false;
        return user;
    },

    //user forget password
    //params: user
    /** 
     * update user forgotten password
     * @param  {Object} user - the user 
     * @returns {string}
     */
    updateforgottenpassword: async function(user) {
        if (!user) return 0;
        let password = user.displayName + "1234";
        const salt = await bcrypt.genSalt(10);
        let hashed = await bcrypt.hash(password, salt);
        user.password = hashed;
        await user.save();
        return password;

    },

    //user follow playlist
    //params: userId, playlistId, isprivate

    /** 
     * user follow playlist
     * @param  {string} userId - the user Id
     * @param  {string} playlistId - the playlist Id
     * @param  {Boolean} isprivate - the playlist status public or private
     * @returns {Number}
     */
    followPlaylist: async function(userId, playlistId, isprivate) {
        if (!checkMonooseObjectId([userId, playlistId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) return 0;
        return await Playlist.followPlaylits(user, playlistId, isprivate);

    },

    //user unfollow playlist
    //params: userId, playlistId
    /** 
     * user unfollow playlist
     * @param  {string} userId - the user Id
     * @param  {string} playlistId - the playlist Id
     * @returns {Number}
     */
    unfollowPlaylist: async function(userId, playlistId) {
        if (!checkMonooseObjectId([userId, playlistId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) return 0;
        return await Playlist.unfollowPlaylist(user, playlistId);
    },

    //user delete playlist
    //params: userId, playlistId
    /** 
     * user delete playlist
     * @param  {string} userId - the user Id
     * @param  {string} playlistId - the playlist Id
     * @returns {Number}
     */
    deletePlaylist: async function(userId, playlistId) {
        if (!checkMonooseObjectId([userId, playlistId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) return 0;
        const isDelete = await Playlist.deletePlaylist(user, playlistId);
        if (!isDelete) return 0;
        spotifyUser = await this.checkmail('appspotify646@gmail.com');
        if (!spotifyUser)
            spotifyUser = await this.createUser('Spotify', 'HelloSpotify', 'appspotify646@gmail.com', 'Spotify', 'All', Date.now());
        if (!spotifyUser) return 0;
        return await this.addPlaylistToCreatedToUser(spotifyUser, playlistId);
    },
    /**
     * create new user
     * @param {string} username - user username
     * @param {string} password - user password
     * @param {string} email - user email
     * @param {string} gender - user gender
     * @param {string} country  - user country
     * @param {string} birthday - user birthday
     * @returns {object} -new user object 
     */
    createUser: async function(username, password, email, gender, country, birthday) {
        console.log('asadfsdfdf');
        const salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(password, salt);
        const user = new userDocument({
            email: email,
            password: hash,
            displayName: username,
            gender: gender,
            country: country,
            birthDate: birthday,
            product: "free",
            userType: "user",
            type: "user",
            isFacebook: false,
            images: [],
            follow: [],
            followedBy: [],
            like: [],
            createPlaylist: [],
            saveAlbum: [],
            playHistory: [],
            player: {}
        });
        user.player["is_shuffled"] = false;
        user.player["volume"] = 4;
        user.player["is_repeat"] = false;
        await user.save();
        return user;
    },
    //get user's playlist
    //params: playlistId, snapshot, userId
    /** 
     * get user's playlist
     * @param  {string} playlistId - the playlist Id
     * @param  {string} snapshot - the snapshot Id if given
     * @param  {string} userId - the user Id
     * @returns {Array<Object>}
     */
    getPlaylist: async function(playlistId, snapshot, userId) {
        if (!checkMonooseObjectId([userId, playlistId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) return 0;
        const playlist = await Playlist.getPlaylistWithTracks(playlistId, snapshot, user);
        if (!playlist[0]) return 0;
        const owner = await this.getUserById(playlist[0].ownerId);
        playlist.push({ ownerName: owner ? owner.displayName : undefined });
        return playlist;
    },


    //user create playlist
    //params: userId, playlistName, Description

    /** 
     * user create playlist
     * @param  {string} userId - the user Id
     * @param  {string} playlistName - the name of the new playlist
     * @param  {string} Description - the Description of the new playlist if given
     * @returns {Object}
     */
    createdPlaylist: async function(userId, playlistName, Description) {
        if (!checkMonooseObjectId([userId])) return 0;
        const user = await this.getUserById(userId);
        // create new playlist
        if (!user) return 0;
        const createdPlaylist = await Playlist.createPlaylist(userId, playlistName, Description);
        //add to user 
        if (!createdPlaylist) return 0;
        const addToUser = this.addPlaylistToCreatedToUser(user, createdPlaylist._id);
        if (!addToUser) return 0;
        return createdPlaylist;
    },
    /**
     *  make this user who create this playlist
     * @param {object} user  -user object
     * @param {string} playlistId  - the id of playlist
     * @returns {boolean}
     */
    addPlaylistToCreatedToUser: async function(user, playlistId) {
        if (!user) return 0;
        if (!user.createPlaylist)
            user.createPlaylist = [];
        user.createPlaylist.push({
            playListId: playlistId,
            addedAt: Date.now(),
            isPrivate: false
        });
        await user.save().catch();
        await Playlist.followPlaylits(user, playlistId, false);
        return 1;
    },
    //check if user can access a playlist
    //params: userId, playlistId
    /** 
     * check if user can access a playlist
     * @param  {string} userId - the user Id
     * @param  {string} playlistId - the playlist Id 
     * @returns {Boolean}
     */
    checkAuthorizedPlaylist: async function(userId, playlistId) {
        if (!checkMonooseObjectId([userId])) return 0;
        let users = await userDocument.find({});
        if (!users) return 0;
        let createduser;
        let playlistindex;
        let found = false;
        for (let user in users) {
            if (!users[user].createPlaylist) return 0;
            for (var i = 0; i < users[user].createPlaylist.length; i++) {
                if (users[user].createPlaylist[i].playListId + 1 == playlistId + 1) {
                    createduser = users[user];
                    playlistindex = i;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        if (!createduser) { return false; }
        if (createduser._id + 1 == userId + 1) return true;
        else {
            for (var i = 0; i < createduser.createPlaylist[playlistindex].collaboratorsId.length; i++) {
                if (createduser.createPlaylist[playlistindex].collaboratorsId[i] + 1 == userId + 1) {
                    return true;
                }
            }
        }
        return false;
    },


    //promote user to artist
    //params: userId, info, name, genre
    /** 
     * promote user to artist
     * @param  {string} userId - the user Id
     * @param  {string} info - the info of the new Artist 
     * @param  {string} name - the name of the new Artist 
     * @param  {Array<string>} genre - the genre(s) of the new Artist
     * @returns {Boolean}
     */

    promoteToArtist: async function(userId, info, name, genre) {
        if (!checkMonooseObjectId([userId])) return 0;
        user = await this.getUserById(userId);
        if (!user) return false;
        if (user.userType == "Artist") {
            return false;
        }
        let artist = await Artist.createArtist(user, info, name, genre);
        if (!artist) return false;
        user.userType = "Artist";
        await user.save();
        sendmail(user.email, "Congrats!! ^^) You're Now Promoted to Artist so You can Login with your Account as an Artist");
        return true;

    },
    /**
     * promote user To Premium
     * @param {string} userId  -the id of user
     * @returns {boolean} - if can or not  
     */
    promoteToPremium: async function(userId, credit) {
        if (!checkMonooseObjectId([userId])) return 0;
        user = await this.getUserById(userId);
        if (!user) return false;
        if (user.product == 'premium') {
            return false;
        }
        user.product = 'premium';
        user.creditCard = credit;
        await user.save();
        sendmail(user.email, 'Congrats!! ^^) You are Now Promoted to premium so You can Login with your Account as an premium please login again :\n enjoy with premium');
        return true;
    },
    //create queue for a user
    //params: userId, isPlaylist, sourceId, trackId
    /** 
     * create queue for a user
     * @param  {string} userId - the user Id
     * @param  {Boolean} isPlaylist - the status of the source of the track (playlist or not)
     * @param  {string} sourceId - the id of the source of the track 
     * @param  {string} trackId - the id of the track the user started playing
     * @returns {Number}
     */
    createQueue: async function(userId, isPlaylist, sourceId, trackId) {
        if (!checkMonooseObjectId([userId, sourceId, trackId])) return 0;
        const user = await this.getUserById(userId);
        const isCreateQueue = await Player.createQueue(user, isPlaylist, sourceId, trackId);
        return isCreateQueue;

    },

    //add track to user's queue
    //params: userId, isPlaylist, sourceId, trackId

    /** 
     * add track to user's queue
     * @param  {string} userId - the user Id
     * @param  {string} trackId - the id of the track the user wants to add
     * @param  {Boolean} isPlaylist - the status of the source of the track (playlist or not)
     * @param  {string} sourceId - the id of the source of the track 
     * @returns {Number}
     */
    addToQueue: async function(userId, trackId, isPlaylist, sourceId) {
        if (!checkMonooseObjectId([userId, sourceId, trackId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) return 0;
        const isAddQueue = await Player.addToQueue(user, trackId, isPlaylist, sourceId);
        return isAddQueue;
    },

    //update user's player
    //params: userId, isPlaylist, sourceId, trackId
    /** 
     * update user's player
     * @param  {string} userId - the user Id
     * @param  {Boolean} isPlaylist - the status of the source of the track (playlist or not)
     * @param  {string} sourceId - the id of the source of the track 
     * @param  {string} trackId - the id of the track the user wants to add
     * @returns {Number}
     */

    updateUserPlayer: async function(userId, isPlaylist, sourceId, trackId) {
        if (!checkMonooseObjectId([userId, sourceId, trackId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) return 0;
        const queu = await Player.createQueue(user, isPlaylist, sourceId, trackId);
        if (!queu) return 0;
        const player = await Player.setPlayerInstance(user, isPlaylist, sourceId, trackId);
        if (!player) return 0;
        return 1;
    },

    //repeat playlist 
    //params: userId, state
    /** 
     * repeat playlist 
     * @param  {string} userId - the user Id
     * @param  {Boolean} state - the state of the repeat (on or off)
     * @returns {Number}
     */

    repreatPlaylist: async function(userId, state) {
        if (!checkMonooseObjectId([userId])) return 0;
        const user = await this.getUserById(userId);
        if (user)
            return await Player.repreatPlaylist(user, state);
        return 0;
    },

    //get user's queue
    //params: userId
    /** 
     * get user's queue
     * @param  {string} userId - the user Id
     * @returns {Array<Object>}
     */

    getQueue: async function(userId) {
        if (!checkMonooseObjectId([userId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) return 0;
        const tracks = await Player.getQueue(user);
        if (!tracks) return 0;
        return tracks;

    },

    //resume playing
    //params: userId
    /** 
     * resume the user player
     * @param  {string} userId - the user Id
     * @returns {Number}
     */

    resumePlaying: async function(userId) {
        if (!checkMonooseObjectId([userId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) return 0;
        const player = await Player.resumePlaying(user);
        if (!player) return 0;
        return 1;

    },

    //pause playing
    //params: userId
    /** 
     * pause the user player
     * @param  {string} userId - the user Id
     * @returns {Number}
     */

    pausePlaying: async function(userId) {
        if (!checkMonooseObjectId([userId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) return 0;
        const player = await Player.pausePlaying(user);
        if (!player) return 0;
    },

    //shuffle playlist
    //params: userId, state
    /** 
     * shuffle playlist
     * @param  {Boolean} state - the state of the shuffle (on or off)
     * @param  {string} userId - the user Id
     * @returns {Number}
     */

    setShuffle: async function(state, userId) {
        if (!checkMonooseObjectId([userId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) return 0;
        const isShuffle = await Player.setShuffle(state, user);
        if (!isShuffle) return 0;
        return 1;
    },
    /**
     * 
     * @param {string} userId 
     * @param {string} trackId
     * @returns {boolean} 
     */
    checkAuthorizedTrack: async function(userId, trackId) {
        const user = await this.getUserById(userId);
        if (!user) return 0;
        // chekc if user is artist
        const artist = await Artist.findMeAsArtist(userId);
        if (!artist) return 0;
        const hasAccess = await Artist.checkArtistHasTrack(artist, trackId);
        return hasAccess;
    },
    /**
     * 
     * @param {string} userId 
     * @param {string} albumId 
     * @returns {boolean}
     */
    checkAuthorizedAlbum: async function(userId, albumId) {
        const user = await this.getUserById(userId);
        if (!user) return 0;
        // chekc if user is artist
        const artist = await Artist.findMeAsArtist(userId);
        if (!artist) return 0;
        const hasAccess = await Artist.checkArtisthasAlbum(artist._id, albumId);
        return hasAccess;
    }

}

module.exports = User;