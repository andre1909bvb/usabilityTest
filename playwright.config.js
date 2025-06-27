// playwright.config.js
module.exports = {
    use: {
      channel: 'chrome',  // startet echten Google Chrome statt Chromium
      headless: false,    // damit du das Browserfenster siehst
      // weitere Optionen wie viewport, baseURL etc. hier rein
    },
  };
  