// Types for compiled templates
declare module 'ember-could-get-used-to-this/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}
