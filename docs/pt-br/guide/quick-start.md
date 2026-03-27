# Início Rápido

Comece com Storytype no seu projeto Vue 3 em apenas alguns minutos.

## Pré-requisitos

Antes de começar, certifique-se de ter:

- **Node.js 20.11.1+** instalado
- **pnpm 10.33.0+** (recomendado) ou npm/yarn
- Conhecimento básico de Vue 3 e TypeScript
- Um projeto Vue 3 (ou crie um)

## Instalação

### Opção 1: Instalar Globalmente

Para usar em qualquer projeto:

```bash
# Com pnpm (recomendado)
pnpm add -g storytype

# Ou com npm
npm install -g storytype

# Verificar instalação
storytype --version
```

### Opção 2: Instalar no Projeto

Para usar localmente:

```bash
# Com pnpm
pnpm add -D storytype

# Ou com npm
npm install -D storytype

# Usar com npx
npx storytype --version
```

### Opção 3: Clonar Repositório do Storytype

Para desenvolver ou contribuir:

```bash
# Clonar repositório
git clone https://github.com/sidartaveloso/storytype.git
cd storytype

# Instalar dependências
pnpm install

# Fazer link global
pnpm link

# Usar em qualquer lugar
storytype --version
```

## Estrutura do Projeto

Após a inicialização, seu projeto terá esta estrutura:

```
src/
├── components/
│   ├── atomos/
│   │   ├── botao/
│   │   │   ├── Botao.stories.ts
│   │   │   └── Botao.types.ts
│   │   │   ├── Botao.vue
│   │   │   └── index.ts
│   │   └── ...
│   ├── moleculas/
│   ├── organismos/
│   ├── templates/
│       └── exemplo-screen/
│           └── ExemploScreen.stories.ts
│           ├── ExemploScreen.vue
│           ├── ExemploScreen.types.ts
│           └── index.ts
│   └── pages/
│       └── exemplo-page/
│           └── ExemploPage.stories.ts
│           ├── ExemploPage.vue
│           ├── ExemploPage.types.ts
│           └── index.ts
├── store/
├── router/
└── ...
```

## Seu Primeiro Componente

Vamos criar um componente átomo simples:

```bash
storytype generate atomos Avatar
```

Isso gera automaticamente 5 arquivos:

::: code-group

```typescript [Avatar.types.ts - Definições de Tipo]
// src/components/atomos/avatar/Avatar.types.ts

/** Tamanho do avatar */
export type AvatarSize = 'sm' | 'md' | 'lg';

/** Forma do avatar */
export type AvatarShape = 'circle' | 'square';

/** Props do componente Avatar */
export interface AvatarProps {
  /** URL da imagem do usuário */
  src?: string;
  /** Texto alternativo para acessibilidade */
  alt?: string;
  /** Iniciais a exibir quando não há imagem */
  initials?: string;
  /** Tamanho do avatar */
  size?: AvatarSize;
  /** Forma do avatar */
  shape?: AvatarShape;
}

/** Tipo do componente Avatar (para Storybook e testes) */
export interface AvatarType {
  props: AvatarProps;
  models: AvatarModels;
  emits: AvatarEmits;
}

export interface AvatarModels {}
export interface AvatarEmits {}
```

```vue [Avatar.vue - O Componente]
<!-- src/components/atomos/avatar/Avatar.vue -->
<template>
  <div class="atom-avatar" :class="[`atom-avatar--${props.size}`, `atom-avatar--${props.shape}`]">
    <img v-if="props.src" :src="props.src" :alt="props.alt" />
    <span v-else class="atom-avatar__initials">{{ props.initials }}</span>
  </div>
</template>

<script setup lang="ts">
import type { AvatarProps } from './Avatar.types';

// TypeScript fornece:
// ✅ Autocomplete para todas as props
// ✅ Erros de tipo se props estiverem incorretas
// ✅ Refatoração segura
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

```typescript [Avatar.stories.ts - Documentação Visual]
// src/components/atomos/avatar/Avatar.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3';
import Avatar from './Avatar.vue';
import { generateMockData } from './Avatar.mock';

