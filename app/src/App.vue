<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import SecretBox from './components/SecretBox.vue'
</script>

<template>
  <div>
    <a href="https://scrt.university/repositories" target="_blank">
      <img src="/logo.png" class="logo" alt="Secret Box logo" />
    </a>
  </div>
  <SecretBox msg="Secret Counter Box" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
