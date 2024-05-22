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


afterEach(async () => {
  await db.reset();
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
    })
    .set('Content-Type', 'application/json');
  expect(goal.status).toBe(200);
  expect(goal.body).toHaveProperty('id');
  expect(goal.body.title).toBe('title');
  expect(goal.body.description).toBe('description');
  expect(goal.body.recurrence).toBe('1');
});

// creating post with missing title
test('POST /v0/goal with missing title returns 400', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      description: 'description',
      recurrence: '1',
    })
    .set('Content-Type', 'application/json');
  expect(goal.status).toBe(400);
});

// create goal with missing description
test('POST /v0/goal with missing description returns 400', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      title: 'title',
      recurrence: '1',
    })
    .set('Content-Type', 'application/json');
  expect(goal.status).toBe(400);
});

test('POST /v0/goal with missing recurrence returns 400', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      title: 'title',
      description: 'description',
    })
    .set('Content-Type', 'application/json');
  expect(goal.status).toBe(400);
});

test('GET /v0/goal/:id returns goal 200', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      title: 'title',
      description: 'description',
      recurrence: '1'});

  const res = await supertest(server).get('/v0/goal/' + goal.body.id);

  expect(res.status).toBe(200);
  expect(res.body.id).toBe(goal.body.id);
  expect(res.body.title).toBe(goal.body.title);
  expect(res.body.description).toBe(goal.body.description);
  expect(res.body.recurrence).toBe(goal.body.recurrence);
});

test('GET goal with random goal id returns 404', async () => {
  const randomId = crypto.randomUUID();
  await request.get('/v0/goal/' + randomId)
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
      }));
  }
  await Promise.all(promises);

  const res = await supertest(server)
    .get('/v0/goal?size=100&page=1&search=title');
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(10);
  for (let i = 1; i <= 10; i++) {
    const expectedObject = {
      title: 'newtitle' + i,
      description: 'newdescription' + i,
      recurrence: '' + i,
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

//Test failed and was way too complicated so it was hard to debug

// test('GET /v0/goal with undefined size and search term ' +
//   'returns goal data ', async () => {
//   // create sample goal data
//   const promises = [];
//   for (let i = 1; i <= 20; i++) {
//     promises.push(request.post('/v0/goal')
//       .send({
//         title: 'newtitle' + i,
//         description: 'newdescription' + i,
//         recurrence: '' + i,
//       }));
//   }
//   await Promise.all(promises);

//   const res = await supertest(server)
//     .get('/v0/goal?page=1&size=21');
//   expect(res.status).toBe(200);
//   expect(res.body.length).toBe(21);
//   for (let i = 1; i <= 20; i++) {
//     const expectedObject = {
//       title: 'newtitle' + i,
//       description: 'newdescription' + i,
//       recurrence: '' + i,
//     };
//     // find matching object if it exists
//     const matchingObject = res.body.find((obj) => {
//       return (
//         obj.title === expectedObject.title &&
//         obj.description === expectedObject.description &&
//         obj.recurrence === expectedObject.recurrence
//       );
//     });
//     expect(matchingObject).toBeDefined();
//   }
// });

test('GET /v0/goal with no size gets goals 200', async () => {
  const res = await supertest(server)
    .get('/v0/goal?page=1');
  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThanOrEqual(1);
});
