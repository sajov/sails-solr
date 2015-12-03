/**
 * Module Dependencies
 */

var _ = require('lodash');
var util = require('util');
var async = require('async');
var Collection = require('./collection');
var DEBUG = false;

/**
 * sails-solr
 */
module.exports = (function() {

    var connections = {};

    var adapter = {

        // drop   => Drop schema and data, then recreate it
        // alter  => Drop/add columns as necessary.
        // safe   => Don't change anything (good for production DBs)
        // drop (drop, describe, define), alter(describe, describe, define), create(describe, describe, define), safe()

        syncable: true,
        identity: 'sails-solr',
        pkFormat: 'string',
        migrate: 'alter',
        defaults: {
            // schema: false
            single: false, //only one model, avid fq=models_s:COLLECTION query
            manageCores: true, //create cores
        },
        /**
         *
         * This method runs when a model is initially registered
         * at server-start-time.  This is the only required method.
         *
         * @param  {[type]}   connection [description]
         * @param  {[type]}   collection [description]
         * @param  {Function} cb         [description]
         * @return {[type]}              [description]
         */
        registerConnection: function(connection, collections, cb) {
            log('REGISTERCONNECTION', {
                connection: connection,
                collectionsKey: Object.keys(collections)
            });

            if (!connection.identity) return cb(new Error('Connection is missing an identity.'));
            if (connections[connection.identity]) return cb(new Error('Connection is already registered.'));

            // Merging default options
            connection = _.defaults(connection, this.defaults);

            connections[connection.identity] = new Collection(connection, collections);

            grabConnection(connection.identity).initialize(function(err) {
                if (err) console.log(err);
                cb();
            });
        },

        // Return attributes
        describe: function(connection, collection, cb) {
            log('DESCRIBE', collection);
            grabConnection(connection).describe(collection, function(err, data) {
                log('DESCRIBE', {
                    err: err,
                    data: data
                });
                if (err) {
                    cb(err, null);
                } else {
                    cb(null);
                }
            });
        },

        /**
         *
         * REQUIRED method if integrating with a schemaful
         * (SQL-ish) database.
         *
         */
        define: function(connection, collection, definition, cb) {
            log('DEFINE', collection);
            // Add in logic here to create a collection (e.g. CREATE TABLE logic)
            grabConnection(connection).define(collection, definition, function(err, data) {
                if (err) {
                    cb(err, false);
                } else {
                    cb(null, data);
                }
            });
        },

        addAttribute: function(connection, collection, attr, def, cb) {
            // Add in logic here to create a collection (e.g. CREATE TABLE logic)
            grabConnection(connection).schemaAddFields(connection, collection, attr, def, function(err, data) {
                if (err) {
                    cb(err, false);
                } else {
                    cb(null, data);
                }
            });
        },

        /**
         *
         * REQUIRED method if integrating with a schemaful
         * (SQL-ish) database.
         *
         * TODO: handel relations
         *
         */
        drop: function(connection, collection, relations, cb) {
            // return cb(false, {});
            grabConnection(connection).destroy(collection, {}, function(err, data) {
                if (err) {
                    console.log('adapter.destroy error'.red, err);
                    return cb();
                } else {
                    grabConnection(connection).drop(connection, collection, function(err, data) {
                        return cb(false, {});
                        if (data.responseHeader.status === 0) {
                            return cb(values);
                        } else {
                            return cb('ERROR');
                        }
                    });
                }
            });
        },

        /**
         * Fired when a model is unregistered, typically when the server
         * is killed. Useful for tearing-down remaining open connections,
         * etc.
         *
         * @param  {Function} cb [description]
         * @return {[type]}      [description]
         */
        // Teardown a Connection
        teardown: function(connection, cb) {
            log('TEARDOWN');

            //TODO: delete all fields IF migrate:drop

            if (typeof connection == 'function') {
                cb = connection;
                connection = null;
            }
            if (!connection) {
                connections = {};
                return cb();
            }
            if (!connections[connection]) return cb();
            delete connections[connection];

            cb();
        },

        /**
         *
         * REQUIRED method if users expect to call Model.find(), Model.findOne(),
         * or related.
         *
         * You should implement this method to respond with an array of instances.
         * Waterline core will take care of supporting all the other different
         * find methods/usages.
         *
         */
        find: function(connection, collection, options, cb) {
          console.log('FIND options'.magenta.red, options);
            grabConnection(connection).find(connection, collection, options, function(err, data) {
                console.log('FIND model', data);
                if (err) {
                    cb(err, false);
                } else {
                    cb(false, data);
                }
            });
        },

        findAndCount: function(connection, collection, options, cb) {
            var model = connections[connection].collections[collection];
            console.log('FINDANDCOUNT model', model.DUDE);
            grabConnection(connection).findAndCount(connection, collection, options, function(err, data) {
                if (err) {
                    return cb(err, false);
                } else {
                    return cb(false, data);
                }
            });
        },

        findOld: function(connection, collection, options, cb) {
            // log('find options', {
            //     'CONNECTION': connection,
            //     'COLLECTION': collection,
            //     // 'model': connections[connection],
            //     // 'OPTIONS': inspect(options),
            // });
            // log('find connections', inspect(connections[connection]));
            // console.log('Solr.adapter.find options where.or'.magenta.inverse, util.inspect(options.where.or));
            // console.log('connection',connection);
            // console.log('collection',collection);
            // console.log('options',options);
            // console.log('connections',connections);
            // console.log(util.inspect(connections[connection].collections[collection], false, null));
            // console.log('Solr.adapter.find options where.or'.magenta.inverse,util.inspect(options, false, null));

            /* model access */
            var model = connections[connection].collections[collection];
            // log('find model', inspect(model));

            /* get additional query params*/
            var queryParams = model.queryParams ||  {};

            // sails.log.silly('OPTIONS'.yellow.inverse,options);
            /**/
            grabConnection(connection).select(options, queryParams, function(err, data) {
                if (err) {
                    log('FIND error', err);
                    return cb('adapter.find error', {});
                } else {
                    // if(_.isObject(data) && _.getPath(data, "response.docs") && !_.isEmpty(data.response.docs)) {
                    if (_.isObject(data)) {
                        if (_.has(data, ['response', 'numFound'])) {
                            model.lastRequestCount = data.response.numFound;
                        }
                        if (_.has(data, ['response', 'docs'])) {
                            return cb(false, data.response.docs);
                        } else if (_.has(data, 'grouped')) {

                            // console.log('ADAPTER find'.rainbow.inverse, data.grouped)

                            return cb(false, data.grouped);
                        } else {
                            return cb(false, data);
                        }
                    } else {
                        sails.log.error('NO DATA'.red.inverse, data);
                        return cb(false, {});
                    }
                }
            });

        },

        get: function(connection, collection, options, cb) {

            // console.log('Solr.adapter.find options where.or'.magenta.inverse, util.inspect(options.where.or));
            // console.log('connection',connection);
            // console.log('collection',collection);
            // console.log('options',options);
            // console.log('connections',connections);
            // console.log(util.inspect(connections[connection].collections[collection], false, null));
            // console.log('Solr.adapter.find options where.or'.magenta.inverse,util.inspect(options, false, null));

            /* model access */
            var model = connections[connection].collections[collection];

            /* get additional query params*/
            var queryParams = model.queryParams ||  {
                fq: [{
                    'model': 'adverts'
                }],
            };

            sails.log.silly('OPTIONS'.yellow.inverse, options);
            /**/
            grabConnection(connection).get(options, queryParams, function(err, data) {
                if (err) {
                    sails.log.error('adapter.find error'.red, err);
                    return cb('adapter.find error', {});
                } else {
                    // if(_.isObject(data) && _.getPath(data, "response.docs") && !_.isEmpty(data.response.docs)) {
                    if (_.isObject(data)) {
                        if (_.has(data, ['response', 'numFound'])) {
                            model.lastRequestCount = data.response.numFound;
                        }
                        if (_.has(data, ['response', 'docs'])) {
                            return cb(false, data.response.docs);
                        } else if (_.has(data, 'grouped')) {

                            // console.log('ADAPTER find'.rainbow.inverse, data.grouped)

                            return cb(false, data.grouped);
                        } else {
                            return cb(false, data);
                        }
                    } else {
                        sails.log.error('NO DATA'.red.inverse, data);
                        return cb(false, {});
                    }
                }
            });

        },

        count: function(connection, collection, options, cb) {

            grabConnection(connection).count(connection, options, function(err, data) {
                if (err) {
                    return cb('adapter.count error', false);
                } else {
                    return cb(false, data);
                }
            });

        },

        create: function(connection, collection, values, cb) {

            grabConnection(connection).create(connection, collection, values, function(err, data) {
                if (err) {
                    console.log('CREATE ERROR'.red, err);
                    return cb(err, false);
                } else {
                    return cb(false, values);
                }
            });

        },



        update: function(connection, collection, options, values, cb) {

            grabConnection(connection).update(connection, options, values, function(err, data) {
                // sails.log.error('adapter.UPDATE error'.red, err,data);
                // return cb(false, [values]);
                if (err) {
                    sails.log.error('adapter.UPDATE error'.red, err);
                    return cb(err, false);
                } else {
                    // console.log('adapter.UPDATE NO error'.green, data);
                    return cb(false, options);
                    // if(data.responseHeader.status === 0) {
                    // } else {
                    //   return cb(err, false);
                    // }
                }
            });
        },

        destroy: function(connection, collection, options, cb) {

            grabConnection(connection).destroy(collection, options, function(err, data) {
                if (err) {
                    sails.log.error('adapter.destroy error'.red, err);
                    return cb(err, false);
                } else {
                    return cb(false, data);
                }
            });
        },

        commit: function(connection, collection, cb) {
            // console.log('Solr.adapter commit'.cyan.inverse);
            grabConnection(connection).commit(connection, options, function(err, data) {
                if (err) {
                    // console.log('adapter.COMMIT error'.red, err);
                    return cb(err, false);
                } else {
                    if (data.responseHeader.status === 0) {
                        return cb(false, data);
                    } else {
                        return cb('ERROR', false);
                    }
                }
            });
        },

        query: function(connection, collection, options, cb) {

            // console.log('Solr.adapter rawQuery 1'.cyan.inverse, util.inspect(options, false, 10, true));
            /* model access */
            var model = connections[connection].collections[collection];
            // options = mergeModelParams();
            /* get additional query params*/
            var queryParams = model.queryParams ||  {};
            // var queryParams = {};
            // if(_.has(model,'queryParams.fq')) {
            //    // console.log('Solr adapter MODEL ACCESS queryParams.fq'.red.inverse, model.queryParams.fq);
            //    if(_.has(options,'fq')) {
            //       // if(_.isString(options.fq)) {
            //       //   tmpFq = options.fq;
            //       //   options.fq = [];
            //       // }
            //       queryParams.fq.push(model.queryParams.fq);
            //    } else {
            //       options.fq = [model.getQueryParams('fq')];
            //    }
            // }
            // console.log('Solr.adapter rawQuery 2'.cyan.inverse, util.inspect(options, false, 10, true));
            grabConnection(connection).select(options, queryParams, function(err, data) {
                if (err) {
                    sails.log.error('adapter.rawQuery errorr'.red, err, options, queryParams);
                    return cb('adapter.rawQuery error', {});
                } else {
                    if (_.isObject(data)) {
                        return cb(false, data);
                    } else {
                        sails.log.error('NO DATA'.red.inverse, data);
                        return cb(false, {});
                    }
                }
            });
        },

        rawQuery: function(connection, collection, options, cb) {
            this.query(connection, collection, options, cb);
        },
    };

    function grabConnection(connection) {
        return connections[connection];
    }

    // Expose adapter definition
    return adapter;

})();

function log(msg, data, depth) {
    if (DEBUG == false) {
        return true;
    }
    var app = _.isUndefined('sails') ? false : true;

    if (_.isObject(data)) {
        data = inspect(data, depth);
    }

    if (app) {
        // sails.log.info(('ClusteringInverse ' + msg).red.inverse, data || {});
        console.log('sails-solr adpater.js'.green.inverse + ' ' + msg.green, data || '');
    } else {
        console.log('sails-solr adpater.js'.green.inverse + ' ' + msg.green, data || '');
    }
}

/**
 * Inspect helper
 * @param  mixed data Data to inspect
 * @return string
 */
function inspect(data, depth) {
    return util.inspect(data, showHidden = true, depth = depth ||  5, colorize = true);
}
