async function QueryWikidata (sparql) {
  const data = await fetch(
      `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`,
      { headers: { accept: 'application/sparql-results+json' } }
  ).then(res => res.json())

  return data.results.bindings.map(b => {
    return Object.fromEntries(Object.keys(b).map(key => [
      key,
      b[key].type === 'uri' ? b[key].value
        .replace('http://www.wikidata.org/entity/', 'wd:')
        .replace('http://www.wikidata.org/prop/direct/', 'wdt:')
        : b[key].value
    ]))
  })
}
function WikidataSearch (term, wd, language = 'en', extensive = false) {
  return `SELECT DISTINCT ?wd ?label ?description ?num WHERE {
  # service for search, params depend on extensiveness
  SERVICE wikibase:mwapi { 
    bd:serviceParam wikibase:endpoint "www.wikidata.org"; ${
      extensive ? `
      wikibase:api "Generator";
      mwapi:generator "search";
      mwapi:gsrsearch "inlabel:${term}";
      mwapi:gsrlimit "max";`
      : `
      wikibase:api "EntitySearch";
      mwapi:search "${term}";`
      }
      mwapi:language "${language}".
    ?wd wikibase:apiOutputItem mwapi:${extensive ? 'title' : 'item'}.
    ?num wikibase:apiOrdinal true.
  }
  # wd is instance of or direct/inherited subclass of domain
  ?wd (wdt:P31?/wdt:P279*) ${wd} .
  # optimise query
  hint:Prior hint:gearing "forward" .
  # service to get label and description
  SERVICE wikibase:label { 
    bd:serviceParam wikibase:language "${language}" .
    ?wd rdfs:label ?label .
    ?wd schema:description ?description .
  }
} 
ORDER BY ASC(?num) LIMIT 10`
}
function WikidataProps (wd, props, language = 'en') {
  return `SELECT ?wdt ?wd ?label ?description WHERE {
    ${wd.replace('http://www.wikidata.org/entity/', 'wd:')} ?wdt ?wd
    FILTER (?wdt in (${props.map(p => p.wdt).join(',')}))
    SERVICE wikibase:label { 
      bd:serviceParam wikibase:language "${language}".
      ?wd rdfs:label ?label .
      ?wd schema:description ?description .
    } 
  }`
}

export {
  QueryWikidata,
  WikidataSearch,
  WikidataProps
}
