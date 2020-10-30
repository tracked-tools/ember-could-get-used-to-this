import { assert } from '@ember/debug';
import { invokeHelper } from '@ember/helper';
import { getValue } from '@glimmer/tracking/primitives/cache';

export { modifier, Modifier } from './-private/modifiers';
export { Resource } from './-private/resources';

interface DecoratorPropertyDescriptor extends PropertyDescriptor {
  initializer?(): unknown;
}

export function use(
  _prototype: unknown,
  key: string | symbol,
  desc: PropertyDescriptor
): PropertyDescriptor {
  const resources = new WeakMap();
  const { initializer } = desc as DecoratorPropertyDescriptor;

  return {
    get() {
      let resource = resources.get(this);

      if (!resource) {
        assert(
          `Missing initializer for '${String(key)}'.`,
          typeof initializer === 'function'
        );
        const { definition, args } = initializer.call(this);

        resource = invokeHelper(this, definition, () => {
          const reified = args();

          if (Array.isArray(reified)) {
            return { positional: reified };
          }

          return reified;
        });
        resources.set(this, resource);
      }

      return getValue(resource);
    },
  };
}
