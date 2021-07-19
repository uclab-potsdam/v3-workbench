// import cards from '@/assets/data/mock-view.json'

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
            return {
              source: card.id,
              sourcePos: card.pos,
              target: prop.value,
              targetPos: state.cards.find(({ id }) => id === prop.value)?.pos,
              label: prop.propLabel,
              prop: prop.prop
            }
          }).filter(({ targetPos }) => targetPos != null)
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
    toggleCollapse (state, id) {
      const card = state.cards.find(card => card.id === id)
      card.collapsed = !card.collapsed
    },
    translateCard (state, { id, x, y }) {
      const card = state.cards.find(card => card.id === id)
      card.pos[0] += x
      card.pos[1] += y
    }
  },
  actions: {
    toggleCollapse ({ commit }, id) {
      commit('toggleCollapse', id)
      // update view in db
    },
    translateCard ({ commit }, options) {
      commit('translateCard', options)
      // update view in db if drop event ended successfully
    }
  },
  modules: {
  }
}
