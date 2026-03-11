# Especificação storytype v1.0

**Padrão de Desenvolvimento de Componentes Vue 3 com TypeScript**

---

## 📋 Índice

1. [Introdução](#1-introdução)
2. [Princípios Fundamentais](#2-princípios-fundamentais)
3. [Arquitetura e Organização](#3-arquitetura-e-organização)
4. [Atomic Design](#4-atomic-design)
5. [Estrutura de Arquivos](#5-estrutura-de-arquivos)
6. [Convenções de Nomenclatura](#6-convenções-de-nomenclatura)
7. [Padrões de Código](#7-padrões-de-código)
8. [Padrão Container/Presentation](#8-padrão-containerpresentation)
9. [Storybook e Documentação](#9-storybook-e-documentação)
10. [Regras e Validações](#10-regras-e-validações)
11. [Fluxo de Trabalho](#11-fluxo-de-trabalho)
12. [Exemplos Práticos](#12-exemplos-práticos)
13. [Referências](#13-referências)

---

## 1. Introdução

### 1.1 Visão Geral

O **storytype** é um padrão de arquitetura e desenvolvimento para componentes Vue 3 com TypeScript, focado em criar sistemas de design escaláveis, testáveis e de fácil manutenção.

Este padrão foi desenvolvido com base nas melhores práticas de projetos como **coworking-ui** e **organiza-ai**, consolidando aprendizados e convenções bem-sucedidas.

### 1.2 Objetivos

- **Testabilidade**: Componentes isolados e testáveis via Storybook
- **Reusabilidade**: Componentes puros e desacoplados de lógica de negócio
- **Manutenibilidade**: Separação clara de responsabilidades
- **Documentação**: Stories servem como documentação visual e interativa
- **TypeScript First**: Tipos explícitos e inferência automática
- **Performance**: Facilita otimizações e lazy loading
- **Consistência**: Padrões uniformes em toda a base de código

### 1.3 Stack Tecnológica

- **Vue 3.5+** com Composition API (`<script setup>`)
- **TypeScript 5+** com strict mode
- **Quasar 2+** como framework de componentes
- **Storybook 10+** para documentação e desenvolvimento isolado
- **Vitest 3+** para testes unitários
- **SCSS** com metodologia BEM

---

## 2. Princípios Fundamentais

### 2.1 Separação de Responsabilidades

**Componentes puros** (atoms, molecules, organisms):

- ✅ Usam apenas `props`, `emits` e `v-model`
- ❌ Não acessam stores (Pinia)
- ❌ Não usam rotas (vue-router)
- ❌ Não fazem chamadas de API
- 🎯 **Objetivo**: Componentes reutilizáveis e testáveis

**Pages** (containers):

- ✅ Podem usar stores e rotas
- ✅ Contêm lógica de negócio
- ✅ Buscam dados de APIs
- ✅ Delegam apresentação para Screens
- 🎯 **Objetivo**: Orquestração e integração

### 2.2 Composição sobre Herança

Componentes são construídos através de composição, não herança. Use composables (`use*`) para compartilhar lógica entre componentes.

### 2.3 Tipagem Explícita

Todo contrato de componente (props, emits, slots) deve ser explicitamente tipado em arquivos `.types.ts` separados.

### 2.4 Documentação Viva

Storybook não é opcional — é parte integral do desenvolvimento. Cada componente deve ter stories que demonstrem todos os seus estados e variações.

---

## 3. Arquitetura e Organização

### 3.1 Estrutura de Diretórios

```
src/
├── components/
│   ├── atomos/           # Componentes atômicos
│   ├── moleculas/        # Componentes moleculares
│   ├── organismos/       # Componentes complexos
│   └── templates/        # Templates de página (Screens)
├── pages/                # Páginas (Containers)
│   ├── auth/
│   │   ├── PageLogin.vue
│   │   └── PageCadastro.vue
│   └── dashboard/
│       └── PageDashboard.vue
├── layouts/              # Layouts de aplicação
├── store/                # Gerenciamento de estado (Pinia)
├── api/                  # Clientes de API
├── services/             # Serviços compartilhados
├── utils/                # Utilitários
└── composables/          # Lógica reutilizável
```

### 3.2 Organização de Componentes

Cada componente vive em sua própria pasta com nome em **PascalCase**:

```
src/components/atomos/Avatar/
├── Avatar.vue              # Componente Vue
├── Avatar.types.ts         # Definições de tipos
├── Avatar.mock.ts          # Dados mock
├── Avatar.stories.ts       # Stories Storybook
└── index.ts                # Barrel export
```

### 3.3 Colocalização

Arquivos relacionados devem ficar próximos. Testes, tipos e stories ficam ao lado do componente, não em pastas separadas.

---

## 4. Atomic Design

### 4.1 Camadas

O padrão utiliza Atomic Design com nomenclatura em **Português Brasileiro**:

| Camada       | Inglês    | Descrição                                      | Exemplos                       |
| ------------ | --------- | ---------------------------------------------- | ------------------------------ |
| `atomos`     | atoms     | Elementos mínimos, sem dependências internas   | Button, Icon, Badge, Avatar    |
| `moleculas`  | molecules | Combinação de 2+ átomos com lógica simples     | FormField, CardItem, SearchBar |
| `organismos` | organisms | Componentes complexos com lógica de domínio    | Modal, DataTable, FileUploader |
| `templates`  | templates | Estruturas de página sem dados reais (Screens) | LoginScreen, DashboardScreen   |

### 4.2 Definições Detalhadas

#### Átomos

- Menor unidade de UI
- Sem dependências de outros componentes do projeto
- Podem usar componentes de bibliotecas externas (Quasar)
- Exemplos: `Avatar`, `CustomBadge`, `IconTopic`, `DialogoAlerta`

#### Moléculas

- Combinam 2 ou mais átomos
- Lógica simples de apresentação
- Ainda são genéricos e reutilizáveis
- Exemplos: `DateInput`, `ItemBuscaUsuario`, `ListaRadio`

#### Organismos

- Componentes complexos com lógica de domínio
- Combinam moléculas e átomos
- Podem ter estado interno complexo
- Exemplos: `UploadCropImagem`, `DataTable`, `FormWizard`

#### Templates (Screens)

- Estruturas completas de página
- Apenas apresentação, sem lógica de negócio
- Recebem todos os dados via props
- Usados por Pages (containers)
- Em stories, usar mocks de composables quando necessário

#### Pages (Páginas/Containers)

**Localização:** `src/pages/` (fora da pasta components)

**Características:**

- ✅ **PODEM** usar gerenciadores de estado (Pinia stores)
- ✅ **PODEM** usar rotas (vue-router)
- ✅ **PODEM** fazer chamadas de API
- ✅ **PODEM** acessar localStorage/sessionStorage
- ✅ **PODEM** usar composables com lógica de negócio
- ✅ **PODEM** ter personalização de marca (logos, temas)
- ✅ **DEVEM** conter lógica de negócio e orquestração
- ⚠️ **DEVEM** renderizar **APENAS UM** componente Screen no template
- ✅ **TÊM** stories no Storybook (como todos os componentes)
- 🎯 **Responsabilidade:** Integração, dados e lógica de negócio

**Estrutura:**

```vue
<!-- src/pages/auth/PageLogin.vue -->
<template>
  <!-- ✅ CORRETO: Apenas um componente Screen -->
  <LoginScreen v-model:email="email" :loading="loading" @submit="handleLogin" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // ✅ Permitido em Pages
import { useAuthStore } from 'stores/auth'; // ✅ Permitido em Pages
import { LoginScreen } from 'components/templates/LoginScreen';

const router = useRouter();
const authStore = useAuthStore();
const email = ref('');
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  await authStore.login({ email: email.value });
  router.push('/dashboard');
  loading.value = false;
}
</script>
```

**Stories de Pages:**
Pages têm stories no Storybook para documentar os fluxos completos e integração.
Nas stories de Pages, mock stores e composables para isolar a lógica de negócio.

### 4.3 Decisão de Camada

Use este fluxograma para decidir a camada:

```
É uma página? → SIM → templates/ (Screen)
                ↓ NÃO
Combina outros componentes do projeto?
                ↓ NÃO → atomos/
                ↓ SIM
Tem lógica de domínio complexa?
                ↓ SIM → organismos/
                ↓ NÃO → moleculas/
```

---

## 5. Estrutura de Arquivos

### 5.1 Arquivos Obrigatórios

Todo componente **DEVE** ter:

1. **`ComponentName.vue`** — Componente Vue
2. **`ComponentName.types.ts`** — Definições TypeScript
3. **`ComponentName.stories.ts`** — Stories Storybook
4. **`index.ts`** — Barrel export

### 5.2 Arquivos Opcionais

- **`ComponentName.mock.ts`** — Dados mock para stories/testes
- **`ComponentName.spec.ts`** — Testes unitários (quando lógica complexa)
- **`ComponentName.scss`** — Estilos externos (para estilos muito grandes)

### 5.3 Template de `*.types.ts`

```typescript
/**
 * Tipo agregado do componente
 * Usado em mocks e stories para agrupar props e emits
 */
export interface ComponentNameType {
  props: ComponentNameProps;
  emits: ComponentNameEmits;
}

/**
 * Props do componente ComponentName
 */
export interface ComponentNameProps {
  /**
   * Título principal do componente
   */
  readonly title: string;

  /**
   * Subtítulo opcional
   */
  readonly subtitle?: string;

  /**
   * Desabilita interações
   * @default false
   */
  readonly disabled?: boolean;

  /**
   * Variante visual
   * @default 'primary'
   */
  readonly variant?: 'primary' | 'secondary' | 'danger';
}

/**
 * Eventos emitidos pelo componente
 */
export interface ComponentNameEmits {
  /**
   * Emitido quando o usuário clica no componente
   */
  (e: 'click', payload: MouseEvent): void;

  /**
   * Atualiza o valor do v-model
   */
  (e: 'update:modelValue', value: string): void;
}

/**
 * Slots do componente (quando aplicável)
 */
export interface ComponentNameSlots {
  /**
   * Conteúdo principal
   */
  default(props: { value: string }): unknown;

  /**
   * Cabeçalho customizado
   */
  header?(): unknown;
}
```

**Regras:**

- Todas as interfaces são exportadas
- Props são `readonly` (nunca mutadas diretamente)
- JSDoc em todas as propriedades e eventos
- `@default` para valores padrão
- Tipo agregado `*Type` para facilitar composição

### 5.4 Template de `*.vue`

```vue
<template>
  <div :class="componentClass">
    <h3 v-if="title" class="component-name__title">
      {{ title }}
    </h3>
    <p v-if="subtitle" class="component-name__subtitle">
      {{ subtitle }}
    </p>
    <slot name="content" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ComponentNameProps, ComponentNameEmits } from './ComponentName.types';

const props = withDefaults(defineProps<ComponentNameProps>(), {
  variant: 'primary',
  disabled: false,
});

const emit = defineEmits<ComponentNameEmits>();

defineSlots<{
  content(): unknown;
}>();

// Computed properties
const componentClass = computed(() => [
  'component-name',
  `component-name--${props.variant}`,
  { 'component-name--disabled': props.disabled },
]);

// Methods
function handleClick(event: MouseEvent) {
  if (props.disabled) return;
  emit('click', event);
}
</script>

<style scoped lang="scss">
/**
 * BEM (Block Element Modifier)
 * .bloco
 * .bloco__elemento
 * .bloco--modificador
 */
.component-name {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__title {
    font-size: 1.2rem;
    font-weight: 600;
  }

  &__subtitle {
    font-size: 0.9rem;
    color: var(--q-color-grey-7);
  }

  &--primary {
    background-color: var(--q-color-primary);
  }

  &--secondary {
    background-color: var(--q-color-secondary);
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
```

**Regras:**

- `<script setup lang="ts">` obrigatório (Composition API)
- `defineProps<Type>()` + `withDefaults()` para defaults
- `defineEmits<Type>()` com tipagem completa
- `defineSlots<Type>()` quando usar slots
- `<style scoped lang="scss">` com BEM
- Computed properties para classes dinâmicas
- Methods para handlers de eventos

### 5.5 Template de `*.mock.ts`

```typescript
import type { ComponentNameProps, ComponentNameType } from './ComponentName.types';

/**
 * Mock do estado padrão
 */
export const mockComponentNameDefault: ComponentNameProps = {
  title: 'Título de exemplo',
  subtitle: 'Subtítulo descritivo',
  variant: 'primary',
  disabled: false,
};

/**
 * Mock da variante secundária
 */
export const mockComponentNameSecondary: ComponentNameProps = {
  title: 'Ação secundária',
  variant: 'secondary',
};

/**
 * Mock do estado desabilitado
 */
export const mockComponentNameDisabled: ComponentNameProps = {
  title: 'Desabilitado',
  variant: 'primary',
  disabled: true,
};

/**
 * Mock do estado de erro/perigo
 */
export const mockComponentNameDanger: ComponentNameProps = {
  title: 'Excluir item',
  subtitle: 'Esta ação não pode ser desfeita',
  variant: 'danger',
};

/**
 * Função geradora de mock completo (props + emits)
 */
export function generateMockComponentName(): ComponentNameType {
  return {
    props: mockComponentNameDefault,
    emits: {},
  } satisfies ComponentNameType as ComponentNameType;
}

/**
 * Lista de todos os mocks disponíveis
 * Útil para criar stories de comparação
 */
export const allComponentNameMocks = [
  mockComponentNameDefault,
  mockComponentNameSecondary,
  mockComponentNameDisabled,
  mockComponentNameDanger,
] as const;
```

**Regras:**

- Um `const mock*` por variação visual ou estado
- Nomes descritivos: `mockAvatarTemaLight`, `mockAvatarSemImagem`
- Dados realistas — evite `"foo"`, `"bar"`, `"teste123"`
- JSDoc descrevendo o que o mock representa
- Função geradora quando componente tem props + emits
- Array `all*Mocks` para facilitar stories de comparação

### 5.6 Template de `*.stories.ts`

```typescript
import type { Meta, StoryObj } from '@storybook/vue3';
import ComponentName from './ComponentName.vue';
import {
  mockComponentNameDefault,
  mockComponentNameSecondary,
  mockComponentNameDisabled,
  mockComponentNameDanger,
  allComponentNameMocks,
} from './ComponentName.mock';

/**
 * ComponentName — Descrição resumida do componente
 *
 * Descrição detalhada de quando e como usar este componente.
 * Pode incluir múltiplas linhas com exemplos de uso.
 */
const meta = {
  title: 'Atomos/ComponentName', // Camada/NomeComponente
  component: ComponentName,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Título principal do componente',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '-' },
      },
    },
    subtitle: {
      control: 'text',
      description: 'Subtítulo opcional',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
      description: 'Variante visual do componente',
      table: {
        type: { summary: "'primary' | 'secondary' | 'danger'" },
        defaultValue: { summary: "'primary'" },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Desabilita todas as interações',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    // Eventos
    onClick: {
      description: 'Emitido quando o usuário clica',
      table: {
        category: 'Events',
        type: { summary: '(event: MouseEvent) => void' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Documentação adicional do componente em Markdown.',
      },
    },
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado padrão do componente
 */
export const Default: Story = {
  args: mockComponentNameDefault,
} satisfies Story;

/**
 * Variante secundária para ações alternativas
 */
export const Secondary: Story = {
  args: mockComponentNameSecondary,
} satisfies Story;

/**
 * Estado desabilitado
 */
export const Disabled: Story = {
  args: mockComponentNameDisabled,
} satisfies Story;

/**
 * Variante de perigo para ações destrutivas
 */
export const Danger: Story = {
  args: mockComponentNameDanger,
} satisfies Story;

/**
 * Comparação de todas as variantes lado a lado
 */
export const Variantes: Story = {
  render: () => ({
    components: { ComponentName },
    setup() {
      return { mocks: allComponentNameMocks };
    },
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap; padding: 16px;">
        <ComponentName
          v-for="(mock, index) in mocks"
          :key="index"
          v-bind="mock"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Visualização de todas as variantes disponíveis.',
      },
    },
  },
} satisfies Story;

/**
 * Teste de responsividade em viewport mobile
 */
export const Mobile: Story = {
  args: mockComponentNameDefault,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
} satisfies Story;

/**
 * Exemplo com slot customizado
 */
export const ComSlotCustomizado: Story = {
  render: args => ({
    components: { ComponentName },
    setup() {
      return { args };
    },
    template: `
      <ComponentName v-bind="args">
        <template #content>
          <p style="color: red;">Conteúdo personalizado via slot</p>
        </template>
      </ComponentName>
    `,
  }),
  args: mockComponentNameDefault,
} satisfies Story;

/**
 * Teste de interação com play function
 *
 * ⚠️ IMPORTANTE: Toda story deve ter play function quando houver interatividade
 */
export const Interativo: Story = {
  args: mockComponentNameDefault,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verificar renderização inicial', async () => {
      const element = canvas.getByRole('button', { name: /exemplo/i });
      await expect(element).toBeInTheDocument();
    });

    await step('Interagir com o componente', async () => {
      const button = canvas.getByRole('button');
      await userEvent.click(button);
      // Verificar mudanças esperadas após interação
    });
  },
} satisfies Story;

/**
 * Todos os estados do componente (documentação visual)
 *
 * ⚠️ IMPORTANTE: Demonstrar todos os estados possíveis do componente
 */
export const TodosEstados: Story = {
  render: () => ({
    components: { ComponentName },
    setup() {
      return {
        estados: [
          { nome: 'Default', props: mockComponentNameDefault },
          {
            nome: 'Loading',
            props: { ...mockComponentNameDefault, loading: true },
          },
          {
            nome: 'Error',
            props: { ...mockComponentNameDefault, error: 'Erro de exemplo' },
          },
          { nome: 'Empty', props: { ...mockComponentNameDefault, items: [] } },
          {
            nome: 'Disabled',
            props: { ...mockComponentNameDefault, disabled: true },
          },
        ],
      };
    },
    template: `
      <div style="display: grid; gap: 24px;">
        <div v-for="estado in estados" :key="estado.nome" style="padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h3 style="margin: 0 0 12px 0; color: #666;">{{ estado.nome }}</h3>
          <ComponentName v-bind="estado.props" />
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Visualização de todos os estados possíveis do componente para documentação.',
      },
    },
  },
} satisfies Story;
```

**Regras:**

- `title` reflete a camada Atomic Design
- `tags: ['autodocs']` obrigatório
- `satisfies Meta<typeof Component>` e `satisfies Story`
- JSDoc em cada story
- Story `Default` sempre presente
- Story `Variantes` para comparação
- Story `Mobile` para responsividade
- `argTypes` com descrições e controles apropriados
- Categorizar eventos em `category: 'Events'`

### 5.7 Template de `index.ts`

```typescript
/**
 * ComponentName — Descrição breve do componente
 * @module components/atomos/ComponentName
 */

// Default export
export { default } from './ComponentName.vue';
export { default as ComponentName } from './ComponentName.vue';

// Tipos
export type {
  ComponentNameProps,
  ComponentNameEmits,
  ComponentNameSlots,
  ComponentNameType,
} from './ComponentName.types';

// Mocks (útil para testes)
export {
  mockComponentNameDefault,
  mockComponentNameSecondary,
  mockComponentNameDisabled,
  mockComponentNameDanger,
  allComponentNameMocks,
  generateMockComponentName,
} from './ComponentName.mock';

// ⚠️ NÃO exportar stories — evita vazamento de código de dev no bundle
// export * from './ComponentName.stories';
```

**Regras:**

- Export default + named export do componente
- Export de todos os tipos
- Export de todos os mocks
- **NUNCA** exportar stories
- JSDoc com `@module` para documentação

---

## 6. Convenções de Nomenclatura

### 6.1 Componentes

- **PascalCase** para nomes de componentes: `Avatar`, `CardAtividade`
- **PascalCase** para nomes de arquivos: `Avatar.vue`, `CardAtividade.types.ts`
- **kebab-case** em templates: `<avatar />`, `<card-atividade />`

### 6.2 Pastas

- **PascalCase** para pastas de componentes: `Avatar/`, `CardAtividade/`
- **camelCase** ou **kebab-case** para outras pastas: `composables/`, `utils/`

### 6.3 Props

- **camelCase** em TypeScript: `userName`, `isDisabled`
- **kebab-case** em templates: `:user-name="..."`, `:is-disabled="..."`

### 6.4 Eventos

- **camelCase** em código: `updateValue`, `submitForm`
- Prefixo `on` nos handlers: `onUpdateValue`, `onSubmitForm`
- Use verbos no imperativo: `click`, `submit`, `open`, `close`

### 6.5 Composables

- Prefixo `use`: `useAuth`, `useApi`, `useLocalStorage`
- **camelCase**: `useUserProfile`, `useFormValidation`

### 6.6 Stores

- Sufixo `Store`: `useAuthStore`, `useUserStore`
- **camelCase**: `useUserStore`, `useRoteiroStore`

### 6.7 Tipos

- Sufixo `Props`: `AvatarProps`, `CardAtividadeProps`
- Sufixo `Emits`: `AvatarEmits`, `CardAtividadeEmits`
- Sufixo `Slots`: `AvatarSlots`, `CardAtividadeSlots`
- Sufixo `Type`: `AvatarType`, `CardAtividadeType` (agregador)
- Interfaces em **PascalCase**: `User`, `Activity`, `Route`

### 6.8 Mocks

- Prefixo `mock`: `mockAvatarDefault`, `mockCardAtividadeLoading`
- Sufixo descritivo do estado: `*Default`, `*Loading`, `*Error`, `*Empty`
- **camelCase**: `mockUserProfileComplete`, `mockActivityListEmpty`

### 6.9 BEM (CSS)

- **Block**: `.component-name`
- **Element**: `.component-name__element`
- **Modifier**: `.component-name--modifier`
- **kebab-case** sempre: `.card-atividade__titulo--destacado`

---

## 7. Padrões de Código

### 7.1 Vue 3 Composition API

**Sempre use `<script setup>`:**

```vue
<!-- ✅ CORRETO -->
<script setup lang="ts">
import { ref, computed } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>

<!-- ❌ ERRADO (Options API) -->
<script lang="ts">
export default {
  data() {
    return { count: 0 };
  },
  computed: {
    doubled() {
      return this.count * 2;
    },
  },
};
</script>
```

### 7.2 TypeScript

**Props com withDefaults:**

```typescript
// ✅ CORRETO
const props = withDefaults(defineProps<MyComponentProps>(), {
  variant: 'primary',
  disabled: false,
});

// ❌ ERRADO (sem tipos)
const props = defineProps({
  variant: { type: String, default: 'primary' },
  disabled: { type: Boolean, default: false },
});
```

**Emits tipados:**

```typescript
// ✅ CORRETO
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'submit', payload: FormData): void;
}>();

// ❌ ERRADO (sem tipos)
const emit = defineEmits(['update:modelValue', 'submit']);
```

**Nunca use `any`:**

```typescript
// ✅ CORRETO
function handleData(data: unknown): void {
  if (typeof data === 'string') {
    console.log(data.toUpperCase());
  }
}

// ❌ ERRADO
function handleData(data: any): void {
  console.log(data.toUpperCase());
}
```

### 7.3 Reatividade

**Refs vs Reactive:**

```typescript
// ✅ Prefira refs para valores primitivos
const count = ref(0);
const name = ref('');

// ✅ Use reactive para objetos (mas refs são válidas também)
const form = reactive({
  email: '',
  password: '',
});

// ⚠️ Alternativa com refs (preferível para melhor tracking)
const email = ref('');
const password = ref('');
```

**Computed properties:**

```typescript
// ✅ CORRETO — computed para valores derivados
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

// ❌ ERRADO — não use função normal para valores derivados
function getFullName() {
  return `${firstName.value} ${lastName.value}`;
}
```

**Watch vs WatchEffect:**

```typescript
// ✅ Use watch quando precisar do valor anterior
watch(count, (newVal, oldVal) => {
  console.log(`Changed from ${oldVal} to ${newVal}`);
});

// ✅ Use watchEffect para efeitos simples
watchEffect(() => {
  console.log(`Count is ${count.value}`);
});
```

### 7.4 Composables

**Estrutura:**

```typescript
// composables/useCounter.ts
import { ref, computed } from 'vue';

/**
 * Hook para gerenciar um contador
 */
export function useCounter(initialValue = 0) {
  const count = ref(initialValue);

  const doubled = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  function reset() {
    count.value = initialValue;
  }

  return {
    // State
    count,
    doubled,
    // Actions
    increment,
    decrement,
    reset,
  };
}
```

**Uso:**

```vue
<script setup lang="ts">
import { useCounter } from 'src/composables/useCounter';

const { count, doubled, increment, decrement, reset } = useCounter(10);
</script>
```

### 7.5 Estilos

**BEM + SCSS:**

```scss
.card-atividade {
  display: flex;
  padding: 16px;
  border-radius: 8px;

  // Elementos
  &__titulo {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 8px;
  }

  &__descricao {
    font-size: 0.9rem;
    color: var(--q-color-grey-7);
  }

  &__icone {
    width: 24px;
    height: 24px;
    margin-right: 12px;
  }

  // Modificadores
  &--destacado {
    background-color: var(--q-color-primary-light);
    border: 2px solid var(--q-color-primary);
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  // Estados
  &.is-loading {
    animation: pulse 1.5s infinite;
  }

  &:hover:not(&--disabled) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
```

**Variáveis Quasar:**

```scss
// ✅ Use variáveis CSS do Quasar
.component {
  color: var(--q-color-primary);
  background: var(--q-color-grey-1);
}

// ❌ Não use cores hardcoded
.component {
  color: #1976d2;
  background: #f5f5f5;
}
```

---

## 8. Padrão Container/Presentation

### 8.1 Conceito

O padrão **Container/Presentation** (também chamado Smart/Dumb Components) separa:

- **Containers (Pages)**: Lógica, dados, stores, rotas
- **Presentation (Screens)**: UI, props, emits, visual

### 8.2 Estrutura

```
src/
├── pages/
│   └── auth/
│       └── PageLogin.vue          # Container
└── components/
    └── templates/
        └── LoginScreen/           # Presentation
            ├── LoginScreen.vue
            ├── LoginScreen.types.ts
            ├── LoginScreen.mock.ts
            ├── LoginScreen.stories.ts
            └── index.ts
```

### 8.3 Container (Page)

**Responsabilidades:**

- Buscar dados (API, stores)
- Gerenciar estado de negócio
- Navegar entre rotas
- Tratar erros globais
- Renderizar Screen

**Exemplo:**

```vue
<!-- src/pages/auth/PageLogin.vue -->
<template>
  <LoginScreen
    v-model:email="email"
    v-model:password="password"
    :loading="loading"
    :error-message="errorMessage"
    @submit="handleLogin"
    @forgot-password="handleForgotPassword"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/store/auth';
import { LoginScreen } from 'src/components/templates/LoginScreen';

const router = useRouter();
const authStore = useAuthStore();

// State
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

// Handlers
async function handleLogin() {
  loading.value = true;
  errorMessage.value = '';

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    });
    router.push('/dashboard');
  } catch (error) {
    errorMessage.value = 'Credenciais inválidas';
  } finally {
    loading.value = false;
  }
}

function handleForgotPassword() {
  router.push('/auth/recuperar-senha');
}
</script>
```

### 8.4 Presentation (Screen)

**Responsabilidades:**

- Renderizar UI
- Emitir eventos de interação
- Validação de UI (não de negócio)
- Acessibilidade

**Exemplo:**

```vue
<!-- src/components/templates/LoginScreen/LoginScreen.vue -->
<template>
  <q-page class="login-screen">
    <q-form class="login-screen__form" @submit.prevent="emit('submit')">
      <h1 class="login-screen__titulo">Login</h1>

      <q-input
        :model-value="email"
        label="Email"
        type="email"
        :disable="loading"
        @update:model-value="emit('update:email', $event)"
      />

      <q-input
        :model-value="password"
        label="Senha"
        type="password"
        :disable="loading"
        @update:model-value="emit('update:password', $event)"
      />

      <p v-if="errorMessage" class="login-screen__erro">
        {{ errorMessage }}
      </p>

      <div class="login-screen__acoes">
        <q-btn type="submit" label="Entrar" color="primary" :loading="loading" />

        <q-btn flat label="Esqueci minha senha" @click="emit('forgotPassword')" />
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import type { LoginScreenProps, LoginScreenEmits } from './LoginScreen.types';

const props = withDefaults(defineProps<LoginScreenProps>(), {
  errorMessage: '',
  loading: false,
});

const emit = defineEmits<LoginScreenEmits>();
</script>
```

**Tipos:**

```typescript
// LoginScreen.types.ts
export interface LoginScreenProps {
  readonly email: string;
  readonly password: string;
  readonly loading?: boolean;
  readonly errorMessage?: string;
}

export interface LoginScreenEmits {
  (e: 'update:email', value: string): void;
  (e: 'update:password', value: string): void;
  (e: 'submit'): void;
  (e: 'forgotPassword'): void;
}

export interface LoginScreenType {
  props: LoginScreenProps;
  emits: LoginScreenEmits;
}
```

### 8.5 Benefícios

1. **Testabilidade**: Screen pode ser testada sem stores/rotas
2. **Storybook**: Stories demonstram todas as variações visuais
3. **Reusabilidade**: Screen pode ser usada em diferentes contextos
4. **Manutenibilidade**: Mudanças de UI não afetam lógica de negócio
5. **Performance**: Facilita memoization e lazy loading

---

## 9. Storybook e Documentação

### 9.1 Configuração

**Arquivos de configuração:**

```
.storybook/
├── main.ts           # Configuração principal
├── preview.ts        # Decorators e parâmetros globais
└── manager.ts        # Customização da UI do Storybook
```

**main.ts:**

```typescript
import type { StorybookConfig } from '@storybook/vue3-vite';
import { mergeConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal: async config => {
    return mergeConfig(config, {
      plugins: [vue()],
      resolve: {
        alias: {
          src: '/src',
        },
      },
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: `@import "src/css/quasar.variables.scss";`,
          },
        },
      },
    });
  },
};

export default config;
```

**preview.ts:**

```typescript
import type { Preview } from '@storybook/vue3';
import { Quasar } from 'quasar';
import 'quasar/dist/quasar.css';
import '@quasar/extras/material-icons/material-icons.css';

const preview: Preview = {
  decorators: [
    story => ({
      components: { story },
      setup() {
        return { Quasar };
      },
      template: '<story />',
    }),
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    viewport: {
      viewports: {
        mobile1: {
          name: 'Small Mobile',
          styles: { width: '320px', height: '568px' },
        },
        mobile2: {
          name: 'Large Mobile',
          styles: { width: '414px', height: '896px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
      },
    },
  },
};

export default preview;
```

### 9.2 Organização de Stories

**Hierarquia:**

```
Storybook/
├── Atomos/
│   ├── Avatar
│   ├── CustomBadge
│   └── IconTopic
├── Moleculas/
│   ├── DateInput
│   └── ItemBuscaUsuario
├── Organismos/
│   └── UploadCropImagem
└── Templates/
    ├── LoginScreen
    └── DashboardScreen
└── Pages/
    ├── PageLogin
    └── PageDashboard
```

**⚠️ IMPORTANTE: Todos os componentes têm stories**

- Pages têm stories para documentar fluxos completos
- Screens têm stories para demonstrar variações visuais
- Use mocks de stores e composables em stories de Pages

### 9.3 Mock de Composables e Stores em Stories

**Quando um Screen usa composables**, mocke-os nas stories:

```typescript
// PageLogin.stories.ts (exemplo com Page)
import type { Meta, StoryObj } from '@storybook/vue3';
import PageLogin from './PageLogin.vue';
import { vi } from 'vitest';

// Mock do composable
const mockUseAuth = () => ({
  isAuthenticated: ref(false),
  login: async () => console.log('Mock login'),
  logout: async () => console.log('Mock logout'),
});

// Mock de stores
const mockAuthStore = {
  login: vi.fn().mockResolvedValue({ success: true }),
  user: ref(null),
  isAuthenticated: ref(false),
};

// Mock do router
const mockRouter = {
  push: vi.fn(),
};

const meta = {
  title: 'Pages/PageLogin',
  component: PageLogin,
  decorators: [
    story => ({
      components: { story },
      setup() {
        // Fornecer mocks de stores e router
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

/**
 * Estado padrão da página de login
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verificar renderização do formulário', async () => {
      const emailInput = canvas.getByLabelText(/email/i);
      await expect(emailInput).toBeInTheDocument();
    });
  },
};

/**
 * Fluxo de login com sucesso
 */
export const LoginComSucesso: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Preencher email', async () => {
      const emailInput = canvas.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'usuario@exemplo.com');
    });

    await step('Preencher senha', async () => {
      const passwordInput = canvas.getByLabelText(/senha/i);
      await userEvent.type(passwordInput, 'senha123');
    });

    await step('Submeter formulário', async () => {
      const submitButton = canvas.getByRole('button', { name: /entrar/i });
      await userEvent.click(submitButton);
    });

    await step('Verificar que store foi chamado', async () => {
      expect(mockAuthStore.login).toHaveBeenCalledWith({
        email: 'usuario@exemplo.com',
        password: 'senha123',
      });
    });

    await step('Verificar navegação', async () => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  },
};
```

**Alternativa com vi.mock (Vitest):**

```typescript
import { vi } from 'vitest';

// Mock do módulo
vi.mock('src/composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: ref(false),
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));
```

**Nomenclatura:**

- Primeira parte = camada Atomic Design ou Pages
- Segunda parte = nome do componente
- Exemplos: `'Atomos/Avatar'`, `'Templates/LoginScreen'`, `'Pages/PageLogin'`

### 9.4 Documentação no Storybook

**ArgTypes completos:**

```typescript
argTypes: {
  title: {
    control: 'text',
    description: 'Título principal do componente',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: '-' },
      category: 'Props',
    },
  },
  onClick: {
    description: 'Emitido quando o usuário clica',
    table: {
      type: { summary: '(event: MouseEvent) => void' },
      category: 'Events',
    },
  },
}
```

**JSDoc nas stories:**

```typescript
/**
 * Estado padrão do componente.
 * Use esta variação para casos normais sem customização.
 */
export const Default: Story = {
  args: mockAvatarDefault,
} satisfies Story;
```

**Descrições em markdown:**

```typescript
parameters: {
  docs: {
    description: {
      component: `
# Avatar

Componente para exibir foto de perfil de usuário.

## Uso

\`\`\`vue
<Avatar src="/path/to/image.jpg" alt="Nome do usuário" />
\`\`\`

## Acessibilidade

- Use sempre a prop \`alt\` com descrição adequada
- Imagens decorativas devem ter \`alt=""\`
      `,
    },
  },
}
```

### 9.5 Testes de Interação com Play Function

**⚠️ OBRIGATÓRIO:** Toda story com interatividade deve ter play function.

```typescript
import { expect } from '@storybook/test';
import { userEvent, within } from '@storybook/test';

export const TestClique: Story = {
  args: mockButtonDefault,
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Encontrar e clicar no botão', async () => {
      const button = canvas.getByRole('button');
      await userEvent.click(button);
    });

    await step('Verificar que evento foi emitido', async () => {
      expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
} satisfies Story;
```

**Exemplos de testes com play function:**

```typescript
// Teste de formulário
export const PreencherFormulario: Story = {
  args: mockFormDefault,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Preencher campo de email', async () => {
      const emailInput = canvas.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'usuario@exemplo.com');
      await expect(emailInput).toHaveValue('usuario@exemplo.com');
    });

    await step('Preencher campo de senha', async () => {
      const passwordInput = canvas.getByLabelText(/senha/i);
      await userEvent.type(passwordInput, 'senha123');
      await expect(passwordInput).toHaveValue('senha123');
    });

    await step('Submeter formulário', async () => {
      const submitButton = canvas.getByRole('button', { name: /entrar/i });
      await userEvent.click(submitButton);
    });
  },
};

