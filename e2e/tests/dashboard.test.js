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
// const NUM_ELEMENTS_ON_GOALS_INDEX_PAGE = 4;
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
    headless: false,
  });
  page = await browser.newPage();
  page.on('console', (msg) => {
    console.log('Browser log:', msg.text());
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

const signUp = async(page, name, email, password) => {
  await page.goto('http://localhost:3000/login')
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Login")',
  );
  await page.click('[aria-label="Switch Signin"')
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Register")',
  );
  const nameInput = await page.$('aria/Name Input')
  await nameInput.type(name);
  const emailInput = await page.$('aria/Email Input')
  await emailInput.type(email);
  const passwordInput = await page.$('aria/Password Input')
  await passwordInput.type(password)
  await page.click('aria/Submit Signin Button');
  page.on('dialog', async dialog => {
    await dialog.accept()
  })
}

const logIn = async(page, email, password) => {
  await page.goto('http://localhost:3000/login')
  const emailInput = await page.$('aria/Email Input')
  await emailInput.type(email);
  const passwordInput = await page.$('aria/Password Input')
  await passwordInput.type(password)
  await page.click('aria/Submit Signin Button')
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Complete")',
  )
}

// test('Signs up and logs into dashboard page', async() => {
//   await signUp(page, "Test name", "test123@gmail.com", "password")
//   await logIn(page, "test123@gmail.com", "password");
// })

test('Adds a new goal', async() => {
  await logIn(page, "e2etester@gmail.com", "password");
  await page.hover('aria/Goals dropdown')
  await page.click('aria/Create Goal Button')
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Create Goal")',
  )
  const titleInput = await page.$('aria/Title Input')
  await titleInput.type("Learn React")
  const descriptionInput = await page.$('aria/Description Input')
  await descriptionInput.type('This is a goal to learn react for 115A!')
  await page.click('aria/Tag Input')
  await page.evaluate(() => {
    const element = document.querySelector('[value="Productivity"]')
    if (element) {
      element.click();
    }
  })
  await page.waitForSelector('aria/Select start date')
  await page.click('aria/Select start date');
  await page.waitForSelector('aria/11 June 2024');
  await page.click('aria/11 June 2024')
  await page.waitForSelector('aria/Select end date');
  await page.click('aria/Select end date')
  await page.waitForSelector('aria/12 June 2024');
  await page.click('aria/12 June 2024')
  await page.waitForSelector('aria/Submit New Goal');
  await page.click('aria/Submit New Goal')
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Learn React")',
  )
})

test('Clicks complete goal', async() => {
  await logIn(page, "e2etester@gmail.com", "password")
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("0")',
  )
  await page.click('aria/Goal not completed');
  await page.waitForSelector('aria/Goal completed');
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("1")',
  )
});

test('Deletes goal cleanup', async() => {
  await logIn(page, "e2etester@gmail.com", "password")
  await page.hover('aria/Goals dropdown')
  await page.click('aria/View Goal Button');
  await page.waitForSelector('aria/Search bar input')
  const searchInput = await page.$('aria/Search bar input')
  searchInput.type("Learn React")
  await page.waitForSelector('aria/Goal Title Text')
  await page.click('aria/Goal Title Text')
  await page.waitForSelector('aria/Delete Goal Button')
  await page.click('aria/Delete Goal Button')
  await page.click('aria/Confirm delete button')
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Goals")',
  )
})