const meta: Meta<typeof Avatar> = {
  title: '01 - Átomos/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Componente para exibir foto de perfil do usuário ou suas iniciais',
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockData = generateMockData();

// TypeScript garante que stories correspondam às props
export const Default: Story = {
  args: {
    ...mockData.props,
  },
};

export const ComImagem: Story = {
  args: {
    src: 'https://i.pravatar.cc/150',
    alt: 'Avatar do usuário',
    size: 'md',
  },
};

export const ComIniciais: Story = {
  args: {
    initials: 'JD',
    alt: 'João Doe',
    size: 'md',
  },
};

export const Pequeno: Story = {
  args: {
    ...ComImagem.args,
    size: 'sm',
  },
};

export const Grande: Story = {
  args: {
    ...ComImagem.args,
    size: 'lg',
  },
};

export const Quadrado: Story = {
  args: {
    ...ComImagem.args,
    shape: 'square',
  },
};
```

```typescript [Avatar.mock.ts - Dados de Teste]
// src/components/atomos/avatar/Avatar.mock.ts
import type { AvatarType, AvatarProps, AvatarModels, AvatarEmits } from './Avatar.types';

export const generateMockData = (): AvatarType => {
  const props: AvatarProps = {
    initials: 'JD',
    alt: 'João Doe',
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

```typescript [index.ts - Exportações]
// src/components/atomos/avatar/index.ts
export * from './Avatar.types';
export * from './Avatar.mock';
export * as Stories from './Avatar.stories';
export { default } from './Avatar.vue';
```

:::

## A Experiência do Desenvolvedor

Agora quando você usa o componente, **TypeScript te ajuda**:

```vue
<template>
  <!-- ✅ Autocomplete mostra: src, alt, initials, size, shape -->
  <Avatar src="/user.jpg" alt="João Doe" size="lg" />

  <!-- ❌ Erro TypeScript: Type '"xl"' não pode ser atribuído ao tipo 'AvatarSize' -->
  <Avatar size="xl" />

  <!-- ✅ Props opcionais funcionam -->
  <Avatar initials="JD" />
</template>
```

**Isso significa:**

- 🎯 Não pode passar tipos de prop errados
- 🎯 Props opcionais claramente indicadas
- 🎯 Não pode usar props que não existem
- 🎯 Refatoração de renomeação é 100% segura

## Fluxo de Desenvolvimento

### 1. Iniciar Storybook

Abra o Storybook para desenvolver componentes isoladamente:

```bash
pnpm storybook
```

Navegue para `http://localhost:6006` para ver seus componentes.

### 2. Testar Componentes

Cada componente é automaticamente testável:

```bash
# Executar testes unitários
pnpm test

# Executar testes em modo watch
pnpm test:watch

# Executar testes com cobertura
pnpm test:coverage
```

### 3. Compor Componentes

Construa componentes maiores a partir de menores:

```bash
# Criar uma molécula que usa átomos
storytype add molecule UserCard

# Criar um organismo que usa moléculas
storytype add organism UserProfile
```

### 4. Criar Pages

Gere uma página completa com container e apresentação:

```bash
storytype add page Perfil
```

Isso cria:

- `PerfilPage.vue` - Container com lógica de negócio
- `PerfilScreen.vue` - Componente de apresentação
- `PerfilScreen.types.ts` - Tipagens do componente
- `PerfilScreen.stories.ts` - Stories do Storybook

## Boas Práticas

### Nomenclatura de Componentes

Siga a nomenclatura Atomic Design em português:

```
AtomButton      → Componente átomo
MolUserCard     → Componente molécula
OrgNavigation   → Componente organismo
TempDashboard   → Componente template
PerfilPage      → Container page
PerfilScreen    → Apresentação screen
```

### TypeScript

Sempre defina interfaces em arquivo separado `.types.ts`:

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
  salvar: [dados: Usuario];
  cancelar: [];
}
```

```vue
<!-- PerfilScreen.vue -->
<template>
  <!-- conteúdo -->
</template>

<script setup lang="ts">
import type { PerfilScreenProps, PerfilScreenEmits } from './PerfilScreen.types';

const props = defineProps<PerfilScreenProps>();
const emits = defineEmits<PerfilScreenEmits>();
</script>
```

### Stories do Storybook

Cada componente deve ter stories abrangentes:

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

## Próximos Passos

Agora que você tem o Storytype configurado, você pode:

- Continuar explorando a documentação
- Começar a construir seus componentes seguindo o padrão Storytype
- Consultar o guia de Introdução para entendimento mais profundo da filosofia

## Solução de Problemas

### Erros do ESLint

Se você ver erros do ESLint sobre o padrão:

```bash
# Instalar plugin ESLint
pnpm add -D @storytype/eslint-plugin

# Adicionar ao .eslintrc.js
module.exports = {
  extends: ['plugin:@storytype/recommended'],
};
```

### Storybook Não Inicia

Certifique-se de ter as dependências corretas:

```bash
pnpm add -D @storybook/vue3 @storybook/addon-essentials
```

### Erros de Tipo

Certifique-se de que o TypeScript está configurado com modo strict:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

## Obter Ajuda

- [GitHub Issues](https://github.com/sidartaveloso/storytype/issues)
- [Discussões](https://github.com/sidartaveloso/storytype/discussions)
- [Comunidade Discord](#) (em breve)
