import { WOQLClient, WOQL } from '@terminusdb/terminusdb-client'
import { WikidataSearch, QueryWikidata, WikidataProps } from '@/assets/js/query/wikidata'
import { v4 as uuid } from 'uuid'
import { transformSchema, flattenBindings, underscorify } from '@/assets/js/helper/terminus'
// import localSchema from '@/assets/js/schema/localSchema'

let Client = null
// const doctypes = {}

export default {
  namespaced: true,
  state: {
    prefixes: []
  },
  getters: {
    connected () {
      return Client != null
    }
  },
  mutations: {
    set (state, obj) {
      Object.keys(obj).forEach(key => {
        state[key] = obj[key]
      })
    }
  },
  actions: {
    async connect ({ getters, rootState, dispatch }, credentials) {
      if (getters.connected) return
      const { server, database, branch } = rootState.config
      Client = new WOQLClient(server, {})
      try {
        await Client.connect(credentials)
      } catch (error) {
        console.error(error)
        Client = null
        return false
      }
      Client.db(database)
      Client.checkout(branch)
      await dispatch('init')
      return true
    },
    disconnect () {
      Client = null
    },
    async init ({ commit }) {
      const branchNames = await Client.query(
        WOQL.using('_commits')
          .triple('v:Branch', 'rdf:type', '@schema:Branch')
          .triple('v:Branch', '@schema:name', 'v:name')
      )

      const refs = branchNames.bindings.map((d) => `branch/${d.name['@value']}`)

      const branches = underscorify(flattenBindings((await Client.query(
        WOQL.or(
          ...refs.map((ref) =>
            WOQL.using(ref)
              .member('v:ref', [ref])
              .triple('v:graph_id', 'rdf:type', '@schema:Graph')
              .read_document('v:graph_id', 'v:graph')
              .opt(
                WOQL.triple('v:graph_id', 'label', 'v:label_id').read_document(
                  'v:label_id',
                  'v:label'
                )
              )
          )
        )
      )).bindings)).map(b => ({
        ...b.graph,
        ref: b.ref,
        label: b.label
      })).filter(branch => branch.ref !== 'branch/canvas-pottery-copy')
      Client.checkout('canvas-pottery')
      const { prefixes, classes, props } = transformSchema(await Client.getSchema())
      // const { prefixes, classes, props } = transformSchema(localSchema)
      commit('data/set', { prefixes, classes, props, branches }, { root: true })
    },
    async query (_, { query, msg }) {
      return await Client.query(query, msg)
        .then((res) => {
          return flattenBindings(res.bindings)
        }).catch((err) => {
          throw err.data
        })
    },
    async getView ({ dispatch, commit, state, rootState }) {
      commit('view/set', { cards: [] }, { root: true })
      commit('data/clearEntities', null, { root: true })
      const canvas = rootState.view.canvas
      // const view = underscorify(await Client.getDocument({ id }))
      // const cards = view.cards?.filter(card => card.represents != null) || []
      const res = await Client.query(
        WOQL.using(`branch/${canvas}`).select('v:id').triple('v:id', '@schema:position', 'v:positionId').read_document('v:positionId', 'v:position'))
      const cards = flattenBindings(res.bindings)
      if (cards.length === 0) return
      // cards.forEach(card => dispatch('getEntity', card.represents))
      await dispatch('getEntities', cards.map(c => c.id))
      commit('view/set', { cards: cards }, { root: true })
    },
    async getEntities ({ dispatch, state, rootState, commit }, ids) {
      const refs = rootState.data.branches.map(d => d.ref)
      const canvas = rootState.view.canvas
      const res = await Client.query(
        WOQL.select('props', 'id', 'position')
          .using(`branch/${canvas}`).triple('v:id', '@schema:position', 'v:positionId').read_document('v:positionId', 'v:position')
          .group_by('v:id', ['ref', 'sub', 'prop', 'obj', 'label'], 'v:props').or(
            ...refs.map(ref =>
              ids.map(id =>
                WOQL.using(ref).member('v:id', [id]).member('v:ref', [ref]).or(
                  WOQL.triple(id, 'label', 'v:l').read_document('v:l', 'v:label'),
                  WOQL.triple(id, 'v:prop', 'v:obj').opt(
                    WOQL.triple('v:obj', 'label', 'v:l').read_document(
                      'v:l',
                      'v:label'
                    )
                  ),
                  WOQL.triple('v:sub', 'v:prop', id).opt(
                    WOQL.triple('v:sub', 'label', 'v:l').read_document(
                      'v:l',
                      'v:label'
                    )
                  )
                )
              )
            ).flat()
          )
      )

      const entities = underscorify(flattenBindings(res.bindings)).map(binding => {
        const props = binding.props.map(p => {
          const ref = p[0]
          const sub = p[1]
          const prop = p[2]
          const obj = p[3]
          const label = p[4]
          return {
            ref,
            id: prop?.replace(/^@schema:/, '') || null,
            inverse: sub !== null,
            value: sub || obj,
            label
          }
        })

        const label = props.find(({ id }) => id === null)?.label
        const doctype = props.find(({ id }) => id === 'rdf:type')?.value.replace(/^@schema:/, '')

        // group properties by id and inverse
        const inverseOptions = [false, true]
        const groupedProps = inverseOptions.map(inverse => {
          const grouped = props.filter(p => p.inverse === inverse).reduce((groups, item) => ({
            ...groups,
            [item.id]: [...(groups[item.id] || []), item]
          }), {})
          return Object.entries(grouped).map(d => {
            return {
              id: d[0],
              inverse,
              values: d[1].map(({ value, label, ref }) => ({
                ref,
                value,
                label
              }))
            }
          })
        }).flat()

        const entity = {
          _id: binding.id,
          label: label,
          properties: groupedProps,
          doctype,
          position: binding.position
        }
        return entity
      })

      commit('data/storeEntities', entities, { root: true })
    },
    async getEntity ({ dispatch, state, rootState, commit }, id) {
      const entity = await Client.query(WOQL.read_document(id, 'v:entity'))

      // const properties = await getProperties(id, rootState.config.languages)
      // const doctype = properties.find(p => p._id === 'rdf:type').value._id.replace(/@schema:/, '')
      // const label = properties.find(p => p._id === 'label')?.value.label
      // const doctypeProperties = getDoctypeProperties(doctype, rootState.config.lang)
      // for (const prop of doctypeProperties) {
      //   prop.value = properties.filter(({ _id, inverse }) => _id === prop._id && inverse === prop.inverse).map(({ value }) => value)
      // }
      // doctypeProperties.sort((a, b) => (a.value.length > 0) === (b.value.length > 0) ? 0 : (a.value.length > 0) ? -1 : 1)
      // const cover = properties.find(({ _id }) => _id === 'cover')?.path
      // const entity = {
      //   _id: id,
      //   label: label || id,
      //   cover,
      //   properties: doctypeProperties.filter(d => !(d.inverse && d.value.length === 0) && !(!d.linkProperty && d.value.length === 0 && d._id !== 'text')),
      //   doctype: {
      //     _id: doctype,
      //     label: doctype,
      //     ...doctypes[doctype]._metadata
      //   }
      // }
      // return entity
      commit('data/storeEntity', entity, { root: true })
    },
    async getLabel ({ dispatch, state, rootState }, _id) {
      // TODO check in data if label is already available
      const ids = [_id].flat()
      const res = await Client.query(
        WOQL.and(
          ...ids.map(id => WOQL.opt().triple(id, '@schema:label', `v:${id}`))
        )
      ).catch((err) => {
        throw err
      })
      const labels = Object.entries(flattenBindings(res.bindings)[0]).map(value => ({ _id: value[0], label: value[1] }))
      return isArray(_id) ? labels : labels[0]
    },
    async getInverseProp ({ dispatch, state, rootState }, { obj, prop }) {
      const res = await Client.query(
        WOQL.triple('v:_id', `@schema:${prop}`, obj)
          .opt()
          .triple('v:_id', '@schema:label', 'v:label')
      ).catch((err) => {
        throw err
      })
      return flattenBindings(res.bindings)
    },
    async search ({ commit, dispatch, rootState }, { term, doctype = null }) {
      if (term == null || term.trim() === '') return
      const baseRefs = rootState.data.branches.filter(b => b.type === 'base').map(b => b.ref)
      const res = await Client.query(WOQL
        .select('v:label', 'v:_id', 'v:_type', 'v:dist', 'v:ref')
        .limit(16)
        .order_by(['v:dist', 'desc'])
        .or(
          ...baseRefs.map((ref) =>
            WOQL.using(ref)
              .member('v:ref', [ref])
              .and(
                WOQL.triple('v:_id', 'label', 'v:dict'),
                // WOQL.once(WOQL.or(
                //   ...rootState.config.languages.map(lang => WOQL.triple('v:dict', lang, 'v:label'))
                // )),
                WOQL.or(
                  ...rootState.config.languages.map(lang => WOQL.triple('v:dict', lang, 'v:label'))
                ),
                WOQL.triple('v:_id', 'rdf:type', doctype ? `@schema:${doctype}` : 'v:_type'),
                WOQL.like(term, 'v:label', 'v:dist'),
                WOQL.greater('v:dist', 0.6)
              )
          )
        )
      ).then((res) => {
        return flattenBindings(res.bindings)
      })
      // const res = await dispatch('query', {
      //   query: WOQL
      //     .select('v:label', 'v:_id', 'v:_type', 'v:dist', 'v:cover')
      //     .limit(16)
      //     .order_by(['v:dist', 'desc'])
      //     .and(
      //       WOQL.triple('v:_id', 'label', 'v:dict'),
      //       // WOQL.once(WOQL.or(
      //       //   ...rootState.config.languages.map(lang => WOQL.triple('v:dict', lang, 'v:label'))
      //       // )),
      //       WOQL.or(
      //         ...rootState.config.languages.map(lang => WOQL.triple('v:dict', lang, 'v:label'))
      //       ),
      //       WOQL.triple('v:_id', 'rdf:type', doctype ? `@schema:${doctype}` : 'v:_type'),
      //       WOQL.like(term, 'v:label', 'v:dist'),
      //       WOQL.greater('v:dist', 0.6)
      //     )
      //     .opt(WOQL.triple('v:_id', 'cover', 'v:cover_image').triple('v:cover_image', 'path', 'v:cover'))
      // })

      const searchResults = res.map(({ _id, _type, label, cover }) => {
        const dt = doctype || _type.replace('@schema:', '')
        return {
          _id,
          label: {
            universal: label
          },
          cover,
          doctype: dt
        }
      })
      // commit('data/storeEntities', entities2, { root: true })
      commit('data/set', { searchResults }, { root: true })
    },
    async remoteSearch ({ commit, dispatch }, { term, doctype }) {
      const domain = await dispatch('query', {
        query: WOQL.from('schema/*', WOQL
          .triple(doctype, 'scm:wd', 'v:wd')
          .triple(doctype, 'rdfs:label', 'v:label'))
      })
      const props = await dispatch('query', {
        query: WOQL.from('schema/*', WOQL
          .triple('v:id', 'rdfs:domain', doctype)
          .triple('v:id', 'rdfs:label', 'v:label')
          .triple('v:id', 'scm:wdt', 'v:wdt')
          .triple('v:id', 'rdfs:range', 'v:type'))
      })
      const data = await QueryWikidata(WikidataSearch(term, domain[0].wd))
      const remoteSearchResults = await Promise.all(data.map(async d => {
        return {
          ...d,
          type: doctype,
          props: (await QueryWikidata(WikidataProps(d.wd, props))).map(prop => ({
            ...props.find(p => p.wdt === prop.wdt),
            ...prop
          }))
        }
      }))

      commit('data/set', { remoteSearchResults }, { root: true })
    },
    // refactor: rename to createEntity?
    async insert ({ dispatch }, data) {
      await dispatch('query', {
        query: WOQL.and(
          ...data.props.map(p => {
            return WOQL.insert_data({
              id: `item_${p.wd.replace('wd:', '')}`,
              label: { en: p.label },
              wd: p.wd,
              description: p.description,
              type: p.type
            })
          }),
          WOQL.insert_data({
            id: `item_${data.wd.replace('wd:', '')}`,
            label: data.label,
            wd: data.wd,
            description: data.description,
            type: data.type,
            ...Object.fromEntries(data.props.map(p => [p.id, `doc:item_${p.wd.replace('wd:', '')}`]))
          })
        )
      })

      dispatch('view/dropCard', {
        x: 0,
        y: 0,
        collapsed: true,
        card: `doc:Card_${uuid()}`,
        id: `doc:item_${data.wd.replace('wd:', '')}`
      }, { root: true })
    },
    async insertCard ({ state, dispatch, rootState, rootGetters }, card) {
      await Client.query(WOQL
        .using(`branch/${rootState.view.canvas}`)
        .insert_document(WOQL.doc(atFrom_(card)))
        // .add_triple(card._id, 'rdf:type', `@schema:${card._type}`)
        // .add_triple(card._id, '@schema:x', card.x)
        // .add_triple(card._id, '@schema:y', card.y)
      )
      dispatch('getEntities', [card._id])
    },
    async addCard ({ state, dispatch, rootState, rootGetters }, card) {
      const view = rootState.view.canvas
      // await Client.addDocument(atFrom_({
      //   _type: 'Card',
      //   ...data
      // }))
      // const docjson = atFrom_({
      //   _type: 'Card',
      //   ...data
      // })
      if (rootGetters['data/getEntity'](card.represents) == null) {
        dispatch('getEntities', [card.represents])
      }

      await Client.query(WOQL
        .add_triple(card._id, 'rdf:type', '@schema:Card')
        .add_triple(card._id, 'represents', card.represents)
        .add_triple(card._id, 'collapsed', card.collapsed)
        .add_triple(card._id, 'x', card.x)
        .add_triple(card._id, 'y', card.y)
        .add_triple(view, 'cards', card._id)
      )
      // await dispatch('query', {
      //   query: WOQL
      //     .insert_document(docjson)
      //     .add_triple(view, 'cards', data._id)
      // })

      // await dispatch('query', {
      //   query: WOQL
      //     // using fourth paramter because of https://github.com/terminusdb/terminusdb/issues/380
      //     .update_triple(id, 'type', 'scm:Card', 'v:temp1')
      //     .update_triple(id, 'scm:entity', data.id, 'v:temp2')
      //     // boolean annoyingly require typecasting at the moment
      //     .update_triple(id, 'scm:collapsed', { '@type': 'xsd:boolean', '@value': data.collapsed }, 'v:temp3')
      //     .update_triple(id, 'scm:y', data.y, 'v:temp4')
      //     .update_triple(id, 'scm:x', data.x, 'v:temp5')
      //     .add_triple(view, 'scm:cards', { '@id': id })
      // })
    },
    async updateDocument ({ state }, document) {
      await Client.updateDocument(atFrom_(document))
    },
    async updatePosition ({ state, dispatch, rootState }, position) {
      const canvas = rootState.view.canvas
      // const id = data.card || `Card/${uuid()}`

      await Client.query(
        WOQL
          .using(`branch/${canvas}`)
          // .delete_triple(position._id, '@schema:x', 'v:oldX')
          // .delete_triple(position._id, '@schema:y', 'v:oldY')
          .update_triple(position._id, '@schema:x', Math.round(position.x), 'v:1')
          .update_triple(position._id, '@schema:y', Math.round(position.y), 'v:2')
          // .delete_triple(position._id, '@schema:x', 'v:oldX')
          // .delete_triple(position._id, '@schema:y', 'v:oldY')
          // .add_triple(position._id, '@schema:x', Math.round(position.x))
          // .add_triple(position._id, '@schema:y', Math.round(position.y))
      )
      // await Client.updateDocument(atFrom_({
      //   _type: 'Card',
      //   ...data
      // }))
      // await dispatch('query', {
      //   query: WOQL.add_triple(view, 'cards', data._id)
      // })

      // await dispatch('query', {
      //   query: WOQL
      //     // using fourth paramter because of https://github.com/terminusdb/terminusdb/issues/380
      //     .update_triple(id, 'type', 'scm:Card', 'v:temp1')
      //     .update_triple(id, 'scm:entity', data.id, 'v:temp2')
      //     // boolean annoyingly require typecasting at the moment
      //     .update_triple(id, 'scm:collapsed', { '@type': 'xsd:boolean', '@value': data.collapsed }, 'v:temp3')
      //     .update_triple(id, 'scm:y', data.y, 'v:temp4')
      //     .update_triple(id, 'scm:x', data.x, 'v:temp5')
      //     .add_triple(view, 'scm:cards', { '@id': id })
      // })
    },
    async deleteDocument ({ state, rootState }, { id, full }) {
      const canvas = rootState.view.canvas
      Client.checkout(canvas)
      await Client.deleteDocument({ id })
      Client.checkout('dictionary-main')
      await Client.deleteDocument({ id })
    },
    async addTriple ({ state, commit, dispatch, rootState }, triple) {
      const canvas = rootState.view.canvas
      await dispatch('query', {
        query: WOQL.using(`branch/${canvas}`).add_triple(...triple),
        msg: 'add prop'
      })
    },
    async removeTriple ({ state, commit, dispatch, rootState }, triple) {
      const canvas = rootState.view.canvas
      await dispatch('query', {
        query: WOQL.using(`branch/${canvas}`).delete_triple(...triple),
        msg: 'remove prop'
      })
    },
    async getDocumentBasics ({ state }, _id) {
      const res = await Client.query(
        WOQL.triple(_id, 'rdf:type', 'v:_type').triple(
          _id,
          '@schema:label',
          'v:label'
        )
      ).catch((err) => {
        throw err
      })
      const bindings = flattenBindings(res.bindings)[0]
      bindings._type = bindings._type.replace(/^@schema:/, '')
      bindings._id = _id

      return bindings
    },
    async getCanvases ({ dispatch, state, rootState }) {
      return underscorify(await Client.getDocument({ type: 'Canvas', unfold: false, as_list: true }))
    },
    async createCanvas ({ dispatch, state, rootState }, { label, branch }) {
      Client.checkout('template-production')
      await Client.branch(branch)
      Client.checkout(branch)

      const res = await Client.addDocument(atFrom_({
        _type: 'Graph',
        label: {
          _type: 'Dictionary',
          [rootState.config.lang]: label
        },
        type: 'canvas'
      }))
      return res
    },
    async addDocument ({ dispatch, state }, data) {
      Client.checkout('dictionary-main')
      return await Client.addDocument(atFrom_(data))
    },
    async updateNote (_, data) {
      await Client.query(
        WOQL.update_triple(...data)
      )
    }
  },
  modules: {
  }
}

