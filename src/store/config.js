import config from '@/assets/config'

const user = localStorage.getItem('USER') || 'admin'
const jwt = localStorage.getItem('JWT') || undefined
const key = localStorage.getItem('KEY') || jwt ? undefined : 'root'
const organization = localStorage.getItem('ORGANIZATION') || jwt ? 'V3' : user

export default {
  namespaced: true,
  state: {
    ...config,
    credentials: {
      user,
      key,
      jwt,
      organization
    }
  },
  getters: {
    getLabel: ({ languages }) => (dictionary) => {
      if (dictionary == null) return null
      return dictionary[languages.find(l => dictionary[l] != null)]
    }
  },
  mutations: {
  },
  actions: {

  },
  modules: {
  }
}
