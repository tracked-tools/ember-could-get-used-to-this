import { memoComputation } from './-private/tracking';
import { run } from '@ember/runloop';

const REGISTERED_RESOURCES = new Set();

run.backburner.on('end', () => {
  REGISTERED_RESOURCES.forEach(resource => resource.state);
});

function registerDestroyable(context, destroy) {
  let oldWillDestroy = context.willDestroy;

  context.willDestroy = function() {
    if (oldWillDestroy) oldWillDestroy.call(context);

    destroy();
  };
}

export function resource(Resource) {
  return (...args) => [Resource, ...args];
}

export function createResource(context, definition) {
  let instance, destroyed = false;

  let createOrUpdate = memoComputation(() => {
    let [Resource, ...args] = definition();

    if (!instance) {
      instance = new Resource();
      instance.setup(...args);
    } else {
      if (instance.update) {
        instance.update(...args);
      } else {
        instance.teardown();
        instance = new Resource();
        instance.setup(...args);
      }
    }
  });

  let api = {
    get state() {
      createOrUpdate();

      return instance.state;
    },

    teardown() {
      if (destroyed) return;

      REGISTERED_RESOURCES.delete(this);

      instance.teardown()
      destroyed = true;
    }
  };

  registerDestroyable(context, () => api.teardown());

  REGISTERED_RESOURCES.add(api);

  return api;
}

export function use(prototype, key, desc) {
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
