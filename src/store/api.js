import { WOQLClient } from '@terminusdb/terminusdb-client'

export default {
  namespaced: true,
  state: {
    Client: null
  },
  getters: {
    connected (state) {
      return state.Client != null
    }
  },
  mutations: {
    set (state, obj) {
      Object.keys(obj).forEach(key => {
        state[key] = obj[key]
      })
    }
  },
  actions: {
    async connect ({ commit, rootState }) {
      const { server, credentials, database } = rootState.config
      const Client = new WOQLClient(server, {})
      await Client.connect(credentials)
      await Client.db(database)
      commit('set', { Client })
    }
  },
  modules: {
  }
}
