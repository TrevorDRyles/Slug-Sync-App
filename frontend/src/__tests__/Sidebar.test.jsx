import { it, beforeAll, afterAll, expect } from 'vitest';
import {fireEvent, waitFor, screen} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import Home from "../components/Home.jsx";
import {BrowserRouter, MemoryRouter, useNavigate} from "react-router-dom";
import { render } from "./render";
import Sidebar from '../components/Sidebar.jsx';
import { LoginContext, LoginProvider } from '../contexts/Login.jsx';
import Header from '../components/Header.jsx';

const URL = 'http://localhost:3010/v0/goal';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderSidebar = () => {
  const accessToken = '1234'
  const setAccessToken = () => {
    loggedout = true
  }
  const user = {'name': 'test username'}
  return render(
    <LoginContext.Provider value={{accessToken, setAccessToken, user}}>
      <MemoryRouter>
        <Sidebar/>
      </MemoryRouter>
    </LoginContext.Provider>
  )
}

it('Clicks on home', async() => {
  renderSidebar()
  fireEvent.click(screen.getByLabelText('HomeIcon1'));
  const homeButton = screen.getByLabelText('HomeIcon1').parentElement;
  const isActive = homeButton.getAttribute('data-active');
  expect(isActive).toBe('true');
})

it('Clicks on Profile', async() => {
  renderSidebar()
  fireEvent.click(screen.getByLabelText('UserIcon1'));
  const homeButton = screen.getByLabelText('UserIcon1').parentElement;
  const isActive = homeButton.getAttribute('data-active');
  expect(isActive).toBe('true');
})

// it('Clicks on Settings', async() => {
//   renderSidebar()
//   fireEvent.click(screen.getByLabelText('SettingsIcon1'));
//   const homeButton = screen.getByLabelText('SettingsIcon1').parentElement;
//   const isActive = homeButton.getAttribute('data-active');
//   expect(isActive).toBe('true');
// })
