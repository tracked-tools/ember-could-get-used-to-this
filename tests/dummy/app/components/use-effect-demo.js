import Component from '@glimmer/component'
import { use, effect } from 'ember-usable'

export default class UseEffectDemo extends Component {
  constructor(...args) {
    super(...args)
    use(this, effect(() => {
      console.log('running effect...')
      return () => console.log('stopping effect...')
    }))
  }
}