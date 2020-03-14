const request = require('supertest');
const app = require('../server');

  it('ForgetPassword', (done) => {
    request(app).post('/login/forgetpassword')
      .send({
        "email":"nada5aled52@gmail.com" ,
      })
      .then((res) => {
                expect(200);
        done();
      })
      .catch((err) => done(err));
  });

  it('InvalidForgetPassword', (done) => {
    request(app).post('/login/forgetpassword')
      .send({
        "email":"nadaaled52@gmail.com" ,
      })
      .then((res) => {
                expect(403);
        done();
      })
      .catch((err) => done(err));
  });

  


