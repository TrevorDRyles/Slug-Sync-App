import { http, HttpResponse } from 'msw';

const URL = 'http://localhost:3010/v0/signup';

const successful = new HttpResponse('Success', {
  status: 200,
})
const failure = new HttpResponse('Success', {
  status: 400,
})

export const handlers = [
  http.post(URL, async() => {
    return successful
  })
]

export const errorHandlers = [
  http.post(URL, async() => {
    return failure
  })
]