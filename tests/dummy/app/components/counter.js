import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { use, resource, effect } from 'ember-resource';

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

export default class Counter extends Component {
  @use count = counter(this.args.interval);

  // _count = use(this, counter(() => [this.args.interval]));

  // @use
  // get count() {
  //   return counter(() => [this.args.interval]);
  // }

  constructor(owner, args) {
    super(owner, args);

    use(this, effect(() => {
      let intervalId = setInterval(() => console.log('hello!'), this.args.interval);

      return () => clearInterval(intervalId);
    }));
  }
}
