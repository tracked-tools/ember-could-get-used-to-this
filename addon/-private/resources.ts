import {
  setHelperManager,
  capabilities as helperCapabilities,
} from '@ember/helper';
import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import { setOwner } from '@ember/application';
import {
  destroy,
  registerDestructor,
  associateDestroyableChild,
} from '@ember/destroyable';

export class Resource {
  constructor(ownerOrThunk, args) {
    if (typeof ownerOrThunk === 'function') {
      return { definition: this.constructor, args: ownerOrThunk };
    }

    setOwner(this, ownerOrThunk);
    this.args = args;
  }

  setup() {}
}

class ResourceManager {
  capabilities = helperCapabilities('3.23', {
    hasValue: true,
    hasDestroyable: true,
  });

  constructor(owner) {
    this.owner = owner;
  }

  createHelper(Class, args) {
    const { update, teardown } = Class.prototype;

    const hasUpdate = typeof update === 'function';
    const hasTeardown = typeof teardown === 'function';

    const owner = this.owner;

    let instance;
    let cache;

    if (hasUpdate) {
      cache = createCache(() => {
        if (instance === undefined) {
          instance = setupInstance(cache, Class, owner, args, hasTeardown);
        } else {
          instance.update();
        }

        return instance;
      });
    } else {
      cache = createCache(() => {
        if (instance !== undefined) {
          destroy(instance);
        }

        instance = setupInstance(cache, Class, owner, args, hasTeardown);

        return instance;
      });
    }

    return cache;
  }

  getValue(cache) {
    const instance = getValue(cache);

    return instance.value;
  }

  getDestroyable(cache) {
    return cache;
  }

  getDebugName(fn) {
    return fn.name || '(anonymous function)';
  }
}

function setupInstance(cache, Class, owner, args, hasTeardown) {
  const instance = new Class(owner, args);
  associateDestroyableChild(cache, instance);
  instance.setup();

  if (hasTeardown) {
    registerDestructor(instance, () => instance.teardown());
  }

  return instance;
}

setHelperManager((owner) => new ResourceManager(owner), Resource);
