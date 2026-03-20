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
// UserProfileScreen.types.ts
export interface UserProfileScreenType {
  user: { name: string; email: string };
  loading?: boolean;
}

export interface UserProfileScreenProps {
  user: { name: string; email: string };
  loading?: boolean;
}

export interface UserProfileScreenEmits {
  save: [data: Partial<UserProfileScreenType['user']>];
}
```

```vue
<!-- UserProfileScreen.vue - Screen: Pure presentation, props-driven -->
<template>
  <div class="user-profile-screen">
    <AtomInput v-model="props.user.name" label="Name" />
    <AtomButton @click="emits('save', { name: props.user.name })">
      Save
    </AtomButton>
  </div>
</template>

<script setup lang="ts">
import type { UserProfileScreenProps, UserProfileScreenEmits } from './UserProfileScreen.types';

const props = defineProps<UserProfileScreenProps>();
const emits = defineEmits<UserProfileScreenEmits>();
</script>
```

```vue
<!-- UserProfilePage.vue - Page: Business logic container -->
<template>
  <UserProfileScreen
    :user="userStore.user"
    :loading="userStore.loading"
    @save="handleSave"
  />
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import UserProfileScreen from './UserProfileScreen.vue';
import type { User } from '@/types';

const userStore = useUserStore();

const handleSave = async (data: Partial<User>) => {
  await userStore.update(data);
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
storytype add page UserProfile
```

## Learn More

- [Introduction](/guide/introduction) - Understand the pattern philosophy
- [Quick Start](/guide/quick-start) - Set up your first Storytype project
