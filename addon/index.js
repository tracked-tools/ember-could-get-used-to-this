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
