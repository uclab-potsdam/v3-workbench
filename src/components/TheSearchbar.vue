<template>
  <div class="search shadow">
    <header>
      <input class="bar" placeholder="Find or create cards"
        v-model="term"
        @input="search({ term, doctype })">
    </header>
    <main v-if="view === 'search'">
      <BaseRadioGroup class="doctype" :options="doctypeOptions"
        v-model="doctype"
        @update:modelValue="search({ term, doctype })"/>
      <div class="grid results" v-if="term?.length > 0">
        <BaseCard
          v-for="card in searchResults"
          :key="card._id"
          v-bind="card"
          :collapsed="card.cover == null"
          context="search"/>
        <button class="new" @click="view = 'types'">
          Create New Entity «{{ term }}»
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
    </main>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import BaseCard from '@/components/BaseCard.vue'
import BaseRadioGroup from '@/components/BaseRadioGroup.vue'
export default {
  name: 'TheStatusbar',
  components: {
    BaseCard,
    BaseRadioGroup
  },
  props: {
  },
  data () {
    return {
      view: 'search',
      term: null,
      doctype: null
    }
  },
  computed: {
    ...mapState('data', [
      'searchResults',
      'remoteSearchResults',
      'types'
    ]),
    doctypeOptions () {
      return [{ label: 'All', value: null }, ...this.types.map(t => {
        return { label: t._metadata?.label || t._id, value: t._id }
      })]
    }
  },
  methods: {
    ...mapActions('api', [
      'search',
      'remoteSearch',
      'insert'
    ]),
    create (t) {
      this.remoteSearch({ doctype: t, term: this.term })
    },
    importEntity (item) {
      this.insert(item)
    }
  },
  watch: {
    // searchterm (term) {
    //   this.search({ term, doctype: this.doctype })
    // }
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

  header {
    padding: 0 var(--spacing);

    .bar {
      outline: none;
      border: none;
      font-weight: var(--regular);
      width: 100%;

      position: sticky;
      top: 0;
      z-index: 5;

      &::placeholder {
        color: var(--muted);
      }
    }
  }

  main {
    display: none;
    .doctype {
      margin: var(--spacing) var(--spacing);
    }
    .grid {
      display: grid;
      margin: var(--spacing);
      gap: var(--spacing);
      grid-template-columns: 1fr 1fr 1fr;

      .card {
        grid-row-end: span 4;
        &.collapsed {
          grid-row-end: span 1;
        }
      }

      button {
        padding: var(--spacing);
        border: var(--base-border);
      }
    }
  }

  &:focus-within, &:hover  {
    border-color: var(--accent);
    // box-shadow: var(--base-shadow-l);
    // transform: var(--shadow-l-offset);

    header {
      .bar {
        border-bottom: var(--base-border);
        border-color: var(--muted);
      }
    }

    main {
      display: block;
    }
  }
}
</style>