// Teste de navegação
export const NavegacaoAbas: Story = {
  args: mockTabsDefault,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verificar aba inicial', async () => {
      const firstTab = canvas.getByRole('tab', { selected: true });
      await expect(firstTab).toHaveTextContent('Perfil');
    });

    await step('Navegar para segunda aba', async () => {
      const secondTab = canvas.getByRole('tab', { name: /configurações/i });
      await userEvent.click(secondTab);
      await expect(secondTab).toHaveAttribute('aria-selected', 'true');
    });
  },
};

// Teste de estado de loading
export const EstadoLoading: Story = {
  args: { ...mockButtonDefault, loading: true },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verificar que botão está desabilitado', async () => {
      const button = canvas.getByRole('button');
      await expect(button).toBeDisabled();
    });

    await step('Verificar presença de spinner', async () => {
      const spinner = canvas.getByRole('progressbar');
      await expect(spinner).toBeInTheDocument();
    });
  },
};
```

### 9.6 Demonstração de Estados e Resoluções

**⚠️ IMPORTANTE:** Docs devem mostrar:

1. **Todos os estados** possíveis do componente
2. **Diferentes resoluções** (quando houver responsividade)

**Padrão de story para estados:**

```typescript
export const TodosEstados: Story = {
  render: () => ({
    components: { ComponentName },
    setup() {
      return {
        estados: [
          { label: 'Padrão', props: mockDefault },
          { label: 'Carregando', props: mockLoading },
          { label: 'Com Erro', props: mockError },
          { label: 'Vazio', props: mockEmpty },
          { label: 'Desabilitado', props: mockDisabled },
          { label: 'Sucesso', props: mockSuccess },
        ],
      };
    },
    template: `
      <div style="display: grid; gap: 24px;">
        <div
          v-for="estado in estados"
          :key="estado.label"
          style="padding: 20px; background: #f5f5f5; border-radius: 8px;"
        >
          <h3 style="margin: 0 0 16px; font-size: 14px; color: #666;">
            {{ estado.label }}
          </h3>
          <ComponentName v-bind="estado.props" />
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Matriz completa de estados do componente.',
      },
    },
  },
};
```

**Padrão de story para resoluções:**

```typescript
export const Responsividade: Story = {
  render: args => ({
    components: { ComponentName },
    setup() {
      return {
        args,
        breakpoints: [
          { nome: 'Mobile', largura: '375px' },
          { nome: 'Tablet', largura: '768px' },
          { nome: 'Desktop', largura: '1200px' },
        ],
      };
    },
    template: `
      <div style="display: grid; gap: 32px;">
        <div v-for="bp in breakpoints" :key="bp.nome">
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #333;">
            {{ bp.nome }} ({{ bp.largura }})
          </h3>
          <div
            :style="{
              width: bp.largura,
              border: '2px solid #e0e0e0',
              padding: '16px',
              borderRadius: '8px',
              background: 'white',
            }"
          >
            <ComponentName v-bind="args" />
          </div>
        </div>
      </div>
    `,
  }),
  args: mockComponentNameDefault,
  parameters: {
    docs: {
      description: {
        story: 'Comportamento responsivo em diferentes larguras de tela.',
      },
    },
  },
};
```

---

## 10. Regras e Validações

### 10.1 Checklist de Componente

Antes de criar PR, verifique:

#### Estrutura

- [ ] Pasta em `PascalCase` dentro da camada correta
- [ ] Arquivo `.types.ts` criado
- [ ] Arquivo `.vue` criado
- [ ] Arquivo `.mock.ts` criado
- [ ] Arquivo `.stories.ts` criado
- [ ] Arquivo `index.ts` criado

#### Tipos

- [ ] Interface `*Props` definida
- [ ] Interface `*Emits` definida (se houver eventos)
- [ ] Interface `*Slots` definida (se houver slots)
- [ ] Interface `*Type` agregadora criada
- [ ] Todas as props com JSDoc
- [ ] Props com `readonly`

#### Componente Vue

- [ ] Usa `<script setup lang="ts">`
- [ ] `defineProps<Type>()` + `withDefaults()`
- [ ] `defineEmits<Type>()` tipado
- [ ] `<style scoped lang="scss">` com BEM
- [ ] Sem stores (Pinia)
- [ ] Sem rotas (vue-router)
- [ ] Sem chamadas de API

#### Mocks

- [ ] Pelo menos 3 mocks criados
- [ ] Nomes descritivos
- [ ] Dados realistas
- [ ] Função geradora (quando aplicável)

#### Stories

- [ ] `title` correto (camada + nome)
- [ ] `tags: ['autodocs']`
- [ ] Story `Default`
- [ ] Stories para cada mock
- [ ] Story `Variantes`
- [ ] Story `Mobile`
- [ ] ArgTypes documentados
- [ ] JSDoc em cada story

#### Barrel Export

- [ ] Default export do componente
- [ ] Named export do componente
- [ ] Export de tipos
- [ ] Export de mocks
- [ ] **NÃO** exporta stories

#### Qualidade

- [ ] Zero erros TypeScript
- [ ] Zero erros ESLint
- [ ] Sem `any` explícito
- [ ] Sem `@ts-ignore`
- [ ] Componente funciona no Storybook

### 10.2 Linting

**ESLint config (.eslintrc.js):**

```javascript
module.exports = {
  extends: ['plugin:vue/vue3-recommended', '@vue/typescript/recommended', 'prettier'],
  rules: {
    // Vue
    'vue/multi-word-component-names': 'error',
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/require-default-prop': 'off', // withDefaults cuida disso
    'vue/require-prop-types': 'off', // TypeScript cuida disso

    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',

    // Imports
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      },
    ],
  },
};
```

### 10.3 TypeScript

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "src/*": ["src/*"]
    }
  }
}
```

---

## 11. Fluxo de Trabalho

### 11.1 Criando um Novo Componente

1. **Decidir a camada** (átomo, molécula, organismo, template)
2. **Criar a pasta** em `src/components/[camada]/[ComponentName]/`
3. **Criar `*.types.ts`** com interfaces Props/Emits/Type
4. **Criar `*.vue`** com estrutura básica
5. **Criar `*.mock.ts`** com pelo menos 3 variações
6. **Criar `*.stories.ts`** com todas as stories
7. **Criar `index.ts`** com barrel exports
8. **Testar no Storybook**
9. **Revisar checklist**
10. **Criar PR**

### 11.2 Refatorando Componente Legado

1. **Auditar violações** (stores, rotas, tipagem)
2. **Criar `*.types.ts`** extraindo tipos inline
3. **Refatorar para `<script setup>`** se estiver em Options API
4. **Remover stores/rotas** → mover para Page
5. **Criar Screen** se for componente de página
6. **Criar mocks**
7. **Criar stories**
8. **Atualizar imports** em outros arquivos
9. **Testar no Storybook**
10. **Criar PR com checklist de refatoração**

### 11.3 Implementando Container/Presentation

1. **Identificar Page** que precisa refatoração
2. **Criar pasta Screen** em `src/components/templates/`
3. **Criar `*Screen.types.ts`** definindo contrato
4. **Criar `*Screen.vue`** movendo template da Page
5. **Criar `*Screen.mock.ts`** com dados de exemplo
6. **Criar `*Screen.stories.ts`** com todas as stories
7. **Refatorar Page** para usar Screen
8. **Mover lógica** de stores/API para Page
9. **Converter props** em handlers na Page
10. **Testar ambos** (Page e Screen)

### 11.4 Code Review

**Revisor deve verificar:**

- [ ] Estrutura de arquivos correta
- [ ] Camada Atomic Design apropriada
- [ ] Todos os tipos definidos em `.types.ts`
- [ ] Componente não acessa stores/rotas
- [ ] Props são `readonly`
- [ ] Mocks com dados realistas
- [ ] Stories completas e funcionando
- [ ] Barrel export correto
- [ ] Sem `any`, `@ts-ignore`
- [ ] BEM nos estilos
- [ ] JSDoc completo
- [ ] Storybook funciona
- [ ] Build passa sem erros

---

## 12. Exemplos Práticos

### 12.1 Átomo: CustomBadge

**Estrutura:**

```
src/components/atomos/CustomBadge/
├── CustomBadge.vue
├── CustomBadge.types.ts
├── CustomBadge.mock.ts
├── CustomBadge.stories.ts
└── index.ts
```

**CustomBadge.types.ts:**

```typescript
export interface CustomBadgeType {
  props: CustomBadgeProps;
}

