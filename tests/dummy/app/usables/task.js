import { defineProperty } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { task } from 'ember-concurrency';
import { setUsableManager } from 'ember-usable';

const PATCHED = new WeakMap();
const AUTO = new WeakSet();

class TaskRunnerManager {
  createUsable(context, taskDef) {
    let prototype = Object.getPrototypeOf(context);
    let key = `task_${guidFor(taskDef)}`;

    let patched = PATCHED.get(taskDef);

    if (!patched.has(context.prototype)) {
      defineProperty(prototype, key, taskDef);
      patched.add(prototype);
    }

    let isAuto = AUTO.has(taskDef);
    let task = context[key];

    return { context, task, isAuto };
  }

  getState({ task }) {
    return task;
  }

  setupUsable({ context, task, isAuto }) {
    if (isAuto) {
      task.perform(context);
    }
  }

  updateUsable({ context, task, isAuto }) {
    if (isAuto) {
      task.perform(context);
    }
  }

  teardownUsable() {}
}

const createTaskRunnerManager = () => {
  return new TaskRunnerManager();
}

export function taskRunner(fn) {
  let taskDef = task(fn);

  PATCHED.set(taskDef, new WeakSet());

  setUsableManager(taskDef, createTaskRunnerManager);

  taskDef.auto = () => {
    AUTO.add(taskDef);
    return taskDef;
  }

  return taskDef;
}
