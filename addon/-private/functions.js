import {
  setHelperManager,
  capabilities as helperCapabilities,
} from '@ember/helper';
import { assert } from '@ember/debug';

class FunctionalHelperManager {
  capabilities = helperCapabilities('3.23', {
    hasValue: true,
  });

  createHelper(fn, args) {
    return { fn, args };
  }

  getValue({ fn, args }) {
    assert(
      `Functional helpers cannot receive hash parameters. \`${this.getDebugName(fn)}\` received ${Object.keys(args.named)}`,
      Object.keys(args.named).length === 0
    );

    return fn(...args.positional);
  }

  getDebugName(fn) {
    return fn.name || '(anonymous function)';
  }
}

const FUNCTIONAL_HELPER_MANAGER = new FunctionalHelperManager();

setHelperManager(() => FUNCTIONAL_HELPER_MANAGER, Function.prototype);
