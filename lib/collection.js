var _ = require('lodash');
var async = require('async');
var colors = require('colors');
var querystring = require('querystring');
var util = require('util');
var utils = require('./utils');
var uuid = require('node-uuid');
var md5 = require('MD5');
var Solr = require('solr-hyperquest-client');
var Query = Solr.Query;
// var Errors = require('waterline-errors').adapter;

var DEBUG = false;

//TODO: HANDLE all ID STUFF HERE!!!!!
//conncat all, unique fields
// getSlug = require('speakingurl'),
// md5 = require('MD5');

// var Errors = require('waterline-errors').adapter;
// var Aggregate = require('./aggregates');
// var waterlineCriteria = require('waterline-criteria');


var Collection = module.exports = function(config, collections) {

    this.config = config || {};
    this.config.modelKey = 'modelname';
    this.config.migrate = this.initCollections();
    this.collections = collections || {};
    this.initCollections();
    // console.log(collections);

    this.client = new Solr.Client(config);

    return this;
}

/**
 * Query adapter
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
Collection.prototype.query = function(obj) {
    return new Query(obj);
}

/**
 * Init Collection
 * handle migration state
 * @param  {[type]} collections [description]
 * @return {[type]}             [description]
 */
Collection.prototype.initCollections = function() {

    this.config.migrate = 'safe';

    // Object.keys(this.collections).forEach(function(key) {
    //     if (!_.isUndefined(this.collections[key].migrate)) {

    //     }
    // });
}

/**
 * Initialize
 * @param  {Function} cb [description]
 * @return {[type]}      [description]
 */
Collection.prototype.initialize = function(cb) {
    var self = this;
    // log('this.collectionsthis.collectionsthis.collections', Object.keys(this.collections));
    self.client.coreStatus(function(err, data) {
        // log('self.client.self.config.manageCores', self.config.manageCores);
        // log('self.client.coreStatus', err);
        if (!_.has(data.status, [self.config.core]) && self.config.manageCores) {
        // if (_.isUndefined(data.status[self.config.core]) && self.config.manageCores) {
            // log('self.client.coreStatus', data);
            self.createCore(self.config.core, function(err, data) {
                if (err) {
                    console.log(err);
                    cb(err, data);
                } else {
                    self.ping(function(err, data) {
                        cb(err, data);
                    })
                }
            })

        } else {
            if (!err) {
                self.ping(function(err, data) {
                    cb(err, data);
                })
            } else {
                cb(err, data);
            }
        }


    })

}

Collection.prototype.ping = function(cb) {
    var self = this;
    self.client.ping(function(err, data) {
        if (err) console.log('sails-solr collection ping', err);
        cb(err, data);
    });
}

Collection.prototype.createCore = function(core, cb) {
    var self = this;
    self.log('self.client.coreStatus'.rainbow.inverse, core);
    self.client.coreCreate({
            action: 'CREATE',
            name: core,
            loadOnStartup: true,
            instanceDir: core,
            //TODO:  use data_driven_schema_configs if no definition
            // use
            configSet: 'data_driven_schema_configs',
            config: 'solrconfig.xml',
            schema: 'schema.xml',
            // config: '../gettingstarted/config/solrconfig.xml',
            // schema: '../gettingstarted/config/schema.xml',
            dataDir: 'data'
        },
        function(err, data) {
            if (err) console.log(err);
            self.addFieldType(cb);
            // cb();
        });
}

/**
 * TODO:make more dynamic
 * @param {Function} cb [description]
 */
Collection.prototype.addFieldType =  function(cb) {
     var self = this;
    // addSchemaFieldType schemaDefaultFieldTypes
    self.client.addSchemaFieldType(
        {'add-field-type': self.schemaDefaultFieldTypes.string_keyword},
        function(err, response) {
            console.log('addSchemaFieldType schemaDefaultFieldTypes'.rainbow.inverse, err, utils.inspect(response));
            if (err) console.log(err);
            cb();
        }
    );
}

/**
 * Select for native response object
 * @param  {[type]}   options      [description]
 * @param  {[type]}   defaultQuery [description]
 * @param  {Function} cb           [description]
 * @return {[type]}                [description]
 */
Collection.prototype.select = function(options, defaultQuery, cb) {
    var self = this;

    // console.log('select options',options);
    options = self.addDocModel(collection, options);
    var query = new Query(options);
    query = query.queryUri;
    // console.log('Collection.select buildQuery: '.cyan.inverse, query.queryUri);
    // console.log('Collection.select buildQueryString: '.cyan.inverse, decodeURIComponent(QB.buildQueryString()).cyan);
    // console.log('Collection.select buildQueryString: '.cyan.inverse, (QB.buildQueryString()).cyan);
    // console.log('Collection.select buildQuery: '.cyan.inverse, util.inspect(query.queryUri, false,10,true));
    self.client.select(query, cb);
    // cb(false,{test:'test'});
}

Collection.prototype.get = function(options, defaultQuery, cb) {
    var self = this;

    // console.log('select options',options);

    options = self.addDocModel(collection, options);
    var query = new Query(options);
    query = query.queryUri;
    // console.log('Collection.select buildQuery: '.cyan.inverse, query.queryUri);
    // console.log('Collection.select buildQueryString: '.cyan.inverse, decodeURIComponent(QB.buildQueryString()).cyan);
    // console.log('Collection.select buildQueryString: '.cyan.inverse, (QB.buildQueryString()).cyan);
    // console.log('Collection.select buildQuery: '.cyan.inverse, util.inspect(query.queryUri, false,10,true));
    self.client.realtime(query, cb);
    // cb(false,{test:'test'});
}

