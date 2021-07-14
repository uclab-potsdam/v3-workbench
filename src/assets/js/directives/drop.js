function onDrop (el, options, e) {
  e.preventDefault()
  // e.preventDefault()

  // e.dataTransfer.dropEffect = 'move'
  const value = e.dataTransfer.getData('text/plain')
  console.log('drop', value, e)
}

function onDragOver (el, options, e) {
  e.dataTransfer.dropEffect = options.dropEffect
  e.preventDefault()
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
      dragover: onDragOver.bind(null, el, binding.value)
    }
    for (const l in el.listeners) {
      el.addEventListener(l, el.listeners[l])
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
