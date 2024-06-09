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

test('true is true', () => {
  expect(true).toBe(true);
});


// test('GET /v0/profile/:id', async () => {
//   const res = await request.get('/v0/profile/' + userId)
//     .set('Authorization', `Bearer ${userToken1}`);
//
//   expect(res.status).toBe(200);
//   expect(res.body.id).toBe(profile.body.id);
//   expect(res.body.name).toBe(profile.body.name);
//   expect(res.body.bio).toBe(profile.body.bio);
//   expect(res.body.topGoals).toBe(profile.body.topGoals);
// });
//
//
// test('POST /v0/profile edits user', async () => {
//   const profile = await request.post('/v0/profile')
//     .send({
//       name: 'new name',
//       bio: 'new bio',
//     })
//     .set('Content-Type', 'application/json')
//     .set('Authorization', `Bearer ${userToken1}`);
//   expect(profile.status).toBe(200);
//   expect(profile.body.name).toBe('new name');
//   expect(profile.body.bio).toBe('new bio');
// });
//
