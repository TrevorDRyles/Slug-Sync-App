import { it, beforeAll, afterAll, stub } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse, rest} from 'msw';
import { setupServer } from 'msw/node';
import Profile from "../../components/Profile/Profile";
import { RefetchProvider } from '../../contexts/Refetch.jsx';
import { BrowserRouter } from "react-router-dom";
import { render } from "../render";
import {LoginContext} from "../../contexts/Login.jsx";
import {indexHandlers} from "@/__tests__/Goal/Handlers.js";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('Loads user profile with all 3 goals', async () => {
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
    ...indexHandlers,
    http.get('http://localhost:3010/v0/profile/:id', async () => {
      return HttpResponse.json(userData);
    }),
  );
  const accessToken = '1234'
  const setAccessToken = () => {
  }
  const user = {id: '1234', token: '1234'}
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken, user}}> <RefetchProvider>
      <BrowserRouter>
        <Profile/>
      </BrowserRouter>
    </RefetchProvider>
    </LoginContext.Provider>
  );

  await waitFor(() => {
    expect(screen.getByText(userData.name)).toBeInTheDocument();
    expect(screen.getByText(userData.bio)).toBeInTheDocument();
    screen.getByText(`Top Goals`);

    userData.topGoals.forEach(goal => {
      expect(screen.getByText(goal.title)).toBeInTheDocument();
      expect(screen.getByText(goal.description)).toBeInTheDocument();
    });
  });
});

it('Loads user profile with error', async () => {
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
    ...indexHandlers,
    http.get('http://localhost:3010/v0/profile/:id', async () => {
      return HttpResponse.json({message: 'error'}, {status: 400});
    }),
  );
  const accessToken = '1234'
  const setAccessToken = () => {
  }
  const user = {id: '1234', token: '1234'}
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken, user}}> <RefetchProvider>
      <BrowserRouter>
        <Profile/>
      </BrowserRouter>
    </RefetchProvider>
    </LoginContext.Provider>
  );
});

it('Doesn\'t load anything because no user id', async () => {
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
    bio: 'its a bio',
    name: 'me',
    topGoals,
  };

  localStorage.setItem('user', JSON.stringify(userData));

  server.use(
    ...indexHandlers,
    http.get('http://localhost:3010/v0/profile/:id', async () => {
      return HttpResponse.json(userData);
    }),
  );
  const accessToken = '1234'
  const setAccessToken = () => {
  }
  const user = {id: '1234', token: '1234'}
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken, user}}> <RefetchProvider>
      <BrowserRouter>
        <Profile/>
      </BrowserRouter>
    </RefetchProvider>
    </LoginContext.Provider>
  );
});

it('Loads user profile with no goals', async () => {
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

  const accessToken = '1234'
  const setAccessToken = () => {
  }
  const user = {id: '1234', token: '1234'}
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken, user}}>
      <RefetchProvider>
        <BrowserRouter>
          <Profile/>
        </BrowserRouter>
      </RefetchProvider>
    </LoginContext.Provider>
  );

  await waitFor(() => {
    expect(screen.getByText(userData.name)).toBeInTheDocument();
    expect(screen.getByText(userData.bio)).toBeInTheDocument();
    screen.getByText(`Top Goals`);
    screen.getByText(`Looking kinda empty there...`);

    userData.topGoals.forEach(goal => {
      expect(screen.getByText(goal.title)).toBeInTheDocument();
      expect(screen.getByText(goal.description)).toBeInTheDocument();
    });
  });
});

it('Opens and interacts with the edit profile modal', async () => {
  const userData = {
    id: '1234',
    bio: 'its a bio',
    name: 'me',
  };

  const accessToken = '1234'
  const setAccessToken = () => {
  }
  const user = {id: '1234', token: '1234'}

  localStorage.setItem('user', JSON.stringify(userData));

  server.use(
    http.post('http://localhost:3010/v0/profile/:id', async () => {
      return HttpResponse.json(userData);
    }),
  );

  render(
    <LoginContext.Provider value={{accessToken, setAccessToken, user}}>
      <RefetchProvider>
        <BrowserRouter>
          <Profile/>
        </BrowserRouter>
      </RefetchProvider>
    </LoginContext.Provider>
  );

  fireEvent.click(screen.getByTestId('edit button'));

  await waitFor(() => {
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });

  fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'new name'}});
  fireEvent.change(screen.getByLabelText('Bio'), {target: {value: 'new bio'}});

  expect(screen.getByLabelText('Name')).toHaveValue('new name');
  expect(screen.getByLabelText('Bio')).toHaveValue('new bio');

  fireEvent.click(screen.getByText('Save'));
});

it('Opens and interacts with the edit profile modal then error', async () => {
  const userData = {
    id: '1234',
    bio: 'its a bio',
    name: 'me',
  };

  const accessToken = '1234'
  const setAccessToken = () => {
  }
  const user = {id: '1234', token: '1234'}

  localStorage.setItem('user', JSON.stringify(userData));

  server.use(
    http.post('http://localhost:3010/v0/profile/:id', async () => {
      return HttpResponse.json({message: 'error'}, {status: 400})
    }),
  );

  render(
    <LoginContext.Provider value={{accessToken, setAccessToken, user}}>
      <RefetchProvider>
        <BrowserRouter>
          <Profile/>
        </BrowserRouter>
      </RefetchProvider>
    </LoginContext.Provider>
  );

  fireEvent.click(screen.getByTestId('edit button'));

  await waitFor(() => {
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });

  fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'new name'}});
  fireEvent.change(screen.getByLabelText('Bio'), {target: {value: 'new bio'}});

  expect(screen.getByLabelText('Name')).toHaveValue('new name');
  expect(screen.getByLabelText('Bio')).toHaveValue('new bio');

  fireEvent.click(screen.getByText('Save'));
});

it('Loads user profile with no json name or bio', async () => {
  const topGoals = [];

  const userData = {
    id: '1234',
    topGoals,
  };

  localStorage.setItem('user', JSON.stringify(userData));

  server.use(
    http.get('http://localhost:3010/v0/profile/:id', async () => {
      return HttpResponse.json(userData);
    }),
  );

  const accessToken = '1234'
  const setAccessToken = () => {
  }
  const user = {id: '1234', token: '1234'}
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken, user}}>
      <RefetchProvider>
        <BrowserRouter>
          <Profile/>
        </BrowserRouter>
      </RefetchProvider>
    </LoginContext.Provider>
  );

  await waitFor(() => {
    screen.getByText(`Top Goals`);
    screen.getByText(`Looking kinda empty there...`);

    userData.topGoals.forEach(goal => {
      expect(screen.getByText(goal.title)).toBeInTheDocument();
      expect(screen.getByText(goal.description)).toBeInTheDocument();
    });
  });
});
