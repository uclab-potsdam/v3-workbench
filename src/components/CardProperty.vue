<template>
  <section v-if="!prop.meta?.hidden && prop.values.length > 0" class="property">
    <div class="label" @click="logOffset">
      <div class="overflow-wrap">
        <BaseTraverseLabel>{{ displayProperty }}</BaseTraverseLabel>
      </div>
    </div>
    <div class="value" :ref="el => { if (el) refs[i] = {el, _id: value.value._value || value.value} }" :class="{ inverse: displayInverse }" v-for="(value, i) in prop.values || []" :key="i">
      <div class="overflow-wrap">
        <BaseTraverseLabel>{{ getDisplayValue(value) }}</BaseTraverseLabel>
      </div>
      <icon scale="1" :color="getColors(value.value)" v-if="!primitive" data="@icon/property-expand-l.svg" v-drag="hasCardWithEntity(value.value) ? {
        mode: 'remove-prop',
        data: [prop.inverse ? value.value : represents, prop._id, prop.inverse ? represents : value.value]
      } : {
        mode: 'move-card',
        data: { _id: value.value }
      }"/>
      <a v-if="url && prefixes[getDisplayValue(value).split(':')[0]]" :href="getDisplayValue(value).replace(/^([^:]+):/, (a, b, c) => prefixes[b])" target="_blank">
        <icon scale="1" :color="getColors(value.value)" data="@icon/property-external-link.svg"/>
      </a>
    </div>
  </section>
</template>

<script>
import BaseTraverseLabel from './BaseTraverseLabel.vue'
import drag from '@/assets/js/directives/drag'
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
  components: { BaseTraverseLabel },
  name: 'CardProperty',
  directives: {
    drag
  },
  props: {
    prop: Object,
    represents: String
  },
  data () {
    return {
      refs: []
    }
  },
  computed: {
    ...mapGetters('view', ['hasCardWithEntity']),
    ...mapGetters('config', ['getLabel']),
    ...mapState('data', ['prefixes']),
    displayProperty () {
      const dict = this.prop.metadata[this.prop.inverse && this.prop.metadata.inverseLabel ? 'inverseLabel' : 'label']
      return this.getLabel(dict)
    },
    primitive () {
      return this.prop.primitive
    },
    url () {
      return this.prop._class === 'xdd:url'
    },
    displayInverse () {
      return this.prop.metadata?.inverse ? !this.prop.inverse : this.prop.inverse
    }
    // propLabel () {
    //   const dictionary = this.prop.inverse && ? this.prop.metadata.
    //   return this.getLabel()
    // }
  },
  methods: {
    ...mapActions('view', ['updatePropertyOffsets']),
    setOffsets () {
      this.updatePropertyOffsets({
        represents: this.represents,
        prop: this.prop._id,
        inverse: this.prop.inverse,
        value: Object.fromEntries(this.refs.map(ref => [ref._id, ref.el.offsetTop]))
      })
    },
    getDisplayValue (value) {
      if (value.label) return this.getLabel(value.label)
      return value.value._value || value.value
    },
    beforeUpdate () {
      this.refs = []
    },
    getColors (id) {
      const colors = [
        this.hasCardWithEntity(id) ? 'var(--edges)' : 'none',
        'rgb(var(--secondary))',
        'currentColor'
      ]
      return colors
    },
    getAddColors (id) {
      const colors = [
        'none',
        'rgb(var(--secondary))',
        'currentColor'
      ]
      return colors
    }
  },
  mounted () {
    this.setOffsets()
  },
  watch: {
    'prop.values.length' () {
      this.$nextTick(() => {
        this.setOffsets()
      })
    }
  }
}
</script>

<style scoped lang="scss">
.property {
  user-select: none;
  .label, .value, .add {
    padding: 0 var(--spacing);
    display: flex;
    position: relative;
    gap: var(--spacing-xs);
    .overflow-wrap {
      width: calc(var(--card-width) - 37.5px);
    }

    a {
      z-index: 1;
    }

    .svg-icon {
      color: rgba(var(--primary), 0.3);
      transition: color var(--transition) var(--transition);
      display: block;
      z-index: 1;
    }

    &.inverse {
      flex-direction: row-reverse;

      .svg-icon {
        transform: scaleX(-1);
      }
    }

    &:hover {
      .svg-icon {
        color: rgb(var(--primary));
        transition: color var(--transition);
      }
    }
  }
  .value, .add {
    // font-weight: var(--medium);
    font-size: var(--font-size-l);
    white-space: nowrap;
    padding: 0 0 0 var(--spacing);

    &.inverse  {
      padding: 0 var(--spacing) 0 0;
    }
  }
  .add {
    color: rgba(var(--primary), 0.3);
    transition: color var(--transition) var(--transition);

    &:hover {
      color: rgb(var(--primary));
      transition: color var(--transition);
    }
  }
}
</style>
