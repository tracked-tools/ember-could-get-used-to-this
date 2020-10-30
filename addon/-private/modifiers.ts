import {
  setModifierManager,
  capabilities as modifierCapabilities,
} from '@ember/modifier';
import { destroy, registerDestructor } from '@ember/destroyable';
import { setOwner } from '@ember/application';

class FunctionalModifierManager {
  capabilities = modifierCapabilities('3.22');

  createModifier(fn, args) {
    return { fn, args, element: undefined, destructor: undefined };
  }

  installModifier(state, element) {
    state.element = element;
    this.setupModifier(state);
  }

  updateModifier(state) {
    this.destroyModifier(state);
    this.setupModifier(state);
  }

  setupModifier(state) {
    const { fn, args, element } = state;

    state.destructor = fn(element, args.positional, args.named);
  }

  destroyModifier(state) {
    if (typeof state.destructor === 'function') {
      state.destructor();
    }
  }

  getDebugName(fn) {
    return fn.name || '(anonymous function)';
  }
}

const FUNCTIONAL_MODIFIER_MANAGER = new FunctionalModifierManager();
const FUNCTIONAL_MODIFIER_MANAGER_FACTORY = () => FUNCTIONAL_MODIFIER_MANAGER;

export function modifier(fn) {
  return setModifierManager(FUNCTIONAL_MODIFIER_MANAGER_FACTORY, fn);
}

////////////

export class Modifier {
  constructor(owner, args) {
    setOwner(this, owner);
    this.args = args;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setup() {}
}

class ClassModifierManager {
  capabilities = modifierCapabilities('3.22');

  constructor(owner) {
    this.owner = owner;
  }

  createModifier(Class, args) {
    const instance = new Class(this.owner, args);

    return {
      Class,
      instance,
      args,
      element: undefined,
    };
  }

  installModifier(state, element) {
    state.element = element;
    this.setupModifier(state);
  }

  updateModifier(state) {
    if (typeof state.instance.update === 'function') {
      state.instance.update();
    } else {
      this.destroyModifier(state);

      const { Class, args } = state;

      state.instance = new Class(this.owner, args);

      this.setupModifier(state);
    }
  }

  setupModifier({ instance, element }) {
    instance.element = element;
    instance.setup();

    if (typeof instance.teardown === 'function') {
      registerDestructor(instance, () => instance.teardown());
    }
  }

  destroyModifier(state) {
    destroy(state.instance);
  }

  getDebugName(Class) {
    return Class.name || '(anonymous class)';
  }
}

setModifierManager((owner) => new ClassModifierManager(owner), Modifier);
