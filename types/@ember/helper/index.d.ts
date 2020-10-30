// This is a carbon copy of the types for `@ember/modifier` (with a few
// additions), which in turn are originally lifted from
// https://github.com/ember-modifier/ember-modifier/blob/master/types/%40ember/modifier/index.d.ts
// It's also extended based on:
// https://emberjs.github.io/rfcs/0625-helper-managers.html#api-docs
// https://emberjs.github.io/rfcs/0626-invoke-helper.html#detailed-design
declare module '@ember/helper' {
  import type { Cache } from '@glimmer/tracking/primitives/cache';

  export interface TemplateArgs {
    positional?: unknown[];
    named?: Record<string, unknown>;
  }

  export interface HelperCapabilitiesOptions {
    hasValue?: boolean;
    hasDestroyable?: boolean;
    hasScheduledEffect?: boolean;
  }

  const HELPER_CAPABILITIES_VERSION: unique symbol;
  const HELPER_CAPABILITIES_OPTIONS: unique symbol;

  type HelperCapabilities<
    V extends string,
    O extends HelperCapabilitiesOptions = never
  > = {
    readonly [HELPER_CAPABILITIES_VERSION]: V;
    readonly [HELPER_CAPABILITIES_OPTIONS]: O;
  };

  export interface HelperManager<HelperStateBucket = unknown> {
    capabilities: HelperCapabilities<string, any>;

    createHelper(
      definition: HelperDefinition,
      args: TemplateArgs
    ): HelperStateBucket;

    getValue?(bucket: HelperStateBucket): unknown;

    runEffect?(bucket: HelperStateBucket): void;

    getDestroyable?(bucket: HelperStateBucket): object;
  }

  export function setHelperManager<Manager extends HelperManager<unknown>>(
    factory: (owner: unknown) => Manager,
    obj: object
  ): void;

  export function capabilities<
    V extends string,
    O extends HelperCapabilitiesOptions
  >(version: V, capabilities?: O): HelperCapabilities<V, O>;

  const HELPER_DEFINITION: unique symbol;

  export type HelperDefinition<T = unknown> = T & {
    readonly [HELPER_DEFINITION]: true;
  };

  export function invokeHelper<T = unknown>(
    parentDestroyable: object,
    definition: HelperDefinition<T>,
    computeArgs?: (context: object) => TemplateArgs
  ): Cache<T>;
}
