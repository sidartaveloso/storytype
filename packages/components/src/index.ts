/**
 * @storytype/components
 *
 * Biblioteca de componentes Vue 3 validados seguindo o padrão Storytype.
 * Battle-tested Vue 3 components following the Storytype standard.
 *
 * Cada componente possui 5 arquivos: `.vue`, `.types.ts`, `.stories.ts`,
 * `.mock.ts` e `index.ts`. Todos os componentes usam Quasar como base.
 *
 * Every component ships 5 files: `.vue`, `.types.ts`, `.stories.ts`,
 * `.mock.ts` and `index.ts`. Components are Quasar-based.
 */

// --- Atoms ---
export { default as Avatar } from './components/atoms/avatar/Avatar.vue';
export * from './components/atoms/avatar/Avatar.types';
export { default as TitleUserName } from './components/atoms/title-user-name/TitleUserName.vue';
export * from './components/atoms/title-user-name/TitleUserName.types';

// --- Molecules ---
export { default as AlertDialog } from './components/molecules/alert-dialog/AlertDialog.vue';
export * from './components/molecules/alert-dialog/AlertDialog.types';
export { default as CardAction } from './components/molecules/card-action/CardAction.vue';
export * from './components/molecules/card-action/CardAction.types';
export { default as DateInput } from './components/molecules/date-input/DateInput.vue';
export * from './components/molecules/date-input/DateInput.types';
export { default as GroupCards } from './components/molecules/group-cards/GroupCards.vue';
export * from './components/molecules/group-cards/GroupCards.types';
export { default as NewPassword } from './components/molecules/new-password/NewPassword.vue';
export * from './components/molecules/new-password/NewPassword.types';
export { default as RadioList } from './components/molecules/radio-list/RadioList.vue';
export * from './components/molecules/radio-list/RadioList.types';

// --- Templates ---
export { default as PrintSheet } from './components/templates/print-sheet/PrintSheet.vue';
export * from './components/templates/print-sheet/PrintSheet.types';

// --- Utils ---
export * from './utils/print-geometry';