/**
 * Find data
 * @param  {[type]}   connection [description]
 * @param  {[type]}   collection [description]
 * @param  {[type]}   options    [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
Collection.prototype.find = function(connection, collection, options, cb) {
    var self = this;
    var model = self.collections[collection];
    self.log('FIND model', collection);
    // self.log('self.collections[collection]._test', self.collections[collection]._test);
    // self.log('self._test', self._test);
    // self.log('FIND model.definition', model.definition);
    // self.log('FIND model._schema', model._schema);
    // self.log('FIND model', model.connections); model methods
    // self.log('FIND model', model);
    // console.log('Collection.prototype.model'.red.inverse, inspect(model, 10))
    // console.log('Collection.prototype.find'.red.inverse, options)
    options = self.addDocModel(collection, options);
    var query = new Query(options);
    self.log('Collection.prototype.find query'.red.inverse, query)
    query = query.queryUri;

    self.client.select(query, function(err, data) {
        // console.log('Collection.FIND ', err, data);
        if (err) {
            console.log('FIND error', err);
            return cb('adapter.find error', {});
        } else {
            // if(_.isObject(data) && _.getPath(data, "response.docs") && !_.isEmpty(data.response.docs)) {
            if (_.isObject(data)) {

                return cb(false, self._findResponse(connection, collection, options, data));

            } else {
                self.log('FIND no data', data);
                return cb(false, {});
            }
        }
    });
}

Collection.prototype._findResponse = function(connection, collection, options, data) {
    var self = this;
    self.aggregates = ['min', 'max', 'sum', 'average', 'groupBy'];
    if(_.some(self.aggregates, _.partial(_.has, options)) == false) {

            if (_.has(data, ['response', 'numFound'])) {
                // model.lastRequestCount = data.response.numFound;
            }
            if (_.has(data, ['response', 'docs'])) {
                return self._parseDocuments(connection, collection, data.response.docs);
            } else if (_.has(data, 'grouped')) {
                // console.log('ADAPTER find'.rainbow.inverse, data.grouped)
                return self._parseDocuments(connection, collection, data.grouped);
            } else {
                return self._parseDocuments(connection, collection, data);
            }

    } else {
        var result = {};
        _.each(['min', 'max', 'sum', 'average', 'groupBy'],function(key){
            if(!_.isUndefined(options,key)) {
                _.each(options[key], function(f){
                    var aggr = key;
                    if(aggr == 'average')
                        aggr = 'mean';
                    if(_.has(data.stats.stats_fields,f))
                    result[f] = data.stats.stats_fields[f][aggr];
                })
            }
        });
        return result;
    }

}

Collection.prototype.findAndCount = function(connection, collection, options, cb) {
    var self = this;
    options = self.addDocModel(collection, options);
    var query = new Query(options);
    query = query.queryUri;
    self.client.select(query, function(err, data) {
        if (err) {
            self.log('findAndCount error', err);
            return cb('adapter.findAndCount error', {});
        } else {
            var response = {
                count: 0,
                data: {}
            };
            // if(_.isObject(data) && _.getPath(data, "response.docs") && !_.isEmpty(data.response.docs)) {
            if (_.isObject(data)) {

                if (_.has(data, ['response', 'numFound'])) {
                    // model.lastRequestCount = data.response.numFound;
                    response.count = data.response.numFound;
                }

                if (_.has(data, ['response', 'docs'])) {
                    response.data = data.response.docs;
                } else if (_.has(data, 'grouped')) {

                    // console.log('ADAPTER find'.rainbow.inverse, data.grouped)

                    response.data = data.grouped;
                } else {
                    response.data = data;
                }
            } else {
                self.log('FIND no data', data);
                return cb(false, {});
            }

            // _.each(response.data, function(d, i) {
            //     response.data[i] = model._instanceMethods.toJSON(d);
            // });

            cb(false, response);
        }
    });
}

Collection.prototype.count = function(connection, collection, options, cb) {
    var self = this;
    options.limit = 0;
    options = self.addDocModel(collection, options);

    var query = new Query(options);
    query = query.queryUri;

    self.client.select(query, function(err, data) {
        if (!err && data.response.numFound >= 0) {
            // console.log('Collection count options', options, query, data.response.numFound);
            cb(false, data.response.numFound);
        } else {
            cb(err || 'no data', false);
        }
    });
}

/**
 * Create documents.
 *
 * Check autoPk, required and schema settings
 * - if one ore more required, md5 from concate model, and each required field
 *
 *
 * @param  {[type]}   connection [description]
 * @param  {[type]}   collection [description]
 * @param  {[type]}   values     [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
Collection.prototype.create = function(connection, collection, values, cb) {
    var self = this;

    self.log('CREATE', {
        'connection': connection,
        'collection': collection,
        'values': values,
    });

    async.waterfall([

            function(callback) {
                callback(null, self._prepareDocuments(connection, collection, values));
            },
            function(documents, callback) {
                self._validateDocuments(connection, collection, documents,
                    function(err, validDocuments) {
                        callback(null, err, validDocuments);
                    }
                );
            },
            function(validationError, documents, callback) {
                if (documents.length == 0) {
                    return callback(null, validationError, false, documents);
                } else {
                    self.client.addDoc({
                        commit: true
                        // softCommit: true
                    }, documents, function(err, response) {
                        if (err) console.log('Collection.prototype.create '.red.inverse, err, response);
                        callback(null, validationError, err, documents);
                    });
                }
            },
        ],
        function(err, validationError, createError, documents) {
            if (err || validationError || createError) {
                return cb({
                    err: err,
                    validationError: validationError,
                    createError: createError
                }, false);
            } else {
                return cb(false, documents);
            }
        });
    /* write into solr */

    // self.client.addDoc({commitWithin:50},docs, cb);
    // self.client.addDoc(values, cb);
    // client.addDoc([{id:'rednew',title:'dfsfsdfsdfsf'}],function(err,data){console.log('addDoc'.yellow,err,data)});
    // client.commit({commit:true},function(err,data){console.log('commit'.yellow,err,data)});
    // client.addDoc({commitWithin:500},[{id:'rednew',title:'dfsfsdfsdfsf'}],function(err,data){console.log('addDoc'.yellow,err,data)});
    // client.addDoc({add: {commitWithin:500,doc:{id:'rednew',title:'dfsfsdfsdfsf'}}},function(err,data){console.log('addDoc'.yellow,err,data)});
    // self.client.addDoc({softCommit:false},values, cb);
    // self.client.addDoc({commitWithin:50},values, cb);
}

