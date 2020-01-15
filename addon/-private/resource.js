import { setOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { setUsableManager } from './use';
import { destroy } from './destroyable';

const ARGS_MESSAGE = `When creating resources directly with \`use(this, myResource())\`, you must provide a function that retrieves arguments rather than the arguments themselves. This allows resources to autotrack and update the arguments. The return value of this function may be an array of arguments or a single argument value.

  BAD: \`use(this, myResource(this.args.someDynamicValue)\`

  Good: \`use(this, myResource(() => this.args.someDynamicValue))\`

  GOOD: \`use(this, myResource(() => [this.args.someDynamicValue]))\`
`

function reifyArgs(args, isStatic) {
  if (isStatic === true) {
    let [getArgs] = args;

    assert(ARGS_MESSAGE, getArgs === undefined || typeof getArgs === 'function');

    if (getArgs !== undefined) {
      args = getArgs();

      if (!Array.isArray(args)) {
        args = [args];
      }
    }
  }

  return args;
}

class ResourceManager {
  constructor(owner) {
    this.owner = owner;
  }

  createUsable(context, { Resource }, isStatic) {
    let instance = new Resource(this.owner);

    setOwner(instance, this.owner);

    return { instance, Resource, isStatic };
  }

  getState({ instance }) {
    return instance.state;
  }

  setupUsable({ instance, isStatic }, { args }) {
    if (instance.setup) {
      instance.setup(...reifyArgs(args, isStatic));
    }
  }

  updateUsable(bucket, { args }) {
    let { instance } = bucket;

    if (instance.update) {
      instance.update(...reifyArgs(args, bucket.isStatic));
    } else {
      this.teardownUsable(bucket);
      bucket.instance = this.createResource(bucket).instance;
      this.setupResource(bucket, { args });
    }
  }

  teardownUsable({ instance }) {
    destroy(instance);
    instance.teardown();
  }
}

const MANAGED_RESOURCE = {};
setUsableManager(MANAGED_RESOURCE, owner => new ResourceManager(owner));

export function resource(Resource) {
  return (...args) => {
    let definition = Object.create(MANAGED_RESOURCE);
    definition.Resource = Resource;
    definition.args = args;

    return definition;
  }
}
