<template>
  <Teleport to="body">
    <div class="modal" @click="$emit('close')">
      <div class="inner" @click="stopPropagation">
        <slot/>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  data () {
    return {}
  },
  methods: {
    stopPropagation (e) {
      e.stopPropagation()
    }
  }
}
</script>

<style scoped lang="scss">
.modal {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
