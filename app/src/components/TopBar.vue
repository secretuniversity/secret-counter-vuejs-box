<script setup lang="ts">
import { onMounted, ref } from "vue";

const theme = ref("light");
const searching = ref(false);
let showContents = false;

const emit = defineEmits<{
  (e: "toggleContents", val: boolean): void;
}>();

onMounted(() => {
  let existing = document.getElementById("theme");

  if (existing) {
    return;
  }

  let style = document.createElement("link");
  style.id = "theme";
  style.type = "text/css";
  style.rel = "stylesheet";
  style.href = "/src/styles/github.css";

  document.head.appendChild(style);
  localStorage.setItem("theme", "light");
});

function toggleTheme() {
  if (theme.value === "light") {
    document.documentElement.classList.add("dark");
    theme.value = "dark";
    localStorage.setItem("theme", "dark");

    let style: HTMLLinkElement | null = document.getElementById(
      "theme"
    ) as HTMLLinkElement;

    if (style) {
      style.href = "/src/styles/tokyo-night.css";
    }
  } else {
    document.documentElement.classList.remove("dark");
    theme.value = "light";
    localStorage.setItem("theme", "light");

    let style: HTMLLinkElement | null = document.getElementById(
      "theme"
    ) as HTMLLinkElement;

    if (style) {
      style.href = "/src/styles/github.css";
    }
  }
}

function toggleContents() {
  emit("toggleContents", !showContents);
  showContents = !showContents;
}
</script>

<template>
  <div
    class="h-20 mb-20 grid grid-cols-3 border-b border-[#C5C5C5] bg-white dark:bg-primary-dark"
  >
    <div
      @click="toggleContents()"
      class="flex h-full items-center space-x-8 pl-28"
    >
      <img
        v-if="theme === 'light'"
        class="cursor-pointer"
        src="../assets/burger_menu.svg"
        alt="Collapse the table of contents"
      />
      <img
        v-if="theme === 'dark'"
        class="cursor-pointer"
        src="../assets/burger_menu_white.svg"
        alt="Collapse the table of contents"
      />
      <!-- <img v-if="theme === 'light'" @click="searching = !searching" class="cursor-pointer" src="../assets/search.svg" alt="Search the guide">
            <img v-if="theme === 'dark'" @click="searching = !searching" class="cursor-pointer" src="../assets/search_white.svg" alt="Search the guide"> -->
    </div>

    <!-- <div class="flex w-full items-center ">
          <input class="w-full h-10 rounded-md pl-4 border border-[#C5C5C5] focus:outline-box-yellow" v-if="searching" type="text" placeholder="Search the guide... "/>
        </div> -->

    <div
      class="col-start-3 flex h-full items-center space-x-16 pr-28 justify-end"
    >
      <label
        for="theme-toggle"
        class="md:inline-block hidden w-12 h-6 rounded-full cursor-pointer"
      >
        <input id="theme-toggle" class="hidden" type="checkbox" />
        <div
          @click="toggleTheme()"
          class="main relative w-full h-full rounded-full bg-[#FFD951]"
        ></div>
      </label>
      <img
        v-if="theme === 'light'"
        src="../assets/secret_box_logo_black.svg"
        alt="Secret boxes logo"
      />
      <img
        v-if="theme === 'dark'"
        src="../assets/logo.png"
        class="w-12 h-12"
        alt="Secret boxes logo"
      />
    </div>
  </div>
</template>

<style>
.main {
  transition: background 0.2s;
}

input:checked ~ .main {
  background-color: gray;
}

.main::after {
  content: "";
  @apply absolute top-0 left-0 h-6 w-6 bg-white rounded-full border-2 border-solid border-[#E59700];
  transition: transform 0.2s;
}

input:checked ~ .main::after {
  transform: translateX(1.5rem);
  @apply border-gray-500;
}
</style>
