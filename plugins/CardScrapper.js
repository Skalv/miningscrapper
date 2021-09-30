const puppeteer = require('puppeteer')
// let browser, page

class CardScrapper {

  async startBrowser(Url) {
    this.browser = await puppeteer.launch({
      headless: true,
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
    })

    this.page = await this.browser.newPage()
    return await this.page.goto(Url, { waitUntil: 'networkidle2' }).catch(() => { })
  }

  async getCardList() {
    await this.startBrowser("https://www.hashrate.no/")
    await this.page.waitForSelector('table.sortable.w3-table').catch(() => { })

    const cgs = await this.page.$$eval('tbody > tr.w3-border-bottom', rows => {
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
    })

    await this.browser.close()

    return cgs
  }

  async getCardDetails(link) {
    await this.startBrowser(link)
    await this.page.waitForSelector('table.sortable').catch(() => { })

    const details = await this.page.$eval('table.sortable > tbody', el => {
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
    await this.page.close()

    return details
  }
}


export default function ({ app }, inject) {
  const scrapper = new CardScrapper()
  inject('cardScrapper', scrapper)
}
