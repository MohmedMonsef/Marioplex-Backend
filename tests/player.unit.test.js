

const MockPlayer = {
 getNextAndPrev : function(hasTracks,trackID,user){
    if (user.queue.queuIndex == -1){
        for(let i=0;i<hasTracks.length;i++){
            if(trackID == hasTracks[i].trackId){
                return {
                    "next_track":i+1<hasTracks.length?hasTracks[i+1]:0,//wrap around
                    "prev_track":i-1>=0?hasTracks[i-1]:hasTracks[hasTracks.length-1],// wrap around
                    "last_playlist_track_index": i ,
                }
            }
        }
    }
   else{
        for(let i=user.queue.queuIndex+1;i<hasTracks.length;i++){
            if(trackID == hasTracks[i].trackId){

                return {
                    "next_track":i+1<hasTracks.length?user.queue.tracksInQueue[user.queue.queuIndex]:0,//wrap around
                    "prev_track":i-1>=user.queue.queuIndex+1?hasTracks[i-1]:hasTracks[hasTracks.length-1],// wrap around
                    "last_playlist_track_index": i ,
                }
            }
        } 
   }
    return {
        "next_track":undefined,
        "prev_track":undefined,
    }   
},
setPlayerInstance: function(user,trackID){
    
        // get next from the queue directly
       // get next track and prev Track in playlist by checking for id greater than track id
       const {"next_track":nextTrack,"prev_track":prevTrack,"last_playlist_track_index":current_index} = this.getNextAndPrev(user.queue.tracksInQueue,trackID,user);
        user.player["next_track"] = nextTrack ? nextTrack.trackId:undefined;
        user.player["prev_track"] = prevTrack? prevTrack.trackId:undefined;
        user.player["current_track"] = trackID;
        user.player["last_playlist_track_index"] = current_index;
        user.player["is_playing"] = true;
         
       return 1;
    
},
addRecentTrack: async function(user,trackID){
    if(user.playHistory){
        if(user.playHistory.length > 50)user.playHistory.pop();
        user.playHistory.unshift({
            trackId:trackID
    
        });

        return 1;
    }else{
        user.playHistory = [];
        user.playHistory.push({
            trackId:trackID
        });
     
        return 1;
    }
    
},
// clear user recent played track history
clearRecentTracks:  function(user){
    user.playHistory = [];
    return 1;
},
// get recent tracks played by user
getRecentTracks:  function(user,limit){
    limit = limit || 50;
    let tracks= [];
    if(!user.playHistory) return tracks;
    for(let i=0;i<Math.min(user.playHistory.length,limit);i++) tracks.push(user.playHistory[i]);
    return tracks;
},

// to fill queue
createQueue:  function(user,isPlaylist,source,trackID,id)
{
    if(!user.player) user.player = {};
    user.player.isPlaylist=isPlaylist;
    user.player.current_source=id;
   if(isPlaylist) 
   {
        const playlist =  source;
      
        if(!playlist) return 0;
        sourceName = playlist.name;
        user.queue = {};
        user.queue.queuIndex = -1;
        user.queue.tracksInQueue = [];
        if(!playlist.snapshot || playlist.snapshot.length == 0) playlist.snapshot = [{hasTracks:[]}];
        console.log(playlist.snapshot,playlist);
        if(playlist.snapshot[playlist.snapshot.length-1].hasTracks.length==0){
           
            return 1;
        }
        let i=0;
        for(let j=0;j<playlist.snapshot[playlist.snapshot.length-1].hasTracks.length;j++){
            if(trackID == playlist.snapshot[playlist.snapshot.length-1].hasTracks[j]){
                    user.queue.index = i;
            }
            user.queue.tracksInQueue.push({
                trackId : playlist.snapshot[playlist.snapshot.length-1].hasTracks[j],
                isQueue: false
            });
            i++;
        }

       
        user.queue.fristQueueIndex=-1;
       
        return 1;
   }else{
    const album =  source;
    if(!album) return 0;
    sourceName = album.name;
    user.queue = {};
    user.queue.queuIndex = -1;
    user.queue.tracksInQueue = [];
    if(!album.hasTracks){
       
        return 1;
    }
    let i=0;
    for(let track of album.hasTracks){
        user.queue.tracksInQueue.push({
            trackId : track.trackId,
            isQueue: false
        });
        i++;
    }
   
    //console.log(user.queue);
    return 1;
   }        
},
resumePlaying:  function(user){
    const player = user.player;
    if(!player) return 0;
    user.player["is_playing"] = true;
   
    return 1;
},
pausePlaying:  function(user){
    const player = user.player;
    if(!player) return 0;
    user.player["is_playing"] = false;
  
    return 1;
},
    
}
const playlist = {
  _id:"playlist1",
  ownerId:"user1" ,
  type:"Playlist" ,
  collaborative:false ,
  Description:"simple playlist test",
  name:"playlist 1" ,
  isPublic:true ,
  images:[] ,
  snapshot:[
      {
          hasTracks : ["track1","track2","track3","track4","track5"],
          action : "add tracks"
      }
  ]
}
const album = {
    _id:"album1",
    images:[] ,
    artistId: "artist1" ,
    name:"album 1" ,
    type:"Album" ,
    albumType:"any" ,
    popularity:1 ,
    genre:"amy" ,
    releaseDate:Date.now() ,
    availableMarkets: ["eg"] ,
    releaseDatePercision: "month" ,
    label:"any label" ,
    hasTracks:[
        {
        trackId: "track6",
        //ref: 'Track'
      },
      {
        trackId: "track7",
        //ref: 'Track'
      },
      {
        trackId: "track8",
        //ref: 'Track'
      },
      {
        trackId: "track9",
        //ref: 'Track'
      },
      {
        trackId: "track10",
        //ref: 'Track'
      },
    ]
}
const user = {
    _id:"user1",
    playHistory:[],
    queue:{},
    player:{}
}
// MockPlayer.createQueue(user,true,playlist,"track2","playlist1");
// MockPlayer.setPlayerInstance(user,"track2")
// MockPlayer.addRecentTrack(user,"track2");
// MockPlayer.addRecentTrack(user,"track3");
// console.log(MockPlayer.getRecentTracks(user,50))
// console.log(MockPlayer.getRecentTracks(user,1))
// MockPlayer.clearRecentTracks(user);
// console.log(user.playHistory);
// MockPlayer.pausePlaying(user);
// console.log(user.player.is_playing);
// MockPlayer.resumePlaying(user)
// console.log(user.player.is_playing)
//console.log(user,user.player)
  //  console.log(user.queue);
