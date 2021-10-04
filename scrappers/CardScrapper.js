const puppeteer = require('puppeteer')
const _ = require('lodash')

module.exports = class CardScrapper {

  LHR = ['RTX3080LHR', 'RTX3070LHR', 'RTX3060TiLHR', 'RTX3060LHRv2']

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
    await this.startBrowser()

    this.gpuPrices = await this.getCardsPrice()
    this.cards = await this.getCardList()

    for (let i = 0; i < this.cards.length; i++) {
      const details = await this.getCardDetails(this.cards[i].link)

      this.cards[i].details = details
      this.cards[i].best = this.getCardBest(details)
      this.cards[i].goodPrice = this.getGoodPrice(this.cards[i])
    }

    await this.closeBrowser()
    this.lastUpdate = new Date()
  }

  async startBrowser() {
    this.browser = await puppeteer.launch({
      headless: false,
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

    const cgs = await this.page.$$eval('.w3-hide-small.w3-hide-large > center > table > tbody > tr.w3-border-bottom', rows => {
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
    const pricePage = await this.browser.newPage()
    await pricePage.goto('https://dropreference.com/#/home/gpu', { waitUntil: 'networkidle2' })
    await pricePage.waitForSelector('.scrollable-content > .card-drop')

    return new Promise((resolve) => {
      pricePage.on('response', async res => {
        if (res.url() === "https://api-dropreference.com/items/gpu") {
          const datas = await res.text()

          resolve(JSON.parse(datas))
        }
      })

      pricePage.$eval('p.mat-tooltip-trigger.item-name', el => el.click())
    })
  }

  getCardBest(details) {
    let best = null
    _.each(details, (detail) => {
      if (!best || best.estReward < detail.estReward) {
        best = detail
      }
    })

    return best

  }

  getGoodPrice(card) {
    const decomposedName = card.name.split(' ')
    const constructor = decomposedName[0]
    let reference = card.name
      .substring(constructor.length)
      .replace(/ /g, '')

    if (_.indexOf(this.LHR, reference) >= 0) {
      reference = reference.replace(/LHR/g, '')
      reference = reference.replace(/v2/g, '')
    }

    const prices = _.find(this.gpuPrices, gpu => {
      let gpuName = gpu.label.replace(/ /g, '')
      if (gpu.entreprise === "AMD") {
        gpuName = `RX${gpuName}`
      }
      return gpuName === reference
    })

    if (prices) {
      return (+prices.goodPrice * 1.16).toFixed(2)
    } else {
      return null
    }
  }
}
