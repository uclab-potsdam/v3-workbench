// import cards from '@/assets/data/mock-data.json'

export default {
  namespaced: true,
  state: {
    cards: [],
    searchResults: [],
    types: [{
      id: 'scm:Place',
      background: 'blue',
      text: 'magenta',
      light: true
    }, {
      id: 'scm:Person',
      background: 'teal',
      text: 'red',
      light: false
    }]
  },
  getters: {
    getCard: (state) => (id) => {
      return state.cards.find(card => card.id === id)
    },
    getType: (state) => (id) => {
      return state.types.find(d => d.id === id)
    }
  },
  mutations: {
    set (state, obj) {
      Object.keys(obj).forEach(key => {
        state[key] = obj[key]
      })
    },
    storeCard (state, card) {
      state.cards.push(card)
    }
  },
  actions: {
    async getCard ({ state, dispatch, commit }, id) {
      let card = state.cards.find(card => card.id === id)
      if (card != null) return card
      card = await dispatch('api/getCard', id, { root: true })
      commit('storeCard', card)
      return card
    }
  },
  modules: {
  }
}
