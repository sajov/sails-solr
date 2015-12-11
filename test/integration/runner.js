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
    "semantic", //18,35  32/20     => 53!!!
    // "migratable", //8,14  8,14     14/??   19/1   21/1!!!!
    // "queryable", //5,91  7/89   9/87  22/77  23/73
    // "associations", //8,14  25/45   33/23|28/28
    // "sql" //6,1  6/1
];
// var interfaces = [];
// 45 passing (4s)   78
// 2 pending
// 204 failing 187

var features = [
    // "autoIncrement", // 0/2
    // "autoIncrement.sequential", // 0/3
    // "compositePrimaryKey", // 1/1
    // "compositeUnique", // 1/1
    // "crossAdapter", // 25/41
    // "spatial", // 0/2
    // "unique", // 0/4
]; // 25/42     27/54
// features = [];
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
        debugAdapter: false,
        debugCollection: false,
        debugQuery: false,
        debugSolr: false
        // single: false, //only one model, avid fq=models_s:COLLECTION query
        // manageCores: true, //create cores
    },

    // Mocha options
    // reference: https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically
    mocha: {
        reporter: 'list',
        bail: true,
        failOnError: false,
        // grep: /update/,
        // grep: /teardown and migrate existing data/,
        // grep: /auto-increment/,
        // grep: ['teardown and migrate existing data', 'auto-increment', 'PK']
        // grep: ['primaryKey', 'auto-increment', 'PK']
        // grep: /create/,
        // grep: /createEach/,
        // grep: /destroy/,
        // grep: /find/,
        // grep: /findOne/,
        // grep: /findOreCreate/,
        // grep: /findOreCreateEach/,
        // skip: /teardown and migrate existing data/
        // skip: /should insert 2 records verififed by find/
    },

    mochaChainableMethods: {
        // inverts the above grep
        invert: true,
    },

    // Return code != 0 if any test failed
    failOnError: false,
    features: features,

    // The set of adapter interfaces to test against.
    // (grabbed these from this adapter's package.json file above)
    interfaces: interfaces,


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