<template>
  <q-input
    filled
    v-bind="$attrs"
    :model-value="displayValue"
    :mask="mask"
    :label="label"
    :color="color"
    :disabled="disabled"
    class="storytype-date-input q-field--with-bottom"
    @focus="showDatePopup"
  >
    <template v-slot:append>
      <slot name="append">
        <q-icon name="event" class="cursor-pointer" :color="color">
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
            <q-date
              :model-value="internalValue"
              :options="options ?? undefined"
              mask="DD/MM/YYYY"
              @update:model-value="onDateUpdate"
            >
              <div class="row items-center justify-end">
                <slot></slot>
                <q-btn v-close-popup :label="closeLabel" flat :color="color" />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </slot>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { date } from 'quasar';
import type { DateInputProps, DateInputEmits } from './DateInput.types';

const props = withDefaults(defineProps<DateInputProps>(), {
  modelValue: undefined,
  options: undefined,
  mask: 'DD/MM/YYYY',
  label: undefined,
  triggerLabel: 'Abrir calendário',
  disabled: false,
  color: 'primary',
});

const emit = defineEmits<DateInputEmits>();

const qDateProxy = ref<{ show: () => void; hide: () => void }>();

const MASK = 'DD/MM/YYYY';

const displayValue = computed<string>(() =>
  props.modelValue ? date.formatDate(props.modelValue, MASK) : ''
);

const internalValue = computed<string | undefined>(() =>
  props.modelValue ? date.formatDate(props.modelValue, MASK) : undefined
);

const closeLabel = 'Fechar';

const onDateUpdate = (value: string | string[] | undefined) => {
  let out: Date | undefined;
  if (typeof value === 'string') {
    out = date.extractDate(value, MASK);
  }
  qDateProxy.value?.hide();
  emit('update:modelValue', out);
};

function showDatePopup() {
  if (props.disabled) return;
  qDateProxy.value?.show();
}
</script>
