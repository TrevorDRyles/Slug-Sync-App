import { it, beforeAll, afterAll, expect } from 'vitest';
import {fireEvent, waitFor, screen} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import CreateGoal from "../components/Goal/Create.jsx";
import {BrowserRouter} from "react-router-dom";
import { render } from "./render";
import App from "@/App.jsx";

const URL = 'http://localhost:3010/v0/goal';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('Renders app', async () => {
  render(<App/>);
})

it('Remembers user when app is rendered', async() => {
  localStorage.setItem('user', '{"token": "temp token", "name":"tempname"}')
  render(<App />)
  expect(screen.getByText('tempname', {exact: false})).toBeInTheDocument()
})