import { module, test } from 'qunit';
import { tracked } from 'tracked-built-ins';
import EmberObject from '@ember/object';
import { observes } from '@ember-decorators/object';

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

  test('can observe values', async function (assert) {
    let didChange = false;

    class TestResource extends Resource {
      @tracked value;

      setup() {
        this.value = this.args.positional[0];
      }
    }

    class MyClass extends EmberObject {
      @tracked text = 'hello'

      @use test = new TestResource(() => [this.text])

      @observes('test')
      observer() {
        didChange = true;
      }
    }

    let instance = new MyClass();

    assert.equal(instance.test, 'hello');

    instance.text = 'world';

    assert.equal(instance.test, 'world');

    assert.equal(didChange, true);
  });
});
