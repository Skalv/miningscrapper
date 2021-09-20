const scraperObject = {
  url: 'https://www.hashrate.no/',
  async scraper(browser) {
    const page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);
    // Wait for the required DOM to be rendered
    await page.waitForSelector('table');

    // Get the table row of all cards
    return await page.$$eval('tbody > tr.w3-border-bottom', rows => {
      const cgs = []
      // Make sure the book to be scraped is in stock
      // links = links.filter(link => link.querySelector('.instock.availability > i').textContent !== "In stock")
      for (let i = 0; i < rows.length; i++) {
        cgs.push({
          name: rows[i].querySelector('.list > a').textContent,
          link: rows[i].querySelector('.list > a').href,
          coin: rows[i].querySelector('.fields')[0].textContent,
          rate: rows[i].querySelector('.fields')[1].textContent,
          power: rows[i].querySelector('.fields')[2].textContent,
          est: rows[i].querySelector('.fields > b').textContent,
        })
      }
      return cgs
    });
    // Loop through each of those links, open a new page instance and get the relevant data from them
    // const pagePromise = (link) => new Promise(async (resolve, reject) => {
    //   const dataObj = {};
    //   const newPage = await browser.newPage();
    //   await newPage.goto(link);
    //   dataObj.bookTitle = await newPage.$eval('.product_main > h1', text => text.textContent);
    //   dataObj.bookPrice = await newPage.$eval('.price_color', text => text.textContent);
    //   dataObj.noAvailable = await newPage.$eval('.instock.availability', text => {
    //     // Strip new line and tab spaces
    //     text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "");
    //     // Get the number of stock available
    //     const regexp = /^.*\((.*)\).*$/i;
    //     const stockAvailable = regexp.exec(text)[1].split(' ')[0];
    //     return stockAvailable;
    //   });
    //   dataObj.imageUrl = await newPage.$eval('#product_gallery img', img => img.src);
    //   dataObj.bookDescription = await newPage.$eval('#product_description', div => div.nextSibling.nextSibling.textContent);
    //   dataObj.upc = await newPage.$eval('.table.table-striped > tbody > tr > td', table => table.textContent);
    //   resolve(dataObj);
    //   await newPage.close();
    // });

    // for (const link in urls) {
    //   const currentPageData = await pagePromise(urls[link]);
    //   // scrapedData.push(currentPageData);
    //   console.log(currentPageData);
    // }
  }
}

module.exports = scraperObject;