export interface CustomBadgeProps {
  /**
   * Texto exibido no badge
   */
  readonly label: string;

  /**
   * Cor do badge
   * @default 'primary'
   */
  readonly color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

  /**
   * Tamanho do badge
   * @default 'md'
   */
  readonly size?: 'sm' | 'md' | 'lg';

  /**
   * Exibe ícone antes do texto
   */
  readonly icon?: string;
}
```

**CustomBadge.vue:**

```vue
<template>
  <span :class="badgeClass">
    <q-icon v-if="icon" :name="icon" :size="iconSize" />
    <span class="custom-badge__label">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CustomBadgeProps } from './CustomBadge.types';

const props = withDefaults(defineProps<CustomBadgeProps>(), {
  color: 'primary',
  size: 'md',
});

const badgeClass = computed(() => [
  'custom-badge',
  `custom-badge--${props.color}`,
  `custom-badge--${props.size}`,
]);

const iconSize = computed(() => {
  const sizes = { sm: 'xs', md: 'sm', lg: 'md' };
  return sizes[props.size];
});
</script>

<style scoped lang="scss">
.custom-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;

  &--sm {
    font-size: 0.75rem;
    padding: 2px 6px;
  }

  &--md {
    font-size: 0.875rem;
  }

  &--lg {
    font-size: 1rem;
    padding: 6px 12px;
  }

  &--primary {
    background-color: var(--q-color-primary);
    color: white;
  }

  &--secondary {
    background-color: var(--q-color-secondary);
    color: white;
  }

  &--success {
    background-color: var(--q-color-positive);
    color: white;
  }

  &--warning {
    background-color: var(--q-color-warning);
    color: var(--q-color-dark);
  }

  &--danger {
    background-color: var(--q-color-negative);
    color: white;
  }
}
</style>
```

### 12.2 Molécula: ItemBuscaUsuario

**Estrutura:**

```
src/components/moleculas/ItemBuscaUsuario/
├── ItemBuscaUsuario.vue
├── ItemBuscaUsuario.types.ts
├── ItemBuscaUsuario.mock.ts
├── ItemBuscaUsuario.stories.ts
└── index.ts
```

**ItemBuscaUsuario.types.ts:**

```typescript
export interface ItemBuscaUsuarioType {
  props: ItemBuscaUsuarioProps;
  emits: ItemBuscaUsuarioEmits;
}

