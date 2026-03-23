# Task 002 — Criar @storytype/components

Status: pending
Type: feat
Assignee: Sidarta Veloso
Priority: high
Timeline: 9 semanas

## 🎯 Visão

Criar um pacote colaborativo de componentes Vue 3 + TypeScript consolidando componentes desenvolvidos em projetos anteriores, refatorados para seguir rigorosamente o padrão Storytype, formando uma biblioteca de referência battle-tested e fortalecendo a comunidade através de contribuições open-source.

### 💎 Origem dos Componentes

Os componentes deste pacote são **componentes reais** desenvolvidos e validados ao longo de anos em projetos de produção. Esta origem traz vantagens únicas:

- ✅ **Battle-tested**: Componentes já usados em aplicações reais
- ✅ **Casos de uso reais**: Cobrem necessidades práticas do dia-a-dia
- ✅ **Evolução natural**: Foram refinados através de feedback de usuários reais
- ✅ **Diversidade**: Vêm de diferentes domínios e contextos de negócio

O desafio e valor desta task está em **elevar esses componentes ao próximo nível**, aplicando sistematicamente o padrão Storytype para criar uma biblioteca de referência que demonstra as melhores práticas em ação.

## 🌟 Objetivos

1. **Migração Estratégica**: Consolidar componentes desenvolvidos em projetos anteriores em uma biblioteca unificada
2. **Validação Rigorosa**: Garantir que todos os componentes migrados atinjam 100% de conformidade com Storytype
3. **Comunidade Colaborativa**: Sistema de contribuição aberto onde outros desenvolvedores podem adicionar componentes
4. **Validação Automática**: Todos os componentes passam pelo `storytype analyze` antes de serem aceitos
5. **Documentação Viva**: Cada componente com stories completas no Storybook
6. **Ecossistema Forte**: Fortalecer o Storytype como padrão de mercado com componentes battle-tested

## 📦 Estrutura do Package

````
packages/components/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── CONTRIBUTING.md           # Guia de contribuição
├── .github/
│   └── workflows/
│       ├── validate.yml      # CI: valida com storytype analyze
│       └── publish.yml       # CI: publica no npm
├── src/
│   ├── index.ts              # Exports principais
│   ├── atoms/
│   │   ├── Avatar/
│   │   │   ├── Avatar.vue
│   │   │   ├── Avatar.types.ts
│   │   │   ├── Avatar.stories.ts
│   │   │   ├── Avatar.spec.ts
│   │   │   └── index.ts
│   │   ├── Badge/
│   │   ├── Button/
│   │   ├── Chip/
│   │   ├── Icon/
│   │   └── Input/
│   ├── molecules/
│   │   ├── Card/
│   │   ├── Dialog/
│   │   ├── FormField/
│   │   ├── SearchInput/
│   │   └── Tooltip/
│   ├── organisms/
│   │   ├── DataTable/
│   │   ├── Form/
│   │   ├── NavigationBar/
│   │   └── Sidebar/
│   └── templates/
│       ├── DashboardLayout/
│       ├── AuthLayout/
│       └── ErrorLayout/
├── docs/
│   └── components/           # Documentação por componente
└── examples/
    └── showcase/             # App de demonstração

## ✅ Critérios de Aceitação

### Para cada componente contribuído:

- [ ] **Score mínimo**: 90% no `storytype analyze`
- [ ] **TypeScript**: 100% tipado com `<script setup lang="ts">`
- [ ] **Nomenclatura**: PascalCase para arquivos e pastas
- [ ] **Atomic Design**: Componente na camada correta
- [ ] **Documentação**:
  - [ ] Arquivo `.types.ts` com `Props`, `Emits`, `Slots`
  - [ ] Stories completas com todos os estados
  - [ ] README.md no diretório do componente
  - [ ] Exemplos de uso
- [ ] **Testes**: Cobertura mínima de 80%
- [ ] **Acessibilidade**: ARIA labels, keyboard navigation
- [ ] **Responsividade**: Mobile-first
- [ ] **Quasar Integration**: Usa componentes Quasar como base quando aplicável

## 🛠 Tasks

### Fase 1: Setup Inicial (Semana 1)
- [ ] **Decisão de Idioma**: Revisar e confirmar estratégia híbrida (código EN + docs bilíngue)
- [ ] Criar estrutura básica do package em `packages/components/`
- [ ] Configurar TypeScript, Vite e build otimizado
- [ ] Configurar Storybook dedicado para o pacote (com suporte a i18n)
- [ ] Criar `CONTRIBUTING.md` detalhado:
  - [ ] Guia de contribuição em PT-BR e EN
  - [ ] Explicar convenção de idiomas
  - [ ] Templates de código e documentação
