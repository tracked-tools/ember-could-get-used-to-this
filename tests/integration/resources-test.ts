import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import Service, { inject as service } from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { tracked } from 'tracked-built-ins';

import { Resource } from 'ember-could-get-used-to-this';

module('resources', (hooks) => {
  setupRenderingTest(hooks);

  test('basic resource API', async function (assert) {
    this.owner.register(
      'helper:test-resource',
      class extends Resource {
        @tracked value;

        setup() {
          this.value = this.args.positional[0];
        }
      }
    );

    await render(hbs`{{test-resource 'hello'}}`);

    assert.equal(this.element.textContent.trim(), 'hello');
  });

  test('resources update if args update', async function (assert) {
    this.owner.register(
      'helper:test-resource',
      class extends Resource {
        @tracked value;

        setup() {
          this.value = this.args.positional[0];
        }
      }
    );

    this.text = 'hello';

    await render(hbs`{{test-resource this.text}}`);

    assert.equal(this.element.textContent.trim(), 'hello');

    this.set('text', 'world');

    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
  });

  test('resources update if tracked state used within updates', async function (assert) {
    this.owner.register(
      'helper:test-resource',
      class extends Resource {
        @tracked value;

        setup() {
          this.value = this.args.positional[0].text;
        }
      }
    );

    this.value = tracked({ text: 'hello' });

    await render(hbs`{{test-resource this.value}}`);

    assert.equal(this.element.textContent.trim(), 'hello');

    this.value.text = 'world';

    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
  });

  test('resources can teardown', async function (assert) {
    let active = 0;

    this.owner.register(
      'helper:test-resource',
      class extends Resource {
        @tracked value;

        setup() {
          active++;
          this.value = this.args.positional[0];
        }

        teardown() {
          active--;
        }
      }
    );

    this.text = 'hello';

    await render(hbs`{{#if this.show}}{{test-resource this.text}}{{/if}}`);

    assert.equal(this.element.textContent.trim(), '');
    assert.equal(active, 0, 'no active resources yet');

    this.set('show', true);
    await settled();

    assert.equal(this.element.textContent.trim(), 'hello');
    assert.equal(active, 1, 'one active resource');

    this.set('text', 'world');
    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
    assert.equal(active, 1, 'one active resource');

    this.set('show', false);
    await settled();

    assert.equal(this.element.textContent.trim(), '');
    assert.equal(active, 0, 'resources deactivated');
  });

  test('resources are destroyed and recreated after each change if no update is present', async function (assert) {
    const resources = new Set();

    this.owner.register(
      'helper:test-resource',
      class extends Resource {
        @tracked value;

        setup() {
          resources.add(this);
          this.value = this.args.positional[0];
        }
      }
    );

    this.text = 'hello';

    await render(hbs`{{test-resource this.text}}`);

    assert.equal(this.element.textContent.trim(), 'hello');
    assert.equal(resources.size, 1, 'one resource class created');

    this.set('text', 'world');
    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
    assert.equal(resources.size, 2, 'two resource classes created');
  });

  test('resources can be passed named args', async function (assert) {
    this.owner.register(
      'helper:test-resource',
      class extends Resource {
        @tracked value;

        setup() {
          this.value = this.args.named.text;
        }
      }
    );

    await render(hbs`{{test-resource text='hello'}}`);

    assert.equal(this.element.textContent.trim(), 'hello');
  });

  test('resources can define an update hook', async function (assert) {
    const resources = new Set();

    this.owner.register(
      'helper:test-resource',
      class extends Resource {
        @tracked value;

        setup() {
          resources.add(this);
          this.value = this.args.positional[0];
        }

        update() {
          this.value = this.args.positional[0];
        }
      }
    );

    this.text = 'hello';

    await render(hbs`{{test-resource this.text}}`);

    assert.equal(this.element.textContent.trim(), 'hello');
    assert.equal(resources.size, 1, 'one resource class created');

    this.set('text', 'world');
    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
    assert.equal(resources.size, 1, 'same resource class used to update');
  });

  test('resources can inject services', async function (assert) {
    let serviceInstance;

    this.owner.register(
      'service:text',
      class extends Service {
        constructor(...args) {
          super(...args);
          serviceInstance = this;
        }

        @tracked text = 'hello';
      }
    );

    this.owner.register(
      'helper:test-resource',
      class extends Resource {
        @service text;

        get value() {
          return this.text.text;
        }
      }
    );

    this.text = 'hello';

    await render(hbs`{{test-resource this.text}}`);

    assert.equal(this.element.textContent.trim(), 'hello');

    serviceInstance.text = 'world';
    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
  });

  test('value and lifecycle hooks are not entangled', async function (assert) {
    let resolve;

    class LoadData extends Resource {
      @tracked isLoading = true;

      get value() {
        return {
          isLoading: this.isLoading,
        };
      }

      setup() {
        assert.step('setup');
        this.loadData();
      }

      async loadData() {
        await new Promise((r) => {
          resolve = r;
        });

        this.isLoading = false;
      }
    }

    this.owner.register('helper:load-data', LoadData);

    await render(hbs`
      {{#let (load-data) as |data|}}
        {{data.isLoading}}
      {{/let}}
    `);

    assert.equal(
      this.element.textContent.trim(),
      'true',
      'correct value returned'
    );
    assert.verifySteps(['setup'], 'setup was run');

    resolve();
    await settled();

    assert.equal(
      this.element.textContent.trim(),
      'false',
      'correct value returned'
    );
    assert.verifySteps([], 'setup was not run again');
  });
});