export interface ItemBuscaUsuarioProps {
  /**
   * ID do usuário
   */
  readonly id: string;

  /**
   * Nome completo do usuário
   */
  readonly nome: string;

  /**
   * Username/handle do usuário
   */
  readonly username: string;

  /**
   * URL da foto de perfil
   */
  readonly fotoUrl?: string;

  /**
   * Indica se o usuário já está selecionado
   * @default false
   */
  readonly selected?: boolean;
}

export interface ItemBuscaUsuarioEmits {
  /**
   * Emitido quando o item é clicado
   */
  (e: 'click', userId: string): void;
}
```

**ItemBuscaUsuario.vue:**

```vue
<template>
  <div
    :class="itemClass"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <Avatar :src="fotoUrl" :alt="`Foto de ${nome}`" size="md" />

    <div class="item-busca-usuario__info">
      <span class="item-busca-usuario__nome">{{ nome }}</span>
      <span class="item-busca-usuario__username">@{{ username }}</span>
    </div>

    <q-icon v-if="selected" name="check_circle" color="positive" size="sm" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Avatar } from 'src/components/atomos/Avatar';
import type { ItemBuscaUsuarioProps, ItemBuscaUsuarioEmits } from './ItemBuscaUsuario.types';

const props = withDefaults(defineProps<ItemBuscaUsuarioProps>(), {
  selected: false,
});

