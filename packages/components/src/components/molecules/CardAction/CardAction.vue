<template>
  <div class="storytype-card-action">
    <h6 class="storytype-card-action__header" :class="`text-${color}`">
      {{ headerText }}
    </h6>
    <ul v-if="content && content.length" class="storytype-card-action__list">
      <li
        v-for="(item, idx) in content"
        :key="idx"
        class="storytype-card-action__item"
        :class="`text-${color}`"
      >
        {{ item }}
      </li>
    </ul>
    <div v-if="footerText" class="storytype-card-action__footer" :class="`text-${footerColor}`">
      {{ footerText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CardActionProps } from './CardAction.types';

withDefaults(defineProps<CardActionProps>(), {
  content: () => [],
  footerText: undefined,
  color: 'primary',
  footerColor: 'grey-7',
});
</script>

<style scoped>
.storytype-card-action {
  display: flex;
  flex-direction: column;
  background-color: var(--q-gray-1, #f5f5f5);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;

  &__header {
    font-weight: 700;
    font-size: 18px;
    margin: 0 0 12px;
  }

  &__list {
    margin: 0 0 16px;
    padding-left: 20px;

    &__item {
      margin-bottom: 8px;

      &:last-of-type {
        margin-bottom: 0;
      }
    }
  }

  &__footer {
    border-top: 1px solid var(--q-grey-4, #bdbdbd);
    padding-top: 8px;
    font-size: 14px;
    font-weight: 700;
  }
}
</style>
