import {it, beforeAll, afterAll, expect} from 'vitest';
import {fireEvent, waitFor, screen} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {BrowserRouter} from "react-router-dom";
import { render } from "../render";
import Index from "@/components/Goal/Index.jsx";
import {indexHandlers} from "@/__tests__/Goal/Handlers.js";
import userEvent from '@testing-library/user-event';
import { indexErrorHandlers } from './Handlers';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('Loads goal index page', async () => {
  server.use(...indexHandlers);
  render(<BrowserRouter><Index/></BrowserRouter>);
  const goals = screen.getAllByText('Goals', {exact: false});
  expect(goals.length).toBe(2);
  screen.getByText('Previous Page', {exact: false});
  screen.getByText('Next Page', {exact: false});
  screen.getByPlaceholderText('Search goals...');
  await waitFor(() => screen.getByText('Run a mile1'));

  const link = screen.getByText('Run a mile1');
  fireEvent.click(link);
  expect(screen.getAllByText('Members', {exact: false})).toBeDefined();
});

it('Loads goal index page with error', async () => {
  server.use(...indexErrorHandlers);
  let alerted = false;
  window.alert = () => {alerted = true};
  render(<BrowserRouter><Index/></BrowserRouter>);
  await waitFor(() => {
    expect(alerted).toBeTruthy();
  })
});

it('Click previous and next', async () => {
  server.use(...indexHandlers);
  render(<BrowserRouter><Index/></BrowserRouter>);
  await waitFor(() => screen.getByText('Run a mile1', {exact: false}));
  const link = screen.getByText('Run a mile1', {exact: false});
  fireEvent.click(link);
  screen.getAllByText('Members', {exact: false});
  screen.getByText('Run a mile1', {exact: false});
  fireEvent.click(screen.getByText('Next', {exact: false}));
  screen.getByText('Run a mile6', {exact: false});
  fireEvent.click(screen.getByText('Previous', {exact: false}));
  screen.getByText('Run a mile5', {exact: false});
});

it('Click add goal', async () => {
  server.use(...indexHandlers)
  render(<BrowserRouter><Index/></BrowserRouter>);
  await waitFor(() => screen.getByText('Run a mile1', {exact: false}));
  await waitFor(() => screen.getAllByText('Add Goal', {exact: false})[0]);
  const link = screen.getAllByText('Add Goal', {exact: false})[0];
  fireEvent.click(link);
});

it('Click add goal with error', async () => {
  server.use(...indexHandlers)
  server.use(
    http.post(`http://localhost:3010/v0/goal`, async () => {
      return HttpResponse.error();
    }),
  );
  render(<BrowserRouter><Index/></BrowserRouter>);
  await waitFor(() => screen.getByText('Run a mile1', {exact: false}));
  await waitFor(() => screen.getAllByText('Add Goal', {exact: false})[0]);
  const link = screen.getAllByText('Add Goal', {exact: false})[0];
  fireEvent.click(link);
});

it('Search into goals field and click a goal', async () => {
  server.use(...indexHandlers)

  render(<BrowserRouter><Index/></BrowserRouter>);;
  const searchInput = screen.getByPlaceholderText('Search goals...');
  await userEvent.type(searchInput, 'Run a mile6');
  fireEvent.click(screen.getByText('Run a mile6'));
});
