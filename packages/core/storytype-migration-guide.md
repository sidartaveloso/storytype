# Guia de Migração — storytype

Guia prático passo a passo para migrar componentes legados para o padrão **storytype**.

---

## 📋 Índice

1. [Preparação](#1-preparação)
2. [Auditoria de Componente](#2-auditoria-de-componente)
3. [Migração de Componente Simples](#3-migração-de-componente-simples)
4. [Migração de Componente com Stores](#4-migração-de-componente-com-stores)
5. [Migração de Componente com Router](#5-migração-de-componente-com-router)
6. [Implementação de Container/Presentation](#6-implementação-de-containerpresentation)
7. [Conversão Options API → Composition API](#7-conversão-options-api--composition-api)
8. [Checklist Final](#8-checklist-final)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Preparação

### 1.1 Ferramentas Necessárias

- ✅ Node.js 20+ (via nvm)
- ✅ Editor com Volar/TypeScript LSP
- ✅ Storybook configurado e funcionando
- ✅ Documentação do padrão disponível

### 1.2 Antes de Começar

```bash
# Criar branch de trabalho
git checkout -b refactor/migrate-component-name

# Verificar que tudo compila
pnpm type-check

# Verificar que Storybook funciona
pnpm storybook
```

### 1.3 Tempo Estimado por Componente

| Complexidade | Tempo Estimado | Características                                    |
| ------------ | -------------- | -------------------------------------------------- |
| Baixa        | 30-60 min      | Sem stores/router, poucas props                    |
| Média        | 1-2 horas      | Usa stores OU router, várias props                 |
| Alta         | 2-4 horas      | Usa stores E router, lógica complexa, muitas props |

---

## 2. Auditoria de Componente

### 2.1 Checklist de Auditoria

Analise o componente e marque as violações:

```typescript
// ❌ VIOLAÇÕES A SEREM CORRIGIDAS:
- [ ] Usa `useRouter()` ou `useRoute()`
- [ ] Usa Pinia stores (useXStore)
- [ ] Faz chamadas de API
- [ ] Acessa localStorage/sessionStorage
- [ ] Usa Options API (export default { ... })
- [ ] Props sem tipos (PropType)
- [ ] Emits sem tipos
- [ ] Não tem `.types.ts`
- [ ] Não tem `.stories.ts`
- [ ] Não tem `index.ts`

// ✅ PONTOS POSITIVOS:
- [ ] Já usa Composition API
- [ ] Já tem tipos TypeScript
- [ ] Componente pequeno (<200 linhas)
- [ ] Poucas dependências
```

### 2.2 Exemplo de Auditoria

```vue
<!-- MenuFooter.vue — ANTES DA AUDITORIA -->
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'; // ❌ VIOLAÇÃO

const route = useRoute(); // ❌ VIOLAÇÃO
const router = useRouter(); // ❌ VIOLAÇÃO

function navegarPara(path: string) {
  // ❌ VIOLAÇÃO
  router.push(path);
}

const rotaAtiva = computed(() => route.path); // ❌ VIOLAÇÃO
</script>
```

**Resultado da auditoria:**

- ❌ Usa router (useRoute, useRouter)
- ✅ Já usa Composition API
- ✅ Componente pequeno
- ❌ Não tem `.types.ts`
- ❌ Não tem `.stories.ts`

**Complexidade:** Baixa (apenas router, nenhum store)
**Tempo estimado:** 30-60 min

---

## 3. Migração de Componente Simples

### Cenário

Componente que NÃO usa stores ou router.

### 3.1 Criar `.types.ts`

```typescript
// Avatar.types.ts
export interface AvatarType {
  props: AvatarProps;
}

export interface AvatarProps {
  /**
   * URL da imagem
   */
  readonly src: string;

  /**
   * Texto alternativo para acessibilidade
   */
  readonly alt: string;

  /**
   * Tamanho do avatar
   * @default 'md'
   */
  readonly size?: 'sm' | 'md' | 'lg';
}
```

### 3.2 Atualizar `.vue`

**ANTES:**

```vue
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Avatar',
  props: {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    size: { type: String, default: 'md' },
  },
});
</script>
```

**DEPOIS:**

```vue
<script setup lang="ts">
import type { AvatarProps } from './Avatar.types';

const props = withDefaults(defineProps<AvatarProps>(), {
  size: 'md',
});
</script>
```

### 3.3 Criar `.mock.ts`

```typescript
// Avatar.mock.ts
import type { AvatarProps } from './Avatar.types';

export const mockAvatarDefault: AvatarProps = {
  src: 'https://i.pravatar.cc/150?img=1',
  alt: 'João Silva',
  size: 'md',
};

export const mockAvatarSmall: AvatarProps = {
  src: 'https://i.pravatar.cc/150?img=2',
  alt: 'Maria Santos',
  size: 'sm',
};

export const mockAvatarLarge: AvatarProps = {
  src: 'https://i.pravatar.cc/150?img=3',
  alt: 'Pedro Costa',
  size: 'lg',
};
```

### 3.4 Criar `.stories.ts`

```typescript
// Avatar.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3';
import Avatar from './Avatar.vue';
import { mockAvatarDefault, mockAvatarSmall, mockAvatarLarge } from './Avatar.mock';

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

export const Small: Story = {
  args: mockAvatarSmall,
};

export const Large: Story = {
  args: mockAvatarLarge,
};
```

### 3.5 Criar `index.ts`

```typescript
// index.ts
export { default } from './Avatar.vue';
export { default as Avatar } from './Avatar.vue';
export type * from './Avatar.types';
export * from './Avatar.mock';
```

### 3.6 Testar

```bash
# Verificar tipos
pnpm type-check

# Verificar no Storybook
pnpm storybook
# Navegar até Atomos/Avatar
```

---

## 4. Migração de Componente com Stores

### Cenário

Componente que usa Pinia stores.

### 4.1 Identificar Uso de Store

**ANTES:**

```vue
<script setup lang="ts">
import { useUserStore } from 'stores/user'; // ❌ VIOLAÇÃO
import { useRoteiroStore } from 'stores/roteiro'; // ❌ VIOLAÇÃO

const userStore = useUserStore();
const roteiroStore = useRoteiroStore();

const userName = computed(() => userStore.currentUser?.name);
const roteiros = computed(() => roteiroStore.list);
</script>

<template>
  <div>
    <p>{{ userName }}</p>
    <div v-for="r in roteiros" :key="r.id">{{ r.title }}</div>
  </div>
</template>
```

### 4.2 Extrair Dados para Props

**Estratégia:** Transformar dados de stores em props.

**`.types.ts`:**

```typescript
export interface CardRoteiroProps {
  readonly userName: string;
  readonly roteiros: Roteiro[];
}

interface Roteiro {
  readonly id: string;
  readonly title: string;
}
```

**`.vue` (DEPOIS):**

```vue
<script setup lang="ts">
import type { CardRoteiroProps } from './CardRoteiro.types';

defineProps<CardRoteiroProps>();
</script>

<template>
  <div>
    <p>{{ userName }}</p>
    <div v-for="r in roteiros" :key="r.id">{{ r.title }}</div>
  </div>
</template>
```

### 4.3 Mover Lógica para Page

**Page (container):**

```vue
<!-- pages/roteiros/PageRoteiros.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from 'stores/user';
import { useRoteiroStore } from 'stores/roteiro';
import { CardRoteiro } from 'components/moleculas/CardRoteiro';

const userStore = useUserStore();
const roteiroStore = useRoteiroStore();

const userName = computed(() => userStore.currentUser?.name);
const roteiros = computed(() => roteiroStore.list);
</script>

<template>
  <CardRoteiro :user-name="userName" :roteiros="roteiros" />
</template>
```

### 4.4 Criar Mocks com Dados Realistas

```typescript
// CardRoteiro.mock.ts
import type { CardRoteiroProps } from './CardRoteiro.types';

export const mockCardRoteiroDefault: CardRoteiroProps = {
  userName: 'João Silva',
  roteiros: [
    { id: '1', title: 'Trilha da Pedra Grande' },
    { id: '2', title: 'Cachoeira do Mosquito' },
  ],
};

export const mockCardRoteiroEmpty: CardRoteiroProps = {
  userName: 'Maria Santos',
  roteiros: [],
};
```

---

## 5. Migração de Componente com Router

### Cenário

Componente que usa vue-router para navegação.

### 5.1 Identificar Uso de Router

**ANTES:**

```vue
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'; // ❌ VIOLAÇÃO

const router = useRouter();
const route = useRoute();

function navegarParaDetalhes(id: string) {
  router.push(`/roteiros/${id}`);
}

const rotaAtiva = computed(() => route.path);
</script>

<template>
  <button @click="navegarParaDetalhes('123')">Ver detalhes</button>
</template>
```

### 5.2 Transformar Navegação em Evento

**`.types.ts`:**

```typescript
export interface CardRoteiroProps {
  readonly id: string;
  readonly title: string;
}

export interface CardRoteiroEmits {
  /**
   * Emitido quando usuário clica para ver detalhes
   */
  (e: 'viewDetails', roteiroId: string): void;
}
```

**`.vue` (DEPOIS):**

```vue
<script setup lang="ts">
import type { CardRoteiroProps, CardRoteiroEmits } from './CardRoteiro.types';

const props = defineProps<CardRoteiroProps>();
const emit = defineEmits<CardRoteiroEmits>();

function handleViewDetails() {
  emit('viewDetails', props.id);
}
</script>

<template>
  <button @click="handleViewDetails">Ver detalhes</button>
</template>
```

### 5.3 Mover Navegação para Page

**Page (container):**

```vue
<!-- pages/roteiros/PageRoteiros.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { CardRoteiro } from 'components/moleculas/CardRoteiro';

const router = useRouter();

function handleViewDetails(roteiroId: string) {
  router.push(`/roteiros/${roteiroId}`);
}
</script>

<template>
  <CardRoteiro id="123" title="Trilha da Pedra Grande" @view-details="handleViewDetails" />
</template>
```

---

## 6. Implementação de Container/Presentation

### Cenário

Página monolítica que precisa ser separada em Page + Screen.

### 6.1 Análise da Página

**ANTES (PageLogin.vue monolítico):**

```vue
<template>
  <q-page>
    <q-form @submit="handleLogin">
      <q-input v-model="email" label="Email" />
      <q-input v-model="senha" type="password" label="Senha" />
      <q-btn type="submit" :loading="loading">Entrar</q-btn>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const senha = ref('');
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  await authStore.login({ email: email.value, senha: senha.value });
  router.push('/dashboard');
  loading.value = false;
}
</script>
```

### 6.2 Criar Screen (Presentation)

**Passo 1: Criar pasta**

```bash
mkdir -p src/components/templates/LoginScreen
```

**Passo 2: `LoginScreen.types.ts`**

```typescript
export interface LoginScreenType {
  props: LoginScreenProps;
  emits: LoginScreenEmits;
}

export interface LoginScreenProps {
  readonly email: string;
  readonly senha: string;
  readonly loading?: boolean;
  readonly errorMessage?: string;
}

export interface LoginScreenEmits {
  (e: 'update:email', value: string): void;
  (e: 'update:senha', value: string): void;
  (e: 'submit'): void;
}
```

**Passo 3: `LoginScreen.vue`**

```vue
<template>
  <q-page class="login-screen">
    <q-form class="login-screen__form" @submit.prevent="emit('submit')">
      <q-input
        :model-value="email"
        label="Email"
        type="email"
        :disable="loading"
        @update:model-value="emit('update:email', $event)"
      />

      <q-input
        :model-value="senha"
        label="Senha"
        type="password"
        :disable="loading"
        @update:model-value="emit('update:senha', $event)"
      />

      <p v-if="errorMessage" class="login-screen__erro">
        {{ errorMessage }}
      </p>

      <q-btn type="submit" label="Entrar" :loading="loading" />
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import type { LoginScreenProps, LoginScreenEmits } from './LoginScreen.types';

const props = withDefaults(defineProps<LoginScreenProps>(), {
  loading: false,
  errorMessage: '',
});

const emit = defineEmits<LoginScreenEmits>();
</script>

<style scoped lang="scss">
.login-screen {
  display: flex;
  justify-content: center;
  align-items: center;

  &__form {
    width: 100%;
    max-width: 400px;
  }

  &__erro {
    color: var(--q-color-negative);
    font-size: 0.875rem;
  }
}
</style>
```

**Passo 4: `LoginScreen.mock.ts`**

```typescript
import type { LoginScreenProps } from './LoginScreen.types';

export const mockLoginScreenDefault: LoginScreenProps = {
  email: '',
  senha: '',
  loading: false,
};

export const mockLoginScreenWithData: LoginScreenProps = {
  email: 'joao@example.com',
  senha: 'senha123',
  loading: false,
};

export const mockLoginScreenLoading: LoginScreenProps = {
  email: 'joao@example.com',
  senha: 'senha123',
  loading: true,
};

export const mockLoginScreenError: LoginScreenProps = {
  email: 'joao@example.com',
  senha: 'senha123',
  loading: false,
  errorMessage: 'Credenciais inválidas',
};
```

**Passo 5: `LoginScreen.stories.ts`**

```typescript
import type { Meta, StoryObj } from '@storybook/vue3';
import LoginScreen from './LoginScreen.vue';
import {
  mockLoginScreenDefault,
  mockLoginScreenLoading,
  mockLoginScreenError,
} from './LoginScreen.mock';

const meta = {
  title: 'Templates/LoginScreen',
  component: LoginScreen,
  tags: ['autodocs'],
} satisfies Meta<typeof LoginScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockLoginScreenDefault,
};

export const Loading: Story = {
  args: mockLoginScreenLoading,
};

export const WithError: Story = {
  args: mockLoginScreenError,
};
```

**Passo 6: `index.ts`**

```typescript
export { default } from './LoginScreen.vue';
export { default as LoginScreen } from './LoginScreen.vue';
export type * from './LoginScreen.types';
export * from './LoginScreen.mock';
```

### 6.3 Refatorar Page (Container)

**PageLogin.vue (DEPOIS):**

```vue
<template>
  <LoginScreen
    v-model:email="email"
    v-model:senha="senha"
    :loading="loading"
    :error-message="errorMessage"
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
const senha = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  loading.value = true;
  errorMessage.value = '';

  try {
    await authStore.login({
      email: email.value,
      senha: senha.value,
    });
    router.push('/dashboard');
  } catch (error) {
    errorMessage.value = 'Credenciais inválidas';
  } finally {
    loading.value = false;
  }
}
</script>
```

---

## 7. Conversão Options API → Composition API

### 7.1 Estrutura Options API

**ANTES:**

```vue
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'MeuComponente',

  props: {
    titulo: { type: String, required: true },
    contador: { type: Number, default: 0 },
  },

  emits: ['atualizar', 'fechar'],

  setup(props, { emit }) {
    const valorInterno = ref(props.contador);

    const dobro = computed(() => valorInterno.value * 2);

    function incrementar() {
      valorInterno.value++;
      emit('atualizar', valorInterno.value);
    }

    return {
      valorInterno,
      dobro,
      incrementar,
    };
  },
});
</script>
```

### 7.2 Conversão para `<script setup>`

**DEPOIS:**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import type { MeuComponenteProps, MeuComponenteEmits } from './MeuComponente.types';

const props = withDefaults(defineProps<MeuComponenteProps>(), {
  contador: 0,
});

const emit = defineEmits<MeuComponenteEmits>();

const valorInterno = ref(props.contador);

const dobro = computed(() => valorInterno.value * 2);

function incrementar() {
  valorInterno.value++;
  emit('atualizar', valorInterno.value);
}
</script>
```

### 7.3 Tabela de Conversão

| Options API               | Composition API (`<script setup>`) |
| ------------------------- | ---------------------------------- |
| `props: { ... }`          | `defineProps<Type>()`              |
| `emits: [...]`            | `defineEmits<Type>()`              |
| `setup(props, { emit })`  | Direto no `<script setup>`         |
| `computed(() => ...)`     | `computed(() => ...)`              |
| `ref(value)`              | `ref(value)`                       |
| `watch(source, callback)` | `watch(source, callback)`          |
| `onMounted(callback)`     | `onMounted(callback)`              |
| `return { ... }`          | Não necessário (auto-export)       |
| `this.$emit(...)`         | `emit(...)`                        |
| `this.$props`             | `props`                            |

---

## 8. Checklist Final

Antes de criar PR, verifique:

### Estrutura de Arquivos

- [ ] Pasta em `PascalCase`
- [ ] Componente na camada correta (atomos/moleculas/organismos/templates)
- [ ] `ComponentName.types.ts` criado
- [ ] `ComponentName.vue` atualizado
- [ ] `ComponentName.mock.ts` criado
- [ ] `ComponentName.stories.ts` criado
- [ ] `index.ts` criado

### TypeScript

- [ ] Interface `Props` definida
- [ ] Interface `Emits` definida (se houver)
- [ ] Props com `readonly`
- [ ] JSDoc em todas as props/emits
- [ ] Zero erros `pnpm type-check`
- [ ] Zero uso de `any`
- [ ] Zero `@ts-ignore`

### Vue

- [ ] Usa `<script setup lang="ts">`
- [ ] `defineProps<Type>()` + `withDefaults()`
- [ ] `defineEmits<Type>()`
- [ ] `<style scoped lang="scss">`
- [ ] BEM nos estilos
- [ ] Sem stores (Pinia)
- [ ] Sem rotas (vue-router)
- [ ] Sem chamadas de API

### Mocks

- [ ] Pelo menos 3 mocks criados
- [ ] Nomes descritivos (`mock*Default`, `mock*Loading`, etc.)
- [ ] Dados realistas

### Stories

- [ ] `title` correto (camada + nome)
- [ ] `tags: ['autodocs']`
- [ ] Story `Default`
- [ ] Stories para cada estado importante
- [ ] Story `Variantes` (comparação lado a lado)
- [ ] ArgTypes documentados

### Testes

- [ ] Componente renderiza no Storybook
- [ ] Todas as stories funcionam
- [ ] Zero erros ESLint: `pnpm lint`
- [ ] Build passa: `pnpm build`

### Integração

- [ ] Imports atualizados em outros arquivos
- [ ] Se for Screen, Page correspondente atualizada
- [ ] Rotas funcionando (se aplicável)

---

## 9. Troubleshooting

### Erro: "Cannot find module './ComponentName.types'"

**Causa:** Arquivo `.types.ts` não foi criado ou caminho incorreto.

**Solução:**

```bash
# Verificar que o arquivo existe
ls src/components/atomos/ComponentName/ComponentName.types.ts

# Verificar import no .vue
# CORRETO:
import type { ComponentNameProps } from './ComponentName.types';

# ERRADO:
import type { ComponentNameProps } from '@/components/atomos/ComponentName.types';
```

### Erro: "Property 'X' does not exist on type 'Props'"

**Causa:** Prop não definida em `.types.ts`.

**Solução:**

```typescript
// Adicione a prop em ComponentName.types.ts
export interface ComponentNameProps {
  readonly x: string; // ← Adicione esta linha
}
```

### Erro: Componente não aparece no Storybook

**Causa 1:** Story não segue o padrão de export.

**Solução:**

```typescript
// CORRETO:
const meta = {
  title: 'Atomos/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
} satisfies Meta<typeof ComponentName>;

export default meta; // ← Export default é obrigatório
```

**Causa 2:** Erro de compilação no componente.

**Solução:**

```bash
# Verificar erros
pnpm type-check
pnpm lint

# Verificar console do Storybook
# Abrir navegador DevTools quando Storybook estiver rodando
```

### Erro: "withDefaults is not defined"

**Causa:** Import automático não funcionou.

**Solução:**

```typescript
// Adicione import explícito
import { withDefaults } from 'vue';
```

### Stories não reagem a mudanças de props

**Causa:** Args não estão bindados corretamente.

**Solução:**

```typescript
// CORRETO:
export const Default: Story = {
  args: mockComponentNameDefault,
};

// ERRADO:
export const Default: Story = {
  render: () => ({
    components: { ComponentName },
    template: '<ComponentName titulo="fixo" />', // ← Props fixas
  }),
};
```

### Erro: "Store is not available in component test"

**Causa:** Componente ainda acessa store diretamente.

**Solução:** Refatore para receber dados via props:

```vue
<!-- ANTES (❌ ERRADO) -->
<script setup lang="ts">
import { useUserStore } from 'stores/user';
const userStore = useUserStore();
const userName = computed(() => userStore.currentUser?.name);
</script>

<!-- DEPOIS (✅ CORRETO) -->
<script setup lang="ts">
interface Props {
  readonly userName: string;
}
defineProps<Props>();
</script>
```

### Componente muito grande para migrar de uma vez

**Estratégia:** Migração incremental.

**Solução:**

1. Extraia sub-componentes pequenos primeiro
2. Migre sub-componentes individualmente
3. Depois migre o componente principal

**Exemplo:**

```
CardComplexo (400 linhas) → Dividir em:
  ├─ CardHeader (50 linhas) → Migrar primeiro
  ├─ CardBody (150 linhas) → Migrar segundo
  └─ CardFooter (80 linhas) → Migrar terceiro

Depois migrar CardComplexo usando os sub-componentes
```

---

## Recursos Adicionais

### Documentação

- [Especificação Completa](./storytype-spec.md)
- [Guia Visual](./storytype-visual-guide.md)
- [Quick Start](./storytype-readme.md)

### Exemplos de Referência

- Avatar (átomo simples)
- ItemBuscaUsuario (molécula com emits)
- LoginScreen (template com v-model)

### Comandos Úteis

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Storybook
pnpm storybook

# Build (verifica se tudo compila)
pnpm build

# Testes
pnpm test
```

---

**Guia de Migração storytype v1.0**
Criado por: Sidarta Veloso
Última atualização: 9 de março de 2026

**Precisa de ajuda?** Consulte a [especificação completa](./storytype-spec.md) ou o [guia visual](./storytype-visual-guide.md).
