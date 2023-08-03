<template>
  <div class="test">
    {{groups}}
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  groups: any[];
}>()
</script>

<style>
.test {
  background-color: red;
}
</style>
