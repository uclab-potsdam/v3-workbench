// refactor: replace `card` with `entity`

export default {
  namespaced: true,
  state: {
    cards: [],
    labels: {},
    searchResults: [],
    remoteSearchResults: [],
    types: [],
    doctypes: {}
  },
  getters: {
    getEntity: (state) => (id) => {
      return state.cards.find(card => card._id === id)
    },
    getType: (state) => (id) => {
      return state.types.find(d => d._id === id)
    },
    getLabel: (state) => (_id) => {
      if (_id == null) return null
      return {
        _id,
        label: state.labels[_id] || _id
      }
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
    storeEntities (state, entities) {
      state.cards.push(...entities)
    },
    storeEntityLabel (state, card) {
      state.labels[card._id] = card.label
    },
    updateDocument (state, entity) {
      state.cards = state.cards.filter(({ _id }) => _id !== entity._id)
      state.cards.push(entity)
    }
  },
  actions: {
    async init ({ dispatch, commit }, id) {
      const { types, doctypes } = await dispatch('api/getTypes', id, { root: true })
      commit('set', { types })
      commit('set', { doctypes })
    },
    async fetchEntity ({ state, dispatch, commit, getters }, id) {
      let card = state.cards.find(card => card._id === id)
      if (card != null) return card
      card = await dispatch('api/getEntity', id, { root: true })
      commit('storeEntity', card)
      commit('storeEntityLabel', card)
      // get Labels for linked properties
      const type = getters.getType(card._type)
      for (const prop in type) {
        // skip terminus properties
        if (prop.match(/^_/) == null && card[prop] != null && (type[prop]._class || type[prop]).match(/:/) == null) {
          dispatch('fetchLabels', card[prop])
          // type[prop].isLinkedProperty = (type[prop]._class || type[prop]).match(/:/) == null
          // props.push({
          //   _id: prop,
          //   label: prop, // TODO replace with actual label
          //   value: this.card[prop],
          //   ...t[prop]
          // })
        }
      }
      return card
    },
    async fetchLabels ({ state, dispatch, commit }, ids) {
      // const wasArray = Array.isArray(ids)
      for (const _id of [ids].flat()) {
        if (state.labels[_id] != null) return state.labels[_id]
        // const label = await dispatch('api/getLabel', _id, { root: true })
        // commit('storeEntityLabel', { _id, label })
      }
      // return wasArray ? labels : labels[0]
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
      // TODO: simplify to sth like addProp
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
