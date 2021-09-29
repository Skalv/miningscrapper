const puppeteer = require('puppeteer');

async function startBrowser() {
  let browser;
  try {
    console.log("Opening the browser......");
    browser = await puppeteer.launch({
      headless: true, // Sorte de mode background -> ici on lance une fenetre
      args: [
        '--no-sandbox',
        '--disable-setui-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--single-process',
        '--disable-gpu'
      ],
      'ignoreHTTPSErrors': true
    });
  } catch (err) {
    console.log("Could not create a browser instance => : ", err);
  }
  return browser;
}

module.exports = {
  startBrowser
};
