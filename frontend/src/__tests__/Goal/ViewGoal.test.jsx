import { it, beforeAll, afterAll } from 'vitest';
import {waitFor, screen, fireEvent} from '@testing-library/react';
import { setupServer } from 'msw/node';
import ViewGoal from "../../components/Goal/View";
import {BrowserRouter, MemoryRouter, Route, Routes} from "react-router-dom";
import { LoginProvider } from '../../contexts/Login.jsx';
import { render } from "../render";
import {
  goalDataEveryDay,
  goalDataEveryWeek, invalidCommentHandler, invalidUserHandler, setDate,
  setGoalSetting, setMultipleComments,
  viewGoalErrorHandlers,
  viewGoalHandlers
} from "@/__tests__/Goal/Handlers.js";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers()
  setGoalSetting('EVERY_WEEK');
  setMultipleComments(false);
});
afterAll(() => server.close());

it('Loads view goal recurring every 7 days', async () => {
  setGoalSetting('EVERY_WEEK');
  server.use(...viewGoalHandlers);

  renderViewGoalPage();

  await waitFor(() => {
    screen.getByText(goalDataEveryWeek.title);
    screen.getByText(goalDataEveryWeek.description);
    screen.getByText(`Recurring every ${goalDataEveryWeek.recurrence} days`);
  });
});

it('Loads view goal recurring every day', async() => {
  setGoalSetting('EVERY_DAY');
  server.use(...viewGoalHandlers);

  renderViewGoalPage();

  await waitFor(() => {
    screen.getByText(goalDataEveryDay.title);
    screen.getByText(goalDataEveryDay.description);
    screen.getByText(`Recurring every day`);
  });
});

it('Loads view goal with error in getting comments', async () => {
  server.use(...viewGoalErrorHandlers);

  renderViewGoalPage();

  await waitFor(() => {
    expect(screen.getByText('Error getting comments')).toBeInTheDocument();
  })
});

it('Loads username with error', async () => {
  server.use(...invalidUserHandler, ...viewGoalHandlers);

  renderViewGoalPage();

  await waitFor(() => {
    screen.getByText('Test Comment');
  });
  await waitFor(() => {
    expect(screen.getByText('Error getting user')).toBeInTheDocument();
  });
});

function renderViewGoalPage() {
  render(
    <MemoryRouter initialEntries={['/goal/123']}>
      <Routes>
        <Route path="/goal/:id" element={
          <LoginProvider>
            <ViewGoal/>
          </LoginProvider>
        }/>
      </Routes>
    </MemoryRouter>
  );
}

it('Adds comment successfully', async () => {
  server.use(...viewGoalHandlers);
  renderViewGoalPage();

  await waitFor(() => {
    screen.getByText('Test Comment');
  });

  // type into comments field by aria label and click enter
  await waitFor(() => {
    screen.getByPlaceholderText('Add a comment');
  })

  const addComment = screen.getByPlaceholderText('Add a comment');
  fireEvent.change(addComment, {target: {value: 'Test comment'}});
  fireEvent.click(screen.getByLabelText('Post comment'));
});

it('Adds comment with no text successfully (nothing\'s added)', async () => {
  server.use(...viewGoalHandlers);

  renderViewGoalPage();

  await waitFor(() => {
    screen.getByText('Test Comment');
  });

  // type into comments field by aria label and click enter
  await waitFor(() => {
    screen.getByPlaceholderText('Add a comment');
  })

  const addComment = screen.getByPlaceholderText('Add a comment');
  fireEvent.change(addComment, {target: {value: ''}});
  fireEvent.click(screen.getByLabelText('Post comment'));
});

it('Adds yesterday comment successfully', async () => {
  setDate(new Date(new Date().setDate(new Date().getDate() - 1)).toString());
  server.use(...viewGoalHandlers);

  renderViewGoalPage();

  await waitFor(() => {
    screen.getByText('Test Comment');
  });

  // type into comments field by aria label and click enter
  await waitFor(() => {
    screen.getByPlaceholderText('Add a comment');
  })

  const addComment = screen.getByPlaceholderText('Add a comment');
  fireEvent.change(addComment, {target: {value: 'Test comment'}});
  fireEvent.click(screen.getByLabelText('Post comment'));
});

it('Adds evening comment successfully', async () => {
  let specificDateAt5PM = new Date('2024-05-19T00:00:00');
  setDate(specificDateAt5PM.toString());
  server.use(...viewGoalHandlers);

  renderViewGoalPage();

  await waitFor(() => {
    screen.getByText('Test Comment');
  });

  // type into comments field by aria label and click enter
  await waitFor(() => {
    screen.getByPlaceholderText('Add a comment');
  })

  const addComment = screen.getByPlaceholderText('Add a comment');
  fireEvent.change(addComment, {target: {value: 'Test comment'}});
  fireEvent.click(screen.getByLabelText('Post comment'));
});

it('Adds 12am comment successfully', async () => {
  let specificDateAt12AM = new Date('2024-05-19T07:00:00');
  setDate(specificDateAt12AM.toString());
  server.use(...viewGoalHandlers);

  renderViewGoalPage();

  await waitFor(() => {
    screen.getByText('Test Comment');
  });

  // type into comments field by aria label and click enter
  await waitFor(() => {
    screen.getByPlaceholderText('Add a comment');
  })

  const addComment = screen.getByPlaceholderText('Add a comment');
  fireEvent.change(addComment, {target: {value: 'Test comment'}});
  fireEvent.click(screen.getByLabelText('Post comment'));
});

it('Adds multiple comment successfully', async () => {
  setMultipleComments(true);
  server.use(...viewGoalHandlers);

  renderViewGoalPage();

  await waitFor(() => {
    screen.getByText('Test Comment 1');
  });

  // type into comments field by aria label and click enter
  await waitFor(() => {
    screen.getByPlaceholderText('Add a comment');
  })

  const addComment = screen.getByPlaceholderText('Add a comment');
  fireEvent.change(addComment, {target: {value: 'Test comment'}});
  fireEvent.click(screen.getByLabelText('Post comment'));
});

it('Adds comment unsuccessfully', async () => {
  server.use(...invalidCommentHandler, ...viewGoalHandlers);

  renderViewGoalPage();

  await waitFor(() => {
    screen.getByText('Test Comment');
  });

  // type into comments field by aria label and click enter
  await waitFor(() => {
    screen.getByPlaceholderText('Add a comment');
  })

  const addComment = screen.getByPlaceholderText('Add a comment');
  fireEvent.change(addComment, {target: {value: 'Test comment 3'}});
  fireEvent.click(screen.getByLabelText('Post comment'));

  await waitFor(() => {
    expect(screen.getByText('Error adding comment')).toBeInTheDocument();
  })
});

