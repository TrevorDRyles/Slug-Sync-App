const supertest = require('supertest');
const http = require('http');

const db = require('./db');
const app = require('../app');

let server;
let userToken1;
let userToken2;

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
  expect(res.body.length).toBe(12);
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
        startdate: '2024-05-10' + i,
        enddate: '2024-05-20' + i,
        memberCount: 1,
      })
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${userToken1}`));
  }
  await Promise.all(promises);

  const res = await supertest(server)
    .get('/v0/goal?page=1')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(20);
  // for (let i = 1; i <= 20; i++) {
  // const expectedObject = {
  //   title: 'newtitle' + i,
  //   description: 'newdescription' + i,
  //   recurrence: '' + i,
  //   startdate: '2024-05-10' + i,
  //   enddate: '2024-05-20' + i,
  //   memberCount: 1,
  // };
  // find matching object if it exists
  // const matchingObject = res.body.find((obj) => {
  //   return (
  //     obj.title === expectedObject.title &&
  //     obj.description === expectedObject.description &&
  //     obj.recurrence === expectedObject.recurrence
  //     // obj.startdate === expectedObject.startdate &&
  //     // obj.enddate === expectedObject.enddate &&
  //     // obj.memberCount === expectedObject.memberCount
  //   );
  // });
  // expect(matchingObject).toBeDefined();
  // }
});

test('GET /v0/goal with no size gets goals 200', async () => {
  const res = await request.get('/v0/goal?page=1')
    .set('Authorization', `Bearer ${userToken1}`);
  expect(res.status).toBe(200);
});


test('DELETE /v0/goal/:id to delete a goal', async () => {
  // create a goal to be deleted
  const goal = await request.post('/v0/goal')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`)
    .send({
      title: 'title',
      description: 'description',
      recurrence: '1 day',
      memberCount: 1,
      startdate: '2024-05-10',
      enddate: '2024-05-20',
    });

  const goalToBeDeleted = goal.body.id;

  // actually delete the goal
  const deleteGoalRes = await request
    .delete(`/v0/goal/${goalToBeDeleted}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);

  expect(deleteGoalRes.status).toBe(200);
});

test('DELETE /v0/goal/:id invalid user delete goal', async () => {
  // create a goal to be deleted
  const goal = await request.post('/v0/goal')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`)
    .send({
      title: 'title',
      description: 'description',
      recurrence: '1 day',
      memberCount: 1,
      startdate: '2024-05-10',
      enddate: '2024-05-20',
    });

  const goalToBeDeleted = goal.body.id;

  // actually delete the goal
  const deleteGoalRes = await request
    .delete(`/v0/goal/${goalToBeDeleted}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken2}`);

  expect(deleteGoalRes.status).toBe(401);
});

test('DELETE /v0/goal/:id delete a goal that doesn\'t exist', async () => {
  // attempt to delete an invalid goal
  const deleteGoalRes = await request.delete(`/v0/goal/${crypto.randomUUID()}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken2}`);

  expect(deleteGoalRes.status).toBe(404);
});

test('POST /v0/goal/:id/join Attempt to join a goal', async () => {
  // user1 creates a goal
  let goalToBeJoined;
  await request.post('/v0/goal')
    .set('Authorization', `Bearer ${userToken1}`)
    .send({
      title: 'anothergoal',
      description: 'anotherdesc',
      recurrence: '1 day',
      memberCount: 1,
      startdate: '2024-05-10',
      enddate: '2024-05-20',
    })
    .expect(200)
    .then((res) => {
      console.log(res.body);
      goalToBeJoined = res.body.id;
    });

  await request.post(`/v0/goal/${goalToBeJoined}/join`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken2}`)
    .then((res) => {
      expect(res.status).toBe(200);
    });
});

test('POST /v0/goal/:id/join Join goal user is already in', async () => {
  // user1 creates a goal
  let goalToBeJoined;
  await request.post('/v0/goal')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`)
    .send({
      title: 'anothergoal',
      description: 'anotherdesc',
      recurrence: '1 day',
      memberCount: 1,
    })
    .then((res) => {
      console.log(res.body);
      goalToBeJoined = res.body.id;
    });

  const joinedRes1 = await request.post(`/v0/goal/${goalToBeJoined}/join`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);

  expect(joinedRes1.status).toBe(400);
});

test('POST /v0/goal/:id/leave Attempt to leave goal', async () => {
  // user1 creates a goal
  const goal = await supertest(server)
    .post('/v0/goal')
    .send({
      title: 'anothergoal',
      description: 'anotherdesc',
      recurrence: '1',
      memberCount: 1,
      startdate: '2024-05-10',
      enddate: '2024-05-20',
    })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);

  const goalToBeLeft = goal.body.id;

  // join the goal
  await supertest(server)
    .post(`/v0/goal/${goalToBeLeft}/join`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken2}`);

  // now leave the goal
  const leaveRes = await supertest(server)
    .post(`/v0/goal/${goalToBeLeft}/leave`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken2}`);

  expect(leaveRes.status).toBe(200);
});

test('POST /v0/goal/:id/leave Attempt to leave goal as an author', async () => {
  // user1 creates a goal
  const goal = await request.post('/v0/goal')
    .send({
      title: 'anothergoal',
      description: 'anotherdesc',
      recurrence: '1',
      memberCount: 1,
      startdate: '2024-05-10',
      enddate: '2024-05-20',
    })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);

  const goalToBeLeft = goal.body.id;

  // now leave the goal
  const leaveRes = await request.post(`/v0/goal/${goalToBeLeft}/leave`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);

  expect(leaveRes.status).toBe(401);
});

test('POST /v0/goal/:id/leave Leave goal user is not in anyway', async () => {
  // user1 creates a goal
  const goal = await request.post('/v0/goal')
    .send({
      title: 'anothergoal',
      description: 'anotherdesc',
      recurrence: '1',
      memberCount: 1,
      startdate: '2024-05-10',
      enddate: '2024-05-20',
    })
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);

  const goalToBeLeft = goal.body.id;

  // now leave the goal
  const leaveRes = await request.post(`/v0/goal/${goalToBeLeft}/leave`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken2}`);

  expect(leaveRes.status).toBe(401);
});

test('POST /v0/goal/:id/leave Leave goal that does not exist', async () => {
  // now leave the goal
  const leaveRes = await request.post(`/v0/goal/${crypto.randomUUID()}/leave`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${userToken1}`);

  expect(leaveRes.status).toBe(404);
});

test('POST /v0/goal creates goal 401', async () => {
  const goal = await request.post('/v0/goal')
    .send({
      title: 'title',
      description: 'description',
      recurrence: '1',
      memberCount: 1,
    })
    .set('Content-Type', 'application/json');
  expect(goal.status).toBe(401);
});
