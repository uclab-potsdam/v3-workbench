export default {
  namespaced: true,
  state: {
    cards: [],
    canvas: null,
    zoom: 1,
    cardScrolls: {},
    propertyOffsets: {},
    unfolded: []
  },
  getters: {
    getCard: (state) => (id) => {
      return state.cards.find(card => card._id === id)
    },
    getCardByEntity: (state) => (id) => {
      return state.cards.find(card => card.represents === id)
    },
    edges (state, getters, rootState, rootGetters) {
      const canvas = `branch/${state.canvas}`
      const edges = []
      rootState.data.cards.forEach(card => {
        const entity = card
        if (entity == null) return

        const entityProperties = entity.properties.map(d => {
          return {
            ...d,
            ...rootState.data.props.find(p => p._id === d.id)
          }
        })
        for (const prop of entityProperties) {
          if (!prop.primitive && !prop.metadata?.hidden && !prop.inverse && prop.values != null) {
            [prop.values].flat().forEach(value => {
              // console.log(value)
              const target = rootGetters['data/getEntity'](value.value)
              if (target != null) {
                let cardOffset = 30
                if (state.unfolded.find(id => card._id === id)) {
                  const offset = state.propertyOffsets[card._id]?.[prop._id]?.default?.[value.value]
                  // const offset = 0
                  const scroll = state.cardScrolls[card._id] || 0
                  if (offset != null) {
                    cardOffset = offset - scroll + 12.5
                    cardOffset = Math.max(30, cardOffset)
                    cardOffset = Math.min(285, cardOffset)
                  }
                }

                let targetOffset = 30
                if (state.unfolded.find(id => target._id === id)) {
                  const offset = state.propertyOffsets[value.value]?.[prop._id]?.inverse?.[card._id]
                  const scroll = state.cardScrolls[target._id] || 0
                  if (offset != null) {
                    targetOffset = offset - scroll + 12.5
                    targetOffset = Math.max(30, targetOffset)
                    targetOffset = Math.min(285, targetOffset)
                  }
                }

                edges.push({
                  source: card._id,
                  x1: card.position.x,
                  y1: card.position.y + cardOffset,
                  target: target._id,
                  x2: target.position.x,
                  y2: target.position.y + targetOffset,
                  label: rootGetters['config/getLabel'](prop.metadata.inverse ? prop.metadata.inverseLabel : prop.metadata.label),
                  local: value.ref === canvas,
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
    toggleCollapse (state, _id) {
      const index = state.unfolded.findIndex(id => id === _id)
      if (index === -1) state.unfolded.push(_id)
      else state.unfolded.splice(index, 1)
      // const card = state.cards.find(card => card._id === id)
      // card.collapsed = !card.collapsed
    },
    moveCard (state, { _id, x, y }) {
      const card = state.cards.find(card => card._id === _id)
      card.x = x
      card.y = y
    },
    removeCard (state, id) {
      // remove card from unfolded list
      state.unfolded = state.unfolded.filter(u => u !== id)
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
    },
    async dropCard ({ commit, state, dispatch, rootState }, options) {
      const card = rootState.data.cards.find(card => card._id === options._id)
      // // console.log(options, card?.represents)
      if (card != null) {
        // commit('moveCard', { ...card, ...options })
        const position = {
          _id: card.position._id,
          ...options.position
        }
        commit('data/updatePosition', { entity: card._id, position }, { root: true })
        await dispatch('api/updatePosition', position, { root: true })
      } else {
        // card = { _id: `Card/${uuid()}`, ...options }
        // commit('insertCard', card)
        // await dispatch('api/addCard', card, { root: true })
        await dispatch('api/insertCard', options, { root: true })
      }
    },
    async removeCard ({ commit, dispatch }, _id) {
      commit('removeCard', _id)
      await dispatch('data/removeEntity', _id, { root: true })
      // console.log(_id)
      // await dispatch('api/deleteDocument', _id, { root: true })
    },
    async init ({ dispatch, commit, state }, canvas) {
      commit('set', { canvas: canvas })
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
