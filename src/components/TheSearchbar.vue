<template>
  <div class="search">
    <h2>
      <input v-model="searchterm" placeholder="Find or create cards">
    </h2>
    <div class="grid results" v-if="view === 'search' && searchterm?.length > 0">
      <BaseCard
        v-for="card in searchResults"
        :key="card._id"
        v-bind="card"
        collapsed/>
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
  border-radius: var(--base-border-radius);
  color: var(--text);
  margin-top: var(--spacing);
  width: 100%;
  max-width: var(--medium);
  transition: box-shadow var(--transition);

  &:focus-within, &:hover  {
    --base-border: 1px solid var(--accent);
    box-shadow: var(--base-box-shadow);

    .results {
      display: grid;
    }
  }

  input {
    appearance: none;
    outline: none;
    border: none;
    display: block;
    font-size: inherit;
    color: var(--accent);
    padding: var(--spacing-s) var(--spacing);
    background: none;
    width: 100%;

    &::placeholder {
      color: var(--muted);
    }
  }
  .grid {
    display: grid;
    margin: var(--spacing);
    gap: var(--spacing);
    grid-template-columns: 1fr 1fr;

    button {
      padding: var(--spacing);
      border: var(--base-border);
    }
  }
  .results {
    display: none;
  }
}
</style>
