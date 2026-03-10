---
layout: home

hero:
  name: Storytype
  text: Modern Vue 3 Component Development Pattern
  tagline: Build scalable, maintainable, and testable Vue applications with Atomic Design and Container/Presentation patterns
  image:
    src: /logo.svg
    alt: Storytype
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/sidartaveloso/storytype

features:
  - icon: ⚛️
    title: Atomic Design
    details: Organize your components into atoms, molecules, organisms, templates, and pages for maximum reusability and maintainability.

  - icon: 📦
    title: Container/Presentation Separation
    details: Clear separation between business logic (Pages with stores/router) and presentation logic (Screens with props/emits).

  - icon: 📚
    title: Storybook Integration
    details: Every component has comprehensive stories with state demonstrations, responsive tests, and play functions.

  - icon: 🔷
    title: TypeScript-First
    details: Full TypeScript support with explicit Props, Emits, and Slots interfaces for type safety.

  - icon: 🎨
    title: Quasar Compatible
    details: Seamlessly integrates with Quasar Framework components and utilities.

  - icon: 🚀
    title: CLI Tooling
    details: Generate components with a single command, maintaining pattern consistency across your codebase.
---

## Quick Example

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
  (e: 'salvar', dados: Partial<PerfilScreenType['usuario']>): void;
}
```

```vue
<!-- PerfilScreen.vue - Screen: Pure presentation, props-driven -->
<template>
  <div class="perfil-screen">
    <AtomInput v-model="props.usuario.nome" label="Nome" />
    <AtomButton @click="emits('salvar', { nome: props.usuario.nome })"> Salvar </AtomButton>
  </div>
</template>

<script setup lang="ts">
import type { PerfilScreenProps, PerfilScreenEmits } from './PerfilScreen.types';

const props = defineProps<PerfilScreenProps>();
const emits = defineEmits<PerfilScreenEmits>();
</script>
```

```vue
<!-- PerfilPage.vue - Page: Business logic container -->
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

## Why Storytype?

- **Scalability**: Component architecture that grows with your application
- **Testability**: Isolated components are easy to test in Storybook and unit tests
- **Maintainability**: Clear patterns reduce cognitive load and onboarding time
- **Reusability**: Atomic components can be composed into countless combinations
- **Type Safety**: TypeScript ensures reliability at compile time
- **Team Productivity**: Consistent patterns accelerate development

## Getting Started

Install the CLI and create your first component:

```bash
npm install -g @storytype/cli

# Generate a new atom
storytype add atom Avatar

# Generate a molecule
storytype add molecule UserCard

# Generate a complete page with screen
storytype add page Perfil
```

## Learn More

- [Introduction](/guide/introduction) - Understand the pattern philosophy
- [Quick Start](/guide/quick-start) - Set up your first Storytype project
