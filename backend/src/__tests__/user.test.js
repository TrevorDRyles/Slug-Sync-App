const supertest = require('supertest');
const http = require('http');

const db = require('./db');
const app = require('../app');
const USER_ID = '1e0d7c46-2194-4a30-b8e5-1b0a7c287e80';
let server;
let accessToken;

beforeAll(async () => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
  const credentials = {
    'email': 'hunter@ucsc.edu',
    'password': 'huntertratar',
  };
  await request.post('/v0/login')
    .send(credentials)
    .expect(200)
    .then((res) => {
      accessToken = res.body.token;
    });
  return db.reset();
});

afterAll((done) => {
  server.close(done);
  db.shutdown();
});

const USERNAME = 'Hunter';
const EMAIL = 'hunter@ucsc.edu';
const PASSWORD = 'csYJZmEfv86eE';

test('GET /v0/user/:userId gets user information', async () => {
  const goal = await request
    .get(`/v0/user/${USER_ID}`)
    .set('Authorization', `Bearer ${accessToken}`);
  expect(goal.status).toBe(200);
  expect(goal.body.data.name).toBe(USERNAME);
  expect(goal.body.data.email).toBe(EMAIL);
  expect(goal.body.data.password).toBe(PASSWORD);
});

test('GET /v0/user/:userId with invalid user ID returns 404', async () => {
  const goal = await request
    .get(`/v0/user/${crypto.randomUUID()}`)
    .set('Authorization', `Bearer ${accessToken}`);
  expect(goal.status).toBe(404);
});

test('GET /v0/user/:userId with non-uuid user ID returns 400', async () => {
  const goal = await request.get(`/v0/user/123`);
  expect(goal.status).toBe(400);
});

test('GET /v0/user/:userId gets user information without ' +
  'auth header 401', async () => {
  await request
    .get(`/v0/user/${USER_ID}`);
});

test('GET /v0/user gets information about loggeed in user', async() => {
  await request.get(`/v0/user`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(200)
    .then(res => {
      expect(res.body).toBeDefined()
      expect(res.body.id).toBeDefined()
      expect(res.body.name).toBe('Hunter')
      expect(res.body.email).toBe('hunter@ucsc.edu')
      expect(res.body.img).toBeDefined()
    })
})