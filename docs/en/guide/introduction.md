# What is Storytype?

**The type-safe way to build Vue 3 components.** Storytype is a pattern that combines Atomic Design with Container/Presentation to give you fully typed, testable, and maintainable components.

## Show Me the Code

Here's what changes:

::: code-group

```vue [❌ Before: Weak Types]
<script setup>
// Props are "any" - no autocomplete, no safety
defineProps(['user', 'isLoading', 'onUpdate']);

// Business logic mixed with UI
const store = useUserStore();
const router = useRouter();

const handleSave = () => {
  store.update(user); // What if "user" is undefined?
  router.push('/dashboard');
};
</script>
```

```vue [✅ After: Fully Typed]
<script setup lang="ts">
// Props are fully typed - autocomplete everywhere
interface Props {
  user: User; // TypeScript knows what properties exist
  isLoading: boolean;
}

interface Emits {
  update: [user: User];
}

defineProps<Props>();
const emit = defineEmits<Emits>();

// Pure component - no stores, no router
const handleSave = () => {
  emit('update', props.user); // Type-checked!
};
</script>
```

:::

## Type Safety in Action

TypeScript catches mistakes **before** they reach production:

```typescript
// Define your types once
export interface UserProfileProps {
  user: User;
  loading: boolean;
}

export interface UserProfileEmits {
  save: [data: Partial<User>];
  cancel: [];
}
```

Now your editor helps you:

```vue
<template>
  <!-- ✅ Autocomplete shows: name, email, avatar -->
  <h1>{{ user.name }}</h1>

  <!-- ❌ TypeScript error: Property 'foo' does not exist -->
  <p>{{ user.foo }}</p>

  <!-- ✅ Event payload is type-checked -->
  <button @click="emit('save', { name: 'New Name' })">

  <!-- ❌ TypeScript error: Expected 1 argument, got 0 -->
  <button @click="emit('save')">
</template>
```

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

Each complex feature is split into two typed parts:

**Step 1: Define your types** (the contract)

```typescript
// UserProfileScreen.types.ts
import type { User } from '@/types';

// Props flow DOWN (data)
export interface UserProfileScreenProps {
  user: User;
  loading: boolean;
  error: string | null;
}

// Events flow UP (actions)
export interface UserProfileScreenEmits {
  save: [data: Partial<User>];
  cancel: [];
}

// Component type (for Storybook, tests, etc.)
export interface UserProfileScreenType {
  $props: UserProfileScreenProps;
  $emit: UserProfileScreenEmits;
}
```

**Step 2: Pure Presentation Component** (UI only)

```vue
<!-- UserProfileScreen.vue -->
<template>
  <div class="user-profile">
    <input v-model="localName" type="text" />
    <button @click="handleSave" :disabled="loading">
      {{ loading ? 'Saving...' : 'Save' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { UserProfileScreenProps, UserProfileScreenEmits } from './UserProfileScreen.types';

const props = defineProps<UserProfileScreenProps>();
const emit = defineEmits<UserProfileScreenEmits>();

const localName = ref(props.user.name);

const handleSave = () => {
  // TypeScript ensures we pass the right shape
  emit('save', { name: localName.value });
};
</script>
```

**Step 3: Smart Container** (business logic)

```vue
<!-- UserProfilePage.vue -->
<template>
  <UserProfileScreen
    :user="state.user"
    :loading="state.loading"
    :error="state.error"
    @save="handleSave"
    @cancel="router.push('/dashboard')"
  />
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import UserProfileScreen from './UserProfileScreen.vue';

const store = useUserStore();
const router = useRouter();
const state = store.state; // Your state management

const handleSave = async (data: Partial<User>) => {
  await store.updateUser(data); // Type-safe all the way
};
</script>
```

**The benefits:**

- ✅ `UserProfileScreen` can be developed in Storybook isolation
- ✅ TypeScript catches prop/emit mismatches instantly
- ✅ Refactoring is safe - compiler catches all breaking changes
- ✅ Testing is trivial - just pass props, assert emits

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
