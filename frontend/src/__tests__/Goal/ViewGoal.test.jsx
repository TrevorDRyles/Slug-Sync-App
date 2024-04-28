import { it, beforeAll, afterAll } from 'vitest';
import { waitFor, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import ViewGoal from "../../components/Goal/View";
import { BrowserRouter } from "react-router-dom";
import { render } from "../render";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('Loads view goal recurring every 7 days', async () => {
  const goalData = {
    id: '1',
    title: 'Test Goal',
    description: 'Test Description',
    recurrence: 7,
  };

  server.use(
    http.get('http://localhost:3010/v0/goal/:id', async () => {
      return HttpResponse.json(goalData);
    }),
    http.get('http://localhost:3010/v0/members', async () => {
      return HttpResponse.json([]);
    }),
  );

  render(
    <BrowserRouter>
      <ViewGoal />
    </BrowserRouter>
  );

  await waitFor(() => {
    screen.getByText(goalData.title);
    screen.getByText(goalData.description);
    screen.getByText(`Recurring every ${goalData.recurrence} days`);
  });
});

it('Loads view goal recurring every day', async() => {
  const goalData = {
    id: '1',
    title: 'Test Goal',
    description: 'Test Description',
    recurrence: 1,
  };
  server.use(
    http.get('http://localhost:3010/v0/goal/:id', async () => {
      return HttpResponse.json(goalData);
    }),
    http.get('http://localhost:3010/v0/members', async () => {
      return HttpResponse.json([]);
    }),
  );

  render(
    <BrowserRouter>
      <ViewGoal />
    </BrowserRouter>
  );

  await waitFor(() => {
    screen.getByText(goalData.title);
    screen.getByText(goalData.description);
    screen.getByText(`Recurring every day`);
  });

})

it('Loads view goal with error', async () => {
  const notFound = new HttpResponse('Not Found', {
    status: 404,
  });
    server.use(
      http.get('http://localhost:3010/v0/goal/:id', async (req, res, ctx) => {
        return notFound
      }),
      http.get('http://localhost:3010/v0/goal/{goalid}/members', async (req, res, ctx) => {
        return res(ctx.json([]), ctx.status(200));
      })
    );

    render(
      <BrowserRouter>
        <ViewGoal />
      </BrowserRouter>
    );

    // Check if the loading indicator is shown while the request is pending
    expect(screen.getByText('Loading...')).toBeInTheDocument();
});
