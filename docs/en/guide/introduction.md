# What is Storytype?

Storytype is a comprehensive Vue 3 component development pattern that combines **Atomic Design** principles with the **Container/Presentation** pattern to create scalable, maintainable, and testable applications.

## The Problem

Modern Vue applications often face challenges as they grow:

- **Component Sprawl**: Components become increasingly difficult to organize and find
- **Mixed Responsibilities**: Business logic, presentation, and state management become entangled
- **Testing Complexity**: Tightly coupled components are hard to test in isolation
- **Inconsistent Patterns**: Different developers approach component architecture differently
- **Poor Reusability**: Components built for specific use cases can't be easily reused

## The Solution

Storytype addresses these challenges through three core principles:

### 1. Atomic Design Hierarchy

Components are organized into five distinct levels, each with a clear purpose:

```
src/components/
├── atomos/           # Basic building blocks (buttons, inputs, icons)
├── moleculas/        # Simple combinations (search bars, cards)
├── organismos/       # Complex features (navigation, forms)
├── templates/        # Page layouts without business logic
└── pages/            # Business logic containers (stores, router)
```

### 2. Container/Presentation Separation

Each complex feature is split into two parts:

- **Pages (Containers)**: Handle business logic, state management, routing
- **Screens (Presentation)**: Pure presentation components driven by props

```vue
<!-- PerfilPage.vue: Container -->
<template>
  <PerfilScreen :usuario="store.usuario" @salvar="store.atualizar" />
</template>

<script setup lang="ts">
import { useUsuarioStore } from '@/store/usuario';
import PerfilScreen from './PerfilScreen.vue';

const store = useUsuarioStore();
</script>
```

```typescript
// PerfilScreen.types.ts
export interface PerfilScreenType {
  usuario: Usuario;
}

export interface PerfilScreenProps {
  usuario: Usuario;
}

export interface PerfilScreenEmits {
  (e: 'salvar', dados: Partial<Usuario>): void;
}
```

```vue
<!-- PerfilScreen.vue: Presentation -->
<template>
  <div class="perfil">
    <!-- Pure presentation logic -->
  </div>
</template>

<script setup lang="ts">
import type { PerfilScreenProps, PerfilScreenEmits } from './PerfilScreen.types';

defineProps<PerfilScreenProps>();
defineEmits<PerfilScreenEmits>();
</script>
```

### 3. Storybook-Driven Development

Every component (except Pages) has comprehensive Storybook stories that demonstrate:

- All possible states and variations
- Interactive controls for props
- Responsive behavior testing
- Accessibility verification
- Usage examples and documentation

## Key Benefits

### For Developers

- **Clear Mental Model**: Know exactly where to put new code
- **Easy Testing**: Isolated components test in isolation
- **Quick Onboarding**: New team members understand the pattern immediately
- **Reusable Components**: Build once, use everywhere

### For Teams

- **Consistent Codebase**: Everyone follows the same patterns
- **Faster Development**: Reuse existing components instead of rebuilding
- **Better Collaboration**: Designers and developers share Storybook as common ground
- **Reduced Technical Debt**: Clear patterns prevent architectural decay

### For Projects

- **Scalability**: Architecture that grows without becoming unwieldy
- **Maintainability**: Easy to find and modify components
- **Type Safety**: TypeScript ensures reliability
- **Living Documentation**: Storybook provides always-up-to-date component documentation

## Technology Stack

Storytype is designed for modern Vue 3 development:

- **Vue 3.5+** with Composition API and `<script setup>`
- **TypeScript 5+** with strict mode
- **Storybook 10+** for component development and documentation
- **Quasar 2+** (optional) for UI components
- **Vitest** for unit testing
- **ESLint** with custom rules for pattern enforcement

## Who Is This For?

Storytype is ideal for:

- **Teams** building medium to large Vue applications
- **Solo Developers** who want maintainable codebases
- **Design Systems** that need component documentation
- **Open Source Projects** requiring clear contribution guidelines
- **Enterprise Applications** with long-term maintenance needs

## Next Steps

Ready to get started? Continue to the [Quick Start](/guide/quick-start) guide to set up your first Storytype project.
