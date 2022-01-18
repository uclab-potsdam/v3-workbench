<template>
  <section v-if="!prop.meta?.hidden" class="property">
    <div class="label">
      <div class="overflow-wrap">
        <BaseTraverseLabel>{{ prop.label }}</BaseTraverseLabel>
      </div>
      <icon scale="1" data="@icon/property-add.svg" v-drag="{
        mode: 'connect',
        data: {
          sub: entity,
          prop: prop._id,
        }
      }"/>
    </div>
    <div class="value" v-for="(value, i) in prop.value || []" :key="i">
      <div class="overflow-wrap">
        <BaseTraverseLabel>{{ value.label }}</BaseTraverseLabel>
      </div>
      <icon v-drag="{
        mode: 'move-card',
        data: { _id: value._id }
      }"
      scale="1" data="@icon/property-expand.svg"/>
    </div>
  </section>
</template>

<script>
import BaseTraverseLabel from './BaseTraverseLabel.vue'
import drag from '@/assets/js/directives/drag'
export default {
  components: { BaseTraverseLabel },
  name: 'CardProperty',
  directives: {
    drag
  },
  props: {
    prop: Object,
    entity: String
  }
}
</script>

<style scoped lang="scss">
.property {
  user-select: none;
  .label, .value {
    display: grid;
    grid-template-columns: 1fr calc(var(--spacing) + var(--spacing-s));
    gap: var(--spacing);
    .overflow-wrap {
      overflow: hidden
    }
  }
  .value {
    font-weight: var(--bold);
  }
}
</style>
