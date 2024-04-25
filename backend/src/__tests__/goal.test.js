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


test('POST /v0/goal creates goal', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      title: 'title',
      description: 'description',
      recurrence: '1',
    })
    .set('Content-Type', 'application/json');
  expect(goal.status).toBe(200);
  expect(goal.body).toHaveProperty('id');
  expect(goal.body.title).toBe('title');
  expect(goal.body.description).toBe('description');
  expect(goal.body.recurrence).toBe('1');
});

// creating post with missing title
test('POST /v0/goal creates goal', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      description: 'description',
      recurrence: '1',
    })
    .set('Content-Type', 'application/json');
  expect(goal.status).toBe(400);
});

// create goal with missing description
test('POST /v0/goal creates goal', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      title: 'title',
      recurrence: '1',
    })
    .set('Content-Type', 'application/json');
  expect(goal.status).toBe(400);
});

// create goal with missing recurrence
test('POST /v0/goal creates goal', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      title: 'title',
      description: 'description',
    })
    .set('Content-Type', 'application/json');
  expect(goal.status).toBe(400);
});

test('GET /v0/goal/:id returns goal data from the database', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      title: 'title',
      description: 'description',
      recurrence: '1',
    });

  const res = await supertest(server).get('/v0/goal/' + goal.body.id);

  expect(res.status).toBe(200);
  expect(res.body.id).toBe(goal.body.id);
  expect(res.body.title).toBe(goal.body.title);
  expect(res.body.description).toBe(goal.body.description);
  expect(res.body.recurrence).toBe(goal.body.recurrence);
});

test('GET goal returns NOT FOUND', async () => {
  const randomId = crypto.randomUUID();
  await request.get('/v0/goal/' + randomId)
    .expect(404);
});
