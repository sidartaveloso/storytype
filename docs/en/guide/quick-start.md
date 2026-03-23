# Quick Start

Get started with Storytype in your Vue 3 project in just a few minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20.11.1+** installed
- **pnpm 9.12.3+** (recommended) or npm/yarn
- Basic knowledge of Vue 3 and TypeScript
- A Vue 3 project (or create one)

## Installation

### Option 1: Install Globally

To use in any project:

```bash
# With pnpm (recommended)
pnpm add -g storytype

# Or with npm
npm install -g storytype

# Verify installation
storytype --version
```

### Option 2: Install Locally

To use in a specific project:

```bash
# With pnpm
pnpm add -D storytype

# Or with npm
npm install -D storytype

# Use with npx
npx storytype --version
```

### Option 3: Clone Storytype Repository

To develop or contribute:

```bash
# Clone repository
git clone https://github.com/sidartaveloso/storytype.git
cd storytype

# Install dependencies
pnpm install

# Link globally
pnpm link

# Use anywhere
storytype --version
```

## Project Structure

After initialization, your project will have this structure:

```
src/
├── components/
│   ├── atomos/
│   │   ├── AtomButton/
│   │   │   ├── AtomButton.vue
│   │   │   ├── AtomButton.stories.ts
│   │   │   ├── AtomButton.spec.ts
│   │   │   └── types.ts
│   │   └── ...
│   ├── moleculas/
│   ├── organismos/
│   ├── templates/
│   └── pages/
│       └── ExamplePage/
│           ├── ExamplePage.vue          # Container
│           ├── ExampleScreen.vue        # Presentation
│           └── ExampleScreen.stories.ts # Storybook
├── store/
├── router/
└── ...
```

## Your First Component

Let's create a simple atom component:

```bash
storytype generate atomos Avatar
```

This automatically generates 5 files:

::: code-group

```typescript [types.ts - The Contract]
// src/components/atomos/AtomAvatar/types.ts

/** Size variants for the avatar */
export type AvatarSize = 'sm' | 'md' | 'lg';

/** Avatar component props */
export interface AvatarProps {
  /** User's image URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Size variant */
  size?: AvatarSize;
}

/** Avatar component type (for Storybook & tests) */
export interface AvatarType {
  $props: AvatarProps;
}
```

```vue [AtomAvatar.vue - The Component]
<template>
  <img :src="src" :alt="alt" :class="['avatar', `avatar--${size}`]" />
</template>

<script setup lang="ts">
import type { AvatarProps } from './types';

// TypeScript provides:
// ✅ Autocomplete for all props
// ✅ Type errors if props are wrong
// ✅ Safe refactoring
withDefaults(defineProps<AvatarProps>(), {
  size: 'md',
});
</script>

<style scoped>
.avatar {
  border-radius: 50%;
}
.avatar--sm {
  width: 32px;
  height: 32px;
}
.avatar--md {
  width: 48px;
  height: 48px;
}
.avatar--lg {
  width: 64px;
  height: 64px;
}
</style>
```

```typescript [AtomAvatar.stories.ts - Live Documentation]
import type { Meta, StoryObj } from '@storybook/vue3';
import AtomAvatar from './AtomAvatar.vue';
import type { AvatarProps } from './types';

const meta = {
  title: 'Atomos/AtomAvatar',
  component: AtomAvatar,
  tags: ['autodocs'],
} satisfies Meta<typeof AtomAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// TypeScript ensures stories match props
export const Default: Story = {
  args: {
    src: 'https://i.pravatar.cc/150',
    alt: 'User avatar',
    size: 'md',
  },
};

export const Small: Story = {
  args: { ...Default.args, size: 'sm' },
};
```

:::

## The Developer Experience

Now when you use the component, **TypeScript helps you**:

```vue
<template>
  <!-- ✅ Autocomplete shows: src, alt, size -->
  <AtomAvatar src="/user.jpg" alt="John Doe" size="lg" />

  <!-- ❌ TypeScript error: Type '"xl"' is not assignable to type 'AvatarSize' -->
  <AtomAvatar size="xl" />

  <!-- ❌ TypeScript error: Property 'src' is missing -->
  <AtomAvatar alt="John" />
</template>
```

**This means:**

- 🎯 Can't pass wrong prop types
- 🎯 Can't forget required props
- 🎯 Can't use props that don't exist
- 🎯 Rename refactoring is 100% safe

## Development Workflow

### 1. Start Storybook

Open Storybook to develop components in isolation:

```bash
pnpm storybook
```

Navigate to `http://localhost:6006` to see your components.

### 2. Test Components

Each component is automatically testable:

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### 3. Compose Components

Build larger components from smaller ones:

```bash
# Create a molecule that uses atoms
storytype add molecule UserCard

# Create an organism that uses molecules
storytype add organism UserProfile
```

### 4. Create Pages

Generate a complete page with container and presentation:

```bash
storytype add page UserProfile
```

This creates:

- `UserProfilePage.vue` - Container with business logic
- `UserProfileScreen.vue` - Presentation component
- `UserProfileScreen.types.ts` - Component types
- `UserProfileScreen.stories.ts` - Storybook stories

## Best Practices

### Component Naming

Follow the Atomic Design naming convention:

```
AtomButton         → Atom component
MolUserCard        → Molecule component
OrgNavigation      → Organism component
TempDashboard      → Template component
UserProfilePage    → Page container
UserProfileScreen  → Screen presentation
```

### TypeScript

Always define interfaces in separate `.types.ts` file:

```typescript
// UserProfileScreen.types.ts
export interface UserProfileScreenType {
  user: User;
  loading?: boolean;
}

export interface UserProfileScreenProps {
  user: User;
  loading?: boolean;
}

export interface UserProfileScreenEmits {
  save: [data: User];
  cancel: [];
}
```

```vue
<!-- UserProfileScreen.vue -->
<template>
  <!-- content -->
</template>

<script setup lang="ts">
import type { UserProfileScreenProps, UserProfileScreenEmits } from './UserProfileScreen.types';

const props = defineProps<UserProfileScreenProps>();
const emits = defineEmits<UserProfileScreenEmits>();
</script>
```

### Storybook Stories

Each component should have comprehensive stories:

```ts
// UserCard.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3';
import MolUserCard from './MolUserCard.vue';

const meta: Meta<typeof MolUserCard> = {
  title: 'Moleculas/MolUserCard',
  component: MolUserCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MolUserCard>;

export const Default: Story = {
  args: {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
  },
};

export const NoAvatar: Story = {
  args: {
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
  },
};

export const Loading: Story = {
  args: {
    user: null,
    loading: true,
  },
};
```

## Next Steps

Now that you have Storytype set up, you can:

- Continue exploring the documentation
- Start building your components following the Storytype pattern
- Check the Introduction guide for deeper understanding of the philosophy

## Troubleshooting

### ESLint Errors

If you see ESLint errors about the pattern:

```bash
# Install ESLint plugin
pnpm add -D @storytype/eslint-plugin

# Add to .eslintrc.js
module.exports = {
  extends: ['plugin:@storytype/recommended'],
};
```

### Storybook Not Starting

Ensure you have the correct dependencies:

```bash
pnpm add -D @storybook/vue3 @storybook/addon-essentials
```

### Type Errors

Make sure TypeScript is configured with strict mode:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

## Get Help

- [GitHub Issues](https://github.com/sidartaveloso/storytype/issues)
- [Discussions](https://github.com/sidartaveloso/storytype/discussions)
- [Discord Community](#) (coming soon)
