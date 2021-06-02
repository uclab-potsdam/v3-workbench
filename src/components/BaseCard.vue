<template>
 <foreignObject x="20" y="20" width="280" height="400">
    <div class="card">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed mollis mollis mi ut ultricies. Nullam magna ipsum,
      porta vel dui convallis, rutrum imperdiet eros. Aliquam
      erat volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed mollis mollis mi ut ultricies. Nullam magna ipsum,
      porta vel dui convallis, rutrum imperdiet eros. Aliquam
      erat volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed mollis mollis mi ut ultricies. Nullam magna ipsum,
      porta vel dui convallis, rutrum imperdiet eros. Aliquam
      erat volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed mollis mollis mi ut ultricies. Nullam magna ipsum,
      porta vel dui convallis, rutrum imperdiet eros. Aliquam
      erat volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed mollis mollis mi ut ultricies. Nullam magna ipsum,
      porta vel dui convallis, rutrum imperdiet eros. Aliquam
      erat volutpat.
    </div>
  </foreignObject>
</template>

<script>
export default {
  name: 'BaseCard'
}
</script>

<style scoped lang="scss">
@import "@/assets/style/global";
.card {
  background: $red-3;
  color: $yellow-8;
  height: 100%;
  padding: $spacing;
  // overflow: auto; // breaks things in desktop safari
  // border-radius: $base-border-radius;
}
</style>
