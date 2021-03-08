export type LazyTrackedArgs = {
  positional?: Array<unknown>;
  named?: Record<string, unknown>;
};

type ConstructorFn<Args extends LazyTrackedArgs> = (() => Args) | (() => Args['positional']) | (() => Args['named']);

export const use: PropertyDecorator;
export class Resource<Args extends LazyTrackedArgs> {
  protected args: Args;

  // This is a lie, but makes the call site nice.
  // Resources should not define a constructor.
  constructor(fn: ConstructorFn<Args>);

  get value(): unknown;
}

/**
 * No-op TypeScript helper for helping reshape the type of the Resource in TypeScript files
 */
export function valueFor<SomeResource extends Resource<LazyTrackedArgs>>(instance: SomeResource): SomeResource['value'];

