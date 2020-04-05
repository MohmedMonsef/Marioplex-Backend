const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');


// initialize db 
const mongoose = require('mongoose');

const Track = require('./track-api');
const Album = require('./album-api');
const Artist = require('./artist-api');


const Playlist = {


    // get track by id
    // params : track-id
    getPlaylist: async function(playlistId) {

        // connect to db and find track with the same id then return it as json file
        // if found return playlist else return 0
        const playlist = await playlistDocument.findById(playlistId, (err, playlist) => {
            if (err) return 0;
            return playlist;
        }).catch((err) => 0);
        return playlist;

    },

    getPopularPlaylists: async function() {
        // with - is from big to small and without is from small to big
        var replaylists = []
        const playlists = await playlistDocument.find({}).sort('-popularity')
        if (playlists) {
            var limit; // to limit the num of playlists by frist 20 only but should check if num of albums less than 10  
            if (playlists.length < 20) limit = playlists.length;
            else limit = 20;
            for (let i = 0; i < limit; i++) {
                const user1 = await userDocument.findById(playlists[i].ownerId);
                replaylists.push({ owner: { id: playlists[i].ownerId, type: "user", name: user1.displayName }, collaborative: playlists[i].collaborative, type: 'playlist', name: playlists[i].name, images: playlists[i].images, id: playlists[i]._id, Description: playlists[i].Description, isPublic: playlists[i].isPublic });
            }
        }
        const replaylistsJson = { playlists: replaylists };
        return replaylistsJson;
    },
    //for routes
    getPlaylistWithTracks: async function(playlistId, snapshotID, user) {
        const playlist = await this.getPlaylist(playlistId);
        if (playlist.isPublic || this.checkIfUserHasPlaylist(user, playlistId) || this.checkFollowPlaylistByUser(user, playlistId)) {
            var playlistJson = [];
            var tracks = [];
            let snapshot;
            let found = false;
            for (let i = 0; i < playlist.snapshot.length; i++) {
                if (playlist.snapshot[i]._id == snapshotID) {
                    snapshot = i;
                    found = true;
                }
            }
            if (!found) { snapshot = playlist.snapshot.length - 1; }
            if (playlist.snapshot[snapshot] != undefined) {
                for (let i = 0; i < playlist.snapshot[snapshot].hasTracks.length; i++) {
                    const track1 = await Track.getTrack(playlist.snapshot[snapshot].hasTracks[i]);
                    //console.log(track1);
                    const artistId = track1.artistId;
                    const albumId = track1.albumId;
                    const album = await Album.getAlbumById(albumId);
                    const artist = await Artist.getArtist(artistId);
                    if (!album || !artist) { return 0; }
                    const isLiked = await Track.checkIfUserLikeTrack(user, track1.id) ? true : false;
                    tracks.push({ trackid: track1.id, name: track1.name, artistId: artistId, artistName: artist.Name, albumId: albumId, albumName: album.name,isLiked:isLiked });
                }
            }
            playlistJson.push({ id: playlist._id, type: playlist.type, name: playlist.name, ownerId: playlist.ownerId, collaborative: playlist.collaborative, isPublic: playlist.isPublic, images: playlist.images, tracks: tracks });
            return playlistJson;
        }
        return 0;
    },



    checkIfUserHasPlaylist: function(user, playlistID) {

        const userPlaylists = user.createPlaylist;

        if (userPlaylists) {
            return userPlaylists.find(playlist => playlist.playListId == playlistID);
        }
        return 0;
    },

    // create playlist by playlist_name
    // params : playlist name user 
    createPlaylist: async function(userid, Name, description) {
        let desc = (description == undefined) ? "" : description;
        const Playlist = new playlistDocument({
            _id: mongoose.Types.ObjectId(),
            type: "playlist",
            Description: desc,
            collaborative: false,
            name: Name,
            isPublic: true,
            ownerId: userid,
            images: [],
            snapshot: []
        })

        await Playlist.save();
        return Playlist;
    },
    findIndexOfTrackInPlaylist: async function(trackId, tplaylist) {
        for (let i = 0; i < tplaylist.hasTracks.length; i++) {
            if (tplaylist.hasTracks[i].trackId == trackId)
                return i;
        }
        return -1
    },
    //to delete playlist

    deletePlaylist: async function(user, playlistId) {
        const playlist = await Playlist.getPlaylist(playlistId);
        if (playlist) {
            const userHasPlaylist = await Playlist.checkIfUserHasPlaylist(user, playlistId);
            if (userHasPlaylist) {
                // connect to db and find play with the same id then return it as json file
                for (let i = 0; i < user.createPlaylist.length; i++) {

                    if (user.createPlaylist[i].playListId == playlistId) {

                        user.createPlaylist.splice(i, 1);
                        await user.save();
                    }
                }
                return await this.unfollowPlaylist(user, playlistId);

            }
        } else return 0;
    },

    //follow playlist
    checkFollowPlaylistByUser: function(user, playlistID) {

        const followedplaylists = user.followPlaylist;

        if (followedplaylists) {
            const followed = followedplaylists.find(playlist => playlist.playListId == playlistID);

            return followed
        }
        return 0;
    },
    //user follow playlist by playlist-id
    //params : user , playlist-id

    followPlaylits: async function(user, playlistID, isPrivate) {
        let check = await this.getPlaylist(playlistID);
        if (!check) { return 0; }
        const followedBefore = this.checkFollowPlaylistByUser(user, playlistID)
        if (followedBefore) {
            return 0;
        }

        if (!isPrivate || isPrivate == 'false') {
            isPrivate = false;
        } else
            isPrivate = true;
        if (user.followPlaylist) {
            user.followPlaylist.push({
                playListId: playlistID,
                isPrivate: isPrivate

            });
            await user.save();
            return 1;
        }
        user.followPlaylist = [];
        user.followPlaylist.push({

            playListId: playlistID,
            isPrivate: isPrivate
        });
        await user.save().catch();
        return 1;
    },

    unfollowPlaylist: async function(user, playlistID) {
        let check = await this.getPlaylist(playlistID);
        if (!check) { return 0; }
        const followedBefore = this.checkFollowPlaylistByUser(user, playlistID)

        if (!followedBefore) {

            return 0;
        }
        if (user.followPlaylist) {

            for (let i = 0; i < user.followPlaylist.length; i++) {

                if (user.followPlaylist[i].playListId == playlistID) {

                    user.followPlaylist.splice(i, 1);
                    await user.save();
                    return 1;
                }
            }
        }
        return 0;
    },
    addTrackToPlaylist: async function(playlistID, tracksIds) {

        if (!tracksIds || tracksIds.length == 0) return 0;
        let playlist = await this.getPlaylist(playlistID);
        if (!playlist) return 0;
        //console.log(playlist);
        let len = playlist.snapshot.length;
        let tracks = [];
        if (len) {
            for (let i = 0; i < playlist.snapshot[len - 1].hasTracks.length; i++) {
                tracks.push(playlist.snapshot[len - 1].hasTracks[i]);
            }
        }
        for (let i = 0; i < tracksIds.length; i++) {
            // check if trackid is valid mongoose object id
            if (!mongoose.Types.ObjectId.isValid(tracksIds[i])) return 0;
            tracks.push(tracksIds[i]);
        }
        let uniquetracks = await this.removeDups(tracks);
        //console.log(uniquetracks);
        playlist.snapshot.push({
            hasTracks: uniquetracks,
            action: 'Add Tracks'
        });
        await playlist.save();
        return playlist;
    },
    removeDups: async function(tracks) {
        let unique = {};
        tracks.forEach(function(i) {
            if (!unique[i]) {
                unique[i] = true;
            }
        });
        return Object.keys(unique);
    },
    updatePlaylistDetails: async function(playlistId, details) {

        let playlist = await this.getPlaylist(playlistId);
        if (!playlist) return 0;
        await playlistDocument.updateOne({ _id: playlistId }, details);
        playlist = await this.getPlaylist(playlistId);
        return playlist;
    },
    getUserPlaylists: async function(userId, limit, offset, isuser) {
        let user = await userDocument.findById(userId);
        if (!user) return 0;
        let playlistsIds = [];
        let playlists = [];
        for (var i = 0; i < user.followPlaylist.length; i++) {
            if (isuser) {
                playlistsIds.push(user.followPlaylist[i].playListId);
            } else {
                if (!user.followPlaylist[i].isPrivate) {
                    playlistsIds.push(user.followPlaylist[i].playListId);
                }
            }
        }
        for (var i = 0; i < playlistsIds.length; i++) {
            let playlist = await this.getPlaylist(playlistsIds[i]);
            let owner = await userDocument.findById(playlist.ownerId);
            playlists.push({ id: playlist._id, name: playlist.name, ownerId: playlist.ownerId, owner: owner.displayName, collaborative: playlist.collaborative, isPublic: playlist.isPublic, images: playlist.images });
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
        }
        playlists.slice(start, end);
        return playlists;
    },
    changeCollaboration: async function(user, playlistID) {
        let playlist = await playlistDocument.findById(playlistID);
        if (!playlist) return false;
        playlist.collaborative = !playlist.collaborative;
        //console.log(user);
        if (playlist.collaborative) {
            playlist.isPublic = false;
            for (var i = 0; i < user.createPlaylist.length; i++) {
                if (user.createPlaylist[i].playListId == playlistID) {
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
    changePublic: async function(user, playlistID) {
        let playlist = await playlistDocument.findById(playlistID);
        if (!playlist) return false;
        if (playlist.collaborative) { return false; }
        playlist.isPublic = !playlist.isPublic;

        for (var i = 0; i < user.createPlaylist.length; i++) {
            if (user.createPlaylist[i].playListId == playlistID) {
                user.createPlaylist[i].isPrivate = !user.createPlaylist[i].isPrivate;
                await user.save();
                await playlist.save();
                return true;
            }
        }

        for (var i = 0; i < user.followPlaylist.length; i++) {
            if (user.followPlaylist[i].playListId == playlistID) {
                user.followPlaylist[i].isPrivate = !user.followPlaylist[i].isPrivate;
                await user.save();
                await playlist.save();
                return true;
            }
        }
        return false;

    },
    getPlaylistTracks: async function(playlistID) {
        let playlist = await playlistDocument.findById(playlistID);
        if (!playlist) return 0;
        let tracks = [];
        let len = playlist.snapshot.length;
        if (len == 0) { return 0; }
        for (var i = 0; i < playlist.snapshot[len - 1].hasTracks.length; i++) {
            let track = await Track.getTrack(playlist.snapshot[len - 1].hasTracks[i]);
            if (track) {
                tracks.push(track);
            }
        }
        return tracks;

    },

    removePlaylistTracks: async function(playlistID, tracksids, snapshotid) {
        let playlist = await playlistDocument.findById(playlistID);
        if (!playlist) return 0;
        let tracks = [];
        let len = playlist.snapshot.length;
        if (len == 0) { return 0; }
        let found = false;
        if (snapshotid != undefined) {
            for (var i = 0; i < playlist.snapshot.length; i++) {
                if (playlist.snapshot[i]._id == snapshotid) {
                    len = i + 1;
                    found = true;
                    break;
                }
            }
            if (!found) { return 0; }
        }
        for (var i = 0; i < playlist.snapshot[len - 1].hasTracks.length; i++) {
            let track = await Track.getTrack(playlist.snapshot[len - 1].hasTracks[i]);
            if (track) {
                tracks.push(track);
            }
        }
        for (var i = 0; i < tracksids.length; i++) {
            for (var j = 0; j < tracks.length; j++) {
                if (tracksids[i] == tracks[j]._id) {
                    tracks.splice(j, 1);
                    //consle.log(tracks);
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
    reorderPlaylistTracks: async function(playlistID, snapshotid, start, length, before) {
        let playlist = await playlistDocument.findById(playlistID);
        if (!playlist) return 0;
        let tracks = [];
        let len = playlist.snapshot.length;
        if (len == 0) { return 0; }
        let found = false;
        if (snapshotid != undefined) {
            for (var i = 0; i < playlist.snapshot.length; i++) {
                if (playlist.snapshot[i]._id == snapshotid) {
                    len = i + 1;
                    found = true;
                    break;
                }
            }
            if (!found) { return 0; }
        }
        //console.log(found);
        for (var i = 0; i < playlist.snapshot[len - 1].hasTracks.length; i++) {
            // to check track still exist in DB
            let track = await Track.getTrack(playlist.snapshot[len - 1].hasTracks[i]);
            if (track) {
                tracks.push(track._id);
            }
        }
        let orderedtracks = [];
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
            orderedtracks.push(tracks[i]);
        }
        //console.log(stindex,endindex,tracks,orderedtracks);
        // remove tracks in this range from tracks in snashot
        tracks.splice(stindex, endindex - stindex + 1);
        //console.log(tracks);
        // add those tracks before the inserted before index
        if (before != 0) tracks.splice(before, 0, ...orderedtracks);
        else tracks.unshift(...orderedtracks);
        playlist.snapshot.push({
            hasTracks: tracks,
            action: 'reorder Tracks'
        });
        await playlist.save();
        return playlist;

    },
}



module.exports = Playlist;