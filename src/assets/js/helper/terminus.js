function transformSchema (s) {
  const schema = underscorify(s)

  const context = schema.find((d) => d._type === '@context')
  const classes = schema
    .filter((d) => d._type !== '@context')
    .map((c, i, classes) => {
      return {
        _id: c._id,
        hidden: c._abstract != null,
        source: c,
        metadata: getMetadata(c),
        ...getRelations(c, classes)
      }
    })

  const props = classes
    .map((c, i, classes) => {
      const domain = [c._id, c.children].flat()
      const props = Object.keys(c.source)
        .filter((key) => !/^_/.test(key))
        .map((key) => {
          const metadata = getPropMetadata(c.source, key)
          const _class = c.source[key]._class || c.source[key]
          const _type = c.source[key]._type || null
          const range = [
            _class,
            classes.find(({ _id }) => _class === _id)?.children || []
          ].flat()
          return {
            _id: key,
            metadata,
            range,
            domain,
            _type,
            doctype: c._id,
            _class,
            primitive: /:/.test(_class)
          }
        })
      return props
    })
    .flat()

  classes.forEach((c) => {
    c.props = props
      .filter((p) => p.domain.find((id) => id === c._id))
      .map((p) => p._id)
    c.inverseProps = props
      .filter((p) => p.range.find((id) => id === c._id))
      .map((p) => p._id)
  })

  const prefixes = Object.fromEntries(
    Object.entries(context).filter((d) => !/^_/.test(d[0]))
  )
  return { context, prefixes, classes, props }
}

function getMetadata (c) {
  return {
    ...JSON.parse(c._documentation?._comment || null)
  }
}

function getPropMetadata (c, prop) {
  return JSON.parse(c._documentation?._properties[prop] || null) || {}
}

function getRelations (c, classes) {
  return {
    directParents: [c._inherits || []].flat(),
    parents: getParents(c._id, classes),
    directChildren: classes
      .filter(({ _inherits }) => [_inherits].flat().find((id) => id === c._id))
      .map((child) => child._id),
    children: getChildren(c._id, classes)
  }
}

function getParents (id, classes) {
  const c = classes.find((c) => c._id === id)
  if (c._inherits == null) return []
  const parents = [c._inherits]
    .flat()
    .map((parentId) => [parentId, getParents(parentId, classes)])
    .flat(2)
  return [...new Set(parents)]
}

function getChildren (id, classes) {
  const c = classes.find((c) => c._id === id)
  if (c._inherits == null) return []
  const children = classes
    .filter(({ _inherits }) => [_inherits].flat().find((id) => id === c._id))
    .map((child) => [child._id, getChildren(child._id, classes)])
    .flat(2)
  return [...new Set(children)]
}

function underscorify (data) {
  if (isArray(data)) {
    return data.map(d => underscorify(d))
  } else if (isObject(data)) {
    return Object.fromEntries(Object.entries(data).map(d => {
      d[0] = d[0].replace(/^@/, '_')
      return underscorify(d)
    }))
  }
  return data
}

function isObject (value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function isArray (value) {
  return Array.isArray(value)
}

function flattenBindings (bindings) {
  if (bindings == null) return []
  return bindings.map(b => {
    return Object.fromEntries(Object.keys(b).map(key => {
      const value = b[key]?.['@value'] != null ? b[key]['@value'] : b[key]
      return [key, value]
    }))
  })
}

export {
  transformSchema, underscorify, flattenBindings
}
