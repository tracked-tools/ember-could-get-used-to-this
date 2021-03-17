import {
  setHelperManager,
  capabilities as helperCapabilities,
} from '@ember/helper';
import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import { setOwner } from '@ember/application';
import { destroy, associateDestroyableChild } from '@ember/destroyable';

export class Resource {
  static from(thunk) {
    return { definition: this, thunk };
  }

  constructor(owner, args, previousInstance) {
    setOwner(this, owner);

    this.args = args;
    this.previousInstance = previousInstance;
  }
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
    let owner = this.owner;

    let instance;

    let cache = createCache(() => {
      let oldInstance = instance;

      instance = setupInstance(cache, Class, owner, args, oldInstance);

      return instance;
    });

    return cache;
  }

  getValue(cache) {
    let instance = getValue(cache);

    return instance;
  }

  getDestroyable(cache) {
    return cache;
  }

  getDebugName(fn) {
    return fn.name || '(anonymous function)';
  }
}

function setupInstance(cache, Class, owner, args, oldInstance) {
  let instance = new Class(owner, args, oldInstance);

  associateDestroyableChild(cache, instance);

  if (oldInstance !== undefined) {
    destroy(oldInstance);
  }

  return instance;
}

setHelperManager((owner) => new ResourceManager(owner), Resource);
