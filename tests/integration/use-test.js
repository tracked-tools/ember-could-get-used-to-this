import { module, test } from 'qunit';
import { tracked } from 'tracked-built-ins';
import { action } from '@ember/object';
import { settled } from '@ember/test-helpers';
import { waitFor } from '@ember/test-waiters';

import { use, Resource } from 'ember-could-get-used-to-this';

module('@use', () => {
  test('it works', async function (assert) {
    class TestResource extends Resource {
      @tracked value;

      setup() {
        this.value = this.args.positional[0];
      }
    }

    class MyClass {
      @use test = new TestResource(() => ['hello'])
    }

    let instance = new MyClass();

    assert.equal(instance.test, 'hello');
  });

  test('resources update if args update', async function (assert) {
    class TestResource extends Resource {
      @tracked value;

      setup() {
        this.value = this.args.positional[0];
      }
    }

    class MyClass {
      @tracked text = 'hello'

      @use test = new TestResource(() => [this.text])
    }

    let instance = new MyClass();

    assert.equal(instance.test, 'hello');

    instance.text = 'world';

    assert.equal(instance.test, 'world');
  });

  module('async updates', function() {
    test('it works', async function(assert) {
      class Invoker extends Resource {
        @tracked result = Infinity;

        get value() {
          return this.result;
        }

        @action
        @waitFor
        async invoke() {
          let { fn, args } = this.args.named;

          await Promise.resolve();

          this.result = await fn(...args);
        }

        setup() {
          this.invoke();
        }

        update() {
          this.invoke();
        }
      }

      class MyClass {
        @tracked left = 0;
        @tracked right = 0;

        @use test = new Invoker(() => {
          return {
            named: {
              fn: this.math,
              args: [this.left, this.right],
            }
          }
        });

        @action
        @waitFor
        math(left, right) {
          return Promise.resolve(left + right);
        }
      }

      let instance = new MyClass();

      assert.equal(instance.test, Infinity, 'initial value');
      await settled();

      assert.equal(instance.test, 0, 'after async functions run');

      instance.left = 1;
      await settled();

      assert.equal(instance.test, 1);

      instance.right = 3;
      await settled();

      assert.equal(instance.test, 4);

      instance.left = 2;
      await settled();

      assert.equal(instance.test, 5);
    });
  });
});
