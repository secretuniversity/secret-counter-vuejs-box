<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

</script>

<template>
  <h3>{{ msg }}</h3>
</template>

<style scoped>
h1 {
	font-size: 150px;
}
</style>
