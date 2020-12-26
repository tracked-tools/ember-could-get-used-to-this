// Based on: https://github.com/emberjs/rfcs/blob/master/text/0615-autotracking-memoization.md
declare module '@glimmer/tracking/primitives/cache' {
  const CACHE: unique symbol;

  export type Cache<T = unknown> = {
    readonly [CACHE]: T;
  };

  /**
   * Receives a function, and returns a wrapped version of it that memoizes
   * based on autotracking. The function will only rerun whenever any tracked
   * values used within it have changed. Otherwise, it will return the previous
   * value.
   */
  export function createCache<T>(fn: () => T): Cache<T>;

  /**
   * Gets the value of a cache created with `createCache`.
   */
  export function getValue<T>(cache: Cache<T>): T;

  /**
   * Can be used to check if a memoized function is constant. If no tracked
   * state was used while running a memoized function, it will never rerun,
   * because nothing can invalidate its result. `isConst` can be used to
   * determine if a memoized function is constant or not, in order to optimize
   * code surrounding that function.
   *
   * If called on a cache that hasn't been accessed yet, it will throw an error.
   * This is because there's no way to know if the function will be constant or
   * not yet, and so this helps prevent missing an optimization opportunity on
   * accident.
   */
  export function isConst(cache: Cache): boolean;
}
