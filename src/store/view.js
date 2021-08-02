import { v4 as uuid } from 'uuid'

export default {
  namespaced: true,
  state: {
    cards: []
  },
  getters: {
    edges (state, getters, rootState) {
      return state.cards.map(card => {
        return rootState.data.cards
          .find(({ id }) => id === card.id)
          ?.props.filter(({ propType }) => propType === 'owl:ObjectProperty')
          .map(prop => {
            const target = state.cards.find(({ id }) => id === prop.value)
            if (target == null) return
            return {
              source: card.id,
              x1: card.x,
              y1: card.y,
              target: prop.value,
              x2: target.x,
              y2: target.y,
              label: prop.propLabel,
              prop: prop.prop
            }
          }).filter(edge => edge != null)
      })
        .flat()
        .filter(edge => edge != null)
    }
  },
  mutations: {
    set (state, obj) {
      Object.keys(obj).forEach(key => {
        state[key] = obj[key]
      })
    },
    insertCard (state, card) {
      state.cards.push(card)
    },
    toggleCollapse (state, id) {
      const card = state.cards.find(card => card.id === id)
      card.collapsed = !card.collapsed
    },
    moveCard (state, { id, x, y }) {
      const card = state.cards.find(card => card.id === id)
      card.x = x
      card.y = y
    },
    translateCard (state, { id, x, y }) {
      const card = state.cards.find(card => card.id === id)
      card.x += x
      card.y += y
    },
    removeCard (state, id) {
      state.cards = state.cards.filter(card => card.card !== id)
    }
  },
  actions: {
    toggleCollapse ({ commit, dispatch }, id) {
      commit('toggleCollapse', id)
      dispatch('updateCard', id)
    },
    translateCard ({ commit, dispatch }, options) {
      commit('translateCard', options)
      dispatch('updateCard', options.id)
      // update view in db if drop event ended successfully
    },
    // refactor: rename method to avoid confusion with sql dropping
    dropCard ({ commit, state, dispatch }, options) {
      if (state.cards.find(card => card.id === options.id) != null) {
        commit('moveCard', options)
      } else {
        commit('insertCard', {
          card: `doc:Card_${uuid()}`,
          ...options
        })
      }
      dispatch('updateCard', options.id)
      // update view in db
    },
    async removeCard ({ commit, dispatch }, id) {
      commit('removeCard', id)
      await dispatch('api/deleteObject', id, { root: true })
    },
    async updateCard ({ dispatch, state }, id) {
      const card = state.cards.find(card => card.id === id)
      await dispatch('api/updateCard', card, { root: true })
    }
  },
  modules: {
  }
}
