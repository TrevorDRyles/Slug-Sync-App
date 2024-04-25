import { it, beforeAll, afterAll } from 'vitest';
import {screen} from '@testing-library/react';
import { render } from "@/__tests__/render";
import { setupServer } from 'msw/node';
import Header from '@/components/SignIn/Header';

const URL = 'http://localhost:3010/v0/goal';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('Renders Header correctly', async() => {
  render(<Header content={'Test Content'}/>);
  expect(screen.getByText('Test Content')).toBeDefined();
})