- [ ] Configurar CI/CD:
  - [ ] GitHub Actions para validação automática com `storytype analyze`
  - [ ] Bloquear merge se score < 95%
  - [ ] Rodar testes automaticamente
  - [ ] Publicação automática no npm em releases
- [ ] Criar templates e checklist de migração de componentes
- [ ] Criar template de README bilíngue para componentes

### Fase 2: Inventário e Priorização (Semana 2)
- [ ] Listar todos os componentes existentes de projetos anteriores
- [ ] Categorizar por camada Atomic Design (atoms, molecules, organisms, templates)
- [ ] Avaliar estado atual de cada componente:
  - [ ] Qual score teria no `storytype analyze`
  - [ ] Possui testes?
  - [ ] Possui stories?
  - [ ] Está tipado com TypeScript?
- [ ] Priorizar componentes para migração (começar pelos mais reutilizáveis)
- [ ] Documentar dependências entre componentes

### Fase 3: Migração e Adaptação (Semanas 3-6)
Para cada componente a ser migrado:

**3.1. Preparação**
- [ ] Copiar componente para estrutura correta do package
- [ ] Renomear arquivos/pastas para PascalCase se necessário
- [ ] Mover para camada Atomic Design correta

**3.2. Refatoração para Storytype**
- [ ] Converter para `<script setup lang="ts">` se ainda não estiver
- [ ] Criar/revisar arquivo `.types.ts`:
  - [ ] Interface `[Nome]Props` com todas as props
  - [ ] Interface `[Nome]Emits` com todos os eventos
  - [ ] Interface `[Nome]Slots` se houver slots
  - [ ] Type `[Nome]Type` agregador
- [ ] Garantir que componente é puro (sem stores, routes, APIs)
- [ ] Remover lógica de negócio se houver
- [ ] Substituir por composables quando necessário

**3.3. Testes**
- [ ] Criar/atualizar arquivo `.spec.ts`
- [ ] Cobertura mínima de 80%
- [ ] Testar todos os estados possíveis
- [ ] Testar props, emits e slots

**3.4. Documentação**
- [ ] Criar/atualizar arquivo `.stories.ts`:
  - [ ] Story Default
  - [ ] Story para cada variação visual
  - [ ] Story para cada estado (loading, error, empty, etc.)
  - [ ] Story com interações (actions)
- [ ] Criar README.md no diretório do componente:
  - [ ] Descrição e uso
  - [ ] Props documentadas
  - [ ] Eventos documentados
  - [ ] Exemplos de código
  - [ ] Screenshots opcionais

**3.5. Validação**
- [ ] Rodar `storytype analyze` - score deve ser ≥ 95%
- [ ] Rodar testes - coverage ≥ 80%
- [ ] Review manual de acessibilidade (ARIA, keyboard)
- [ ] Review manual de responsividade
- [ ] Ajustar até atingir os critérios

**3.6. Integração**
- [ ] Adicionar exports no `index.ts` principal
- [ ] Atualizar documentação do package
- [ ] Commit seguindo conventional commits

### Fase 4: Documentação e Showcase (Semana 7)
- [ ] README.md principal do package com:
  - [ ] Quick start e instalação
  - [ ] Lista de todos os componentes migrados
  - [ ] Badge com total de componentes
  - [ ] Badge com score médio do Storytype
- [ ] Criar app de showcase mostrando todos os componentes
- [ ] Configurar Storybook público online
- [ ] Documentação de migração para outros desenvolvedores

### Fase 5: Comunidade e Governança (Semana 8)
- [ ] Templates de issue para:
  - [ ] Reportar bugs
  - [ ] Sugerir novos componentes
  - [ ] Melhorias em componentes existentes
- [ ] Template de PR com checklist completo de validação
- [ ] Sistema de labels (bug, enhancement, component-migration, help-wanted)
- [ ] Definir processo de review:
  - [ ] Review de código por maintainer
  - [ ] Validação automática de score ≥ 95%
  - [ ] Review de design/UX
  - [ ] Review de acessibilidade
- [ ] Criar página de contribuidores no README
- [ ] Setup de GitHub Discussions para comunidade

### Fase 6: Publicação (Semana 9)
- [ ] Publicar v1.0.0 no npmjs.org como `@storytype/components`
- [ ] Criar release notes detalhado com:
  - [ ] Lista de todos os componentes incluídos
  - [ ] Score médio alcançado
  - [ ] Breaking changes (se houver)
  - [ ] Agradecimentos a contribuidores
