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
const {handleDialog} = require('./helpers');

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
    // console.log('Backend Running at http://localhost:3010');
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
    // console.log('Frontend Running at http://localhost:3000');
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
    // console.log('Browser log:', msg.text());
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

// this test can only be run once to succeed because it
// creates data and duplicates can't be created without error conflict
// TODO cleanup after this test when the delete endpoint is implemented
test('Successful Registration', async () => {
  await page.goto('http://localhost:3000/login');
  await page.waitForFunction(
    `document.querySelector("body").innerText.includes(
    "Don't have an account? Register")`,
  );
  page.click('aria/Switch Signin');
  await page.waitForFunction(
    `document.querySelector("body").innerText.includes(
    "Already have an account? Login")`,
  );
  const nameInput = await page.$('#name');
  await nameInput.type('Test name');
  const passwordInput = await page.$('#password');
  await passwordInput.type('12345678');
  const emailInput = await page.$('#email');
  await emailInput.type('test@gmail.com');
  await page.click('aria/Submit Signin Button');

  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Register")',
  );
  await handleDialog(page, 'Register successful, please log in');
});

test('Deplicate Registration', async () => {
  await page.goto('http://localhost:3000/login');
  await page.waitForFunction(
    `document.querySelector("body").innerText.includes(
    "Don't have an account? Register")`,
  );
  page.click('aria/Switch Signin');
  await page.waitForFunction(
    `document.querySelector("body").innerText.includes(
    "Already have an account? Login")`,
  );
  const nameInput = await page.$('#name');
  await nameInput.type('Test name');
  const passwordInput = await page.$('#password');
  await passwordInput.type('12345678');
  const emailInput = await page.$('#email');
  await emailInput.type('test@gmail.com');
  await page.click('aria/Submit Signin Button');

  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Register")',
  );
  await handleDialog(page, 'Error signing up, please try again');
});
