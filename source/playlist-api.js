const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');


const mongoose = require('mongoose');
const Track = require('./track-api');
const Album = require('./album-api');
const Artist = require('./artist-api');
const checkMonooseObjectId = require('../validation/mongoose-objectid')
    /** @namespace */
const Playlist = {

    /**
     * get a playlist by id
     * @param {string} playlistId - playlist id
     * @returns {Object|0} - playlist object
     */
    getPlaylist: async function(playlistId) {
        if (!checkMonooseObjectId([playlistId])) return 0;
        const playlist = await playlistDocument.findById(playlistId, (err, playlist) => {
            if (err) return 0;
            return playlist;
        }).catch((err) => 0);
        return playlist;

    },
    /**
     * get popular playlists
     * @returns {array<object>} - array of playlists' object
     */
    getPopularPlaylists: async function() {
        // with - is from big to small and without is from small to big
        var rePlaylists = []
        const playlists = await playlistDocument.find({ isPublic: true }).sort('-popularity').limit(Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20);
        if (playlists) {
            var limit; // to limit the num of playlists by frist 20 only but should check if num of albums less than 10  
            if (playlists.length < Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20) limit = playlists.length;
            else limit = Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;
            for (let i = 0; i < limit; i++) {
                //need to correct in find 
                //  if (playlists[i].isPublic) {
                const user1 = await userDocument.findById(playlists[i].ownerId);
                rePlaylists.push({
                    owner: {
                        id: playlists[i].ownerId,
                        type: 'user',
                        name: user1.displayName
                    },
                    collaborative: playlists[i].collaborative,
                    type: 'playlist',
                    name: playlists[i].name,
                    images: playlists[i].images,
                    id: playlists[i]._id,
                    Description: playlists[i].Description,
                    isPublic: playlists[i].isPublic,
                    popularity: playlists[i]['popularity']
                });
            }

        }
        const replaylistsJson = { playlists: rePlaylists };
        return replaylistsJson;
    },
    /**
     * get playlist with tracks
     * @param {string} playlistId - playlist id
     * @param {string} snapshotId
     * @param {Object} user -user object
     * @returns {array<object>|0} - array of objects of a playlist and it's tracks
     */
    //for routes
    getPlaylistWithTracks: async function(playlistId, snapshotId, user) {
        if (!user) return 0;
        if (!checkMonooseObjectId([playlistId])) return 0;
        const playlist = await this.getPlaylist(playlistId);
        if (!playlist) return 0;
        let checkFollow = await this.checkFollowPlaylistByUser(user, playlistId);
        let checkCreate = await this.checkIfUserHasPlaylist(user, playlistId);
        if (!playlist.snapshot) platlist.snapshot = [];
        if (playlist.isPublic || checkCreate || checkFollow) {
            var playlistJson = [];
            var tracks = [];
            let snapshot;
            let found = false;
            for (let i = 0; i < playlist.snapshot.length; i++) {
                if (String(playlist.snapshot[i]._id) == String(snapshotId)) {
                    snapshot = i;
                    found = true;
                }
            }
            if (!found) { snapshot = playlist.snapshot.length - 1; }
            if (playlist.snapshot[snapshot] != undefined) {
                if (!playlist.snapshot[snapshot].hasTracks) playlist.snapshot[snapshot].hasTracks = [];
                for (let i = 0; i < playlist.snapshot[snapshot].hasTracks.length; i++) {

                    const track1 = await Track.getTrack(playlist.snapshot[snapshot].hasTracks[i], user);
                    const artistId = track1.artistId;
                    const albumId = track1.albumId;
                    const album = await Album.getAlbumById(albumId);
                    const artist = await Artist.getArtist(artistId);
                    if (!album || !artist) { return 0; }
                    const isLiked = await Track.checkIfUserLikeTrack(user, track1._id) ? true : false;
                    tracks.push({ trackid: track1._id, name: track1.name, playable: track1.playable, artistId: artistId, artistName: artist.Name, albumId: albumId, albumName: album.name, isLiked: isLiked, duration: track1.duration, images: track1.images });
                }
            }
            const followPlaylist = await this.checkFollowPlaylistByUser(user, playlistId) ? true : false;
            let checkType;
            let created = await this.checkIfUserHasPlaylist(user, playlistId);
            if (created == undefined || !created) {

                if (followPlaylist == undefined || !followPlaylist) {
                    checkType = "none"
                } else {
                    checkType = "followed"
                }
            } else { checkType = "created" }
            playlistJson.push({ id: playlist._id, type: playlist.type, name: playlist.name, ownerId: playlist.ownerId, collaborative: playlist.collaborative, isPublic: playlist.isPublic, images: playlist.images, tracks: tracks, isfollowed: followPlaylist, checkType: checkType });
            return playlistJson;
        }
        return 0;
    },

    /**
     * check if user has a specific playlist
     * @param {Object} user - user object
     * @param {string} playlistId - playlist id
     * @returns {number|undefined} - the index of playlist id in user's playlists
     */
    checkIfUserHasPlaylist: async function(user, playlistId) {
        if (!user) return 0;
        if (!checkMonooseObjectId([playlistId])) return 0;
        const userPlaylists = user.createPlaylist;

        if (userPlaylists) {
            return await userPlaylists.find(playlist => String(playlist.playListId) == String(playlistId));
        }
        return 0;
    },
    /**
     * create playlist
     * @param {string} userId - user id
     * @param {string} name - playlist name
     * @param {string} [description] - playlist discription
     * @returns {Object} - playlist object
     */
    createPlaylist: async function(userId, name, description) {
        if (!checkMonooseObjectId([userId])) return 0;
        let desc = (description == undefined) ? '' : description;
        const playlist = new playlistDocument({
            _id: mongoose.Types.ObjectId(),
            type: 'playlist',
            Description: desc,
            collaborative: false,
            name: name,
            isPublic: true,
            ownerId: userId,
            images: [],
            snapshot: []
        })

        await playlist.save();
        return playlist;
    },
    /**
     * find index of track in playlist
     * @param {string} trackId - track id 
     * @param {Object} tplaylist - playlist object
     * @returns {number} 
     */
    findIndexOfTrackInPlaylist: async function(trackId, tplaylist) {
        if (!checkMonooseObjectId([trackId])) return 0;
        if(tplaylist.snapshot.length==0)return -1;
        for (let i = 0; i < tplaylist.snapshot[tplaylist.snapshot.length-1].hasTracks.length; i++) {
            if (String(tplaylist.snapshot[tplaylist.snapshot.length-1].hasTracks[i].trackId) == String(trackId))
                return i;
        }
        return -1
    },
    /**
     * delete user's created playlist
     * @param {Object} user - user object
     * @param {string} playlistId - playlist id 
     * @returns {Number} 
     */
    deletePlaylist: async function(user, playlistId) {
        if (!checkMonooseObjectId([playlistId])) return 0;
        const playlist = await Playlist.getPlaylist(playlistId);
        if (!playlist) return 0;
        const userHasPlaylist = await Playlist.checkIfUserHasPlaylist(user, playlistId);
        if (!userHasPlaylist) return 0;
        if (!user.createPlaylist) return 0;
        for (let i = 0; i < user.createPlaylist.length; i++) {
            if (String(user.createPlaylist[i].playListId) == String(playlistId)) {
                user.createPlaylist.splice(i, 1);
                await user.save();
            }
        }
        return await this.unfollowPlaylist(user, playlistId);
    },
    /**
     * check if user follows playlist
     * @param {Object} user - user object
     * @param {string} playlistId - playlist id 
     * @returns {Number} 
     */
    checkFollowPlaylistByUser: async function(user, playlistId) {
        if (!user) return 0;
        if (!checkMonooseObjectId([playlistId])) return 0;
        const followedPlaylists = user.followPlaylist;

        if (followedPlaylists) {
            const followed = await followedPlaylists.find(playlist => String(playlist.playListId) == String(playlistId));

            return followed
        }
        return 0;
    },
    /**
     * user follow playlist
     * @param {Object} user - user object
     * @param {string} playlistId - playlist id 
     * @param {boolean} [isPrivate] - If true the playlist will be included in user’s public playlists, if false it will remain private. 
     * @returns {Number} 
     */
    followPlaylits: async function(user, playlistId, isPrivate) {
        if (!user) return 0;
        if (!checkMonooseObjectId([playlistId])) return 0;
        let check = await this.getPlaylist(playlistId);
        if (!check) { return 0; }
        const followedBefore = await this.checkFollowPlaylistByUser(user, playlistId)
        if (followedBefore) {
            return 0;
        }
        if (!isPrivate || isPrivate == 'false') {
            isPrivate = false;
        } else
            isPrivate = true;
        if (!user.followPlaylist)
            user.followPlaylist = [];
        user.followPlaylist.push({
            playListId: playlistId,
            isPrivate: isPrivate
        });
        await user.save().catch();
        return 1;
    },
    /**
     * user unfollows a playlist
     * @param {Object} user - user object
     * @param {string} playlistId - playlist id 
     * @returns {Number} 
     */
    unfollowPlaylist: async function(user, playlistId) {
        if (!user) return 0;
        if (!checkMonooseObjectId([playlistId])) return 0;
        let check = await this.getPlaylist(playlistId);
        if (!check) return 0;
        const followedBefore = await this.checkFollowPlaylistByUser(user, playlistId)
        if (!followedBefore) return 0;
        if (user.followPlaylist) {
            for (let i = 0; i < user.followPlaylist.length; i++) {
                if (String(user.followPlaylist[i].playListId) == String(playlistId)) {
                    user.followPlaylist.splice(i, 1);
                    await user.save();
                    return 1;
                }
            }
        }
        return 0;
    },
    /**
     * user adds track(s) to a specific playlist
     * @param {string} playlistId - playlist id 
     * @param {array<string>} tracksIds - array of tracks' id
     * @returns {Object|0} - playlist object
     */
    addTrackToPlaylist: async function(playlistId, tracksIds) {
        if (!checkMonooseObjectId([playlistId])) return 0;
        if (!checkMonooseObjectId(tracksIds)) return 0;
        if (!tracksIds) tracksIds = [];
        if (!tracksIds || tracksIds.length == 0) return 0;
        let playlist = await this.getPlaylist(playlistId);
        if (!playlist) return 0;
        if (!playlist.snapshot) playlist.snapshot = [];
        let len = playlist.snapshot.length;
        let tracks = [];
        if (len) {
            if (!playlist.snapshot[len - 1].hasTracks) playlist.snapshot[len - 1].hasTracks = [];
            for (let i = 0; i < playlist.snapshot[len - 1].hasTracks.length; i++) {
                tracks.push(playlist.snapshot[len - 1].hasTracks[i]);
            }
        }
        for (let i = 0; i < tracksIds.length; i++) {
            // check if trackid is valid mongoose object id
            if (!mongoose.Types.ObjectId.isValid(tracksIds[i])) return 0;
            track = await Track.getTrack(tracksIds[i]);
            if (track)
                tracks.push(tracksIds[i]);
        }
        let uniquetracks = await this.removeDups(tracks);
        playlist.snapshot.push({
            hasTracks: uniquetracks,
            action: 'Add Tracks'
        });
        await playlist.save();
        return playlist;
    },

    removeDups: async function(tracks) {
        if (!tracks) tracks = [];
        let unique = {};
        tracks.forEach(function(i) {
            if (!unique[i]) {
                unique[i] = true;
            }
        });
        return Object.keys(unique);
    },
    /**
     * user updates playlist details
     * @param {string} playlistId - playlist id 
     * @param {Object} details - object of the data to be updated
     * @returns {Object|0} - playlist object
     */
    updatePlaylistDetails: async function(playlistId, details) {
        if (!checkMonooseObjectId([playlistId])) return 0;
        let playlist = await this.getPlaylist(playlistId);
        if (!playlist) return 0;
        await playlistDocument.updateOne({ _id: playlistId }, details);
        playlist = await this.getPlaylist(playlistId);
        return playlist;
    },
    /**
     * get playlists of a user
     * @param {string} userId - user id 
     * @param {number} [limit] - the maximum number of objects to return
     * @param {number} [offset] - the index of the first object to return
     * @param {boolean} isUser - if the user is the owner of the playlist
     * @returns {array<object>|0} - array of playlists' object
     */
    getUserPlaylists: async function(userId, limit, offset, isUser) {
        if (!checkMonooseObjectId([userId])) return [];
        let user = await userDocument.findById(userId);
        if (!user) return [];
        let playlistsIds = [];
        let playlists = [];
        if (!user.followPlaylist) return [];
        for (var i = 0; i < user.followPlaylist.length; i++) {
            if (isUser) {
                playlistsIds.push(user.followPlaylist[i].playListId);
            } else {
                if (!user.followPlaylist[i].isPrivate) {
                    playlistsIds.push(user.followPlaylist[i].playListId);
                }
            }
        }
        for (var i = 0; i < playlistsIds.length; i++) {
            let playlist = await this.getPlaylist(playlistsIds[i]);
            if (!playlist) continue;
            let owner = await userDocument.findById(playlist.ownerId);
            if (!owner) continue;

            if (isUser) {
                let checkType;
                let created = await this.checkIfUserHasPlaylist(user, playlist._id);
                if (created == undefined || !created) {
                    checkType = "followed"
                } else { checkType = "created" }
                playlists.push({ id: playlist._id, name: playlist.name, ownerId: playlist.ownerId, owner: owner.displayName, collaborative: playlist.collaborative, isPublic: playlist.isPublic, images: playlist.images, type: checkType });

            } else {
                playlists.push({ id: playlist._id, name: playlist.name, ownerId: playlist.ownerId, owner: owner.displayName, collaborative: playlist.collaborative, isPublic: playlist.isPublic, images: playlist.images });
            }
        }

        let start = 0;
        let end = playlists.length;
        if (offset != undefined) {
            if (offset >= 0 && offset <= playlists.length) {
                start = offset;
            }
        }
        if (limit != undefined) {
            if ((start + limit) > 0 && (start + limit) <= playlists.length) {
                end = start + limit;
            }
        } else {
            limit = Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;
            if ((start + limit) > 0 && (start + limit) <= playlists.length) {
                end = start + limit;
            }
        }
        return playlists.slice(start, end);
    },
    /**
     * user toggles collaboration
     * @param {Object} user - user object
     * @param {string} playlistId - playlist id
     * @returns {boolean} 
     */
    changeCollaboration: async function(user, playlistId) {
        if (!checkMonooseObjectId([playlistId])) return 0;
        let playlist = await playlistDocument.findById(playlistId);
        if (!playlist) return false;
        if (!user) return 0;
        if (!user.createPlaylist) return 0;
        playlist.collaborative = !playlist.collaborative;
        if (playlist.collaborative) {
            playlist.isPublic = false;
            for (var i = 0; i < user.createPlaylist.length; i++) {
                if (String(user.createPlaylist[i].playListId) == String(playlistId)) {
                    user.createPlaylist[i].isPrivate = true;
                    await user.save();
                    await playlist.save();
                    return true;
                }
            }
        }
        await playlist.save();
        return true;
    },
    /**
     * user toggles public status
     * @param {Object} user - user object
     * @param {string} playlistId - playlist id
     * @returns {boolean} 
     */
    changePublic: async function(user, playlistId) {
        if (!checkMonooseObjectId([playlistId])) return 0;
        if (!user) return 0;
        let playlist = await playlistDocument.findById(playlistId);
        if (!playlist) return false;
        if (playlist.collaborative) { return false; }
        playlist.isPublic = !playlist.isPublic;
        if (!user.createPlaylist) return 0;
        for (var i = 0; i < user.createPlaylist.length; i++) {
            if (String(user.createPlaylist[i].playListId) == String(playlistId)) {
                user.createPlaylist[i].isPrivate = !user.createPlaylist[i].isPrivate;
                await user.save();
                await playlist.save();

                return true;
            }
        }
        if (!user.followPlaylist) return 0;
        for (var i = 0; i < user.followPlaylist.length; i++) {
            if (String(user.followPlaylist[i].playListId) == String(playlistId)) {
                user.followPlaylist[i].isPrivate = !user.followPlaylist[i].isPrivate;
                await user.save();
                await playlist.save();
                return true;
            }
        }
        return false;
    },
    /**
     * get playlist tracks (WITHOUT DETAILS OF THESE TRACKS)
     * @param {string} playlistId - playlist id
     * @param {Boolean} isLike - if it's the liked tracks playlist
     * @returns {array<object>|0} -array of tracks' object 
     */
    getPlaylistTracks: async function(playlistId, isLike) {
        if (!checkMonooseObjectId([playlistId])) return 0;
        let playlist = await playlistDocument.findById(playlistId);
        if (!playlist) return 0;
        if (!playlist.isPublic && !isLike) return 0;
        let tracks = [];
        let playlistJson = [];
        if (!playlist.snapshot) playlist.snapshot = [];

        let len = playlist.snapshot.length;
        if (len == 0) { return 0; }
        if (!playlist.snapshot[len - 1].hasTracks) playlist.snapshot[len - 1].hasTracks = [];
        for (var i = 0; i < playlist.snapshot[len - 1].hasTracks.length; i++) {
            const track1 = await Track.getTrack(playlist.snapshot[len - 1].hasTracks[i]);
            const artistId = track1.artistId;
            const albumId = track1.albumId;
            const album = await Album.getAlbumById(albumId);
            const artist = await Artist.getArtist(artistId);
            if (!album || !artist) { return 0; }
            tracks.push({ trackid: track1._id, name: track1.name, artistId: artistId, artistName: artist.Name, albumId: albumId, albumName: album.name, duration: track1.duration, images: track1.images });
        }
        let owner=await userDocument.findById(playlist.ownerId);
        userName=owner.displayName;
        playlistJson.push({ id: playlist._id, type: playlist.type, name: playlist.name,ownerName:userName, ownerId: playlist.ownerId, collaborative: playlist.collaborative, isPublic: playlist.isPublic, images: playlist.images, tracks: tracks });
        return playlistJson;

    },
    /**
     * remove tracks from a given playlist
     * @param {string} playlistId - playlist id
     * @param {array<string>} tracksIds -array of tracks' id
     * @param {string} snapshotId - snapshot id
     * @returns {array<object>|0} -array of tracks' object 
     */
    removePlaylistTracks: async function(playlistId, tracksIds, snapshotId) {
        if (!checkMonooseObjectId([playlistId])) return 0;
        if (!checkMonooseObjectId(tracksIds)) return 0;
        let playlist = await playlistDocument.findById(playlistId);
        if (!playlist) return 0;
        let tracks = [];
        if (!playlist.snapshot) return 0;
        let len = playlist.snapshot.length;
        if (len == 0) return 0;
        let found = false;
        if (snapshotId != undefined) {
            for (var i = 0; i < playlist.snapshot.length; i++) {
                if (String(playlist.snapshot[i]._id) == String(snapshotId)) {
                    len = i + 1;
                    found = true;
                    break;
                }
            }
            if (!found) return 0;
        }
        if (!playlist.snapshot[len - 1].hasTracks) return 0;
        for (var i = 0; i < playlist.snapshot[len - 1].hasTracks.length; i++) {
            let track = await Track.getTrack(playlist.snapshot[len - 1].hasTracks[i]);
            if (track) {
                tracks.push(track);
            }
        }
        for (var i = 0; i < tracksIds.length; i++) {
            for (var j = 0; j < tracks.length; j++) {
                if (String(tracksIds[i]) == String(tracks[j]._id)) {
                    tracks.splice(j, 1);
                }
            }
        }
        playlist.snapshot.push({
            hasTracks: tracks,
            action: 'remove Tracks'
        });
        await playlist.save();
        return playlist;

    },
    /**
     * reorder tracks in a playlist
     * @param {string} playlistId - playlist id
     * @param {string} snapshotId - snapshot id
     * @param {number} start 
     * @param {number} length
     * @param {number} before 
     * @returns {Object|0} -playlist object
     */
    reorderPlaylistTracks: async function(playlistId, snapshotId, start, length, before) {
        if (!checkMonooseObjectId([playlistId])) return 0;
        let playlist = await playlistDocument.findById(playlistId);
        if (!playlist) return 0;
        let tracks = [];
        if (!playlist.snapshot) return 0;
        let len = playlist.snapshot.length;
        if (len == 0) return 0;
        let found = false;
        if (snapshotId != undefined) {
            for (var i = 0; i < playlist.snapshot.length; i++) {
                if (String(playlist.snapshot[i]._id) == String(snapshotId)) {
                    len = i + 1;
                    found = true;
                    break;
                }
            }
            if (!found) return 0;
        }
        if (!playlist.snapshot[len - 1].hasTracks) playlist.snapshot[len - 1].hasTracks = [];
        for (var i = 0; i < playlist.snapshot[len - 1].hasTracks.length; i++) {
            // to check track still exist in DB
            let track = await Track.getTrack(playlist.snapshot[len - 1].hasTracks[i]);
            if (track) {
                tracks.push(track._id);
            }
        }
        let orderedTracks = [];
        // check start is in range
        start--;
        let stindex = Number(start) < 1 ? 0 : Number(start) > tracks.length ? tracks.length - 1 : Number(start);
        // check that lenght in range
        let endindex = (!length) ? Number(stindex + 1) : (stindex + length - 1);
        endindex = endindex > tracks.length - 1 ? tracks.length - 1 : endindex;
        before--;
        before = before < 0 ? 0 : before > tracks.length - 1 ? tracks.length - 1 : before;
        // add tracks in range to order tracks
        for (let i = stindex; i <= endindex; i++) {
            orderedTracks.push(tracks[i]);
        }
        // remove tracks in this range from tracks in snashot
        tracks.splice(stindex, endindex - stindex + 1);
        // add those tracks before the inserted before index
        if (before != 0) tracks.splice(before, 0, ...orderedTracks);
        else tracks.unshift(...orderedTracks);
        playlist.snapshot.push({
            hasTracks: tracks,
            action: 'reorder Tracks'
        });
        await playlist.save();
        return playlist;
    },
    /**
     * get user deleted playlists
     * @param {string} userId
     * @param {number} limit 
     * @returns {Array<Object>} -Array of playlists objects
     */
    getDeletedPlaylists: async function(userId, limit) {
        if (!checkMonooseObjectId([userId])) return [];
        let user = await userDocument.findById(userId);
        if (!user) return [];
        let playlistsIds = [];
        let playlists = [];
        if (!user.deletedPlaylists || user.deletedPlaylists.length == 0) return [];

        for (var i = 0; i < user.deletedPlaylists.length; i++) {
            let playlist = await this.getPlaylist(user.deletedPlaylists[i].id);
            if (!playlist) continue;
            let songsNumber = (playlist.snapshot.length == 0 || !playlist.snapshot) ? 0 : playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length;
            let playlistInfo = user.deletedPlaylists[i];
            playlists.push({ id: playlistInfo.id, name: playlist.name, songsNumber: songsNumber, deletedAt: playlistInfo.date });

        }

        let start = 0;
        let end = playlists.length;
        if (limit != undefined) {
            if ((start + limit) > 0 && (start + limit) <= playlists.length) {
                end = start + limit;
            }
        } else {
            limit = Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;
            if ((start + limit) > 0 && (start + limit) <= playlists.length) {
                end = start + limit;
            }
        }
        return playlists.slice(start, end);
    },
    /**
     * check if playlist has specific tracks
     * @param {string} playlistId
     * @param {Array<string>} tracksId 
     * @returns {Array<Boolean>}
     */
    checkPlaylistHasTracks: async function(playlistId, tracksId) {
        if (!checkMonooseObjectId([playlistId])) return 0;
        if (!checkMonooseObjectId(tracksId)) return 0;
        const playlist = await playlistDocument.findById(playlistId, (err, user) => {
            if (err) return 0;
            return user;
        }).catch((err) => 0);
        if (tracksId.length == 0) return 0;
        if (!playlist.snapshot) return 0;
        if (playlist.snapshot.length == 0) return 0;
        if (playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length == 0) return 0;
        ifFind = [];
        for (let j = 0; j < tracksId.length; j++) {
            for (let i = 0; i < playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length; i++) {
                if (String(tracksId[j]) == String(playlist.snapshot[playlist.snapshot.length - 1].hasTracks[i])) {
                    ifFind.push(true);
                    break;
                }
                if (i == playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length - 1)
                    ifFind.push(false);
            }
        }
        return ifFind;
    },

}



module.exports = Playlist;