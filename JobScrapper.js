const puppeteer = require('puppeteer')
const jobUrl = "https://www.hashrate.no/"

let browser, page

class Jobs {
  static async init() {
    browser = await puppeteer.launch({
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

    page = await browser.newPage()
    return await Promise.race([
      await page.goto(jobUrl, { waitUntil: 'networkidle2' }).catch(() => { }),
      await page.waitForSelector('table.sortable.w3-table').catch(() => { })
    ])
  }

  static async resolver() {
    await this.init()

    return await page.evaluate(() => {
      const rows = document.querySelectorAll('tbody > tr.w3-border-bottom')
      const cgs = []
      for (let i = 0; i < rows.length; i++) {

        const link = rows[i].querySelector('.list > a').href


        cgs.push({
          name: rows[i].querySelector('.list > a').textContent,
          link,
          coin: rows[i].querySelectorAll('.fields')[0].textContent,
          rate: rows[i].querySelectorAll('.fields')[1].textContent,
          power: rows[i].querySelectorAll('.fields')[2].textContent,
          est: rows[i].querySelector('.fields > b').textContent,
        })
      }
      return cgs
    })


  }

  static async getJobs() {
    const jobs = await this.resolver()
    await browser.close()
    const data = {}
    data.jobs = jobs
    data.total_jobs = jobs.length
    return data
  }
}
export default Jobs

