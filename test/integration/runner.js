/**
 * Run integration tests
 *
 * Uses the `waterline-adapter-tests` module to
 * run mocha tests against the appropriate version
 * of Waterline.  Only the interfaces explicitly
 * declared in this adapter's `package.json` file
 * are tested. (e.g. `queryable`, `semantic`, etc.)
 */


/**
 * Module dependencies
 */

var util = require('util');
var mocha = require('mocha');
var log = new(require('captains-log'))();
var TestRunner = require('waterline-adapter-tests');
var Adapter = require('../../solrAdapter');


// Grab targeted interfaces from this adapter's `package.json` file:
var package = {};
var interfaces = [
    "semantic", //18,35
    "queryable", //5,91
    "migratable", //8,14
    "associations", //8,14
    "sql" //6,1
];
// 45 passing (4s)
// 2 pending
// 204 failing
var interfaces = ["semantic"]; // 27/25   18/34?? 21/31
var features = [
    "crossAdapter",
    "unique",
    "autoIncrement.sequential"
];
features = [];
try {
    // package = require('../../package.json');
    // interfaces = package['waterlineAdapter'].interfaces; //35/113
} catch (e) {
    throw new Error(
        '\n' +
        'Could not read supported interfaces from `waterlineAdapter.interfaces`' + '\n' +
        'in this adapter\'s `package.json` file ::' + '\n' +
        util.inspect(e)
    );
}





log.info('Testing `' + package.name + '`, a Sails/Waterline adapter.');
log.info('Running `waterline-adapter-tests` against ' + interfaces.length + ' interfaces...');
log.info('( ' + interfaces.join(', ') + ' )');
log.info('Running `waterline-adapter-tests` against ' + features.length + ' features...');
log.info('( ' + features.join(', ') + ' )');
console.log();
log('Latest draft of Waterline adapter interface spec:');
log('http://links.sailsjs.org/docs/plugins/adapters/interfaces');
console.log();






/**
 * Integration Test Runner
 *
 * Uses the `waterline-adapter-tests` module to
 * run mocha tests against the specified interfaces
 * of the currently-implemented Waterline adapter API.
 */
new TestRunner({

    // Load the adapter module.
    adapter: Adapter,

    // Default adapter config to use.
    config: {
        schema: false,
        host: 'localhost',
        core: 'schemaless',
        port: 8983,
        // single: false, //only one model, avid fq=models_s:COLLECTION query
        // manageCores: true, //create cores

    },

    // Mocha options
    // reference: https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically
    mocha: {
        // bail: true
        grep: /update/,
        // grep: /auto-increment/,
        // grep: /create/,
        // grep: /createEach/,
        // grep: /destroy/,
        // grep: /find/,
        // grep: /findOne/,
        // grep: /findOreCreate/,
        // grep: /findOreCreateEach/,
        // skip: /should insert 2 records verififed by find/
    },

    mochaChainableMethods: {
        // inverts the above grep
        // invert: true,
    },

    // The set of adapter interfaces to test against.
    // (grabbed these from this adapter's package.json file above)
    interfaces: interfaces,

    features: features,

    // Most databases implement 'semantic' and 'queryable'.
    //
    // As of Sails/Waterline v0.10, the 'associations' interface
    // is also available.  If you don't implement 'associations',
    // it will be polyfilled for you by Waterline core.  The core
    // implementation will always be used for cross-adapter / cross-connection
    // joins.
    //
    // In future versions of Sails/Waterline, 'queryable' may be also
    // be polyfilled by core.
    //
    // These polyfilled implementations can usually be further optimized at the
    // adapter level, since most databases provide optimizations for internal
    // operations.
    //
    // Full interface reference:
    // https://github.com/balderdashy/sails-docs/blob/master/adapter-specification.md
});