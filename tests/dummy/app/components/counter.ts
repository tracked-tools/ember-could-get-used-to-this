import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { use, Resource } from 'ember-could-get-used-to-this';

class Counter extends Resource {
  @tracked count = 0;

  intervalId = null;

  get value() {
    return this.count;
  }

  setup() {
    this.intervalId = setInterval(() => this.count++, this.args.positional[0]);
  }

  update() {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.count++, this.args.positional[0]);
  }

  teardown() {
    clearInterval(this.intervalId);
  }
}

export default class CounterWrapper extends Component {
  @use count = new Counter(() => [this.args.interval]);
}
