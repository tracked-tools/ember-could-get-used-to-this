import {
  setHelperManager,
  capabilities as helperCapabilities,
  HelperManager,
  HelperDefinition,
  TemplateArgs,
} from '@ember/helper';
import { assert } from '@ember/debug';

export type FunctionHelperDefinition = HelperDefinition<
  (...args: any[]) => unknown
>;

type StateBucket = { fn: FunctionHelperDefinition; args: TemplateArgs };

class FunctionalHelperManager implements HelperManager<StateBucket> {
  readonly capabilities = helperCapabilities('3.23', {
    hasValue: true,
  });

  createHelper(fn: FunctionHelperDefinition, args: TemplateArgs): StateBucket {
    return { fn, args };
  }

  getValue({ fn, args }: StateBucket) {
    assert(
      `Functional helpers cannot receive hash parameters. \`${this.getDebugName(
        fn
      )}\` received ${Object.keys(args.named ?? {})}`,
      args.named && Object.keys(args.named).length === 0
    );

    return fn(...(args.positional ?? []));
  }

  private getDebugName(fn: (...args: any[]) => void) {
    return fn.name || '(anonymous function)';
  }
}

const FUNCTIONAL_HELPER_MANAGER = new FunctionalHelperManager();

setHelperManager(() => FUNCTIONAL_HELPER_MANAGER, Function.prototype);
