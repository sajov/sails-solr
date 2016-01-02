/**
 * Module Dependencies
 */

var _ = require('lodash');
var utils = require('./utils');
var async = require('async');
var Collection = require('./collection');

/**
 * sails-solr
 */
module.exports = (function() {

    var connections = {};

    var adapter = {

        // drop   => Drop schema and data, then recreate it (drop, describe, define)
        // alter  => Drop/add columns as necessary. (describe, describe, define)
        // safe   => Don't change anything (good for production DBs) (describe, describe, define)
        // drop (drop, describe, define), alter(describe, describe, define), create(describe, describe, define), safe()

        syncable: true,
        identity: 'sails-solr',
        pkFormat: 'string',
        migrate: 'alter',
        defaults: {
            // schema: false
            single: false, //only one model, avid fq=models_s:COLLECTION query
            manageCores: true, //create cores
            schema: false,
            host: 'localhost',
            core: 'schemaless',
            port: 8983,
            solrconfig: {
                'add-requesthandler': 'suggest',
                'add-searchcomponent': 'suggest'
            },
            debugAdapter: false,
            debugCollection: false,
            debugQuery: false,
            debugSolr: false
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
            // this.log('REGISTERCONNECTION', {
            //     connection: connection,
            //     collectionsKey: Object.keys(collections)
            // });

            if (!connection.identity) return cb(new Error('Connection is missing an identity.'));
            if (connections[connection.identity]) return cb(new Error('Connection is already registered.'));

            // Merging default options
            this.defaults = _.defaultsDeep(connection, this.defaults);
            connection = this.defaults;

            //TODO: defaults.single
            if (this.defaults.single == true) {
                async.each(Object.keys(collections), function(collection, callback) {
                    connections[connection.identity] = new Collection(connection, collection);
                    grabConnection(connection.identity).initialize(function(err) {
                        if (err) console.log(err);
                        callback();
                    });
                }, function(err) {
                    // if any of the file processing produced an error, err would equal that error
                    if (err) console.log(err);
                    cb();
                });

            } else {
                connections[connection.identity] = new Collection(connection, collections);
                grabConnection(connection.identity).initialize(function(err) {
                    if (err) console.log(err);
                    cb();
                });
            }


            // connections[connection.identity] = {}
            // async.each(Object.keys(collections), function(key, callback) {
            //         connections[connection.identity][key] = new Collection(connection, collections);
            //         connections[connection.identity][key].initialize(function(err) {
            //             if (err) console.log(err);
            //             callback();
            //         });
            //     },
            //     function(err) {
            //         if (err) console.log(err);
            //         // cb(false, definition);
            //         cb(null);
            //     });

        },

        // Return attributes
        describe: function(connection, collection, cb) {
            this.log('DESCRIBE ' + connection + ' ' + collection);
            // this.log('DESCRIBE', {
            //     connection: connection,
            //     collection: collection
            // });
            grabConnection(connection).describe(collection, function(err, data) {
                if (err) {
                    console.log('DESCRIBE ERROR', err);
                    cb(err);
                } else {
                    // console.log('DESCRIBE ', typeof data);
                    if (data) {
                        // console.log('DESCRIBE data'.cyan.inverse, data);
                        return cb(false, data);
                    } else {
                        return cb(null);
                    }

                    // console.log('DESCRIBE data', data);
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
            this.log('DEFINE ' + connection + ' ' + collection);
            // Add in logic here to create a collection (e.g. CREATE TABLE logic)
            grabConnection(connection).define(collection, definition, function(err, data) {
                if (err) {
                    cb(err, false);
                } else {
                    // console.log('DEFINE data'.cyan.inverse, data);
                    cb(false, data);
                }
            });
        },

        addAttribute: function(connection, collection, attr, def, cb) {
            this.log('ADDATTRIBUTE ' + connection + ' ' + collection);
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
            this.log(('DROP ' + connection + ' ' + collection).red.inverse);
            // this.log('DROP', {
            //     connection: connection,
            //     collection: collection,
            //     relations: relations
            // });
            // return cb(false, {});
            grabConnection(connection).drop(connection, collection, function(err, data) {
                return cb(false, {});
                if (data.responseHeader.status === 0) {
                    return cb(values);
                } else {
                    return cb('ERROR');
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
            this.log('TEARDOWN ' + connection);

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
            this.log('FIND ' + connection + ' ' + collection);
            grabConnection(connection).find(connection, collection, options, function(err, data) {
                if (err) {
                    cb(err, false);
                } else {
                    // console.log('data???'.rainbow.inverse, data);
                    cb(false, data);
                }
            });
        },

        findAndCount: function(connection, collection, options, cb) {
            this.log('FIND AND COUNT ' + connection + ' ' + collection);
            grabConnection(connection).findAndCount(connection, collection, options, function(err, data) {
                if (err) {
                    return cb(err, false);
                } else {
                    return cb(false, data);
                }
            });
        },

        // get: function(connection, collection, options, cb) {

        //     // console.log('Solr.adapter.find options where.or'.magenta.inverse, util.inspect(options.where.or));
        //     // console.log('connection',connection);
        //     // console.log('collection',collection);
        //     // console.log('options',options);
        //     // console.log('connections',connections);
        //     // console.log(util.inspect(connections[connection].collections[collection], false, null));
        //     // console.log('Solr.adapter.find options where.or'.magenta.inverse,util.inspect(options, false, null));

        //     /* model access */
        //     var model = connections[connection].collections[collection];

        //     /* get additional query params*/
        //     var queryParams = model.queryParams ||  {
        //         fq: [{
        //             'model': 'adverts'
        //         }],
        //     };

        //     console.log('OPTIONS'.yellow.inverse, options);
        //     /**/
        //     grabConnection(connection).get(options, queryParams, function(err, data) {
        //         if (err) {
        //             console.log('adapter.find error'.red, err);
        //             return cb('adapter.find error', {});
        //         } else {
        //             // if(_.isObject(data) && _.getPath(data, "response.docs") && !_.isEmpty(data.response.docs)) {
        //             if (_.isObject(data)) {
        //                 if (_.has(data, ['response', 'numFound'])) {
        //                     model.lastRequestCount = data.response.numFound;
        //                 }
        //                 if (_.has(data, ['response', 'docs'])) {
        //                     return cb(false, data.response.docs);
        //                 } else if (_.has(data, 'grouped')) {

        //                     // console.log('ADAPTER find'.rainbow.inverse, data.grouped)

        //                     return cb(false, data.grouped);
        //                 } else {
        //                     return cb(false, data);
        //                 }
        //             } else {
        //                 console.log('NO DATA'.red.inverse, data);
        //                 return cb(false, {});
        //             }
        //         }
        //     });

        // },

        count: function(connection, collection, options, cb) {
            this.log('COUNT ' + connection + ' ' + collection);
            grabConnection(connection).count(connection, collection, options, function(err, data) {
                if (err) {
                    return cb('adapter.count error', false);
                } else {
                    return cb(false, data);
                }
            });

        },

        create: function(connection, collection, values, cb) {
            this.log('CREATE ' + connection + ' ' + collection);
            grabConnection(connection).create(connection, collection, values, function(err, data) {
                if (err) {
                    return cb(err, false);
                } else {
                    return cb(false, values);
                }
            });

        },

        createEach: function(connection, collection, values, cb) {
            this.log('CREATEEACH ' + connection + ' ' + collection);
            grabConnection(connection).create(connection, collection, values, function(err, data) {
                if (err) {
                    return cb(err, false);
                } else {
                    return cb(false, values);
                }
            });

        },

        update: function(connection, collection, options, values, cb) {
            this.log('COUNT ' + connection + ' ' + collection);
            grabConnection(connection).update(connection, collection, options, values, function(err, data) {
                // console.log('adapter.UPDATE error'.red, err,data);
                // return cb(false, [values]);
                if (err) {
                    console.log('adapter.UPDATE error'.red, err);
                    return cb(err, false);
                } else {
                    // console.log('adapter.UPDATE NO error'.green, data);
                    return cb(false, data);
                    // if(data.responseHeader.status === 0) {
                    // } else {
                    //   return cb(err, false);
                    // }
                }
            });
        },

        destroy: function(connection, collection, options, cb) {
            this.log('DESTROY ' + connection + ' ' + collection);
            grabConnection(connection).destroy(collection, options, function(err, data) {
                if (err) {
                    console.log('adapter.destroy error'.red, err);
                    return cb(err, false);
                } else {
                    return cb(false, data);
                }
            });
        },

        commit: function(connection, collection, cb) {
            this.log('DESTROY ' + connection + ' ' + collection);
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


        catalog: function(connection, collection, options, cb) {
            // this.log('browse ' + connection + ' ' + collection);
            grabConnection(connection).catalog(collection, options, function(err, data) {
                if (err) {
                    console.log('adapter.browse error'.red, err);
                    return cb(err, false);
                } else {
                    return cb(false, data);
                }
            });
        },


        suggest: function(connection, collection, options, cb) {
            // console.log('suggest ' + connection + ' ' + collection);
            grabConnection(connection).suggest(collection, options, function(err, data) {
                if (err) {
                    console.log('adapter.suggest error'.red, err);
                    return cb(err, false);
                } else {
                    return cb(false, data);
                }
            });
        },

        query: function(connection, collection, options, cb) {
            this.log('QUERY ' + connection + ' ' + collection);
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
                    console.log('adapter.rawQuery errorr'.red, err, options, queryParams);
                    return cb('adapter.rawQuery error', {});
                } else {
                    if (_.isObject(data)) {
                        return cb(false, data);
                    } else {
                        console.log('NO DATA'.red.inverse, data);
                        return cb(false, {});
                    }
                }
            });
        },

        rawQuery: function(connection, collection, options, cb) {
            this.log('RAW QUERY ' + connection + ' ' + collection);
            this.query(connection, collection, options, cb);
        },

        log: function(msg, data, depth) {
            if (this.defaults.debugAdapter == false)
                return false;
            utils.log('waterline-solr adpater.js'.green.inverse + ' ' + msg, data, depth);
        }
    };

    function grabConnection(connection) {
        return connections[connection];
    }

    function grabConnectionSingleCore(connection, collection) {
        //TODO:
        if (this.defaults.single == true) {
            return connections[connection];
        } else {
            return connections[connection];
        }

    }

    function addConnections(connection, collections) {
        //TODO:
        if (this.defaults.single) {
            async.each(Object.keys(collections), function(collectionName, callback) {
                var collection = [];
                collection[collectionName] = collections[collectionName];

                connections[connection.identity + '_' + collectionName] = new Collection(connection, collection);
                grabConnection(connection.identity + '_' + collectionName).initialize(function(err) {
                    if (err) console.log(err);
                    callback();
                });
            }, function(err) {
                // if any of the file processing produced an error, err would equal that error
                if (err) console.log(err);
                cb();
            });

        } else {
            connections[connection.identity] = new Collection(connection, collections);
            grabConnection(connection.identity).initialize(function(err) {
                if (err) console.log(err);
                cb();
            });
        }
    }



    // Expose adapter definition
    return adapter;

})();
