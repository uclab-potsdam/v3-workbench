// import cards from '@/assets/data/mock-view.json'

export default {
  namespaced: true,
  state: {
    cards: []
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