test('create queue for user for first time from playlist',()=>{
    MockPlayer.createQueue(user,true,playlist,"track2","playlist1");

    // expect that user has his queue and player object sets 
    expect(user.queue).toEqual({
        queuIndex: -1,
        tracksInQueue: [
          { trackId: 'track1', isQueue: false },
          { trackId: 'track2', isQueue: false },
          { trackId: 'track3', isQueue: false },
          { trackId: 'track4', isQueue: false },
          { trackId: 'track5', isQueue: false }
        ],
        index: 1,
        fristQueueIndex: -1
      });

}) 

test('set player for user for first time after creating queue',()=>{
    MockPlayer.setPlayerInstance(user,"track2");
   
    // expect that user has his queue and player object sets 
    expect(user.player).toEqual({
 isPlaylist: true,
 current_source: 'playlist1',
 next_track: 'track3',
 prev_track: 'track1',
 current_track: 'track2',
 last_playlist_track_index: 1,
 is_playing: true
});

}) 

test('add to recent tracks track 2 and track 3',()=>{
    MockPlayer.addRecentTrack(user,"track2");
    MockPlayer.addRecentTrack(user,"track3");
   
    // expect that user has his queue and player object sets 
    expect(user.playHistory).toEqual([ { trackId: 'track3' }, { trackId: 'track2' } ]);

}) 

test('get recent tracks of user',()=>{
   
   
    // expect that user has his queue and player object sets 
    expect(MockPlayer.getRecentTracks(user)).toEqual([ { trackId: 'track3' }, { trackId: 'track2' } ]);

}) 


test('clear recent tracks of user',()=>{
    MockPlayer.clearRecentTracks(user);
   
    // expect that user has his queue and player object sets 
    expect(MockPlayer.getRecentTracks(user)).toEqual([ ]);

}) 

test('pause user playback',()=>{
   MockPlayer.pausePlaying(user);
   
    // expect that user has his queue and player object sets 
    expect(user.player.is_playing).toBeFalsy();

}) 

test('resume user playback',()=>{
   MockPlayer.resumePlaying(user);
   
    // expect that user has his queue and player object sets 
    expect(user.player.is_playing).toBeTruthy();

}) 