import { it, beforeAll, afterAll } from 'vitest';
import {screen} from '@testing-library/react';
import { render } from "@/__tests__/render";
import { setupServer } from 'msw/node';
import { Footer } from '@/components/SignIn/Footer';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('Renders with correct information', async() => {
  render(<Footer />)
  expect(screen.getByText('Copyright © SlugSync 2024.')).toBeDefined();
})