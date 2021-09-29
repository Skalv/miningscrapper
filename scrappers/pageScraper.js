const scraperObject = {
  url: 'https://www.hashrate.no/',
  async scraper(browser) {
    const page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);
    // Wait for the required DOM to be rendered
    await page.waitForSelector('table.sortable.w3-table');

    // Get the table row of all cards
    const cgs = await page.$$eval('tbody > tr.w3-border-bottom', rows => {

      return rows.map(el => {
        return {
          name: el.querySelector('.list > a').textContent,
          link: el.querySelector('.list > a').href,
          coin: el.querySelectorAll('.fields')[0].textContent,
          rate: el.querySelectorAll('.fields')[1].textContent,
          power: el.querySelectorAll('.fields')[2].textContent,
          est: el.querySelector('.fields > b').textContent,
        }
      })
    });

    const itemFetcher = async (link) => {
      const itemPage = await browser.newPage()
      await itemPage.goto(link)
      await itemPage.waitForSelector('table.sortable')

      const details = await itemPage.$eval('table.sortable > tbody', el => {
        const trs = el.querySelectorAll('tr')

        const datas = []
        trs.forEach((el) => {
          const tds = el.querySelectorAll('td')
          datas.push({
            coin: tds[0].textContent,
            hashrate: tds[1].textContent,
            power: tds[2].textContent,
            estReward: el.querySelector('td > b').textContent,
            roi: tds[5].textContent
          })
        })
        return datas
      })
      await itemPage.close()
      return details
    }

    for (let i = 0; i < cgs.length; i++) {
      cgs[i].details = await itemFetcher(cgs[i].link)
    }


    return cgs
  }
}

module.exports = scraperObject;
