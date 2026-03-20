# O Que é Storytype?

Storytype é um padrão abrangente de desenvolvimento de componentes Vue 3 que combina princípios de **Atomic Design** com o padrão **Container/Presentation** para criar aplicações escaláveis, de fácil manutenção e testáveis.

## O Problema

Aplicações Vue modernas frequentemente enfrentam desafios à medida que crescem:

- **Proliferação de Componentes**: Componentes se tornam cada vez mais difíceis de organizar e encontrar
- **Responsabilidades Mistas**: Lógica de negócio, apresentação e gerenciamento de estado ficam emaranhados
- **Complexidade de Testes**: Componentes fortemente acoplados são difíceis de testar isoladamente
- **Padrões Inconsistentes**: Diferentes desenvolvedores abordam a arquitetura de componentes de maneiras diferentes
- **Baixa Reutilização**: Componentes construídos para casos de uso específicos não podem ser facilmente reutilizados

## A Solução

Storytype aborda esses desafios através de três princípios fundamentais:

### 1. Hierarquia Atomic Design

Componentes são organizados em cinco níveis distintos, cada um com um propósito claro:

```
src/components/
├── atomos/           # Blocos de construção básicos (botões, inputs, ícones)
├── moleculas/        # Combinações simples (barras de busca, cards)
├── organismos/       # Funcionalidades complexas (navegação, formulários)
├── templates/        # Layouts de página sem lógica de negócio
└── pages/            # Containers de lógica de negócio (stores, router)
```

### 2. Separação Container/Presentation

Cada funcionalidade complexa é dividida em duas partes:

- **Pages (Containers)**: Gerenciam lógica de negócio, estado, roteamento
- **Screens (Presentation)**: Componentes de apresentação pura dirigidos por props

```vue
<!-- PerfilPage.vue: Container -->
<template>
  <PerfilScreen :usuario="store.usuario" @salvar="store.atualizar" />
</template>

<script setup lang="ts">
import { useUsuarioStore } from '@/store/usuario';
import PerfilScreen from './PerfilScreen.vue';

const store = useUsuarioStore();
</script>
```

```typescript
// PerfilScreen.types.ts
export interface PerfilScreenType {
  usuario: Usuario;
}

export interface PerfilScreenProps {
  usuario: Usuario;
}

export interface PerfilScreenEmits {
  salvar: [dados: Partial<Usuario>];
}
```

```vue
<!-- PerfilScreen.vue: Presentation -->
<template>
  <div class="perfil">
    <!-- Lógica de apresentação pura -->
  </div>
</template>

<script setup lang="ts">
import type { PerfilScreenProps, PerfilScreenEmits } from './PerfilScreen.types';

defineProps<PerfilScreenProps>();
defineEmits<PerfilScreenEmits>();
</script>
```

### 3. Desenvolvimento Orientado por Storybook

Todo componente (exceto Pages) possui stories abrangentes no Storybook que demonstram:

- Todos os estados e variações possíveis
- Controles interativos para props
- Teste de comportamento responsivo
- Verificação de acessibilidade
- Exemplos de uso e documentação

## Principais Benefícios

### Para Desenvolvedores

- **Modelo Mental Claro**: Saiba exatamente onde colocar novo código
- **Testes Fáceis**: Componentes isolados testam em isolamento
- **Onboarding Rápido**: Novos membros da equipe entendem o padrão imediatamente
- **Componentes Reutilizáveis**: Construa uma vez, use em todo lugar

### Para Equipes

- **Base de Código Consistente**: Todos seguem os mesmos padrões
- **Desenvolvimento Mais Rápido**: Reutilize componentes existentes em vez de reconstruir
- **Melhor Colaboração**: Designers e desenvolvedores compartilham Storybook como terreno comum
- **Dívida Técnica Reduzida**: Padrões claros previnem deterioração arquitetural

### Para Projetos

- **Escalabilidade**: Arquitetura que cresce sem se tornar incontrolável
- **Manutenibilidade**: Fácil encontrar e modificar componentes
- **Segurança de Tipos**: TypeScript garante confiabilidade
- **Documentação Viva**: Storybook fornece documentação de componentes sempre atualizada

## Stack Tecnológica

Storytype é projetado para desenvolvimento moderno com Vue 3:

- **Vue 3.5+** com Composition API e `<script setup>`
- **TypeScript 5+** com modo strict
- **Storybook 10+** para desenvolvimento e documentação de componentes
- **Quasar 2+** (opcional) para componentes de UI
- **Vitest** para testes unitários
- **ESLint** com regras personalizadas para garantir o padrão

## Para Quem é Isso?

Storytype é ideal para:

- **Equipes** construindo aplicações Vue médias a grandes
- **Desenvolvedores Solo** que desejam bases de código de fácil manutenção
- **Design Systems** que precisam de documentação de componentes
- **Projetos Open Source** que requerem diretrizes claras de contribuição
- **Aplicações Enterprise** com necessidades de manutenção de longo prazo

## Próximos Passos

Pronto para começar? Continue para o guia de [Início Rápido](/pt-br/guide/quick-start) para configurar seu primeiro projeto Storytype.
