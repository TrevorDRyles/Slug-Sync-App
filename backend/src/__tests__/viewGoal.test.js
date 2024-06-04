const supertest = require('supertest');
const http = require('http');

const db = require('./db');
const app = require('../app');

let server;
let userToken1;
let userToken2;

// depends on current hardcoded schema
const GOAL_ID = '1e0d7c46-2194-4a30-b8e5-1b0a7c287e81';
const GOAL_ID_2 = '2e0d7c46-2194-4a30-b8e5-1b0a7c287e82';

beforeAll(async () => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
  await db.reset();
});

beforeEach(async () => {
  const response = await request.post('/v0/login').send({
    email: 'hunter@ucsc.edu',
    password: 'huntertratar',
  })
    .set('Content-Type', 'application/json');
  userToken1 = response.body.token;

  const response2 = await request.post('/v0/login').send({
    email: 'arelyx@example.com',
    password: 'arelyxuser',
  })
    .set('Content-Type', 'application/json');
  userToken2 = response2.body.token;
});

afterAll((done) => {
  server.close(done);
  db.shutdown();
});

test('GET /v0/goal/:id/members get goal members', async () => {
  const goal = await request.get(`/v0/goal/${GOAL_ID}/members`)
    .send()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(goal.body[0]).toHaveProperty("id");
  expect(goal.body[0]).toHaveProperty("username");
  expect(goal.body[0]).toHaveProperty("role");
  expect(goal.status).toBe(200);
});

test('POST /v0/goal/:id/leave leave goal as creator', async () => {
  const goal = await request.post(`/v0/goal/${GOAL_ID}/leave`)
    .send()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);

  console.log(goal.body);
  expect(goal.status).toBe(401);
});


test('DELETE /v0/goal/:id/delete attempt to delete goal as a member', async () => {
  const goal = await request.delete(`/v0/goal/${GOAL_ID}`)
    .send()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken2}`);
  expect(goal.status).toBe(401);
});

test('POST /v0/goal/:id/leave leave goal', async () => {
  const goal = await request.post(`/v0/goal/${GOAL_ID}/leave`)
    .send()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken2}`);

  console.log(goal.body);
  expect(goal.status).toBe(200);
});

test('POST /v0/goal/:id/leave attempt to leave goal a second time', async () => {
  const goal = await request.post(`/v0/goal/${GOAL_ID}/leave`)
    .send()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken2}`);

  expect(goal.status).toBe(401);
});

test('POST /v0/goal/:id/leave attempt to leave goal a second time', async () => {
  const goal = await request.post(`/v0/goal/${GOAL_ID}/leave`)
    .send()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken2}`);

  expect(goal.status).toBe(401);
});

test('DELETE /v0/goal/:id delete a goal', async () => {
  const goal = await request.delete(`/v0/goal/${GOAL_ID}`)
    .send()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(goal.status).toBe(200);
});

test('DELETE /v0/goal/:id delete a goal that does not exist', async () => {
  const goal = await request.delete(`/v0/goal/${GOAL_ID}`)
    .send()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(goal.status).toBe(404);
});

test('POST /v0/goal/:id leave a goal that does not exist', async () => {
  const goal = await request.post(`/v0/goal/${GOAL_ID}/leave`)
    .send()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken2}`);

  console.log(goal.body);
  expect(goal.status).toBe(404);
});

test('POST /v0/goal/:id/join join a goal', async () => {
  const goal = await request.post(`/v0/goal/${GOAL_ID_2}/join`)
    .send()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken2}`);

  console.log(goal.body);
  expect(goal.status).toBe(200);
});

test('POST /v0/goal/:id/join join a goal while already in it', async () => {
  const goal = await request.post(`/v0/goal/${GOAL_ID_2}/join`)
    .send()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken2}`);

  console.log(goal.body);
  expect(goal.status).toBe(400);
});