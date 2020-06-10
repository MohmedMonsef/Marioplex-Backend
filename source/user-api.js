const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const Track = require('./track-api');
const Playlist = require('./playlist-api');
// initialize db 
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Artist = require('./artist-api');
const sendmail = require('./sendmail');
const Player = require('./player-api');
const Image = require('./image-api');
const checkMonooseObjectID = require('../validation/mongoose-objectid');
    // send email to env variable to check if correct or not if not correct 
sendmail(String(process.env.SPOTIFY_EMAIL), 'checkCorrect');
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
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
            const user = await userDocument.findById(userId, (err, user) => {
                if (err) return 0;
                return user;
            }).catch((err) => 0);

            return user;
        } catch (ex) {
            return 0;
        }
    },
    getUnAuthUser: async function(userId) {
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) return 0;
            const publicUser = {
                gender: user.gender,
                email: user.email,
                displayName: user.displayName,
                birthDate: user.birthDate,
                product: user.product,
                images: user.images,
                follow: user.follow,
                createPlaylist: user.createPlaylist,
                followPlaylist: user.followPlaylist,
                saveAlbum: user.saveAlbum,
                following: user.following,
                followers: user.followers
            }
            return publicUser;
        } catch (ex) {
            return 0;
        }
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
     * @param {string} repeatedPassword  - new password for user
     * @returns {Number}
     */
    update: async function(repeatedPassword, userId, gender, birthDate, displayName, password, email, country, expiresDate, cardNumber, isMonth, newPassword) {
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");

            let user = await this.getUserById(userId);
            if (user) {
                if(!user.updatedInfo){
                    user.updatedInfo={
                        email:null,
                        password:null,
                        country:null,
                        displayName:null,
                        expiresDate: null,
                        cardNumber: null,
                        isMonth: null,
                        gender:null,
                        birthDate:null
                    }
                    await user.save();
                }
                let isCorrectPassword = await bcrypt.compare(password, user.password);
                if (!isCorrectPassword) return 0;
                if (user.isFacebook) {
                    //if from facebok change country only
                    if (country)
                        user.updatedInfo.country = country;

                } else {
                    // else update the
                    if (gender != undefined) {
                        user.updatedInfo.gender = gender;
                    }

                    if (birthDate != undefined) {
                        user.updatedInfo.birthDate = birthDate;
                    }

                    if (displayName != undefined) {
                        user.updatedInfo.displayName = displayName;
                    }
                    if (newPassword != undefined && repeatedPassword == newPassword) {
                        let salt = await bcrypt.genSalt(10);
                        let hashed = await bcrypt.hash(newPassword, salt);
                        user.updatedInfo.password = hashed;
                    }

                    if (email != undefined) {
                        // check email is not used in the website
                        let UserByEmail = await userDocument.findOne({ email: email });
                        if (!UserByEmail) user.updatedInfo.email = email;
                    }

                    if (country != undefined) {
                        user.updatedInfo.country = country;
                    }

                }
                if (user.product == 'premium') {
                    if (expiresDate) user.updatedInfo.expiresDate = expiresDate;
                    if (cardNumber) user.updatedInfo.cardNumber = cardNumber;
                    if (isMonth) user.updatedInfo.isMonth = isMonth;
                }
                if(!user.updateConfirm)user.updateConfirm=false
                user.updateConfirm=false
                await user.save();
                return 1;

            } else
                return 0;
        } catch (ex) {
            return 0;
        }

    },

    //get user profile public
    //params: userId
    /** 
     * get user profile public
     * @param  {string} userId - the user id 
     * @returns {Object}
     */
    me: async function(userId) {
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
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
        } catch (ex) {
            return 0;
        }

    },

    //delete user account
    //params: userId
    /** 
     * delete user account
     * @param  {string} userId - the user id 
     * @returns {Object}
     */
    deleteAccount: async function(userId) {
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) { return 0; }
            if (user.userType == 'Artist') return 0;
            for (let i = 0; i < user.createPlaylist.length; i++) {
                await this.deletePlaylist(userId, user.createPlaylist[i].playListId);
            }
            await Image.deleteImages(userId, userId, 'user');
            
            await artistDocument.update({}, { $pull: { 'followed': {'id' : userId}} });
            await trackDocument.update({}, { $pull: { 'likes': {'userId' : userId}} });
            await albumDocument.update({}, { $pull: { 'followed': {'id' : userId}} });
            await userDocument.update({}, { $pull: { 'following': [userId] } });
            await userDocument.update({}, { $pull: { 'followers': [userId] } });

            // delete user himseld from db
            await userDocument.findByIdAndDelete(userId);
            return 1;
        } catch (ex) {
            return 0;
        }

    },
    /**
     * 
     * @param {string} user - user id 
     * @param {Number} currentTimeStampe - current time stampe in current playing track 
     * @param {Boolean} isRepeatTrack - if user select repeat track   
     * @param {Number} volume  - current volume in web 
     */
    updatePlayerInfoLogOut: async function(user, currentTimeStampe, isRepeatTrack, volume) {
        try {
            if (!user.player['currentTimeStampe']) user.player['currentTimeStampe'] = 0;
            if (!user.player['isRepeatTrack']) user.player['isRepeatTrack'] = false;
            if (currentTimeStampe) user.player['currentTimeStampe'] = currentTimeStampe;
            if (isRepeatTrack) user.player['isRepeatTrack'] = isRepeatTrack;
            if (volume) user.player['volume'] = volume;
            await user.save();
        } catch (ex) {
            return 0;
        }
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
        try {
            if (!checkMonooseObjectID([userId, trackId])) throw new Error("not mongoose id");
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

            if (!await Playlist.addTrackToPlaylist(user['likesTracksPlaylist'], [trackId])) return 0;
            return Track.likeTrack(userId,trackId);
        } catch (ex) {
            return 0;
        }
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
        try {
            if (!checkMonooseObjectID([userId, trackId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) { return 0; }
            const unlikeTrack = await Track.getTrack(trackId, user);
            if (!unlikeTrack) return 0;
            if (!user['likesTracksPlaylist']) return 0;
            const ifFind = await Playlist.checkPlaylistHasTracks(user['likesTracksPlaylist'], [trackId]);
            if (!ifFind || ifFind[0] == false) return 0;
            if (!await Playlist.removePlaylistTracks(user['likesTracksPlaylist'], [trackId])) return 0;
            return Track.unlikeTrack(userId,trackId);
        } catch (ex) {
            return 0;
        }
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
        try {
            if (!checkMonooseObjectID([playlistId, trackId]))  throw new Error("not mongoose id");
            const playlist = await playlistDocument.findById(playlistId);
            const track = await trackDocument.findById(trackId);
            if (!playlist || !track) { return 0; }
            if (playlist.hasTracks) {
                playlist.hasTracks.push({
                    trackId: trackId

                });
                await playlist.save();
                return 1;

            }
            playlist.hasTracks = [];
            playlist.hasTracks.push({
                trackId: trackId

            });
            await playlist.save();
            return 1;
        } catch (ex) {
            return 0;
        }

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
        try {
            if (!checkMonooseObjectID([userId, trackId, playlistId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) return 0;
            let userPlaylist = undefined;
            for (let playlist of user.createPlaylist) {
                if (String(playlist.playListId) == String(playlistId)) {
                    userPlaylist = playlist;
                    break;
                }
            }
            if (!userPlaylist) { return 0; }
            const addTrack = await this.addTrack(user, trackId, playlistId);
            return addTrack;
        } catch (ex) {
            return 0;
        }
    },

    //get user's following artist
    //params: userId

    /** 
     * get user's following artist
     * @param  {string} userId - the user id 
     * @returns {Array<Object>}
     */
    getUserFollowingArtist: async function(userId) {
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) return 0;
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
        } catch (ex) {
            return 0;
        }
    },
    /**
     * get users that the user follows
     * @param {String} userId 
     * @returns {object}
     */
    getUserFollowingUser: async function(userId) {
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) return 0;
            if (!user.following) user.following = [];
            if (!user.following.length) { return []; }
            let users = []
            for (let userId of user.following) {
                let userFollow = await this.getUnAuthUser(userId);
                if (userFollow) users.push(userFollow);
            }
            return users;
        } catch (ex) {
            return 0;
        }
    },
    /**
     * get user followers
     * @param {String} userId 
     * @returns {Array<Object>}
     */
    getUserFollowers: async function(userId) {
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) return 0;
            if (!user.followers) user.followers = [];
            if (!user.followers.length) { return []; }
            let users = []
            for (let userId of user.followers) {
                let userFollow = await this.getUnAuthUser(userId);
                if (userFollow) users.push(userFollow);
            }
            return users;
        } catch (ex) {
            return 0;
        }
    },

    checkUser1FollowUser2: function(user1, user2) {
        try {

            for (let userId of user1.following) {
                if (String(userId) == String(user2._id)) return 1;
            }
            return 0;
        } catch (ex) {
            return 0;
        }
    },
    /**
     * user follow other user
     * @param {String} user1Id 
     * @param {String} user2Id
     * @returns {Boolean} 
     */
    userFollowUser: async function(user1Id, user2Id) {
        try {
            if (!checkMonooseObjectID([user1Id, user2Id])) throw new Error("not mongoose id");
            const user1 = await this.getUserById(user1Id);
            const user2 = await this.getUserById(user2Id);
            if (!user1 || !user2) return 0;
            // if already followed return 0
            if (this.checkUser1FollowUser2(user1, user2)) return 0;
            if (!user1.following) user1.following = [];
            // add user2Id to user1 following
            user1.following.push(user2Id);

            await user1.save();
            if (!user2.followers) user2.followers = [];
            // add user1Id to user2 followers
            user2.followers.push(user1Id);
            await user2.save();
            return 1;
        } catch (ex) {
            return 0;
        }
    },
    /**
     * user follow other user
     * @param {String} user1Id 
     * @param {String} user2Id
     * @returns {Boolean} 
     */
    userUnfollowUser: async function(user1Id, user2Id) {
        try {
            if (!checkMonooseObjectID([user1Id, user2Id])) throw new Error("not mongoose id");
            const user1 = await this.getUserById(user1Id);
            const user2 = await this.getUserById(user2Id);
            if (!user1 || !user2) return 0;
            // if already followed return 0
            if (!this.checkUser1FollowUser2(user1, user2)) return 0;
            // remove user2Id to user1 following
            for (let i = 0; i < user1.following.length; i++) {
                if (String(user1.following[i]) == String(user2Id)) {
                    user1.following.splice(i, 1);
                    break;
                }
            }
            await user1.save();
            // remove user1Id to user2 followers
            for (let i = 0; i < user2.followers.length; i++) {
                if (String(user2.followers[i]) == String(user1Id)) {
                    user2.followers.splice(i, 1);
                    break;
                }
            }
            await user2.save();
            return 1;
        } catch (ex) {
            return 0;
        }
    },
    /**
     * 
     * @param {String} userId 
     * @param {String} artistId
     * @returns {boolean} 
     */
    userFollowArtist: async function(userId, artistId) {
        try {
            if (!checkMonooseObjectID([userId, artistId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            let artist = await Artist.getArtist(artistId);
            if (!user || (!artist)) return 0;
            if (!user.follow) user.follow = [];
            if (!artist.followed) artist.followed = [];
            if (!await this.checkIfUserFollowArtist(userId, artistId)) {
                user.follow.push({ 'id': artistId });
                await user.save();
               
                artist.followed.push({ 'id': userId, 'date': new Date() });
                await artist.save();
            }

            return 1;
        } catch (ex) {
            return 0;
        }
    },
    /**
     * 
     * @param {String} userId 
     * @param {String} artistId
     * @returns {boolean} 
     */
    userUnfollowArtist: async function(userId, artistId) {
        try {
            if (!checkMonooseObjectID([userId, artistId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            let artist = await Artist.getArtist(artistId);
            if (!user || !artist) return 0;
            if (!user.follow) user.follow = [];
            if (!user.follow.length) return 0;
            if (!artist.followed) artist.followed = [];
            if (!await this.checkIfUserFollowArtist(userId, artistId)) return 0;
            for (let i = 0; i < user.follow.length; i++) {
                if (String(user.follow[i].id) == String(artistId)) {
                    user.follow.splice(i, 1);
                    await user.save();
                }
            }
            for (let i = 0; i < artist.followed.length; i++) {
                if (String(artist.followed[i].id) == String(userId)) {
                    artist.followed.splice(i, 1);
                    await artist.save();
                    return 1;
                }
            }
            return 0;
        } catch (ex) {
            return 0;
        }
    },
    /**
     * 
     * @param {String} userId 
     * @param {String} artistId
     * @returns {boolean} 
     */
    checkIfUserFollowArtist: async function(userId, artistId) {
        try {
            if (!checkMonooseObjectID([userId, artistId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            let artist = await Artist.getArtist(artistId);
            if (!user || (!artist)) return 0;
            if (!user.follow) user.follow = [];
            if (!user.follow.length) return false;
            for (let i = 0; i < user.follow.length; i++) {
                if (String(user.follow[i].id) == String(artistId))
                    return true;

            }
            return false;
        } catch (ex) {
            return -1;
        }
    },
    //check if user email in db
    //params: email


    /** 
     * check if user email in db
     * @param  {string} email - the user email 
     * @returns {Object}
     */
    checkmail: async function(email) {
        try {
            let user = await userDocument.findOne({ email: email });
            if (!user) return false;
            return user;
        } catch (ex) {
            return 0;
        }
    },
    confirmEmail: async function(user) {
        try {
            if (!user.confirm) user.confirm = true;

            await user.save();
            return true;
        } catch (ex) {
            return 0;
        }
    },
    confirmPremium: async function(user) {
        try {
            if (!user.premiumConfirm) user.premiumConfirm = true;
            user.product = 'premium';
            await user.save();
            return true;
        } catch (ex) {
            return 0;
        }
    },
    confirmUpdate: async function(user) {
        try {
            if (!user.updateConfirm) user.updateConfirm = false;
            if(user.updateConfirm==true)return true;
            if (user.updatedInfo.gender != undefined && user.updatedInfo.gender!=null) {
                user.gender = user.updatedInfo.gender;
            }

            if (user.updatedInfo.birthDate != undefined && user.updatedInfo.birthDate != null) {
                user.birthDate = user.updatedInfo.birthDate;
            }

            if (user.updatedInfo.displayName != undefined && user.updatedInfo.displayName !=null) {
                user.displayName = user.updatedInfo.displayName;
            }

            if (user.updatedInfo.password !=undefined && user.updatedInfo.password !=null) {
                user.password = user.updatedInfo.password;
            }

            if (user.updatedInfo.email != undefined && user.updatedInfo.email !=null) {
                user.email = user.updatedInfo.email;
            }

            if (user.updatedInfo.country != undefined && user.updatedInfo.country !=null) {
                user.country = user.updatedInfo.country;
            }

        if (user.product == 'premium') {
            if (user.updatedInfo.expiresDate !=undefined && user.updatedInfo.expiresDate !=null) user.premium['expiresDate'] = user.updatedInfo.expiresDate;
            if (user.updatedInfo.cardNumber !=undefined && user.updatedInfo.cardNumber !=null) user.premium['cardNumber'] = user.updatedInfo.cardNumber;
            if (user.updatedInfo.isMonth != undefined && user.updatedInfo.isMonth !=null) user.premium['isMonth'] = user.updatedInfo.isMonth;
        }
        user.updatedInfo={
            email:null,
            password:null,
            country:null,
            displayName:null,
            expiresDate: null,
            cardNumber: null,
            isMonth: null,
            gender:null,
            birthDate:null
        }
        user.updateConfirm=true;
            await user.save();
            return true;
        } catch (ex) {
            return 0;
        }
    },
    //user forget password
    //params: user
    /** 
     * update user forgotten password
     * @param  {Object} user - the user 
     * @returns {string}
     */
    updateforgottenpassword: async function(user, pass) {
        try {
            let password = pass;
            const salt = await bcrypt.genSalt(10);
            let hashed = await bcrypt.hash(password, salt);
            user.password = hashed;
            await user.save();
            return password;
        } catch (ex) {
            return 0;
        }

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
        try {
            if (!checkMonooseObjectID([userId, playlistId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) return 0;
            return await Playlist.followPlaylits(user, playlistId, isprivate);
        } catch (ex) {
            return 0;
        }

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
        try {
            if (!checkMonooseObjectID([userId, playlistId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) return 0;
            return await Playlist.unfollowPlaylist(user, playlistId);
        } catch (ex) {
            return 0;
        }
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
        try {
            if (!checkMonooseObjectID([userId, playlistId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) return 0;
            const isDelete = await Playlist.deletePlaylist(user, playlistId);
            if (!isDelete) return 0;
            if (!user.deletedPlaylists) user.deletedPlaylists = [];
            user.deletedPlaylists.push({ id: playlistId, date: Date.now() });
            await user.save();
            spotifyUser = await this.checkmail(String(process.env.SPOTIFY_EMAIL));
            if (!spotifyUser)
                spotifyUser = await this.createUser('Spotify', String(process.env.SPOTIFY_PASSWORD_IN_APP), String(process.env.SPOTIFY_EMAIL), 'All', Date.now());
            if (!spotifyUser) return 0;
            await playlistDocument.updateOne({ _id: playlistId }, {
                ownerId: spotifyUser._id
            });
            return await this.addPlaylistToCreatedToUser(spotifyUser, playlistId);
        } catch (ex) {
            return 0;
        }
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
        try {
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
                premiumConfirm: false,
                isFacebook: false,
                images: [],
                follow: [],
                createPlaylist: [],
                saveAlbum: [],
                playHistory: [],
                player: {},
                recentlySearch: [],
                followers: [],
                following: []
            });
            user.player["isShuffled"] = false;
            user.player["isPlaying"] = false;
            user.player["volume"] = 4;
            user.player["isRepeat"] = false;
            user.player['currentTimeStampe'] = 0;
            user.player['isRepeatTrack'] = false;
            await user.save();
            return user;
        } catch (ex) {
            return 0;
        }
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
        try {
            if (!checkMonooseObjectID([userId, playlistId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) return 0;
            const playlist = await Playlist.getPlaylistWithTracks(playlistId, snapshot, user);
            if (!playlist[0]) return 0;
            const owner = await this.getUserById(playlist[0].ownerId);
            playlist.push({ ownerName: owner ? owner.displayName : undefined });
            return playlist;
        } catch (ex) {
            return 0;
        }
    },


    //user create playlist
    //params: userId, playlistName, Description

    /** 
     * user create playlist
     * @param  {string} userId - the user Id
     * @param  {string} playlistName - the name of the new playlist
     * @param  {string} description - the Description of the new playlist if given
     * @returns {Object}
     */
    createdPlaylist: async function(userId, playlistName, description) {
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            // create new playlist
            if (!user) return 0;
            const createdPlaylist = await Playlist.createPlaylist(userId, playlistName, description);
            //add to user 
            if (!createdPlaylist) return 0;
            const addToUser = await this.addPlaylistToCreatedToUser(user, createdPlaylist._id);
            if (!addToUser) return 0;
            return createdPlaylist;
        } catch (ex) {
            return 0;
        }
    },
    /**
     *  make this user who create this playlist
     * @param {object} user  -user object
     * @param {string} playlistId  - the id of playlist
     * @returns {boolean}
     */
    addPlaylistToCreatedToUser: async function(user, playlistId) {
        try {
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
        } catch (ex) {
            return 0;
        }
    },
    /**
     * 
     * @param {string} userId 
     * @param {Array<String>} playlistsIds
     * @returns {object} 
     */
    restorePlaylists: async function(userId, playlistsIds) {
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
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
        } catch (ex) {
            return 0;
        }
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
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
            let users = await userDocument.find({});
            if (!users) return 0;
            let createdUser;
            let playlistIndex;
            let found = false;
            let playlist = await Playlist.getPlaylist(playlistId);
            createdUser = await this.getUserById(playlist.ownerId);
            if (!createdUser) { return false; }
            if (String(createdUser._id) == String(userId)) return true;
            else {
                for (var i = 0; i < createdUser.createPlaylist.length; i++) {
                    if (String(createdUser.createPlaylist[i].playListId) == String(playlistId)) {
                        playlistIndex = i;
                        break;
                    }
                }
                for (var i = 0; i < createdUser.createPlaylist[playlistIndex].collaboratorsId.length; i++) {
                    if (String(createdUser.createPlaylist[playlistIndex].collaboratorsId[i]) == String(userId)) {
                        return true;
                    }
                }
            }
            return false;
        } catch (ex) {
            return 0;
        }
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
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
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
        } catch (ex) {
            return 0;
        }

    },
    /**
     * promote user To Premium
     * @param {string} userId  -the id of user
     * @returns {boolean} - if can or not  
     */
    promoteToPremium: async function(userId, cardNumber, isMonth, expiresDate) {
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
            user = await this.getUserById(userId);
            if (!user) return false;
            if (user.product == 'premium') {
                return false;
            }
            user.premium['expiresDate'] = expiresDate;
            user.premium['cardNumber'] = cardNumber;
            user.premium['isMonth'] = isMonth;
            user.premium['ParticipateDate'] = Date.now();
            await user.save();
            return true;
        } catch (ex) {
            return 0;
        }
    },
    // to make user be free
    /**
     * user return to free
     * @param {string} userId - id of user
     * @returns {boolean} - if can be free or not  
     */
    promoteToFree: async function(userId) {
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
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
        } catch (ex) {
            return 0;
        }
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
        try {
            if (!checkMonooseObjectID([userId, sourceId, trackId])) return 0;
            const user = await this.getUserById(userId);
            const isCreateQueue = await Player.createQueue(user, isPlaylist, sourceId, trackId);
            return isCreateQueue;
        } catch (ex) {
            return 0;
        }

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
        try {
            if (!checkMonooseObjectID([userId, sourceId, trackId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) return 0;
            const isAddQueue = await Player.addToQueue(user, trackId, isPlaylist, sourceId);
            return isAddQueue;
        } catch (ex) {
            return 0;
        }
    },

    //update user's player
    //params: userId, isPlaylist, sourceId, trackId
    /** 
     * update user's player
     * @param  {string} userId - the user Id
     * @param  {Boolean} isPlaylist - the status of the source of the track (playlist or not)
     * @param  {string} sourceId - the id of the source of the track 
     * @param  {string} trackId - the id of the track the user wants to add
     * @param {Array<string>} tracksIds - optional if need to play array of tracks not album and not playlist
     * @param {string} sourceType - optional name to describe the array of ids 
     * @returns {Number}
     */

    updateUserPlayer: async function(userId, isPlaylist, sourceId, trackId, tracksIds, sourceType) {
        try {
            if (!checkMonooseObjectID([userId, trackId])) throw new Error("not mongoose id");
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
        } catch (ex) {
            return 0;
        }
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
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (user)
                return await Player.repreatPlaylist(user, state);
            return 0;
        } catch (ex) {
            return 0;
        }
    },

    //get user's queue
    //params: userId
    /** 
     * get user's queue
     * @param  {string} userId - the user Id
     * @returns {Array<Object>}
     */

    getQueue: async function(userId) {
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) return 0;
            const tracks = await Player.getQueue(user);
            if (!tracks) return 0;
            return tracks;
        } catch (ex) {
            return 0;
        }

    },

    //resume playing
    //params: userId
    /** 
     * resume the user player
     * @param  {string} userId - the user Id
     * @returns {Number}
     */

    resumePlaying: async function(userId) {
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) return 0;
            const player = await Player.resumePlaying(user);
            if (!player) return 0;
            return 1;
        } catch (ex) {
            return 0;
        }

    },

    //pause playing
    //params: userId
    /** 
     * pause the user player
     * @param  {string} userId - the user Id
     * @returns {Number}
     */

    pausePlaying: async function(userId) {
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) return 0;
            const player = await Player.pausePlaying(user);
            if (!player) return 0;
            return 1;
        } catch (ex) {
            return 0;
        }
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
        try {
            if (!checkMonooseObjectID([userId])) throw new Error("not mongoose id");
            const user = await this.getUserById(userId);
            if (!user) return 0;
            const isShuffle = await Player.setShuffle(state, user);
            if (!isShuffle) return 0;
            return 1;
        } catch (ex) {
            return 0;
        }
    },
    /**
     * 
     * @param {string} userId 
     * @param {string} trackId
     * @returns {boolean} 
     */
    checkAuthorizedTrack: async function(userId, trackId) {
        try {
            const user = await this.getUserById(userId);
            if (!user) return 0;
            // chekc if user is artist
            const artist = await Artist.findMeAsArtist(userId);
            if (!artist) return 0;
            const hasAccess = await Artist.checkArtistHasTrack(artist, trackId);
            return hasAccess;
        } catch (ex) {
            return 0;
        }
    },
    /**
     * 
     * @param {string} userId 
     * @param {string} albumId 
     * @returns {boolean}
     */
    checkAuthorizedAlbum: async function(userId, albumId) {
        try {
            const user = await this.getUserById(userId);
            if (!user) return 0;
            // chekc if user is artist
            const artist = await Artist.findMeAsArtist(userId);
            if (!artist) return 0;
            const hasAccess = await Artist.checkArtisthasAlbum(artist._id, albumId);
            return hasAccess;
        } catch (ex) {
            return 0;
        }
    }

}

module.exports = User;