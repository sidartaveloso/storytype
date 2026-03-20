---
layout: home

hero:
  name: Storytype
  text: Padrão Moderno de Desenvolvimento de Componentes Vue 3
  tagline: Construa aplicações Vue escaláveis, de fácil manutenção e testáveis com Atomic Design e padrão Container/Presentation
  image:
    src: /logo.svg
    alt: Storytype
  actions:
    - theme: brand
      text: Começar
      link: /pt-br/guide/introduction
    - theme: alt
      text: Ver no GitHub
      link: https://github.com/sidartaveloso/storytype

features:
  - icon: ⚛️
    title: Atomic Design
    details: Organize seus componentes em átomos, moléculas, organismos, templates e pages para máxima reutilização e manutenibilidade.

  - icon: 📦
    title: Separação Container/Presentation
    details: Separação clara entre lógica de negócio (Pages com stores/router) e lógica de apresentação (Screens com props/emits).

  - icon: 📚
    title: Integração com Storybook
    details: Todo componente possui stories completas com demonstração de estados, testes responsivos e play functions.

  - icon: 🔷
    title: TypeScript em Primeiro Lugar
    details: Suporte completo a TypeScript com interfaces explícitas de Props, Emits e Slots para segurança de tipos.

  - icon: 🎨
    title: Compatível com Quasar
    details: Integra perfeitamente com componentes e utilitários do Quasar Framework.

  - icon: 🚀
    title: Ferramentas CLI
    details: Gere componentes com um único comando, mantendo consistência de padrão em toda a base de código.
---

## Exemplo Rápido

```typescript
// PerfilScreen.types.ts
export interface PerfilScreenType {
  usuario: { nome: string; email: string };
  carregando?: boolean;
}

export interface PerfilScreenProps {
  usuario: { nome: string; email: string };
  carregando?: boolean;
}

export interface PerfilScreenEmits {
  salvar: [dados: Partial<PerfilScreenType['usuario']>];
}
```

```vue
<!-- PerfilScreen.vue - Screen: Apresentação pura, dirigida por props -->
<template>
  <div class="perfil-screen">
    <AtomInput v-model="props.usuario.nome" label="Nome" />
    <AtomButton @click="emits('salvar', { nome: props.usuario.nome })">
      Salvar
    </AtomButton>
  </div>
</template>

<script setup lang="ts">
import type { PerfilScreenProps, PerfilScreenEmits } from './PerfilScreen.types';

const props = defineProps<PerfilScreenProps>();
const emits = defineEmits<PerfilScreenEmits>();
</script>
```

```vue
<!-- PerfilPage.vue - Page: Container com lógica de negócio -->
<template>
  <PerfilScreen
    :usuario="usuarioStore.usuario"
    :carregando="usuarioStore.carregando"
    @salvar="handleSalvar"
  />
</template>

<script setup lang="ts">
import { useUsuarioStore } from '@/store/usuario';
import PerfilScreen from './PerfilScreen.vue';
import type { Usuario } from '@/types';

const usuarioStore = useUsuarioStore();

const handleSalvar = async (dados: Partial<Usuario>) => {
  await usuarioStore.atualizar(dados);
};
</script>
```

## Por Que Storytype?

- **Escalabilidade**: Arquitetura de componentes que cresce com sua aplicação
- **Testabilidade**: Componentes isolados são fáceis de testar no Storybook e testes unitários
- **Manutenibilidade**: Padrões claros reduzem a carga cognitiva e tempo de onboarding
- **Reutilização**: Componentes atômicos podem ser compostos em infinitas combinações
- **Segurança de Tipos**: TypeScript garante confiabilidade em tempo de compilação
- **Produtividade da Equipe**: Padrões consistentes aceleram o desenvolvimento

## Começando

Instale a CLI e crie seu primeiro componente:

```bash
npm install -g @storytype/cli

# Gerar um novo átomo
storytype add atom Avatar

# Gerar uma molécula
storytype add molecule UserCard

# Gerar uma página completa com screen
storytype add page Perfil
```

## Saiba Mais

- [Introdução](/pt-br/guide/introduction) - Entenda a filosofia do padrão
- [Início Rápido](/pt-br/guide/quick-start) - Configure seu primeiro projeto Storytype
