import { setUsableManager } from './use';

class EffectManager {
  createUsable() {
    return {};
  }

  getState() {}

  setupUsable(bucket, { fn }) {
    bucket.next = fn();
  }

  updateUsable(bucket, { fn }) {
    let { next } = bucket;

    if (typeof next === 'object' && typeof next.update === 'function') {
      next.update();
    } else {
      this.teardownUsable(bucket);
      this.setupUsable(bucket, { fn });
    }
  }

  teardownUsable(bucket) {
    let { next } = bucket;

    if (typeof next === 'function') {
      next();
    } else if (typeof next === 'object' && typeof next.destroy === 'function') {
      next.destroy();
    }
  }
}

const Effect = {};

setUsableManager(Effect, () => new EffectManager())

export function effect(fn) {
  return { usable: Effect, fn };
}