Collection.prototype._validateDocuments = function(connection, collection, values, cb) {
    var self = this;

    var model = self.collections[collection];
    var docs = _.isArray(values) ? values : [values];

    if (!model.primaryKey || _.isUndefined(model.parsedDefinition.unique) || model.parsedDefinition.unique.length == 0) {
        return cb(false, docs);
    }

    // console.log('Collection._validateDocuments parsedDefinition: '.cyan.inverse, model.parsedDefinition);
    //self.collections[collection].parsedDefinition
    var errorDocs = [];

    async.forEachOf(docs, function(doc, i, callback) {

        var query = {
            where: {
                or: []
            },
            limit: 1
        }

        if (model.primaryKey && !_.isUndefined(doc[model.primaryKey])) {
            var or = {};
            or[model.primaryKey] = doc[model.primaryKey];
            query.where.or.push(or);
        }

        if (model.parsedDefinition.unique.length > 0) {
            _.each(model.parsedDefinition.unique, function(field) {
                if (field != 'id' && !_.isUndefined(doc[field])) {
                    var or = {};
                    or[field] = doc[field]
                    query.where.or.push(or);
                }
            })
        }

        if (_.isEmpty(query.where.or)) {
            return callback();
        }

        // console.log('QUERY'.green.inverse, utils.inspect(query, 5));

        self.count(connection, collection, query, function(err, count) {
            if (err) {
                return callback();
            }
            if (count !== 0) {
                errorDocs.push({
                    'error primaryKey': model.primaryKey,
                    doc: docs[i]
                })
                if (docs.length == 1) {
                    docs.length = 0; // good!
                } else {
                    delete docs[i];
                }
            }
            callback();
        });
    }, function(err) {
        // console.log('Collection._validateDocuments '.red.inverse, {
        //     err: err,
        //     cdocs: docs.length,
        //     edocs: errorDocs.length,
        //     docs: docs,
        //     errorDocs: errorDocs
        // });
        if (err) {
            cb(err, docs);
        } else if (errorDocs.length > 0) {
            cb(errorDocs, docs);
        } else {
            cb(false, docs);
        }
    });
}

Collection.prototype._prepareDocuments = function(connection, collection, values) {
    var self = this;
    var docs = _.isArray(values) ? values : [values];

    var model = self.collections[collection];
    var docModel = self.getDocModel(connection, collection);


    //TODO: write on describe on model as self.collections[collection].jsonFields
    var jsonFields = [];
    _.each(self.collections[collection].definition, function(field) {
        if (field.type == 'json') {
            jsonFields.push(field.columnsName || field.name);
        }
    });

    //TODO: write on describe on model as self.collections[collection].binaryFields
    var binaryFields = [];
    _.each(self.collections[collection].definition, function(field) {
        if (field.type == 'binary') {
            binaryFields.push(field.columnsName || field.name);
        }
    });

    //TODO: add assign attribute defaultsTo
    // var defaultsToFields = {};
    // _.each(self.collections[collection].definition, function(field) {
    //     if (!_.isUndefined(field.defaultsTo)) {
    //         defaultsToFields.push(field.columnsName || field.name);
    //     }
    // });

    // self.log('DEFINITION', self.collections[connection].definition);

    _.each(docs, function(doc, i) {

        // organize id, primaryKey, unique
        var id = self._getId(connection, collection, doc);
        if (id) docs[i].id = id;

        // handel multi model usage
        if (docModel != false) docs[i][docModel.field] = docModel.name;

        _.each(jsonFields, function(jsonField) {
            if (doc[jsonField]) {
                if (model.useNested) {
                    // var childDocs = _.isArray(doc[jsonField])) ? doc[jsonField]): [doc[jsonField]];
                    //     _.each(childDocs, function(d, cidx) {
                    //         childDocs[cidx].
                    //     });
                    //     docs[i][jsonField] = _.isArray(docs[i][jsonField])) docs[i][jsonField] docs[i]['_childDocuments_']
                } else {
                    docs[i][jsonField] = JSON.stringify(docs[i][jsonField]);
                }
            }
        });


        _.each(binaryFields, function(binaryField) {
            if (doc[binaryField]) {
                docs[i][binaryField] = docs[i][binaryField].toString('utf-8');
            }
        });

    });

    self.log('_prepareDocuments ####', docs);
    return docs;
}