- [ ] Anunciar em:
  - [ ] Twitter/X
  - [ ] LinkedIn
  - [ ] Reddit (r/vuejs)
  - [ ] Vue.js Discord
  - [ ] Dev.to / Medium
- [ ] Adicionar badge "storytype-compliant" nos READMEs
- [ ] Criar landing page do projeto (opcional)

## 🏗️ Estrutura Técnica

### package.json
```json
{
  "name": "@storytype/components",
  "version": "0.1.0",
  "description": "Battle-tested Vue 3 components following Storytype standard | Componentes Vue 3 validados seguindo o padrão Storytype",
  "keywords": [
    "vue",
    "vue3",
    "typescript",
    "components",
    "storytype",
    "atomic-design",
    "quasar",
    "ui-library",
    "componentes-vue",
    "biblioteca-componentes"
  ],
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./atoms/*": {
      "import": "./dist/atoms/*/index.js",
      "types": "./dist/atoms/*/index.d.ts"
    }
  },
  "files": ["dist", "README.md", "README.pt-BR.md"],
  "scripts": {
    "build": "vite build && vue-tsc --declaration --emitDeclarationOnly",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "storybook": "storybook dev -p 6006",
    "analyze": "storytype analyze --verbose",
    "validate": "pnpm analyze && pnpm test && pnpm build"
  },
  "peerDependencies": {
    "vue": "^3.5.0",
    "quasar": "^2.16.0"
  }
}
````

### CI/CD - .github/workflows/validate.yml

```yaml
name: Validate Component Standards

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - name: Install dependencies
        run: pnpm install
      - name: Run Storytype Analyzer
        run: cd packages/components && pnpm storytype analyze --min-score 90
      - name: Run Tests
        run: cd packages/components && pnpm test
      - name: Build
        run: cd packages/components && pnpm build
```

## 🎨 Exemplo de Migração de Componente

### Antes da Migração (Componente Legado):

```typescript
// components/avatar.vue (score: ~35%)
<template>
  <div class="avatar">
    <img v-if="src" :src="src" />
    <span v-else>{{ name[0] }}</span>
  </div>
</template>

