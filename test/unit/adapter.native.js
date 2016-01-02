var Adapter = require('../../lib/adapter'),
    Config = require('../support/config'),
    Fixture = require('../support/fixture'),
    assert = require('assert'),
    async = require('async');

describe('adapter', function() {

    var assert = require('assert'),
        _ = require('lodash');

    // describe('Adapter Interface', function() {

    //     describe('.find()', function() {

    //         /////////////////////////////////////////////////////
    //         // TEST SETUP
    //         ////////////////////////////////////////////////////

    //         before(function(done) {

    //                 console.log('Adapter',Adapter);
    //             // Insert 10 Users
    //             // var users = [];

    //             // for (var i = 0; i < 10; i++) {
    //             //     users.push({
    //             //         first_name: 'find_user' + i,
    //             //         type: 'find test',
    //             //         age: i * 10
    //             //     }); // include an integer field
    //             // }

    //             // Adapter.createEach(users, function(err, users) {
    //             //     if (err) return done(err);
    //             //     done();
    //             // });
    //                 done();
    //         });

    //         /////////////////////////////////////////////////////
    //         // TEST METHODS
    //         ////////////////////////////////////////////////////

    //         it('should return 10 records', function(done) {
    //             Adapter.find({
    //                 type: 'find test'
    //             }, function(err, users) {
    //                 console.log('dsadas',users);
    //                 assert(!err);
    //                 assert(Array.isArray(users));
    //                 assert.strictEqual(users.length, 10);
    //                 done();
    //             });
    //         });

    //         it('should return 1 record when searching for a specific record (integer test) with find', function(done) {
    //             Adapter.find({
    //                 age: 10
    //             }, function(err, users) {
    //                 assert(!err);
    //                 assert(Array.isArray(users));
    //                 assert.strictEqual(users.length, 1);
    //                 done();
    //             });
    //         });

    //         it('should parse multi-level criteria', function(done) {
    //             Adapter.find({
    //                 age: {
    //                     lessThanOrEqual: 49 // should return half the records - from 0 to 40
    //                 }
    //             }, function(err, users) {
    //                 assert(!err);
    //                 assert(Array.isArray(users));
    //                 assert.equal(users.length, 5);
    //                 done();
    //             });
    //         });

    //         it('should return a model instance', function(done) {
    //             Adapter.find({
    //                 type: 'find test'
    //             }, function(err, users) {
    //                 // console.log('should return a model instance'.rainbow, err, users[0]);
    //                 assert(!err, err);
    //                 assert(users[0].id);
    //                 // assert.equal(users[0].age, 0);
    //                 assert.equal(typeof users[0].fullName, 'function');
    //                 assert.equal(toString.call(users[0].createdAt), '[object Date]');
    //                 assert.equal(toString.call(users[0].updatedAt), '[object Date]', 'Expected the first user in results to have a Date for its `updatedAt` value, instead, the first user looks like:' + require('util').inspect(users[0], false, null));
    //                 done();
    //             });
    //         });

    //         it('should work with no criteria passed in', function(done) {
    //             Adapter.find(function(err, users) {
    //                 assert(!err);
    //                 assert(Array.isArray(users));
    //                 done();
    //             });
    //         });

    //     });
    // });


    before(function(done) {
        var Schema;

        var connection = Config;
        connection.identity = 'test';

        var collection = {
            identity: 'foobar',
            definition: Fixture
        };
        collection.definition.connection = 'test';

        Adapter.registerConnection(connection, {
            'foobar': collection
        }, done);
    });


    describe('.find()', function() {

        it('should allow direct access to the collection object', function(done) {
            console.log(util.toString(Adapter.find));
            // Adapter.find({}, function(err, collection) {
            //   console.log(err,collection);
            // });
            done();
        });
    });


});
