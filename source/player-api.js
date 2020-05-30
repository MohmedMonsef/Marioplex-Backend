const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const Playlist = require('./playlist-api');
const Album = require('./album-api');
const Track = require('./track-api');
const Artist = require('./artist-api')
const CheckMonooseObjectId = require('../validation/mongoose-objectid')
    /** @namespace */
const Player = {

    /** 
     * update user player object each time he plays new track
     * @param  {Object} user - the user
     * @param  {Boolean} isPlaylist - the source status of the new track (playlist or not)
     * @param  {string} id - the source (playlist or album) ID
     * @param  {string} trackId - the track id
     * @param {Array<String>} tracksIds  - optional array of tracksids 
     * @param {Sting} sourceType - optional name describe this tracks 
     * @returns {Boolean}
     */

    setPlayerInstance: async function(user, isPlaylist, id, trackId, tracksIds, sourceType) {
        try {
            if (!user) return 0;
            if ((!CheckMonooseObjectId([id]) && !CheckMonooseObjectId(tracksIds)) || !CheckMonooseObjectId([trackId])) return 0;
            if (!user.player) user.player = {};

            user.player.nextTrack = {};
            user.player.prevTrack = {};
            user.player.currentTrack = {};
            if (user.queue.tracksInQueue) {
                // get next from the queue directly
                // get next track and prev Track in playlist by checking for id greater than track id
                if (!tracksIds) {
                    user.player.currentTrack['isPlaylist'] = isPlaylist == true || isPlaylist == 'true' ? true : false;
                    user.player.currentTrack['trackId'] = trackId;
                    user.player.currentTrack['playlistId'] = id;
                } else {
                    user.player.currentTrack['isPlaylist'] = false;
                    user.player.currentTrack['trackId'] = trackId;
                    user.player.currentTrack['playlistId'] = undefined;
                }
                await userDocument.updateOne({ _id: user._id }, { player: user.player });

                return await this.setNextPrev(user, trackId);
            }
            return 0;
        } catch (ex) {
            return 0;
        }
    },

    /** 
     * get recently playlists &albums & artist 
     * @param  {Object} user - the user
     * @returns {JSON}
     */
    getRecentlyHomePage: async function(user) {
        try {
            if (!user) return 0;
            if (!user.playHistory) return 0;
            let recentlyArtist = [];
            let recentlyPlaylist = [];
            let recentlyAlbum = [];
            let playHistory = user.playHistory;
            let limit;
            let index = 0;
            if (playHistory.length < Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20) limit = playHistory.length;
            else limit = Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;
            for (let i = 0; i < limit; i++) {
                let isFind = 0;
                // now check type to print 
                if (playHistory[i].sourceType == 'album') {
                    for (let j = 0; j < recentlyAlbum.length; j++)
                        if (String(playHistory[i].sourceId) == String(recentlyAlbum[j].id))
                            isFind = 1;
                    if (!isFind) {
                        const album = await Album.getAlbumById(playHistory[i].sourceId);
                        if (!album) continue;
                        const artist = await Artist.getArtist(album.artistId);
                        recentlyAlbum.push({ id: album._id, name: album.name, type: "album", album_type: album.albumType, images: album.images, availableMarkets: album.availableMarkets, artist: { type: 'artist', id: album.artistId, name: artist.Name }, index: index })
                        index++;
                    }
                } else if (playHistory[i].sourceType == 'artist') {
                    for (let j = 0; j < recentlyArtist.length; j++)
                        if (String(playHistory[i].sourceId) == String(recentlyArtist[j].id))
                            isFind = 1;
                    if (!isFind) {
                        const artist = await Artist.getArtist(playHistory[i].sourceId);
                        if (!artist) continue;
                        recentlyArtist.push({ genre: artist.genre, type: 'artist', name: artist.Name, images: artist.images, id: artist._id, info: artist.info, index: index });
                        index++;

                    }
                } else if (playHistory[i].sourceType == 'playlist') {
                    for (let j = 0; j < recentlyPlaylist.length; j++)
                        if (String(playHistory[i].sourceId) == String(recentlyPlaylist[j].id))
                            isFind = 1;
                    if (!isFind) {
                        const playlist = await Playlist.getPlaylist(playHistory[i].sourceId);
                        if (!playlist) continue;
                        const user1 = await userDocument.findById(playlist.ownerId);
                        recentlyPlaylist.push({ owner: { id: playlist.ownerId, type: "user", name: user1.displayName }, collaborative: playlist.collaborative, type: 'playlist', name: playlist.name, images: playlist.images, id: playlist._id, Description: playlist.Description, isPublic: playlist.isPublic, index: index });
                        index++;
                    }
                }

            }
            // const recently = { "recentlyPlaying": recentPlaying };
            if (recentlyArtist.length == 0 && recentlyPlaylist.length == 0 && recentlyAlbum.length == 0)
                return 0;
            return {
                'recentlyArtist': recentlyArtist,
                'recentlyPlaylist': recentlyPlaylist,
                'recentlyAlbum': recentlyAlbum
            }

            return recentPlaying;
        } catch (ex) {
            return 0;
        }
    },

    /** 
     * to clear playHistory when has more than 50 
     * @param  {Object} user - the user
     * @returns {Number}
     */
    clearRecentTracks: async function(user) {
        try {
            user.playHistory = [];
            await userDocument.updateOne({ _id: user._id }, { playHistory: user.playHistory });
            return 1;
        } catch (ex) {
            return 0;
        }
    },

    /** 
     * add  a track to user recent tracks
     * @param  {Object} user - the user
     * @param  {string} trackId - the track id
     * @param  {string} sourceType - the source type of the new track (playlist or album)
     * @param  {string} sourceId - the source id
     * @returns {Number}
     */
    addRecentTrack: async function(user, trackId, sourceType, sourceId) {
        try {
            if (!user) return 0;
            if (!CheckMonooseObjectId([sourceId, trackId])) return 0;
            if (user.playHistory) {
                if (user.playHistory.length > 50) user.playHistory.pop();
                user.playHistory.unshift({
                    trackId: trackId,
                    sourceId: sourceId,
                    sourceType: sourceType
                });
                await userDocument.updateOne({ _id: user._id }, { playHistory: user.playHistory });
                return 1;
            } else { // if user does not have  playHistory create playHistory
                user.playHistory = [];
                user.playHistory.push({
                    trackId: trackId,
                    sourceId: sourceId,
                    sourceType: sourceType
                });
                await userDocument.updateOne({ _id: user._id }, { playHistory: user.playHistory });
                return 1;
            }
        } catch (ex) {
            return 0;
        }
    },

    /** 
     *  get recent tracks played by user
     * @param  {Object} user - the user
     * @param  {Number} limit - the limit number of tracks
     * @returns {Array<Object>}
     */
    getRecentTracks: function(user, limit) {
        try {
            if (!user) return 0;
            limit = limit || Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;
            let tracks = [];
            if (!user.playHistory) return tracks;
            for (let i = 0; i < Math.min(user.playHistory.length, limit); i++) tracks.push(user.playHistory[i]); // becouse if playHistory less than limit
            return tracks;
        } catch (ex) {
            return 0;
        }
    },

    /** 
     *  create a new queue for the user
     * @param  {Object} user - the user
     * @param  {Boolean} isPlaylist - the source status of the new track (playlist or not)
     * @param  {string} id - the source (playlist or album) ID
     * @param  {string} trackId - the track id
     * @param {Array<String>} tracksIds - optional if you create queue for array of tracks not album or playlist
     * @param {String} sourceType - optional name describe the tracks 
     * @returns {Number}
     */

    createQueue: async function(user, isPlaylist, id, trackId, tracksIds, sourceType) {
        try {
            if (!user) return 0;
            if (!CheckMonooseObjectId([trackId])) return 0;
            if (!await Track.getTrack(trackId)) return 0;

            if (!tracksIds) {
                if (!CheckMonooseObjectId([id])) return 0;
                if (isPlaylist == 'true' || isPlaylist == true) {
                    const playlist = await Playlist.getPlaylist(id);
                    if (!playlist) return 0; // can not create queue becouse not found this playlist
                    // if this playlist does not have snapshot return 0;
                    if (!playlist.snapshot || playlist.snapshot.length == 0) return 0;
                    // if this playlist does not have tracks  return 0;
                    if (playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length == 0)
                        return 0;
                    // if track not in playlist
                    for (let i = 0; i < playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length; i++) {
                        if (String(playlist.snapshot[playlist.snapshot.length - 1].hasTracks[i]) == String(trackId))
                            break;
                        if (i == playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length - 1)
                            return 0
                    }

                    user.player.currentSource = id;
                    user.player.isPlaylist = true;
                    user.player['sourceName'] = 'playlist';
                    user.queue = {}; // create queue
                    user.queue.queuIndex = -1; // it is refer to frist element add to queue by add to queue 
                    user.queue.tracksInQueue = [];
                    let i = 0;
                    for (let j = 0; j < playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length; j++) {
                        user.queue.tracksInQueue.push({
                            trackId: playlist.snapshot[playlist.snapshot.length - 1].hasTracks[j],
                            isQueue: false, // if add by add to queue or add by playlist or album
                            isPlaylist: true,
                            playlistId: id,
                            indexInSource: i
                        });
                        i++;
                    }
                    await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });
                    user.queue.queuIndex = -1;
                    await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });
                    return 1;
                } else { // this track from album not from playlist
                    const album = await Album.getAlbumById(id);
                    if (!album) return 0;
                    if (!album.hasTracks) return 0;
                    if (!await album.hasTracks.find(track => String(track.trackId) == String(trackId))) return 0;
                    user.player.isPlaylist = false;
                    user.player['sourceName'] = 'album';
                    user.player.currentSource = id;
                    user.queue = {}; // when create queue delete last queue
                    user.queue.queuIndex = -1;
                    user.queue.tracksInQueue = [];
                    let i = 0;
                    for (let track of album.hasTracks) {
                        user.queue.tracksInQueue.push({
                            trackId: track.trackId,
                            isQueue: false,
                            isPlaylist: false,
                            playlistId: id,
                            indexInSource: i
                        });
                        i++;
                    }
                    await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });
                    return 1;
                }
            } else {
                if (!CheckMonooseObjectId(tracksIds)) return 0;
                let newQueue = [];
                let found = false;
                for (let i = 0; i < tracksIds.length; i++) {
                    let track = Track.getTrack(tracksIds[i]);
                    if (tracksIds[i] == trackId) found = true;
                    if (track) {
                        newQueue.push({
                            trackId: tracksIds[i],
                            isQueue: false,
                            isPlaylist: false,
                            playlistId: undefined,
                            indexInSource: i
                        })
                    }
                }
                if (newQueue.length == 0 || !found) return 0;
                user.queue.tracksInQueue = newQueue;
                user.queue.queuIndex = -1;
                user.player.playlistId = undefined;
                user.player.isPlaylist = undefined;
                user.player['sourceName'] = sourceType;
                await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });
                return 1;
            }
        } catch (ex) {
            return 0;
        }
    },

    /** 
     *  add track to user's queue
     * @param  {Object} user - the user
     * @param  {string} trackId - the track id
     * @param  {Boolean} isPlaylist - the source status of the new track (playlist or not)
     * @param  {string} playlistId - the source ID
     * @returns {Number}
     */
    addToQueue: async function(user, trackId, isPlaylist, playlistId) {
        try {
            if (!user) return 0;
            if (!CheckMonooseObjectId([trackId, playlistId])) return 0;
            if (!await Track.getTrack(trackId)) return 0;
            if (isPlaylist == true || isPlaylist == 'true') {
                const playlist = await Playlist.getPlaylist(playlistId);
                if (!playlist) return 0;
                if (!playlist.snapshot || playlist.snapshot.length == 0) return 0;
                if (playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length == 0) return 0;
                // if track not in playlist
                for (let i = 0; i < playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length; i++) {
                    if (String(playlist.snapshot[playlist.snapshot.length - 1].hasTracks[i]) == String(trackId))
                        break;
                    if (i == playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length - 1)
                        return 0
                }
            } else {
                const album = await Album.getAlbumById(playlistId);
                if (!album) return 0;
                if (!album.hasTracks) return 0;
                if (!await album.hasTracks.find(track => String(track.trackId) == String(trackId))) return 0;

            }
            if (!user.queue) {
                user.queue = {};
                user.queue.tracksInQueue = [{
                    trackId: trackId,
                    isQueue: true,
                    isPlaylist: isPlaylist == 'true' || isPlaylist == true ? true : false,
                    playlistId: playlistId
                }];
                await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });
                user.queue.queuIndex = 0; // now when add to queue become 1
                user.player.nextTrack['trackId'] = user.queue.tracksInQueue[0].trackId; //set next by frist element add by add to queue
                user.player.nextTrack['isPlaylist'] = user.queue.tracksInQueue[0].isPlaylist; //set next by frist element add by add to queue
                user.player.nextTrack['playlistId'] = user.queue.tracksInQueue[0].playlistId; //set next by frist element add by add to queue
                await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });
                return 1;
            } else {

                if (!user.queue.tracksInQueue) {
                    user.queue.tracksInQueue = [{
                        trackId: trackId,
                        isQueue: true,
                        isPlaylist: isPlaylist == 'true' || isPlaylist == true ? true : false,
                        playlistId: playlistId
                    }];
                    user.queue.queuIndex = 0;
                    user.player.nextTrack['trackId'] = user.queue.tracksInQueue[0].trackId;
                    user.player.nextTrack['isPlaylist'] = user.queue.tracksInQueue[0].isPlaylist;
                    user.player.nextTrack['playlistId'] = user.queue.tracksInQueue[0].playlistId;
                    user.player["lastPlaylistTrackIndex"]++;
                    await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });

                    return 1;
                } else {
                    if (!user.queue.tracksInQueue[0] || !user.queue.tracksInQueue[0].isQueue) {
                        user.queue.tracksInQueue.splice(0, 0, {
                            trackId: trackId,
                            isQueue: true,
                            isPlaylist: isPlaylist == 'true' || isPlaylist == true ? true : false,
                            playlistId: playlistId
                        });
                        user.queue.queuIndex = 0;
                        user.player.nextTrack['trackId'] = user.queue.tracksInQueue[0].trackId;
                        user.player.nextTrack['isPlaylist'] = user.queue.tracksInQueue[0].isPlaylist;
                        user.player.nextTrack['playlistId'] = user.queue.tracksInQueue[0].playlistId;
                        //if (!user.player["lastPlaylistTrackIndex"]) user.player["lastPlaylistTrackIndex"] = 0;
                        user.player["lastPlaylistTrackIndex"]++;
                        await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });
                        return 1;
                    } else {
                        // if there is another track added by add to queue will shift the queue down and will increment  user.queue.queuIndex 
                        // to refer to the frist element add to queue by add to queue which is shifted down
                        let index = user.queue.queuIndex;
                        user.queue.tracksInQueue.splice(index, 0, {
                            trackId: trackId,
                            isQueue: true,
                            isPlaylist: isPlaylist == 'true' || isPlaylist == true ? true : false,
                            playlistId: playlistId
                        });
                        user.queue.queuIndex = index + 1;
                        user.player["lastPlaylistTrackIndex"]++;
                        await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });
                        return 1;
                    }
                }
            }
        } catch (ex) {
            return 0;
        }
    },

    /** 
     *  skip to the next track in the user's queue
     * @param  {Object} user - the user
     * @returns {object} track object
     */
    skipNext: async function(user) {
        try {
            if (!user) return 0;
            if (!user.player) return 0;
            if (!user.player.nextTrack) return 0;
            const player = user.player;
            var nextPlayingTrack = await Track.getFullTrack(player.nextTrack.trackId, user);
            if (!nextPlayingTrack) return 0;
            user.player.currentTrack = user.player.nextTrack;
            if (user.queue.queuIndex != -1 && String(user.player.nextTrack.trackId) == String(user.queue.tracksInQueue[user.queue.queuIndex].trackId)) {
                user.queue.tracksInQueue.splice(user.queue.queuIndex, 1);
                user.queue.queuIndex--;
                user.player["lastPlaylistTrackIndex"]--;
                await this.setNextPrev(user, user.queue.tracksInQueue[user.player["lastPlaylistTrackIndex"]].trackId)
            } else
                await this.setNextPrev(user, user.player.currentTrack.trackId)
            if (String(user.player.currentTrack.trackId) == String(user.queue.tracksInQueue[user.queue.queuIndex + 1].trackId))
                nextPlayingTrack['fristInSource'] = true;
            if (nextPlayingTrack.track.playable == false) return await this.skipNext(user);
            nextPlayingTrack['isPlaylist'] = player.nextTrack.isPlaylist;
            nextPlayingTrack['playlistId'] = player.nextTrack.playlistId;
            nextPlayingTrack['isPlayable'] = true;
            return nextPlayingTrack;
        } catch (ex) {
            return 0;
        }
    },
    /** 
     * skip to previous
     * @param  {Object} user - the user
     * @returns {object} track object
     */
    skipPrevious: async function(user) {
        try {
            if (!user) return 0;
            if (!user.player) return 0;
            if (!user.player.prevTrack) return 0;
            const player = user.player;
            var prevPlayingTrack = await Track.getFullTrack(player.prevTrack.trackId, user);
            if (!prevPlayingTrack) return 0;
            player.currentTrack = user.player.prevTrack;
            await this.setNextPrev(user, player.prevTrack.trackId);
            if (prevPlayingTrack.track.playable == false) return await this.skipPrevious(user);
            prevPlayingTrack['isPlaylist'] = player.prevTrack.isPlaylist;
            prevPlayingTrack['playlistId'] = player.prevTrack.playlistId;
            prevPlayingTrack['isPlayable'] = true;
            return prevPlayingTrack;
        } catch (ex) {
            return 0;
        }
    },
    /** 
     * get next songs in user queue
     * @param  {Object} user - the user
     * @returns {Array<Object>}
     */
    getQueue: async function(user) {
        try {
            if (!user) return 0;
            const queue = user.queue;
            let tracks = [];
            if (!queue) return 0;
            if (!queue.tracksInQueue) return 0;
            const queueIndex = queue.queuIndex;
            // get tracks that was added to queue
            for (let i = 0; i < queueIndex + 1; i++) {
                const track = await Track.getFullTrack(queue.tracksInQueue[i].trackId, user);
                if (!track) return 0;
                const sourse = queue.tracksInQueue[i].playlistId;
                tracks.push({ fulltrack: track, isQueue: queue.tracksInQueue[i].isQueue, playlistId: sourse, isPlaylist: queue.tracksInQueue[i].isPlaylist, index: i, isPlayable: false });
            }

            const lastplaylistIndex = user.player.lastPlaylistTrackIndex < 0 ? 0 : user.player.lastPlaylistTrackIndex;

            // get tracks that was next in playlist
            for (let i = lastplaylistIndex + 1; i < queue.tracksInQueue.length; i++) {
                const track = await Track.getFullTrack(queue.tracksInQueue[i].trackId, user);
                if (!track) return 0;
                const sourse = queue.tracksInQueue[i].playlistId;
                if (i == queueIndex + 1)
                    tracks.push({ fulltrack: track, isQueue: queue.tracksInQueue[i].isQueue, playlistId: sourse, isPlaylist: queue.tracksInQueue[i].isPlaylist, index: i, isPlayable: false, fristInSource: true });
                else
                    tracks.push({ fulltrack: track, isQueue: queue.tracksInQueue[i].isQueue, playlistId: sourse, isPlaylist: queue.tracksInQueue[i].isPlaylist, index: i, isPlayable: false });

            }
            //if repeat should display all the queue
            if (user.player.isRepeat || user.player.isShuffled) {
                for (let i = queueIndex + 1; i < lastplaylistIndex; i++) {
                    const track = await Track.getFullTrack(queue.tracksInQueue[i].trackId, user);
                    if (!track) return 0;
                    const sourse = queue.tracksInQueue[i].playlistId;
                    if (i == queueIndex + 1)
                        tracks.push({ fulltrack: track, isQueue: queue.tracksInQueue[i].isQueue, playlistId: sourse, isPlaylist: queue.tracksInQueue[i].isPlaylist, index: i, fristInSource: true, isPlayable: false });
                    else
                        tracks.push({ fulltrack: track, isQueue: queue.tracksInQueue[i].isQueue, playlistId: sourse, isPlaylist: queue.tracksInQueue[i].isPlaylist, index: i, isPlayable: false });
                }
            }
            return tracks;
        } catch (ex) {
            return 0;
        }
    },

    /** 
     *  to resume playing song
     * @param  {Object} user - the user
     * @returns {Number}
     */
    resumePlaying: async function(user) {
        try {
            if (!user) return 0;
            const player = user.player;
            if (!player) return 0;
            user.player["isPlaying"] = true;
            await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });
            return 1;
        } catch (ex) {
            return 0;
        }
    },

    /** 
     * to pause playing song
     * @param  {Object} user - the user
     * @returns {Number}
     */
    pausePlaying: async function(user) {
        try {
            if (!user) return 0;
            const player = user.player;
            if (!player) return 0;
            user.player["isPlaying"] = false;
            await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });
            return 1;
        } catch (ex) {
            return 0;
        }
    },

    /** 
     * random function
     * @param  {Number} low - the lower number in the range
     * @param  {Number} high - the higher number in the range
     * @returns {Number}
     */
    rondom: async function(low, high) {
        try {
            const randomValue = await Math.floor(Math.random() * (high - low + 1) + low);
            return randomValue;
        } catch (ex) {
            return 0;
        }
    },

    /** 
     * to random tracks which add by playlist
     * @param  {Object} user - the user
     * @returns {Number}
     */
    shuffleQueue: async function(user) {
        try {
            if (!user) return 0;
            if (!user.player) return 0;
            if (!user.queue) return 0;
            if (!user.queue.tracksInQueue) return 0;
            if (user.queue.tracksInQueue.length == 0) return 0;
            const track_last_playlist = user.queue.tracksInQueue[user.player["lastPlaylistTrackIndex"]].trackId;
            for (let i = user.queue.queuIndex + 1; i < user.queue.tracksInQueue.length; i++) {
                const randomIndex = await this.rondom(user.queue.queuIndex + 1, user.queue.tracksInQueue.length - 1);
                const temp = user.queue.tracksInQueue[i].trackId;
                user.queue.tracksInQueue[i].trackId = user.queue.tracksInQueue[randomIndex].trackId;
                user.queue.tracksInQueue[randomIndex].trackId = temp;
                await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });

            }
            return await this.setNextPrev(user, track_last_playlist);
        } catch (ex) {
            return 0;
        }
    },

    /** 
     * to make queue same playlist order
     * @param  {Object} user - the user
     * @returns {Number}
     */
    fillByplaylist: async function(user) {
        try {
            if (!user) return 0;

            if (!user.player) return 0;
            if (!user.queue) return 0;
            if (!user.queue.tracksInQueue) return 0;
            if (user.queue.tracksInQueue.length == 0) return 0;
            const track_last_playlist = user.queue.tracksInQueue[user.player["lastPlaylistTrackIndex"]].trackId;

            if (user.player['sourceName'] != 'playlist' && user.player['sourceName'] != 'album') {
                let queueTracks = user.queue.tracksInQueue;
                for (let i = user.queue.queuIndex + 1; i < queueTracks.length; i++) {
                    queueTracks[user.queue.tracksInQueue[i].indexInSource + user.queue.queuIndex + 1] = user.queue.tracksInQueue[i];
                    user.queue.tracksInQueue = queueTracks;
                    await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });
                }
                return await this.setNextPrev(user, track_last_playlist);
            }

            if (user.player.isPlaylist == true) {
                const playlist = await Playlist.getPlaylist(user.player.currentSource);
                if (!playlist.snapshot || playlist.snapshot.length == 0) playlist.snapshot = [{ hasTracks: [] }];
                if (playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length == 0) {
                    await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });

                    return await this.setNextPrev(user, track_last_playlist);
                }
                let i = user.queue.queuIndex + 1;
                for (let j = 0; j < playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length; j++) {
                    user.queue.tracksInQueue[i].trackId = playlist.snapshot[playlist.snapshot.length - 1].hasTracks[j];
                    user.queue.tracksInQueue[i].isPlaylist = user.player.isPlaylist;
                    user.queue.tracksInQueue[i].playlistId = user.player.currentSource;
                    i++;
                }
                await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });

                return await this.setNextPrev(user, track_last_playlist);
            } else {
                const album = await Album.getAlbumById(user.player.currentSource);
                if (!album) return 0;

                if (!album.hasTracks) {
                    await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });

                    return await this.setNextPrev(user, track_last_playlist);
                }
                let i = 0;
                for (let track of album.hasTracks) {
                    user.queue.tracksInQueue[i].trackId = track.trackId;
                    user.queue.tracksInQueue[i].isPlaylist = user.player.isPlaylist;
                    user.queue.tracksInQueue[i].playlistId = user.player.currentSource;
                    i++;
                }
                await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });

                return await this.setNextPrev(user, track_last_playlist);
            }
        } catch (ex) {
            return 0;
        }
    },

    /** 
     * shuffle
     * @param  {Boolean} state - the shuffle state (on or off)
     * @param  {Object} user - the user
     * @returns {Number}
     */
    setShuffle: async function(state, user) {
        try {
            if (!user || !user.player) return 0;
            if (user.queue.tracksInQueue) {
                if (state == 'true' || state == true) {
                    user.player['isShuffled'] = true;
                    await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });

                    return await this.shuffleQueue(user);
                } else {
                    user.player['isShuffled'] = false;
                    await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });

                    const ret = await this.fillByplaylist(user);
                    return ret;
                }
            }
            return 0;
        } catch (ex) {
            return 0;
        }
    },

    /** 
     * set next and prev and current when fill queue or shuffle
     * @param  {Object} user - the user
     * @param  {string} lastTrack - the last track id
     * @returns {Number}
     */
    setNextPrev: async function(user, lastTrack) {
        try {
            if (!user) return 0;
            if (!user.player) return 0;
            if (!user.player.nextTrack) user.player.nextTrack = {};
            if (!user.player.prevTrack) user.player.prevTrack = {};
            for (let i = user.queue.queuIndex + 1; i < user.queue.tracksInQueue.length; i++) {
                if (String(user.queue.tracksInQueue[i].trackId) == String(lastTrack)) {
                    user.player["lastPlaylistTrackIndex"] = i;
                    await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });

                    user.player.prevTrack['trackId'] = i - 1 > user.queue.queuIndex ? user.queue.tracksInQueue[i - 1].trackId : user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].trackId;
                    user.player.prevTrack['isPlaylist'] = i - 1 > user.queue.queuIndex ? user.queue.tracksInQueue[i - 1].isPlaylist : user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].isPlaylist;
                    user.player.prevTrack['playlistId'] = i - 1 > user.queue.queuIndex ? user.queue.tracksInQueue[i - 1].playlistId : user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].playlistId;
                    if (user.queue.queuIndex > -1) {
                        user.player.nextTrack['trackId'] = user.queue.tracksInQueue[user.queue.queuIndex].trackId;
                        user.player.nextTrack['isPlaylist'] = user.queue.tracksInQueue[user.queue.queuIndex].isPlaylist;
                        user.player.nextTrack['playlistId'] = user.queue.tracksInQueue[user.queue.queuIndex].playlistId;
                    } else {
                        user.player.nextTrack['trackId'] = i + 1 > user.queue.tracksInQueue.length - 1 ? user.queue.tracksInQueue[0].trackId : user.queue.tracksInQueue[i + 1].trackId;
                        user.player.nextTrack['isPlaylist'] = i + 1 > user.queue.tracksInQueue.length - 1 ? user.queue.tracksInQueue[0].isPlaylist : user.queue.tracksInQueue[i + 1].isPlaylist;
                        user.player.nextTrack['playlistId'] = i + 1 > user.queue.tracksInQueue.length - 1 ? user.queue.tracksInQueue[0].playlistId : user.queue.tracksInQueue[i + 1].playlistId;
                    }
                    await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });

                    return 1;
                }
            }
            return 0;
        } catch (ex) {
            return 0;
        }
    },

    /** 
     * put repeat playlist mode
     * @param  {Object} user - the user
     * @param  {Boolean} state - the repeat state (on or off)
     * @returns {Number}
     */
    repreatPlaylist: async function(user, state) {
        try {
            if (!user) return 0;
            if (!user.player) return 0;
            if (state == 'true' || state == true)
                user.player["isRepeat"] = true;
            else if (state == 'false' || state == false)
                user.player["isRepeat"] = false;
            else
                return 0;
            await userDocument.updateOne({ _id: user._id }, { queue: user.queue, player: user.player });
            return 1;
        } catch (ex) {
            return 0;
        }
    }
}

module.exports = Player;