<script>
export default {
  props: ['src', 'name', 'size']
}
</script>
```

### Após Migração (100% Storytype):

```typescript
// src/atoms/Avatar/Avatar.vue
<template>
  <div
    :class="avatarClasses"
    role="img"
    :aria-label="ariaLabel"
  >
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="alt"
      @error="handleImageError"
    />
    <span v-else class="avatar__initials">
      {{ initials }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { AvatarProps } from './Avatar.types';

const props = withDefaults(defineProps<AvatarProps>(), {
  size: 'md',
  shape: 'circle',
});

const imageError = ref(false);

const initials = computed(() => {
  if (!props.name) return '?';
  const names = props.name.split(' ');
  return names.length > 1
    ? `${names[0][0]}${names[1][0]}`.toUpperCase()
    : names[0].slice(0, 2).toUpperCase();
});

const avatarClasses = computed(() => [
  'avatar',
  `avatar--${props.size}`,
  `avatar--${props.shape}`,
]);

const ariaLabel = computed(() =>
  props.alt || `Avatar de ${props.name || 'usuário'}`
);

function handleImageError() {
  imageError.value = true;
}
</script>
```

```typescript
// src/atoms/Avatar/Avatar.types.ts
export interface AvatarProps {
  /** URL da imagem do avatar */
  src?: string;
  /** Nome do usuário (usado para gerar iniciais) */
  name?: string;
  /** Texto alternativo para a imagem */
  alt?: string;
  /** Tamanho do avatar */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Formato do avatar */
  shape?: 'circle' | 'square' | 'rounded';
}

export type AvatarType = {
  props: AvatarProps;
};
```

**Melhorias aplicadas:**
✅ TypeScript com `<script setup lang="ts">`  
✅ Arquivo `.types.ts` separado  
✅ Props tipadas e documentadas  
✅ Nomenclatura PascalCase  
✅ Acessibilidade (ARIA labels)  
✅ Fallback para iniciais  
✅ Error handling na imagem  
✅ Classes BEM  
✅ Computed properties otimizadas

**Score: 35% → 98%** 🎉

## 🌍 Impacto na Comunidade

### Benefícios:

1. **Para Desenvolvedores**:
   - Componentes battle-tested de anos de produção
   - Aprende o padrão Storytype na prática
   - Portfólio de contribuições open-source

2. **Para Empresas**:
   - Componentes validados em ambientes reais
   - Código auditado, testado e refatorado
   - Padrão consistente entre projetos

3. **Para o Storytype**:
   - Aumenta adoção do padrão
   - Cria ecossistema forte
   - Referência prática da especificação
   - Prova de conceito com componentes reais

### Métricas de Sucesso (3 meses pós-lançamento):

- [ ] 100% dos componentes migrados com score ≥ 95%
- [ ] Cobertura de testes média ≥ 85%
- [ ] 500+ downloads/semana no npm
- [ ] 10+ contribuidores externos
- [ ] 25+ stars no GitHub
- [ ] 0 issues críticos abertos > 7 dias
- [ ] Storybook público com 100% dos componentes documentados

## 📚 Referências

- **Inspiração**: Vuetify, PrimeVue, ElementPlus (estrutura e governança)
- **Diferencial**:
  - Componentes reais de anos de produção adaptados para Storytype 100%
  - Score mínimo de 95% validado por CI/CD
  - Battle-tested em aplicações reais
- **Governança**: Similar ao Quasar Framework (community-driven)
- **Processo de Migração**: Documenta jornada de componentes legados → Storytype

## 🔗 Links Relacionados

- [ ] Criar repositório separado: `github.com/sidartaveloso/storytype-components`
- [ ] Ou manter como monorepo em `packages/components/`
- [ ] Site de documentação: `components.storytype.dev`
- [ ] Storybook público: `storybook.storytype.dev`

## Notes

### Componentes Existentes:

- **Origem**: Componentes desenvolvidos ao longo dos últimos anos em projetos reais
- **Vantagem**: São componentes battle-tested, já validados em produção
- **Desafio**: Adaptar para seguir 100% o padrão Storytype (tipagem, nomenclatura, testes, stories)
- **Oportunidade**: Documentar o processo de migração serve como guia para outros devs

### Processo de Migração - Checklist por Componente:

```markdown
## [Nome do Componente]

### ✅ Análise Inicial

- [ ] Score atual: \_\_\_%
- [ ] Camada Atomic Design: \_\_\_
- [ ] Possui TypeScript: sim/não
- [ ] Possui testes: sim/não (\_\_\_% coverage)
- [ ] Possui stories: sim/não
- [ ] Dependências: \_\_\_

### 🔧 Refatorações Necessárias

- [ ] Renomear arquivos/pastas para PascalCase
- [ ] Converter para <script setup lang="ts">
- [ ] Criar arquivo .types.ts
- [ ] Remover lógica de negócio (se houver)
- [ ] Adicionar/melhorar testes
- [ ] Criar stories completas
- [ ] Documentar props/emits/slots

### ✨ Pós-Migração

- [ ] Score final: \_\_\_% (meta: ≥95%)
- [ ] Coverage: \_\_\_% (meta: ≥80%)
- [ ] Stories: \_\_\_ variações
- [ ] PR criado: #\_\_\_
```

### Decisões Arquiteturais:

1. **Monorepo vs Repo Separado**: Manter como monorepo em `packages/components/`
2. **Dependência do Quasar**: Componentes podem usar Quasar como base quando faz sentido
3. **Versionamento**: Seguir semver estrito, breaking changes só em majors
4. **Licença**: MIT para máxima adoção
5. **Score Mínimo**: 95% para aceitar merge (mais rigoroso que o padrão 80%)

### 🌍 Decisão de Idioma (CRÍTICA):

**Contexto:**

- Storytype usa PT-BR na especificação (átomos, moléculas, organismos)
- Ecossistema npm é predominantemente inglês
- Comunidade Vue.js é global
- Queremos maximizar adoção sem perder identidade

**Opções avaliadas:**

#### ❌ Opção 1: Tudo em Português

```typescript
// Exports
export { Avatar, Botao, Cartao, EntradaTexto };

// Props
interface BotaoProps {
  texto: string;
  desabilitado?: boolean;
  aoClicar: () => void;
}
```

**Prós**: Alinhado com spec Storytype, identidade brasileira forte  
**Contras**: Adoção internacional limitada, difícil para devs não-BR contribuírem

#### ❌ Opção 2: Tudo em Inglês (ignorar spec)

```typescript
// Exports
export { Avatar, Button, Card, TextInput };

// Props - props em kebab-case nos templates
interface ButtonProps {
  text: string;
  disabled?: boolean;
  onClick: () => void;
}
```

**Prós**: Adoção global, padrão da indústria  
**Contras**: Desalinhado com Storytype spec, perde identidade brasileira

#### ✅ Opção 3: Híbrida Inteligente (RECOMENDADA)

```typescript
// Exports e código SEMPRE em inglês (padrão global)
export { Avatar, Button, Card, TextInput }

// Props em inglês (camelCase no código, kebab-case nos templates)
interface ButtonProps {
  text: string;
  disabled?: boolean;
  loading?: boolean;
}

// Emits em inglês com verbos no imperativo
const emit = defineEmits<{
  click: [event: MouseEvent];
  submit: [data: FormData];
}>();

// Estrutura de pastas segue Atomic Design em INGLÊS
src/
  atoms/Button/
  molecules/SearchInput/
  organisms/DataTable/
  templates/DashboardLayout/
```

**PORÉM:**

- **Documentação bilíngue** (PT-BR + EN) nos READMEs e Storybook
- **Comentários JSDoc em PT-BR** (opcional, para identidade)
- **Stories com nomes descritivos em PT-BR**
- **Issues/PRs aceitos em PT-BR ou EN**

**Exemplo concreto:**

```typescript
// Button.vue - código em inglês
<script setup lang="ts">
import { computed } from 'vue';
import type { ButtonProps } from './Button.types';

/**
 * Botão base do sistema
 * Base button component
 */
const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
});
</script>
```

```typescript
// Button.stories.ts - stories em PT-BR
export const Padrao: Story = {
  name: 'Padrão',
  args: {
    text: 'Clique aqui',
  },
};

