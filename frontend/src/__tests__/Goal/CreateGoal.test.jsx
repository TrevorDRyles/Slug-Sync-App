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

beforeAll(() => {
  localStorage.setItem('user', JSON.stringify({accessToken: '1234'}))
  server.listen()
});
afterEach(() => server.resetHandlers());
afterAll(() => {
  localStorage.removeItem('user')
  server.close()
});

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

  // Check for text elements on the page
  screen.getByText('Title', { exact: false });
  screen.getByText('Description');
  screen.getByText('Repeat goal every ...', {exact: false});
  screen.getAllByLabelText('Repeat goal every ...', {exact: false});
  screen.getAllByText('Start Date', {exact: false});
  screen.getAllByText('End Date', {exact: false});

  // Interact with the title input
  const title = screen.getByTestId('title', { exact: false });
  fireEvent.change(title, { target: { value: 'Title' } });
  expect(title.value).toBe('Title');

  // Interact with the description input
  const description = screen.getByTestId('description');
  fireEvent.change(description, { target: { value: 'Description' } });
  expect(description.value).toBe('Description');

  // Interact with the recurrence input
  const recurrence = screen.getByTestId('recurrence');
  fireEvent.click(recurrence);
  fireEvent.keyDown(recurrence, { key: 'ArrowDown', code: 'ArrowDown' });
  fireEvent.keyDown(recurrence, { key: 'ArrowDown', code: 'ArrowDown' });
  fireEvent.keyDown(recurrence, { key: 'ArrowDown', code: 'ArrowDown' });
  fireEvent.keyDown(recurrence, { key: 'Enter', code: 'Enter' });
  screen.getByText('3 days');
  const selectedOption = screen.getByText('3 days');
  expect(selectedOption).toBeInTheDocument();

  const startDateInput = screen.getByTestId('startdate');
  fireEvent.click(startDateInput);
  await waitFor(() => {
    const dateToSelect = screen.getAllByText('27')[0];
    fireEvent.click(dateToSelect);
  });
  expect(startDateInput).toBeInTheDocument();

  const endDateInput = screen.getByTestId('enddate');
  fireEvent.click(endDateInput);
  await waitFor(() => {
    const dateToSelect = screen.getAllByText('28')[0];
    fireEvent.click(dateToSelect);
  });
  expect(endDateInput).toBeInTheDocument();

  const submit = screen.getByTestId('submit');
  fireEvent.click(submit);
});

it('Sets start date error when start date is after end date', async () => {
  renderCreateGoal();

  const endDateInput = screen.getByText('Select end date')
  fireEvent.click(endDateInput);
  await waitFor(() => {
    expect(screen.getByText('Mo')).toBeInTheDocument();
    const dateToSelect = screen.getByText('14');
    fireEvent.click(dateToSelect);
  });

  await waitFor(() => {
    expect(screen.queryByText('14')).not.toBeInTheDocument();
  })


  const startDateInput = screen.getByText('Select start date');
  fireEvent.click(startDateInput);
  await waitFor(() => {
    expect(screen.getByText('Mo')).toBeDefined();
    const dateToSelect = screen.getByText('15');
    fireEvent.click(dateToSelect);
  });

  await waitFor(() => {
    expect(screen.getByText('Start date cannot be after end date')).toBeInTheDocument();
  });
});

it('Sets end date error when end date is before start date', async () => {
  renderCreateGoal();
  const startDateInput = screen.getByText('Select start date');
  fireEvent.click(startDateInput);
  await waitFor(() => {
    expect(screen.getByText('Mo')).toBeDefined();
    const dateToSelect = screen.getByText('15');
    fireEvent.click(dateToSelect);
  });

  await waitFor(() => {
    expect(screen.queryByText('15')).not.toBeInTheDocument();
  })
  expect(screen.getByText('June 15, 2024')).toBeInTheDocument(); // NOTE: HARDCODED MONTH. WILL NOT WORK AFTER JUNE

  const endDateInput = screen.getByText('Select end date')
  fireEvent.click(endDateInput);
  await waitFor(() => {
    expect(screen.getByText('Mo')).toBeInTheDocument();
    const dateToSelect = screen.getByText('14');
    fireEvent.click(dateToSelect);
  });
  await waitFor(() => {
    expect(screen.getByText('End date cannot be before start date')).toBeInTheDocument();
  });
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
  screen.getByText('Repeat goal every ...', {exact: false});

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
