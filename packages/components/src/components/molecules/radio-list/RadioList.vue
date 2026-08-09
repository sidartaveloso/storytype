<template>
  <div class="storytype-radio-list">
    <h6 v-if="titulo" class="storytype-radio-list__titulo">{{ titulo }}</h6>
    <slot name="title"></slot>
    <div class="storytype-radio-list__list">
      <q-radio
        v-for="(opcao, idx) in opcoes"
        :key="idx"
        v-model="selected"
        :val="idx"
        :color="color"
        class="storytype-radio-list__option"
      >
        <div class="storytype-radio-list__item flex row items-center" :class="`text-${textColor}`">
          <div class="storytype-radio-list__codigo col-1">{{ opcao.codigo }}</div>
          <div class="storytype-radio-list__descricao col" v-html="opcao.descricao"></div>
        </div>
      </q-radio>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RadioListProps, RadioListEmits } from './RadioList.types';

const props = withDefaults(defineProps<RadioListProps>(), {
  titulo: '',
  color: 'primary',
  textColor: 'dark',
});

const emit = defineEmits<RadioListEmits>();

const selected = computed<number | null>({
  get: () => props.modelValue,
  set: (val: number | null) => emit('update:modelValue', val),
});
</script>

<style scoped>
.storytype-radio-list {
  &__titulo {
    margin: 0;
  }

  &__list {
    display: flex;
    flex-direction: column;
  }

  &__option {
    width: 100%;
    border-bottom: 1px solid #e0e0e0;
    padding: 20px 8px 20px 0;

    .q-radio__label {
      width: 100%;
    }
  }

  &__item {
    font-size: 18px;
    line-height: 26px;

    .storytype-radio-list__codigo {
      font-weight: 600;

      & + .storytype-radio-list__descricao {
        padding-left: 16px;
        font-weight: 400;
      }
    }
  }
}
</style>
