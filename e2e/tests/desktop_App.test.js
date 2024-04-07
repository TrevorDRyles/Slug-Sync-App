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

// copied above from starter code

const EMAIL = 'molly@books.com';
const PASSWORD = 'mollymember';

/**
 * checkWorkspacesShow
 * @return {Promise<void>}
 */
async function login() {
  await page.goto('http://localhost:3000/login');
  console.log('login: 1');
  const email = await page.waitForSelector('input[type="text"][id="email"]');
  await email.type(EMAIL);
  console.log('login: 2');
  const password = await page.waitForSelector(
    'input[type="password"][name="password"]');
  await password.type(PASSWORD);
  console.log('login: 3');
  const submit = await page.waitForSelector('[type="submit"]');
  console.log(submit);
  // https://stackoverflow.com/questions/70398134/puppeteer-trigger-click-of-button-not-working
  console.log('login: 4');
  await page.$eval(`[type="submit"]`, (element) =>
    element.click(),
  );
  console.log('login: 4.5');
  await page.waitForNavigation();
  console.log('login: 5');
  // await page.waitForSelector('#welcome');
  // console.log('login: 6');
  // const content = await page.evaluate((el) =>
  // el.textContent.trim(), element);
  // console.log('login: 7');
  // expect(content).toContain('Welcome to slack');
}
/**
 * checkWorkspacesShow
 * @return {Promise<void>}
 */
async function logout() {
  const logout = await page.waitForSelector('#logout');
  console.log(logout);
  // await logout.click();
  await page.$eval(`#logout`, (element) =>
    element.click(),
  );
  await page.waitForSelector('#signIn');
  const content = await page.$eval('#signIn', (el) => el.textContent.trim());
  expect(content).toBe('Sign in');
}


test('login logout', async () => {
  await login();
  await logout();
});

