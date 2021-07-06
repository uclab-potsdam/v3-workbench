import { WOQLClient, WOQL } from '@terminusdb/terminusdb-client'

export default {
  namespaced: true,
  state: {
    Client: null,
    prefixes: []
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
    async connect ({ commit, getters, rootState }) {
      if (getters.connected) return
      const { server, credentials, database } = rootState.config
      const Client = new WOQLClient(server, {})
      await Client.connect(credentials)
      await Client.db(database)
      await Client._load_db_prefixes()
      const info = Client.databaseInfo()
      commit('set', { Client })
      commit('set', { prefixes: Object.entries({ ...info.prefix_pairs, ...info.jsonld_context }) })
    },
    async query ({ state, dispatch }, { query, msg }) {
      await dispatch('connect')
      return await state.Client.query(query, msg)
        .then((res) => {
          return flattenBindings(res.bindings, state.prefixes)
        }).catch((err) => {
          throw err.data
        })
    },
    async getView ({ dispatch, commit }, id) {
      const cards = (await dispatch('query', {
        query: WOQL
          .triple(id, 'scm:cards', 'v:card')
          .triple('v:card', 'scm:entity', 'v:id')
          .triple('v:card', 'scm:position', 'v:pos')
          .triple('v:card', 'scm:collapsed', 'v:collapsed')
      }))
        // REFACTOR: position should be parsed in flattenBindings
        .map(card => {
          return {
            ...card,
            pos: JSON.parse(card.pos)
          }
        })
      commit('view/set', { cards }, { root: true })
    }
  },
  modules: {
  }
}

// Utilities (maybe to be moved into separate file)
const flattenBindings = (bindings, prefixes) => {
  if (bindings == null) return []
  return bindings.map(b => {
    return Object.fromEntries(Object.keys(b).map(key => {
      const value = b[key]['@value'] != null ? b[key]['@value'] : b[key]
      return [key, replacePrefixes(value, prefixes)]
    }))
  })
}

const replacePrefixes = (value, prefixes) => {
  prefixes.forEach(prefix => {
    if (typeof value === 'string') {
      value = value.replace(prefix[1], `${prefix[0]}:`)
    }
  })
  return value
}