Collection.prototype._parseDocuments = function(connection, collection, docs) {
    var self = this;
    var model = self.collections[collection];
    var docModel = self.getDocModel(connection, collection);

    var jsonFields = [];
    _.each(self.collections[collection].definition, function(field) {
        if (field.type == 'json') {
            jsonFields.push(field.columnsName || field.name);
        }
    });

    var binaryFields = [];
    _.each(self.collections[collection].definition, function(field) {
        if (field.type == 'binary') {
            binaryFields.push(field.columnsName || field.name);
        }
    });

    var dateFields = [];
    _.each(self.collections[collection].definition, function(field) {
        if (field.type == 'date' || field.type == 'datetime') {
            dateFields.push(field.columnsName || field.name);
        }
    });
    // console.log('_parseDocuments'.rainbow.inverse, 'here', dateFields);

    if ((jsonFields.length + binaryFields.length + dateFields.length) == 0) {
        // console.log('_parseDocuments'.rainbow.inverse, 'EXIT')
        return docs;
    }

    _.each(docs, function(doc, i) {
        _.each(jsonFields, function(jsonField) {
            if (doc[jsonField]) {
                // console.log(docs[i][jsonField]);
                if (model.useNested) {
                    // var childDocs = _.isArray(doc[jsonField])) ? doc[jsonField]): [doc[jsonField]];
                    //     _.each(childDocs, function(d, cidx) {
                    //         childDocs[cidx].
                    //     });
                    //     docs[i][jsonField] = _.isArray(docs[i][jsonField])) docs[i][jsonField] docs[i]['_childDocuments_']

                } else {
                    docs[i][jsonField] = JSON.parse(docs[i][jsonField]);
                }
            }
        });

        _.each(binaryFields, function(binaryField) {
            if (doc[binaryField]) {
                docs[i][binaryField] = new Buffer(docs[i][binaryField], 'utf-8');
            }
        });

        _.each(dateFields, function(dateField) {
            if (doc[dateField]) {
                docs[i][dateField] = new Date(docs[i][dateField]);
                // console.log('_parseDocuments'.rainbow.inverse, 'docs[i][dateField]', docs[i][dateField]);
            }
        });
    });

    self.log('_prepareDocuments ####', docs);
    return docs;
}
/**
 * Get doc model configuration.
 *
 * TODO:
 *
 * @param  {[type]} connection [description]
 * @param  {[type]} collection [description]
 * @return {[type]}            [description]
 */
Collection.prototype.getDocModel = function(connection, collection) {
    var self = this;
    /* get connection config model usage */
    // if (!_.isUndefined(self.config.multiModels) && )
    if (this.config.single == true) {
        return false;
    }

    if (!_.has(self.collections[collection], 'schema.modelname')) {
        // return false;
    }

    collection = collection || connection;
    return {
        name: collection,
        field: 'modelname' //TODO: get model attributes.model.collomnName (and if attributes.model.stored: false can be hidden)

    };
}

/**
 * Add docmodel
 *
 * TODO: return just fq and use asing
 *
 * @param {[type]} collection [description]
 * @param {[type]} options    [description]
 */
Collection.prototype.addDocModel = function(collection, options) {
    var self = this;
    var docModel = self.getDocModel(collection);
    // console.log('addDocModel docModel'.rainbow.inverse, docModel);
    options['q.op'] = options['q.op'] || 'AND';

    if (docModel == false) {
        return options;
    } else {
        options.fq = options.fq || {};
        if (_.isArray(options.fq)) {
            var fq = {};
            fq[docModel.field] = docModel.name;
            options.fq.push(fq)
        } else {
            options.fq[docModel.field] = docModel.name;
        }
        return options;
    }
}

/**
 * Update documents.
 *
 * https://cwiki.apache.org/confluence/display/solr/Updating+Parts+of+Documents
 * http://yonik.com/solr/atomic-updates/
 *
 * TODO: multiple docs.
 *
 * @param  {[type]}   collectionName [description]
 * @param  {[type]}   options        [description]
 * @param  {[type]}   values         [description]
 * @param  {Function} cb             [description]
 * @return {[type]}                  [description]
 */
Collection.prototype.update = function(connection, collection, options, values, cb) {
    // console.log('collection UPDATE params'.red.inverse,options, values);
    var self = this;
    // console.log('collection UPDATE query'.red.inverse, JSON.stringify(options), JSON.stringify(values));

    self.commit(collection, options, function(err, data) {
        self.find(connection, collection, options, function(err, data) {
            if (err) return cb(err, null);
            _.forEach(data, function(d, i) {
                _.forEach(values, function(value, field) {
                    data[i][field] = value;
                    // delete data[i]._version_;
                    data[i]._version_ = 0;
                });

            });
            // console.log('collection UPDATE query data'.red.inverse, JSON.stringify(data[0]));
            self.client.addDoc({
                commit: true,
                // _version_: 0
                // softCommit: true
            }, data, function(err, response) {
                if (err) return cb(err, null);
                return cb(false, data);
            });
            // self.create(connection, collection, data, function(err, response) {
            //     if (err) return cb(err, null);
            //     return cb(false, data);
            // })
        });
    });


    //TODO: ??


    // query.id = options.where.id;
    // _.forEach(values, function(value, field) {
    //     query[field] = {
    //         set: value
    //     };
    // });


    // var docs = _.isArray(values) ? values : [values];
    // self.client.updateDoc({
    //     commit: true
    // }, [query], function(err, data) {

    //     cb(false, query);
    // });
}