// Utilities (maybe to be moved into separate file)

// const replacePrefixes = (value, prefixes) => {
//   prefixes.forEach(prefix => {
//     if (typeof value === 'string') {
//       value = value.replace(prefix[1], `${prefix[0]}:`)
//     }
//   })
//   if (value === 'system:unknown') return null
//   return value
// }

// function atTo_ (data) {
//   if (isArray(data)) {
//     return data.map(d => atTo_(d))
//   } else if (isObject(data)) {
//     return Object.fromEntries(Object.entries(data).map(d => {
//       d[0] = d[0].replace(/^@/, '_')
//       return atTo_(d)
//     }))
//   }
//   return data
// }

function atFrom_ (data) {
  if (isArray(data)) {
    return data.map(d => atFrom_(d))
  } else if (isObject(data)) {
    return Object.fromEntries(Object.entries(data).map(d => {
      d[0] = d[0].replace(/^_/, '@')
      return atFrom_(d)
    }))
  }
  return data
}

// function fold (doc, { clone = false } = {}) {
//   if (clone) doc = deepclone(doc)
//   for (const prop in doc) {
//     if (isProperty(prop)) {
//       if (isArray(doc[prop])) {
//         doc[prop] = doc[prop].map(value => value._id || value)
//       } else if (isObject(doc[prop])) {
//         doc[prop] = doc[prop]._id || doc[prop]._id
//       }
//     }
//   }
//   return document
// }
//
// function unfold (doc) {

