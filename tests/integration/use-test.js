import { module, test } from 'qunit';
import { tracked } from 'tracked-built-ins';

import { use, Resource } from 'ember-could-get-used-to-this';

module('@use', () => {
  module('positional args', function() {
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
  });

  module('named args', function() {

    test('it works', async function (assert) {
      class TestResource extends Resource {
        @tracked value;

        setup() {
          this.value = this.args.named.str;
        }
      }

      class MyClass {
        @use test = new TestResource(() => ({ str: 'hello'}))
      }

      let instance = new MyClass();

      assert.equal(instance.test, 'hello');
    });


    test('resources update if args update', async function (assert) {
      class TestResource extends Resource {
        @tracked value;

        setup() {
          this.value = this.args.named.str;
        }
      }

      class MyClass {
        @tracked text = 'hello'

        @use test = new TestResource(() => ({ str: this.text }))
      }

      let instance = new MyClass();

      assert.equal(instance.test, 'hello');

      instance.text = 'world';

      assert.equal(instance.test, 'world');
    });

  });
});
