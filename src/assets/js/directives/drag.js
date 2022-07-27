import store from '@/store'

function onDrag (detail, e) {
  const x = e.x || e.touches?.[0]?.clientX
  const y = e.y || e.touches?.[0]?.clientY
  store.dispatch('dragdrop/drag', {
    x,
    y
  })
}

function onDragEnd (detail, e) {
  e.stopImmediatePropagation()
  dragEnd()
}

function onDragCancel (detail, e) {
  if (e.key !== 'Escape') return
  e.preventDefault()
  dragEnd()
}

function dragEnd () {
  removeListeners(window)
  store.dispatch('dragdrop/dragEnd')
  window.dispatchEvent(new CustomEvent('drag-ended'))
}

function onDragStart (el, e) {
  if (e.type === 'touchstart' && e.touches.length !== 1) return

  // stop d3-zoom and prevent click event when dragging
  e.stopPropagation()
  e.preventDefault()

  const bounds = el.getBoundingClientRect()
  const x = e.x || e.touches?.[0]?.clientX
  const y = e.y || e.touches?.[0]?.clientY
  const detail = {
    x,
    y,
    boundsX: bounds.x,
    boundsY: bounds.y,
    offsetX: x - bounds.x,
    offsetY: y - bounds.y
  }

  window.dragListeners = {
    mousemove: onDrag.bind(null, detail),
    touchmove: onDrag.bind(null, detail),
    mouseup: onDragEnd.bind(null, detail),
    touchend: onDragEnd.bind(null, detail),
    keydown: onDragCancel.bind(null, detail)
  }

  const { mode, data } = el.dragOptions
  store.dispatch('dragdrop/dragStart', {
    mode,
    data,
    el,
    x,
    y,
    offsetX: x - bounds.x,
    offsetY: y - bounds.y
  })

  addListeners(window)

  window.dispatchEvent(new CustomEvent('drag-started', {
    detail: {
      mode
    }
  }))
}

export default {
  mounted (el, binding, vnode) {
    el.dragOptions = binding.value
    el.dragTrigger = el.dragOptions.trigger ? el.querySelector(el.dragOptions.trigger) : el

    el.dragTrigger.dragListeners = {
      mousedown: onDragStart.bind(null, el),
      touchstart: onDragStart.bind(null, el)
    }

    addListeners(el.dragTrigger)
  },
  updated (el, binding) {
    // to make trigger dynamic, we'd need to remove/add event listeners
    // if (binding.value.trigger !== el.dragOptions) {}
    el.dragOptions = binding.value
  },
  unmounted (el) {
    removeListeners(el.dragTrigger)
  }
}

// HELPERS

function addListeners (el) {
  for (const l in el.dragListeners) {
    el.addEventListener(l, el.dragListeners[l])
  }
}

function removeListeners (el) {
  for (const l in el.dragListeners) {
    el.removeEventListener(l, el.dragListeners[l])
  }
}
