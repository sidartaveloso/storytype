# Quick Start

Get started with Storytype in your Vue 3 project in just a few minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20.11.1+** installed
- **pnpm 10.33.0+** (recommended) or npm/yarn
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
│   │   ├── button/
│   │   │   ├── Button.vue
│   │   │   ├── Button.types.ts
│   │   │   ├── Button.stories.ts
│   │   │   ├── Button.mock.ts
│   │   │   └── index.ts
│   │   └── ...
│   ├── moleculas/
│   ├── organismos/
│   ├── templates/
│   │   └── example-screen/
│   │       ├── ExampleScreen.vue
│   │       ├── ExampleScreen.types.ts
│   │       ├── ExampleScreen.stories.ts
│   │       ├── ExampleScreen.mock.ts
│   │       └── index.ts
│   └── pages/
│       └── example-page/
│           ├── ExamplePage.vue
│           ├── ExamplePage.types.ts
│           ├── ExamplePage.stories.ts
│           ├── ExamplePage.mock.ts
│           └── index.ts
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

```typescript [Avatar.types.ts - Type Definitions]
// src/components/atomos/avatar/Avatar.types.ts

/** Size variants for the avatar */
export type AvatarSize = 'sm' | 'md' | 'lg';

/** Shape variants for the avatar */
export type AvatarShape = 'circle' | 'square';

/** Avatar component props */
export interface AvatarProps {
  /** User's image URL */
  src?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** User initials when no image is provided */
  initials?: string;
  /** Size variant */
  size?: AvatarSize;
  /** Shape variant */
  shape?: AvatarShape;
}

/** Avatar component type (for Storybook & tests) */
export interface AvatarType {
  props: AvatarProps;
  models: AvatarModels;
  emits: AvatarEmits;
}

export interface AvatarModels {}
export interface AvatarEmits {}
```

```vue [Avatar.vue - The Component]
<!-- src/components/atomos/avatar/Avatar.vue -->
<template>
  <div class="atom-avatar" :class="[`atom-avatar--${props.size}`, `atom-avatar--${props.shape}`]">
    <img v-if="props.src" :src="props.src" :alt="props.alt" />
    <span v-else class="atom-avatar__initials">{{ props.initials }}</span>
  </div>
</template>

<script setup lang="ts">
import type { AvatarProps } from './Avatar.types';

// TypeScript provides:
// ✅ Autocomplete for all props
// ✅ Type errors if props are wrong
// ✅ Safe refactoring
const props = withDefaults(defineProps<AvatarProps>(), {
  size: 'md',
  shape: 'circle',
});
</script>

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

```typescript [Avatar.stories.ts - Live Documentation]
// src/components/atomos/avatar/Avatar.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3';
import Avatar from './Avatar.vue';
import { generateMockData } from './Avatar.mock';

const meta: Meta<typeof Avatar> = {
  title: '01 - Atoms/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'User avatar component that displays profile picture or initials',
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockData = generateMockData();

// TypeScript ensures stories match props
export const Default: Story = {
  args: {
    ...mockData.props,
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150',
    alt: 'User avatar',
    size: 'md',
  },
};

export const WithInitials: Story = {
  args: {
    initials: 'JD',
    alt: 'John Doe',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    ...WithImage.args,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    ...WithImage.args,
    size: 'lg',
  },
};

export const Square: Story = {
  args: {
    ...WithImage.args,
    shape: 'square',
  },
};
```

```typescript [Avatar.mock.ts - Test Data]
// src/components/atomos/avatar/Avatar.mock.ts
import type { AvatarType, AvatarProps, AvatarModels, AvatarEmits } from './Avatar.types';

export const generateMockData = (): AvatarType => {
  const props: AvatarProps = {
    initials: 'JD',
    alt: 'John Doe',
    size: 'md',
    shape: 'circle',
  };

  const models: AvatarModels = {};
  const emits: AvatarEmits = {};

  return {
    props,
    models,
    emits,
  } satisfies AvatarType as AvatarType;
};
```

```typescript [index.ts - Module Exports]
// src/components/atomos/avatar/index.ts
export * from './Avatar.types';
export * from './Avatar.mock';
export * as Stories from './Avatar.stories';
export { default } from './Avatar.vue';
```

:::

## The Developer Experience

Now when you use the component, **TypeScript helps you**:

```vue
<template>
  <!-- ✅ Autocomplete shows: src, alt, initials, size, shape -->
  <Avatar src="/user.jpg" alt="John Doe" size="lg" />

  <!-- ❌ TypeScript error: Type '"xl"' is not assignable to type 'AvatarSize' -->
  <Avatar size="xl" />

  <!-- ✅ Optional props work -->
  <Avatar initials="JD" />
</template>
```

**This means:**

- 🎯 Can't pass wrong prop types
- 🎯 Optional props clearly indicated
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
