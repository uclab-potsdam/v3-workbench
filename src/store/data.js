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
      return state.cards.find(card => card._id === id)
    },
    getType: (state) => (id) => {
      return state.types.find(d => d._id === id)
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
    updateDocument (state, entity) {
      state.cards = state.cards.filter(({ _id }) => _id !== entity._id)
      state.cards.push(entity)
    }
  },
  actions: {
    async init ({ dispatch, commit }, id) {
      const types = await dispatch('api/getTypes', id, { root: true })
      commit('set', { types })
    },
    fetchEntity ({ state, dispatch, commit }, id) {
      const card = state.cards.find(card => card._id === id)
      console.log(card?._id)
      if (card != null) return card
      dispatch('api/getEntity', id, { root: true }).then(card => {
        commit('storeEntity', card)
      })
      return null
    },
    async refreshEntity ({ state, dispatch, commit }, id) {
      const card = await dispatch('api/getEntity', id, { root: true })
      commit('updateDocument', card)
    },
    async addProp ({ dispatch }, triple) {
      await dispatch('api/addTriple', triple, { root: true })
      await dispatch('refreshEntity', triple[0])
    },
    async removeProp ({ dispatch, getters, commit }, { _id, prop, value }) {
      const document = { ...getters.getEntity(_id) }
      if (Array.isArray(document[prop])) {
        document[prop] = document[prop].filter(d => d !== value)
      } else {
        delete document[prop]
      }
      commit('updateDocument', document)
      await dispatch('api/updateDocument', document, { root: true })
      // await dispatch('refreshEntity', triple[0])
    }
  },
  modules: {
  }
}
