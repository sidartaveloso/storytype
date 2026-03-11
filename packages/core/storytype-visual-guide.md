# Guia Visual — storytype

Este documento fornece visualizações e diagramas para facilitar o entendimento do padrão **storytype**.

---

## 📐 Arquitetura Geral

```
┌─────────────────────────────────────────────────────┐
│                    Application                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐         ┌──────────────┐         │
│  │   Layouts    │         │    Pages     │         │
│  │  (estrutura) │────────▶│ (containers) │         │
│  └──────────────┘         └──────┬───────┘         │
│                                  │                  │
│                                  │ renderiza        │
│                                  ▼                  │
│                    ┌──────────────────────┐         │
│                    │      Templates       │         │
│                    │      (Screens)       │         │
│                    └──────────┬───────────┘         │
│                               │                     │
│                               │ compõe              │
│                ┌──────────────┴──────────────┐      │
│                │                             │      │
│                ▼                             ▼      │
│        ┌──────────────┐            ┌──────────────┐ │
│        │  Organismos  │            │  Organismos  │ │
│        └──────┬───────┘            └──────┬───────┘ │
│               │                           │         │
│               │ compõe                    │ compõe  │
│               ▼                           ▼         │
│        ┌──────────────┐            ┌──────────────┐ │
│        │  Moléculas   │            │  Moléculas   │ │
│        └──────┬───────┘            └──────┬───────┘ │
│               │                           │         │
│               │ compõe                    │ compõe  │
│               ▼                           ▼         │
│        ┌──────────────┐            ┌──────────────┐ │
│        │    Átomos    │            │    Átomos    │ │
│        └──────────────┘            └──────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘

Legenda:
  ──▶  Usa/Renderiza
  │    Hierarquia de composição
```

---

## 🧬 Atomic Design — Hierarquia de Componentes

```mermaid
graph TB
    subgraph Pages[Pages - Containers]
        P1[PageLogin]
        P2[PageDashboard]
        P3[PagePerfil]
    end

    subgraph Templates[Templates - Screens]
        T1[LoginScreen]
        T2[DashboardScreen]
        T3[PerfilScreen]
    end

    subgraph Organismos[Organismos]
        O1[Modal]
        O2[DataTable]
        O3[UploadCropImagem]
    end

    subgraph Moleculas[Moléculas]
        M1[FormField]
        M2[SearchBar]
        M3[CardItem]
    end

    subgraph Atomos[Átomos]
        A1[Button]
        A2[Input]
        A3[Icon]
        A4[Badge]
        A5[Avatar]
    end

    P1 --> T1
    P2 --> T2
    P3 --> T3

    T1 --> M1
    T1 --> M2
    T2 --> O2
    T3 --> O3

    O2 --> M3
    O2 --> M1
    O3 --> M1

    M1 --> A1
    M1 --> A2
    M2 --> A3
    M2 --> A2
    M3 --> A4
    M3 --> A5

    style Pages fill:#ff6b6b
    style Templates fill:#4ecdc4
    style Organismos fill:#95e1d3
    style Moleculas fill:#f9ca24
    style Atomos fill:#6c5ce7
```

---

## 🔄 Padrão Container/Presentation

```
┌───────────────────────────────────────────────────────────┐
│                     Page (Container)                       │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  ✅ Acessa Stores (Pinia)                           │  │
│  │  ✅ Acessa Router (vue-router)                      │  │
│  │  ✅ Faz chamadas de API                             │  │
│  │  ✅ Gerencia estado de negócio                      │  │
│  │  ✅ Lógica de validação de negócio                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                           │                                │
│                           │ props                          │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Screen (Presentation)                   │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │  ❌ SEM Stores                                │  │  │
│  │  │  ❌ SEM Router                                │  │  │
│  │  │  ❌ SEM chamadas de API                       │  │  │
│  │  │  ✅ Apenas props, emits, v-model              │  │  │
│  │  │  ✅ Apresentação e UI                         │  │  │
│  │  │  ✅ Validação de UI                           │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
│                           │                                │
│                           │ emits                          │
│                           ▼                                │
│                    (eventos de UI)                         │
└───────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos de um Componente

```
src/components/atomos/Avatar/
│
├── Avatar.vue              ┐
├── Avatar.types.ts         │
├── Avatar.mock.ts          ├─ Arquivos obrigatórios
├── Avatar.stories.ts       │
└── index.ts                ┘

