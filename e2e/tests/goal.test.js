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
const {login, signUp} = require('./helpers');

let backend;
let frontend;
let browser;
let page;
const NUM_ELEMENTS_ON_GOALS_INDEX_PAGE = 4;
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
 * createGoal
 * @param {string} title
 * @param {string} description
 * @param {number} arrowsDownOnRecurrence
 * @param {number} arrowsDownOnTags
 * @return {Promise<void>}
 */
async function createGoal(title, description, arrowsDownOnRecurrence,
                          arrowsDownOnTags) {
  // https://chat.openai.com/share/67880247-ed5d-4614-af95-1b17ae8a6d05
  await page.goto('http://localhost:3000/createGoal');

  const titleInput = await page
    .waitForSelector('input[id="title"]');
  await titleInput.type(title);

  const descriptionInput = await page
    .waitForSelector('textarea[id="description"]');
  await descriptionInput.type(description);

  await page.waitForSelector('#recurrence');
  await page.click('#recurrence');
  for (let i = 0; i < arrowsDownOnRecurrence; i++) {
    // Move down in the dropdown
    await page.keyboard.press('ArrowDown');
  }
  await page.keyboard.press('Enter');

  await page.waitForSelector('#tag');
  await page.click('#tag');
  for (let i = 0; i < arrowsDownOnTags; i++) {
    // Using same var as recurrence because of similar format
    await page.keyboard.press('ArrowDown');
  }
  await page.keyboard.press('Enter');

  await page.waitForSelector('#startdate');
  await page.click('#startdate');
  await new Promise((r) => setTimeout(r, 1000));
  // click the text 15 on screen
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  // wait one second
  await page.waitForSelector('#enddate');
  await page.click('#enddate');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');

  await page.$eval(`[type="submit"]`, (element) =>
    element.click(),
  );
  await page.waitForNavigation();
}

test('Create goal', async () => {
  await createGoal('GoalTitle', 'GoalDescription', 2, 1);
});

/**
 * clickFirstGoal
 * @return {Promise<void>}
 */
async function clickFirstGoal() {
  await page.waitForSelector('[aria-label^="goal-link-"]');

  await page.evaluate(() => {
    const goalLink = document.querySelector('[aria-label^="goal-link-"]');
    if (goalLink) {
      goalLink.click();
    }
  });
}

/**
 * expectViewGoalPageContents
 * @return {Promise<void>}
 */
async function expectViewGoalPageContents() {
  await page.waitForSelector('[aria-label^="goal-title-"]');
  const goalTitle = await page.evaluate(() => {
    const goalLink = document.querySelector('[aria-label^="goal-title-"]');
    return goalLink.innerText;
  });
  expect(goalTitle).toBeDefined();
}

/**
 * typeIntoSearchAndExpectFilter
 * @return {Promise<void>}
 */
async function typeIntoSearchAndExpectFilter() {
  // wait for goals to appear
  await page.waitForFunction((count) => {
    const elements = document.querySelectorAll(`[aria-label^="goal-link-"]`);
    return elements.length >= count;
  }, {}, NUM_ELEMENTS_ON_GOALS_INDEX_PAGE);
  const searchInput = await page
    .waitForSelector('input[id="search-filter-goals"]');
  await searchInput.type('GoalTitle1');
  await page.waitForFunction((text) =>
    document.body.innerText.includes(text), {}, 'GoalTitle1');
  // wait for goals to appear post filter
  // this is needed to pass the test
  await page.waitForFunction((count) => {
    const elements = document.querySelectorAll(`[aria-label^="goal-link-"]`);
    return elements.length >= count;
  }, {}, NUM_ELEMENTS_ON_GOALS_INDEX_PAGE);
  // console.log('made it here');
  // wait for selected goals to appear
  await page.waitForFunction((label, count) => {
    const elements = document.querySelectorAll(`[aria-label^="goal-link-"]`);
    let matchedCount = 0;
    // console.log('elements: ', elements.length);
    elements.forEach((element) => {
      if (element.textContent.includes(label)) {
        matchedCount++;
      }
    });
    // console.log('matched count: ', matchedCount);
    return matchedCount >= count;
  }, {}, 'GoalTitle1', NUM_ELEMENTS_ON_GOALS_INDEX_PAGE);
}

