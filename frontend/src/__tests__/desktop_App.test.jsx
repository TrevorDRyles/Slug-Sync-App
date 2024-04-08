/*
#######################################################################
#
# Copyright (C) 2022-2024 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
*/
import {it, beforeAll, afterAll, afterEach} from 'vitest';
import {render} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
import App from '../App.jsx';

const URL='http://localhost:3010/v0/dummy';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
 * Send back known text and OK to check UI displays text as expected
 */
it('Desktop Has Clickable Button', async () => {
  server.use(
      http.get(URL, async () => {
        return HttpResponse.json({message: 'Hello CSE186'}, {status: 200});
      }),
  );
  render(<App />);
});