// }

// function isProperty (key) {
//   // check if a key is a property and not a keyword starting with '_'
//   return /^(?!_)/.test(key)
// }

// function isLinkedProperty (key, doctype) {
//   return isProperty(key) && Object.keys(doctypes).includes(doctypes[doctype][key]._class || doctypes[doctype][key])
// }

// function getDoctypeProperties (doctype, { inverse = true, lang = 'en' } = {}) {
//   const properties = []
//   for (const key in doctypes[doctype]) {
//     if (isProperty(key)) {
//       const prop = doctypes[doctype][key]
//       const className = prop._class || prop
//       const meta = doctypes[doctype]._metadata?._properties?.[key]
//       properties.push({
//         label: meta?.inverse ? meta?.inverseLabel?.[lang] : meta?.label?.[lang] || key,
//         priority: meta?.priority || 0,
//         _id: key,
//         class: className,
//         supportedClasses: [className, ...getSubClasses(className)],
//         set: prop._type === 'Set',
//         // inverse: meta?.inverse === true,
//         linkProperty: isLinkedProperty(key, doctype),
//         source: prop,
//         meta
//       })
//     }
//   }
//   if (inverse) {
//     for (const doctypeKey in doctypes) {
//       for (const propKey in doctypes[doctypeKey]) {
//         const prop = doctypes[doctypeKey][propKey]
//         const className = prop._class || prop
//         if ((className === doctype || getSubClasses(className).includes(doctype)) && isLinkedProperty(propKey, doctypeKey)) {
//           if (properties.find(p => p.inverse && p._id === propKey)) {
//             properties.find(p => p.inverse && p._id === propKey).supportedClasses.push(doctypeKey)
//           } else {
//             const meta = doctypes[doctypeKey]._metadata?._properties?.[propKey]
//             properties.push({
//               label: meta?.inverse ? meta?.label?.[lang] : meta?.inverseLabel?.[lang] || `${propKey} (inverse)`,
//               priority: meta?.inversePriority || meta?.priority || 0,
//               _id: propKey,
//               supportedClasses: [doctypeKey],
//               set: prop._type === 'Set',
//               // inverse: meta?.inverse !== true,
//               inverse: true,
//               linkProperty: isLinkedProperty(propKey, doctypeKey),
//               source: prop,
//               meta
//             })
//           }
//         }
//       }
//     }
//     properties.filter(({ inverse }) => inverse).forEach(prop => {
//       prop.class = getSuperiorClass(prop.supportedClasses)
//     })
//   }
//   // priority based sorting disabled in favour of sorting by P roperty number
//   // return properties.sort((a, b) => a.priority === b.priority ? a.label > b.label : a.priority < b.priority)
//   return properties.sort((a, b) => +(a._id.match(/P([0-9]+)/)?.[1] || 9999) - +(b._id.match(/P([0-9]+)/)?.[1] || 9999))
// }

