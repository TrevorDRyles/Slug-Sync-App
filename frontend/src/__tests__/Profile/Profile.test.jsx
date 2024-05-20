import { it, beforeAll, afterAll } from 'vitest';
import { waitFor, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Profile from "../../components/Profile/Profile";
import { BrowserRouter } from "react-router-dom";
import { render } from "../render";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('Loads user profile with all 3 goals', async() => {
    const topGoals = [{
      id: '1',
      title: 'Test Goal 1',
      description: 'Test Description 1',
      recurrence: 1,
      streak: 1,
    },
    {
        id: '2',
        title: 'Test Goal 2',
        description: 'Test Description 2',
        recurrence: 2,
        streak: 2,
    },
    {
        id: '3',
        title: 'Test Goal 3',
        description: 'Test Description 3',
        recurrence: 3,
        streak: 3,
    }];

    const userData = {
        id: '1234',
        bio: 'its a bio',
        name: 'me',
    };

    server.use(
      http.get('http://localhost:3010/v0/profile/:id', async () => {
        return HttpResponse.json(userData, topGoals);
      }),
    );
  
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
  
    await waitFor(() => {
      screen.getByText(userData.name);
      screen.getByText(userData.bio);
      screen.getByText(`Top Goals`);

      topGoals.forEach(goal =>{
        screen.getByText(goal.title);
        screen.getByText(goal.description);
      });    
    });
  });