# devix-vue-components

**Padrão de Desenvolvimento de Componentes Vue 3 com TypeScript**

> 📖 **Especificação completa:** [devix-vue-components-spec.md](./devix-vue-components-spec.md)

---

## 🎯 Visão Rápida

O **devix-vue-components** é um padrão arquitetural para criar componentes Vue 3 escaláveis, testáveis e manuteníveis, usando:

- ✅ **Vue 3** com Composition API (`<script setup>`)
- ✅ **TypeScript** strict mode
- ✅ **Atomic Design** (atomos, moleculas, organismos, templates)
- ✅ **Container/Presentation** pattern
- ✅ **Storybook** para documentação visual
- ✅ **BEM** para CSS

---

## 📁 Estrutura de Componente

```
src/components/atomos/avatar/
├── Avatar.vue              # Componente Vue
├── Avatar.types.ts         # Tipos TypeScript
├── Avatar.mock.ts          # Dados de exemplo
├── Avatar.stories.ts       # Stories Storybook
└── index.ts                # Barrel export
```

---

## 🏗️ Camadas (Atomic Design)

| Camada       | Descrição                       | Exemplos                     |
| ------------ | ------------------------------- | ---------------------------- |
| `atomos`     | Elementos mínimos, indivisíveis | Button, Icon, Badge          |
| `moleculas`  | 2+ átomos com lógica simples    | FormField, SearchBar         |
| `organismos` | Componentes complexos           | Modal, DataTable             |
| `templates`  | Estruturas de página (Screens)  | LoginScreen, DashboardScreen |
| **`pages`**  | **Containers com lógica**       | **PageLogin, PageDashboard** |

> **⚠️ Todos os componentes têm stories** — Pages, Screens, Organisms, Molecules e Atoms.

---

## ⚡ Início Rápido

### 1. Criar `.types.ts`

```typescript
export interface AvatarType {
  props: AvatarProps;
}

export interface AvatarProps {
  readonly src: string;
  readonly alt: string;
  readonly size?: 'sm' | 'md' | 'lg';
}
```

### 2. Criar `.vue`

```vue
<template>
  <img :class="avatarClass" :src="src" :alt="alt" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AvatarProps } from './Avatar.types';

const props = withDefaults(defineProps<AvatarProps>(), {
  size: 'md',
});

const avatarClass = computed(() => ['avatar', `avatar--${props.size}`]);
</script>

<style scoped lang="scss">
.avatar {
  border-radius: 50%;
  object-fit: cover;

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

### 3. Criar `.mock.ts`

```typescript
import type { AvatarProps } from './Avatar.types';

export const mockAvatarDefault: AvatarProps = {
  src: 'https://i.pravatar.cc/150?img=1',
  alt: 'João Silva',
  size: 'md',
};

export const mockAvatarLarge: AvatarProps = {
  src: 'https://i.pravatar.cc/150?img=2',
  alt: 'Maria Santos',
  size: 'lg',
};
```

### 4. Criar `.stories.ts`

```typescript
import type { Meta, StoryObj } from '@storybook/vue3';
import Avatar from './Avatar.vue';
import { mockAvatarDefault, mockAvatarLarge } from './Avatar.mock';

const meta = {
  title: 'Atomos/Avatar',
  component: Avatar,
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockAvatarDefault,
};

export const Large: Story = {
  args: mockAvatarLarge,
};
```

### 5. Criar `index.ts`

```typescript
export { default } from './Avatar.vue';
export { default as Avatar } from './Avatar.vue';
export type * from './Avatar.types';
export * from './Avatar.mock';
```

### 6. Stories Avançadas (Play Functions e Estados)

```typescript
import { expect, userEvent, within } from '@storybook/test';

// Play function para testar interatividade
export const ComInteracao: Story = {
  args: mockAvatarDefault,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verificar renderização', async () => {
      const img = canvas.getByRole('img');
      await expect(img).toBeInTheDocument();
    });
  },
};

// Todos os estados do componente
export const TodosEstados: Story = {
  render: () => ({
    components: { Avatar },
    setup() {
      return {
        estados: [
          { nome: 'Small', props: { ...mockAvatarDefault, size: 'sm' } },
          { nome: 'Medium', props: mockAvatarDefault },
          { nome: 'Large', props: mockAvatarLarge },
        ],
      };
    },
    template: `
      <div style="display: flex; gap: 16px; align-items: center;">
        <div v-for="estado in estados" :key="estado.nome" style="text-align: center;">
          <Avatar v-bind="estado.props" />
          <p style="margin-top: 8px; font-size: 12px;">{{ estado.nome }}</p>
        </div>
      </div>
    `,
  }),
};

