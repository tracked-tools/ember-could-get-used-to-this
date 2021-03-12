import { module, test } from 'qunit';
import { tracked } from 'tracked-built-ins';
import { settled, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { use, Effect } from 'ember-could-get-used-to-this';
import { setupRenderingTest } from 'ember-qunit';

module('Effect', function (hooks) {

  module('Rendering', function (hooks) {
    setupRenderingTest(hooks);

    test('it works', async function (assert) {
      this.owner.register('helper:assert-rendered', () => assert.step('assert render'));
      this.owner.register('helper:effect-under-test',
        class extends Effect {
          setup() { assert.step('Effect#setup'); }
          teardown() { assert.step('Effect#teardown'); }
        }
      );

      this.isOpen = true;

      await render(hbs`
        {{assert-rendered}}
        {{#if this.isOpen}}
          {{effect-under-test}}
        {{/if}}
        {{assert-rendered}}
      `);

      assert.verifySteps([
        'assert render',
        'assert render',
        'Effect#setup',
      ]);

      this.setProperties({ isOpen: false });
      await settled();

      assert.verifySteps(['Effect#teardown']);

      this.setProperties({ isOpen: true });
      await settled();
      this.setProperties({ isOpen: false });
      await settled();

      assert.verifySteps(['Effect#setup', 'Effect#teardown']);
    });

    test('update is called when args change', async function (assert) {
      class TrackedContext {
        @tracked first = 0;
        @tracked second = 0;
      }

      this.owner.register('helper:effect-under-test',
        class extends Effect {
          setup() {
            this.args.positional[0];
            assert.step('Effect#setup');
          }
          update() { assert.step('Effect#update'); }
        }
      );

      this.ctx = new TrackedContext();

      // TRACKING FRAME STARTS
      await render(hbs`{{effect-under-test this.ctx.first this.ctx.second}}`);
      // TRACKING FRAME ENDS
      // SETUP CALLED -> no tracked entanglement
      //
        // are effects not supposed to have the ability to update?

      assert.verifySteps(['Effect#setup']);

      this.ctx.first = 1;
      await settled();

      assert.verifySteps(['Effect#update'], 'change to first arg causes update');

      this.ctx.second = 1;
      await settled();

      assert.verifySteps([], 'change to second arg does not cause update');
    });
  });


  module('in JS', function (hooks) {
    test('it works', async function (assert) {
      class MyEffect extends Effect {
        setup() { assert.step('MyEffect#setup'); }
      }

      class TestContext {
        @effect myEffect = new MyEffect();
      }

      new TestContext();
      await settled();

      assert.verifySteps(['MyEffect#setup']);
    })
  });
});

import { invokeHelper } from '@ember/helper';

function effect(prototype, key, desc) {
  let { initializer } = desc;

  return {
    initializer() {
      let effect = initializer.call(this);

      console.log(effect, desc);

      invokeHelper(this, effect, () => {
        return {};
      });
    }
  }
}
