<script setup lang="ts">
import { ref, Transition } from "vue";
import Contents from "./components/Contents.vue";
import Guide from "./components/Guide.vue";
import TopBar from "./components/TopBar.vue";
import SecretBox from "./components/SecretBox.vue";
import type { TableOfContentsPart } from "./types";

let sections = ref([] as TableOfContentsPart[]);
let showContents = ref(true);
</script>

<template>
  <div
    class="grid grid-cols-12 auto-rows-max dark:bg-primary-dark dark:text-white"
  >
    <Transition>
      <div v-if="showContents" class="col-span-2">
        <Contents :sections="sections"></Contents>
      </div>
    </Transition>

    <div class="col-span-full" :class="[showContents ? 'col-start-3' : '']">
      <div class="sticky top-0 z-10 bg-white dark:bg-primary-dark">
        <TopBar @toggle-contents="(v) => (showContents = v)"></TopBar>
      </div>

      <div class="bg-white dark:bg-primary-dark pb-2">
        <div class="max-w-4xl mx-auto">
          <div class="border border-gray-400 rounded-md pt-2 px-6 mb-24">
            <SecretBox title="Simple Secret Counter App"></SecretBox>
          </div>
        </div>
      </div>

      <div class="mt-8 pl-4">
        <Guide @headings="(s) => (sections = s)"></Guide>
      </div>
    </div>
  </div>
</template>
