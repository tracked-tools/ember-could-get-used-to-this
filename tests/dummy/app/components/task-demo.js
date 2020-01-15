import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-usable';
import { timeout } from 'ember-concurrency';
import { taskRunner } from '../usables/task';

export default class Counter extends Component {
  @tracked progress = 0;

  get stateText() {
    let { progress } = this;

    if (progress < 49) {
      return "Just started..."
    } else if (progress < 100) {
      return "Halfway there..."
    } else {
      return "Done!"
    }
  }

  @use uploadFile = taskRunner(function*() {
    // autotrack argument, not really important, just causes the task to restart
    this.url = this.args.url;

    while (this.progress < 100) {
      yield timeout(200);
      let newProgress = this.progress + Math.floor(Math.random() * 6) + 5;
      this.progress = Math.min(100, newProgress);
    }

    return '(upload result data)';
  }).enqueue().auto();
}
