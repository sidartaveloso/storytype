<template>
  <div class="storytype-group-cards" :class="containerClass">
    <div class="storytype-group-cards__header">
      <div class="storytype-group-cards__titulo">{{ titulo }}</div>
      <div v-if="subtitulo" class="storytype-group-cards__subtitulo">{{ subtitulo }}</div>
    </div>
    <div class="storytype-group-cards__list">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GroupCardsProps } from './GroupCards.types';

const props = withDefaults(defineProps<GroupCardsProps>(), {
  subtitulo: undefined,
  color: 'primary',
  textColor: 'white',
});

const containerClass = computed(() => `bg-${props.color} text-${props.textColor}`);
</script>

<style scoped>
.storytype-group-cards {
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;

  .storytype-group-cards__header {
    font-weight: 300;
    font-size: 18px;

    .storytype-group-cards__subtitulo {
      text-align: center;
      font-weight: 700;
      font-size: 20px;
      line-height: 22px;
    }
  }

  .storytype-group-cards__list {
    flex-grow: 1;
    margin-left: 16px;
  }
}
</style>
