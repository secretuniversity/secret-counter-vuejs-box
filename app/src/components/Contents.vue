<template>
    <div class="flex-col w-full pl-16 pt-12">
        <div class="flex items-center mb-6" v-for="section in sections" :key="section">
            <div class="w-4 h-4 rounded-full border-4 mr-2 border-[#989898]"></div>
            <a
                :href="`#${slugify(section)}`"
                class="block w-full font-normal text-sm hover:text-[#647FFF] cursor-pointer"
            >
                {{ section }}
            </a>
        </div>
        <div class="flex items-center">
            <img class="mr-4" src="../assets/finish.svg" alt="End of the guide">
            <p class="font-medium">Finish!</p>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    sections: string[]
}>()


const slugify = (str: string) => {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}
</script>