/**
 * Destroy all docuemnts for current model
 *
 */
Collection.prototype.destroy = function(collection, options, cb) {
    var self = this;
    self.log('DESTROY'.rainbow, options, collection);
    //add doc model if defined
    options = self.addDocModel(collection, options);

    //TODO: id == pk
    // if (_.has(options, 'where.id') && options.where.id == null) {
    //     // if(options.where.hasOwnProperty('id') && options.where.id === null) {
    //     options.where.id = '*';
    // }
    // if (_.has(options, 'where.id') && _.isArray(options.where.id)) {
    //     options.where.id = _.isArray(options.where.id) ? '(' + options.where.id.join(' OR ') + ')' : options.where.id;
    // }
    // curl -X POST -H 'Content-type:application/json' --data-binary '{"delete":{"query":"q=first_name%3ADestroy&fq=modelname%3Asemantic&start=0&rows=30","commitWithin":1}}' http://localhost:8983/solr/schemaless/schema
    // curl -X POST -H 'Content-type:application/json' --data-binary '{"delete":{"query":{first_name:'Destroy', modelname:'semantic'}}}' http://localhost:8983/solr/schemaless/schema
    // console.log('DESTROY'.rainbow, inspect(options));
    // console.log('DESTROY'.rainbow, inspect(query));
    //
    // curl -X POST -H 'Content-type:application/json' --data-binary '{"delete":{"query":"*:*"}}' http://localhost:8983/solr/schemaless


    var query = new Query(options);
    //TODO: move that to find
    self.client.find(query.queryUri, function(err, data) {
        // console.log('DESTROY'.rainbow, inspect(query));
        // console.log('DESTROY'.rainbow, inspect(data.response.numFound));
        if (err) return cb(err, {});

        if (!_.isUndefined(data.response) && data.response.numFound > 0) {

            // console.log('DESTROY'.red.underline, query);
            self.client.deleteDocByQuery({
                    'delete': {
                        // query: "first_name:Destroy AND modelname:semantic",
                        query: query.deleteQuery,
                        "commitWithin": 1
                    },
                },
                function(err, resp) {
                    self.log('DESTROY QUERY'.rainbow, data.response.docs, err);
                    cb(false, data.response.docs);
                });

        } else {
            // self.log('DESTROY QUERY'.rainbow, data.response.docs, err);
            cb(false, []);
        }
    })
}

Collection.prototype.commit = function(collection, options, cb) {
    var self = this;
    this.client.commit({
        commit: true
    }, function(err, data) {
        if (err) {
            self.log('commit', {
                adapter: 'sails-solr',
                msg: (data.status || err)
            });
        } else {
            self.log('commit', {
                adapter: 'sails-solr',
                msg: (data || err)
            });
        }
        cb(false, data);
    });
}

/*
 * Get current solr schema
 */
Collection.prototype.schema = function(collection, cb) {
    var self = this;
    self.log('SCHEMA collection', collection);
    if (_.isUndefined(self.schema)) {
        self.client.getSchema(function(err, data) {
            // self.log('schema', data);
            if (err) {
                cb(err, false);
            } else {
                self.schema = data.schema;
                cb(false, data.schema);
            }
        });
    } else {
        cb(false, data.schema);
    }
}

//TODO: deprecated?
Collection.prototype.schemaFields = function(collectionName, values, cb) {
    var self = this;
    self.client.schemaFields(null, cb);
}

/**
 * Drop collection data
 * @param  {Function} cb [description]
 * @return {[type]}      [description]
 */
Collection.prototype.drop = function(connection, collection, cb) {
    var self = this;
    // return cb(false,collection);
    var migrate = self.collections[collection].migrate;
    console.log('COLLECTION DROP migrate: '.red, migrate, connection, collection);
    async.waterfall([

            function(callback) {
                if (migrate != 'drop') return callback(null);
                self.destroy(collection, {}, function(err, response) {
                    callback(null);
                });
            },
            function(callback) {
                self.client.getSchema(function(err, response) {
                    callback(err, response.schema);
                });
            },

            // function(schema, callback) {
            //     if (migrate != 'drop') return callback(null, schema);
            //     console.log('COLLECTION DROP migrate: '.red.inverse, migrate, connection, collection);
            //     console.log('delete fields '.magenta.inverse, {
            //         collection: collection,
            //         migrate: migrate
            //     });
            //     //TODO: getSchema should return only mapped modele definition
            //     //deleteFields should only delete mapped model definition
            //     self._deleteFields(schema.fields, collection, function(err, data) {
            //         callback(err, schema);
            //     });
            // },
            // function(schema, callback) {
            //     if (migrate != 'drop') return callback(null, schema);
            //     self._deleteDynamicFields(schema.dynamicFields, collection, function(err, data) {
            //         callback(err, schema);
            //     });
            // },

            // function(schema, callback) {
            //     if (migrate != 'drop') return callback(null, schema);
            //     self.collections[collection]._droped = true;
            //     callback(false, schema);
            // }
        ],
        function(err, schema) {
            if (err) {
                cb(err, {});
            } else {
                cb(false, collection);
            }
        });
}

