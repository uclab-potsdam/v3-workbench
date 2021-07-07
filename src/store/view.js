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
    }
  },
  actions: {
  },
  modules: {
  }
}
