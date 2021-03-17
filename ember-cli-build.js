'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  let app = new EmberAddon(defaults, {
    // Add options here
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  if ('@embroider/webpack' in app.dependencies()) {
    const { Webpack } = require('@embroider/webpack'); // eslint-disable-line
    return require('@embroider/compat') // eslint-disable-line
      .compatBuild(app, Webpack, {
        staticAddonTestSupportTrees: true,
        staticAddonTrees: true,
        // temporarily disabled to allow tests to dynamically register helpers
        staticHelpers: false,
        staticComponents: true,
        packageRules: [
          {
            // Components used during testing,
            // these are dynamically registered during the tests
            package: 'dummy',
            components: {
              '{{add}}': { safeToIgnore: true },
              '{{count}}': { safeToIgnore: true },
              '{{set-text}}': { safeToIgnore: true },
            },
          },
        ],
      });
  }

  return app.toTree();
};
