# Generate - Criar Novos Componentes

O comando `generate` cria componentes Vue com estrutura completa seguindo o padrão Storytype. Cada componente é gerado com todos os arquivos necessários usando templates Handlebars customizáveis.

## Uso Básico

```bash
storytype generate <tipo> <nome>
```

## Parâmetros

### `tipo` (obrigatório)

O tipo de componente no Atomic Design:

| Tipo        | Descrição                | Exemplo                       |
| ----------- | ------------------------ | ----------------------------- |
| `atomo`     | Componentes mais básicos | Botão, Input, Label           |
| `molecula`  | Combinação de átomos     | Card, SearchBar, MenuItem     |
| `organismo` | Seções complexas         | Header, Sidebar, Form         |
| `template`  | Layouts da página        | PageLayout, DashboardTemplate |

::: tip Dica
Também é possível usar o plural: `atomos`, `moleculas`, `organismos`, `templates`
:::

### `nome` (obrigatório)

Nome do componente em qualquer formato:

- `PascalCase` → mantém
- `kebab-case` → converte para PascalCase
- `camelCase` → converte para PascalCase

**Exemplos:**

- `BotaoPrimario` ✅
- `botao-primario` ✅ → converte para `BotaoPrimario`
- `botaoPrimario` ✅ → converte para `BotaoPrimario`

## Estrutura Gerada

Cada componente é criado com 5 arquivos:

```
<tipo>/<nome-kebab>/
├── <NomePascal>.vue         # Componente Vue
├── <NomePascal>.types.ts    # Tipos TypeScript
├── <NomePascal>.stories.ts  # Storybook
├── <NomePascal>.mock.ts     # Dados mock
└── index.ts                 # Exportações
```

## Arquivos Gerados

### 1. Componente Vue (`.vue`)

```vue
<template>
  <div class="botao-primario">
    <!-- Conteúdo -->
    <p>Parabéns! Você criou o componente BotaoPrimario!</p>
  </div>
</template>

<script setup lang="ts">
import { BotaoPrimarioProps } from './BotaoPrimario.types';

const props = withDefaults(defineProps<BotaoPrimarioProps>(), {
  // Add default props here
});
</script>

<style scoped>
.botao-primario {
  /* Add component styles here */
}
</style>
```

### 2. Tipos TypeScript (`.types.ts`)

```typescript
export interface BotaoPrimarioType {
  models: BotaoPrimarioModels;
  props: BotaoPrimarioProps;
  emits: BotaoPrimarioEmits;
}

export interface BotaoPrimarioModels {
  //TODO: Add models here
}

export interface BotaoPrimarioProps {
  //TODO: Add props here
}

export interface BotaoPrimarioEmits {
  //TODO: Add emits here
}
```

### 3. Storybook Stories (`.stories.ts`)

```typescript
import type { Meta, StoryObj } from '@storybook/vue3';
import BotaoPrimario from './BotaoPrimario.vue';
import { generateMockData } from './BotaoPrimario.mock';

const meta: Meta<typeof BotaoPrimario> = {
  title: '01 - Átomos/BotaoPrimario',
  component: BotaoPrimario,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Descrição do componente BotaoPrimario',
      },
    },
  },
} satisfies Meta<typeof BotaoPrimario>;

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
  BotaoPrimarioModels,
  BotaoPrimarioProps,
  BotaoPrimarioEmits,
  BotaoPrimarioType,
} from './BotaoPrimario.types';

export const generateMockData = (): BotaoPrimarioType => {
  const props: BotaoPrimarioProps = {
    //TODO: Add props here
  };

  const models: BotaoPrimarioModels = {
    //TODO: Add models here
  };

  const emits: BotaoPrimarioEmits = {
    //TODO: Add emits here ex.: (e: 'click', event: Event): void;
  };

  return {
    props,
    models,
    emits,
  } satisfies BotaoPrimarioType as BotaoPrimarioType;
};
```

### 5. Index (index.ts)

```typescript
export * from './BotaoPrimario.types';
export * from './BotaoPrimario.mock';
export * as Stories from './BotaoPrimario.stories';
export { default } from './BotaoPrimario.vue';
```

## Exemplos de Uso

### 🔹 Criar Átomo

```bash
storytype generate atomo Botao
```

**Resultado:**

```
Generating atomos component: Botao
✓ Component generated successfully!

Created files:
  - src/components/atomos/botao/Botao.vue
  - src/components/atomos/botao/Botao.types.ts
  - src/components/atomos/botao/Botao.stories.ts
  - src/components/atomos/botao/Botao.mock.ts
  - src/components/atomos/botao/index.ts
```

### 🔸 Criar Molécula

```bash
storytype generate molecula SearchBar
```

**Story gerado:**

```typescript
title: '02 - Moléculas/SearchBar',
```

### 🔷 Criar Organismo

```bash
storytype generate organismo Header
```

**Story gerado:**

```typescript
title: '03 - Organismos/Header',
```

### 📄 Criar Template

```bash
storytype generate template PageLayout
```

**Story gerado:**

```typescript
title: '04 - Templates/PageLayout',
```

### 📑 Criar Page

```bash
storytype generate pages HomePage
```

**Story gerado:**

```typescript
title: '05 - Pages/HomePage',
```

## Casos de Uso

