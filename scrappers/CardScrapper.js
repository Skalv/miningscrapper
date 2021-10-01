const puppeteer = require('puppeteer')

module.exports = class CardScrapper {

  constructor() {
    this.mainUrl = "https://www.hashrate.no/"
    this.cards = []
    this.lastUpdate = null
    this.gpuPrices = null
    this.scrapAll()
    setInterval(() => {
      this.scrapAll()
    }, 10 * 60000)

  }

  async scrapAll() {
    console.log("Start loading cards")
    await this.startBrowser()
    this.getCardsPrice()

    this.cards = await this.getCardList()

    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].details = await this.getCardDetails(this.cards[i].link)
    }

    await this.closeBrowser()
    this.lastUpdate = new Date()
  }

  async startBrowser() {
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
  }

  async closeBrowser() {
    await this.page.close()
    this.page = null
    await this.browser.close()
    this.browser = null
  }

  async getCardList() {
    await this.page.goto(this.mainUrl, { waitUntil: 'networkidle2' }).catch(() => { })
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

    return cgs
  }

  async getCardDetails(link) {
    await this.page.goto(link, { waitUntil: 'networkidle2' }).catch(() => { })
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

    return details
  }

  async getCardsPrice() {
    console.log("Récupération des prix")

    const pricePage = await this.browser.newPage()
    await pricePage.goto('https://dropreference.com/#/home/gpu', { waitUntil: 'networkidle2' })
    await pricePage.waitForSelector('.scrollable-content > .card-drop')

    pricePage.on('response', async res => {
      if (res.url() === "https://api-dropreference.com/items/gpu") {
        const datas = await res.text()
        this.gpuPrices = JSON.parse(datas)
        console.log("Prix des cartes récupéré")
      }
    })

    pricePage.$eval('p.mat-tooltip-trigger.item-name', el => el.click())
  }
}