export const Carregando: Story = {
  name: 'Estado de Carregamento',
  args: {
    text: 'Salvando...',
    loading: true,
  },
};
```

```markdown
// Button/README.md - bilíngue

# Button / Botão

[🇧🇷 Português](#português) | [🇺🇸 English](#english)

## Português

Componente base de botão que segue o padrão Storytype.

### Uso

\`\`\`vue
<Button text="Clique aqui" @click="handleClick" />
\`\`\`

### Props

- `text` (string): Texto do botão
- `disabled` (boolean): Desabilita interação
- `loading` (boolean): Mostra estado de carregamento

---

## English

Base button component following Storytype standard.

### Usage

\`\`\`vue
<Button text="Click here" @click="handleClick" />
\`\`\`

### Props

- `text` (string): Button text
- `disabled` (boolean): Disables interaction
- `loading` (boolean): Shows loading state
```

**Decisão Final:**

- ✅ **Código e exports em INGLÊS** (maximiza adoção)
- ✅ **Estrutura de pastas em INGLÊS** (atoms/, molecules/, organisms/, templates/)
- ✅ **Documentação BILÍNGUE** (PT-BR + EN)
- ✅ **Storybook com labels em PT-BR** (identidade)
- ✅ **Issues/PRs aceitos em ambos idiomas**
- ✅ **README principal bilíngue**

**Justificativa:**

1. Código em inglês é **universal** - qualquer dev entende
2. Documentação bilíngue **não adiciona complexidade ao código**
3. Mantém **identidade brasileira** do Storytype
4. Permite **contribuições globais**
5. Componentes podem ser **importados naturalmente**: `import { Button } from '@storytype/components'`
6. Template usage permanece intuitivo: `<Button text="..." />`

**Nota importante:** A spec Storytype menciona camadas em PT-BR (átomos, moléculas), mas isso é **conceitual**. Na implementação prática, usar `atoms/`, `molecules/` facilita comunicação com comunidade global Vue.js sem perder o conceito.

### 🎁 Vantagens Competitivas desta Abordagem:

1. **Adoção Global**: Qualquer dev Vue.js consegue usar `import { Button } from '@storytype/components'`
2. **Identidade Brasileira Preservada**: Documentação e stories em PT-BR mantêm origem
3. **Contribuições Abertas**: Devs internacionais podem contribuir facilmente
4. **SEO Bilíngue**: README bilíngue aparece em buscas PT-BR e EN
5. **Profissionalismo**: Mostra maturidade do projeto
6. **Barreira Zero**: Dev brasileiro usa normalmente, dev internacional também
7. **Crescimento Orgânico**: Começa BR, expande globalmente
8. **Diferencial Único**: Poucos projetos oferecem docs realmente bilíngues

**Comparação com concorrentes:**

- Vuetify: 100% inglês
- PrimeVue: 100% inglês
- ElementPlus: Inglês + algumas traduções chinesas
- **@storytype/components**: Inglês + PT-BR desde o início ✨

### Próximos Passos Após v1.0:

- Workshop/Webinar de lançamento mostrando componentes migrados
- Artigo técnico: "Como migrar componentes legados para Storytype"
- Séries de artigos deep-dive em componentes complexos
- Integração com template de projeto Storytype
- Sistema de badges para projetos que usam @storytype/components
- Criar página "Migrate from X" para outros frameworks
