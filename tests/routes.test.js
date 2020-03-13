const request = require('supertest');
const app = require('../server');


  it('Clean Signingup', (done) => {
    request(app).post('/signup')
      .send({
        "email":"dinaal@gmail.com" ,
        "password":"18888" ,
        "gender":"female" ,
        "country":"egypt" ,
        "birthDate":"1999-10-03" 
        ,"displayName":"dina"
      })
      .then((res) => {
        const body = res.body;
        expect("User created")
        done();
      })
      .catch((err) => done(err));
  });

  it('invalid Signingup data', (done) => {
    request(app).post('/signup')
      .send({
        "password":"18888" ,
        "gender":"female" ,
        "country":"egypt" ,
        "birthDate":"1999-10-03" ,
        "displayName":"dina"
      })
      .then((res) => {
        const body = res.body;
        expect("error occured")
        done();
      })
      .catch((err) => done(err));
  });

  it('a user exists Signingup', (done) => {
    request(app).post('/signup')
      .send({

        "email":"dinaal89984884333kk3aa@gmail.com" ,
        "password":"18888" , 
         "gender":"female" ,
         "country":"egypt" ,
         "birthDate":"1999-10-03" ,
         "displayName":"dina"
        })
      .then((res) => {
        const body = res.body;
        expect("Mail exists")
        done();
      })
      .catch((err) => done(err));
  });

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