Collection.prototype._deleteFields = function(schema, collection, cb) {
    var self = this;

    async.each(schema, function(field, callback) {

        if (_.indexOf(['id', '_root_', '_version_', '_text_'], field.name) == -1) {

            console.log('delete fields ',field.length);
            if(!self._checkModelsForDelete(collection, field.name)) {
                return callback();
            }
            self.client.deleteSchemaFields({
                "delete-field": {
                    "name": field.name
                }
            }, function(err, data) {
                if (err) console.log(err);
                callback();
            })
        } else {
            callback();
        }
    }, function(err) {
        cb(err, {});
    });
};

Collection.prototype._deleteDynamicFields = function(schema, collection, cb) {
    var self = this;
    async.each(schema, function(field, callback) {

        if(!self._checkModelsForDelete(collection, field.name)) {
            return callback();
        }

        self.client.deleteSchemaFields({
            "delete-dynamic-field": {
                "name": field.name
            }
        }, function(err, data) {
            if (err) console.log(err);
            callback();
        })

    }, function(err) {
        cb(err, {});
    });
};

Collection.prototype._checkModelsForDelete = function(collection, field) {
    return false;
    _.forEach(this.collections, function(col, key) {

        if (collection != key && col._droped != true && !_.isUndefined(col.definition[field])) {
            console.log('_checkModelsForDelete delete'.red,
            {
                'do not delete': 'do not delete',
                collection: collection,
                field: field,
                key:key,
                // definition: col.definition
            });
            return false;
        }
    });
    console.log('_checkModelsForDelete delete'.red.inverse,
            {
                'delete': 'delete',
                collection: collection,
                field: field,
            });
    return true;
}

Collection.prototype._replaceDynamicField = function(field, cb) {
    var self = this;
    async.each(schema, function(field, callback) {
        self.client.deleteSchemaFields({
            "replace-dynamic-field": {     
                "name": field.name,
                     "type": "string",
                     "stored": false
            }
        }, function(err, data) {
            if (err) console.log(err);
            callback();
        })

    }, function(err) {
        cb(err, {});
    });
};

Collection.prototype._getSchema = function(collection, cb) {
    var self = this;

    self.client.getSchema(function(err, data) {
        if (err) {
            self.log(err);
            cb(err, false);
        } else {
            var response = {};
            var schemaFields = _.assign(data.schema.fields, data.schema.dynamicFields);
            // self.log('DESCRIBE SCHEMAFIELDS SCHEMAFIELDS', schemaFields);
            _.each(schemaFields, function(field, i) {
                if (_.indexOf(['_root_', '_version_', '_text_'], field.name) == -1) {
                    i = field.name;
                    delete field.name;
                    response[i] = field;
                }
            })
            // console.log('DESCRIBE SCHEMAFIELDS RESPONSE', response);
            // self.log('DESCRIBE SCHEMAFIELDS RESPONSE', self.collections[collection].definition);
            // self.schema = data.schema;
            // self.collections[collection]._test = collection;
            self._test = collection;
            cb(false, response);
        }
    });
}

