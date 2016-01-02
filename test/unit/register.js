/**
 * Test dependencies
 */
var Adapter = require('../../');
Config = require('../support/config'),
Fixture = require('../support/fixture'),
assert = require('assert'),
async = require('async');
// var connection = Config;
// connection.identity = 'schemaless';
// var Model =
describe('registerConnection', function() {


    // before(function(done) {

    //      var connection = Config;
    //      connection.identity = 'schemaless';

    //      Adapter.registerConnection(connection,{
    //          'fooTable': Fixture,
    //          'barTable': Fixture
    //      }, function(){
    //           console.log('Adapter',Adapter);
    //      // Insert 10 Users
    //      var users = [];

    //      for (var i = 0; i < 10; i++) {
    //          users.push({
    //              first_name: 'find_user' + i,
    //              type: 'find test',
    //              age: i * 10
    //          }); // include an integer field
    //      }

    //      Adapter.create('schemaless','fooTable',users, function(err, users) {
    //          if (err) return done(err);
    //          // done();
    //      });
    //      done();
    //      });


    //  });

    it('should not hang or encounter any errors', function(done) {

        var connection = Config;
        connection.identity = 'schemaless';

        Adapter.registerConnection(connection, {
            'thingTable': {
                migrate: 'drop',
                definition: Fixture
            },
            'custom': {
                migrate: 'drop',
                definition: Fixture
            },
            'alter': {
                migrate: 'drop',
                definition: Fixture
            }

        }, done);
    });


    it('should not hang or encounter any errors', function(done) {

        var connection = Config;
        connection.identity = 'newCore';
        connection.core = 'newCore';

        Adapter.registerConnection(connection, {
            'thingTable': {
                migrate: 'drop',
                definition: Fixture
            },
            'custom': {
                migrate: 'drop',
                definition: Fixture
            },
            'alter': {
                migrate: 'drop',
                definition: Fixture
            }

        }, done);
    });


    it('should not hang or encounter any errors', function(done) {

        Adapter.destroy('schemaless', 'thingTable', {

        }, function(err, response) {
            assert(!err);
            done();
        });
    });
    it('should not hang or encounter any errors', function(done) {

        Adapter.destroy('schemaless', 'custom', {

        }, function(err, response) {
            assert(!err);
            done();
        });
    });

    it('should not hang or encounter any errors', function(done) {

        Adapter.destroy('schemaless', 'alter', {

        }, function(err, response) {
            assert(!err);
            done();
        });
    });

    it('should not hang or encounter any errors', function(done) {

        Adapter.destroy('schemaless', 'userTable', {

        }, function(err, response) {
            // console.log('response',response);
            assert(!err);
            done();
        });
    });

    it('should not hang or encounter any errors', function(done) {

        Adapter.destroy('schemaless', 'fooTable', {

        }, function(err, response) {
            // console.log('response',response);
            assert(!err);
            done();
        });
    });


    it('should not hang or encounter any errors', function(done) {

        Adapter.destroy('schemaless', 'barTable', {

        }, function(err, response) {
            // console.log('response',response);
            assert(!err);
            done();
        });
    });

    it('should create 10 user', function(done) {

        var users = [];
        for (var i = 0; i < 10; i++) {
            users.push({
                first_name: 'find_user' + i,
                type: 'find test',
                age: i * 10
            }); // include an integer field
        }

        Adapter.create('schemaless', 'thingTable', users, function(err, users) {
            if (err) return done(err);
            done();
        });
    });

    it('should return 10 records', function(done) {
        Adapter.find('schemaless', 'thingTable', {
            type: 'find test'
        }, function(err, users) {
            // console.log('dsadas',users);
            assert(!err);
            assert(Array.isArray(users));
            assert.strictEqual(users.length, 10);
            done();
        });
    });

    it('should not hang or encounter any errors', function(done) {

        Adapter.destroy('schemaless', 'thingTable', {

        }, function(err, response) {
            assert(!err);
            done();
        });
    });

    it('should return 0 records', function(done) {
        Adapter.find('schemaless', 'thingTable', {
            type: 'find test'
        }, function(err, users) {
            // console.log('dsadas',users);
            assert(!err);
            assert(Array.isArray(users));
            assert.strictEqual(users.length, 0);
            done();
        });
    });


    it('should drop all data', function(done) {
        Adapter.drop('schemaless', 'thingTable', {}, function(err, response) {
            console.log('response', response);
            assert(!err);
            done();
        });
    });

    it('should drop all data', function(done) {
        Adapter.drop('schemaless', 'thingTable', {}, function(err, response) {
            console.log('response', response);
            assert(!err);
            done();
        });
    });

    // e.g.
    // it('should create a mysql connection pool', function () {})
    // it('should create an HTTP connection pool', function () {})
    // ... and so on.
});
