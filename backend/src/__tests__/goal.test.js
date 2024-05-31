const supertest = require('supertest');
const http = require('http');

const db = require('./db');
const app = require('../app');

let server;
let userToken1;

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


test('POST /v0/goal creates goal 200', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      title: 'title',
      description: 'description',
      recurrence: '1',
      startdate: '2024-05-10',
      enddate: '2024-05-20',
      memberCount: 1,
    })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(goal.status).toBe(200);
  expect(goal.body).toHaveProperty('id');
  expect(goal.body.title).toBe('title');
  expect(goal.body.description).toBe('description');
  expect(goal.body.startdate).toBe('2024-05-10');
  expect(goal.body.enddate).toBe('2024-05-20');
  expect(goal.body.recurrence).toBe('1');
});

// creating post with missing title
test('POST /v0/goal with missing title returns 400', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      description: 'description',
      recurrence: '1',
      startdate: '2024-05-10',
      enddate: '2024-05-20',
    })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(goal.status).toBe(400);
});

// create goal with missing description
test('POST /v0/goal with missing description returns 400', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      title: 'title',
      recurrence: '1',
      startdate: '2024-05-10',
      enddate: '2024-05-20',
      memberCount: 1,
    })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(goal.status).toBe(400);
});

test('POST /v0/goal with missing recurrence returns 400', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      title: 'title',
      description: 'description',
      startdate: '2024-05-10',
      enddate: '2024-05-20',
      memberCount: 1,
    })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(goal.status).toBe(400);
});

// create goal with missing startdate
test('POST /v0/goal creates goal', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      title: 'title',
      description: 'description',
      recurrence: '1',
      enddate: '2024-05-20',
      memberCount: 1,
    })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(goal.status).toBe(400);
});

// create goal with missing enddate
test('POST /v0/goal creates goal', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      title: 'title',
      description: 'description',
      recurrence: '1',
      startdate: '2024-05-10',
      memberCount: 1,
    })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(goal.status).toBe(400);
});

test('GET /v0/goal/:id returns goal 200', async () => {
  const goal = await request.post('/v0/goal')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`)
    .send({
      title: 'title',
      description: 'description',
      recurrence: '1',
      startdate: '2024-05-10',
      enddate: '2024-05-20',
      memberCount: 1,
    });

  const res = await request.get('/v0/goal/' + goal.body.id)
    .set('Authorization', `Bearer ${userToken1}`);

  expect(res.status).toBe(200);
  expect(res.body.id).toBe(goal.body.id);
  expect(res.body.title).toBe(goal.body.title);
  expect(res.body.description).toBe(goal.body.description);
  expect(res.body.startdate).toBe(goal.body.startdate);
  expect(res.body.enddate).toBe(goal.body.enddate);
  expect(res.body.recurrence).toBe(goal.body.recurrence);
});

test('GET goal with random goal id returns 404', async () => {
  const randomId = crypto.randomUUID();
  await request.get('/v0/goal/' + randomId)
    .set('Authorization', `Bearer ${userToken1}`)
    .expect(404);
});

test('GET /v0/goal with valid page, size, and search term ' +
  'gets goals 200', async () => {
  // create sample goal data
  const promises = [];
  for (let i = 1; i <= 10; i++) {
    promises.push(request.post('/v0/goal')
      .send({
        title: 'newtitle' + i,
        description: 'newdescription' + i,
        recurrence: '' + i,
        tag: '' + i,
        startdate: '2024-05-10' + i,
        enddate: '2024-05-20' + i,
        memberCount: 1,
      })
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${userToken1}`),
    );
  }
  await Promise.all(promises);

  const res = await request.get('/v0/goal?size=100&page=1&search=title')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(10);
});

test('GET /v0/goal with undefined size and search term' +
  'returns goal data ', async () => {
  // create sample goal data
  const promises = [];
  for (let i = 1; i <= 20; i++) {
    promises.push(request.post('/v0/goal')
      .send({
        title: 'newtitle' + i,
        description: 'newdescription' + i,
        recurrence: '' + i,
        tag: '' + i,
        startdate: '2024-05-10' + i,
        enddate: '2024-05-20' + i,
        memberCount: 1,
      })
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${userToken1}`),
    );
  }
  await Promise.all(promises);

  const res = await request.get('/v0/goal?page=1&size=21')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(21);
});

test('GET /v0/goal with valid filter' +
  ' returns goal data ', async () => {
  // create sample goal data
  const promises = [];
  for (let i = 1; i <= 5; i++) {
    promises.push(request.post('/v0/goal')
      .set('Authorization', `Bearer ${userToken1}`)
      .send({
        title: 'newtitle' + i,
        description: 'newdescription' + i,
        recurrence: '' + i,
        tag: 'Athletics' + i,
        startdate: new Date().toISOString(),
        enddate: new Date().toISOString(),
        memberCount: 1
      }));
  }
  for (let i = 1; i <= 5; i++) {
    promises.push(request.post('/v0/goal')
      .set('Authorization', `Bearer ${userToken1}`)
      .send({
        title: 'newtitle' + i,
        description: 'newdescription' + i,
        recurrence: '' + i,
        tag: 'Hobbies' + i,
        startdate: new Date().toISOString(),
        enddate: new Date().toISOString(),
        memberCount: 1,
      }));
  }
  await Promise.all(promises);

  const res = await supertest(server)
    .get('/v0/goal?size=100&page=1&search=title&tag=Athletics')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(5);
  for (let i = 1; i <= 5; i++) {
    const expectedObject = {
      title: 'newtitle' + i,
      description: 'newdescription' + i,
      recurrence: '' + i,
      tag: '' + i,
    };
    // find matching object if it exists
    const matchingObject = res.body.find((obj) => {
      return (
        obj.title === expectedObject.title &&
        obj.description === expectedObject.description &&
        obj.recurrence === expectedObject.recurrence
      );
    });

    expect(matchingObject).toBeDefined();
  }
});
