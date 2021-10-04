<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <div class="d-flex w-100 justify-content-between align-items-center">
          <h2>Cartes Master</h2>
          <nuxt-link :to="'/list'" class="btn btn-primary">Liste</nuxt-link>
          <nuxt-link :to="'/builder'" class="btn btn-primary">
            Builder
          </nuxt-link>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="form-group">
          <label for="cardSelect">Sélectionner une carte :</label>
          <select
            id="cardSelect"
            v-model="selectedCard"
            class="form-control"
            name="cardSelect"
          >
            <option v-for="(card, i) in cardList" :key="i" :value="card">
              {{ card.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div v-if="calculator" class="row">
      <div class="col">
        <div class="row">
          <div class="col">
            <h2>Calcul pour {{ selectedCard.name }}</h2>
            <p>
              Prix : {{ selectedCard.goodPrice }}$ // Hash :
              {{ selectedCard.best.hashrate }}({{ selectedCard.best.coin }}) //
              Power : {{ selectedCard.best.power }} // estReward :
              {{ selectedCard.best.estReward }}/days
            </p>
          </div>
        </div>
        <div class="row">
          <div class="form-group col">
            <label for="nbCardStart">Nombre de carte au départ</label>
            <input
              id="nbCardStart"
              v-model="nbCardStart"
              class="form-control"
              type="number"
            />
          </div>
          <div class="form-group col">
            <label for="nbCardMax">Nombre maximum de carte</label>
            <input
              id="nbCardMax"
              v-model="nbCardMax"
              class="form-control"
              type="number"
            />
          </div>
          <div class="form-group col">
            <label for="nbMonth">Nombre de mois pour le calcul</label>
            <input
              id="nbMonth"
              v-model="nbMonth"
              class="form-control"
              type="number"
            />
          </div>
          <div class="form-group col">
            <label for="otherCards">Gains depuis autres cartes</label>
            <input
              id="otherCards"
              v-model="otherCards"
              class="form-control"
              type="number"
            />
          </div>
        </div>
        <div class="row">
          <div class="col">
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>NB Carte</th>
                  <th>Gains du mois</th>
                  <th>Total cumulé</th>
                  <th>Combien on rachète ?</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in calculator" :key="i">
                  <td>{{ row.date }}</td>
                  <td>{{ row.nbCard }}</td>
                  <td>${{ row.monthReward }}</td>
                  <td>${{ row.cumulate }}</td>
                  <td>{{ row.buyAnother }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const _ = require('lodash')
const moment = require('moment')
moment.locale('fr')

export default {
  data() {
    return {
      cards: [],
      selectedCard: null,
      calculator: null,
      nbCardStart: 2,
      nbCardMax: 16,
      nbMonth: 12,
      otherCards: 0,
    }
  },
  async fetch() {
    const { cards } = await this.$axios.$get('http://localhost:3001/')

    this.cards = cards
  },
  computed: {
    cardList() {
      return _.filter(this.cards, (card) => {
        return card.goodPrice && card.details
      })
    },
  },
  watch: {
    selectedCard() {
      if (this.selectedCard) {
        this.calculate()
      }
    },
    nbCardStart() {
      this.calculate()
    },
    nbCardMax() {
      this.calculate()
    },
    nbMonth() {
      this.calculate()
    },
    otherCards() {
      this.calculate()
    },
  },
  methods: {
    calculate() {
      let cumulate = 0
      const startNow = moment()
      const calculatedMonth = moment()
      let nbCard = +this.nbCardStart
      this.calculator = []

      const cardReward = +this.selectedCard.best.estReward.slice(1)

      while (calculatedMonth.diff(startNow, 'months') < this.nbMonth) {
        const monthReward = +(
          nbCard * cardReward * 30.41 +
          +this.otherCards
        ).toFixed(2)
        cumulate += monthReward
        const buyAnother =
          cumulate >= this.selectedCard.goodPrice && nbCard < this.nbCardMax

        this.calculator.push({
          date: calculatedMonth.format('MM-YYYY'),
          nbCard,
          monthReward,
          cumulate: cumulate.toFixed(2),
          buyAnother: buyAnother
            ? `Oui (${Math.floor(cumulate / this.selectedCard.goodPrice)})`
            : 'Non',
        })

        if (buyAnother && nbCard < this.nbCardMax) {
          let many = Math.floor(cumulate / this.selectedCard.goodPrice)
          const reste = cumulate % this.selectedCard.goodPrice

          if (many > this.nbCardMax - nbCard) {
            many = this.nbCardMax - nbCard
            nbCard += many
            cumulate -= many * this.selectedCard.goodPrice
          } else {
            cumulate = reste
            nbCard += many
          }
        }

        calculatedMonth.add(1, 'month')
      }
    },
  },
}
</script>
