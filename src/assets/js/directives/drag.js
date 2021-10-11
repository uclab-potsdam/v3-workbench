function onDragStart (el, options, e) {
  // e.preventDefault()
  e.stopPropagation()
  if (options.id != null) {
    e.dataTransfer.setData('text/uri-list', options.id)
    e.dataTransfer.setData('text/plain', options.id)
  }

  const clientRect = el.getBoundingClientRect()
  const offsetX = (e.clientX - clientRect.left)
  const offsetY = (e.clientY - clientRect.top)

  if (options.customDragImage) {
    /* This is to overwrite the default dragImage on the canvas, since it is
    not correctly scaled in Firefox and Chrome and even more broken in Safari

    the default dragImage creates an image of the target element (el), we
    need to create a new element with the desired size, this could be anything
    but there are browser issues */

    const width = el.options.width
    const height = el.options.height
    const color = el.options.color

    /* 'img' → this does not work in safari, which requires the image to be created
    before the event; see https://stackoverflow.com/a/22610927 */

    // el.dragImage = document.createElement('img')
    // el.dragImage.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='320' height='420' fill='${getComputedStyle(el)['background-color']}'/%3E%3C/svg%3E`

    /* 'canvas' → this does not work in firefox, which uses actual dimensions instead
    of retina scaled dimensions; see https://transitory.technology/set-drag-image/ */

    // el.dragImage = document.createElement('canvas')
    // el.dragImage.width = width
    // el.dragImage.height = height
    // const ctx = el.dragImage.getContext('2d')
    // ctx.fillStyle = getComputedStyle(el)['background-color']
    // ctx.fillRect(0, 0, el.dragImage.width, el.dragImage.height)

    /* 'div' → seems to work across browsers */

    el.dragImage = document.createElement('div')
    el.dragImage.style.height = `${height}px`
    el.dragImage.style.width = `${width}px`
    el.dragImage.style['border-radius'] = `${el.options.circle ? 50 : 0}%`
    el.dragImage.style.background = color ? getComputedStyle(document.documentElement).getPropertyValue(color) : getComputedStyle(el)['background-color']

    /* add element to document, required for Chrome and Safari */
    document.getElementsByTagName('body')[0].appendChild(el.dragImage)
    /* set dragImage, finally */
    e.dataTransfer.setDragImage(el.dragImage, offsetX, offsetY)
  }
  if (options.handler != null) {
    // el.dragX0 = e.clientX
    // el.dragY0 = e.clientY
    // el.dragX = e.clientX
    // el.dragY = e.clientY
    options.handler({ options, x: offsetX, y: offsetY })
    // for (const l in el.activeListeners) {
    //   document.addEventListener(l, el.activeListeners[l])
    // }
  }
  // if (options.dragOverHandler != null) {
  //   // el.dragStartX = e.clientX
  //   // el.dragStartY = e.clientY
  //   // el.dragX = e.clientX
  //   // el.dragY = e.clientY
  //   // options.dragOverHandler({ options, x: offsetX, y: offsetY })~
  //   for (const l in el.activeListeners) {
  //     document.addEventListener(l, el.activeListeners[l])
  //   }
  // }
}

function onDragOver (el, options, e) {
  // console.log('dragover')
  // options.dragOverHandler({
  //   x: e.clientX,
  //   y: e.clientY,
  //   x0: el.dragX0,
  //   y0: el.dragY0,
  //   id: options.id
  // })
  // el.dragX = e.clientX
  // el.dragY = e.clientY
}

function onDragEnd (el, options, e) {
  // eslint-disable-next-line no-unused-expressions
  if (el.dragImage) el.dragImage.remove()
  // if (options.dragEndHandler != null) {
  //   options.dragEndHandler({
  //     x: e.clientX,
  //     y: e.clientY,
  //     id: options.id
  //   })
  // }
  // if (img?.remove) img.remove()
  // if (options.handler != null) {
  //   // options.handler({
  //   //   x: e.dataTransfer.dropEffect === 'none' ? el.dragStartX - el.dragX : 0,
  //   //   y: e.dataTransfer.dropEffect === 'none' ? el.dragStartY - el.dragY : 0,
  //   //   id: options.id
  //   // })
  //   for (const l in el.activeListeners) {
  //     document.removeEventListener(l, el.activeListeners[l])
  //   }
  // }
}

export default {
  mounted (el, binding) {
    el.setAttribute('draggable', true)
    el.listeners = {
      dragstart: onDragStart.bind(null, el, binding.value),
      dragend: onDragEnd.bind(null, el, binding.value)
    }
    el.options = binding.value
    for (const l in el.listeners) {
      el.addEventListener(l, el.listeners[l])
    }
    el.activeListeners = {
      dragover: onDragOver.bind(null, el, binding.value)
    }
  },
  updated (el, binding) {
    el.options = binding.value
  },
  unmounted (el) {
    if (el.dragImage) el.dragImage.remove()
    for (const l in el.listeners) {
      el.removeEventListener(l, el.listeners[l])
    }
    for (const l in el.activeListeners) {
      document.removeEventListener(l, el.activeListeners[l])
    }
  }
}
