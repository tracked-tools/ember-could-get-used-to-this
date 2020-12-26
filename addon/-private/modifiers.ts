import {
  setModifierManager,
  capabilities as modifierCapabilities,
} from '@ember/modifier';
import { destroy, registerDestructor } from '@ember/destroyable';
import { setOwner } from '@ember/application';
import { TemplateArgs } from '@ember/helper';

type Owner = unknown;

export type FunctionModifierDefinition = (
  element: Element,
  positional: TemplateArgs['positional'],
  named: TemplateArgs['named']
) => undefined | (() => void);

type StateBucket = {
  fn: FunctionModifierDefinition;
  args: TemplateArgs;
  element?: Element;
  destructor?(): void;
};

class FunctionalModifierManager {
  readonly capabilities = modifierCapabilities('3.22');

  createModifier(
    fn: FunctionModifierDefinition,
    args: TemplateArgs
  ): StateBucket {
    return { fn, args, element: undefined, destructor: undefined };
  }

  installModifier(state: StateBucket, element: Element): void {
    state.element = element;
    this.setupModifier(state);
  }

  updateModifier(state: StateBucket): void {
    this.destroyModifier(state);
    this.setupModifier(state);
  }

  setupModifier(state: StateBucket): void {
    const { fn, args, element } = state;

    state.destructor = fn(element!, args.positional, args.named);
  }

  destroyModifier(state: StateBucket): void {
    if (typeof state.destructor === 'function') {
      state.destructor();
    }
  }

  private getDebugName(fn: (...args: any[]) => void) {
    return fn.name || '(anonymous function)';
  }
}

const FUNCTIONAL_MODIFIER_MANAGER = new FunctionalModifierManager();
const FUNCTIONAL_MODIFIER_MANAGER_FACTORY = () => FUNCTIONAL_MODIFIER_MANAGER;

export function modifier(fn: FunctionModifierDefinition): void {
  return setModifierManager(FUNCTIONAL_MODIFIER_MANAGER_FACTORY, fn);
}

////////////

export abstract class Modifier<Args extends TemplateArgs = TemplateArgs> {
  protected readonly args: Args;
  protected readonly element?: Element;

  constructor(owner: Owner, args: Args) {
    setOwner(this, owner);
    this.args = args;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setup(): void {}

  abstract update?(): void;
  abstract teardown?(): void;
}

type ClassModifierStateBucket = {
  Class: new (owner: Owner, args: TemplateArgs) => Modifier;
  instance: Modifier;
  args: TemplateArgs;
  element?: Element;
};

class ClassModifierManager {
  readonly capabilities = modifierCapabilities('3.22');

  private readonly owner: Owner;

  constructor(owner: Owner) {
    this.owner = owner;
  }

  createModifier<Args extends TemplateArgs = TemplateArgs>(
    Class: new (owner: Owner, args: Args) => Modifier,
    args: Args
  ): ClassModifierStateBucket {
    const instance = new Class(this.owner, args);

    return {
      Class,
      instance,
      args,
      element: undefined,
    };
  }

  installModifier(state: ClassModifierStateBucket, element: Element): void {
    state.element = element;
    this.setupModifier(state);
  }

  updateModifier(state: ClassModifierStateBucket): void {
    if (typeof state.instance.update === 'function') {
      // @ts-expect-error Assignment to `protected readonly`.
      state.instance.args = state.args;
      state.instance.update();
    } else {
      this.destroyModifier(state);

      const { Class, args } = state;

      state.instance = new Class(this.owner, args);

      this.setupModifier(state);
    }
  }

  setupModifier({ instance, element }: ClassModifierStateBucket): void {
    // @ts-expect-error Assignment to `protected readonly`.
    instance.element = element;
    instance.setup();

    if (typeof instance.teardown === 'function') {
      registerDestructor(instance, () => instance.teardown!());
    }
  }

  destroyModifier(state: ClassModifierStateBucket): void {
    destroy(state.instance);
  }

  private getDebugName(Class: new (...args: any[]) => unknown) {
    return Class.name || '(anonymous class)';
  }
}

setModifierManager((owner: Owner) => new ClassModifierManager(owner), Modifier);