Opcionais:
├── Avatar.spec.ts          (testes unitários)
└── Avatar.scss             (estilos externos)
```

### Fluxo de Dependências

```mermaid
graph LR
    A[Avatar.types.ts] --> B[Avatar.vue]
    A --> C[Avatar.mock.ts]
    A --> D[Avatar.stories.ts]
    C --> D
    B --> E[index.ts]
    A --> E
    C --> E

    style A fill:#e74c3c
    style B fill:#3498db
    style C fill:#f39c12
    style D fill:#9b59b6
    style E fill:#2ecc71
```

---

## 🔄 Fluxo de Dados — Container/Presentation

```mermaid
sequenceDiagram
    participant User
    participant Page as Page<br/>(Container)
    participant Screen as Screen<br/>(Presentation)
    participant Store as Pinia Store
    participant API as API

    User->>Page: acessa rota
    activate Page

    Page->>Store: busca estado
    Page->>API: busca dados
    API-->>Page: retorna dados

    Page->>Screen: passa props
    activate Screen

    Screen->>User: renderiza UI
    deactivate Screen

    User->>Screen: interage (click, input)
    activate Screen

    Screen->>Page: emite evento
    deactivate Screen

    Page->>Store: atualiza estado
    Page->>API: envia dados

    Page->>Screen: atualiza props
    activate Screen
    Screen->>User: re-renderiza
    deactivate Screen

    deactivate Page
```

---

## 🎨 Decisão de Camada — Fluxograma

```mermaid
flowchart TD
    Start([Novo Componente]) --> Q1{É uma<br/>página completa?}

    Q1 -->|Sim| Templates[📄 templates/<br/>*Screen.vue]
    Q1 -->|Não| Q2{Combina outros<br/>componentes<br/>do projeto?}

    Q2 -->|Não| Atomos[⚛️ atomos/<br/>elemento mínimo]
    Q2 -->|Sim| Q3{Tem lógica de<br/>domínio complexa?}

    Q3 -->|Sim| Organismos[🏢 organismos/<br/>componente complexo]
    Q3 -->|Não| Moleculas[🧬 moleculas/<br/>componente simples]

    style Templates fill:#4ecdc4
    style Organismos fill:#95e1d3
    style Moleculas fill:#f9ca24
    style Atomos fill:#6c5ce7
    style Start fill:#2ecc71
```

---

## 📊 Lifecycle de Desenvolvimento de Componente

```mermaid
flowchart LR
    subgraph Planejamento
        A1[Definir<br/>requisitos] --> A2[Escolher<br/>camada]
    end

    subgraph Implementacao[Implementação]
        B1[Criar<br/>types.ts] --> B2[Criar<br/>vue]
        B2 --> B3[Criar<br/>mock.ts]
        B3 --> B4[Criar<br/>stories.ts]
        B4 --> B5[Criar<br/>index.ts]
    end

    subgraph Validacao[Validação]
        C1[Testar no<br/>Storybook] --> C2[Verificar<br/>checklist]
        C2 --> C3[Lint +<br/>Type check]
    end

    subgraph Review
        D1[Code<br/>Review] --> D2[Ajustes] --> D3[Merge]
    end

    A2 --> B1
    B5 --> C1
    C3 --> D1

    style Planejamento fill:#e8f5e9
    style Implementacao fill:#fff3e0
    style Validacao fill:#e3f2fd
    style Review fill:#f3e5f5
