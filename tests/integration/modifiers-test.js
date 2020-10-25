import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import Service, { inject as service } from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { tracked } from 'tracked-built-ins';

import { modifier, Modifier } from 'ember-could-get-used-to-this';

module('functional modifiers', (hooks) => {
  setupRenderingTest(hooks);

  test('functions can be used as modifiers', async function (assert) {
    this.owner.register(
      'modifier:set-text',
      modifier((element, [text]) => (element.innerText = text))
    );

    await render(hbs`<span {{set-text 'hello'}}></span>`);

    assert.equal(this.element.textContent.trim(), 'hello');
  });

  test('functional modifiers update if args update', async function (assert) {
    this.owner.register(
      'modifier:set-text',
      modifier((element, [text]) => (element.innerText = text))
    );

    this.text = 'hello';

    await render(hbs`<span {{set-text this.text}}></span>`);

    assert.equal(this.element.textContent.trim(), 'hello');

    this.set('text', 'world');

    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
  });

  test('functional modifiers update if tracked state used within updates', async function (assert) {
    this.owner.register(
      'modifier:set-text',
      modifier((element, [{ text }]) => (element.innerText = text))
    );

    this.value = tracked({ text: 'hello' });

    await render(hbs`<span {{set-text this.value}}></span>`);

    assert.equal(this.element.textContent.trim(), 'hello');

    this.value.text = 'world';

    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
  });

  test('functional modifiers can return destructor', async function (assert) {
    let active = 0;

    this.owner.register(
      'modifier:set-text',
      modifier((element, [text]) => {
        active++;
        element.innerText = text;

        return () => active--;
      })
    );

    this.text = 'hello';

    await render(
      hbs`{{#if this.show}}<span {{set-text this.text}}></span>{{/if}}`
    );

    assert.equal(this.element.textContent.trim(), '');
    assert.equal(active, 0, 'no active modifiers yet');

    this.set('show', true);
    await settled();

    assert.equal(this.element.textContent.trim(), 'hello');
    assert.equal(active, 1, 'one active modifier');

    this.set('text', 'world');
    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
    assert.equal(active, 1, 'one active modifier');

    this.set('show', false);
    await settled();

    assert.equal(this.element.textContent.trim(), '');
    assert.equal(active, 0, 'modifiers deactivated');
  });

  test('functional modifiers can be passed named args', async function (assert) {
    let setText = modifier(
      (element, positional, { text }) => (element.innerText = text)
    );
    this.owner.register('modifier:set-text', setText);

    await render(hbs`<span {{set-text text='hello'}}></span>`);

    assert.equal(this.element.textContent.trim(), 'hello');
  });
});

module('class modifiers', (hooks) => {
  setupRenderingTest(hooks);

  test('classes can be used as modifiers', async function (assert) {
    this.owner.register(
      'modifier:set-text',
      class extends Modifier {
        setup() {
          this.element.innerText = this.args.positional[0];
        }
      }
    );

    await render(hbs`<span {{set-text 'hello'}}></span>`);

    assert.equal(this.element.textContent.trim(), 'hello');
  });

  test('class modifiers update if args update', async function (assert) {
    this.owner.register(
      'modifier:set-text',
      class extends Modifier {
        setup() {
          this.element.innerText = this.args.positional[0];
        }
      }
    );

    this.text = 'hello';

    await render(hbs`<span {{set-text this.text}}></span>`);

    assert.equal(this.element.textContent.trim(), 'hello');

    this.set('text', 'world');

    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
  });

  test('class modifiers update if tracked state used within updates', async function (assert) {
    this.owner.register(
      'modifier:set-text',
      class extends Modifier {
        setup() {
          this.element.innerText = this.args.positional[0].text;
        }
      }
    );

    this.value = tracked({ text: 'hello' });

    await render(hbs`<span {{set-text this.value}}></span>`);

    assert.equal(this.element.textContent.trim(), 'hello');

    this.value.text = 'world';

    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
  });

  test('class modifiers can teardown', async function (assert) {
    let active = 0;

    this.owner.register(
      'modifier:set-text',
      class extends Modifier {
        setup() {
          active++;
          this.element.innerText = this.args.positional[0];
        }

        teardown() {
          active--;
        }
      }
    );

    this.text = 'hello';

    await render(
      hbs`{{#if this.show}}<span {{set-text this.text}}></span>{{/if}}`
    );

    assert.equal(this.element.textContent.trim(), '');
    assert.equal(active, 0, 'no active modifiers yet');

    this.set('show', true);
    await settled();

    assert.equal(this.element.textContent.trim(), 'hello');
    assert.equal(active, 1, 'one active modifier');

    this.set('text', 'world');
    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
    assert.equal(active, 1, 'one active modifier');

    this.set('show', false);
    await settled();

    assert.equal(this.element.textContent.trim(), '');
    assert.equal(active, 0, 'modifiers deactivated');
  });

  test('class modifiers are destroyed and recreated after each change if no update is present', async function (assert) {
    let modifiers = new Set();

    this.owner.register(
      'modifier:set-text',
      class extends Modifier {
        setup() {
          modifiers.add(this);
          this.element.innerText = this.args.positional[0];
        }
      }
    );

    this.text = 'hello';

    await render(hbs`<span {{set-text this.text}}></span>`);

    assert.equal(this.element.textContent.trim(), 'hello');
    assert.equal(modifiers.size, 1, 'one modifier class created');

    this.set('text', 'world');
    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
    assert.equal(modifiers.size, 2, 'two modifier classes created');
  });

  test('class modifiers can be passed named args', async function (assert) {
    this.owner.register(
      'modifier:set-text',
      class extends Modifier {
        setup() {
          this.element.innerText = this.args.named.text;
        }
      }
    );

    await render(hbs`<span {{set-text text='hello'}}></span>`);

    assert.equal(this.element.textContent.trim(), 'hello');
  });

  test('class modifiers can define an update hook', async function (assert) {
    let modifiers = new Set();

    this.owner.register(
      'modifier:set-text',
      class extends Modifier {
        setup() {
          modifiers.add(this);
          this.element.innerText = this.args.positional[0];
        }

        update() {
          this.element.innerText = this.args.positional[0];
        }
      }
    );

    this.text = 'hello';

    await render(hbs`<span {{set-text this.text}}></span>`);

    assert.equal(this.element.textContent.trim(), 'hello');
    assert.equal(modifiers.size, 1, 'one modifier class created');

    this.set('text', 'world');
    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
    assert.equal(modifiers.size, 1, 'same modifier class used to update');
  });

  test('class modifiers can inject services', async function (assert) {
    let serviceInstance;

    this.owner.register(
      'service:text',
      class extends Service {
        constructor() {
          super(...arguments);
          serviceInstance = this;
        }

        @tracked text = 'hello';;
      }
    )

    this.owner.register(
      'modifier:set-text',
      class extends Modifier {
        @service text;

        setup() {
          this.element.innerText = this.text.text;
        }
      }
    );

    this.text = 'hello';

    await render(hbs`<span {{set-text this.text}}></span>`);

    assert.equal(this.element.textContent.trim(), 'hello');

    serviceInstance.text = 'world';
    await settled();

    assert.equal(this.element.textContent.trim(), 'world');
  });
});
