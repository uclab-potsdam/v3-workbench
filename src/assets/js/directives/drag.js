function onDragStart (el, options, e) {
  e.dataTransfer.setData('text/uri-list', options.id)
  e.dataTransfer.setData('text/plain', options.id)
  if (options.hideDragImage) {
    const img = new Image()
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

    // const canvas = document.createElement('canvas')
    // canvas.id = 'CursorLayer'
    // canvas.width = 1
    // canvas.height = 1
    // document.getElementsByTagName('body')[0].appendChild(canvas)

    e.dataTransfer.setDragImage(img, 0, 0)
    // e.dataTransfer.setDragImage(el, 0, 0)
  }
  if (options.handler != null) {
    el.dragStartX = e.clientX
    el.dragStartY = e.clientY
    el.dragX = e.clientX
    el.dragY = e.clientY
    options.handler({ x: 0, y: 0, id: options.id })
    for (const l in el.activeListeners) {
      document.addEventListener(l, el.activeListeners[l])
    }
  }
}

function onDragOver (el, options, e) {
  options.handler({
    x: e.clientX - el.dragX,
    y: e.clientY - el.dragY,
    id: options.id
  })
  el.dragX = e.clientX
  el.dragY = e.clientY
}

function onDragEnd (el, options, e) {
  if (options.handler != null) {
    // options.handler({
    //   x: e.dataTransfer.dropEffect === 'none' ? el.dragStartX - el.dragX : 0,
    //   y: e.dataTransfer.dropEffect === 'none' ? el.dragStartY - el.dragY : 0,
    //   id: options.id
    // })
    for (const l in el.activeListeners) {
      document.removeEventListener(l, el.activeListeners[l])
    }
  }
}

export default {
  mounted (el, binding) {
    el.setAttribute('draggable', true)
    el.listeners = {
      dragstart: onDragStart.bind(null, el, binding.value),
      dragend: onDragEnd.bind(null, el, binding.value)
    }
    for (const l in el.listeners) {
      el.addEventListener(l, el.listeners[l])
    }
    el.activeListeners = {
      dragover: onDragOver.bind(null, el, binding.value)
    }
  },
  unmounted (el) {
    for (const l in el.listeners) {
      el.removeEventListener(l, el.listeners[l])
    }
    for (const l in el.activeListeners) {
      document.removeEventListener(l, el.activeListeners[l])
    }
  }
}
