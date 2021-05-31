<template>
  <div class="home">
    <TheCanvas/>
    <div class="floating">
      <TheSearchbar/>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import TheCanvas from '@/components/TheCanvas.vue'

export default {
  name: 'Home',
  components: {
    TheCanvas
  }
}
</script>