```

---

## 🔍 Decisão de Props vs Slots

```mermaid
flowchart TD
    Start([Conteúdo a passar<br/>para componente]) --> Q1{Conteúdo é<br/>simples<br/>texto/número?}

    Q1 -->|Sim| Props[✅ Use Props<br/>title, count, label]
    Q1 -->|Não| Q2{Conteúdo pode ter<br/>HTML/componentes<br/>internos?}

    Q2 -->|Sim| Q3{Uma única<br/>área de<br/>conteúdo?}
    Q2 -->|Não| Props

    Q3 -->|Sim| DefaultSlot[✅ Use default slot<br/>&lt;slot /&gt;]
    Q3 -->|Não| NamedSlots[✅ Use named slots<br/>&lt;slot name='header' /&gt;<br/>&lt;slot name='footer' /&gt;]

    style Props fill:#4ecdc4
    style DefaultSlot fill:#95e1d3
    style NamedSlots fill:#f9ca24
```

---

## 🎯 Fluxo de Comunicação entre Componentes

```
┌─────────────────────────────────────────────────────┐
│                   Parent Component                   │
│                                                     │
│  const value = ref('initial')                       │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  <ChildComponent                              │ │
│  │    :prop-value="value"                        │ │◀── Props (down)
│  │    @update="handleUpdate"                     │ │
│  │  />                                           │ │
│  └───────────────────────────────────────────────┘ │
│           │                       ▲                 │
│           │ props                 │ emits           │
│           ▼                       │                 │
│  ┌───────────────────────────────────────────────┐ │
│  │          Child Component                      │ │
│  │                                               │ │
│  │  defineProps<{ propValue: string }>()        │ │
│  │  const emit = defineEmits<{                  │ │
│  │    (e: 'update', val: string): void          │ │──▶ Emits (up)
│  │  }>()                                        │ │
│  │                                               │ │
│  │  emit('update', 'new value')                 │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

Alternativa: v-model (syntactic sugar)
─────────────────────────────────────
Parent: <ChildComponent v-model="value" />

Equivale a:
<ChildComponent
  :model-value="value"
  @update:model-value="value = $event"
/>

Child:
defineProps<{ modelValue: string }>()
emit('update:modelValue', newValue)
```

---

## 🏗️ Organização de Pastas do Projeto

```
src/
│
├── components/                    # Componentes reutilizáveis
│   ├── atomos/                   # ⚛️  Elementos mínimos
│   │   ├── Avatar/
│   │   ├── Button/
│   │   └── Icon/
│   │
│   ├── moleculas/                # 🧬 Componentes simples
│   │   ├── FormField/
│   │   ├── SearchBar/
│   │   └── CardItem/
│   │
│   ├── organismos/               # 🏢 Componentes complexos
│   │   ├── Modal/
│   │   ├── DataTable/
│   │   └── UploadCropImagem/
│   │
│   └── templates/                # 📄 Screens (apresentação)
│       ├── LoginScreen/
│       ├── DashboardScreen/
│       └── PerfilScreen/
│
├── pages/                        # 📑 Pages (containers)
│   ├── auth/
│   │   ├── PageLogin.vue
│   │   └── PageCadastro.vue
│   └── dashboard/
│       └── PageDashboard.vue
│
├── layouts/                      # 🎨 Layouts
│   ├── MainLayout.vue
│   └── AuthLayout.vue
│
├── store/                        # 🗄️  Estado global (Pinia)
│   ├── auth.ts
│   └── user.ts
│
├── api/                         # 🌐 Clientes de API
│   ├── auth-api.ts
│   └── user-api.ts
│
├── composables/                 # 🔧 Lógica reutilizável
│   ├── useAuth.ts
│   └── useApi.ts
│
├── services/                    # 🛠️  Serviços
│   └── storage.ts
│
├── utils/                       # 🧰 Utilitários
│   ├── formatters.ts
│   └── validators.ts
│
└── router/                      # 🗺️  Rotas
    └── index.ts
```

---

## 📝 BEM (Block Element Modifier) — Estrutura CSS

```scss
// Block (componente raiz)
.card-atividade {
}

// Elements (partes do componente)
.card-atividade__titulo {
}
.card-atividade__descricao {
}
.card-atividade__imagem {
}
.card-atividade__footer {
}

// Modifiers (variações)
.card-atividade--destacado {
}
.card-atividade--compacto {
}
.card-atividade--disabled {
}

