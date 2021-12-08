import { WOQLClient, WOQL } from '@terminusdb/terminusdb-client'
import { WikidataSearch, QueryWikidata, WikidataProps } from '@/assets/js/query/wikidata'
import { v4 as uuid } from 'uuid'

export default {
  namespaced: true,
  state: {
    Client: null,
    prefixes: []
  },
  getters: {
    connected (state) {
      return state.Client != null
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
    async connect ({ commit, getters, rootState, dispatch }, credentials) {
      if (getters.connected) return
      const { server, database } = rootState.config
      const Client = new WOQLClient(server, {})

      try {
        await Client.connect(credentials)
      } catch (error) {
        console.error(error)
        return false
      }
      Client.db(database)
      commit('set', { Client })
      dispatch('data/init', null, { root: true })
      return true
    },
    disconnect ({ commit }) {
      commit('set', { Client: null })
    },
    async query ({ state, dispatch }, { query, msg }) {
      // await dispatch('connect')
      msg = msg != null ? `WB - ${msg}` : null
      return await state.Client.query(query, msg)
        .then((res) => {
          return flattenBindings(res.bindings)
        }).catch((err) => {
          throw err.data
        })
    },
    async getView ({ commit, state, rootState }) {
      const id = rootState.view.canvas
      const view = await state.Client.getDocument({ id })
      // const cards = await dispatch('query', {
      //   query: WOQL
      //     .triple(id, 'cards', 'v:card')
      //     .triple('v:card', 'entity', 'v:id')
      //     .triple('v:card', 'collapased', 'v:collapsed')
      //     .opt(WOQL
      //       .triple('v:card', 'x', 'v:x')
      //       .triple('v:card', 'y', 'v:y')
      //     )
      // })
      commit('view/set', { cards: atTo_(view.cards) || [] }, { root: true })
    },
    async getTypes ({ state }) {
      const types = (await state.Client.getClassDocuments())
        .map((doctype, i, doctypes) => atTo_(makeSchemaFrame(doctype, doctypes)))

      // https://github.com/terminusdb/terminusdb/issues/668
      // currently not possible to store arbitrary data in schema
      // → We misuse the @documentation field to contain
      //   a stringified json
      return types.map(t => {
        t._metadata = {
          ...JSON.parse(t._documentation?._comment || null),
          _properties: Object.fromEntries(Object.entries(t._documentation?._properties || {}).map(d => {
            return [d[0], JSON.parse(d[1])]
          }))
        }
        // console.log(t._metadata)
        // if (t._documentation?._comment) {
        //   t._metadata = JSON.parse(t._documentation._comment)
        // }
        // if (t._documentation?._properties) {
        //   t._metadata = JSON.parse(t._documentation._properties)
        // }
        return t
      })
      // const types = await dispatch('query', {
      //   // 'group_by' fails when used with 'opt'
      //   // query: WOQL
      //   //   .from('schema/*', WOQL
      //   //     .group_by(['v:id', 'v:background', 'v:text', 'v:light'], ['v:prop'], 'v:group')
      //   //     .triple('v:id', 'rdf:type', 'owl:Class')
      //   //     .path('v:id', 'rdfs:subClassOf+', 'scm:Entity', 'v:Path')
      //   //     .opt(WOQL.triple('v:id', 'rdfs:label', 'v:label'))
      //   //     .opt(WOQL
      //   //       .triple('v:id', 'scm:background', 'v:background')
      //   //       .triple('v:id', 'scm:text', 'v:text')
      //   //       .triple('v:id', 'scm:light', 'v:light')
      //   //     )
      //   //     .opt(WOQL.triple('v:prop', 'rdfs:domain', 'v:id'))
      //   //   )
      //   // query: WOQL
      //   //   .from('schema/*', WOQL
      //   //     .triple('v:id', 'rdf:type', 'owl:Class')
      //   //     .path('v:id', 'rdfs:subClassOf+', 'scm:Entity', 'v:path')
      //   //     .opt(WOQL.triple('v:id', 'rdfs:label', 'v:label'))
      //   //     .opt(WOQL
      //   //       .triple('v:id', 'scm:background', 'v:background')
      //   //       .triple('v:id', 'scm:text', 'v:text')
      //   //       .triple('v:id', 'scm:light', 'v:light')
      //   //     )
      //   //     .opt(WOQL
      //   //       .triple('v:prop', 'rdfs:domain', 'v:id')
      //   //       .triple('v:prop', 'rdfs:range', 'v:propType')
      //   //       .triple('v:prop', 'rdfs:label', 'v:propLabel')
      //   //     )
      //   //   )
      //   query: WOQL
      //     // .from('schema/*', WOQL
      //     .quad('v:id', 'rdf:type', 'owl:Class', 'schema')
      //   // // .path('scm:Entity', '<rdfs:subClassOf+', 'v:id', 'v:pathA')
      //   // .opt(WOQL.triple('v:id', 'rdfs:label', 'v:label'))
      //   // .opt(WOQL
      //   //   .triple('v:id', 'scm:background', 'v:background')
      //   //   .triple('v:id', 'scm:text', 'v:text')
      //   //   .triple('v:id', 'scm:light', 'v:light')
      //   // )
      //   // .opt(WOQL
      //   //   .path('v:prop', 'rdfs:domain|(rdfs:domain,<rdfs:subClassOf+)', 'v:id', 'v:pathB')
      //   //   // .triple('v:prop', 'rdfs:domain', 'v:id')
      //   //   .triple('v:prop', 'rdfs:range', 'v:propType')
      //   //   .triple('v:prop', 'rdfs:label', 'v:propLabel')
      //   // )
      //     // )
      // })
      // console.log(types)
      // return groupBy(types, 'id', 'props', ['prop', 'propType', 'propLabel'], ['id', 'type', 'label'])
    },
    async getEntity ({ dispatch, state, rootState }, id) {
      const card = atTo_(await state.Client.getDocument({ id: id }))
      // console.log(card._id, id)
      // const bindings = (await dispatch('query', {
      //   query: WOQL
      //     .triple(id, 'rdf:type', 'v:typeId')
      //     .quad('v:typeId', 'rdfs:label', 'v:type', 'schema/*')
      //     .opt(WOQL.triple(id, 'rdfs:comment', 'v:description'))
      //     .opt(WOQL.triple(id, 'scm:cover', 'v:coverId').triple('v:coverId', 'scm:path', 'v:cover'))
      //     .triple(id, 'rdfs:label', 'v:label')
      // }))
      // const props = (await dispatch('query', {
      //   query: WOQL
      //     .triple(id, 'v:prop', 'v:value')
      //     .quad('v:prop', 'rdfs:label', 'v:propLabel', 'schema/*')
      //     .quad('v:prop', 'rdf:type', 'v:propType', 'schema/*')
      //     .quad('v:prop', 'rdfs:range', 'v:propRange', 'schema/*')
      //     .opt(WOQL.triple('v:value', 'rdfs:label', 'v:valueLabel'))
      // }))
      // const card = {
      //   id,
      //   ...bindings[0],
      //   props
      // }
      // commit('view/set', { cards }, { root: true })
      // console.log(card)
      return card
    },
    async getLabel ({ dispatch, state, rootState }, _id) {
      const res = await state.Client.query(
        WOQL.triple(
          _id,
          '@schema:label',
          'v:label'
        )
      ).catch((err) => {
        throw err
      })
      const label = flattenBindings(res.bindings)[0]?.label
      // bindings._type = bindings._type.replace(/^@schema:/, '')

      return label
    },
    async search ({ commit, dispatch }, { term, doctype = null }) {
      const searchResults = await dispatch('query', {
        query: WOQL
          .select('v:label', 'v:_id', 'v:_type', 'v:dist', 'v:cover')
          // .count('v:count').triple('v:_id', 'cover', 'v:cover')
          // .and(WOQL.triple('v:_id', 'cover', 'v:cover'))
          .limit(16)
          .order_by(['v:dist', 'desc'])
          .and(
            WOQL.triple('v:_id', 'label', 'v:label'),
            WOQL.triple('v:_id', 'rdf:type', doctype || 'v:_type'),
            WOQL.like(term, 'v:label', 'v:dist'),
            WOQL.greater('v:dist', 0.6)
          )
          .opt(WOQL.triple('v:_id', 'cover', 'v:cover'))
      })
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
              label: p.label,
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
    async addCard ({ state, dispatch, rootState }, data) {
      const view = rootState.view.canvas
      await state.Client.addDocument(atFrom_({
        _type: 'Card',
        ...data
      }))
      await dispatch('query', {
        query: WOQL.add_triple(view, 'cards', data._id)
      })

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
      await state.Client.updateDocument(atFrom_(document))
    },
    async updateCard ({ state, dispatch, rootState }, data) {
      const view = rootState.view.canvas
      // const id = data.card || `Card/${uuid()}`

      await state.Client.updateDocument(atFrom_({
        _type: 'Card',
        ...data
      }))
      await dispatch('query', {
        query: WOQL.add_triple(view, 'cards', data._id)
      })

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
    async deleteObject ({ state }, id) {
      await state.Client.deleteDocument({ id })
    },
    async addTriple ({ state, commit, dispatch }, triple) {
      await dispatch('query', {
        query: WOQL.add_triple(...triple),
        msg: 'add prop'
      })
    },
    async removeTriple ({ state, commit, dispatch }, triple) {
      await dispatch('query', {
        query: WOQL.delete_triple(...triple),
        msg: 'remove prop'
      })
    },
    async getDocumentBasics ({ state }, _id) {
      const res = await state.Client.query(
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

      return bindings
    },
    async getCanvases ({ dispatch, state }) {
      return atTo_(await state.Client.getDocument({ type: 'View', unfold: false, as_list: true }))
    },
    async createCanvas ({ dispatch, state }, name) {
      const res = await state.Client.addDocument(atFrom_({
        _type: 'View',
        _id: `View/${name.replace(/ /g, '-')}`
      }))
      return res
    }
  },
  modules: {
  }
}

// Utilities (maybe to be moved into separate file)
const flattenBindings = (bindings) => {
  if (bindings == null) return []
  return bindings.map(b => {
    return Object.fromEntries(Object.keys(b).map(key => {
      const value = b[key]?.['@value'] != null ? b[key]['@value'] : b[key]
      return [key, value]
    }))
  })
}

// const replacePrefixes = (value, prefixes) => {
//   prefixes.forEach(prefix => {
//     if (typeof value === 'string') {
//       value = value.replace(prefix[1], `${prefix[0]}:`)
//     }
//   })
//   if (value === 'system:unknown') return null
//   return value
// }

function atTo_ (data) {
  if (Array.isArray(data)) {
    return data.map(d => atTo_(d))
  } else if (typeof data === 'object' && data != null) {
    return Object.fromEntries(Object.entries(data).map(d => {
      d[0] = d[0].replace(/^@/, '_')
      return atTo_(d)
    }))
  }
  return data
}

function atFrom_ (data) {
  if (Array.isArray(data)) {
    return data.map(d => atFrom_(d))
  } else if (typeof data === 'object' && data != null) {
    return Object.fromEntries(Object.entries(data).map(d => {
      d[0] = d[0].replace(/^_/, '@')
      return atFrom_(d)
    }))
  }
  return data
}

function makeSchemaFrame (doctype, doctypes) {
  if (doctype['@inherits']) {
    const superClasses = [doctype['@inherits']].flat().map((sc) =>
      makeSchemaFrame(
        doctypes.find((d) => d['@id'] === sc),
        doctypes
      )
    )
    const superClassProps = superClasses.map((sc) =>
      Object.fromEntries(
        Object.entries(sc).filter((entry) => entry[0].indexOf('@') !== 0)
      )
    )
    const superClassDocs = superClasses.map(
      (sc) => sc['@documentation']?.['@properties']
    )
    return {
      ...superClassProps.reduce((a, b) => ({ ...a, ...b }), {}),
      ...doctype,
      '@documentation': {
        ...doctype['@documentation'],
        '@properties': {
          ...superClassDocs.reduce((a, b) => ({ ...a, ...b }), {}),
          ...doctype['@documentation']?.['@properties']
        }
      }
    }
  }
  return doctype
}
