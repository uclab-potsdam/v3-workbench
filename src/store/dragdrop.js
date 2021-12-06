export default {
  namespaced: true,
  state: {
    timeout: null,
    el: null,
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    mode: null,
    data: {}
  },
  getters: {
    position: ({ x, offsetX, y, offsetY }) => {
      return {
        x: x - offsetX,
        y: y - offsetY
      }
    }
  },
  mutations: {
    set (state, obj) {
      Object.keys(obj).forEach(key => {
        state[key] = obj[key]
      })
    },
    setTimeout (state, timeout) {
      state.timeout = timeout
    },
    clearTimeout (state) {
      state.timeout.clear()
    },
    triggerTimeout (state) {
      state.timeout.trigger()
    }
  },
  actions: {
    dragStart ({ commit }, params) {
      commit('setTimeout', timeout(() => commit('set', params), 200))
    },
    dragCancelStart ({ commit }) {
      commit('clearTimeout')
    },
    drag ({ commit }, params) {
      commit('triggerTimeout')
      commit('set', params)
    },
    dragEnd ({ commit }, params) {
      commit('clearTimeout')
      commit('set', { el: null })
    }
  }
}

function timeout (handler, delay) {
  const id = setTimeout(handler, delay)
  const clear = clearTimeout.bind(null, id)
  return {
    id,
    clear,
    trigger: () => {
      clear()
      handler()
    }
  }
};