// Element + Modifier
.card-atividade__titulo--grande {
}
.card-atividade__botao--primario {
}

// Estados (prefixo is/has)
.card-atividade.is-loading {
}
.card-atividade.is-selected {
}
.card-atividade.has-error {
}
```

### Exemplo Visual

```
┌────────────────────────────────────────┐
│  .card-atividade                       │  ← Block
│  ┌──────────────────────────────────┐  │
│  │  .card-atividade__titulo         │  │  ← Element
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  .card-atividade__descricao      │  │  ← Element
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  .card-atividade__footer         │  │  ← Element
│  │    ┌──────────────────────────┐  │  │
│  │    │  [Botão Primário]        │  │  │
│  │    └──────────────────────────┘  │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘

.card-atividade--destacado  ← Modifier (fundo colorido)
.card-atividade.is-loading  ← Estado (mostra spinner)
```

---

## 🎭 Storybook — Hierarquia de Stories

```
Storybook UI
│
├── 📘 Introdução
│   └── Getting Started
│
├── ⚛️  Atomos
│   ├── Avatar
│   │   ├── Default
│   │   ├── Large
│   │   ├── Small
│   │   └── Variantes
│   │
│   ├── Button
│   └── Icon
│
├── 🧬 Moleculas
│   ├── FormField
│   ├── SearchBar
│   └── CardItem
│
├── 🏢 Organismos
│   ├── Modal
│   ├── DataTable
│   └── UploadCropImagem
│
└── 📄 Templates
    ├── LoginScreen
    │   ├── Default
    │   ├── ComErro
    │   ├── Loading
    │   └── Mobile
    │
    ├── DashboardScreen
    └── PerfilScreen
```

---

## ♻️ Refatoração de Componente Legado

```mermaid
flowchart TD
    Start([Componente<br/>Legado]) --> Audit[Auditar<br/>violações]

    Audit --> V1{Usa<br/>stores?}
    V1 -->|Sim| Extract1[Extrair lógica<br/>para Page]
    V1 -->|Não| V2

    Extract1 --> V2{Usa<br/>router?}
    V2 -->|Sim| Extract2[Extrair navegação<br/>para Page]
    V2 -->|Não| V3

    Extract2 --> V3{Options<br/>API?}
    V3 -->|Sim| Convert[Converter para<br/>script setup]
    V3 -->|Não| Types

    Convert --> Types[Criar<br/>types.ts]
    Types --> Mock[Criar<br/>mock.ts]
    Mock --> Stories[Criar<br/>stories.ts]
    Stories --> Index[Atualizar<br/>index.ts]

    Index --> Test[Testar no<br/>Storybook]
    Test --> PR([Pull Request])

    style Start fill:#e74c3c
    style Extract1 fill:#e67e22
    style Extract2 fill:#e67e22
    style Convert fill:#f39c12
    style Types fill:#2ecc71
    style Mock fill:#2ecc71
    style Stories fill:#2ecc71
    style Index fill:#2ecc71
    style Test fill:#3498db
    style PR fill:#9b59b6
```

---

## 🔐 Regras de Isolamento de Componentes

```
┌──────────────────────────────────────────────────────┐
│           Camada de Apresentação (Pure)              │
│  ┌────────────────────────────────────────────────┐  │
│  │                                                │  │
│  │        atomos, moleculas, organismos           │  │
│  │                  templates                     │  │
│  │                                                │  │
│  │  ✅ Props, Emits, v-model, Slots              │  │
│  │  ✅ Computed, Watch, Refs                     │  │
│  │  ✅ Composables (UI logic)                    │  │
│  │                                                │  │
│  │  ❌ Pinia Stores                              │  │
│  │  ❌ vue-router (useRouter, useRoute)          │  │
│  │  ❌ API calls                                 │  │
│  │  ❌ localStorage/sessionStorage               │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         ▲
                         │ props
                         │
                         │ emits
                         ▼
