<template>
  <section v-if="!prop.meta?.hidden" class="property">
    <div class="label" @click="logOffset">
      <div class="overflow-wrap">
        <BaseTraverseLabel>{{ prop.label }}</BaseTraverseLabel>
      </div>
    </div>
    <div class="value" :ref="el => { if (el) refs[i] = {el, _id: value._id} }" :class="{ inverse: prop.inverse }" v-for="(value, i) in prop.value || []" :key="i">
      <div class="overflow-wrap" v-drag="{
        mode: 'move-card',
        data: { _id: value._id }
      }">
        <BaseTraverseLabel>{{ value.label }}</BaseTraverseLabel>
      </div>
      <icon scale="1" :color="getColors(value._id)" v-if="prop.linkProperty" data="@icon/property-expand-l.svg" v-drag="{
        mode: 'move-card',
        data: { _id: value._id }
      }"/>
    </div>
    <div class="add" v-if="(prop.set || prop.value.length === 0) && !prop.inverse">
      <div class="overflow-wrap fade">
        <BaseTraverseLabel>{{prop.class}}</BaseTraverseLabel>
      </div>
      <icon scale="1" :color="getAddColors()" data="@icon/property-add-l.svg" v-drag="{
        mode: 'connect',
        data: {
          sub: entity,
          prop: prop._id,
        }
      }"/>
    </div>
  </section>
</template>

<script>
import BaseTraverseLabel from './BaseTraverseLabel.vue'
import drag from '@/assets/js/directives/drag'
import { mapGetters } from 'vuex'
export default {
  components: { BaseTraverseLabel },
  name: 'CardProperty',
  directives: {
    drag
  },
  props: {
    prop: Object,
    entity: String
  },
  data () {
    return {
      refs: []
    }
  },
  computed: {
    ...mapGetters('view', ['hasCardWithEntity'])
  },
  methods: {
    getOffset () {
      return Object.fromEntries(this.refs.map(ref => [ref._id, ref.el.offsetTop]))
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
