// import cards from '@/assets/data/mock-data.json'

export default {
  namespaced: true,
  state: {
    cards: []
  },
  getters: {
    getCard: (state) => (id) => {
      return state.cards.find(card => card.id === id)
    }
  },
  mutations: {
    storeCard (state, card) {
      state.cards.push(card)
    }
  },
  actions: {
    async getCard ({ state, dispatch }, id) {
      let card = state.cards.find(card => card.id === id)
      if (card != null) return card
      card = await dispatch('api/getCard', id, { root: true })
      console.log(card)
      return card
    }
  },
  modules: {
  }
}
