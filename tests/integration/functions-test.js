import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, setupOnerror } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { tracked } from 'tracked-built-ins';

module('Integration | functions', (hooks) => {
  setupRenderingTest(hooks);

  test('functions can be used as helpers', async function(assert) {
    this.owner.register('helper:add', (a, b) => a + b);

    await render(hbs`{{add 1 2}}`);

    assert.equal(this.element.textContent.trim(), '3');
  });

  test('functional helpers update if args update', async function(assert) {
    this.owner.register('helper:add', (a, b) => a + b);

    this.first = 1;
    this.second = 2;

    await render(hbs`{{add this.first this.second}}`);

    assert.equal(this.element.textContent.trim(), '3');

    this.set('first', 2);
    this.set('second', 3);

    await settled();

    assert.equal(this.element.textContent.trim(), '5');
  });

  test('functional helpers update if tracked state used within updates', async function(assert) {
    this.owner.register('helper:add', ({ a, b }) => a + b);

    this.value = tracked({ a: 1, b: 2 });

    await render(hbs`{{add this.value}}`);

    assert.equal(this.element.textContent.trim(), '3');

    this.value.a = 2;
    this.value.b = 3;

    await settled();

    assert.equal(this.element.textContent.trim(), '5');
  });

  test('functional helpers cache correctly', async function(assert) {
    let count = 0;
    this.owner.register('helper:count', () => ++count);

    this.first = 1;
    this.second = 2;

    await render(hbs`{{count this.first}} {{this.second}}`);

    assert.equal(this.element.textContent.trim(), '1 2');
    assert.equal(count, 1, 'calculated once');

    this.set('second', 3);

    await settled();
    assert.equal(this.element.textContent.trim(), '1 3');
    assert.equal(count, 1, 'returned cached value');

    this.set('first', 2);

    assert.equal(this.element.textContent.trim(), '2 3');
    assert.equal(count, 2, 'cached value updated');
  });

  test('functional helpers throw an error if passed hash args', async function(assert) {
    let add = (a, b) => a + b;
    this.owner.register('helper:add', add);

    setupOnerror((e) => {
      assert.equal(e.message, 'Assertion Failed: Functional helpers cannot receive hash parameters. `add` received first,second');
    });

    await render(hbs`{{add first=1 second=2}}`);
  });
});
