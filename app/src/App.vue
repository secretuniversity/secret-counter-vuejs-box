<script setup lang="ts">
import { ref } from 'vue'

import Contents from './components/Contents.vue'
import Guide from './components/Guide.vue'
import TopBar from './components/TopBar.vue'
import SecretBox from './components/SecretBox.vue'

let sections = ref([] as string[])
</script>

<template>
  <div class="grid grid-cols-12 auto-rows-max dark:bg-primary-dark dark:text-white">
    <div class="col-span-2">
      <Contents :sections="sections"></Contents>
    </div>

    <div class="col-start-3 col-span-full">
      <TopBar></TopBar>
      <div class="max-w-4xl mx-auto">
        <div class="border border-gray-400 rounded-md pt-2 px-6 mb-24">
          <SecretBox title="Simple Secret Counter App"></SecretBox>
        </div>
        <Guide @headings="(s) => sections = s"></Guide>
      </div>
    </div>
  </div>
</template>