const puppeteer = require('puppeteer');
const http = require('http');
const path = require('path');
const express = require('express');

require('dotenv').config();
const app = require('../../backend/src/app');
const {login} = require('./helpers');

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
      .get('*', function (req, res) {
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
    width: 1080,
    height: 780,
  });
  await login(page);
});

/**
 * Close the headless instance of Chrome as we no longer need it.
 */
afterEach(async () => {
  await browser.close();
});

/**
 * verifyTextOnScreenBySelectorAndText
 * @param{string} selector
 * @param{string} text
 * @return {Promise<void>}
 */
async function verifyTextOnScreenBySelectorAndText(selector, text) {
  await page.waitForSelector(selector);
  await page.waitForFunction(
    (selector, text) => {
      const element = document.querySelector(selector);
      return element && element.innerText.includes(text);
    },
    {},
    selector,
    text,
  );
}

test('profile page loads with no error', async () => {
  const name = '[data-testid^="name"]';
  const bio = '[data-testid^="bio"]';

  await page.waitForSelector('[aria-label="UserIcon1"]');
  await page.click('[aria-label="UserIcon1"]');

  await verifyTextOnScreenBySelectorAndText(
    name, 'Hunter');
  await verifyTextOnScreenBySelectorAndText(
    bio, 'Hello!');
});

