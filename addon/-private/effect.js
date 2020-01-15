import Ember from 'ember';
import { setUsableManager } from './use';
import { DEBUG } from '@glimmer/env';
import { assert } from '@ember/debug';

let assertOnDirty;

if (DEBUG) {
  let reference = Ember.__loader.require('@glimmer/reference');

  let dirty = reference.dirty;
  let shouldAssert = false;

  reference.dirty = (...args) => {
    assert(`Attempted to update Ember application state from an effect. Effects are for reflecting your app state into contexts that are not controlled by Ember directly, such as external plugins, operating system integrations, libraries, etc. Attempting to update state internal to your Ember application can cause logical errors, performance issues, and problematic behaviors in general, and should be avoided. Instead, app state should be derived from source values declaratively.
    `, shouldAssert === false);

    return dirty(...args);
  }

  assertOnDirty = (fn) => {
    shouldAssert = true;

    try {
      fn();
    } finally {
      shouldAssert = false;
    }
  }
}

class EffectManager {
  createUsable() {
    return {};
  }

  getState() {}

  setupUsable(bucket, { fn }) {
    bucket.next = DEBUG ? assertOnDirty(fn) : fn();
  }

  updateUsable(bucket, { fn }) {
    let { next } = bucket;

    if (typeof next === 'object' && typeof next.update === 'function') {
      if (DEBUG) {
        assertOnDirty(() => next.update());
      } else {
        next.update();
      }
    } else {
      this.teardownUsable(bucket);
      this.setupUsable(bucket, { fn });
    }
  }

  teardownUsable(bucket) {
    let { next } = bucket;

    if (typeof next === 'function') {
      if (DEBUG) {
        assertOnDirty(next);
      } else {
        next();
      }
    } else if (typeof next === 'object' && typeof next.destroy === 'function') {
      if (DEBUG) {
        assertOnDirty(() => next.destroy());
      } else {
        next.destroy();
      }
    }
  }
}

const MANAGED_EFFECT = {};
setUsableManager(MANAGED_EFFECT, () => new EffectManager())

export function effect(fn) {
  let definition = Object.create(MANAGED_EFFECT);
  definition.fn = fn;

  return definition;
}
