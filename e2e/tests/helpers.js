module.exports.handleDialog = (page, message) => {
  return new Promise((resolve) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe(message);
      await dialog.accept();
      resolve();
    });
  });
};
