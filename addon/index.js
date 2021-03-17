import { invokeHelper } from '@ember/helper';
import { getValue } from '@glimmer/tracking/primitives/cache';

export { modifier, Modifier } from './-private/modifiers';
export { Resource } from './-private/resources';

function normalizeArgs(args) {
  if (Array.isArray(args)) {
    return { positional: args };
  }

  if ('positional' in args || 'named' in args) {
    return args;
  }

  return args;
}

export function use(prototype, key, desc) {
  let resources = new WeakMap();
  let { initializer } = desc;

  return {
    get() {
      let resource = resources.get(this);

      if (!resource) {
        let { definition, thunk } = initializer.call(this);

        resource = invokeHelper(this, definition, () => {
          let args = thunk();
          let reified = normalizeArgs(args);

          return reified;
        });

        resources.set(this, resource);
      }

      return getValue(resource);
    }
  }
}
