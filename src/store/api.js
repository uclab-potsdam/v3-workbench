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
    async connect ({ commit, getters, rootState }) {
      if (getters.connected) return
      const { server, credentials, database } = rootState.config
      const Client = new WOQLClient(server, {})
      await Client.connect(credentials)
      await Client.db(database)
      await Client._load_db_prefixes()
      const info = Client.databaseInfo()
      commit('set', { Client })
      commit('set', { prefixes: Object.entries({ ...info.prefix_pairs, ...info.jsonld_context }) })
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
      const cards = (await dispatch('query', {
        query: WOQL
          .triple(id, 'scm:cards', 'v:card')
          .triple('v:card', 'scm:entity', 'v:id')
          .triple('v:card', 'scm:collapsed', 'v:collapsed')
          .opt(WOQL
            .triple('v:card', 'scm:x', 'v:x')
            .triple('v:card', 'scm:y', 'v:y')
          )
      }))
      commit('view/set', { cards }, { root: true })
    },
    async getEntity ({ dispatch }, id) {
      const bindings = (await dispatch('query', {
        query: WOQL
          .triple(id, 'rdf:type', 'v:typeId')
          .quad('v:typeId', 'rdfs:label', 'v:type', 'schema/*')
          .triple(id, 'rdfs:comment', 'v:description')
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
            WOQL.greater('v:dist', 0.1)
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
      console.log('addTriple')
      const res = await dispatch('query', {
        query: WOQL.add_triple(...triple),
        msg: 'add prop'
      })
      console.log(res)
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
