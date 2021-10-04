<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <div class="d-flex w-100 justify-content-between">
          <h2>Cartes Master</h2>
          <nuxt-link :to="'/'" class="btn btn-primary">Index</nuxt-link>
          <nuxt-link :to="'/builder'" class="btn btn-primary">
            Builder
          </nuxt-link>
          <p v-if="lastUpdate">{{ lastUpdate }}</p>
          <p v-else>Pas encore totalement synchro</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="list-group">
          <div
            v-for="(card, i) in detailedCards"
            :key="i"
            class="list-group-item"
          >
            <div class="row">
              <div class="col">
                <div class="d-flex justify-content-between w-100">
                  <h5>{{ card.name }}</h5>
                  <p v-if="card.goodPrice">+/- ${{ card.goodPrice }}</p>
                </div>
                <div
                  v-if="card.best"
                  class="d-flex justify-content-between w-100"
                >
                  <p>
                    {{ card.best.coin }} ({{ card.best.hashrate }} @
                    {{ card.best.power }}) => {{ card.best.estReward }} days ({{
                      card.best.estReward | calculateMonthRwd
                    }}/month)
                  </p>
                  <p>
                    <b>ROI : {{ card.best.estReward | calculateROI(card) }}</b>
                  </p>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <b-button v-b-toggle="`card${i}`">Details</b-button>
              </div>
            </div>
            <div class="row">
              <b-collapse :id="`card${i}`" class="col">
                <table v-if="card.details" class="table table-sm">
                  <thead>
                    <tr>
                      <th>Coin</th>
                      <th>Hashrate</th>
                      <th>Power</th>
                      <th>Reward/jours</th>
                      <th>Reward/mois</th>
                      <th>ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="coinDetail in card.details"
                      :key="coinDetail.coin"
                    >
                      <td>{{ coinDetail.coin }}</td>
                      <td>{{ coinDetail.hashrate }}</td>
                      <td>{{ coinDetail.power }}</td>
                      <td>{{ coinDetail.estReward }}</td>
                      <td>{{ coinDetail.estReward | calculateMonthRwd }}</td>
                      <td>{{ coinDetail.estReward | calculateROI(card) }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-else>Donnés pas encore chargées</p>
              </b-collapse>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const _ = require('lodash')
export default {
  filters: {
    calculateMonthRwd(est) {
      const value = +est.slice(1, est.length)
      return `$${(value * 30.41).toFixed(2)}`
    },
    calculateROI(estReward, card) {
      if (card.goodPrice) {
        const reward = +estReward.slice(1)
        return `${(+card.goodPrice / reward).toFixed()} days`
      } else {
        return 'N/A'
      }
    },
  },
  data() {
    return {
      cards: [],
      lastUpdate: null,
    }
  },
  computed: {
    detailedCards() {
      return _.filter(this.cards, (card) => {
        return card.goodPrice && card.details
      })
    },
  },
  mounted() {
    window.setInterval(() => {
      this.syncdatas()
    }, 10000)
  },
  methods: {
    async syncdatas() {
      const datas = await this.$axios.$get('http://localhost:3001/')

      this.lastUpdate = datas.lastUpdate
      this.cards = datas.cards
    },
  },
}
</script>
