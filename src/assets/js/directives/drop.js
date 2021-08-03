function onDrop (el, options, e) {
  e.preventDefault()
  e.stopPropagation()
  // e.preventDefault()
  el.classList.remove('drag-over')

  // e.dataTransfer.dropEffect = 'move'
  const value = e.dataTransfer.getData('text/plain')
  // console.log('drop', value, e)
  if (options.handler != null) {
    e.dataTransfer.dropEffect = 'none'
    options.handler({
      options,
      x: e.clientX,
      y: e.clientY,
      id: value
    })
  }
}

function onDragOver (el, options, e) {
  e.dataTransfer.dropEffect = options.dropEffect
  e.preventDefault()
  el.classList.add('drag-over')
}

function onDragLeave (el) {
  el.classList.remove('drag-over')
}

// function onDragOverROOT (el, options, e) {
//   // console.log('drag ROOT', { x: e.clientX, y: e.clientY })
// }

// function onDragEnter (e) {
//   // counter++
//   // console.log(counter)
//   e.preventDefault()
//   e.stopPropagation()
//   e.dataTransfer.dropEffect = 'copy'
//   // console.log('in', dragging)
// }

// function onDragLeave (e) {
//   // e.preventDefault()
//   // e.stopPropagation()
//   // const rect = el.getBoundingClientRect()
//   // const out = e.clientX <= rect.x
//   // counter--
//   // console.log('out')
//   // console.log(e)
//   // e.dataTransfer.dropEffect = 'copy'
//   // console.log(out ? 'out' : 'in', e.clientX, rect.x)
//   // console.log('Leave', e, el.getBoundingClientRect())
// }

export default {
  mounted (el, binding) {
    el.listeners = {
      drop: onDrop.bind(null, el, binding.value),
      dragover: onDragOver.bind(null, el, binding.value),
      dragleave: onDragLeave.bind(null, el, binding.value)
    }
    if (!binding.value.disabled) {
      for (const l in el.listeners) {
        el.addEventListener(l, el.listeners[l])
      }
    }
    // if (binding.value.root) {
    //   el.docListeners = {
    //     dragover: onDragOverROOT.bind(null, el, binding.value)
    //   }
    //   for (const l in el.docListeners) {
    //     document.addEventListener(l, el.docListeners[l])
    //   }
    // }
  },
  updated (el, binding) {
    for (const l in el.listeners) {
      el[binding.value.disabled ? 'removeEventListener' : 'addEventListener'](l, el.listeners[l])
    }
  },
  unmounted (el, binding) {
    for (const l in el.listeners) {
      el.removeEventListener(l, el.listeners[l])
    }
    // if (binding.value.root) {
    //   for (const l in el.docListeners) {
    //     document.removeEventListener(l, el.docListeners[l])
    //   }
    // }
  }
}