// async function getLabels (values) {
//   if (values.length === 0) return 'bla'
//   return values
// }

// async function getProperties (id, languages = ['en', 'de', 'pt', 'es']) {
//   const res = await Client.query(
//     WOQL
//       // .limit(100)
//       .or(
//         WOQL.triple(id, 'v:prop', 'v:_id')
//           .opt(
//             WOQL.once(WOQL.or(
//               ...languages.map(lang => WOQL.triple('v:_id', lang, 'v:label'))
//             ))
//           )
//           .opt(WOQL
//             .triple('v:_id', 'label', 'v:dict')
//             .once(WOQL.or(
//               ...languages.map(lang => WOQL.triple('v:dict', lang, 'v:label'))
//             ))
//           )
//           .opt(WOQL.eq('v:prop', '@schema:cover').triple('v:_id', 'path', 'v:path')),
//         WOQL // .limit(100)
//           .and(
//             WOQL.triple('v:_id', 'v:prop', id),
//             WOQL.evaluate(WOQL.plus(1, 0), 'v:inverse')
//           )
//           .opt(
//             WOQL.once(WOQL.or(
//               ...languages.map(lang => WOQL.triple('v:_id', lang, 'v:label'))
//             ))
//           )
//           .opt(WOQL
//             .triple('v:_id', 'label', 'v:dict')
//             .once(WOQL.or(
//               ...languages.map(lang => WOQL.triple('v:dict', lang, 'v:label'))
//             ))
//           )
//           .opt(WOQL.eq('v:prop', '@schema:cover').triple('v:_id', 'path', 'v:path'))
//       )
//       // WOQL.opt(WOQL.triple(id, 'cover', 'v:cover_image').triple('v:cover_image', 'path', 'v:cover_image_path'))
//   ).catch((err) => {
//     throw err
//   })

