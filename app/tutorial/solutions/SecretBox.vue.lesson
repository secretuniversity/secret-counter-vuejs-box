<script setup lang="ts">
import { onMounted, ref } from 'vue'

const count = ref(0)
const showApp = ref(true)

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
})

const queryCounter = () => {
  return count.value
}

const incrementCounter = () => {
  count.value++
}

const resetCounter = () => {
  count.value = 0
}

const props = defineProps<{
  title: string
}>()

function isLight() {
  return localStorage.getItem('theme') === 'light'
}

function isDark() {
  return localStorage.getItem('theme') === 'dark'
}

function handleScroll() {
  if (showApp) {
    // To collapse App when user scrolls:
    // showApp.value = false
  }
}

</script>

<template>
  <div class="grid items-center grid-cols-2">
    <div class="flex pb-2 self-center">
      <img src="../assets/title_star.svg" alt="Simple secret counter app">
      <h2 class="ml-2 text-2xl font-medium tracking-widest text-[#200E32] dark:text-white">{{title}}</h2>
    </div>

    <img @click="showApp = false" class="justify-self-end cursor-pointer" v-if="showApp && isLight()" src="../assets/up.svg" alt="Hide application">
    <img @click="showApp = true" class="justify-self-end cursor-pointer" v-if="!showApp && isLight()" src="../assets/down.svg" alt="Show application">

    <img @click="showApp = false" class="justify-self-end cursor-pointer" v-if="showApp && isDark()" src="../assets/up_white.svg" alt="Hide application">
    <img @click="showApp = true" class="justify-self-end cursor-pointer" v-if="!showApp && isDark()" src="../assets/down_white.svg" alt="Show application">
  </div>

  <div v-if="showApp">
    <div class="grid grid-cols-3 w-full justify-items-center mt-12 mb-16">
      <div class="col-start-2 h-full font-bold text-[160px] leading-none">{{count}}</div>
      <button @click="incrementCounter" class="cols-start-3 w-max bg-box-yellow h-max self-center px-9 py-4 font-semibold rounded-md text-2xl ml-4"> + </button>
    </div>

    <div class="grid w-full justify-items-center mb-16">
      <button @click="resetCounter" class="font-semibold text-[#4E4B66] dark:text-white border-2 border-[#4E4B66] dark:border-white px-8 py-3 rounded-md">Reset Counter?</button>
    </div>
  </div>
</template>
