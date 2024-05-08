import { http, HttpResponse } from 'msw';

const INDEX_URL = 'http://localhost:3010/v0/goal';

const returnBody = [
  {id: '1', content: 'content1', recurrence: '1', title: 'Run a mile1', tag: 'Athletics'},
  {id: '2', content: 'content2', recurrence: '2', title: 'Run a mile2', tag: 'Health'},
  {id: '3', content: 'content3', recurrence: '3', title: 'Run a mile3', tag: 'Productivity'},
  {id: '4', content: 'content4', recurrence: '4', title: 'Run a mile4', tag: 'Social'},
  {id: '5', content: 'content5', recurrence: '5', title: 'Run a mile5', tag: 'Hobbies'},
  {id: '6', content: 'content6', recurrence: '6', title: 'Run a mile6', tag: 'Personal'},
  {id: '7', content: 'content7', recurrence: '7', title: 'Run a mile7'},
]

const returnBody2 = [
  {id: '1', content: 'content7', recurrence: '7', title: 'title1'},
]
const failure = new HttpResponse('Failure', {
  status: 400,
})

export const indexHandlers = [
    http.get(INDEX_URL, async () => {
      return HttpResponse.json(returnBody)
    })
]

export const indexHandlers2 = [
  http.get(INDEX_URL, async () => {
    return HttpResponse.json(returnBody2)
  })
]

export const indexErrorHandlers = [
  http.get(INDEX_URL, async() => {
    return failure
  }),
  http.post(INDEX_URL, async () => {
    return HttpResponse.error();
  }),
]
