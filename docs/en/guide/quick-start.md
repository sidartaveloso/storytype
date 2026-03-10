# Quick Start

Get started with Storytype in your Vue 3 project in just a few minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20.11.1+** installed
- **pnpm 9.12.3+** (recommended) or npm/yarn
- Basic knowledge of Vue 3 and TypeScript
- A Vue 3 project (or create one)

## Installation

### Option 1: Add to Existing Vue Project

If you already have a Vue 3 project:

```bash
# Install Storytype CLI globally
npm install -g @storytype/cli

# Or with pnpm
pnpm add -g @storytype/cli

# Initialize Storytype in your project
cd your-vue-project
storytype init
```

The `init` command will:

- Create the Atomic Design folder structure
- Add ESLint rules for pattern enforcement
- Configure Storybook (if not already present)
- Add TypeScript configurations
- Create example components

### Option 2: Create New Project with Storytype

Start a fresh project with Storytype preconfigured:

```bash
# Create new project
storytype create my-app

# Navigate to project
cd my-app

# Install dependencies
pnpm install

# Start development server
pnpm dev
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
storytype add atom Avatar
```

This generates:

```vue
<!-- src/components/atomos/AtomAvatar/AtomAvatar.vue -->
<script setup lang="ts">
import type { AvatarProps } from './types';

const props = withDefaults(defineProps<AvatarProps>(), {
  size: 'md',
  shape: 'circle',
});
</script>

<template>
  <div class="atom-avatar" :class="[`atom-avatar--${props.size}`, `atom-avatar--${props.shape}`]">
    <img v-if="props.src" :src="props.src" :alt="props.alt" />
    <span v-else class="atom-avatar__initials">{{ props.initials }}</span>
  </div>
</template>

<style scoped lang="scss">
.atom-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &--circle {
    border-radius: 50%;
  }

  &--square {
    border-radius: 4px;
  }

  &--sm {
    width: 32px;
    height: 32px;
  }

  &--md {
    width: 48px;
    height: 48px;
  }

  &--lg {
    width: 64px;
    height: 64px;
  }
}
</style>
```

```ts
// src/components/atomos/AtomAvatar/types.ts
export interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
}
```

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
storytype add page Perfil
```

This creates:

- `PerfilPage.vue` - Container with business logic
- `PerfilScreen.vue` - Presentation component
- `PerfilScreen.types.ts` - Component types
- `PerfilScreen.stories.ts` - Storybook stories

## Best Practices

### Component Naming

Follow the Portuguese Atomic Design naming:

```
AtomButton      → Atom component
MolUserCard     → Molecule component
OrgNavigation   → Organism component
TempDashboard   → Template component
PerfilPage      → Page container
PerfilScreen    → Screen presentation
```

### TypeScript

Always define interfaces in separate `.types.ts` file:

```typescript
// PerfilScreen.types.ts
export interface PerfilScreenType {
  usuario: Usuario;
  carregando?: boolean;
}

export interface PerfilScreenProps {
  usuario: Usuario;
  carregando?: boolean;
}

export interface PerfilScreenEmits {
  (e: 'salvar', dados: Usuario): void;
  (e: 'cancelar'): void;
}
```

```vue
<!-- PerfilScreen.vue -->
<template>
  <!-- content -->
</template>

<script setup lang="ts">
import type { PerfilScreenProps, PerfilScreenEmits } from './PerfilScreen.types';

const props = defineProps<PerfilScreenProps>();
const emits = defineEmits<PerfilScreenEmits>();
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
    usuario: {
      nome: 'João Silva',
      email: 'joao@example.com',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
  },
};

export const SemAvatar: Story = {
  args: {
    usuario: {
      nome: 'Maria Santos',
      email: 'maria@example.com',
    },
  },
};

export const Carregando: Story = {
  args: {
    usuario: null,
    carregando: true,
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
