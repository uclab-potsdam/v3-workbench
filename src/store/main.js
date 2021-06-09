export default {
  state: {
  },
  mutations: {
  },
  actions: {
    async init ({ dispatch }) {
      await dispatch('api/connect', null, { root: true })
    }
  },
  modules: {
  }
}
