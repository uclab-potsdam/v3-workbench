// refactor: replace `card` with `entity`

export default {
  namespaced: true,
  state: {
    cards: [],
    searchResults: [],
    remoteSearchResults: [],
    types: []
  },
  getters: {
    getEntity: (state) => (id) => {
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
    storeEntity (state, card) {
      state.cards.push(card)
    },
    replaceEntity (state, card) {
      state.cards = state.cards.filter(({ id }) => id !== card.id)
      state.cards.push(card)
    }
  },
  actions: {
    async init ({ dispatch, commit }, id) {
      const types = await dispatch('api/getTypes', id, { root: true })
      commit('set', { types })
    },
    async fetchEntity ({ state, dispatch, commit }, id) {
      let card = state.cards.find(card => card.id === id)
      if (card != null) return card
      card = await dispatch('api/getEntity', id, { root: true })
      commit('storeEntity', card)
      return card
    },
    async refreshEntity ({ state, dispatch, commit }, id) {
      const card = await dispatch('api/getEntity', id, { root: true })
      commit('replaceEntity', card)
    },
    async addProp ({ dispatch }, triple) {
      await dispatch('api/addTriple', triple, { root: true })
      await dispatch('refreshEntity', triple[0])
    },
    async removeProp ({ dispatch }, triple) {
      await dispatch('api/removeTriple', triple, { root: true })
      await dispatch('refreshEntity', triple[0])
    }
  },
  modules: {
  }
}
