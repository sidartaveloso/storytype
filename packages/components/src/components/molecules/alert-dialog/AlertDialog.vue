<template>
  <q-dialog
    content-class="storytype-alert-dialog"
    full-width
    :model-value="modelValue"
    :aria-label="dialogAriaLabel"
    @update:model-value="emit('update:modelValue', $event as boolean)"
  >
    <q-card :class="cardClass">
      <q-card-actions align="right">
        <q-btn icon="close" color="white" flat round dense aria-label="Fechar" v-close-popup />
      </q-card-actions>

      <q-card-section class="flex column">
        <div class="text-center q-mb-lg">
          <q-icon :name="icon" :color="iconColor" style="font-size: 4rem" />
        </div>

        <div v-if="titulo" class="text-center q-mb-md storytype-alert-dialog__titulo">
          {{ titulo }}
        </div>

        <q-banner rounded class="bg-blue-grey-2 text-blue-grey-9">
          <slot>{{ mensagem }}</slot>
          <template v-if="!noActions" v-slot:action>
            <slot name="actions">
              <q-btn v-if="cancelLabel" flat color="primary" :label="cancelLabel" v-close-popup />
              <q-btn flat color="primary" :label="confirmLabel" @click="emit('confirm')" />
            </slot>
          </template>
        </q-banner>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AlertDialogProps, AlertDialogEmits } from './AlertDialog.types';

const props = withDefaults(defineProps<AlertDialogProps>(), {
  titulo: '',
  mensagem: '',
  icon: 'info',
  iconColor: 'secondary',
  color: 'primary',
  confirmLabel: 'OK',
  cancelLabel: '',
  noActions: false,
});

const emit = defineEmits<AlertDialogEmits>();

const cardClass = computed(() => `bg-${props.color} text-white`);

const dialogAriaLabel = computed(() => props.titulo || 'Alerta');
</script>

<style scoped>
.storytype-alert-dialog {
  .q-card__section {
    :deep(.q-banner) {
      padding: 24px 24px 8px 24px;

      .q-banner__content {
        font-size: 18px;
        font-weight: 500;
        line-height: 28px;
        margin-bottom: 8px;
      }
    }
  }

  &__titulo {
    font-size: 20px;
    font-weight: 700;
    line-height: 24px;
  }
}
</style>