### 🆕 Criar Sistema de Design do Zero

```bash
# Átomos básicos
storytype generate atomo Botao
storytype generate atomo Input
storytype generate atomo Label
storytype generate atomo Icon

# Moléculas
storytype generate molecula SearchBar
storytype generate molecula Card
storytype generate molecula MenuItem

# Organismos
storytype generate organismo Header
storytype generate organismo Sidebar
storytype generate organismo Footer

# Template
storytype generate template PageLayout

# Página
storytype generate pages HomePage
```

### 🔄 Expandir Sistema Existente

```bash
# Adicionar nova família de componentes
storytype generate atomo BotaoSecundario
storytype generate atomo BotaoTerciario
storytype generate molecula BotaoGroup
```

### 🎨 Criar Variações

```bash
# Inputs
storytype generate atomo InputText
storytype generate atomo InputNumber
storytype generate atomo InputDate

# Forms
storytype generate molecula FormField
storytype generate organismo Form
```

## Customização de Templates

Os templates usados pelo `generate` são arquivos Handlebars (.hbs) que você pode customizar.

### Localização dos Templates

```
node_modules/storytype/dist/templates/component/
├── component.vue.hbs
├── types.ts.hbs
├── stories.ts.hbs
├── mock.ts.hbs
└── index.ts.hbs
```

### Customizar Templates

1. **Copie os templates** para seu projeto:

```bash
mkdir -p .storytype/templates/component
cp -r node_modules/storytype/dist/templates/component/* .storytype/templates/component/
```

2. **Edite conforme necessário**:

```handlebars
{{! .storytype/templates/component/component.vue.hbs }}
<template>
  <div class='{{kebabCase name}} my-custom-class'>
    <!-- Seu template customizado -->
    <h1>{{pascalCase name}}</h1>
  </div>
</template>

<script setup lang='ts'>
  // Sua lógica customizada import {
  {{pascalCase name}}Props } from './{{pascalCase name}}.types'; import { ref } from 'vue'; const
  props = defineProps<{{pascalCase name}}Props>(); const state = ref(false);
</script>

<style scoped>
  /* Seus estilos customizados */
  .{{kebabCase name}} {
    font-family: var(--font-family);
  }
</style>
```

### Helpers Handlebars Disponíveis

| Helper                 | Descrição                | Exemplo        |
| ---------------------- | ------------------------ | -------------- |
| `{{pascalCase name}}`  | Converte para PascalCase | `UserProfile`  |
| `{{kebabCase name}}`   | Converte para kebab-case | `user-profile` |
| `{{eq type "atomos"}}` | Compara valores          | `true/false`   |

### Variáveis Disponíveis

| Variável | Descrição          | Exemplo         |
| -------- | ------------------ | --------------- |
| `name`   | Nome do componente | `BotaoPrimario` |
| `type`   | Tipo do componente | `atomos`        |

## Workflow Recomendado

### 1️⃣ Criar Componente

```bash
storytype generate atomo Botao
```

### 2️⃣ Implementar Lógica

Edite os arquivos gerados:

- Adicione props em `.types.ts`
- Implemente lógica em `.vue`
- Configure mock data em `.mock.ts`

### 3️⃣ Criar Stories

Adicione variações em `.stories.ts`:

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

### 4️⃣ Escrever Testes

Implemente testes em `.spec.ts`:

```typescript
describe('Botao', () => {
  it('should emit click event', async () => {
    const wrapper = mount(Botao);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });
});
```

### 5️⃣ Documentar

Adicione documentação no Storybook:

```typescript
parameters: {
  docs: {
    description: {
      component: `
        Componente de botão responsivo com suporte a:
        - Variantes (primary, secondary, tertiary)
        - Tamanhos (sm, md, lg)
        - Estados (disabled, loading)
        - Ícones (leading, trailing)
      `;
    }
  }
}
```

## Convenções de Nomenclatura

### ✅ Bons Nomes

- `Botao`, `BotaoPrimario`
- `Input`, `InputText`
- `Card`, `CardAvatar`
- `Header`, `HeaderMain`

### ❌ Evite

- `button` → Use `Botao`
- `btn` → Use `Botao`
- `MyComponent` → Seja específico
- `Component1` → Sem significado

## Integração com IDE

### VS Code

Crie snippet para gerar rapidamente:

```json
// .vscode/storytype.code-snippets
{
  "Generate Component": {
    "prefix": "stg",
    "body": ["storytype generate ${1|atomos,moleculas,organismos,templates,pages|} $2"]
  }
}
```

### Scripts NPM

```json
{
  "scripts": {
    "gen:atomo": "storytype generate atomo",
    "gen:molecula": "storytype generate molecula",
    "gen:organismo": "storytype generate organismo"
  }
}
```

Uso:

```bash
pnpm gen:atomo Botao
```

## Próximos Passos

Após gerar componente:

1. ✏️ **Implementar** - Adicione lógica e estilos
2. 📖 **Documentar** - Complete as stories
3. ✅ **Testar** - Escreva testes unitários
4. 🔍 **Validar** - [`storytype analyze`](./analyze.md)

---

- 🔍 [Ver todos os comandos CLI](./index.md)
- 📊 [Analisar componentes com `analyze`](./analyze.md)
- ⚙️ [Normalizar estrutura com `normalize`](./normalize.md)
