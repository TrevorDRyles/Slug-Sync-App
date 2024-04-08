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

test('Call to nonexistent API returns 404', async () => {
  const login = await request.get('/v0/nonexistent');
  expect(login.status).toBe(404);
});
