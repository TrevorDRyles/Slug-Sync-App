import { it, beforeAll, afterAll, expect } from 'vitest';
import {fireEvent, waitFor, screen} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import Home from "../components/Home.jsx";
import {BrowserRouter, useNavigate} from "react-router-dom";
import { render } from "./render";
import Sidebar from '../components/Sidebar.jsx';
import { LoginContext, LoginProvider } from '../contexts/Login.jsx';
import Header from '../components/Header.jsx';

const URL = 'http://localhost:3010/v0/goal';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('Loads home', async () => {
  render(
    <LoginProvider>
      <BrowserRouter>
        <Home/>
      </BrowserRouter>
    </LoginProvider>
  );

  const goals = screen.getAllByText('Goals', {exact: false});
  fireEvent.click(goals[0]);

  const home= screen.getByText('Home', {exact: false});
  fireEvent.click(home);

  const search = screen.getAllByText('Search', {exact: false});
  fireEvent.click(search[0]);

  const login = screen.getAllByText('Login', {exact: false});
  fireEvent.click(login[0]);

  const signup = screen.getAllByText('Sign up', {exact: false});
  fireEvent.click(signup[0]);

});

it('Loads home and sidebar', async () => {
  render(
    <LoginProvider>
      <BrowserRouter>
        <Home/>
      </BrowserRouter>
    </LoginProvider>
  );

  screen.getByLabelText('HomeIcon1');

  screen.getByLabelText('UserIcon1');

  screen.getByLabelText('SettingsIcon1');

  screen.getByLabelText('LogoutIcon');
});

it('Clicks logout', async() => {
  let loggedout = false
  const accessToken = '1234'
  const setAccessToken = () => {loggedout = true}
  const userName = 'test username'
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken, userName}}>
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    </LoginContext.Provider>
  )

  await waitFor(() => {
    expect(screen.getByText('Hello test username!', {exact: false})).toBeInTheDocument();
  })

  fireEvent.click(screen.getByText('Logout'))
  await waitFor(() => {
    expect(loggedout).toBeTruthy()
  })
})
