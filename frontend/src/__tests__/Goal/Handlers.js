import { http, HttpResponse } from 'msw';

const INDEX_URL = 'http://localhost:3010/v0/goal';

const returnBody = [
  {id: '1', content: 'content1', recurrence: '1', title: 'Run a mile1'},
  {id: '2', content: 'content2', recurrence: '2', title: 'Run a mile2'},
  {id: '3', content: 'content3', recurrence: '3', title: 'Run a mile3'},
  {id: '4', content: 'content4', recurrence: '4', title: 'Run a mile4'},
  {id: '5', content: 'content5', recurrence: '5', title: 'Run a mile5'},
  {id: '6', content: 'content6', recurrence: '6', title: 'Run a mile6'},
]

const failure = new HttpResponse('Failure', {
  status: 400,
})

export const indexHandlers = [
    http.get(INDEX_URL, async () => {
      return HttpResponse.json(returnBody)
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
