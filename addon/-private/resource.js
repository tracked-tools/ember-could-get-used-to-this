import { setOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { setUsableManager } from './use';
import { destroy } from './destroyable';

const ARGS_MESSAGE = `When creating resources directly with \`use(this, myResource())\`, you must provide a function that retrieves arguments rather than the arguments themselves. This allows resources to autotrack and update the arguments. The return value of this function must be an array of arguments.

  BAD: \`use(this, myResource(this.args.someDynamicValue)\`

  BAD: \`use(this, myResource(() => this.args.someDynamicValue))\`

  GOOD: \`use(this, myResource(() => [this.args.someDynamicValue]))\`
`

function reifyArgs(args, isStatic) {
  if (isStatic === true) {
    let [getArgs] = args;

    assert(ARGS_MESSAGE, getArgs === undefined || typeof getArgs === 'function');

    if (getArgs !== undefined) {
      args = getArgs();

      assert(ARGS_MESSAGE, Array.isArray(args));
    }
  }

  return args;
}

class ResourceManager {
  constructor(owner) {
    this.owner = owner;
  }

  createUsable(context, Resource) {
    let instance = new Resource(this.owner);

    setOwner(instance, this.owner);

    return { instance, usable: Resource };
  }

  getState({ instance }) {
    return instance.state;
  }

  setupUsable({ instance }, { args, isStatic }) {
    if (instance.setup) {
      instance.setup(...reifyArgs(args, isStatic));
    }
  }

  updateUsable(bucket, { args, isStatic }) {
    let { instance } = bucket;

    if (instance.update) {
      instance.update(...reifyArgs(args, isStatic));
    } else {
      this.teardownUsable(bucket);
      bucket.instance = this.createResource(bucket).instance;
      this.setupResource(bucket, { args, isStatic });
    }
  }

  teardownUsable({ instance }) {
    destroy(instance);
    instance.teardown();
  }
}

const createResourceManager = owner => new ResourceManager(owner);

export function resource(Resource) {
  setUsableManager(Resource, createResourceManager);

  return (...args) => ({ usable: Resource, args });
}
