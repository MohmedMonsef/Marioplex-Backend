const request = require('supertest');
const app = require('../server');

it('userprivate with valid id', (done) => {
    request(app).get('/users/5e695164e1b70d2ebc779a91')
      .then((res) => {
        const body = res.body;
        expect("user exists")
        done();
        
      })
      .catch((err) => done(err));
  });

it('userprivate with invalid id ', (done) => {
    request(app).get('/users/1234')
      .then((res) => {
        const body = res.body;
        expect("user not found")
        done();
        
      })
      .catch((err) => done(err));
  });
