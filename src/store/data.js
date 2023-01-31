// refactor: replace `card` with `entity`

export default {
  namespaced: true,
  state: {
    cards: [],
    labels: {},
    searchResults: [],
    remoteSearchResults: [],
    prefixes: {},
    classes: [],
    props: [],
    branches: []
  },
  getters: {
    getEntity: (state) => (id) => {
      return state.cards.find(card => card._id === id)
    },
    getClass: (state) => (id) => {
      return state.classes.find(d => d._id === id)
    },
    getLabel: (state) => (_id) => {
      if (_id == null) return null
      return {
        _id,
        label: state.labels[_id] || _id
      }
    },
    hasEntity: (state) => (id) => {
      return state.cards.find(card => card._id === id) != null
    },
    getProperties: (state) => ({ sub, obj }) => {
      return state.props.filter(({ domain, range, metadata }) => {
        if (metadata?.inverse) {
          return domain.includes(obj) && range.includes(sub)
        }
        return domain.includes(sub) && range.includes(obj)
      })
    }
  },
  mutations: {
    set (state, obj) {
      Object.keys(obj).forEach(key => {
        state[key] = obj[key]
      })
    },
    storeEntity (state, entity) {
      state.cards = state.cards.filter(({ _id }) => _id !== entity._id)
      state.cards.push(entity)
    },
    storeEntities (state, entities) {
      const ids = entities.map(e => e._id)
      state.cards = state.cards.filter(({ _id }) => !ids.includes(_id))
      state.cards.push(...entities)
    },
    clearEntities (state) {
      state.cards = []
    },
    storeEntityLabel (state, card) {
      state.labels[card._id] = card.label
    },
    updateDocument (state, entity) {
      state.cards = state.cards.filter(({ _id }) => _id !== entity._id)
      state.cards.push(entity)
    },
    updatePosition (state, { entity, position }) {
      const card = state.cards.find(({ _id }) => _id === entity)
      card.position = position
      // state.cards.push(entity)
    },
    removeEntity (state, id) {
      state.cards = state.cards.filter(({ _id }) => _id !== id)
    }
  },
  actions: {
    // async fetchEntity ({ state, dispatch, commit, getters }, id) {
    //   let card = state.cards.find(card => card._id === id)
    //   if (card != null) return card
    //   card = await dispatch('api/getEntity', id, { root: true })
    //   commit('storeEntity', card)
    //   commit('storeEntityLabel', card)
    //   // get Labels for linked properties
    //   const type = getters.getClass(card._type)
    //   for (const prop in type) {
    //     // skip terminus properties
    //     if (prop.match(/^_/) == null && card[prop] != null && (type[prop]._class || type[prop]).match(/:/) == null) {
    //       dispatch('fetchLabels', card[prop])
    //       // type[prop].isLinkedProperty = (type[prop]._class || type[prop]).match(/:/) == null
    //       // props.push({
    //       //   _id: prop,
    //       //   label: prop, // TODO replace with actual label
    //       //   value: this.card[prop],
    //       //   ...t[prop]
    //       // })
    //     }
    //   }
    //   return card
    // },
    // async fetchLabels ({ state, dispatch, commit }, ids) {
    //   // const wasArray = Array.isArray(ids)
    //   for (const _id of [ids].flat()) {
    //     if (state.labels[_id] != null) return state.labels[_id]
    //     // const label = await dispatch('api/getLabel', _id, { root: true })
    //     // commit('storeEntityLabel', { _id, label })
    //   }
    //   // return wasArray ? labels : labels[0]
    // },
    async addProp ({ dispatch }, triple) {
      await dispatch('api/addTriple', triple, { root: true })
      dispatch('api/getEntities', [triple[0], triple[2]], { root: true })
    },
    async removeProp ({ dispatch, getters, commit }, triple) {
      await dispatch('api/removeTriple', triple, { root: true })
      dispatch('api/getEntities', [triple[0], triple[2]], { root: true })
    },
    // async deleteEntity ({ dispatch }, id) {
    //   await dispatch('api/deleteDocument', id, { root: true })
    // },
    removeEntity ({ commit }, id) {
      commit('removeEntity', id)
    }
  },
  modules: {
  }
}
