import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { use, resource, createResource } from 'ember-resource';

const counter = resource(class {
  @tracked count = 0;

  intervalId = null;

  get state() {
    return this.count;
  }

  setup(interval) {
    this.intervalId = setInterval(() => this.count++, interval);
  }

  update(interval) {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.count++, interval);
  }

  teardown() {
    clearInterval(this.intervalId);
  }
});

const effect = resource(class {
  setup(effect) {
    this.destructor = effect();
  }

  update(effect) {
    if (this.destructor) this.destructor();

    this.destructor = effect();
  }

  teardown() {
    this.destructor();
  }
});

function setupEffect(context, fn) {
  return createResource(context, () => effect(fn));
}

export default class Counter extends Component {
  @use count = counter(this.args.interval);

  constructor(owner, args) {
    super(owner, args);

    setupEffect(this, () => {
      let intervalId = setInterval(() => console.log('hello!'), this.args.interval);

      return () => clearInterval(intervalId);
    });
  }
}
