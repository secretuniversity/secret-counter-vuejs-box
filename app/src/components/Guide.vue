<template>
  <div id="guide" class="relative max-w-[60%] mx-auto">
    <Guide />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted } from "vue";
import Guide from "../../tutorial/guide.md";
import rust from "highlight.js/lib/languages/rust";
import hljs from "highlight.js";
import type { TableOfContentsPart } from "../types";

onMounted(() => {
  const guide = document.getElementById("guide");

  if (guide) {
    const els = Array.from(guide.querySelectorAll("h2, h3, h4, h5, h6"));

    els.forEach((el) => {
      const id = slugify(el.innerHTML.replace(/<span.*<\/span>/, ""));

      const anchor = document.createElement("span");
      anchor.setAttribute("id", id);
      anchor.classList.add(...["absolute", "-top-[6rem]"]);

      el.classList.add(...["relative"]);
      el.appendChild(anchor);
    });

    const sections: TableOfContentsPart[] = els.map((heading) => {
      return {
        name: heading.innerHTML.replace(/<span.*<\/span>/, ""),
        kind: heading.tagName.toLowerCase(),
      };
    });

    emit("headings", sections);
  }

  hljs.registerLanguage("rust", rust);
  hljs.highlightAll();
});

const emit = defineEmits<{
  (e: "headings", sections: TableOfContentsPart[]): void;
}>();

const slugify = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

defineComponent({
  components: {
    Guide,
  },
});
</script>

<style>
#guide h1 {
  @apply font-medium my-16 leading-7 tracking-widest text-3xl;
}

#guide h2 {
  @apply font-medium my-12 leading-7 tracking-widest text-2xl;
}

#guide h3 {
  @apply my-8 leading-7 tracking-widest text-xl;
}

#guide h4 {
  @apply my-8 leading-7 tracking-wide text-lg;
}

#guide h5 {
  @apply my-6 leading-7;
}

#guide p {
  @apply my-0.5;
}

#guide ul {
  @apply list-disc pl-8 my-4;
}

#guide ol {
  @apply list-decimal pl-8 my-4;
}

#guide pre {
  @apply border border-[#E0E0E0] rounded-md mb-4 py-4 px-6;
}

#guide code {
  @apply whitespace-pre-wrap inline-block bg-transparent break-all;
}

#guide blockquote {
  @apply bg-box-yellow rounded-md p-4 my-6 dark:text-black;
}

#guide blockquote > p {
  @apply mb-0;
}

#guide a {
  @apply text-[#647FFF] hover:text-[#647FFF] dark:hover:text-[#647FFF] dark:text-[#647FFF] cursor-pointer;
}
</style>
