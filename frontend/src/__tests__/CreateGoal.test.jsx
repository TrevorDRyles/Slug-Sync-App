import { it, beforeAll, afterAll } from 'vitest';
import {fireEvent, waitFor, screen} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import CreateGoal from "../components/Goal/CreateGoal.jsx";
import {BrowserRouter} from "react-router-dom";
import { render } from "./render";

const URL = 'http://localhost:3010/v0/goal';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('Loads create goal', async () => {
  server.use(
    http.post(URL, async () => {
      return HttpResponse.json({id: '1', content: 'content', recurrence: '1', title: 'title'}, {status: 200});
    }),
  );
  // {
  //   mock: {
  //     'react-router-dom': {
  //       useNavigate: vi.fn().mockImplementation(() => navigate),
  //     },
  //   },
  // const navigate = vi.fn();
  render(<BrowserRouter><CreateGoal/></BrowserRouter>);
  await waitFor(() => {
    screen.findByText('Title', {exact: false});
  });
  await waitFor(() => {
    screen.findByText('Description');
  });
  await waitFor(() => {
    screen.findByText('Recurrence (every x days)', {exact: false});
  });

  const title = screen.getByTestId('title', {exact: false});
  fireEvent.change(title, {target: {value: 'Title'}});
  expect(title.value).toBe('Title');

  const description = screen.getByTestId('description');
  fireEvent.change(description, {target: {value: 'Description'}});
  expect(description.value).toBe('Description');

  const recurrence = screen.getByTestId('recurrence');
  // select the 3rd option by down key
  fireEvent.click(recurrence);
  fireEvent.keyDown(recurrence, {key: 'ArrowDown', code: 'ArrowDown'});
  fireEvent.keyDown(recurrence, {key: 'ArrowDown', code: 'ArrowDown'});
  fireEvent.keyDown(recurrence, {key: 'ArrowDown', code: 'ArrowDown'});
  fireEvent.keyDown(recurrence, {key: 'Enter', code: 'Enter'});
  await screen.findByText('3 days');

  // Assert that the selected option is the one we expect
  const selectedOption = screen.getByText('3 days');
  expect(selectedOption).toBeInTheDocument();
  const submit = screen.getByTestId('submit');
  fireEvent.click(submit);
  // expect(navigate).toHaveBeenLastCalledWith('/');
});

it('Loads create goal with error', async () => {
  server.use(
    http.post(URL, async () => {
      return HttpResponse.json({}, {status: 400});
    }),
  );
  // {
  //   mock: {
  //     'react-router-dom': {
  //       useNavigate: vi.fn().mockImplementation(() => navigate),
  //     },
  //   },
  // const navigate = vi.fn();
  render(<BrowserRouter><CreateGoal/></BrowserRouter>);
  await waitFor(() => {
    screen.findByText('Title', {exact: false});
  });
  await waitFor(() => {
    screen.findByText('Description');
  });
  await waitFor(() => {
    screen.findByText('Recurrence (every x days)', {exact: false});
  });

  const title = screen.getByTestId('title', {exact: false});
  fireEvent.change(title, {target: {value: 'Title'}});
  expect(title.value).toBe('Title');

  const description = screen.getByTestId('description');
  fireEvent.change(description, {target: {value: 'Description'}});
  expect(description.value).toBe('Description');

  const recurrence = screen.getByTestId('recurrence');
  // select the 3rd option by down key
  fireEvent.click(recurrence);
  fireEvent.keyDown(recurrence, {key: 'ArrowDown', code: 'ArrowDown'});
  fireEvent.keyDown(recurrence, {key: 'ArrowDown', code: 'ArrowDown'});
  fireEvent.keyDown(recurrence, {key: 'ArrowDown', code: 'ArrowDown'});
  fireEvent.keyDown(recurrence, {key: 'Enter', code: 'Enter'});
  await screen.findByText('3 days');

  // Assert that the selected option is the one we expect
  const selectedOption = screen.getByText('3 days');
  expect(selectedOption).toBeInTheDocument();
  const submit = screen.getByTestId('submit');
  fireEvent.click(submit);
  // expect(navigate).toHaveBeenLastCalledWith('/');
});
