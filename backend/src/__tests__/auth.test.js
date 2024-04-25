const supertest = require('supertest');
const http = require('http');

const db = require('./db');
const app = require('../app');

let server;

beforeAll(() => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
  return db.reset();
});

afterAll((done) => {
  server.close(done);
  db.shutdown();
});

const goodCredentials = {
  name: 'testname',
  email: 'test@email.com',
  password: 'testpassword',
};

test('POST successful /signup returns 201', async () => {
  await request.post('/v0/signup')
    .send(goodCredentials)
    .expect(201);
});

test('POST /signup bad email "BadEmail.com" returns 400', async () => {
  await request.post('/v0/signup')
    .send({
      name: goodCredentials.name,
      email: 'BadEmail.com',
      password: goodCredentials.password,
    })
    .expect(400);
});

test('POST /signup bad email "BadEmail@com" returns 400', async () => {
  await request.post('/v0/signup')
    .send({
      name: goodCredentials.name,
      email: 'BadEmail@com',
      password: goodCredentials.password,
    })
    .expect(400);
});

test('POST /signup bad email "BadEmail" returns 400', async () => {
  await request.post('/v0/signup')
    .send({
      name: goodCredentials.name,
      email: 'BadEmail',
      password: goodCredentials.password,
    })
    .expect(400);
});

test('POST duplicate email /signup error ROLLBACK', async () => {
  await request.post('/v0/signup')
    .send(goodCredentials)
    .expect(403);
});
