let DESTROYABLES = new WeakMap();

export function registerDestroyable(context, destructor) {
  let destroyables = DESTROYABLES.get(context);

  if (destroyables === undefined) {
    destroyables = [];

    if (typeof context.willDestroy === 'function') {
      let oldWillDestroy = context.willDestroy;

      context.willDestroy = function() {
        oldWillDestroy.call(this);

        destroy(this);
      };
    }

    DESTROYABLES.set(context, destroyables);
  }

  destroyables.push(destructor);
}

export function destroy(context) {
  let destroyables = DESTROYABLES.get(context);

  if (destroyables !== undefined) {
    for (let destroyable of destroyables) {
      destroyable();
    }

    DESTROYABLES.delete(context);
  }
}
