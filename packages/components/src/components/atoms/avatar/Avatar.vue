<template>
  <div class="storytype-avatar">
    <div class="flex items-center no-wrap">
      <q-avatar :size="sizePx">
        <slot name="default">
          <img v-if="imagem" :src="imagem" :alt="alt ?? titulo ?? 'avatar'" />
          <span v-else class="storytype-avatar__initials" aria-hidden="true">
            {{ initials }}
          </span>
        </slot>
      </q-avatar>
      <div v-if="titulo || subtitulo" class="q-pl-md" :class="textClass">
        <h6 v-if="titulo" class="storytype-avatar__title">{{ titulo }}</h6>
        <div v-if="subtitulo" class="storytype-avatar__subtitle">{{ subtitulo }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AvatarProps } from './Avatar.types';

const props = withDefaults(defineProps<AvatarProps>(), {
  titulo: undefined,
  subtitulo: undefined,
  imagem: undefined,
  alt: undefined,
  size: 'md',
  tema: 'dark',
});

const sizeMap: Record<AvatarProps['size'], string> = {
  sm: '32px',
  md: '48px',
  lg: '64px',
  xl: '78px',
};

const sizePx = computed(() => sizeMap[props.size] ?? sizeMap.md);

const textClass = computed(() => (props.tema === 'light' ? 'text-white' : 'text-dark'));

const initials = computed(() => {
  const name = props.titulo?.trim();
  if (!name) return '?';
  const parts = name.split(/\s+/);
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
});
</script>

<style scoped>
.storytype-avatar {
  .storytype-avatar__title {
    line-height: 24px;
    margin-bottom: 6px;
    font-weight: 700;
  }
  .storytype-avatar__subtitle {
    font-weight: 300;
  }
}
</style>
