import { v4 as uuid } from 'uuid'

export default {
  namespaced: true,
  state: {
    cards: [],
    canvas: null,
    zoom: 1,
    cardScrolls: {},
    propertyOffsets: {}
  },
  getters: {
    getCard: (state) => (id) => {
      return state.cards.find(card => card._id === id)
    },
    getCardByEntity: (state) => (id) => {
      return state.cards.find(card => card.represents === id)
    },
    hasCardWithEntity: (state) => (id) => {
      return state.cards.find(card => card.represents === id) != null
    },
    edges (state, getters, rootState, rootGetters) {
      const edges = []
      state.cards.forEach(card => {
        const entity = rootGetters['data/getEntity'](card.represents)
        if (entity == null) return
        for (const prop of entity.properties) {
          if (prop.linkProperty && !prop.meta?.hidden && !prop.inverse && prop.value != null) {
            [prop.value].flat().forEach(value => {
              const target = getters.getCardByEntity(value._id)
              if (target != null) {
                let cardOffset = 30
                if (!card.collapsed) {
                  const offset = state.propertyOffsets[card.represents]?.[prop._id]?.default?.[value._id]
                  // const offset = 0
                  const scroll = state.cardScrolls[card._id] || 0
                  if (offset != null) {
                    cardOffset = offset - scroll + 12.5
                    cardOffset = Math.max(30, cardOffset)
                    cardOffset = Math.min(285, cardOffset)
                  }
                }

                let targetOffset = 30
                if (!target.collapsed) {
                  const offset = state.propertyOffsets[value._id]?.[prop._id]?.inverse?.[card.represents]
                  // const offset = 0
                  const scroll = state.cardScrolls[target._id] || 0
                  if (offset != null) {
                    targetOffset = offset - scroll + 12.5
                    targetOffset = Math.max(30, targetOffset)
                    targetOffset = Math.min(285, targetOffset)
                  }
                }

                edges.push({
                  source: card._id,
                  x1: card.x,
                  y1: card.y + cardOffset,
                  target: target._id,
                  x2: target.x,
                  y2: target.y + targetOffset,
                  label: prop.label,
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
    },
    setCardScroll (state, { _id, value }) {
      state.cardScrolls[_id] = value
    },
    updatePropertyOffsets (state, { represents, inverse, prop, value }) {
      state.propertyOffsets[represents] = {
        ...state.propertyOffsets[represents],
        [prop]: {
          default: inverse ? state.propertyOffsets[represents]?.[prop]?.default : value,
          inverse: inverse ? value : state.propertyOffsets[represents]?.[prop]?.inverse
        }
      }
    }
  },
  actions: {
    toggleCollapse ({ commit, dispatch }, id) {
      commit('toggleCollapse', id)
      // dispatch('updateCard', id)
    },
    translateCard ({ commit, dispatch }, options) {
      commit('translateCard', options)
      dispatch('updateCard', options.id)
      // update view in db if drop event ended successfully
    },
    async dropCard ({ commit, state, dispatch }, options) {
      let card = state.cards.find(card => card.represents === options.represents)
      // console.log(options, card?.represents)
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
      // await dispatch('api/deleteDocument', _id, { root: true })
    },
    async updateCard ({ dispatch, state }, _id) {
      const card = state.cards.find(card => card._id === _id)
      await dispatch('api/updateCard', card, { root: true })
    },
    async init ({ dispatch, commit, state }, canvas) {
      commit('set', { canvas: `Canvas/${canvas}` })
      await dispatch('api/getView', null, { root: true })
    },
    setZoom ({ commit }, zoom) {
      commit('set', { zoom })
    },
    setCardScroll ({ commit }, scroll) {
      commit('setCardScroll', scroll)
    },
    updatePropertyOffsets ({ commit }, offset) {
      commit('updatePropertyOffsets', offset)
    }
  },
  modules: {
  }
}
