<template>
  <div class="storytype-new-password">
    <q-input
      v-model="novaSenha"
      :type="novaSenhaVisivel ? 'text' : 'password'"
      class="q-mb-md"
      :rules="[regraSenha]"
      :lazy-rules="true"
      label="Nova senha"
      outlined
      autocomplete="new-password"
    >
      <template #append>
        <q-icon
          :name="novaSenhaVisivel ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          :aria-label="novaSenhaVisivel ? 'Ocultar nova senha' : 'Exibir nova senha'"
          @click="novaSenhaVisivel = !novaSenhaVisivel"
        />
      </template>
    </q-input>

    <q-input
      v-model="confirmarNovaSenha"
      :type="confirmarNovaSenhaVisivel ? 'text' : 'password'"
      label="Confirmar nova senha"
      outlined
      autocomplete="new-password"
      :rules="[val => val === novaSenha || 'As senhas não coincidem']"
    >
      <template #append>
        <q-icon
          :name="confirmarNovaSenhaVisivel ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          :aria-label="confirmarNovaSenhaVisivel ? 'Ocultar confirmação' : 'Exibir confirmação'"
          @click="confirmarNovaSenhaVisivel = !confirmarNovaSenhaVisivel"
        />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { NewPasswordProps, NewPasswordEmits } from './NewPassword.types';

const props = withDefaults(defineProps<NewPasswordProps>(), {
  politicaRegex: undefined,
  politicaSenha: undefined,
});

const emit = defineEmits<NewPasswordEmits>();

const novaSenha = ref<string>(props.modelValue);
const confirmarNovaSenha = ref<string>('');
const novaSenhaVisivel = ref(false);
const confirmarNovaSenhaVisivel = ref(false);

/** Validates a password against the provided regex or a 6-char minimum. */
const validar = (senha: string): boolean =>
  props.politicaRegex ? props.politicaRegex.test(senha) : senha.length >= 6;

const senhaValida = computed(() => validar(novaSenha.value));
const confirmacaoValida = computed(
  () => Boolean(confirmarNovaSenha.value) && confirmarNovaSenha.value === novaSenha.value
);

const regraSenha = (val: string) => validar(val) || props.politicaSenha || 'Senha inválida';

watch([novaSenha, confirmarNovaSenha], () =>
  emit('update:valid', senhaValida.value && confirmacaoValida.value)
);
watch(novaSenha, valor => emit('update:modelValue', valor));
watch(
  () => props.modelValue,
  valor => {
    novaSenha.value = valor;
  }
);
</script>

<style scoped>
.storytype-new-password {
  .q-input {
    margin-bottom: 24px;
  }
}
</style>
