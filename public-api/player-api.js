const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const Playlist = require('./playlist-api');
const Album = require('./album-api');
const Track = require('./track-api');
const Artist = require('./artist-api')

const Player = {

    // get next and prev track from playlist or album object 
    getPrevAndNext: function(hasTracks, trackID, user) {
        if (user.queue.queuIndex == -1) {
            for (let i = 0; i < hasTracks.length; i++) {
                if (trackID == hasTracks[i].trackId) {
                    return {
                        "next_track": i + 1 < hasTracks.length ? hasTracks[i + 1] : 0, //wrap around
                        "prev_track": i - 1 >= 0 ? hasTracks[i - 1] : hasTracks[hasTracks.length - 1], // wrap around
                        "last_playlist_track_index": i,
                    }
                }
            }
        } else {
            for (let i = user.queue.queuIndex + 1; i < hasTracks.length; i++) {
                if (trackID == hasTracks[i].trackId) {

                    return {
                        "next_track": i + 1 < hasTracks.length ? user.queue.tracksInQueue[user.queue.queuIndex] : 0, //wrap around
                        "prev_track": i - 1 >= user.queue.queuIndex + 1 ? hasTracks[i - 1] : hasTracks[hasTracks.length - 1], // wrap around
                        "last_playlist_track_index": i,
                    }
                }
            }
        }
        return {
            "next_track": undefined,
            "prev_track": undefined,
        }
    },

    // update user player object each time he plays new track
    setPlayerInstance: async function(user, isPlaylist, id, trackID) {
        if(!user.player) user.player = {};
        user.player.next_track = {};
        user.player.prev_track = {};
        user.player.current_track = {};


        if (user.queue.tracksInQueue) {

            // get next from the queue directly
            // get next track and prev Track in playlist by checking for id greater than track id

            user.player.current_track['isPlaylist'] = isPlaylist == true || isPlaylist == 'true' ? true : false;
            user.player.current_track['trackId'] = trackID;
            user.player.current_track['playlistId'] = id;
            await user.save();
            await this.setNextPrevCurrent(user, trackID);
            return 1;
        }
        return 0;


    },
    // get recently playlists &albums & artist 
    getRecentlyHomePage: async function(user) {
        if (user.playHistory) {
            let recentPlaying = [];
            let playHistory = user.playHistory;
            let limit;
            if (playHistory.length < 20) limit = playHistory.length;
            else limit = 20;
            for (let i = 0; i < limit; i++) {
                // now check type to print 
                if (playHistory[i].sourceType == 'album') {
                    const album = await Album.getAlbumById(playHistory[i].sourceId);
                    if (!album) continue;
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //  TO DO handle repeate (make it return playlists in array & album in another array & artist in another array)
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    const artist = await Artist.getArtist(album.artistId);
                    recentPlaying.push({ id: album._id, name: album.name, type: "album", album_type: album.albumType, images: album.images, availableMarkets: album.availableMarkets, artist: { type: 'artist', id: album.artistId, name: artist.Name } })
                } else if (playHistory[i].sourceType == 'artist') {
                    const artist = await Artist.getArtist(playHistory[i].sourceId);
                    if (!artist) continue;
                    recentPlaying.push({ genre: artist.genre, type: 'artist', name: artist.Name, images: artist.images, id: artist._id, info: artist.info });
                } else if (playHistory[i].sourceType == 'playlist') {
                    const playlist = await Playlist.getPlaylist(playHistory[i].sourceId);
                    if (!playlist) continue;
                    const user1 = await userDocument.findById(playlist.ownerId);
                    recentPlaying.push({ owner: { id: playlist.ownerId, type: "user", name: user1.displayName }, collaborative: playlist.collaborative, type: 'playlist', name: playlist.name, images: playlist.images, id: playlist._id, Description: playlist.Description, isPublic: playlist.isPublic });
                }
            }
            const recently = { recentlyPlaying: recentPlaying };
            return recently;
        }
        return 0;

    },
    //to clear playHistory when has more than 50 
    clearRecentTracks: async function(user) {
        user.playHistory = [];
        await user.save();
        return 1;
    },
    // add  a track to user recent tracks
    addRecentTrack: async function(user, trackID, sourceType, sourceId) {
        if (user.playHistory) {
            if (user.playHistory.length > 50) user.playHistory.pop();
            user.playHistory.unshift({
                trackId: trackID,
                sourceId: sourceId,
                sourceType: sourceType

            });
            await user.save();
            return 1;
        } else { // if user does not have  playHistory create playHistory
            user.playHistory = [];
            user.playHistory.push({
                trackId: trackID,
                sourceId: sourceId,
                sourceType: sourceType
            });
            await user.save();
            return 1;
        }

    },
    // get recent tracks played by user
    getRecentTracks: function(user, limit) {
        limit = limit || 50;
        let tracks = [];
        if (!user.playHistory) return tracks;
        for (let i = 0; i < Math.min(user.playHistory.length, limit); i++) tracks.push(user.playHistory[i]); // becouse if playHistory less than limit
        return tracks;
    },
    ////////////////////////////////////////////
    ///the queue will have all track in playlist(the same playlist order)
    /// and before them all tracks which add to queue (from last to frist)
    /////////////////////////////////////////////
    // to fill queue
    createQueue: async function(user, isPlaylist, id, trackID) {

        user.player.current_source = id;
        if (isPlaylist == 'true' || isPlaylist == true) {
            user.player.isPlaylist = true;
            const playlist = await Playlist.getPlaylist(id);
            if (!playlist) return 0; // can not create queue becouse not found this playlist
            sourceName = playlist.name;
            user.queue = {}; // create queue
            user.queue.queuIndex = -1; // it is refer to frist element add to queue by add to queue 
            user.queue.tracksInQueue = [];
            if (!playlist.snapshot || playlist.snapshot.length == 0) playlist.snapshot = [{ hasTracks: [] }];
            if (playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length == 0) {
                await user.save();
                return 1;
            }
            let i = 0;
            for (let j = 0; j < playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length; j++) {
                if (trackID == playlist.snapshot[playlist.snapshot.length - 1].hasTracks[j]) {
                    user.queue.index = i;
                }
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
            user.player.isPlaylist = false;
            const album = await Album.getAlbumById(id);
            if (!album) return 0;
            sourceName = album.name;
            user.queue = {}; // when create queue delete last queue
            user.queue.queuIndex = -1;
            user.queue.tracksInQueue = [];
            if (!album.hasTracks) {
                await user.save();
                return 1;
            }
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

    addToQueue: async function(user, trackID, isPlaylist, playlistId) {

        if (!user.queue) {
            user.queue = {};
            user.queue.tracksInQueue = [{
                trackId: trackID,
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
                    trackId: trackID,
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
                        trackId: trackID,
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
                        trackId: trackID,
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
    ////////////////////////////////////////////
    ///next should be from tracks added by add to queue
    ///if no one track next in playlist 
    /////////////////////////////////////////////
    // to skip to next 
    skipNext: async function(user) {
        if(!user.player)user.player={};
        if(!user.player.next_track) user.player.next_track = {};
        if(!user.player.prev_track) user.player.prev_track = {};
        user.player.current_track = user.player.next_track;
        if (user.queue.queuIndex == -1) { // no element add by add to queue
            user.player.prev_track['trackId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].trackId;
            user.player.prev_track['isPlaylist'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].isPlaylist;
            user.player.prev_track['playlistId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].playlistId;
            //if last index for track from  playlist  == last element in queue wrap around 
            if (user.player["last_playlist_track_index"] == user.queue.tracksInQueue.length - 1) {
                user.player["last_playlist_track_index"] = 0;
                user.player.next_track['trackId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] + 1].trackId;
                user.player.next_track['isPlaylist'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] + 1].isPlaylist;
                user.player.next_track['playlistId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] + 1].playlistId;
                await user.save();
                return 2; // to determine it is the frist track in playlist
            } else user.player["last_playlist_track_index"] = user.player["last_playlist_track_index"] + 1;

            if (user.player["last_playlist_track_index"] >= user.queue.tracksInQueue.length - 1) { //if length -1 set next by  frist element in queue
                user.player.next_track['trackId'] = user.queue.tracksInQueue[0].trackId;
                user.player.next_track['isPlaylist'] = user.queue.tracksInQueue[0].isPlaylist;
                user.player.next_track['playlistId'] = user.queue.tracksInQueue[0].playlistId;

            } else {
                user.player.next_track['trackId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] + 1].trackId;
                user.player.next_track['isPlaylist'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] + 1].isPlaylist;
                user.player.next_track['playlistId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] + 1].playlistId;

            }
            await user.save();
        } else {
            if (user.queue.queuIndex == 0) { // if there is one element add by add to queue
                user.queue.tracksInQueue.splice(0, 1); // when play any track which is add by add to queue it should be deleted
                user.player["last_playlist_track_index"]--; // becouse when next this track not be change becouse the current which add by add to queue not add by playlist or album
                if (user.player["last_playlist_track_index"] >= user.queue.tracksInQueue.length - 1) {
                    user.player.next_track['trackId'] = user.queue.tracksInQueue[0].trackId;
                    user.player.next_track['isPlaylist'] = user.queue.tracksInQueue[0].isPlaylist;
                    user.player.next_track['playlistId'] = user.queue.tracksInQueue[0].playlistId;

                } else {
                    user.player.next_track['trackId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] + 1].trackId;
                    user.player.next_track['isPlaylist'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] + 1].isPlaylist;
                    user.player.next_track['playlistId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] + 1].playlistId;

                }
                user.queue.queuIndex = -1; // becouse when delete this track there is not track add by add to queue
                user.player.prev_track['trackId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].trackId;
                user.player.prev_track['isPlaylist'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].isPlaylist;
                user.player.prev_track['playlistId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].playlistId;

                user.player["prev_track"] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].trackId;
                await user.save();
            } else {
                user.queue.tracksInQueue.splice(user.queue.queuIndex, 1);
                user.player["last_playlist_track_index"]--;
                user.queue.queuIndex = user.queue.queuIndex - 1;
                const index = user.queue.queuIndex;
               
                user.player.next_track['trackId'] = user.queue.tracksInQueue[index].trackId;
                user.player.next_track['isPlaylist'] = user.queue.tracksInQueue[index].isPlaylist;
                user.player.next_track['playlistId'] = user.queue.tracksInQueue[index].playlistId;
                
                user.player.prev_track['trackId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].trackId;
                user.player.prev_track['isPlaylist'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].isPlaylist;
                user.player.prev_track['playlistId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].playlistId;
                await user.save();
            }
        }
        return 1;
    },

    //skip to previous
    skipPrevious: async function(user) {
        if(!user.player)user.player={};
        if(!user.player.next_track) user.player.next_track = {};
        if(!user.player.prev_track) user.player.prev_track = {};
        const current = await user.player.current_track['trackId'];
        const lastplaylist = await await user.queue.tracksInQueue[user.player["last_playlist_track_index"]].trackId;
        if (lastplaylist + 1 == current + 1) {
            // if current track == last track from playlist which is in queue
            //which mean that (the current not add to queue by add to queue)
            user.player.current_track = user.player.prev_track;
            // no track added by add to queue
            if (user.queue.queuIndex == -1) {
                user.player.next_track['trackId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].trackId;
                user.player.next_track['isPlaylist'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].isPlaylist;
                user.player.next_track['playlistId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].playlistId;

                await user.save();
                if (user.player["last_playlist_track_index"] == 1) {
                    //the last current is the secound element in the queue and
                    user.player.prev_track['trackId'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].trackId;
                    user.player.prev_track['isPlaylist'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].isPlaylist;
                    user.player.prev_track['playlistId'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].playlistId;
                    user.player["last_playlist_track_index"] = 0;
                    await user.save();
                } else {
                    // if frist track wap around
                    if (user.player["last_playlist_track_index"] == 0) {
                        user.player["last_playlist_track_index"] = user.queue.tracksInQueue.length - 1;
                        user.player.prev_track['trackId'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 2].trackId;
                        user.player.prev_track['isPlaylist'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 2].isPlaylist;
                        user.player.prev_track['playlistId'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 2].playlistId;


                    } else {
                        user.player.prev_track['trackId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] - 2].trackId;
                        user.player.prev_track['isPlaylist'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] - 2].isPlaylist;
                        user.player.prev_track['playlistId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] - 2].playlistId;

                        user.player["last_playlist_track_index"]--;
                    }
                }
                await user.save();
                return 0;
            } else {
                user.player.next_track['trackId'] = user.queue.tracksInQueue[user.queue.queuIndex].trackId;
                user.player.next_track['isPlaylist'] = user.queue.tracksInQueue[user.queue.queuIndex].isPlaylist;
                user.player.next_track['playlistId'] = user.queue.tracksInQueue[user.queue.queuIndex].playlistId;

                if (user.player["last_playlist_track_index"] == user.queue.queuIndex + 2) {
                    user.player.prev_track['trackId'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].trackId;
                    user.player.prev_track['isPlaylist'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].isPlaylist;
                    user.player.prev_track['playlistId'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].playlistId;

                    user.player["last_playlist_track_index"]--;
                    await user.save();
                } else {
                    if (user.player["last_playlist_track_index"] == user.queue.queuIndex + 1) {
                        user.player["last_playlist_track_index"] = user.queue.tracksInQueue.length - 1;
                        user.player.prev_track['trackId'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 2].trackId;
                        user.player.prev_track['isPlaylist'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 2].isPlaylist;
                        user.player.prev_track['playlistId'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 2].playlistId;

                    } else {
                        user.player.prev_track['trackId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] - 2].trackId;
                        user.player.prev_track['isPlaylist'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] - 2].isPlaylist;
                        user.player.prev_track['playlistId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] - 2].playlistId;
                        user.player["last_playlist_track_index"]--;
                    }
                }
                await user.save();
                return 0;
            }
        } else {
            user.player.current_track['trackId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].trackId;
            user.player.current_track['isPlaylist'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].isPlaylist;
            user.player.current_track['playlistId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].playlistId;
            if (user.player["last_playlist_track_index"] == user.queue.queuIndex + 1) {
                user.player.prev_track['trackId'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].trackId;
                user.player.prev_track['isPlaylist'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].isPlaylist;
                user.player.prev_track['playlistId'] = user.queue.tracksInQueue[user.queue.tracksInQueue.length - 1].playlistId;

            } else {
                user.player.prev_track['trackId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] - 1].trackId;
                user.player.prev_track['isPlaylist'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] - 1].isPlaylist;
                user.player.prev_track['playlistId'] = user.queue.tracksInQueue[user.player["last_playlist_track_index"] - 1].playlistId;
            }
            await user.save();
            return 0;
        }
    },
    // get next songs in user queue
    getQueue: async function(user) {
        const queue = user.queue;
        let tracks = [];
        if (!queue) return 0;
        if (!queue.tracksInQueue) return 0;
        const queueIndex = queue.queuIndex;
        // get tracks that was added to queue
        for (let i = 0; i < queueIndex; i++) {
            const track = await Track.getFullTrack(queue.tracksInQueue[i].trackId, user);
            if (!track) return 0;
            const album5 = await Album.getAlbumById(track.albumId);
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
    // to resume playing song
    resumePlaying: async function(user) {
        const player = user.player;
        if (!player) return 0;
        user.player["is_playing"] = true;
        await user.save();
        return 1;
    },
    //to pause playing song
    pausePlaying: async function(user) {
        const player = user.player;
        if (!player) return 0;
        user.player["is_playing"] = false;
        await user.save();
        return 1;
    },
    //random function
    rondom: async function(low, high) {
        const randomValue = await Math.floor(Math.random() * (high - low + 1) + low);
        return randomValue;
    },
    // to random tracks which add by playlist
    shuffleQueue: async function(user) {
        const track_last_playlist = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].trackId;
        for (let i = user.queue.queuIndex + 1; i < user.queue.tracksInQueue.length; i++) {
            const randomIndex = await this.rondom(user.queue.queuIndex + 1, user.queue.tracksInQueue.length - 1);
            const temp = user.queue.tracksInQueue[i].trackId;
            user.queue.tracksInQueue[i].trackId = user.queue.tracksInQueue[randomIndex].trackId;
            user.queue.tracksInQueue[randomIndex].trackId = temp;
            await user.save();
        }
        return await this.setNextPrevCurrent(user, track_last_playlist);
    },
    // to make queue same playlist order
    fillByplaylist: async function(user) {
        const track_last_playlist = user.queue.tracksInQueue[user.player["last_playlist_track_index"]].trackId;
        if (user.player.isPlaylist) {
            const playlist = await Playlist.getPlaylist(user.player.current_source);
            if (!playlist.snapshot || playlist.snapshot.length == 0) playlist.snapshot = [{ hasTracks: [] }];
            if (playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length == 0) {
                await user.save();
                return await this.setNextPrevCurrent(user, track_last_playlist);
            }
            let i = user.queue.queuIndex + 1;
            for (let j = 0; j < playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length; j++) {
                user.queue.tracksInQueue[i].trackId = playlist.snapshot[playlist.snapshot.length - 1].hasTracks[j];
                user.queue.tracksInQueue[i].isPlaylist = user.player.isPlaylist;
                user.queue.tracksInQueue[i].playlistId = user.player.current_source;
                i++;
            }
            await user.save();
            return await this.setNextPrevCurrent(user, track_last_playlist);
        } else {
            const album = await Album.getAlbumById(user.player.current_source);
            if (!album) return 0;
            if (!album.hasTracks) {
                await user.save();
                return await this.setNextPrevCurrent(user, track_last_playlist);
            }
            let i = 0;
            for (let track of album.hasTracks) {
                user.queue.tracksInQueue[i].trackId = track.trackId;
                user.queue.tracksInQueue[i].isPlaylist = user.player.isPlaylist;
                user.queue.tracksInQueue[i].playlistId = user.player.current_source;
                i++;
            }
            await user.save();
            return await this.setNextPrevCurrent(user, track_last_playlist);
        }
    },
    //shuffle
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
    // set next and prev and current when fill queue or shuffle
    setNextPrevCurrent: async function(user, lastTrack) {
        if(!user.player)user.player={};
        if(!user.player.next_track) user.player.next_track = {};
        if(!user.player.prev_track) user.player.prev_track = {};
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
    },
    // put repeat playlist mode
    repreatPlaylist: async function(user, state) {
        if(!user.player)user.player={};
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