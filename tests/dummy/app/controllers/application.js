import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ApplicationController extends Controller {
  @tracked interval = 1000;
  @tracked showCount = true;
  @tracked runEffectDemo = true;

  @action
  toggleShowCount() {
    this.showCount = !this.showCount;
  }

  @action
  increaseInterval() {
    this.interval = this.interval + 100;
  }

  @action
  decreaseInterval() {
    if (this.interval !== 100) {
      this.interval = this.interval - 100;
    }
  }

  @action
  toggleEffectDemo() {
    this.runEffectDemo = !this.runEffectDemo
  }
}