//   return flattenBindings(res.bindings).map(({ prop, _id, label, path, inverse }) => {
//     return {
//       _id: prop.replace(/@schema:/, ''),
//       value: {
//         _id,
//         label: label || _id
//       },
//       ...(path != null && { path }),
//       ...(inverse != null && { inverse: true })
//     }
//   })
// }

function isArray (value) {
  return Array.isArray(value)
}

function isObject (value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

// function getSubClasses (className) {
//   const subClasses = []
//   for (const key in doctypes) {
//     const inherits = doctypes[key]._inherits
//     if (isArray(inherits) ? inherits.includes(className) : inherits === className) {
//       subClasses.push(key, ...getSubClasses(key))
//     }
//   }
//   return unique(subClasses)
// }

// function getSuperClasses (className) {
//   const superClasses = []
//   const inherits = doctypes[className]._inherits
//   if (inherits != null) {
//     [inherits].flat().forEach(superClass => {
//       superClasses.push(superClass, ...getSuperClasses(superClass))
//     })
//   }
//   return unique(superClasses)
// }

// function getSuperiorClass (classNames) {
//   const superClasses = classNames.map(className => getSuperClasses(className))
//   return classNames.find(className => superClasses.find(superClassNames => superClassNames.includes(className) === undefined))
// }

// function unique (arr) {
//   return [...new Set(arr)]
// }
