const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const Track = require('./track-api');
const Playlist = require('./playlist-api');
// initialize db 
const bcrypt = require('bcrypt');
const Artist = require('./artist-api');
const sendmail = require('../forget-password/sendmail');
const Player = require('./player-api');

const User = {


    getUserById: async function(userId) {
        const user = await userDocument.findById(userId, (err, user) => {
            if (err) return 0;
            return user;
        }).catch((err) => 0);

        return user;
    },

    update: async function(userID, Display_Name, Password, Email, Country) {
        const user = await this.getUserById(userID);
        if (user) {
            if (user.isFacebook) {
                //if from facebok change country only
                if (Country) user.country = Country;
                // console.log(user.country,Country);

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
    me: async function(userID, reqID) {
        const user = await this.getUserById(userID);
        // console.log(user)
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

    deleteAccount: async function(userID) {
        const user = await this.getUserById(userID);
        if (!user) { return 0; }
        const User = await userDocument.find({ follow: { id: user._id } }, (err, User) => {
            if (err) return 0;
            return User;
        });
        // delete user himseld from db
        await userDocument.findByIdAndDelete(userID);
        return User;

    },

    likeTrack: async function(userID, trackID) {
        const user = await this.getUserById(userID);
        if (!user) { return 0; }
        const likeTrack = await Track.likeTrack(user, trackID).catch();
        return likeTrack;
    },

    unlikeTrack: async function(userID, trackID) {
        const user = await this.getUserById(userID);
        if (!user) { return 0; }
        const unlikeTrack = await Track.unlikeTrack(user, trackID);
        return unlikeTrack;
    },
    addTrack: async function(user, trackID, playlistID) {
        const Playlist = await playlist.findById(playlistID);
        const Track = await track.findById(trackID);
        if (!Playlist || !Track) { return 0; }
        if (Playlist.hasTracks) {
            user.hasTracks.push({
                trackId: trackID

            });
            await Playlist.save();
            return 1;

        }
        Playlist.hasTracks = [];
        Playlist.hasTracks.push({
            trackId: trackID

        });
        await Playlist.save();
        return 1;




    },
    AddTrackToPlaylist: async function(userID, trackID, playlistID) {
        const user = await this.getUserById(userID);
        const userplaylist = await user.createPlaylist.find({ playListId: playlistID });
        if (!user || userplaylist) { return 0; }
        const addTrack = await this.addTrack(user, trackID, playlistID);
        return addTrack;
    },
    getUserFollowingArtist: async function(userID) {
        const user = await this.getUserById(userID);
        //console.log(user)

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




    checkmail: async function(email) {

        let user = await userDocument.findOne({ email: email });

        if (!user) {
            return false;
        }
        return user;
    },

    updateforgottenpassword: async function(user) {

        let password = user.displayName + "1234";
        const salt = await bcrypt.genSalt(10);
        let hashed = await bcrypt.hash(password, salt);
        user.password = hashed;
        await user.save();
        return password;

    },




    followPlaylist: async function(userID, playlistID, isprivate) {
        const user = await this.getUserById(userID);
        if (!user) { return 0; }
        return await Playlist.followPlaylits(user, playlistID, isprivate);

    },

    unfollowPlaylist: async function(userID, playlistID) {
        const user = await this.getUserById(userID);
        if (!user) { return 0; }
        return await Playlist.unfollowPlaylist(user, playlistID);
    },

    deletePlaylist: async function(userID, playlistID) {
        const user = await this.getUserById(userID);
        if (!user) { return 0; }

        const isDelete = await Playlist.deletePlaylist(user, playlistID);
        return isDelete;

    },

    getPlaylist: async function(playlistId, snapshot, userId) {
        const user = await this.getUserById(userId);
        const playlist = await Playlist.getPlaylistWithTracks(playlistId, snapshot, user);
        const owner = await this.getUserById(playlist[0].ownerId);
        playlist.push({ ownerName: owner ? owner.displayName : undefined });
        return playlist;
    },

    createdPlaylist: async function(userID, playlistName, Description) {
        const user = await this.getUserById(userID);
        // create new playlist
        const createdPlaylist = await Playlist.createPlaylist(userID, playlistName, Description);
        //add to user 
        if (user.createPlaylist) {
            user.createPlaylist.push({
                playListId: createdPlaylist._id,
                addedAt: Date.now(),
                isPrivate: false
            });

        } else {
            user.createPlaylist = [];
            user.createPlaylist.push({
                playListId: createdPlaylist._id,
                addedAt: Date.now(),
                isPrivate: false
            });
        }
        await user.save().catch();
        await Playlist.followPlaylits(user, createdPlaylist._id, false);
        return createdPlaylist;
    },

    checkmail: async function(email) {

        let user = await userDocument.findOne({ email: email });

        if (!user) {
            return false;
        }
        return user;
    },

    updateforgottenpassword: async function(user) {

        let password = user.displayName + "1234";
        const salt = await bcrypt.genSalt(10);
        let hashed = await bcrypt.hash(password, salt);
        user.password = hashed;
        await user.save();
        return password;

    },
    checkAuthorizedPlaylist: async function(userID, playlistId) {
        let users = await userDocument.find({});
        let createduser;
        let playlistindex;
        let found = false;
        for (let user in users) {
            for (var i = 0; i < users[user].createPlaylist.length; i++) {
                if (users[user].createPlaylist[i].playListId == playlistId) {
                    createduser = users[user];
                    playlistindex = i;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        if (!createduser) { return false; }
        if (createduser._id == userID) { return true; } else {
            for (var i = 0; i < createduser.createPlaylist[playlistindex].collaboratorsId.length; i++) {
                if (createduser.createPlaylist[playlistindex].collaboratorsId[i] == userID) {
                    return true;
                }
            }
        }
        return false;
    },

    promoteToArtist: async function(userID, info, name, genre) {
        user = await this.getUserById(userID);
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
    createQueue: async function(userID, isPlaylist, sourceId, trackId) {
        const user = await this.getUserById(userID);
        const isCreateQueue = await Player.createQueue(user, isPlaylist, sourceId, trackId);
        return isCreateQueue;
    },

    addToQueue: async function(userID, trackId, isPlaylist, sourceId) {
        const user = await this.getUserById(userID);
        const isAddQueue = await Player.addToQueue(user, trackId, isPlaylist, sourceId);
        return isAddQueue;

    },
    updateUserPlayer: async function(userID, isPlaylist, sourceId, trackID) {
        const user = await this.getUserById(userID);
        const queu = await Player.createQueue(user, isPlaylist, sourceId, trackID);
        //console.log(queu);
        if (!queu) return 0;
        const player = await Player.setPlayerInstance(user, isPlaylist, sourceId, trackID);
        if (!player) return 0;
        return 1;
    },
    repreatPlaylist: async function(userID, state) {
        const user = await this.getUserById(userID);
        return await Player.repreatPlaylist(user, state);
    },
    getQueue: async function(userId) {
        const user = await this.getUserById(userId);
        if (!user) return 0;
        const tracks = await Player.getQueue(user);
        if (!tracks) return 0;
        return tracks;
    },
    resumePlaying: async function(userID) {
        const user = await this.getUserById(userID);
        const player = await Player.resumePlaying(user);
        if (!player) return 0;
        return 1;
    },
    pausePlaying: async function(userID) {
        const user = await this.getUserById(userID);
        const player = await Player.pausePlaying(user);
        if (!player) return 0;
    },
    setShuffle: async function(state, userId) {
        const user = await this.getUserById(userId);
        if (!user) return 0;
        const isShuffle = await Player.setShuffle(state, user);
        if (!isShuffle) return 0;
        return 1;
    }

}

module.exports = User;