import { it, beforeAll, afterAll } from 'vitest';
import {findByText, fireEvent, waitFor, screen, queryByLabelText, findAllByLabelText} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import App from '../App.jsx';
import { setupServer } from 'msw/node';

import {CloseButton, CopyButton} from '@mantine/core';
import { render } from "./render.jsx";
import React from "react";

const URL = 'http://localhost:3010/v0/createGoal';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
 * Send back known text and OK to check UI displays text as expected
 */
it('Mantine render works', async () => {
  render(<CloseButton />);
});
