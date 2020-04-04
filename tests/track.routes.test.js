// track api E2E testing
const app = require('../test'); // this file doesnt exist and should be server.js
const request = require('supertest')(app); 

const trackID = "5e6ba103c0fffd3db08290e0";//in local DB
const userID = "5e6ba114f864e93f84ce90bf";//in localDB
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTZiY2ZlYzE1ZGE4OTM0YmMyMTE0ZDUiLCJpYXQiOjE1ODQyMDg3NzgsImV4cCI6MTU4NDI5NTE3OH0.QJ2Q7qM2XM1Gn950bhCuaco4fgP7GJiLh4Yux30LLiU"; // must be updated frequently
it('get track authoriized',async (done) => {

const response = await request.get('/track/'+trackID) .set({ "x-auth-token": token })

expect(response.status).toBe(200)
done();
});

it('gets track unauthorized user', async done => {
const response = await request.get('/track/'+trackID)

expect(response.status).toBe(401)
//expect(response.body.message).toBe('pass!')
done()
})


it('user like track for first time ',async (done) => {

const response = await request.put('/me/like/'+trackID) .set({ "x-auth-token": token })

expect(response.body.success).toBe("liked the song successfully")
done();
});

it('user like track not for first time ',async (done) => {

const response = await request.put('/me/like/'+trackID) .set({ "x-auth-token": token })

expect(response.body.error).toBe("already liked the song")
done();
});

it('user unlike track  for liked track ',async (done) => {

  const response = await request.delete('/me/unlike/'+trackID) .set({ "x-auth-token": token })
  
  expect(response.body.success).toBe("unliked the song successfully")
  done();
  });

  
it('user unlike track  for unliked track ',async (done) => {

  const response = await request.delete('/me/unlike/'+trackID) .set({ "x-auth-token": token })
  
  expect(response.body.error).toBe("user didnt liked the song before")
  done();
  });
  

