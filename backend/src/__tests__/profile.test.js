const supertest = require('supertest');
const http = require('http');

const db = require('./db');
const app = require('../app');

let server;
let userToken1;

beforeAll(() => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
  return db.reset();
});

beforeEach(async () => {
  const response = await request.post('/v0/login').send({
    email: 'hunter@ucsc.edu',
    password: 'huntertratar',
  })
    .set('Content-Type', 'application/json');
  userToken1 = response.body.token;
  console.log(userToken1);
  userId = response.body.id;

  const response2 = await request.post('/v0/login').send({
    email: 'arelyx@example.com',
    password: 'arelyxuser',
  })
    .set('Content-Type', 'application/json');
  userToken2 = response2.body.token;
});

afterEach(async () => {
  await db.reset();
});

afterAll((done) => {
  server.close(done);
  db.shutdown();
});

test('GET /v0/profile/:id', async () => {
  const res = await request.get('/v0/profile/' + userId)
    .set('Authorization', `Bearer ${userToken1}`);
  const profile = {
    name: 'Hunter',
    bio: 'Hello!',
  };

  expect(res.status).toBe(200);
  expect(res.body.id).toBeDefined();
  expect(res.body.name).toBe(profile.name);
  expect(res.body.bio).toBe(profile.bio);
  expect(res.body.topGoals).toBeDefined();
});


test('POST /v0/profile edits user', async () => {
  const profile = await request.post('/v0/profile/' + userId)
    .send({
      name: 'new name',
      bio: 'new bio',
      id: userId,
    })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(profile.status).toBe(200);
  expect(profile.body.name).toBe('new name');
  expect(profile.body.bio).toBe('new bio');
});

test('POST /v0/profile edits user', async () => {
  const profile = await request.post('/v0/profile/' + userId)
    .send({
      name: 'new name',
      bio: 'new bio',
      id: userId,
    })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(profile.status).toBe(200);
  expect(profile.body.name).toBe('new name');
  expect(profile.body.bio).toBe('new bio');
});
