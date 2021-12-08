<template>
  <div class="search shadow">
    <input class="bar" v-model="searchterm" placeholder="Find or create cards">
    <div class="grid results" v-if="view === 'search' && searchterm?.length > 0">
      <BaseCard
        v-for="card in searchResults"
        :key="card._id"
        v-bind="card"
        :collapsed="card.cover == null"
        context="search"/>
      <button class="new" @click="view = 'types'">
        Create New Entity «{{ searchterm }}»
      </button>
    </div>
    <div class="grid" v-if="view === 'types'">
      <button v-for="t in types" :key="t.id" @click="create(t.id)">
        {{t.label}}
      </button>
      <button
        v-for="d in remoteSearchResults"
        :key="d.wd" @click="importEntity(d)">
        <b>{{ d.label }}</b><br> {{ d.description }}
      </button>
      <button class="cancel" @click="view = 'search'">
        CANCEL
      </button>
      <!-- <BaseCard
        v-for="card in remoteSearchResults"
        :key="card.id"
        v-bind="card"
        collapsed/> -->
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import BaseCard from '@/components/BaseCard.vue'
export default {
  name: 'TheStatusbar',
  components: {
    BaseCard
  },
  props: {
  },
  data () {
    return {
      view: 'search',
      searchterm: null
    }
  },
  computed: {
    ...mapState('data', [
      'searchResults',
      'remoteSearchResults',
      'types'
    ])
  },
  methods: {
    ...mapActions('api', [
      'search',
      'remoteSearch',
      'insert'
    ]),
    create (t) {
      this.remoteSearch({ doctype: t, term: this.searchterm })
    },
    importEntity (item) {
      this.insert(item)
    }
  },
  watch: {
    searchterm (term) {
      this.search({ term })
    }
  }
}
</script>

<style scoped lang="scss">
.search {
  background: var(--background);
  border: var(--base-border);
  // border-radius: var(--base-border-radius);
  color: var(--text);
  // margin-top: var(--spacing);
  width: 100%;
  max-width: calc(var(--card-width) * 3 + var(--spacing) * 5);
  max-height: 100%;
  overflow: auto;
  // transition: box-shadow var(--transition);

  &:focus-within, &:hover  {
    --base-border: 1px solid var(--accent);
    // box-shadow: var(--base-shadow-l);
    // transform: var(--shadow-l-offset);

    .results {
      display: grid;
    }
  }

  .bar {
    outline: none;
    border: none;
    font-weight: var(--regular);
    padding: var(--spacing-s) var(--spacing);
    width: 100%;

    position: sticky;
    top: 0;
    z-index: 5;

    &::placeholder {
      color: var(--muted);
    }
  }
  .grid {
    display: grid;
    margin: var(--spacing);
    gap: var(--spacing);
    grid-template-columns: 1fr 1fr 1fr;

    button {
      padding: var(--spacing);
      border: var(--base-border);
    }
  }
  .results {
    display: none;

    .card {
      grid-row-end: span 4;
      &.collapsed {
        grid-row-end: span 1;
      }
    }
  }
}
</style>