/**
 * Describe
 * Alter Scheme drop (drop, describe, define), alter(describe, describe, define), create(describe, describe, define), safe()
 * @param  {[type]}   collection [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
Collection.prototype.describe = function(collection, cb) {
    var self = this;
    var migrate = self.collections[collection].migrate;
    self.log('DESCRIBE collection'.magenta, collection, migrate, self.collections[collection].autoCreatedAt);
    // console.log('DEFINE collection'.magenta, self.collections[collection]);
    // _.each(self.collections[collection].definition, function(attr, field) {
    //     console.log(field, attr);
    // });
    if (!_.isUndefined(self.collections[collection].schema)) {
        cb(false, self.collections[collection].schema);
    } else {
        cb(false);
    }
}

Collection.prototype._describe = function(collection, cb) {
    var self = this;
    var migrate = self.collections[collection].migrate;
    // console.log('DESCRIBE collection'.magenta, collection, migrate, self.collections[collection].autoCreatedAt);
    self.client.getSchema(function(err, data) {
        if (err) {
            self.log(err);
            cb(err, false);
        } else {
            var schema = {};
            var schemaFields = _.assign(data.schema.fields, data.schema.dynamicFields);
            // console.log('_DESCRIBE schemaFields', schemaFields);
            //TODO: simplify with lodash
            _.each(schemaFields, function(field, i) {
                if (_.indexOf(['_root_', '_version_', '_text_'], field.name) == -1 && !_.isUndefined(self.collections[collection].definition[field.name])) {
                    _.each(self.schemaDefaultFieldTypeMap, function(type, mapField) {
                        if (mapField == field.type || (_.isString(type) && type == field.type) || (_.isObject(type) && type.type == field.type)) {
                            schema[field.name] = {
                                'type': mapField
                            };
                            if (!_.isUndefined(data.schema.uniqueKey) && data.schema.uniqueKey == field.name) {
                                schema[field.name].primaryKey = true;
                                schema[field.name].unique = true;
                            } else if (self.collections[collection].primaryKey == field.name) {
                                schema[field.name].primaryKey = true;
                            }
                            if (!_.isUndefined(field.required) && field.required == true) {
                                schema[field.name].required = true;
                            }
                            if (!_.isUndefined(self.collections[collection].definition[field.name].unique)) {
                                schema[field.name].unique = true;
                            }
                        }
                    })
                }
            })
            // if(!_.isUndefined(self.collections[collection].schema))
            // console.log('_DESCRIBE schema', schema);
            cb(false, schema);
        }
    });
}

/**
 * Define
 * create a core/model if not exists
 * drop (drop, describe, define), alter(describe, describe, define), create(describe, describe, define), safe()
 * @param  {[type]}   collection [description]
 * @param  {[type]}   definition [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
Collection.prototype.define = function(collection, definition, cb) {
    var self = this;
    var migrate = self.collections[collection].migrate;
    self.log('DEFINE collection'.magenta, collection, self.collections[collection].migrate, definition);
    // console.log('DEFINE collection'.magenta, collection, self.collections[collection].primaryKey);

    async.waterfall([

            function(callback) {
                self._define(collection, definition, function(err, schema) {
                    callback();
                });
            },

            function(callback) {

                if (_.indexOf(['drop', 'alter'], migrate) == -1) return callback(null);


                var newSchema = _.toArray(_.reduce(definition, function(result, n, key) {
                    if (_.isUndefined(n.primaryKey)) {
                        // self.collections[collection].primaryKey = key;
                    }
                    n.name = key;
                    result[key] = n;
                    return result;
                }, {}));

                //TODO:
                newSchema.push({
                    name: 'modelname',
                    type: 'string'
                });

                //TODO suggest:
                // newSchema.push({
                //     name: 'suggest',
                //     type: 'string'
                // });

                if (self.collections[collection].autoPK != true)
                    newSchema.push({
                        name: 'id',
                        type: 'string',
                        required: true,
                        unique: true
                    });

                if (self.collections[collection].autoCreatedAt != true)
                    newSchema.push({
                        name: 'createdAt',
                        type: 'datetime',
                        required: true
                    });

                if (self.collections[collection].autoUpdatedAt != true)
                    newSchema.push({
                        name: 'updatedAt',
                        type: 'datetime',
                        required: true
                    })


                async.each(newSchema, function(field, cb) {
                        //TODO: suggest collect searchable
                        self.addAttribute(collection, field, cb);
                    },
                    function(err) {
                        if (err) console.log(err);
                        // cb(false, definition);
                        callback(null);
                    });
            },
            function(callback) {
                self._describe(collection, function(err, schema) {
                    self.collections[collection].schema = schema;
                    callback(null, schema)
                });
            },

        ],
        function(err, schema) {
            self.log('DEFINE SCHEMA', schema);
            cb(false, schema);
        });
}

Collection.prototype._define = function(collection, definition, cb) {
    var self = this;
    var parsedDefinition = {
        jsonFields: [],
        binaryFields: [],
        dateFields: [],
        unique: [],
    };

    _.each(definition, function(attr, field) {
        if (attr.type == 'json') {
            parsedDefinition.jsonFields.push(attr.columnsName || field);
        }
        if (attr.type == 'binary') {
            parsedDefinition.binaryFields.push(attr.columnsName || field);
        }
        if (attr.type == 'date' || field.type == 'datetime') {
            parsedDefinition.dateFields.push(attr.columnsName || field);
        }
        if (!_.isUndefined(attr.unique) && attr.unique == true) {
            parsedDefinition.unique.push(attr.columnsName || field);
        }
    });

    self.collections[collection].parsedDefinition = parsedDefinition;

    cb(null, parsedDefinition);
}

Collection.prototype.addAttribute = function(collection, field, cb) {
    var self = this;
    self.log('addAttribute ' + collection, field);
    //TODO: allways defined
    if (1 == 1 || _.isUndefined(schema[field.name])) {
        self.log('define field', field.name);

        // console.log('addAttribute1'.cyan.inverse, field);
        /* reduce to valid solr attributes*/
        field = _.pick(field, _.keys(self.schemaDefaultFieldAttributes));
        // console.log('addAttribute2'.cyan.inverse, field);

        // map field types and additioal field attributes
        if (_.isString(self.schemaDefaultFieldTypeMap[field])) {
            field.type = self.schemaDefaultFieldTypeMap[field];
        } else if (_.isString(self.schemaDefaultFieldTypeMap[field.type])) {
            field.type = self.schemaDefaultFieldTypeMap[field.type];
        } else {
            field = _.assign(field, self.schemaDefaultFieldTypeMap[field.type])
        }
        // console.log('addAttribute3'.cyan.inverse, field);

        /* add default solr attributes */
        field = _.defaults(field, self.schemaDefaultFieldAttributes);
        // console.log('addAttribute4'.cyan.inverse, field);

        var addField = {};
        // detect field dynamic
        if (_.isUndefined(field.dynamicField) || field.dynamicField == false) {
            addField['add-field'] = field //'unique', TODO: check doku;
            delete addField['add-field'].dynamicField;
        } else {
            addField['add-dynamic-field'] = field //'unique', TODO: check doku;
            addField['add-dynamic-field'].name = field.dynamicField;
            delete addField['add-dynamic-field'].dynamicField;
        }


        // console.log('addAttribute'.cyan.inverse, field);
        // console.log('addAttribute'.cyan.inverse, addField, field, self.schemaDefaultFieldTypeMap);

        // add field
        self.client.schemaFields(
            addField,
            function(err, data) {
                // console.log('define field client.schemaFields', err, inspect(data));
                if (err) console.log(err);
                cb();
            }
        );

    } else {
        self.log('already defined field!!!', field);
        cb();
    }
}

Collection.prototype.autoCreatedAt = function(cb) {
    var self = this;
    self.addAttribute({
        createdAt: 'date'
    }, cb)
}

Collection.prototype.suggest = function(connection, collection, options, cb) {
    var self = this;
    options = self.addDocModel(collection, options);
    var query = new Query(options);
    query = query.queryUri;

    self.client.suggest(query, function(err, data) {
        if (err) {
            console.log('collection.suggest error', err);
            return cb('collection.suggest error', {});
        } else {
            return cb(false, data);
        }
    });
}

