import {it, beforeAll, afterAll, expect} from 'vitest';
import {fireEvent, waitFor, screen} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {BrowserRouter} from "react-router-dom";
import { render } from "../render";
import Index from "@/components/Goal/Index.jsx";
import {indexHandlers, indexHandlers2} from "@/__tests__/Goal/Handlers.js";
import userEvent from '@testing-library/user-event';
import { indexErrorHandlers } from './Handlers';
import { LoginProvider } from '../../contexts/Login';

const INDEX_URL = 'http://localhost:3010/v0/goal';

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

const renderIndex = () => {
  return render(
    <LoginProvider>
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    </LoginProvider>
  )
}

it('Loads goal index page', async () => {
  server.use(...indexHandlers);
  renderIndex();
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
  renderIndex();
  await waitFor(() => {
    expect(alerted).toBeTruthy();
  })
});

it('Click previous and next', async () => {
  server.use(...indexHandlers);
  renderIndex();
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
  renderIndex();
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
  renderIndex();
  await waitFor(() => screen.getByText('Run a mile1', {exact: false}));
  await waitFor(() => screen.getAllByText('Add Goal', {exact: false})[0]);
  const link = screen.getAllByText('Add Goal', {exact: false})[0];
  fireEvent.click(link);
});

it('Search into goals field and click a goal', async () => {
  server.use(...indexHandlers)

  renderIndex();
  const searchInput = screen.getByPlaceholderText('Search goals...');
  await userEvent.type(searchInput, 'Run a mile6');
  fireEvent.click(screen.getByText('Run a mile6'));
});

it('check that tag exists', async () => {
  server.use(...indexHandlers);
  renderIndex();
  await waitFor(() => screen.getByText('Athletics', {exact: false}));
  screen.getByText('run a mile1', {exact: false});
  screen.getByText('Athletics', {exact: false});
  expect(screen.getAllByTestId('tag').length).toBe(6);
});

it('Ensure no tag if tag not selected', async () => {
  // server.use( //fails because goals.map is not a function?????????????? Find out why!!!!
  //   http.get(INDEX_URL, async () => {
  //     return HttpResponse.json({id: '1', content: 'content', recurrence: '1', title: 'title1'});
  //   }),
  // );
  server.use(...indexHandlers2);
  renderIndex();
  await waitFor(() => screen.getByText('title1', {exact: false}));
  try {
    screen.getAllByTestId('tag');
  } catch (error) {
    expect(error).toBeDefined();
  }
});

it('check that filter exists and allows selection', async () => {
  server.use(...indexHandlers);
  renderIndex();
  //const user = userEvent.setup();

  const filterButton = screen.getByLabelText('filter-menu-button', {exact: false});
  fireEvent.click(filterButton)
  await waitFor(() => screen.getByText("Productivity", {exact: false}));
  
  const getHealth = await waitFor(() => screen.getByLabelText('menu-item-Health', {exact: false}));
  fireEvent.click(getHealth);

  const getBadge = await waitFor(() => screen.getByLabelText('filter-badge', {exact: false}));

  const getFilterRemoval = await waitFor(() => screen.getByLabelText('remove-filter', {exact: false}));
  expect(getFilterRemoval).toBeDefined();
  fireEvent.click(getFilterRemoval);

  try {
    screen.getByText('filter-badge', {exact: false});
  } catch (error) {
    expect(error).toBeDefined();
  }




  // const sortButton = screen.getByLabelText('sort-button', {exact: false});
  // expect(sortButton).toBeDefined();
  // expect(screen.getByLabelText('asc-icon', {exact: false})).toBeDefined();
  // try{
  //   screen.getByLabelText('desc-icon', {exact: false});
  // } catch (error){
  //   expect(error).toBeDefined();
  // }
  

  // fireEvent.click(sortButton);
  // expect(screen.getByLabelText('desc-icon', {exact: false})).toBeDefined();
  // try{
  //   screen.getByLabelText('asc-icon', {exact: false});
  // } catch (error2){
  //   expect(error2).toBeDefined();
  // }
  
});
