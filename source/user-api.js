const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const Track = require('./track-api');
const Playlist = require('./playlist-api');
// initialize db 
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Artist = require('./artist-api');
const sendmail = require('../forget-password/sendmail');
const Player = require('./player-api');
const Image = require('./image-api');
const checkMonooseObjectID = require('../validation/mongoose-objectid')
    // send email to env variable to check if correct or not if not correct 
    // it will be replace by our spotify email which is defult 
sendmail(String(process.env.SPOTIFY_EMAIL), 'checkCorrect');
const User = {

    //get user by id
    //params: userId
    /** 
     *  get user by id
     * @param  {string} userId - the user id 
     * @returns {object}
     */
    getUserById: async function(userId) {
        if (!checkMonooseObjectID([userId])) return 0;
        const user = await userDocument.findById(userId, (err, user) => {
            if (err) return 0;
            return user;
        }).catch((err) => 0);

        return user;
    },


    /**
     *  update user profile information
     * @param {string} userId  - current user id
     * @param {string} gender - new user genre 
     * @param {string} birthDate - new brithday for user
     * @param {string} displayName  -  new display namefor user
     * @param {string} password  - current password of user
     * @param {string} email  - user new email
     * @param {string} country -user new country
     * @param {string} expiresDate - card new expire date
     * @param {string} cardNumber  - new card number
     * @param {boolean} isMonth - if premium per month or year
     * @param {string} newPassword  - new password for user
     * @returns {Number}
     */
    update: async function(userId, gender, birthDate, displayName, password, email, country, expiresDate, cardNumber, isMonth, newPassword) {
        if (!checkMonooseObjectID([userId])) return 0;

        const user = await this.getUserById(userId);
        if (user) {
            let isCorrectPassword = await bcrypt.compare(password, user.password).then(isMatch => {
                if (isMatch == false) return 0;
                else return 1;
            });

            if (!isCorrectPassword) return 0;
            if (user.isFacebook) {
                //if from facebok change country only
                if (country)
                    user.country = country;

            } else {
                // else update the
                if (gender != undefined) {
                    user.gender = gender;
                }

                if (birthDate != undefined) {
                    user.birthDate = birthDate;
                }

                if (displayName != undefined) {
                    user.displayName = displayName;
                }

                if (newPassword != undefined) {
                    bcrypt.hash(newPassword, 10, (err, hash) => {
                        if (!err) {
                            user.password = hash;
                        }
                    })
                }

                if (email != undefined) {
                    // check email is not used in the website
                    const UserByEmail = await userDocument.findOne({ email: email });
                    if (!UserByEmail) user.email = email;
                }

                if (country != undefined) {
                    user.country = country;
                }

            }
            if (user.product == 'premium') {
                if (expiresDate) user.premium['expiresDate'] = expiresDate;
                if (cardNumber) user.premium['cardNumber'] = cardNumber;
                if (isMonth) user.premium['isMonth'] = isMonth;
            }
            await user.save();
            return 1;

        } else
            return 0;

    },

    //get user profile public
    //params: userId
    /** 
     * get user profile public
     * @param  {string} userId - the user id 
     * @returns {Object}
     */
    me: async function(userId) {
        if (!checkMonooseObjectID([userId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) {
            return 0;
        }
        userPublic = {}
        userPublic["_id"] = user._id;
        userPublic["displayName"] = user.displayName;
        userPublic["images"] = user.images;
        userPublic["type"] = user.type;
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
        if (!checkMonooseObjectID([userId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) { return 0; }
        if (user.userType == 'Artist') return 0;
        for (let i = 0; i < user.createPlaylist.length; i++) {
            this.deletePlaylist(userId, user.createPlaylist[i].playListId);
        }
        await Image.deleteImages(userId, userId, 'user');
        // delete user himseld from db
        await userDocument.findByIdAndDelete(userId);
        return 1;

    },
    /**
     * 
     * @param {string} user - user id 
     * @param {Number} currentTimeStampe - current time stampe in current playing track 
     * @param {Boolean} isRepeatTrack - if user select repeat track   
     * @param {Number} volume  - current volume in web 
     */
    updatePlayerInfoLogOut: async function(user, currentTimeStampe, isRepeatTrack, volume) {
        if (!user.player['currentTimeStampe']) user.player['currentTimeStampe'] = 0;
        if (!user.player['isRepeatTrack']) user.player['isRepeatTrack'] = false;
        if (currentTimeStampe) user.player['currentTimeStampe'] = currentTimeStampe;
        if (isRepeatTrack) user.player['isRepeatTrack'] = isRepeatTrack;
        if (volume) user.player['volume'] = volume;
        await user.save();
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
        if (!checkMonooseObjectID([userId, trackId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) { return 0; }
        const likeTrack = await Track.getTrack(trackId, user);

        if (!likeTrack) return 0;
        if (!user['likesTracksPlaylist']) {
            const playlist = await Playlist.createPlaylist(userId, 'liked tracks', 'track which user liked .')
            if (!playlist) return 0;
            user['likesTracksPlaylist'] = playlist._id;
            playlist.isPublic = false;
            await playlist.save();
            await user.save();
        } else {
            const ifFind = await Playlist.checkPlaylistHasTracks(user['likesTracksPlaylist'], [trackId]);
            if (ifFind && ifFind[0] == true) return 0;
        }
        console.log('fkafjdkjfkdj');
        if (!await Playlist.addTrackToPlaylist(user['likesTracksPlaylist'], [trackId])) return 0;
        return Track.likeTrack(trackId);
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
        if (!checkMonooseObjectID([userId, trackId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) { return 0; }
        const unlikeTrack = await Track.getTrack(trackId, user);
        if (!unlikeTrack) return 0;
        if (!user['likesTracksPlaylist']) return 0;
        const ifFind = await Playlist.checkPlaylistHasTracks(user['likesTracksPlaylist'], [trackId]);
        if (!ifFind || ifFind[0] == false) return 0;
        if (!await Playlist.removePlaylistTracks(user['likesTracksPlaylist'], [trackId])) return 0;
        return Track.unlikeTrack(trackId);
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
        if (!checkMonooseObjectID([playlistId, trackId])) return 0;
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
        if (!checkMonooseObjectID([userId, trackId, playlistId])) return 0;
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
        if (!checkMonooseObjectID([userId])) return 0;
        const user = await this.getUserById(userId);
        if (!user.follow) user.follow = [];
        if (!user.follow.length) { return []; }
        let artists = []
        for (let i = 0; i < user.follow.length; i++) {
            let artist = await Artist.getArtist(user.follow[i].id);
            if (artist) {
                let artistInfo = {};
                artistInfo['_id'] = artist._id;
                artistInfo['Name'] = artist.Name;
                artistInfo['images'] = artist.images;
                artistInfo['type'] = artist.type;
                artists.push(artistInfo);
            }
        }
        return artists;
    },
    getUserFollowingUser: async function(userId) {
        if (!checkMonooseObjectID([userId])) return 0;
        const user = await this.getUserById(userId);
        if (!user.follow) user.follow = [];
        if (!user.follow.length) { return 0; }
        let users = []
        for (let i = 0; i < user.follow.length; i++) {
            let userFollowed = await this.getUserById(user.follow[i].id);
            if (userFollowed) {
                let userInfo = {};
                userInfo['id'] = userFollowed._id;
                userInfo['name'] = userFollowed.displayName;
                userInfo['images'] = userFollowed.images;
                userInfo['type'] = userFollowed.type;
                users.push(userInfo);
            }
        }
        return users;
    },
    UserFollowArtist: async function(userID, ArtistID) {
        if (!checkMonooseObjectID([userID, ArtistID])) return 0;
        const user = await this.getUserById(userID);
        let artist = await Artist.getArtist(ArtistID);
        let userTofollow = await this.getUserById(ArtistID);
        if (!user || (!artist && !userTofollow)) return 0;
        if (!user.follow) user.follow = [];
        user.follow.push({ 'id': ArtistID });
        await user.save();
        return 1;
    },
    UserUnfollowArtist: async function(userID, ArtistID) {
        if (!checkMonooseObjectID([userID, ArtistID])) return 0;
        const user = await this.getUserById(userID);
        let artist = await Artist.getArtist(ArtistID);
        if (!user || !artist) return 0;
        let userTofollow = await this.getUserById(ArtistID);
        if (!user || (!artist && !userTofollow)) return 0;
        if (!user.follow) user.follow = [];
        if (!user.follow.length) return 0;

        for (let i = 0; i < user.follow.length; i++) {
            if (String(user.follow[i].id) == String(ArtistID)) {
                user.follow.splice(i, 1);
                user.save();
                return 1;
            }
        }
        return 0;

    },
    CheckIfUserFollowArtist: async function(userID, ArtistID) {
        if (!checkMonooseObjectID([userID, ArtistID])) return -1;
        const user = await this.getUserById(userID);
        let artist = await Artist.getArtist(ArtistID);
        let userTofollow = await this.getUserById(ArtistID);
        if (!user || (!artist && !userTofollow)) return -1;
        if (!user.follow) user.follow = [];
        if (!user.follow.length) return false;
        for (let i = 0; i < user.follow.length; i++) {
            if (String(user.follow[i].id) == String(ArtistID))
                return true;
        }
        return false;
    },
    //check if user email in db
    //params: email


    updateDate: async function(artist) {
        if (artist.date != mongoose.Date.now()) {
            artist.date = new Date();
            await artist.save();
        }

    },
    getArtistNumberOfFollowersInMonth: async function(artistId) {
        let artist = await Artist.getArtist(artistId);
        if (!artist) return 0;
        var today = new Date();

        if (artist.date.getMonth() == today.getMonth() &&
            artist.date.getFullYear() == today.getFullYear()) {
            artist.numOfFollowersPerMonth += 1;
        } else {
            artist.numOfFollowersPerMonth = 0;
        }
        await artist.save();
        await this.updateDate(artist);
        return artist.numOfFollowersPerMonth;

    },
    getArtistNumberOfFollowersInDay: async function(artistId) {
        let artist = await Artist.getArtist(artistId);
        if (!artist) return 0;
        var today = new Date();

        if (artist.date.getMonth() == today.getMonth() &&
            artist.date.getFullYear() == today.getFullYear() &&
            artist.date.getDay() == today.getDay()) {
            artist.numOfFollowersPerDay += 1;
        } else {
            artist.numOfFollowersPerDay = 0;
        }
        await artist.save();
        await this.updateDate(artist);
        return artist.numOfFollowersPerDay;

    },
    getArtistNumberOfFollowersInYear: async function(artistId) {
        let artist = await Artist.getArtist(artistId);
        if (!artist) return 0;
        var today = new Date();

        if (artist.date.getFullYear() == today.getFullYear()) {
            artist.numOfFollowersPerYear += 1;
        } else {
            artist.numOfFollowersPerYear = 0;
        }
        await artist.save();
        await this.updateDate(artist);
        return artist.numOfFollowersPerYear;

    },
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
    confirmEmail: async function(user) {
        if (!user.confirm) user.confirm = true;
        if (user.confirm == false) { user.confirm = true; }
        await user.save();
        return true;
    },
    //user forget password
    //params: user
    /** 
     * update user forgotten password
     * @param  {Object} user - the user 
     * @returns {string}
     */
    updateforgottenpassword: async function(user, pass) {

        let password = pass;
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
        if (!checkMonooseObjectID([userId, playlistId])) return 0;
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
        if (!checkMonooseObjectID([userId, playlistId])) return 0;
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
        if (!checkMonooseObjectID([userId, playlistId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) return 0;
        const isDelete = await Playlist.deletePlaylist(user, playlistId);
        if (!isDelete) return 0;
        if (!user.deletedPlaylists) user.deletedPlaylists = [];
        user.deletedPlaylists.push({ id: playlistId, date: Date.now() });
        await user.save();
        spotifyUser = await tringthis.checkmail(String(process.env.SPOTIFY_EMAIL));
        if (!spotifyUser)
            spotifyUser = await this.createUser('Spotify', String(process.env.SPOTIFY_PASSWORD_IN_APP), 'Spotify', 'All', Date.now());
        if (!spotifyUser) return 0;
        await playlistDocument.updateOne({ _id: playlistId }, {
            ownerId: spotifyUser._id
        });
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
            fcmToken: "none",
            confirm: false,
            isFacebook: false,
            images: [],
            follow: [],
            createPlaylist: [],
            saveAlbum: [],
            playHistory: [],
            player: {},
            recentlySearch: []
        });
        user.player["is_shuffled"] = false;
        user.player["volume"] = 4;
        user.player["is_repeat"] = false;
        user.player['currentTimeStampe'] = 0;
        user.player['isRepeatTrack'] = false;
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
        if (!checkMonooseObjectID([userId, playlistId])) return 0;
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
        if (!checkMonooseObjectID([userId])) return 0;
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
    restorePlaylists: async function(userId, playlistsIds) {
        if (!checkMonooseObjectID([userId])) return 0;
        if (!checkMonooseObjectID(playlistsIds)) return 0;
        let user = await userDocument.findById(userId);
        let restored = [];
        if (!user) return 0;
        if (!user.deletedPlaylists || user.deletedPlaylists.length == 0) return 0;
        let spotifyUser = await this.checkmail(String(process.env.SPOTIFY_EMAIL));
        if (!spotifyUser) return 0;
        let deleted = [];
        for (let i = 0; i < playlistsIds.length; i++) {
            for (let j = 0; j < user.deletedPlaylists.length; j++) {
                if (user.deletedPlaylists[j].id == playlistsIds[i]) {
                    let playlist = await Playlist.getPlaylist(playlistsIds[i]);
                    if (!playlist) { restored.push(false); break; }
                    await playlistDocument.updateOne({ _id: playlistsIds[i] }, {
                        ownerId: user._id
                    });
                    let changeSpotify = await Playlist.deletePlaylist(spotifyUser, playlistsIds[i]);
                    let result = await this.addPlaylistToCreatedToUser(user, playlistsIds[i]);
                    deleted.push(playlistsIds[i]);
                    restored.push(result);
                }
            }
        }
        for (var i = 0; i < deleted.length; i++) {
            for (var j = 0; j < user.deletedPlaylists.length; j++) {
                if (deleted[i] == user.deletedPlaylists[j].id) {
                    user.deletedPlaylists.splice(j, 1);
                }
            }
        }
        await user.save();
        return restored;
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
        if (!checkMonooseObjectID([userId])) return 0;
        let users = await userDocument.find({});
        if (!users) return 0;
        let createduser;
        let playlistindex;
        let found = false;
        for (let user in users) {
            if (!users[user].createPlaylist) return 0;
            for (var i = 0; i < users[user].createPlaylist.length; i++) {
                if (String(users[user].createPlaylist[i].playListId) == String(playlistId)) {
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
                if (String(createduser.createPlaylist[playlistindex].collaboratorsId[i]) == String(userId)) {
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
        if (!checkMonooseObjectID([userId])) return 0;
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
    promoteToPremium: async function(userId, cardNumber, isMonth, expiresDate) {
        if (!checkMonooseObjectID([userId])) return 0;
        user = await this.getUserById(userId);
        if (!user) return false;
        if (user.product == 'premium') {
            return false;
        }
        user.product = 'premium';
        user.premium['expiresDate'] = expiresDate;
        user.premium['cardNumber'] = cardNumber;
        user.premium['isMonth'] = isMonth;
        user.premium['ParticipateDate'] = Date.now();
        await user.save();
        sendmail(user.email, 'Congrats!! ^^) You are Now Promoted to premium so You can Login with your Account as an premium please login again :\n enjoy with premium');
        return true;
    },
    // to make user be free
    /**
     * user return to free
     * @param {string} userId - id of user
     * @returns {boolean} - if can be free or not  
     */
    promoteToFree: async function(userId) {
        if (!checkMonooseObjectID([userId])) return 0;
        user = await this.getUserById(userId);
        if (!user) return 0;
        // if not premium return 0
        if (user.product != 'premium') {
            return 0;
        }
        user.product = 'free';
        user.premium = {};
        await user.save();
        sendmail(user.email, 'Congrats!! ^^) You are Now free not premium return to premium and enjoy with us  please login again :\n enjoy with premium');
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
        if (!checkMonooseObjectID([userId, sourceId, trackId])) return 0;
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
        if (!checkMonooseObjectID([userId, sourceId, trackId])) return 0;
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

    updateUserPlayer: async function(userId, isPlaylist, sourceId, trackId, tracksIds, sourceType) {
        if (!checkMonooseObjectID([userId, trackId])) return 0;
        const user = await this.getUserById(userId);
        if (!user) return 0;
        if (!tracksIds) {
            if (!checkMonooseObjectID([sourceId])) return 0;
        } else if (!checkMonooseObjectID(tracksIds)) return 0;

        const queu = await Player.createQueue(user, isPlaylist, sourceId, trackId, tracksIds, sourceType);
        if (!queu) return 0;

        const player = await Player.setPlayerInstance(user, isPlaylist, sourceId, trackId, tracksIds, sourceType);
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
        if (!checkMonooseObjectID([userId])) return 0;
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
        if (!checkMonooseObjectID([userId])) return 0;
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
        if (!checkMonooseObjectID([userId])) return 0;
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
        if (!checkMonooseObjectID([userId])) return 0;
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
        if (!checkMonooseObjectID([userId])) return 0;
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