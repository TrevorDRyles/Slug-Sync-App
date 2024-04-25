/*
#######################################################################
#
# Copyright (C) 2022-2024 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
*/
const puppeteer = require('puppeteer');
const http = require('http');
const path = require('path');
const express = require('express');

require('dotenv').config();
const app = require('../../backend/src/app');

let backend;
let frontend;
let browser;
let page;

/**
 * Start an API server on port 3010 connected to the DEV database
 * Start a Web server for the built ("comliled") version of the UI
 * on port 3000.
 */
beforeAll(() => {
  backend = http.createServer(app);
  backend.listen(3010, () => {
    console.log('Backend Running at http://localhost:3010');
  });
  frontend = http.createServer(
    express()
      .use('/assets', express.static(
        path.join(__dirname, '..', '..', 'frontend', 'dist', 'assets')))
      .get('*', function(req, res) {
        res.sendFile('index.html',
          {root: path.join(__dirname, '..', '..', 'frontend', 'dist')});
      }),
  );
  frontend.listen(3000, () => {
    console.log('Frontend Running at http://localhost:3000');
  });
});

/**
 * Shotdown the API server then the Web server.
 */
afterAll((done) => {
  backend.close(() => {
    frontend.close(done);
  });
});

/**
 * Create a headless (not visible) instance of Chrome for each test
 * and open a new page (tab).
 */
beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: true,
  });
  page = await browser.newPage();
  page.on('console', (msg) => {
    console.log('Browser log:', msg.text());
  });
  await page.setViewport({
    width: 1980,
    height: 1080,
  });
});

/**
 * Close the headless instance of Chrome as we no longer need it.
 */
afterEach(async () => {
  await browser.close();
});

/**
 * checkWorkspacesShow
 * @return {Promise<void>}
 */
async function createGoal() {
  // https://chat.openai.com/share/67880247-ed5d-4614-af95-1b17ae8a6d05
  await page.goto('http://localhost:3000/createGoal');
  const title = await page.waitForSelector('input[id="title"]');
  await title.type('Goal Title');
  const description = await page.waitForSelector('textarea[id="description"]');
  await description.type('Goal Description');
  await page.waitForSelector('#recurrence');
  await page.click('#recurrence');
  for (let i = 0; i < 2; i++) {
    await page.keyboard.press('ArrowDown'); // Move down in the dropdown
  }
  await page.keyboard.press('Enter'); // Select the option
  await page.$eval(`[type="submit"]`, (element) =>
    element.click(),
  );
  await page.waitForNavigation();
}

test('Create goal', async () => {
  await createGoal();
});