/**
 * addCommentToGoal
 * @return {Promise<void>}
 */
async function addCommentToGoal() {
  const titleInput = await page
    .waitForSelector('[aria-label^="Type comment"]');
  await titleInput.type('I like this goal');

  await page.evaluate(() => {
    const postComment = document.querySelector('[aria-label^="Post comment"]');
    if (postComment) {
      postComment.click();
    }
  });
}

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

/**
 * viewCommentOnGoal
 * @return {Promise<void>}
 */
async function viewCommentOnGoal() {
  const comment = '[aria-label^="Comment 1"]';
  await verifyTextOnScreenBySelectorAndText(
    comment, 'I like this goal');
  await verifyTextOnScreenBySelectorAndText(
    comment, 'Today');
}

test('Clicking into goal from listing page and viewing its ' +
  'contents', async () => {
  // Create sample goal data
  for (let i = 1; i <= NUM_ELEMENTS_ON_GOALS_INDEX_PAGE; i++) {
    await createGoal('GoalTitle' + i, 'GoalDescription' + i, i, i % 6);
  }
  await page.goto('http://localhost:3000/goals');
  await clickFirstGoal();
  await expectViewGoalPageContents();
});

test('Filtering goals by search', async () => {
  // Create sample goal data
  for (let i = 1; i <= 14; i++) {
    await createGoal('GoalTitle' + i, 'GoalDescription' + i, i, i % 6);
  }
  await page.goto('http://localhost:3000/goals');
  await typeIntoSearchAndExpectFilter();
});

test('Adding comments to a goal', async () => {
  await createGoal('GoalTitle1', 'GoalDescription' + 1, 1, 1);
  await addCommentToGoal();
  await viewCommentOnGoal();
});

test('Delete goal', async () => {
  const title = crypto.randomUUID();
  await createGoal(title, 'GoalDescription' + 1, 1, 1);
  await page.waitForSelector('[aria-label^="Delete Goal"]');
  await page.click('[aria-label^="Delete Goal"]');
  // click delete goal
  await page.waitForSelector('[aria-label^="Confirm Delete Goal"]');
  await page.click('[aria-label^="Confirm Delete Goal"]');
  await page.waitForNavigation();
  await new Promise((r) => setTimeout(r, 1000));
  // have to slice because hyphens are escaped characters
  const searchInput = await page
    .waitForSelector('input[id="search-filter-goals"]');
  await searchInput.type(title.slice(0, 8));
  await page.waitForFunction((text) =>
    !document.body.innerText.includes(text), {}, title);
});

// test leaving a goal
test('Leave goal and add goal', async () => {
  const title = crypto.randomUUID();
  await createGoal(title, 'GoalDescription' + 1, 1, 1);
  await signUp(page);
  const loggedInUserName = 'Test name';
  await page.keyboard.press('Enter');
  await new Promise((r) => setTimeout(r, 1000));
  await page.goto('http://localhost:3000/goals');
  await new Promise((r) => setTimeout(r, 1000));
  // search for title of goal
  const searchInput = await page
    .waitForSelector('input[id="search-filter-goals"]');
  await searchInput.type(title.slice(0, 8));
  await new Promise((r) => setTimeout(r, 1000));
  // add goal
  await page.waitForSelector('[aria-label^="Add Goal"]');
  await page.click('[aria-label^="Add Goal"]');
  await new Promise((r) => setTimeout(r, 1000));
  await page.waitForFunction((text) => document.body.innerText
    .includes(text), {}, loggedInUserName);
  // leave goal
  await page.waitForSelector('[aria-label^="Leave Goal"]');
  await page.click('[aria-label^="Leave Goal"]');
  await page.waitForNavigation();
  // search for goal and click on it
  await searchInput.type(title.slice(0, 8));
  await new Promise((r) => setTimeout(r, 1000));
  await page.waitForSelector('[aria-label^="goal-link-"]');
  await page.click('[aria-label^="goal-link-"]');
  await new Promise((r) => setTimeout(r, 1000));
  // confirm name of logged in user is no longer there
  await page.waitForFunction((text) =>
    !document.body.innerText.includes(text), {}, title);
});
