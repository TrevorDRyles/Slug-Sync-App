const supertest = require('supertest');
const http = require('http');

const db = require('./db');
const app = require('../app');
const USER_ID = '1e0d7c46-2194-4a30-b8e5-1b0a7c287e80';

let server;
let accessToken;

beforeAll(() => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
  return db.reset();
});

beforeEach(async () => {
  const credentials = {
    'email': 'hunter@ucsc.edu',
    'password': 'huntertratr',
  };
  await request.post('/v0/login')
    .send(credentials)
    .then((res) => {
      accessToken = res.body.token;
    });
});


afterEach(async () => {
  await db.reset();
});

afterAll((done) => {
  server.close(done);
  db.shutdown();
});

/**
 * Create a goal
 * @return {Promise<*>}
 */
async function createGoal() {
  const goal = await request.post('/v0/goal')
    .send({
      title: 'title',
      description: 'description',
      recurrence: '1 day',
      comments: [],
      startdate: new Date().toISOString(),
      enddate: new Date().toISOString(),
      memberCount: 1,
    })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer: ${accessToken}`);
  return goal;
}

/**
 * Create a comment
 * @param{*} goal
 * @return {Promise<*>}
 */
async function createComment(goal) {
  const comment = await request.post(`/v0/goal/${goal.body.id}/comment`)
    .send({
      content: 'content',
      date: new Date().toISOString(),
    })
    .set('Authorization', `Bearer: ${accessToken}`)
    .set('Content-Type', 'application/json');
  return comment;
}

test('POST /v0/:goalId/comment creates comment 200', async () => {
  const goal = await createGoal();
  const comment = await createComment(goal);
  expect(comment.status).toBe(200);
  expect(comment.body.id).toBeDefined();
  expect(comment.body.user_id).toBe(USER_ID);
  expect(comment.body.goal_id).toBeDefined();
  expect(comment.body.data.date).toBeDefined();
  expect(comment.body.data.content).toBe('content');
});

test('POST /v0/:goalId/comment with missing goal returns 404', async () => {
  const comment = await request.post(`/v0/goal/${crypto.randomUUID()}/comment`)
    .send({
      content: 'content',
      date: new Date(),
    })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer: ${accessToken}`);
  expect(comment.status).toBe(404);
});

test('POST /v0/:goalId/comment with missing content returns 400', async () => {
  const comment = await request.post(`/v0/goal/${crypto.randomUUID()}/comment`)
    .send({
      date: new Date(),
    })
    .set('Authorization', `Bearer: ${accessToken}`)
    .set('Content-Type', 'application/json');
  expect(comment.status).toBe(400);
});

test('GET /v0/:goalId/comment with one comment gets comments 200', async () => {
  const goal = await createGoal();
  await createComment(goal);

  const comments = await request.get(`/v0/goal/${goal.body.id}/comment`)
    .set('Authorization', `Bearer: ${accessToken}`);
  expect(comments.status).toBe(200);
  expect(comments.body.length).toBe(1);
  expect(comments.body[0].user_id).toBe(USER_ID);
  expect(comments.body[0].goal_id).toBe(goal.body.id);
  expect(comments.body[0].data.date).toBeDefined();
  expect(comments.body[0].data.content).toBe('content');
});

test('GET /v0/:goalId/comment with no comments ' +
  'gets no comments 200', async () => {
  const goal = await createGoal();

  const comments = await request.get(`/v0/goal/${goal.body.id}/comment`)
    .set('Authorization', `Bearer: ${accessToken}`);
  expect(comments.status).toBe(200);
  expect(comments.body.length).toBe(0);
});

test('GET /v0/:goalId/comment with no auth header 401', async () => {
  const goal = await createGoal();

  const comments = await request.get(`/v0/goal/${goal.body.id}/comment`);
  expect(comments.status).toBe(401);
});
