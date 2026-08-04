<template>
  <div class="storytype-title-user-name">
    <q-banner inline-actions rounded dark :class="bannerClass">
      <slot>{{ nome }}</slot>
    </q-banner>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TitleUserNameProps } from './TitleUserName.types';

const props = withDefaults(defineProps<TitleUserNameProps>(), {
  color: 'primary',
  textColor: 'white',
});

const bannerClass = computed(() => `bg-${props.color} text-${props.textColor}`);
</script>

<style scoped>
.storytype-title-user-name {
  display: block;
  padding: 20px;
}
</style>
