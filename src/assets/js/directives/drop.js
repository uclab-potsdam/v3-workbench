import store from '@/store'

function mouseMove (el, e) {
  e.stopPropagation()

  window.dispatchEvent(e.type === 'touchmove' ? new TouchEvent(e.type, e) : new MouseEvent(e.type, e))
}

async function mouseUp (el, e) {
  e.stopPropagation()
  window.dispatchEvent(e.type === 'touchend' ? new TouchEvent(e.type, e) : new MouseEvent(e.type, e))
  const { x, y } = store.getters['dragdrop/position']
  const mode = store.state.dragdrop.mode
  const data = await store.dispatch('dragdrop/getData')
  if (data == null) return
  if (e.type !== 'touchend') {
    el.dispatchEvent(new CustomEvent('dropped', {
      detail: {
        ...el.dropOptions,
        x,
        y,
        mode,
        data
      }
    }))
  } else {
    const targetEl = document.elementFromPoint(x, y)
    targetEl.dispatchEvent(new CustomEvent('dropped', {
      bubbles: true,
      detail: {
        ...el.dropOptions,
        x,
        y,
        data
      }
    }))
  }
}

function dragStarted (el, { detail }) {
  const filter = el.dropOptions.filter
  if (filter != null && filter.find(f => f === detail.mode) == null) return
  addListeners(el)
}

function dragEnded (el) {
  removeListeners(el)
}

export default {
  mounted (el, binding) {
    el.dropOptions = binding.value

    el.dropListeners = {
      mousemove: mouseMove.bind(null, el),
      touchmove: mouseMove.bind(null, el),
      mouseup: mouseUp.bind(null, el),
      touchend: mouseUp.bind(null, el)
    }

    el.dropWindowListeners = {
      'drag-started': dragStarted.bind(null, el),
      'drag-ended': dragEnded.bind(null, el)
    }

    for (const l in el.dropWindowListeners) {
      window.addEventListener(l, el.dropWindowListeners[l])
    }
  },
  updated (el, binding) {
    el.dropOptions = binding.value
    // for (const l in el.dropListeners) {
    //   el[binding.value.disabled ? 'removeEventListener' : 'addEventListener'](l, el.listeners[l])
    // }
  },
  unmounted (el, binding) {
    for (const l in el.dropListeners) {
      el.removeEventListener(l, el.dropListeners[l])
    }

    for (const l in el.dropWindowListeners) {
      window.removeEventListener(l, el.dropWindowListeners[l])
    }
    // if (binding.value.root) {
    //   for (const l in el.docListeners) {
    //     document.removeEventListener(l, el.docListeners[l])
    //   }
    // }
  }
}

function addListeners (el) {
  for (const l in el.dropListeners) {
    el.addEventListener(l, el.dropListeners[l])
  }
}

function removeListeners (el) {
  for (const l in el.dropListeners) {
    el.removeEventListener(l, el.dropListeners[l])
  }
}
