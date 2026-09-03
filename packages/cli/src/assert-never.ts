/**
 * Exhaustiveness guard for a discriminated union.
 *
 * Called in the `default` of a switch over the discriminant: while every case
 * is handled the argument is `never` and this compiles; add a variant to the
 * union and forget its case, and the call stops compiling. Reaching it at
 * runtime means a value came from outside the type system.
 *
 * The standard names this `casoImpossivel`; the name is in English here
 * because storytype is an English project (see the Idioma rule).
 */
export function assertNever(value: never, context = 'value'): never {
  throw new Error(`Unhandled ${context}: ${JSON.stringify(value)}`);
}
