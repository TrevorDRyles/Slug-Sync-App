import { it, beforeAll, afterAll } from 'vitest';
import {fireEvent, waitFor, screen} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import CreateGoal from "../../components/Goal/Create.jsx";
import {BrowserRouter} from "react-router-dom";
import { render } from "../render";
import { LoginProvider } from '../../contexts/Login.jsx';

const URL = 'http://localhost:3010/v0/goal';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderCreateGoal = () => {
  return render(
    <LoginProvider>
      <BrowserRouter>
        <CreateGoal />
      </BrowserRouter>
    </LoginProvider>
  )
}

it('Loads create goal', async () => {
  server.use(
    http.post(URL, async () => {
      return HttpResponse.json({id: '1', content: 'content', recurrence: '1', title: 'title'}, {status: 200});
    }),
  );
  renderCreateGoal();
  screen.getByText('Title', {exact: false});
  screen.getByText('Description');
  screen.getByText('Recurrence (every x days)', {exact: false});

  const title = screen.getByTestId('title', {exact: false});
  fireEvent.change(title, {target: {value: 'Title'}});
  expect(title.value).toBe('Title');

  const description = screen.getByTestId('description');
  fireEvent.change(description, {target: {value: 'Description'}});
  expect(description.value).toBe('Description');

  const recurrence = screen.getByTestId('recurrence');
  fireEvent.click(recurrence);
  fireEvent.keyDown(recurrence, {key: 'ArrowDown', code: 'ArrowDown'});
  fireEvent.keyDown(recurrence, {key: 'ArrowDown', code: 'ArrowDown'});
  fireEvent.keyDown(recurrence, {key: 'ArrowDown', code: 'ArrowDown'});
  fireEvent.keyDown(recurrence, {key: 'Enter', code: 'Enter'});
  screen.getByText('3 days');

  const selectedOption = screen.getByText('3 days');
  expect(selectedOption).toBeInTheDocument();
  const submit = screen.getByTestId('submit');
  fireEvent.click(submit);
});

it('Loads create goal with error', async () => {
  server.use(
    http.post(URL, async () => {
      return HttpResponse.json({}, {status: 400});
    }),
  );
  renderCreateGoal();
  screen.getByText('Title', {exact: false});
  screen.getByText('Description');
  screen.getByText('Recurrence (every x days)', {exact: false});

  const title = screen.getByTestId('title', {exact: false});
  fireEvent.change(title, {target: {value: 'Title'}});
  expect(title.value).toBe('Title');

  const description = screen.getByTestId('description');
  fireEvent.change(description, {target: {value: 'Description'}});
  expect(description.value).toBe('Description');

  const recurrence = screen.getByTestId('recurrence');
  fireEvent.click(recurrence);
  fireEvent.keyDown(recurrence, {key: 'ArrowDown', code: 'ArrowDown'});
  fireEvent.keyDown(recurrence, {key: 'ArrowDown', code: 'ArrowDown'});
  fireEvent.keyDown(recurrence, {key: 'ArrowDown', code: 'ArrowDown'});
  fireEvent.keyDown(recurrence, {key: 'Enter', code: 'Enter'});
  screen.getByText('3 days');

  const selectedOption = screen.getByText('3 days');
  expect(selectedOption).toBeInTheDocument();
  const submit = screen.getByTestId('submit');
  fireEvent.click(submit);
});

it('Loads create goal with tags', async () => {
  server.use(
    http.post(URL, async () => {
      return HttpResponse.json({id: '1', content: 'content', recurrence: '1', title: 'title', tag: 'Hobbies'}, {status: 200});
    }),
  );

  renderCreateGoal();
  screen.getAllByText('Select a tag', {exact: false});

  const tag = screen.getByTestId('tag', {exact: false});

  fireEvent.mouseDown(tag);
  const hobbiesOption = screen.getByText('Hobbies');
  fireEvent.click(hobbiesOption);
  fireEvent.blur(tag);

  const selectedOption = screen.getByText('Hobbies');
  expect(selectedOption).toBeInTheDocument();

  const submit = screen.getByTestId('submit');
  fireEvent.click(submit);
});