const emit = defineEmits<ItemBuscaUsuarioEmits>();

const itemClass = computed(() => [
  'item-busca-usuario',
  { 'item-busca-usuario--selected': props.selected },
]);

function handleClick() {
  emit('click', props.id);
}
</script>

<style scoped lang="scss">
.item-busca-usuario {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--q-color-grey-2);
  }

  &--selected {
    background-color: var(--q-color-primary-light);
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__nome {
    font-weight: 500;
    font-size: 0.875rem;
  }

  &__username {
    font-size: 0.75rem;
    color: var(--q-color-grey-7);
  }
}
</style>
```

### 12.3 Template: LoginScreen

Ver seção [8.4 Presentation (Screen)](#84-presentation-screen) para exemplo completo.

---

## 13. Referências

### 13.1 Documentação Oficial

- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Quasar Framework](https://quasar.dev/)
- [Storybook Documentation](https://storybook.js.org/)
- [Vitest Documentation](https://vitest.dev/)

### 13.2 Atomic Design

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [Atomic Design Pattern](https://bradfrost.com/blog/post/atomic-web-design/)

### 13.3 Padrões de Arquitetura

- [Container/Presentation Pattern](https://www.patterns.dev/posts/presentational-container-pattern)
- [Vue Composition API Best Practices](https://vuejs.org/guide/reusability/composables.html)

### 13.4 Projetos de Referência

- **coworking-ui**: Projeto que implementou este padrão com sucesso (11 páginas, 44 screens, 91+ stories)
- **organiza-ai**: Gerador plop com templates que inspiraram este padrão

---

## Apêndice A: Glossário

- **Átomo**: Menor unidade de UI reutilizável
- **Molécula**: Combinação de átomos com lógica simples
- **Organismo**: Componente complexo com lógica de domínio
- **Template**: Estrutura de página (Screen) sem dados reais
- **Container**: Componente com lógica de negócio (Page)
- **Presentation**: Componente puramente visual (Screen)
- **Props**: Propriedades de entrada de um componente
- **Emits**: Eventos emitidos por um componente
- **Composable**: Hook reutilizável (padrão `use*`)
- **Store**: Gerenciador de estado global (Pinia)
- **Mock**: Dados de exemplo para testes/stories
- **Story**: Variação visual de um componente no Storybook
- **BEM**: Metodologia de nomenclatura CSS (Block Element Modifier)
- **Barrel Export**: Arquivo `index.ts` que re-exporta membros de uma pasta

---

## Apêndice B: Migração de Componentes Legados

### Componentes Identificados para Refatoração

| Componente                 | Violações      | Prioridade | Status   |
| -------------------------- | -------------- | ---------- | -------- |
| `ItemCarouselRoteiro.vue`  | stores, router | Alta       | Pendente |
| `CardAtividade.vue`        | stores, router | Alta       | Pendente |
| `CardFeedAtividade.vue`    | stores, router | Alta       | Pendente |
| `CardFeedRoteiro.vue`      | stores, router | Alta       | Pendente |
| `CardRoteiro.vue`          | stores, router | Alta       | Pendente |
| `ControleCriarRoteiro.vue` | stores, router | Média      | Pendente |
| `ItemBuscaRoteiro.vue`     | stores         | Média      | Pendente |
| `MenuFooter.vue`           | router         | Baixa      | Pendente |
| `NovaSenha.vue`            | stores         | Baixa      | Pendente |

### Estratégia de Migração

1. **Fase 1**: Componentes de baixa complexidade (MenuFooter, NovaSenha)
2. **Fase 2**: Componentes de média complexidade (ControleCriarRoteiro, ItemBuscaRoteiro)
3. **Fase 3**: Componentes de alta complexidade (Cards e Carousel)

---

## Apêndice C: Scripts Úteis

### package.json

```json
{
  "scripts": {
    "dev": "quasar dev",
    "build": "quasar build",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint --ext .js,.ts,.vue src",
    "lint:fix": "eslint --ext .js,.ts,.vue src --fix",
    "type-check": "vue-tsc --noEmit"
  }
}
```

### Gerador de Componente (plop)

```javascript
// plopfile.js
module.exports = function (plop) {
  plop.setGenerator('component', {
    description: 'Criar novo componente storytype',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Nome do componente (PascalCase):',
      },
      {
        type: 'list',
        name: 'layer',
        message: 'Camada do Atomic Design:',
        choices: ['atomos', 'moleculas', 'organismos', 'templates'],
      },
    ],
    actions: [
      {
        type: 'addMany',
        destination: 'src/components/{{layer}}/{{pascalCase name}}',
        templateFiles: 'plop-templates/component/**',
        base: 'plop-templates/component',
      },
    ],
  });
};
```

---

## Apêndice D: Changelog

### v1.0.0 (2026-03-09)

- ✨ Versão inicial da especificação
- 📝 Documentação completa de todos os padrões
- 📚 Exemplos práticos de implementação
- ✅ Checklist de validação
- 🏗️ Estrutura Atomic Design
- 🎨 Padrão Container/Presentation
- 📖 Integração completa com Storybook

---

**Especificação storytype v1.0**
Criada por: Sidarta Veloso
Data: 9 de março de 2026
Status: ✅ Ativo

---

© 2026 storytype. Este documento pode ser livremente usado e adaptado para projetos internos.
