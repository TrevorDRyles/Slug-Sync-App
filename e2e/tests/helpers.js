module.exports.handleDialog = (page, message) => {
  return new Promise((resolve) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe(message);
      await dialog.accept();
      resolve();
    });
  });
};

const EMAIL = 'hunter@ucsc.edu';
const PASSWORD = 'huntertratar';

/**
 * login
 * @param{any} page
 * @return {Promise<void>}
 */
module.exports.login = async function(page) {
  await page.goto('http://localhost:3000/login');
  const email = await page.waitForSelector('input[id="email"]');
  await email.type(EMAIL);
  const password = await page.waitForSelector(
    'input[id="password"]');
  await password.type(PASSWORD);
  // const submit = await page.waitForSelector('[type="submit"]');
  // console.log(submit);
  await page.$eval(`[type="submit"]`, (element) =>
    element.click(),
  );
  await page.waitForNavigation();
};

/**
 * logout
 * @param{any} page
 * @return {Promise<void>}
 */
module.exports.logout = async function(page) {
  await page.waitForSelector('#logout');
  // await logout.click();
  await page.$eval(`#logout`, (element) =>
    element.click(),
  );
  await page.waitForSelector('#welcome');
  const content = await page.$eval('#welcome',
    (el) => el.textContent.trim());
  expect(content).toBe('Welcome to SlugSync');
};

/**
 * signUp
 * @param{any} page
 * @return {Promise<string>}
 */
module.exports.signUp = async function (page) {
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
  const email = `test${crypto.randomUUID()}@gmail.com`;
  await emailInput.type(email);
  await page.click('aria/Submit Signin Button');

  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Register")',
  );
  await module.exports.handleDialog(page, 'Register successful, please log in');
  return email;
};

