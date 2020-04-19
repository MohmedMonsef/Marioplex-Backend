const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const Playlist = require('./playlist-api');
const Album = require('./album-api');
const Track = require('./track-api');
const Artist = require('./artist-api')
    /** @namespace */
const Player = {

    /** 
     * update user player object each time he plays new track
     * @param  {Object} user - the user
     * @param  {Boolean} isPlaylist - the source status of the new track (playlist or not)
     * @param  {string} id - the source (playlist or album) ID
     * @param  {string} trackId - the track id
     * @returns {Number}
     */
    setPlayerInstance: async function(user, isPlaylist, id, trackId) {
        if (!user.player) user.player = {};
        user.player.next_track = {};
        user.player.prev_track = {};
        user.player.current_track = {};
        if (user.queue.tracksInQueue) {
            // get next from the queue directly
            // get next track and prev Track in playlist by checking for id greater than track id
            user.player.current_track['isPlaylist'] = isPlaylist == true || isPlaylist == 'true' ? true : false;
            user.player.current_track['trackId'] = trackId;
            user.player.current_track['playlistId'] = id;
            await user.save();
            return await this.setNextPrev(user, trackId);
        }
        return 0;
    },

    /** 
     * get recently playlists &albums & artist 
     * @param  {Object} user - the user
     * @returns {JSON}
     */
    getRecentlyHomePage: async function(user) {
        if (user.playHistory) {
            let recentlyArtist = [];
            let recentlyPlaylist = [];
            let recentlyAlbum = [];
            let playHistory = user.playHistory;
            let limit;
            let index = 0;
            if (playHistory.length < 20) limit = playHistory.length;
            else limit = 20;
            for (let i = 0; i < limit; i++) {
                let isFind = 0;
                // now check type to print 
                if (playHistory[i].sourceType == 'album') {
                    for (let j = 0; j < recentlyAlbum.length; j++)
                        if (playHistory[i].sourceId + 1 == recentlyAlbum[j].id + 1)
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
                        if (playHistory[i].sourceId + 1 == recentlyArtist[j].id + 1)
                            isFind = 1;
                    if (!isFind) {
                        const artist = await Artist.getArtist(playHistory[i].sourceId);
                        if (!artist) continue;
                        recentlyArtist.push({ genre: artist.genre, type: 'artist', name: artist.Name, images: artist.images, id: artist._id, info: artist.info, index: index });
                        index++;

                    }
                } else if (playHistory[i].sourceType == 'playlist') {
                    for (let j = 0; j < recentlyPlaylist.length; j++)
                        if (playHistory[i].sourceId + 1 == recentlyPlaylist[j].id + 1)
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
        }
        return recentPlaying;
    },

    /** 
     * to clear playHistory when has more than 50 
     * @param  {Object} user - the user
     * @returns {Number}
     */
    clearRecentTracks: async function(user) {
        user.playHistory = [];
        await user.save();
        return 1;
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
        if (user.playHistory) {
            if (user.playHistory.length > 50) user.playHistory.pop();
            user.playHistory.unshift({
                trackId: trackId,
                sourceId: sourceId,
                sourceType: sourceType
            });
            await user.save();
            return 1;
        } else { // if user does not have  playHistory create playHistory
            user.playHistory = [];
            user.playHistory.push({
                trackId: trackId,
                sourceId: sourceId,
                sourceType: sourceType
            });
            await user.save();
            return 1;
        }
    },

    /** 
     *  get recent tracks played by user
     * @param  {Object} user - the user
     * @param  {Number} limit - the limit number of tracks
     * @returns {Array<Object>}
     */
    getRecentTracks: function(user, limit) {
        limit = limit || 50;
        let tracks = [];
        if (!user.playHistory) return tracks;
        for (let i = 0; i < Math.min(user.playHistory.length, limit); i++) tracks.push(user.playHistory[i]); // becouse if playHistory less than limit
        return tracks;
    },

    /** 
     *  create a new queue for the user
     * @param  {Object} user - the user
     * @param  {Boolean} isPlaylist - the source status of the new track (playlist or not)
     * @param  {string} id - the source (playlist or album) ID
     * @param  {string} trackId - the track id
     * @returns {Number}
     */
    createQueue: async function(user, isPlaylist, id, trackId) {

        if (!await Track.getTrack(trackId)) return 0;
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
                if (playlist.snapshot[playlist.snapshot.length - 1].hasTracks[i] + 1 == trackId + 1)
                    break;
                if (i == playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length - 1)
                    return 0
            }

            user.player.current_source = id;
            user.player.isPlaylist = true;
            user.queue = {}; // create queue
            user.queue.queuIndex = -1; // it is refer to frist element add to queue by add to queue 
            user.queue.tracksInQueue = [];
            let i = 0;
            for (let j = 0; j < playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length; j++) {
                user.queue.tracksInQueue.push({
                    trackId: playlist.snapshot[playlist.snapshot.length - 1].hasTracks[j],
                    isQueue: false, // if add by add to queue or add by playlist or album
                    isPlaylist: true,
                    playlistId: id
                });
                i++;
            }
            await user.save();
            user.queue.queuIndex = -1;
            await user.save();
            return 1;
        } else { // this track from album not from playlist
            const album = await Album.getAlbumById(id);
            if (!album) return 0;
            if (!album.hasTracks) return 0;
            ///should test
            if (!await album.hasTracks.find(track => track.trackId + 1 == trackId + 1)) return 0;
            user.player.isPlaylist = false;
            user.player.current_source = id;
            user.queue = {}; // when create queue delete last queue
            user.queue.queuIndex = -1;
            user.queue.tracksInQueue = [];
            let i = 0;
            for (let track of album.hasTracks) {
                user.queue.tracksInQueue.push({
                    trackId: track.trackId,
                    isQueue: false,
                    isPlaylist: false,
                    playlistId: id
                });
                i++;
            }
            await user.save();
            return 1;
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

        if (!user.queue) {
            user.queue = {};
            user.queue.tracksInQueue = [{
                trackId: trackId,
                isQueue: true,
                isPlaylist: isPlaylist == 'true' || isPlaylist == true ? true : false,
                playlistId: playlistId
            }];
            await user.save();
            user.queue.queuIndex = 0; // now when add to queue become 1
            user.player.next_track['trackId'] = user.queue.tracksInQueue[0].trackId; //set next by frist element add by add to queue
            user.player.next_track['isPlaylist'] = user.queue.tracksInQueue[0].isPlaylist; //set next by frist element add by add to queue
            user.player.next_track['playlistId'] = user.queue.tracksInQueue[0].playlistId; //set next by frist element add by add to queue
            await user.save();
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
                user.player.next_track['trackId'] = user.queue.tracksInQueue[0].trackId;
                user.player.next_track['isPlaylist'] = user.queue.tracksInQueue[0].isPlaylist;
                user.player.next_track['playlistId'] = user.queue.tracksInQueue[0].playlistId;
                user.player["last_playlist_track_index"]++;
                await user.save();
                return 1;
            } else {
                if (!user.queue.tracksInQueue[0].isQueue) {
                    user.queue.tracksInQueue.splice(0, 0, {
                        trackId: trackId,
                        isQueue: true,
                        isPlaylist: isPlaylist == 'true' || isPlaylist == true ? true : false,
                        playlistId: playlistId
                    });
                    user.queue.queuIndex = 0;
                    user.player.next_track['trackId'] = user.queue.tracksInQueue[0].trackId;
                    user.player.next_track['isPlaylist'] = user.queue.tracksInQueue[0].isPlaylist;
                    user.player.next_track['playlistId'] = user.queue.tracksInQueue[0].playlistId;
                    user.player["last_playlist_track_index"]++;
                    await user.save();
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
                    user.player["last_playlist_track_index"]++;
                    await user.save();
                    return 1;
                }
            }
        }
    },

    /** 
     *  skip to the next track in the user's queue
     * @param  {Object} user - the user
     * @returns {Number}
     */
    skipNext: async function(user) {
        if (!user.player) return 0;
        if (!user.player.next_track) return 0;
        if (!user.player.prev_track) return 0;
        user.player.current_track = user.player.next_track;
        if (user.queue.queuIndex != -1 && user.player.next_track.trackId + 1 == user.queue.tracksInQueue[user.queue.queuIndex].trackId + 1) {
            user.queue.tracksInQueue.splice(user.queue.queuIndex, 1);
            user.queue.queuIndex--;
            user.player["last_playlist_track_index"]--;
            this.setNextPrev(user, user.queue.tracksInQueue[user.player["last_playlist_track_index"]].trackId)
        } else
            this.setNextPrev(user, user.player.current_track.trackId)
        if (user.player.current_track.trackId + 1 == user.queue.tracksInQueue[user.queue.queuIndex + 1].trackId + 1)
            return 2;
        return 1;
    },

    /** 
     * skip to previous
     * @param  {Object} user - the user
     * @returns {Number}
     */
    skipPrevious: async function(user) {
        if (!user.player) return 0;
        if (!user.player.next_track) return 0;
        if (!user.player.prev_track) return 0;
        user.player.current_track = user.player.prev_track
        this.setNextPrev(user, user.player.prev_track.trackId)
        return 1;
    },

    /** 
     * get next songs in user queue
     * @param  {Object} user - the user
     * @returns {Array<Object>}
     */
    getQueue: async function(user) {
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

        const lastplaylistIndex = user.player.last_playlist_track_index < 0 ? 0 : user.player.last_playlist_track_index;

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
        if (user.player.is_repeat || user.player.is_shuffled) {
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

    },

    /** 
     *  to resume playing song
     * @param  {Object} user - the user
     * @returns {Number}
     */
    resumePlaying: async function(user) {
        const player = user.player;
        if (!player) return 0;
        user.player["is_playing"] = true;
        await user.save();
        return 1;
    },

    /** 
     * to pause playing song
     * @param  {Object} user - the user
     * @returns {Number}
     */
    pausePlaying: async function(user) {
        const player = user.player;
        if (!player) return 0;
        user.player["is_playing"] = false;
        await user.save();
        return 1;
    },

    /** 
     * random function
     * @param  {Number} low - the lower number in the range
     * @param  {Number} high - the higher number in the range
     * @returns {Number}
     */
    rondom: async function(low, high) {
        const randomValue = await Math.floor(Math.random() * (high - low + 1) + low);
        return randomValue;
    },

    /** 
     * to random tracks which add by playlist
     * @param  {Object} user - the user
     * @returns {Number}
     */
    shuffleQueue: async function(user) {
        if (!user) return 0;
        if (!user.player) return 0;
        if (!user.queue) return 0;
        if (!user.queue.tracksInQueue) return 0;
        if (user.queue.tracksInQueue.length == 0) return 0;
        const track_last_playlist = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].trackId;
        for (let i = user.queue.queuIndex + 1; i < user.queue.tracksInQueue.length; i++) {
            const randomIndex = await this.rondom(user.queue.queuIndex + 1, user.queue.tracksInQueue.length - 1);
            const temp = user.queue.tracksInQueue[i].trackId;
            user.queue.tracksInQueue[i].trackId = user.queue.tracksInQueue[randomIndex].trackId;
            user.queue.tracksInQueue[randomIndex].trackId = temp;
            await user.save();
        }
        return await this.setNextPrev(user, track_last_playlist);
    },

    /** 
     * to make queue same playlist order
     * @param  {Object} user - the user
     * @returns {Number}
     */
    fillByplaylist: async function(user) {
        if (!user) return 0;
        if (!user.player) return 0;
        if (!user.queue) return 0;
        if (!user.queue.tracksInQueue) return 0;
        if (user.queue.tracksInQueue.length == 0) return 0;
        const track_last_playlist = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].trackId;
        if (user.player.isPlaylist) {
            const playlist = await Playlist.getPlaylist(user.player.current_source);
            if (!playlist.snapshot || playlist.snapshot.length == 0) playlist.snapshot = [{ hasTracks: [] }];
            if (playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length == 0) {
                await user.save();
                return await this.setNextPrev(user, track_last_playlist);
            }
            let i = user.queue.queuIndex + 1;
            for (let j = 0; j < playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length; j++) {
                user.queue.tracksInQueue[i].trackId = playlist.snapshot[playlist.snapshot.length - 1].hasTracks[j];
                user.queue.tracksInQueue[i].isPlaylist = user.player.isPlaylist;
                user.queue.tracksInQueue[i].playlistId = user.player.current_source;
                i++;
            }
            await user.save();
            return await this.setNextPrev(user, track_last_playlist);
        } else {
            const album = await Album.getAlbumById(user.player.current_source);
            if (!album) return 0;
            if (!album.hasTracks) {
                await user.save();
                return await this.setNextPrev(user, track_last_playlist);
            }
            let i = 0;
            for (let track of album.hasTracks) {
                user.queue.tracksInQueue[i].trackId = track.trackId;
                user.queue.tracksInQueue[i].isPlaylist = user.player.isPlaylist;
                user.queue.tracksInQueue[i].playlistId = user.player.current_source;
                i++;
            }
            await user.save();
            return await this.setNextPrev(user, track_last_playlist);
        }
    },

    /** 
     * shuffle
     * @param  {Boolean} state - the shuffle state (on or off)
     * @param  {Object} user - the user
     * @returns {Number}
     */
    setShuffle: async function(state, user) {
        if (user.queue.tracksInQueue) {
            if (state == 'true') {
                user.player['is_shuffled'] = true;
                await user.save();
                return await this.shuffleQueue(user);
            } else {
                user.player['is_shuffled'] = false;
                await user.save();
                const ret = await this.fillByplaylist(user);
                return ret;
            }
        }
        return 0
    },

    /** 
     * set next and prev and current when fill queue or shuffle
     * @param  {Object} user - the user
     * @param  {string} lastTrack - the last track id
     * @returns {Number}
     */
    setNextPrev: async function(user, lastTrack) {
        if (!user.player) return 0;
        if (!user.player.next_track) user.player.next_track = {};
        if (!user.player.prev_track) user.player.prev_track = {};
        for (let i = user.queue.queuIndex + 1; i < user.queue.tracksInQueue.length; i++) {
            if (user.queue.tracksInQueue[i].trackId + 1 == lastTrack + 1) {
                user.player["last_playlist_track_index"] = i;
                await user.save();
                user.player.prev_track['trackId'] = i - 1 > user.queue.queuIndex ? user.queue.tracksInQueue[i - 1].trackId : user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].trackId;
                user.player.prev_track['isPlaylist'] = i - 1 > user.queue.queuIndex ? user.queue.tracksInQueue[i - 1].isPlaylist : user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].isPlaylist;
                user.player.prev_track['playlistId'] = i - 1 > user.queue.queuIndex ? user.queue.tracksInQueue[i - 1].playlistId : user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].playlistId;
                if (user.queue.queuIndex > -1) {
                    user.player.next_track['trackId'] = user.queue.tracksInQueue[user.queue.queuIndex].trackId;
                    user.player.next_track['isPlaylist'] = user.queue.tracksInQueue[user.queue.queuIndex].isPlaylist;
                    user.player.next_track['playlistId'] = user.queue.tracksInQueue[user.queue.queuIndex].playlistId;
                } else {
                    user.player.next_track['trackId'] = i + 1 > user.queue.tracksInQueue.length - 1 ? user.queue.tracksInQueue[0].trackId : user.queue.tracksInQueue[i + 1].trackId;
                    user.player.next_track['isPlaylist'] = i + 1 > user.queue.tracksInQueue.length - 1 ? user.queue.tracksInQueue[0].isPlaylist : user.queue.tracksInQueue[i + 1].isPlaylist;
                    user.player.next_track['playlistId'] = i + 1 > user.queue.tracksInQueue.length - 1 ? user.queue.tracksInQueue[0].playlistId : user.queue.tracksInQueue[i + 1].playlistId;
                }
                await user.save();
                return 1;
            }
        }
        return 0;
    },

    /** 
     * put repeat playlist mode
     * @param  {Object} user - the user
     * @param  {Boolean} state - the repeat state (on or off)
     * @returns {Number}
     */
    repreatPlaylist: async function(user, state) {
        if (!user.player) return 0;
        if (state == 'true' || state == true)
            user.player["is_repeat"] = true;
        else if (state == 'false' || state == false)
            user.player["is_repeat"] = false;
        else
            return 0;
        await user.save();
        return 1;

    }
}

module.exports = Player;