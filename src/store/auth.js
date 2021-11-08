const user = localStorage.getItem('USER')
const jwt = localStorage.getItem('JWT')
const key = localStorage.getItem('KEY')
const organization = localStorage.getItem('ORGANIZATION')

export default {
  namespaced: true,
  state: {
    authenticated: false,
    credentials: {
      user,
      key,
      jwt,
      organization
    }
  },
  getters: {
    isAuthenticated: (state) => {
      return state.authenticated
    },
    hasCredentials: (state) => {
      const { user, organization, key, jwt } = state.credentials
      return user != null && organization != null && (key != null || jwt != null)
    }
  },
  mutations: {
    setStatus (state, authenticated) {
      state.authenticated = authenticated
    }
  },
  actions: {
    async authenticate ({ getters, state, dispatch, commit }, credentials) {
      credentials = credentials || state.credentials
      const successful = await dispatch('api/connect', credentials, { root: true })
      commit('setStatus', successful)
      localStorage.setItem('USER', credentials.user)
      localStorage.setItem('JWT', credentials.jwt)
      localStorage.setItem('KEY', credentials.key)
      localStorage.setItem('ORGANIZATION', credentials.organization)
      return successful
    },
    signOut ({ dispatch, commit }) {
      localStorage.removeItem('USER')
      localStorage.removeItem('JWT')
      localStorage.removeItem('KEY')
      localStorage.removeItem('ORGANIZATION')
      dispatch('api/disconnect', null, { root: true })
      commit('setStatus', false)
    }
  },
  modules: {
  }
}
