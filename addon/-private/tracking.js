import Ember from 'ember';

const {
  value: getTagSnapshot,
  validate: validateTagSnapshot,
  // createTag,
} = Ember.__loader.require('@glimmer/reference');

const {
  track: trackComputation,
  consume: consumeTag,
} = Ember.__loader.require('@ember/-internals/metal');


export function memoComputation(fn) {
  let tag;
  let snapshot;

  return () => {
    if (!tag || !validateTagSnapshot(tag, snapshot)) {
      tag = trackComputation(fn);
      snapshot = getTagSnapshot(tag);
    }

    consumeTag(tag);
  };
}

export {
  trackComputation,
  getTagSnapshot,
  validateTagSnapshot,
};
