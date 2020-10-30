// This is a carbon copy of the types for `@ember/modifier` (with a few
// additions), which in turn are originally lifted from  https://github.com/ember-modifier/ember-modifier/blob/master/types/%40ember/modifier/index.d.ts
declare module '@ember/helper' {
  export function setHelperManager<Manager extends unknown = unknown>(
    factory: (owner: unknown) => Manager,
    obj: object
  ): void;

  export function capabilities(
    version: string,
    capabilities?: Record<string, boolean>
  ): unknown;

  // Based on: https://emberjs.github.io/rfcs/0626-invoke-helper.html#detailed-design

  import type { Cache } from '@glimmer/tracking/primitives/cache';

  interface TemplateArgs {
    positional?: unknown[];
    named?: Record<string, unknown>;
  }

  export type HelperDefinition<T = unknown> = object;

  export function invokeHelper<T = unknown>(
    parentDestroyable: object,
    definition: HelperDefinition<T>,
    computeArgs?: (context: object) => TemplateArgs
  ): Cache<T>;
}
