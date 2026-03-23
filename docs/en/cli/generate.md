# Generate - Create New Components

The `generate` command creates Vue components with complete structure following the Storytype standard. Each component is generated with all necessary files using customizable Handlebars templates.

## Basic Usage

```bash
storytype generate <type> <name>
```

## Parameters

### `type` (required)

Component type in Atomic Design:

| Type         | Description           | Example                       |
| ------------ | --------------------- | ----------------------------- |
| `atomos`     | Most basic components | Button, Input, Label          |
| `moleculas`  | Combination of atoms  | Card, SearchBar, MenuItem     |
| `organismos` | Complex sections      | Header, Sidebar, Form         |
| `templates`  | Page layouts          | PageLayout, DashboardTemplate |
| `pages`      | Complete pages        | HomePage, ProfilePage         |

### `name` (required)

Component name in any format:

- `PascalCase` → maintains
- `kebab-case` → converts to PascalCase
- `camelCase` → converts to PascalCase

## Generated Structure

Each component is created with 5 files:

```
<type>/<kebab-name>/
├── <PascalName>.vue         # Vue component
├── <PascalName>.types.ts    # TypeScript types
├── <PascalName>.stories.ts  # Storybook
├── <PascalName>.mock.ts     # Mock data
└── index.ts                 # Exports
```

## Generated Files

### 1. Vue Component (`.vue`)

```vue
<template>
  <div class="primary-button">
    <!-- Content -->
    <p>Congratulations! You created the PrimaryButton component!</p>
  </div>
</template>

<script setup lang="ts">
import { PrimaryButtonProps } from './PrimaryButton.types';

const props = withDefaults(defineProps<PrimaryButtonProps>(), {
  // Add default props here
});
</script>

<style scoped>
.primary-button {
  /* Add component styles here */
}
</style>
```

### 2. TypeScript Types (`.types.ts`)

```typescript
export interface PrimaryButtonType {
  models: PrimaryButtonModels;
  props: PrimaryButtonProps;
  emits: PrimaryButtonEmits;
}

export interface PrimaryButtonModels {
  //TODO: Add models here
}

export interface PrimaryButtonProps {
  //TODO: Add props here
}

export interface PrimaryButtonEmits {
  //TODO: Add emits here
}
```

### 3. Storybook Stories (`.stories.ts`)

```typescript
import type { Meta, StoryObj } from '@storybook/vue3';
import PrimaryButton from './PrimaryButton.vue';
import { generateMockData } from './PrimaryButton.mock';

const meta: Meta<typeof PrimaryButton> = {
  title: '01 - Atoms/PrimaryButton',
  component: PrimaryButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'PrimaryButton component description',
      },
    },
  },
} satisfies Meta<typeof PrimaryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockData = generateMockData();

export const Default: Story = {
  args: {
    ...mockData.props,
    ...mockData.models,
  },
};
```

### 4. Mock Data (`.mock.ts`)

```typescript
import type {
  PrimaryButtonModels,
  PrimaryButtonProps,
  PrimaryButtonEmits,
  PrimaryButtonType,
} from './PrimaryButton.types';

export const generateMockData = (): PrimaryButtonType => {
  const props: PrimaryButtonProps = {
    //TODO: Add props here
  };

  const models: PrimaryButtonModels = {
    //TODO: Add models here
  };

  const emits: PrimaryButtonEmits = {
    //TODO: Add emits here ex.: (e: 'click', event: Event): void;
  };

  return {
    props,
    models,
    emits,
  } satisfies PrimaryButtonType as PrimaryButtonType;
};
```

### 5. Index (index.ts)

```typescript
export * from './PrimaryButton.types';
export * from './PrimaryButton.mock';
export * as Stories from './PrimaryButton.stories';
export { default } from './PrimaryButton.vue';
```

## Usage Examples

### 🔹 Create Atom

```bash
storytype generate atomos Button
```

**Result:**

```
Generating atomos component: Button
✓ Component generated successfully!

Created files:
  - src/components/atomos/button/Button.vue
  - src/components/atomos/button/Button.types.ts
  - src/components/atomos/button/Button.stories.ts
  - src/components/atomos/button/Button.mock.ts
  - src/components/atomos/button/index.ts
```

### 🔸 Create Molecule

```bash
storytype generate moleculas SearchBar
```

**Generated story:**

```typescript
title: '02 - Molecules/SearchBar',
```

### 🔷 Create Organism

```bash
storytype generate organismos Header
```

**Generated story:**

```typescript
title: '03 - Organisms/Header',
```

## Template Customization

Templates used by `generate` are Handlebars (.hbs) files that you can customize.

### Template Location

```
node_modules/storytype/dist/templates/component/
├── component.vue.hbs
├── types.ts.hbs
├── stories.ts.hbs
├── mock.ts.hbs
└── index.ts.hbs
```

### Available Handlebars Helpers

| Helper                 | Description           | Example        |
| ---------------------- | --------------------- | -------------- |
| `{{pascalCase name}}`  | Convert to PascalCase | `UserProfile`  |
| `{{kebabCase name}}`   | Convert to kebab-case | `user-profile` |
| `{{eq type "atomos"}}` | Compare values        | `true/false`   |

## Naming Conventions

### ✅ Good Names

- `Button`, `PrimaryButton`
- `Input`, `InputText`
- `Card`, `CardAvatar`
- `Header`, `HeaderMain`

### ❌ Avoid

- `button` → Use `Button`
- `btn` → Use `Button`
- `MyComponent` → Be specific
- `Component1` → Meaningless

## Recommended Workflow

### 1️⃣ Create Component

```bash
storytype generate atomos Button
```

### 2️⃣ Implement Logic

Edit generated files:

- Add props in `.types.ts`
- Implement logic in `.vue`
- Configure mock data in `.mock.ts`

### 3️⃣ Create Stories

Add variations in `.stories.ts`:

```typescript
export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
```

### 4️⃣ Write Tests

Implement tests in `.spec.ts`:

```typescript
describe('Button', () => {
  it('should emit click event', async () => {
    const wrapper = mount(Button);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });
});
```

## Next Steps

After generating component:

1. ✏️ **Implement** - Add logic and styles
2. 📖 **Document** - Complete stories
3. ✅ **Test** - Write unit tests
4. 🔍 **Validate** - [`storytype analyze`](./analyze.md)

---

- 🔍 [See all CLI commands](./index.md)
- 📊 [Analyze components with `analyze`](./analyze.md)
- ⚙️ [Normalize structure with `normalize`](./normalize.md)
