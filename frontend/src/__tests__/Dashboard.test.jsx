import { it, beforeAll, afterAll, expect } from 'vitest';
import {fireEvent, waitFor, screen} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {MemoryRouter, Routes, Route} from "react-router-dom";
import { render } from "./render";
import { Dashboard } from '../components/Dashboard/Main.jsx';
import { LoginContext, LoginProvider } from '../contexts/Login.jsx';
import { RefetchContext, RefetchProvider } from '../contexts/Refetch.jsx';
import { beforeEach } from 'node:test';

const COMPLETED_GOALS = 'http://localhost:3010/v0/goal/completed';
const INCOMPLETED_GOALS = 'http://localhost:3010/v0/goal/incompleted';
const COMPLETE = 'http://localhost:3010/v0/complete/:goal'

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
      <RefetchProvider>
        <MemoryRouter>
          <Routes>
            <Route path="/" default element={<Dashboard />} />
            <Route path="/login" default element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </RefetchProvider>
    </LoginProvider>
  )
}

const mockCompleted = [
  {
    id: 1,
    title: "Goal 1",
    "description": "This is a test goal wowsers 123",
    "recurrence": "2 days",
    "streak": 2,
    startdate: new Date().toISOString(),
    enddate: new Date().toISOString()
  },
  {
    id: 2,
    title: "Goal 2",
    "description": "Test goal 2",
    "recurrence": "3 days",
    "streak": 56,
    startdate: new Date().toISOString(),
    enddate: new Date().toISOString()
  },
]

const mockIncompleted = [
  {
    id: 3,
    title: "Walk a mile",
    "description": "Test goal 3",
    "recurrence": "1 week",
    "streak": 10,
    startdate: new Date().toISOString(),
    enddate: new Date().toISOString()
  }
]

it('Renders app not logged in', async () => {
  renderDashboard();
  expect(screen.getByText('Create a goal', {exact: false})).toBeInTheDocument();
  expect(screen.getByText('Search / Discover new goals', {exact: false})).toBeInTheDocument();
  expect(screen.getByText('Communicate', {exact: false})).toBeInTheDocument();
})

it('Clicks signup/login when not logged in', async() => {
  renderDashboard();
  const login = screen.getByText('Login / Sign Up!')
  fireEvent.click(login)
  expect(screen.getByText('Logged In')).toBeInTheDocument();
})

it('Renders all goals on screen when logged in', async() => {
  server.use(
    http.get(COMPLETED_GOALS, async() => {
      return HttpResponse.json(mockCompleted)
    }),
    http.get(INCOMPLETED_GOALS, async() => {
      return HttpResponse.json(mockIncompleted)
    })
  )

  localStorage.setItem('user', JSON.stringify({accessToken: '1234'}))

  const accessToken = '1234'
  const setAccessToken = () => {}
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken}}>
      <RefetchProvider>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </RefetchProvider>
    </LoginContext.Provider>
  )

  await waitFor(() => {
    const completed = screen.getAllByLabelText('Goal completed')
    expect(completed.length).toEqual(2)
    const incompleted = screen.getAllByLabelText('Goal not completed')
    expect(incompleted.length).toEqual(1)
  })
})

it ('Fails to render goals on error', async() => {
  server.use(
    http.get(COMPLETED_GOALS, async() => {
      return new HttpResponse(null, { status: 401 })
    }),
    http.get(INCOMPLETED_GOALS, async() => {
      return new HttpResponse(null, { status: 401 })
    })
  )

  localStorage.setItem('user', JSON.stringify({accessToken: '1234'}))
  const accessToken = '1234'
  const setAccessToken = () => {}
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken}}>
      <RefetchProvider>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </RefetchProvider>
    </LoginContext.Provider>
  )

  await waitFor(() => {
    expect(screen.queryByLabelText('Goal completed')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Goal not completed')).not.toBeInTheDocument();
  })
})

it('Clicks on complete a goal', async() => {
  server.use(
    http.get(COMPLETED_GOALS, async() => {
      return HttpResponse.json(mockCompleted)
    }),
    http.get(INCOMPLETED_GOALS, async() => {
      return HttpResponse.json(mockIncompleted)
    }),
    http.put(COMPLETE, async() => {
      return HttpResponse.json({id: '1234'})
    })
  )
  localStorage.setItem('user', JSON.stringify({accessToken: '1234'}))

  const accessToken = '1234'
  const setAccessToken = () => {}
  let refetch = false
  const setRefetch = () => {refetch = true}
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken}}>
      <RefetchContext.Provider value={{refetch, setRefetch}}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </RefetchContext.Provider>
    </LoginContext.Provider>
  )

  await waitFor(() => {
    const completed = screen.getAllByLabelText('Goal completed')
    expect(completed.length).toEqual(2)
    const incompleted = screen.getAllByLabelText('Goal not completed')
    expect(incompleted.length).toEqual(1)
  })

  fireEvent.click(screen.getAllByLabelText('Goal not completed')[0])
  await waitFor(() => {
    expect(refetch).toBeTruthy()
  })
})

it('Fails to click on complete a goal', async() => {
  server.use(
    http.get(COMPLETED_GOALS, async() => {
      return HttpResponse.json(mockCompleted)
    }),
    http.get(INCOMPLETED_GOALS, async() => {
      return HttpResponse.json(mockIncompleted)
    }),
    http.put(COMPLETE, async() => {
      return new HttpResponse(null, { status: 401 })
    })
  )
  localStorage.removeItem('user')

  const accessToken = '1234'
  const setAccessToken = () => {}
  let refetch = false
  const setRefetch = () => {refetch = true}
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken}}>
      <RefetchContext.Provider value={{refetch, setRefetch}}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </RefetchContext.Provider>
    </LoginContext.Provider>
  )

  await waitFor(() => {
    const completed = screen.getAllByLabelText('Goal completed')
    expect(completed.length).toEqual(2)
    const incompleted = screen.getAllByLabelText('Goal not completed')
    expect(incompleted.length).toEqual(1)
  })

  fireEvent.click(screen.getAllByLabelText('Goal not completed')[0])
})