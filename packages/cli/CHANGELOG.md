# storytype

## 0.2.3

### Patch Changes

- Corrige validação de nomenclatura: arquivos `index.ts` não são mais incorretamente reportados como precisando ser renomeados para `Index.ts`. O arquivo `index.ts` é uma convenção legítima para barrel exports.

## 0.2.2

### Patch Changes

- Corrige validação de nomenclatura com falsos positivos no CLI analyzer. Agora apenas arquivos que realmente precisam ser renomeados são reportados.
