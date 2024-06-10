const supertest = require('supertest');
const http = require('http');

const db = require('./db');
const app = require('../app');

let server;
let accessToken;

beforeAll(async () => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
  await db.reset();
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

test('Get all completed goals 200', async () => {
  await request.get('/v0/goal/completed')
    .set('Authorization', `Bearer: ${accessToken}`)
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined();
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[0].title).toBe('Walk a mile');
      expect(res.body[0].description)
        .toBe('Walk a mile every day to be healthy!');
      expect(res.body[0].recurrence).toBe('1 day');
    });
});

test('Get all incompleted goals 200', async () => {
  await request.get('/v0/goal/incompleted')
    .set('Authorization', `Bearer: ${accessToken}`)
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined();
      expect(res.body.length).toEqual(3);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[0].title).toBe('Learn React');
      expect(res.body[0].description)
        .toBe('Learn React');
      expect(res.body[0].recurrence).toBe('1 day');
    });
});

test('Get all completed goals no auth header 401', async () => {
  await request.get('/v0/goal/completed')
    .expect(401);
});

test('Gets all completed goals bad auth 403', async () => {
  await request.get('/v0/goal/completed')
    .set('Authorization', `Bearer: ${crypto.randomUUID()}`)
    .expect(403);
});

test('Get all incompleted goals no auth 401', async () => {
  await request.get('/v0/goal/incompleted')
    .expect(401);
});

test('Gets all incompleted goals bad auth 403', async () => {
  await request.get('/v0/goal/incompleted')
    .set('Authorization', `Bearer: ${crypto.randomUUID()}`)
    .expect(403);
});

test('Successfully complete goal 201', async () => {
  let goalId;
  await request.get('/v0/goal/incompleted')
    .set('Authorization', `Bearer: ${accessToken}`)
    .expect(200)
    .then((res) => {
      goalId = res.body[0].id;
    });
  await request.put(`/v0/complete/${goalId}`)
    .set('Authorization', `Bearer: ${accessToken}`)
    .expect(200)
    .then((res) => {
      expect(res.body.goal_id).toBe(goalId);
    });

  await request.get('/v0/goal/completed')
    .set('Authorization', `Bearer: ${accessToken}`)
    .expect(200)
    .then((res) => {
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
});

test('Complete a goal that doesnt exist 404', async () => {
  const randomId = crypto.randomUUID();
  await request.put(`/v0/complete/${randomId}`)
    .set('Authorization', `Bearer: ${accessToken}`)
    .expect(404);
});

test('Complete a goal unauthorized 401', async () => {
  let goalId;
  await request.get('/v0/goal/incompleted')
    .set('Authorization', `Bearer: ${accessToken}`)
    .expect(200)
    .then((res) => {
      goalId = res.body[0].id;
    });
  await request.put(`/v0/complete/${goalId}`)
    .expect(401);
});

test('Complete a goal bad auth 403', async () => {
  let goalId;
  await request.get('/v0/goal/incompleted')
    .set('Authorization', `Bearer: ${accessToken}`)
    .expect(200)
    .then((res) => {
      goalId = res.body[0].id;
    });
  await request.put(`/v0/complete/${goalId}`)
    .set('Authorization', `Bearer: ${crypto.randomUUID()}`)
    .expect(403);
});

