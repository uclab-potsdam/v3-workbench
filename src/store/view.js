import { v4 as uuid } from 'uuid'

export default {
  namespaced: true,
  state: {
    cards: [],
    canvas: null,
    zoom: 1
  },
  getters: {
    getCard: (state) => (id) => {
      return state.cards.find(card => card._id === id)
    },
    getCardByEntity: (state) => (id) => {
      return state.cards.find(card => card.entity === id)
    },
    edges (state, getters, rootState, rootGetters) {
      const edges = []
      state.cards.forEach(card => {
        const entity = rootGetters['data/getEntity'](card.entity)
        if (entity == null) return
        // const entityType = rootGetters['data/getType'](entity._type)
        for (const prop of entity.properties) {
          if (prop.linkProperty && !prop.hidden && !prop.inverse && prop.value != null) {
            [prop.value].flat().forEach(value => {
              const target = getters.getCardByEntity(value._id)
              if (target != null) {
                edges.push({
                  source: card._id,
                  x1: card.x,
                  y1: card.y,
                  target: target._id,
                  x2: target.x,
                  y2: target.y,
                  prop
                })
              }
            })
          }
        }

        return []
        // const entityType = getters
        // return rootState.data.cards
        //   .find(({ id }) => id === card.id)
        //   ?.props?.filter(({ propType }) => propType === 'owl:ObjectProperty')
        //   .map(prop => {
        //     const target = state.cards.find(({ id }) => id === prop.value)
        //     if (target == null) return
        //     return {
        //       source: card.id,
        //       x1: card.x,
        //       y1: card.y,
        //       target: prop.value,
        //       x2: target.x,
        //       y2: target.y,
        //       label: prop.propLabel,
        //       prop: prop.prop
        //     }
        //   }).filter(edge => edge != null)
      })
      // .flat()
      // .filter(edge => edge != null)
      return edges
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
      const card = state.cards.find(card => card._id === id)
      card.collapsed = !card.collapsed
    },
    moveCard (state, { _id, x, y }) {
      const card = state.cards.find(card => card._id === _id)
      card.x = x
      card.y = y
    },
    translateCard (state, { id, x, y }) {
      const card = state.cards.find(card => card.id === id)
      card.x += x
      card.y += y
    },
    removeCard (state, id) {
      state.cards = state.cards.filter(card => card._id !== id)
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
    async dropCard ({ commit, state, dispatch }, options) {
      let card = state.cards.find(card => card.entity === options.entity)
      // console.log(options, card?.entity)
      if (card != null) {
        commit('moveCard', { ...card, ...options })
        await dispatch('api/updateCard', card, { root: true })
      } else {
        card = { _id: `Card/${uuid()}`, ...options }
        commit('insertCard', card)
        await dispatch('api/addCard', card, { root: true })
      }
    },
    async removeCard ({ commit, dispatch }, _id) {
      commit('removeCard', _id)
      // console.log(_id)
      await dispatch('api/deleteObject', _id, { root: true })
    },
    async updateCard ({ dispatch, state }, _id) {
      const card = state.cards.find(card => card._id === _id)
      await dispatch('api/updateCard', card, { root: true })
    },
    async init ({ dispatch, commit, state }, canvas) {
      commit('set', { canvas: `View/${canvas}` })
      await dispatch('api/getView', null, { root: true })
    },
    setZoom ({ commit }, zoom) {
      commit('set', { zoom })
    }
  },
  modules: {
  }
}
