<template>
  <div class="searchbar">
    <h2>
      <input v-model="searchterm" placeholder="Find or create cards">
    </h2>
    <div class="results">
      <div class="container" v-if="searchResults.length > 0">
        <BaseCard
          v-for="card in searchResults"
          :key="`result-${card.id}`"
          v-bind="card"
          collapsed/>
      </div>
      <div class="no-results" v-else>
        No Results
      </div>
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
      // results: null,
      searchterm: null
    }
  },
  computed: {
    ...mapState('data', [
      'searchResults'
    ])
  },
  methods: {
    ...mapActions('api', [
      'search'
    ])
  },
  watch: {
    searchterm (term) {
      this.search({ term })
    }
  }
}
</script>

<style scoped lang="scss">
.searchbar {
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
      display: block;
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
  .results {
    display: none;
    margin: var(--spacing);

    .container {
      display: grid;
      gap: var(--spacing);
      grid-template-columns: 1fr 1fr;
    }

    .no-results {
      text-align: center;
    }
  }
}
</style>
