module.exports.handleDialog = (page, message) => {
  return new Promise((resolve) => {
    page.on('dialog', async (dialog) => {
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
