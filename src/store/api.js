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
    async connect ({ commit, getters, rootState, dispatch }) {
      if (getters.connected) return
      const { server, credentials, database } = rootState.config
      const Client = new WOQLClient(server, {})
      await Client.connect(credentials)
      await Client.db(database)
      await Client._load_db_prefixes()
      const info = Client.databaseInfo()
      commit('set', { Client })
      commit('set', { prefixes: Object.entries({ ...info.prefix_pairs, ...info.jsonld_context }) })
      // do things that should happen after connecting (e.g. get doctypes)
      dispatch('data/init', null, { root: true })
    },
    async query ({ state, dispatch }, { query, msg }) {
      await dispatch('connect')
      msg = msg != null ? `WB - ${msg}` : null
      return await state.Client.query(query, msg)
        .then((res) => {
          return flattenBindings(res.bindings, state.prefixes)
        }).catch((err) => {
          throw err.data
        })
    },
    async getView ({ dispatch, commit }, id) {
      const cards = await dispatch('query', {
        query: WOQL
          .triple(id, 'scm:cards', 'v:card')
          .triple('v:card', 'scm:entity', 'v:id')
          .triple('v:card', 'scm:collapsed', 'v:collapsed')
          .opt(WOQL
            .triple('v:card', 'scm:x', 'v:x')
            .triple('v:card', 'scm:y', 'v:y')
          )
      })
      commit('view/set', { cards }, { root: true })
    },
    async getTypes ({ dispatch }) {
      const types = await dispatch('query', {
        // 'group_by' fails when used with 'opt'
        // query: WOQL
        //   .from('schema/*', WOQL
        //     .group_by(['v:id', 'v:background', 'v:text', 'v:light'], ['v:prop'], 'v:group')
        //     .triple('v:id', 'rdf:type', 'owl:Class')
        //     .path('v:id', 'rdfs:subClassOf+', 'scm:Entity', 'v:Path')
        //     .opt(WOQL.triple('v:id', 'rdfs:label', 'v:label'))
        //     .opt(WOQL
        //       .triple('v:id', 'scm:background', 'v:background')
        //       .triple('v:id', 'scm:text', 'v:text')
        //       .triple('v:id', 'scm:light', 'v:light')
        //     )
        //     .opt(WOQL.triple('v:prop', 'rdfs:domain', 'v:id'))
        //   )
        // query: WOQL
        //   .from('schema/*', WOQL
        //     .triple('v:id', 'rdf:type', 'owl:Class')
        //     .path('v:id', 'rdfs:subClassOf+', 'scm:Entity', 'v:path')
        //     .opt(WOQL.triple('v:id', 'rdfs:label', 'v:label'))
        //     .opt(WOQL
        //       .triple('v:id', 'scm:background', 'v:background')
        //       .triple('v:id', 'scm:text', 'v:text')
        //       .triple('v:id', 'scm:light', 'v:light')
        //     )
        //     .opt(WOQL
        //       .triple('v:prop', 'rdfs:domain', 'v:id')
        //       .triple('v:prop', 'rdfs:range', 'v:propType')
        //       .triple('v:prop', 'rdfs:label', 'v:propLabel')
        //     )
        //   )
        query: WOQL
          .from('schema/*', WOQL
            .triple('v:id', 'rdf:type', 'owl:Class')
            // .path('scm:Entity', '<rdfs:subClassOf+', 'v:id', 'v:pathA')
            .opt(WOQL.triple('v:id', 'rdfs:label', 'v:label'))
            .opt(WOQL
              .triple('v:id', 'scm:background', 'v:background')
              .triple('v:id', 'scm:text', 'v:text')
              .triple('v:id', 'scm:light', 'v:light')
            )
            .opt(WOQL
              .path('v:prop', 'rdfs:domain|(rdfs:domain,<rdfs:subClassOf+)', 'v:id', 'v:pathB')
              // .triple('v:prop', 'rdfs:domain', 'v:id')
              .triple('v:prop', 'rdfs:range', 'v:propType')
              .triple('v:prop', 'rdfs:label', 'v:propLabel')
            )
          )
      })
      return groupBy(types, 'id', 'props', ['prop', 'propType', 'propLabel'], ['id', 'type', 'label'])
    },
    async getEntity ({ dispatch }, id) {
      const bindings = (await dispatch('query', {
        query: WOQL
          .triple(id, 'rdf:type', 'v:typeId')
          .quad('v:typeId', 'rdfs:label', 'v:type', 'schema/*')
          .opt(WOQL.triple(id, 'rdfs:comment', 'v:description'))
          .triple(id, 'rdfs:label', 'v:label')
      }))
      const props = (await dispatch('query', {
        query: WOQL
          .triple(id, 'v:prop', 'v:value')
          .quad('v:prop', 'rdfs:label', 'v:propLabel', 'schema/*')
          .quad('v:prop', 'rdf:type', 'v:propType', 'schema/*')
          .quad('v:prop', 'rdfs:range', 'v:propRange', 'schema/*')
          .opt(WOQL.triple('v:value', 'rdfs:label', 'v:valueLabel'))
      }))
      const card = {
        id,
        ...bindings[0],
        props
      }
      // commit('view/set', { cards }, { root: true })
      return card
    },
    async search ({ commit, dispatch }, { term, doctype = null }) {
      const searchResults = await dispatch('query', {
        query: WOQL
          .select('v:label', 'v:id', 'v:doctype', 'v:dist')
          .limit(10)
          .order_by('v:dist', 'desc')
          .and(
            WOQL.triple('v:id', 'rdfs:label', 'v:label'),
            WOQL.triple('v:id', 'rdf:type', doctype || 'v:doctype'),
            WOQL.like(term, 'v:label', 'v:dist'),
            WOQL.greater('v:dist', 0.8)
          )
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
    async updateCard ({ dispatch }, data) {
      const view = 'View_demo1'
      const id = data.card || `doc:Card_${uuid()}`
      await dispatch('query', {
        query: WOQL
          // using fourth paramter because of https://github.com/terminusdb/terminusdb/issues/380
          .update_triple(id, 'type', 'scm:Card', 'v:temp1')
          .update_triple(id, 'scm:entity', data.id, 'v:temp2')
          // boolean annoyingly require typecasting at the moment
          .update_triple(id, 'scm:collapsed', { '@type': 'xsd:boolean', '@value': data.collapsed }, 'v:temp3')
          .update_triple(id, 'scm:y', data.y, 'v:temp4')
          .update_triple(id, 'scm:x', data.x, 'v:temp5')
          .add_triple(view, 'scm:cards', { '@id': id })
      })
    },
    async deleteObject ({ dispatch }, id) {
      await dispatch('query', {
        query: WOQL.delete_object(id)
      })
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
    }
  },
  modules: {
  }
}

// Utilities (maybe to be moved into separate file)
const flattenBindings = (bindings, prefixes) => {
  if (bindings == null) return []
  return bindings.map(b => {
    return Object.fromEntries(Object.keys(b).map(key => {
      const value = b[key]['@value'] != null ? b[key]['@value'] : b[key]
      return [key, replacePrefixes(value, prefixes)]
    }))
  })
}

const replacePrefixes = (value, prefixes) => {
  prefixes.forEach(prefix => {
    if (typeof value === 'string') {
      value = value.replace(prefix[1], `${prefix[0]}:`)
    }
  })
  if (value === 'system:unknown') return null
  return value
}

// const groupBy = (input, keys, ignoreKeys = [], groupKey = 'values') => {
//   const output = []
//   input.forEach(obj => {
//     let outputObj = output.find(outputObj => keys.map(key => obj[key] === outputObj[key]).every(Boolean))
//     if (outputObj === undefined) {
//       outputObj = Object.fromEntries([...[...keys, ...ignoreKeys].map(key => [key, obj[key]]), [groupKey, []]]) //, [groupKey, []])
//       output.push(outputObj)
//     }
//     const remainingKeys = Object.keys(obj).filter(key => [...keys, ...ignoreKeys].find(k => k === key) === undefined)
//     outputObj.props.push(Object.fromEntries(remainingKeys.map(key => [key, obj[key]])))
//   })
//   return output
// }

const groupBy = (input, key = 'id', groupKey = 'values', distinct = [], rename = []) => {
  const output = []
  input.forEach(obj => {
    let outputObj = output.find(outputObj => obj[key] === outputObj[key])
    if (outputObj === undefined) {
      const keys = Object.keys(obj).filter(k => !(distinct.find(d => d === k)))
      outputObj = Object.fromEntries([...keys.map(key => [key, obj[key]]), [groupKey, []]]) //, [groupKey, []])
      output.push(removeNull(outputObj))
    }
    // const remainingKeys = Object.keys(obj).filter(key => [key, ...ignoreKeys].find(k => k === key) === undefined)
    if (distinct.map(key => obj[key] != null).some(Boolean)) {
      outputObj.props.push(Object.fromEntries(distinct.map((key, i) => [rename[i], obj[key]])))
    }
  })
  return output
}

const removeNull = (obj) => {
  Object.entries(obj).forEach(([key, val]) =>
    (val && typeof val === 'object' && removeNull(val)) ||
    ((val === null) && delete obj[key])
  )
  return obj
}
