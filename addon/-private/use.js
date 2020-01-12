import { run } from '@ember/runloop';
import { getOwner } from '@ember/application'
import { memoComputation } from './tracking';
import { registerDestroyable } from './destroyable';

const REGISTERED_USABLES = new Set();

run.backburner.on('end', () => {
  REGISTERED_USABLES.forEach(usable => usable.state);
});

const USABLE_MANAGERS = new WeakMap();
const USABLE_MANAGER_INSTANCES = new WeakMap();

export function setUsableManager(obj, manager) {
  USABLE_MANAGERS.set(obj, manager);
}

function getUsableManager(obj, owner) {
  let managers = USABLE_MANAGER_INSTANCES.get(owner);
  let creator = USABLE_MANAGERS.get(obj);

  if (managers === undefined) {
    managers = new WeakMap();
    USABLE_MANAGER_INSTANCES.set(owner, managers);
  }

  let manager = managers.get(creator);

  if (manager === undefined) {
    manager = creator(owner);
    managers.set(creator, manager);
  }

  return manager;
}

export function createResource(context, _definitionThunk) {
  let definitionThunk;

  if (typeof _definitionThunk === 'object') {
    _definitionThunk.isStatic = true;

    definitionThunk = () => _definitionThunk;
  } else {
    definitionThunk = _definitionThunk;
  }

  let manager, instance, destroyed = false;

  let owner = getOwner(context);

  let createOrUpdate = memoComputation(() => {
    let definition = definitionThunk();

    manager = getUsableManager(definition.usable, owner);

    if (!instance) {
      instance = manager.createUsable(context, definition.usable);
      manager.setupUsable(instance, definition);
    } else {
      manager.updateUsable(instance, definition);
    }
  });

  // bootstrap
  createOrUpdate();

  let api = {
    get state() {
      createOrUpdate();

      return manager.getState(instance);
    },

    teardown() {
      if (destroyed) return;

      REGISTERED_USABLES.delete(this);

      manager.teardownUsable(instance);
      destroyed = true;
    }
  };

  registerDestroyable(context, () => api.teardown());

  REGISTERED_USABLES.add(api);

  return api;
}

export function use(prototypeOrThis, keyOrDef, desc) {
  if (typeof keyOrDef === 'function' || typeof keyOrDef === 'object') {
    return createResource(prototypeOrThis, keyOrDef);
  }

  let resources = new WeakMap();
  let { initializer } = desc;

  return {
    get() {
      let resource = resources.get(this);

      if (!resource) {
        resource = createResource(this, initializer.bind(this));
        resources.set(this, resource);
      }

      return resource.state;
    }
  }
}
