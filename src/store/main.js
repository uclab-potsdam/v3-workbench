export default {
  state: {
  },
  mutations: {
  },
  actions: {
    async init ({ dispatch }) {
      await dispatch('api/connect', null, { root: true })
      await dispatch('api/getView', 'View/Demo', { root: true })
    }
  },
  modules: {
  }
}
