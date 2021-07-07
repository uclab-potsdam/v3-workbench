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
    }
  },
  actions: {
    toggleCollapse ({ commit }, id) {
      commit('toggleCollapse', id)
      // update view in db
    }
  },
  modules: {
  }
}
