import { invokeHelper } from '@ember/helper';
import { getValue } from '@glimmer/tracking/primitives/cache';

export { modifier, Modifier } from './-private/modifiers';
export { Resource } from './-private/resources';

export function use(prototype, key, desc) {
  let resources = new WeakMap();
  let { initializer } = desc;

  return {
    get() {
      let resource = resources.get(this);

      if (!resource) {
        let { definition, args } = initializer.call(this);

        resource = invokeHelper(this, definition, () => {
          let reified = args();

          if (Array.isArray(reified)) {
            return { positional: reified };
          }

          return reified;
        });
        resources.set(this, resource);
      }

      return getValue(resource);
    }
  }
}

/**
  * Since TS doesn't allow decorators to change their type,
  * this helper function, similar to taskFor from ember-concurrency-ts,
  * only changes the type.
  *
  * @example
  *   // counter will have the correct type, and not be the type of an instance of Counter
  *   @use counter = valueFor(new Counter(...));
  *
  *
  */
export function valueFor(instance) {
  return instance;
}