┌──────────────────────────────────────────────────────┐
│          Camada de Containers (Smart)                │
│  ┌────────────────────────────────────────────────┐  │
│  │                    Pages                       │  │
│  │                                                │  │
│  │  ✅ Pinia Stores                              │  │
│  │  ✅ vue-router                                │  │
│  │  ✅ API calls                                 │  │
│  │  ✅ localStorage/sessionStorage               │  │
│  │  ✅ Lógica de negócio                         │  │
│  │  ✅ Renderiza 1 Screen component              │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 🎨 Padrão de Cores e Variáveis

```scss
// ✅ CORRETO — Usar variáveis CSS do Quasar
.componente {
  color: var(--q-color-primary);
  background: var(--q-color-grey-1);
  border-color: var(--q-color-grey-5);
}

// ❌ ERRADO — Cores hardcoded
.componente {
  color: #1976d2;
  background: #f5f5f5;
  border-color: #bdbdbd;
}

// Variáveis disponíveis
--q-color-primary      // Cor primária do tema
--q-color-secondary    // Cor secundária
--q-color-accent       // Cor de destaque
--q-color-positive     // Verde (sucesso)
--q-color-negative     // Vermelho (erro)
--q-color-warning      // Amarelo (aviso)
--q-color-info         // Azul (informação)
--q-color-dark         // Escuro
--q-color-grey-[1-14]  // Escala de cinzas
```

---

## 🧪 Estratégia de Testes

```
┌─────────────────────────────────────────────────────┐
│                  Componente Puro                     │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │  Testes via Storybook (visual)               │  │
│  │  ├─ Default state                            │  │
│  │  ├─ Loading state                            │  │
│  │  ├─ Error state                              │  │
│  │  ├─ Empty state                              │  │
│  │  └─ Edge cases                               │  │
│  │                                               │  │
│  │  Testes unitários Vitest (lógica complexa)   │  │
│  │  ├─ Computed properties                      │  │
│  │  ├─ Methods                                  │  │
│  │  └─ Watchers                                 │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                 Page (Container)                     │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │  Testes de integração Vitest                 │  │
│  │  ├─ Store interactions                       │  │
│  │  ├─ API calls (mocked)                       │  │
│  │  ├─ Router navigation                        │  │
│  │  └─ Business logic                           │  │
│  │                                               │  │
│  │  Testes E2E Playwright/Cypress               │  │
│  │  └─ Fluxos completos                         │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Métricas de Qualidade

```
Checklist de Qualidade do Componente
═════════════════════════════════════

Estrutura                              Status
─────────────────────────────────────────────
✅ Pasta em PascalCase                  [✓]
✅ Camada Atomic Design correta         [✓]
✅ Arquivos obrigatórios criados        [✓]
✅ Barrel export (index.ts)             [✓]

TypeScript                             Status
─────────────────────────────────────────────
✅ Interface Props definida             [✓]
✅ Interface Emits definida             [✓]
✅ Props com readonly                   [✓]
✅ Zero erros TypeScript                [✓]
✅ Zero usos de 'any'                   [✓]
✅ Zero '@ts-ignore'                    [✓]

Vue                                    Status
─────────────────────────────────────────────
✅ Usa <script setup>                   [✓]
✅ defineProps com tipos                [✓]
✅ defineEmits com tipos                [✓]
✅ Styles scoped + SCSS + BEM           [✓]
✅ Sem stores/router/API                [✓]

Documentação                           Status
─────────────────────────────────────────────
✅ Mocks criados (3+)                   [✓]
✅ Stories criadas                      [✓]
✅ Story Default                        [✓]
✅ Story Variantes                      [✓]
✅ Story Mobile                         [✓]
✅ ArgTypes documentados                [✓]
✅ JSDoc completo                       [✓]

Qualidade                              Status
─────────────────────────────────────────────
✅ Funciona no Storybook                [✓]
✅ Zero erros ESLint                    [✓]
✅ Acessibilidade (ARIA)                [✓]
✅ Responsividade                       [✓]

Score: 27/27 = 100% ✅
```

---

**Guia Visual storytype v1.0**
Criado por: Sidarta Veloso
Última atualização: 9 de março de 2026
