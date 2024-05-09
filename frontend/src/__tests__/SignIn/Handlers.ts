import { http, HttpResponse } from 'msw';

const SIGNUP = 'http://localhost:3010/v0/signup';
const LOGIN = 'http://localhost:3010/v0/login';

export const handlers = [
  http.post(SIGNUP, async() => {
    return new HttpResponse('Success', {
      status: 200,
    })
  }),
  http.post(LOGIN, async() => {
    return new HttpResponse('{"accessToken": "1234"}', {
      status: 200
    })
  })
]

export const errorHandlers = [
  http.post(SIGNUP, async() => {
    return new HttpResponse('Failure', {
      status: 400,
    })
  }),
  http.post(LOGIN, async() => {
    return new HttpResponse('Failure', {
      status: 400,
    })
  })
]