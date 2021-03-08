ember-could-get-used-to-this
==============================================================================

![I Could Get Used To This](https://i.giphy.com/media/Q5LcPLQxjB1ZOm7Ozs/giphy.webp)

Ember Could Get Used To This is an opinionated take on the future direction of
non-component template constructs in Ember. See [this blog post](https://www.pzuraq.com/introducing-use/)
for more details!


Compatibility
------------------------------------------------------------------------------

* Ember.js 3.23 or above
* Ember CLI v2.13 or above
* Node.js v8 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-could-get-used-to-this
```


Usage
------------------------------------------------------------------------------

### Functions

You can export plain functions from inside `app/helpers` and use them as helpers. This only support positional arguments:

```js
// app/helpers/add-numbers.js
export default function addNumbers(number1, number2) {
  return number1 + number2;
}
```

```hbs
{{! Usage in template: outputs 13 }}
{{add-numbers 10 3}}
```

### Modifiers

You can define your own modifiers. You can do so using either a class-based or a functional style.

Modifiers can be used like this:

```hbs
<button {{on "click" this.onClick}}>My button</button>
```

#### Functional modifiers

```js
import { modifier } from 'ember-could-get-used-to-this';

export default modifier(function on(element, [eventName, handler]) => {
  element.addEventListener(eventName, handler);

  return () => {
    element.removeEventListener(eventName, handler);
  }
});
```

#### Class-based modifiers

```js
// app/modifiers/on.js
import { Modifier } from 'ember-could-get-used-to-this';

export default class On extends Modifier {
  event = null;
  handler = null;

  setup() {
    let [event, handler] = this.args.positional;

    this.event = event;
    this.handler = handler;

    this.element.addEventListener(event, handler);
  }

  teardown() {
    let { event, handler } = this;

    this.element.removeEventListener(event, handler);
  }
}
```

### Resources

Resources are, as of now, also defined in the `app/helpers` directory. They can be either used directly in your templates, or by a JavaScript class.

```js
// app/helpers/counter.js
import { tracked } from '@glimmer/tracking';
import { Resource } from 'ember-could-get-used-to-this';

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
```

This example resource can be used from a template like this:

```hbs
{{#let (counter @interval) as |count|}}
  {{count}}
{{/let}}
```

Or in a JS class:

```js
// app/components/counter-wrapper.js
import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import Counter from 'my-app/helpers/counter';

export default class CounterWrapper extends Component {
  @use count = new Counter(() => [this.args.interval]);
}
```

```hbs
{{! app/components/counter-wrapper.hbs }}
{{this.count}}
```

If you provide an `update` function in your resource, this will be called every time an argument changes. Else, the resource will be torn down and re-created each time an argument changes.

You can also provide named arguments to a resource, which are available via `this.args.named`.


## Usage with TypeScript

There is a helper function that can be imported to give a hint to TypeScript
that the value of a Resource is different from the instance of a Resource.

```ts
import Component from '@glimmer/component';
import { use, valueFor } from 'ember-could-get-used-to-this';
import Counter from 'my-app/helpers/counter';

interface Args {
  interval: number;
}

export default class CounterWrapper extends Component<Args> {
  // count is of type `number`
  @use count = valueFor(new Counter(() => [this.args.interval]));
}
```

The Resource definition itself has a generic type argument similar to Modifiers:

```ts
interface Args {
  positional: [number];
}

class Counter extends Resource<Args> {
  @tracked count = 0;
  // ...
}
```

But by contrast to Modifiers, the default Args type for a Resource is
```ts
export type LazyTrackedArgs = {
  positional?: Array<unknown>;
  named?: Record<string, unknown>;
};
```
due to the differing ways a Resource can be passed args.


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
