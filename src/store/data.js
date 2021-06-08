import cards from '@/assets/data/mock-data.json'

export default {
  namespaced: true,
  state: {
    cards
  },
  getters: {
    getCard: (state) => (id) => {
      return state.cards.find(card => card.id === id)
    }
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
}
