import store from '@/store'

function onDrag (detail, e) {
  const { x, y } = e
  store.dispatch('dragdrop/drag', {
    x,
    y
  })
}

function onDragEnd (detail, e) {
  // console.log('END')
  e.stopImmediatePropagation()
  dragEnd()
  // window.removeEventListener('mousemove', drag)
  // window.removeEventListener('mouseup', onDragEnd)
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
  // stop d3-zoom and prevent click event when dragging
  e.stopPropagation()
  e.preventDefault()

  const bounds = el.getBoundingClientRect()
  const detail = {
    x: e.x,
    y: e.y,
    boundsX: bounds.x,
    boundsY: bounds.y,
    offsetX: e.x - bounds.x,
    offsetY: e.y - bounds.y
  }
  // console.log(e)
  // document.querySelector(el.dragOptions.dragLayer).appendChild(clone)
  window.dragListeners = {
    mousemove: onDrag.bind(null, detail),
    mouseup: onDragEnd.bind(null, detail),
    keydown: onDragCancel.bind(null, detail)
  }

  const { x, y } = e
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
  // window.addEventListener('mousemove', onDrag.bind(null, detail))
  // window.addEventListener('mouseup', onDragEnd)
  // window.addEventListener('keydown', (e) => console.log(e))
  // if (options.onDragStart) options.onDragStart(e)
  // const x = e.sourceEvent.clientX - e.x * 2 + 10
  // const y = e.sourceEvent.clientY - e.y * 2 - 10

  // // store.commit('dragdrop/add')
  // // store.dispatch('dragdrop/dragStart', { el: el.dragOptions?.el || el, x: x + e.x, y: y + e.y })

  // let dragged = false
  // let cancelled = false

  // // debounce to detect clicks
  // setTimeout(() => {
  //   if (!dragged && !cancelled) {
  //     store.dispatch('dragdrop/dragStart', { el: el.dragOptions?.el || el, x: x + e.x, y: y + e.y })
  //     dragged = true
  //   }
  // }, 200)

  // e.on('drag', (e) => {
  //   if (!dragged) {
  //     console.log(el.dragOptions?.el || el)
  //     store.dispatch('dragdrop/dragStart', { el: el.dragOptions?.el || el, x: x + e.x, y: y + e.y })
  //     dragged = true
  //   } else {
  //     store.dispatch('dragdrop/drag', { x: x + e.x, y: y + e.y })
  //   }
  //   // console.log(`translate(${e.sourceEvent.clientX - e.x + 10}px, ${e.sourceEvent.clientY - e.y + -10}px)`)
  //   // console.log(e.sourceEvent.clientX)
  //   // clone.style.transform = `translate(${x + e.x}px, ${y + e.y}px)`
  //   // if (options.onDrag) options.onDrag(e)
  // })

  // e.on('end', (e) => {
  //   cancelled = true
  //   store.dispatch('dragdrop/dragEnd', { x: x + e.x, y: y + e.y })
  //   // if (options.onDragEnd) options.onDragEnd(e)
  //   // clone.remove()
  // })
}

export default {
  mounted (el, binding, vnode) {
    // console.log('MOUNT', binding.value)

    el.dragOptions = binding.value
    el.dragTrigger = el.dragOptions.trigger ? el.querySelector(el.dragOptions.trigger) : el

    // console.log('MOUNT', el, el.dragOptions.trigger, el.querySelector(el.dragOptions.trigger))
    // el.dragOptions = options

    el.dragTrigger.dragListeners = {
      mousedown: onDragStart.bind(null, el)
    }

    // for (const l in el.dragListeners) {
    //   el.dragTrigger.addEventListener(l, el.dragListeners[l])
    // }

    addListeners(el.dragTrigger)

    // el.addEventListener('cat', function (e) { process(e.detail) })

    // create and dispatch the event
    // var event = new CustomEvent('cat', {
    //   detail: {
    //     hazcheeseburger: true
    //   }
    // })
    // el.dispatchEvent(event)

    // const handler = drag()
    //   .on('start', onDragStart.bind(null, binding.value, el))
    // handler(select(el))

    // el.addEventListener('mousedown', onDragStart)
    // el.addEventListener('mouseup', onDragStart)

    // console.log(drag.drag)
    // el.setAttribute('draggable', true)
    // el.dragListeners = {
    //   dragstart: onDragStart.bind(null, el, binding.value),
    //   dragend: onDragEnd.bind(null, el, binding.value)
    // }
    // el.dragOptions = binding.value
  },
  updated (el, binding) {
    // to make trigger dynamic, we'd need to remove/add event listeners
    // if (binding.value.trigger !== el.dragOptions) {}
    el.dragOptions = binding.value
  },
  unmounted (el) {
    removeListeners(el.dragTrigger)
    // if (el.dragImage) el.dragImage.remove()
    // for (const l in el.dragListeners) {
    //   el.dragTrigger.removeEventListener(l, el.dragListeners[l])
    // }

    // for (const l in el.activeListeners) {
    //   document.removeEventListener(l, el.activeListeners[l])
    // }
    // el.removeEventListener('mousedown', onDragStart)
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
