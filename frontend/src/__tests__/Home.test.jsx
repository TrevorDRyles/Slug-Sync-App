import { it, beforeAll, afterAll, expect } from 'vitest';
import {fireEvent, waitFor, screen} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import Home from "../components/Home.jsx";
import {BrowserRouter, useNavigate} from "react-router-dom";
import { render } from "./render";
import Sidebar from '../components/Sidebar.jsx';
import {LoginContext} from '../contexts/Login.jsx';
import Header from '../components/Header.jsx';
import {RefetchProvider} from "@/contexts/Refetch.jsx";
import {indexHandlers} from "@/__tests__/Goal/Handlers.js";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const accessToken = '1234'
const setAccessToken = () => {
}
const setUser = () => {
}
const user = {'name': 'test username'}

it('Loads home', async () => {
  server.use(...indexHandlers);
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken, user, setUser}}>
      <RefetchProvider>
        <BrowserRouter>
          <Home/>
        </BrowserRouter>
      </RefetchProvider>
    </LoginContext.Provider>
  );

  // const goals = screen.getAllByText('Goals', {exact: false});
  // fireEvent.click(goals[0]);
  //
  // const home= screen.getByText('Home', {exact: false});
  // fireEvent.click(home);
  //
  // const search = screen.getAllByText('Search', {exact: false});
  // fireEvent.click(search[0]);
  //
  // const login = screen.getAllByText('Login', {exact: false});
  // fireEvent.click(login[0]);
  //
  // const signup = screen.getAllByText('Sign up', {exact: false});
  // fireEvent.click(signup[0]);
});

it('Loads home and sidebar', async () => {
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken, user, setUser}}>
      <RefetchProvider>
        <BrowserRouter>
          <Home/>
        </BrowserRouter>
      </RefetchProvider>
    </LoginContext.Provider>
  );

  screen.getByLabelText('HomeIcon1');

  screen.getByLabelText('UserIcon1');

  // screen.getByLabelText('SettingsIcon1');

  screen.getByLabelText('LogoutIcon');
});

it('Clicks logout', async() => {
  let loggedout = false
  const accessToken = '1234'
  const setAccessToken = () => {loggedout = true}
  const user = {'name': 'test username'}
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken, user}}>
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

it('Clicks profile', async () => {
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken, user, setUser}}>
      <RefetchProvider>
        <BrowserRouter>
          <Home/>
        </BrowserRouter>
      </RefetchProvider>
    </LoginContext.Provider>
  );

  fireEvent.click(screen.getByLabelText('Profile Photo'));
});

it('Clicks avatar profile photo', async () => {
  render(
    <LoginContext.Provider value={{accessToken, setAccessToken, user, setUser}}>
      <RefetchProvider>
        <BrowserRouter>
          <Home/>
        </BrowserRouter>
      </RefetchProvider>
    </LoginContext.Provider>
  );

  fireEvent.click(screen.getByLabelText('Avatar Profile Photo'));
});

it('Clicks logout when no access token', async () => {
  render(
    <LoginContext.Provider value={{setAccessToken, user, setUser}}>
      <RefetchProvider>
        <BrowserRouter>
          <Home/>
        </BrowserRouter>
      </RefetchProvider>
    </LoginContext.Provider>
  );

  fireEvent.click(screen.getByLabelText('Logout'));
});
