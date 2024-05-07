import { http, HttpResponse } from 'msw';

const URL = 'http://localhost:3010/v0/signup';
const LOGIN_URL = 'http://localhost:3010/v0/login';

const successful = new HttpResponse('Success', {
  status: 200,
})

// seemingly cannot use the same success message for different URLs;
// create one success / fail response per URL
const successfulLogin = new HttpResponse(JSON.stringify({status: 200, message: 'Success'}))

const failure = new HttpResponse('Failure', {
  status: 400,
})

const failureLogin = new HttpResponse('Failure', {
  status: 400,
})

export const handlers = [
  http.post(URL, async() => {
    return successful
  }),
  http.post(LOGIN_URL, async() => {
    return successfulLogin
  })
]

export const errorHandlers = [
  http.post(URL, async() => {
    return failure
  }),
  http.post(LOGIN_URL, async() => {
    return failureLogin
  })
]

export const signInHandlers = [
  http.post(LOGIN_URL, async() => {
    return successful
  })
]
