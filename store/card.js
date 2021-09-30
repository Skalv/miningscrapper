// import CardScrapper from "~/plugins/CardScrapper"

// Actions
export const actions = {
  async getCards({ commit }) {
    const data = await this.$cardScrapper.getCardList()
    if (data.length > 0) {
      commit('STORE_CARDS', data)
      return data
    }
  }
}

// Mutation
export const mutations = {
  STORE_CARDS(state, payload) {
    state.cards = payload
    state.total_cards = payload.length
  }
}

// Getter
export const getters = {
  getCards: (state) => () => {
    return state.cards
  }
}

// State
export const state = () => ({
  cards: [],
  total_cards: 0
})