// Responsividade (quando aplicável)
export const Responsivo: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args };
    },
    template: `
      <div style="display: grid; gap: 24px;">
        <div style="width: 375px; border: 1px solid #ccc; padding: 16px;">
          <h4>Mobile (375px)</h4>
          <Avatar v-bind="args" />
        </div>
        <div style="width: 768px; border: 1px solid #ccc; padding: 16px;">
          <h4>Tablet (768px)</h4>
          <Avatar v-bind="args" />
        </div>
      </div>
    `,
  }),
  args: mockAvatarDefault,
};
```

---

## 🚫 Regras de Ouro

### Componentes (atoms, molecules, organisms, templates)

- ✅ **USAR**: `props`, `emits`, `v-model`
- ❌ **NÃO USAR**: Pinia stores
- ❌ **NÃO USAR**: vue-router
- ❌ **NÃO USAR**: Chamadas de API
- 🎯 **Objetivo**: Componentes puros, testáveis e reutilizáveis

### Pages (containers)

- ✅ **PODEM**: Usar Pinia stores
- ✅ **PODEM**: Usar vue-router
- ✅ **PODEM**: Fazer chamadas de API
- ✅ **PODEM**: Personalizar marcas (logos, temas)
- ⚠️ **DEVEM**: Renderizar **APENAS UM** componente Screen no template
- ✅ **TÊM**: Stories no Storybook (com mocks de stores/router)
- 🎯 **Objetivo**: Orquestração e integração

### Storybook (obrigatório)

- ✅ **Play functions** para testar interatividade
- ✅ **Diferentes estados** (default, loading, error, empty, disabled)
- ✅ **Demonstração responsiva** (quando aplicável)
- ✅ **Mock de composables** em stories de templates
- 🎯 **Objetivo**: Documentação viva e testes de interação

---

## 🎭 Padrão Container/Presentation

### Container (Page)

```vue
<!-- pages/auth/PageLogin.vue -->
<template>
  <LoginScreen
    v-model:email="email"
    v-model:password="password"
    :loading="loading"
    @submit="handleLogin"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { LoginScreen } from 'components/templates/LoginScreen';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  await authStore.login({ email: email.value, password: password.value });
  router.push('/dashboard');
  loading.value = false;
}
</script>
```

### Presentation (Screen)

```vue
<!-- components/templates/LoginScreen/LoginScreen.vue -->
<template>
  <q-page>
    <q-form @submit.prevent="emit('submit')">
      <q-input
        :model-value="email"
        @update:model-value="emit('update:email', $event)"
      />
      <q-input
        :model-value="password"
        type="password"
        @update:model-value="emit('update:password', $event)"
      />
      <q-btn type="submit" :loading="loading">Entrar</q-btn>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import type { LoginScreenProps, LoginScreenEmits } from './LoginScreen.types';

defineProps<LoginScreenProps>();
const emit = defineEmits<LoginScreenEmits>();
</script>
```

### Stories de Page (com mocks)

```typescript
// pages/auth/PageLogin/PageLogin.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, within } from '@storybook/test';
import { vi } from 'vitest';
import PageLogin from './PageLogin.vue';

// Mock de stores e router
const mockAuthStore = {
  login: vi.fn().mockResolvedValue({ success: true }),
  isAuthenticated: ref(false),
};

const mockRouter = {
  push: vi.fn(),
};

const meta = {
  title: 'Pages/PageLogin',
  component: PageLogin,
  decorators: [
    (story) => ({
      components: { story },
      setup() {
        provide('authStore', mockAuthStore);
        provide('router', mockRouter);
        return {};
      },
      template: '<story />',
    }),
  ],
} satisfies Meta<typeof PageLogin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Testar fluxo de login', async () => {
      const emailInput = canvas.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'usuario@exemplo.com');

      const submitButton = canvas.getByRole('button', { name: /entrar/i });
      await userEvent.click(submitButton);

      expect(mockAuthStore.login).toHaveBeenCalled();
    });
  },
};
```

---

## ✅ Checklist de PR

Antes de criar PR, verifique:

- [ ] Pasta em `PascalCase` na camada correta
- [ ] `.types.ts` com interfaces Props/Emits
- [ ] `.vue` usa `<script setup lang="ts">`
- [ ] `.mock.ts` com 3+ variações
- [ ] `.stories.ts` com Default + variações
- [ ] **Play functions** para componentes interativos
- [ ] **Diferentes estados** documentados (loading, error, empty, disabled)
- [ ] **Responsividade** testada (quando aplicável)
- [ ] **Composables mockados** em stories de templates
- [ ] `index.ts` exporta tudo (exceto stories)
- [ ] Sem stores/rotas no componente
- [ ] BEM nos estilos
- [ ] Componente funciona no Storybook
- [ ] Zero erros TypeScript/ESLint
- [ ] Sem `any` ou `@ts-ignore`

---

## 📚 Documentação Completa

Para informações detalhadas sobre:

- Estrutura completa de arquivos
- Templates completos de código
- Convenções de nomenclatura
- Padrões de TypeScript
- Configuração de Storybook
- Estratégias de migração
- Exemplos práticos completos

👉 Consulte a [Especificação Completa](./devix-vue-components-spec.md)

---

## 🛠️ Scripts

```bash
# Desenvolvimento
pnpm dev

# Storybook
pnpm storybook

# Testes
pnpm test
pnpm test:ui

# Linting
pnpm lint
pnpm lint:fix

# Type checking
pnpm type-check
```

---

## 📦 Tecnologias

- **Vue 3.5+** — Framework progressivo
- **TypeScript 5+** — Tipagem estática
- **Quasar 2+** — Framework de componentes
- **Storybook 10+** — Documentação visual
- **Vitest 3+** — Testes unitários
- **SCSS** — Pré-processador CSS

---

## 🎓 Aprendizado

### Projetos de Referência

- **coworking-ui**: 11 páginas, 44 screens, 91+ stories
- **organiza-ai**: Gerador plop com templates

### Links Úteis

- [Vue 3 Docs](https://vuejs.org/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Quasar Docs](https://quasar.dev/)
- [Storybook Docs](https://storybook.js.org/)
- [Atomic Design](https://atomicdesign.bradfrost.com/)

---

## 📝 Licença

Este padrão pode ser livremente usado e adaptado para projetos internos.

---

**devix-vue-components v1.0**
Criado por Sidarta Veloso
Março 2026
