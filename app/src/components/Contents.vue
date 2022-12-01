<template>
  <div
    class="flex-col w-full pl-12 pt-12 sticky top-0 max-h-screen overflow-y-auto"
  >
    <div
      class="flex items-center"
      v-for="(section, i) in sections"
      :key="section.name"
    >
      <!-- <div class="w-4 h-4 rounded-full border-4 mr-2 border-[#989898]"></div> -->
      <a
        v-if="section.kind === 'h1' || section.kind === 'h2'"
        :href="`#${slugify(section.name)}`"
        class="block w-full font-semibold text-base hover:text-[#647FFF] cursor-pointer"
        :class="[i === 0 ? '' : 'mt-4']"
      >
        {{ section.name }}
      </a>

      <a
        v-if="section.kind === 'h3'"
        :href="`#${slugify(section.name)}`"
        class="block w-full font-normal text-sm ml-3 hover:text-[#647FFF] cursor-pointer"
      >
        {{ section.name }}
      </a>

      <a
        v-if="
          section.kind === 'h4' ||
          section.kind === 'h5' ||
          section.kind === 'h6'
        "
        :href="`#${slugify(section.name)}`"
        class="block w-full font-normal text-xs ml-5 hover:text-[#647FFF] cursor-pointer"
      >
        {{ section.name }}
      </a>
    </div>
    <div class="flex items-center mt-4">
      <img class="mr-4" src="../assets/finish.svg" alt="End of the guide" />
      <p class="font-medium">Finish!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { TableOfContentsPart } from "../types";

defineProps<{
  sections: TableOfContentsPart[];
}>();

const slugify = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};
</script>
