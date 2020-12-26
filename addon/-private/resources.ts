import {
  setHelperManager,
  capabilities as helperCapabilities,
  TemplateArgs,
  HelperManager,
  HelperDefinition,
} from '@ember/helper';
import {
  createCache,
  getValue,
  Cache,
} from '@glimmer/tracking/primitives/cache';
import { setOwner } from '@ember/application';
import {
  destroy,
  registerDestructor,
  associateDestroyableChild,
} from '@ember/destroyable';

type Owner = unknown;

type Thunk = (...args: any[]) => void;

export abstract class Resource<
  Args extends TemplateArgs = TemplateArgs,
  T = unknown
> {
  protected readonly args!: Args;

  constructor(ownerOrThunk: Owner | Thunk, args: Args) {
    if (typeof ownerOrThunk === 'function') {
      // @ts-expect-error This is naughty.
      return { definition: this.constructor, args: ownerOrThunk };
    }

    setOwner(this, ownerOrThunk);
    this.args = args;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setup(): void {}

  abstract update?(): void;
  abstract teardown?(): void;

  abstract value: T;
}

class ResourceManager implements HelperManager<Cache<Resource>> {
  readonly capabilities = helperCapabilities('3.23', {
    hasValue: true,
    hasDestroyable: true,
  });

  private readonly owner: Owner;

  constructor(owner: Owner) {
    this.owner = owner;
  }

  createHelper<Args extends TemplateArgs = TemplateArgs>(
    Class: HelperDefinition<new (owner: Owner, args: Args) => Resource>,
    args: Args
  ): Cache<Resource> {
    const { update, teardown } = Class.prototype as Resource;

    const hasUpdate = typeof update === 'function';
    const hasTeardown = typeof teardown === 'function';

    const owner = this.owner;

    let instance: Resource | undefined;
    let cache: Cache<Resource>;

    if (hasUpdate) {
      cache = createCache(() => {
        if (instance === undefined) {
          instance = setupInstance(cache, Class, owner, args, hasTeardown);
        } else {
          instance.update!();
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

  getValue(cache: Cache<Resource>) {
    const instance = getValue(cache);

    return instance.value;
  }

  getDestroyable(cache: Cache): Cache {
    return cache;
  }

  private getDebugName(fn: (...args: any[]) => void) {
    return fn.name || '(anonymous function)';
  }
}

function setupInstance<T extends Resource>(
  cache: Cache,
  Class: new (owner: Owner, args: TemplateArgs) => T,
  owner: Owner,
  args: TemplateArgs,
  hasTeardown: boolean
): T {
  const instance = new Class(owner, args);
  associateDestroyableChild(cache, instance);
  instance.setup();

  if (hasTeardown) {
    registerDestructor(instance, () => instance.teardown!());
  }

  return instance;
}

setHelperManager((owner: Owner) => new ResourceManager(owner), Resource);
