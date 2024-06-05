import { it, beforeAll, afterAll } from 'vitest';
import {waitFor, screen, fireEvent} from '@testing-library/react';
import { setupServer } from 'msw/node';
import ViewGoal from "../../components/Goal/View";
import {BrowserRouter, MemoryRouter, Route, Routes, useNavigate} from "react-router-dom";
import { LoginProvider } from '../../contexts/Login.jsx';
import { render } from "../render";
import { http, HttpResponse } from 'msw';
import {
  goalDataEveryDay,
  goalDataEveryWeek, invalidCommentHandler, invalidUserHandler, setDate,
  setGoalSetting, setMultipleComments,
  viewGoalErrorHandlers,
  viewGoalHandlers
} from "@/__tests__/Goal/Handlers.js";
import { RefetchProvider } from '../../contexts/Refetch.jsx';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers()
  setGoalSetting('EVERY_WEEK');
  setMultipleComments(false);
});
afterAll(() => server.close());

it('Loads view goal recurring every 7 days', async () => {
  const goalData = {
    id: '1',
    title: 'Test Goal',
    description: 'Test Description',
    recurrence: '7 days',
    tag: 'Hobbies',
    startdate: new Date().toISOString(),
    enddate: new Date().toISOString()
  };

  server.use(
    http.get('http://localhost:3010/v0/goal/:id/members', async () => {
      return HttpResponse.json([]);
    }),
    http.get('http://localhost:3010/v0/goal/:id', async () => {
      return HttpResponse.json(goalData);
    }),
  );

  localStorage.setItem('user', JSON.stringify({"token": "placeholder"}));

  render(
    <LoginProvider>
      <RefetchProvider>
        <BrowserRouter>
          <ViewGoal/>
        </BrowserRouter>
      </RefetchProvider>
    </LoginProvider>
  );

  await waitFor(() => {
    screen.getByText(goalData.title);
    screen.getByText(goalData.description);
    screen.getByText(`Recurring every ${goalData.recurrence}`);
  });
});

it('Loads view goal with no dates', async () => {
  const goalData = {
    id: '1',
    title: 'Test Goal',
    description: 'Test Description',
    recurrence: '7 days',
    tag: 'Hobbies',
    startdate: null,
    enddate: null
  };

  server.use(
    http.get('http://localhost:3010/v0/goal/:id/members', async () => {
      return HttpResponse.json([]);
    }),
    http.get('http://localhost:3010/v0/goal/:id', async () => {
      return HttpResponse.json(goalData);
    }),
  );

  localStorage.setItem('user', JSON.stringify({"token":"placeholder"}));

  render(
    <LoginProvider>
      <RefetchProvider>
        <BrowserRouter>
          <ViewGoal />
        </BrowserRouter>
      </RefetchProvider>
    </LoginProvider>
  );

  await waitFor(() => {
    screen.getByText(goalData.title);
    screen.getByText(goalData.description);
    screen.getByText(`Recurring every ${goalData.recurrence}`);
  });
});

it('Loads view goal recurring every day', async() => {
  setGoalSetting('EVERY_DAY');
  server.use(...viewGoalHandlers);

  renderViewGoalPage();

  await waitFor(() => {
    screen.getByText(goalDataEveryDay.title);
    screen.getByText(goalDataEveryDay.description);
    screen.getByText(`Recurring every ${goalDataEveryDay.recurrence}`);
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
  const goalData = {
    id: '1',
    title: 'Test Goal',
    description: 'Test Description',
    recurrence: '1 day',
    startdate: new Date().toISOString(),
    enddate: new Date().toISOString()
  };
  server.use(
    http.get('http://localhost:3010/v0/goal/:id/members', async () => {
      return HttpResponse.json([{id: '1', username: 'User1', role: 'Member'}]);
    }),
    http.get('http://localhost:3010/v0/goal/:id', async () => {
      return HttpResponse.json(goalData);
    }),
  );

  const TestComponent = () => {
    const navigate = useNavigate();
    return (
      <LoginProvider>
        <RefetchProvider>
          <ViewGoal />
        </RefetchProvider>
      </LoginProvider>
    );
  };

  render(
    <MemoryRouter initialEntries={['/goal/123']}>
      <Routes>
        <Route path="/goal/:id" element={<TestComponent />} />
      </Routes>
    </MemoryRouter>
  );

  return { navigate: useNavigate };
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
})

it('Loads view goal with error', async () => {
  const notFound = new HttpResponse('Not Found', {
    status: 404,
  });
    server.use(
      http.get('http://localhost:3010/v0/goal/{goalid}/members', async (req, res, ctx) => {
        return res(ctx.json([]), ctx.status(200));
      }),
      http.get('http://localhost:3010/v0/goal/:id', async (req, res, ctx) => {
        return notFound
      }),
    );

    render(
      <LoginProvider>
        <RefetchProvider>
          <BrowserRouter>
            <ViewGoal />
          </BrowserRouter>
        </RefetchProvider>
      </LoginProvider>
    );

    // Check if the loading indicator is shown while the request is pending
    expect(screen.getByText('Loading...')).toBeInTheDocument();
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

it('Deletes goal successfully', async () => {
  server.use(
    ...viewGoalHandlers,
    http.delete('http://localhost:3010/v0/goal/:id', async () => {
      return new HttpResponse(null, { status: 200 });
    })
  );

  const navigate = renderViewGoalPage().navigate;

  await waitFor(() => {
    screen.getByText('Test Comment');
  });

  fireEvent.click(screen.getByText('Delete goal'));

  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Yes, confirm delete'));
});

it('Leaves goal successfully', async () => {
  server.use(
    ...viewGoalHandlers,
    http.post('http://localhost:3010/v0/goal/:id/leave', async () => {
      return HttpResponse.json({});
    })
  );

  const navigate = renderViewGoalPage().navigate;

  await waitFor(() => {
    screen.getByText('Test Comment');
  });

  fireEvent.click(screen.getByText('Leave Goal'));

});

it('Handles error when deleting goal', async () => {
  server.use(
    ...viewGoalHandlers,
    http.delete('http://localhost:3010/v0/goal/:id', async () => {
      return new HttpResponse('Error', { status: 500 });
    })
  );

  renderViewGoalPage();

  await waitFor(() => {
    screen.getByText('Test Comment');
  });

  fireEvent.click(screen.getByRole('button', { name: 'Delete goal' }));

  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole('button', { name: 'Yes, confirm delete' }));
});

it('Handles error when leaving goal', async () => {
  server.use(
    ...viewGoalHandlers,
    http.post('http://localhost:3010/v0/goal/:id/leave', async () => {
      return new HttpResponse('Error', { status: 403 });
    })
  );

  renderViewGoalPage();

  await waitFor(() => {
    screen.getByText('Test Comment');
  });

  fireEvent.click(screen.getByRole('button', { name: 'Leave Goal' }));
});

it('Handles error when unable to get goal members', async () => {
  server.use(
    ...viewGoalErrorHandlers,
  );

  renderViewGoalPage();

});
