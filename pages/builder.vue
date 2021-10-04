<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <div class="d-flex w-100 justify-content-between align-items-center">
          <h2>Cartes Master</h2>
          <nuxt-link :to="'/'" class="btn btn-primary">Index</nuxt-link>
          <nuxt-link :to="'/list'" class="btn btn-primary">Liste</nuxt-link>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="form-group col">
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
      <div class="form-group col-auto">
        <label for="nbMonth">Nombre de mois pour le calcul</label>
        <input
          id="nbMonth"
          v-model="nbMonth"
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
              <th>Nom</th>
              <th>Nombre</th>
              <th>actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in myCards" :key="i">
              <td>
                {{ row.card.name }} ({{ row.card.best.coin }}:
                {{ row.card.best.hashrate }}@{{ row.card.best.power }})
              </td>
              <td class="d-flex">
                <a
                  @click="
                    row.nb--
                    calculate()
                  "
                  >-</a
                >
                <p class="mx-4">{{ row.nb }}</p>
                <a
                  @click="
                    row.nb++
                    calculate()
                  "
                  >+</a
                >
              </td>
              <td>
                <button class="btn btn-success">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <p>
          Total config : <b>{{ totalConfig.toFixed(2) }}€</b> // ROI :
          <b>{{ roi.toFixed() }}</b> (mois)
        </p>
      </div>
    </div>
    <div v-if="calculator" class="row">
      <div class="col">
        <div class="row">
          <div class="col">
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Gains/mois</th>
                  <th>Total cumulé</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in calculator" :key="i">
                  <td>{{ row.date }}</td>
                  <td>${{ row.monthReward }}</td>
                  <td>${{ row.cumulate }}</td>
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
      myCards: [],
      selectedCard: null,
      calculator: null,
      nbMonth: 12,
      totalConfig: 0,
      roi: 0,
    }
  },
  async fetch() {
    this.cards = null
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
        this.myCards.push({
          card: this.selectedCard,
          nb: 1,
        })
        this.selectedCard = null
      }
    },
    myCards() {
      if (this.myCards.length > 0) {
        this.calculate()
      }
    },
  },
  methods: {
    calculate() {
      let cumulate = 0
      const startNow = moment()
      const calculatedMonth = moment()
      this.calculator = []
      this.totalConfig = 0
      this.roi = 0

      let monthReward = 0
      _.each(this.myCards, (row) => {
        const cardReward = +row.card.best.estReward.slice(1) * row.nb * 30.41
        monthReward += +cardReward.toFixed(2)
        this.totalConfig += +(row.card.goodPrice * row.nb * 0.84)
        this.roi = this.totalConfig / (monthReward * 0.84)
      })

      while (calculatedMonth.diff(startNow, 'months') < this.nbMonth) {
        cumulate += +monthReward

        this.calculator.push({
          date: calculatedMonth.format('MM-YYYY'),
          monthReward,
          cumulate: cumulate.toFixed(2),
        })

        calculatedMonth.add(1, 'month')
      }
    },
  },
}
</script>
