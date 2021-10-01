const express = require('express')
const cors = require('cors')
const app = express()
const port = 3001

const CardScrapper = require('./CardScrapper')
const cardScrapper = new CardScrapper()

app.use(cors())

app.get('/', (req, res) => {
  res.json({
    cards: cardScrapper.cards,
    prices: cardScrapper.gpuPrices,
    lastUpdate: cardScrapper.lastUpdate
  })
})

app.listen(port, () => {
  console.log('Scrapper node listening at http://localhost:' + port)
})
