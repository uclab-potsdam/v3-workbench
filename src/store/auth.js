const user = localStorage.getItem('USER')
const token = localStorage.getItem('JWT')
// const key = localStorage.getItem('KEY')
const organization = localStorage.getItem('ORGANIZATION')

export default {
  namespaced: true,
  state: {
    authenticated: false,
    credentials: {
      user,
      // key,
      token,
      organization
    }
  },
  getters: {
    isAuthenticated: (state) => {
      return state.authenticated
    },
    hasCredentials: (state) => {
      const { user, organization, key, token } = state.credentials
      return user != null && organization != null && (key != null || token != null)
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
      const authenticated = await dispatch('api/connect', credentials, { root: true })
      commit('setStatus', authenticated)
      localStorage.setItem('USER', credentials.user)
      localStorage.setItem('JWT', credentials.token)
      // localStorage.setItem('KEY', credentials.key)
      localStorage.setItem('ORGANIZATION', credentials.organization)
      return authenticated
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
