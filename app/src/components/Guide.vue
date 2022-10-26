<template>
  <div id="guide">
    <Guide />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted } from 'vue';
import Guide from '../../tutorial/guide.md'
import rust from 'highlight.js/lib/languages/rust';
import hljs from 'highlight.js';


onMounted(() => {
  const guide = document.getElementById('guide');

  
  if (guide) {
    const els = Array.from(guide.querySelectorAll('h2, h3, h4, h5, h6'));

    els.forEach((el) => {
      const id = slugify(el.innerHTML);
      el.setAttribute('id', id);
    });

    const sections: string[] = els.map(heading => heading.innerHTML);

    emit('headings', sections);
  }
  
  hljs.registerLanguage('rust', rust);
  hljs.highlightAll()
});

const emit = defineEmits<{
    (e: 'headings', sections: string[]): void;
}>();

const slugify = (str: string) => {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}


defineComponent({
  components: {
    Guide
  }
})
</script>

<style>
#guide h1 {
  @apply font-medium mb-8 leading-7 tracking-widest text-2xl mt-4
}

#guide h2 {
  @apply font-medium mb-6 leading-7 tracking-widest mt-3
}

#guide h3 {
  @apply mb-6 leading-7 tracking-widest mt-3
}

#guide h4 {
  @apply mb-6 leading-7 tracking-wide mt-3
}

#guide h5 {
  @apply mb-6 leading-7 mt-3
}

#guide p {
  @apply mb-4
}

#guide ul {
  @apply list-disc pl-8 mb-4
}

#guide pre {
  @apply border border-[#E0E0E0] rounded-md mb-4 py-4 px-6
}

#guide blockquote {
  @apply bg-box-yellow rounded-md p-4 mb-4 dark:text-black
}

#guide blockquote > p {
  @apply mb-0
}
</style>
