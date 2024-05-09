import { it, beforeAll, afterAll, expect } from 'vitest';
import {fireEvent, waitFor, screen} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import CreateGoal from "../components/Goal/Create.jsx";
import {BrowserRouter, MemoryRouter, Routes, Route} from "react-router-dom";
import { render } from "./render";
import App from "@/App.jsx";
import { Dashboard } from '../components/Dashboard/Main.jsx';
import { LoginContext, LoginProvider } from '../contexts/Login.jsx';

const GET_GOALS = 'http://localhost:3010/v0/goal?page=1';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const LoginPage = () => {
  return(
    <div>
      Logged In
    </div>
  )
}

const renderDashboard = () => {
  return render(
    <LoginProvider>
      <MemoryRouter>
        <Routes>
          <Route path="/" default element={<Dashboard />} />
          <Route path="/login" default element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    </LoginProvider>
  )
}

const mockGoals = [
  {
    id: 1,
    title: "Goal 1",
    "description": "This is a test goal wowsers 123",
    "recurrence": 2
  },
  {
    id: 2,
    title: "Goal 2",
    "description": "Test goal 2",
    "recurrence": 3
  },
  {
    id: 3,
    title: "Walk a mile",
    "description": "Test goal 3",
    "recurrence": 7
  }
]

it('Renders app not logged in', async () => {
  renderDashboard();
  expect(screen.getByText('Create a goal', {exact: false})).toBeInTheDocument();
  expect(screen.getByText('Search / Discover new goals', {exact: false})).toBeInTheDocument();
  expect(screen.getByText('Communicate', {exact: false})).toBeInTheDocument();
})

it('Renders app when logged in', async() => {
  const accessToken = '1234'
  const setAccessToken = () => {}
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken}}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </LoginContext.Provider>
  )
  const complete = screen.getAllByText('Complete', {exact: false})
  expect(complete[0]).toBeInTheDocument();
  const incomplete = screen.getAllByText('Incomplete', {exact: false})
  expect(incomplete[0]).toBeInTheDocument();
})

it('Clicks signup/login when not logged in', async() => {
  renderDashboard();
  const login = screen.getByText('Login / Sign Up!')
  fireEvent.click(login)
  expect(screen.getByText('Logged In')).toBeInTheDocument();
})

it('Renders all goals on screen when logged in', async() => {
  server.use(
    http.get(GET_GOALS, async() => {
      return HttpResponse.json(mockGoals)
    })
  )

  localStorage.setItem('user', JSON.stringify({accessToken: '1234'}))

  const accessToken = '1234'
  const setAccessToken = () => {}
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken}}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </LoginContext.Provider>
  )

  await waitFor(() => {
    const goal1 = screen.getAllByText('Goal 1')
    expect(goal1.length).toEqual(2)
    const goal2 = screen.getAllByText('Goal 2')
    expect(goal2.length).toEqual(2)
    const goal3 = screen.getAllByText('Walk a mile')
    expect(goal3.length).toEqual(2)
  })
})

it ('Fails to render goals on error', async() => {
  server.use(
    http.get(GET_GOALS, async() => {
      return new HttpResponse(null, { status: 401 })
    })
  )
  const accessToken = '1234'
  const setAccessToken = () => {}
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken}}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </LoginContext.Provider>
  )

  await waitFor(() => {
    expect(screen.queryByText('Goal 1')).not.toBeInTheDocument();
  })

})