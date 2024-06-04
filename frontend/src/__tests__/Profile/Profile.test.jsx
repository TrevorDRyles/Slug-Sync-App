import { it, beforeAll, afterAll, stub } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse, rest} from 'msw';
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
      topGoals,
  };

  localStorage.setItem('user', JSON.stringify(userData));

    server.use(
      http.get('http://localhost:3010/v0/profile/:id', async () => {
        return HttpResponse.json(userData);
      }),
    );
  
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(userData.name)).toBeInTheDocument();
      expect(screen.getByText(userData.bio)).toBeInTheDocument();
      screen.getByText(`Top Goals`);

      userData.topGoals.forEach(goal =>{
        expect(screen.getByText(goal.title)).toBeInTheDocument();
        expect(screen.getByText(goal.description)).toBeInTheDocument();
      });    
    });
  });

  it('Loads user profile with no goals', async() => {
    const topGoals = [];
    
    const userData = {
        id: '1234',
        bio: 'its a bio',
        name: 'me',
        topGoals,
    };
  
    localStorage.setItem('user', JSON.stringify(userData));
  
      server.use(
        http.get('http://localhost:3010/v0/profile/:id', async () => {
          return HttpResponse.json(userData);
        }),
      );
    
      render(
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      );
  
      await waitFor(() => {
        expect(screen.getByText(userData.name)).toBeInTheDocument();
        expect(screen.getByText(userData.bio)).toBeInTheDocument();
        screen.getByText(`Top Goals`);
        screen.getByText(`Looking kinda empty there...`);
  
        userData.topGoals.forEach(goal =>{
          expect(screen.getByText(goal.title)).toBeInTheDocument();
          expect(screen.getByText(goal.description)).toBeInTheDocument();
        });    
      });
    });

    /*
    it('Opens and interacts with the edit profile modal', async () => {
      const userData = {
        id: '1234',
        bio: 'its a bio',
        name: 'me',
      };
    
      render(
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      );

      fireEvent.click(screen.getByTestId('edit button'));
    
      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });
    
      // Simulate user typing into the inputs
      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'new name' } });
      fireEvent.change(screen.getByLabelText('Bio'), { target: { value: 'new bio' } });
    
      // Verify that the inputs have the new values
      expect(screen.getByLabelText('Name')).toHaveValue('new name');
      expect(screen.getByLabelText('Bio')).toHaveValue('new bio');
    
      // Simulate clicking the save button
      fireEvent.click(screen.getByText('Save'));
    
      // check if the values
      await waitFor(() => {
        expect(screen.getByText('new name')).toBeInTheDocument();
        expect(screen.getByText('new bio')).toBeInTheDocument();
      });
    });
    */