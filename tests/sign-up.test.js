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


