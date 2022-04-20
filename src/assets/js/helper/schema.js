function propsBetween (doctypes, sub, obj) {
  return Object.keys(doctypes[sub])
    .filter(key => isProp(key) && !isPrimitive(doctypes[sub][key]._class))
    .map(key => {
      const prop = doctypes[sub][key]
      return {
        ...prop,
        prop: key,
        supportedTypes: [prop._class, ...subTypes(doctypes, prop._class)]
      }
    }).filter(d => d.supportedTypes.includes(obj))
}

function subTypes (doctypes, doctype) {
  const types = []
  for (const key in doctypes) {
    const inherits = doctypes[key]._inherits
    if (isArray(inherits) ? inherits.includes(doctype) : inherits === doctype) {
      types.push(key, ...subTypes(doctypes, key))
    }
  }
  return unique(types)
}

function isProp (key) {
  return /^(?!_)/.test(key)
}

function isPrimitive (className) {
  return /:/.test(className)
}

function unique (arr) {
  return [...new Set(arr)]
}

function isArray (value) {
  return Array.isArray(value)
}

export {
  propsBetween,
  subTypes,
  isProp,
  isPrimitive
}