Collection.prototype.browse = function(connection, collection, options, cb) {
    var self = this;
    options = self.addDocModel(collection, options);
    var query = new Query(options);
    query = query.queryUri;

    self.client.suggest(query, function(err, data) {
        // console.log('Collection.FIND ', err, data);
        if (err) {
            console.log('collection.browse error', err);
            return cb('collection.browse error', {});
        } else {
            return cb(false, data);
        }
    });
}

Collection.prototype.schemaDefaultFieldTypes = {
    'string_keyword_new' : {
        'name':'string_keyword',
        'class':'solr.TextField',
        'analyzer' : {
            'tokenizer':{
               'class':'solr.LowerCaseTokenizerFactory' },
            'filters':[
                // {'class':'solr.ASCIIFoldingFilterFactory'},
                // {'class':'solr.LowerCaseFilterFactory'},
                // {'class':'solr.ReversedWildcardFilterFactory'}
               ]
        }
    },
    'string_keyword' : {
        'name':'string_keyword',
        'class':'solr.TextField',
        'analyzer' : {
            'tokenizer':{
               'class':'solr.KeywordTokenizerFactory' },
            'filters':[
                {'class':'solr.LowerCaseFilterFactory',}
               ]
        }
    }
}

Collection.prototype.schemaDefaultFieldTypeMap = {
    'string': 'text_general',
    'text': 'text_general',
    'binary': 'text_general',
    'integer': 'int',
    'float': 'float',
    'date': 'date',
    'time': 'date',
    'datetime': 'date',
    'boolean': 'boolean',
    'binary': 'text_general',
    'array': {
        type: 'text_general',
        multiValued: true
    },

    'json': {
        type: 'text_general',
        multiValued: false,
        dynamicField: '*_json',
    },
    'Point': 'location_rpt',
    'point': 'location_rpt',
    'Polygon': 'location_rpt',
    'polygon': 'location_rpt',
    'geometry': 'location_rpt',
}

//TODO: add to connection config;
Collection.prototype.schemaDefaultFieldAttributes = {
    name: 'newField',
    type: 'text_general',
    indexed: true,
    stored: true,
    docValues: false,
    sortMissingFirst: false,
    sortMissingLast: false,
    multiValued: false,
    omitNorms: true,
    omitTermFreqAndPositions: false,
    omitPositions: false,
    termVectors: true,
    termPositions: false,
    termOffsets: false,
    termPayloads: false,
    required: false,
    dynamicField: false,
}

//DEPRECATED!!
Collection.prototype.getModelData = function(connection) {


    // var model = connections[connection].collections[collection];
    // self.log('search', inspect(collections));
    // find: function(connection, collection, options, cb) {
    //   var model = connections[connection].collections[collection];
    //   var queryParams = model.queryParams ||  {};


    var Model = {
        // 'connection': connection,
        // 'hasSchema': collections[connection].hasSchema,
        // 'migrate': collections[connection].migrate,
        // 'primaryKey': collections[connection].primaryKey,
        // 'schema': collections[connection].waterline.schema,
        // // 'schema.attributes': collections[connection].waterline.schema[connection].attributes,
        // 'schema.attributes': collections[connection]._attributes,
        // 'definition': collections[connection].definition,
        // // 'model': collections[connection].connections.solr,
        // // 'query': collections[connection].collections[connection].queryParams,
        // 'attributesFromModel': '',
        // 'wildcardAttributesFromSolr': '',
        // 'attributesFromSolr': '',
    }

    // // // console.log(Object.keys(collections)[0], '##########################################');
    // // // console.log('##########################################', connection, '##########################################');
    // // // console.log('##########################################', collections[collectionsKey].waterline.collections, '##########################################');
    // // // console.log(collections, '-', '##########################################');
    // // // console.log(connection.identity, '##########################################');
    // self.log('CONSTRUCT', myData);

    self.log('getModelData', Model);

    return Model;
}

/**
 * Get id
 *
 * check for primaryKey
 * check for primaryKey
 * check for unique
 * generate UUID
 * generate md5 from Model+uniqueFields
 *
 * @param  {[type]} connection [description]
 * @param  {[type]} collection [description]
 * @param  {[type]} value      [description]
 * @return {[type]}            [description]
 */
Collection.prototype._getId = function(connection, collection, value) {
    var self = this;
    var modelSchema = self.collections[collection].definition;
    var solrSchema = self.schema;
    var solrId = solrSchema.uniqueKey;
    var uniqueVal = [];

    _.each(modelSchema, function(val, key) {
        if (!_.isUndefined(val.unique) && !_.isUndefined(value[key])) {
            uniqueVal.push(value[key]);
        }
    });

    if (uniqueVal.length > 0) {
        return md5(collection + uniqueVal.join(''));
    } else {
        // if (values.hasOwnProperty('id') && _.isNaN(values.id)) {
        return uuid.v4();
    }

    var SolrUniqKey = solrSchema.uniqueKey;
    self.log('getId: ', modelSchema);
}

Collection.prototype.getClientConfig = function() {
    self.log('GETCLIENTCONFIG', this.client.getConfig());
}

Collection.prototype.log = function(msg, data, depth) {
    // return false;
    if (this.config.debugCollection == false)
        return false;
    utils.log('waterline-solr collection.js'.yellow.inverse + ' ' + msg, data, depth);
}
