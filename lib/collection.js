var _ = require('lodash');
var async = require('async');

var colors = require('colors');
var querystring = require('querystring');
var util = require('util');
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
    this.config.modelKey = 'model_s';
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

Collection.prototype.initialize = function(cb) {
    var self = this;
    // log('this.collectionsthis.collectionsthis.collections', Object.keys(this.collections));
    self.client.coreStatus(function(err, data) {
        // log('self.client.self.config.manageCores', self.config.manageCores);
        // log('self.client.coreStatus', err);

        if (_.isUndefined(data.status[self.config.core]) && self.config.manageCores) {
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
    log('self.client.coreStatus'.rainbow.inverse, core);
    self.client.coreCreate({
            action: 'CREATE',
            name: core,
            loadOnStartup: true,
            instanceDir: core,
            configSet: 'data_driven_schema_configs',
            config: 'solrconfig.xml',
            schema: 'schema.xml',
            // config: '../gettingstarted/config/solrconfig.xml',
            // schema: '../gettingstarted/config/schema.xml',
            dataDir: 'data'
        },
        function(err, data) {
            if (err) console.log(err);
            cb();
        });
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
    log('FIND model', model.DUDE);
    log('self.collections[collection]._test', self.collections[collection]._test);
    log('self._test', self._test);
    // log('FIND model.definition', model.definition);
    // log('FIND model._schema', model._schema);
    // log('FIND model', model.connections); model methods
    // log('FIND model', model);
    // console.log('Collection.prototype.model'.red.inverse, inspect(model, 10))
    // console.log('Collection.prototype.find'.red.inverse, options)
    options = self.addDocModel(collection, options);
    var query = new Query(options);
    console.log('Collection.prototype.find query'.red.inverse, query)
    query = query.queryUri;

    self.client.select(query, function(err, data) {
        if (err) {
        console.log('FIND error', err);
            log('FIND error', err);
            return cb('adapter.find error', {});
        } else {
            // if(_.isObject(data) && _.getPath(data, "response.docs") && !_.isEmpty(data.response.docs)) {
            if (_.isObject(data)) {
                if (_.has(data, ['response', 'numFound'])) {
                    // model.lastRequestCount = data.response.numFound;
                }
                if (_.has(data, ['response', 'docs'])) {
                    return cb(false, self._parseDocuments(connection, collection, data.response.docs));
                } else if (_.has(data, 'grouped')) {

                    // console.log('ADAPTER find'.rainbow.inverse, data.grouped)

                    return cb(false, self._parseDocuments(connection, collection, data.grouped));
                } else {
                    return cb(false, self._parseDocuments(connection, collection, data));
                }
            } else {
                log('FIND no data', data);
                return cb(false, {});
            }
        }
    });
}

Collection.prototype.findAndCount = function(connection, collection, options, cb) {
    var self = this;
    options = self.addDocModel(collection, options);
    var query = new Query(options);
    query = query.queryUri;
    self.client.select(query, function(err, data) {
        if (err) {
            log('findAndCount error', err);
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
                log('FIND no data', data);
                return cb(false, {});
            }

            // _.each(response.data, function(d, i) {
            //     response.data[i] = model._instanceMethods.toJSON(d);
            // });

            cb(false, response);
        }
    });
}

Collection.prototype.count = function(collectionName, options, cb) {

    var self = this;

    self.log('Collection count options', options);

    options.limit = 0;

    options = self.addDocModel(collection, options);
    var query = new Query(options);
    query = query.queryUri;

    self.client.select(query, function(err, data) {
        if (!err && data.response.numFound >= 0) {
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

    log('CREATE', {
        'connection': connection,
        'collection': collection,
        'values': values,
    });

    /* write into solr */
    self.client.addDoc({
        commit: true
        // softCommit: true
    }, this._prepareDocuments(connection, collection, values), cb);
    // self.client.addDoc({commitWithin:50},docs, cb);
    // self.client.addDoc(values, cb);
    // client.addDoc([{id:'rednew',title:'dfsfsdfsdfsf'}],function(err,data){console.log('addDoc'.yellow,err,data)});
    // client.commit({commit:true},function(err,data){console.log('commit'.yellow,err,data)});
    // client.addDoc({commitWithin:500},[{id:'rednew',title:'dfsfsdfsdfsf'}],function(err,data){console.log('addDoc'.yellow,err,data)});
    // client.addDoc({add: {commitWithin:500,doc:{id:'rednew',title:'dfsfsdfsdfsf'}}},function(err,data){console.log('addDoc'.yellow,err,data)});
    // self.client.addDoc({softCommit:false},values, cb);
    // self.client.addDoc({commitWithin:50},values, cb);
}

Collection.prototype._prepareDocuments = function(connection, collection, values) {
    var self = this;
    var docs = _.isArray(values) ? values : [values];

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

    //TODO: add assign attribute defaultsTo
    // var defaultsToFields = {};
    // _.each(self.collections[collection].definition, function(field) {
    //     if (!_.isUndefined(field.defaultsTo)) {
    //         defaultsToFields.push(field.columnsName || field.name);
    //     }
    // });

    // log('DEFINITION', self.collections[connection].definition);

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



        // _.each(defaultsToFields, function(binaryField) {
        //     if (doc[binaryField]) {
        //         // docs[i][binaryField] =
        //     }
        // });
    });

    log('_prepareDocuments ####', docs);
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
    console.log('_parseDocuments'.rainbow.inverse, 'here',dateFields);

    if ((jsonFields.length + binaryFields.length + dateFields.length) == 0) {
        console.log('_parseDocuments'.rainbow.inverse, 'EXIT')
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

        _.each(binaryFields, function(binaryField) {
            if (doc[binaryField]) {
                docs[i][binaryField] = new Buffer(docs[i][binaryField], 'utf-8');
            }
        });

        _.each(dateFields, function(dateField) {
            if (doc[dateField]) {
                docs[i][dateField] = new Date(docs[i][dateField]);
                console.log('_parseDocuments'.rainbow.inverse,'docs[i][dateField]', docs[i][dateField]);
            }
        });
    });

    log('_prepareDocuments ####', docs);
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

    /* get connection config model usage */
    // if (!_.isUndefined(self.config.multiModels) && )
    if (this.config.single == true) {
        return false;
    }

    collection = collection || connection;
    return {
        name: collection,
        field: 'model_s' //TODO: get model attributes.model.collomnName (and if attributes.model.stored: false can be hidden)

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
Collection.prototype.update = function(collectionName, options, values, cb) {
    // console.log('DATABASE UPDATE params'.red.inverse,options, values);
    var self = this;
    var query = {};
    //TODO: ??
    query.id = options.where.id;
    _.forEach(values, function(value, field) {
        query[field] = {
            set: value
        };
    });
    // console.log('DATABASE UPDATE query'.red.inverse, JSON.stringify([query]));
    // var docs = _.isArray(values) ? values : [values];
    self.client.updateDoc({
        commit: true
    }, [query], function(err, data) {
        cb(false, query);
    });
}

Collection.prototype.countOld = function(collectionName, options, cb) {

    var self = this;
    var query = new solr.Query();

    if (_.has(options, 'where') && _.isEmpty(options.where)) {} else if (_.has(options, 'where.id')) {
        query.q('id:' + options.where.id);
    } else if (_.has(options, 'where.q')) {
        if (_.isString(options.where.q)) {
            query.q(options.where.q);
        } else {
            query.q(options.where.q.like, '*');
        }
    }


    query.rows(0);

    /* additional query params */
    if (_.has(options, 'queryParams')) {
        _.forEach(options.queryParams, function(value, field) {
            if (value) {
                if (typeof value === 'string') {
                    query.set(field, value);
                } else if (_.isArray(value)) {
                    // TODO: implement
                } else if (_.isObject(value)) {
                    // TODO: implement
                }
            }
        });
    }

    var query = query.getQuery();
    // sails.log.silly('Collection count query:'.magenta.inverse,query);

    self.client.select(query, function(err, data) {
        // sails.log.warn(data);
        if (!err && data.response.numFound) {
            cb(false, data.response.numFound);
        } else {
            cb(err || 'no data', false);
        }
    });
}

/**
 * Destroy all docuemnts for current model
 *
 */
Collection.prototype.destroy = function(collection, options, cb) {
    var self = this;
    log('DESTROY'.rainbow, options, collection);
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
    // curl -X POST -H 'Content-type:application/json' --data-binary '{"delete":{"query":"q=first_name%3ADestroy&fq=model_s%3Asemantic&start=0&rows=30","commitWithin":1}}' http://localhost:8983/solr/schemaless/schema
    // curl -X POST -H 'Content-type:application/json' --data-binary '{"delete":{"query":{first_name:'Destroy', model_s:'semantic'}}}' http://localhost:8983/solr/schemaless/schema
    // console.log('DESTROY'.rainbow, inspect(options));
    // console.log('DESTROY'.rainbow, inspect(query));


    var query = new Query(options);
    //TODO: move that to find
    self.client.find(query.queryUri, function(err, data) {
        // console.log('DESTROY'.rainbow, inspect(query));
        // console.log('DESTROY'.rainbow, inspect(data.response.numFound));
        if (err) return cb(err, {});

        if (!_.isUndefined(data.response) && data.response.numFound > 0) {

            self.client.deleteDocByQuery({
                    'delete': {
                        // query: "first_name:Destroy AND model_s:semantic",
                        query: query.deleteQuery,
                        "commitWithin": 1
                    },
                },
                function(err, resp) {
                    log('DESTROY QUERY'.rainbow, data.response.docs, err);
                    cb(false, data.response.docs);
                });

        } else {
            // log('DESTROY QUERY'.rainbow, data.response.docs, err);
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
            log('commit', {
                adapter: 'sails-solr',
                msg: (data.status || err)
            });
        } else {
            log('commit', {
                adapter: 'sails-solr',
                msg: (data || err)
            });
        }
        cb(false, data);
    });
}

/*
 * SCHEMA
 */

Collection.prototype.schema = function(collection, cb) {
    var self = this;
    log('SCHEMA collection', collection);
    if (_.isUndefined(self.schema)) {
        self.client.getSchema(function(err, data) {
            // log('schema', data);
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
    console.log('DROP', collection);
    async.waterfall([

            function(callback) {
                self.client.getSchema(function(err, response) {
                    callback(err, response.schema);
                });
            },
            function(schema, callback) {
                self._deleteFields(schema.fields, function(err, data) {
                    callback(err, schema);
                });
            },
            function(schema, callback) {
                self._deleteDynamicFields(schema.dynamicFields, function(err, data) {
                    callback(err, schema);
                });
            }
        ],
        function(err, schema) {
            if (err) {
                cb(err, {});
            } else {
                cb(false, {});
            }
        });
}

Collection.prototype._deleteFields = function(schema, cb) {
    var self = this;
    async.each(schema, function(field, callback) {
        if (_.indexOf(['id', '_root_', '_version_', '_text_'], field.name) == -1) {
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

Collection.prototype._deleteDynamicFields = function(schema, cb) {
    var self = this;
    async.each(schema, function(field, callback) {
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

Collection.prototype._replaceDynamicField = function(field, cb) {
    var self = this;
    async.each(schema, function(field, callback) {
        self.client.deleteSchemaFields({
            "replace-dynamic-field": {     
                "name": field.name,
                     "type": "text_general",
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

Collection.prototype.describe = function(collection, cb) {
    var self = this;

    self.client.getSchema(function(err, data) {
        if (err) {
            log(err);
            cb(err, false);
        } else {
            var response = {};
            var schemaFields = _.assign(data.schema.fields, data.schema.dynamicFields);
            // log('DESCRIBE SCHEMAFIELDS SCHEMAFIELDS', schemaFields);
            _.each(schemaFields, function(field, i) {
                if (_.indexOf(['_root_', '_version_', '_text_'], field.name) == -1) {
                    i = field.name;
                    delete field.name;
                    response[i] = field;
                }
            })
            // console.log('DESCRIBE SCHEMAFIELDS RESPONSE', response);
            log('DESCRIBE SCHEMAFIELDS RESPONSE', self.collections[collection].definition);
            // self.schema = data.schema;
            // self.collections[collection]._test = collection;
            self._test = collection;
            cb(false, self.collections[collection].definition);
        }
    });
}

Collection.prototype.define = function(collection, definition, cb) {
    var self = this;
    console.log('DEFINE collection'.magenta, collection);
    // get schema
    self.describe(collection, function(err, schema) {
        if (err) {
            cb(err, false);
        } else {
            // log('define DEFINITION ', definition);
            // log('define toArray', _.toArray(definition));
            var newFields = _.toArray(_.reduce(definition, function(result, n, key) {
                n.name = key;
                result[key] = n;
                return result;
            }, {}));
            // console.log('define newFields '.magenta, newFields);
            // console.log('define SCHEMA '.magenta, schema);

            async.each(newFields, function(field, callback) {
                    // log('define DEFINITION isUndefined ' + field.name, _.isUndefined(schema[field.name]));
                    // console.log('define FIELD '.rainbow, field);
                    // console.log('define FIELD ?????'.rainbow, schema[field.name]);

                    //TODO: allways defined
                    if (1 == 1 || _.isUndefined(schema[field.name])) {
                        log('define field', field.name);

                        /* reduce to valid solr attributes*/
                        field = _.pick(field, _.keys(self.schemaDefaultFieldAttributes));

                        // map field types and additioal field attributes
                        if (_.isString(self.schemaDefaultFieldTypeMap[field.type])) {
                            field.type = self.schemaDefaultFieldTypeMap[field.type];
                        } else {
                            field = _.assign(field, self.schemaDefaultFieldTypeMap[field.type])
                        }

                        /* add default solr attributes */
                        field = _.defaults(field, self.schemaDefaultFieldAttributes);
                        log('define field', field);

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


                        // console.log('############# addField', addField);
                        log('############# FIELD', field);

                        // add field
                        self.client.schemaFields(
                            addField,
                            function(err, data) {
                                // console.log('define field client.schemaFields', inspect(data));
                                if (err) console.log(err);
                                callback();
                            }
                        );

                    } else {
                        console.log('already defined field!!!', field);
                        callback();
                    }
                },
                function(err) {
                    if (err) console.log(err);
                    cb(false, definition);
                });
        }
    });
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
    // log('search', inspect(collections));
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
    // log('CONSTRUCT', myData);

    log('getModelData', Model);

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
    log('getId: ', modelSchema);
}

Collection.prototype.getClientConfig = function() {
    log('GETCLIENTCONFIG', this.client.getConfig());
}

Collection.prototype.log = function() {
    // console.log('Collection '.cyan.inverse, arguments);
}

function log(msg, data, depth) {
    if (DEBUG == false) {
        return true;
    }

    if (_.isObject(data)) {
        data = inspect(data, depth);
    }

    var app = _.isUndefined('sails') ? false : true;
    if (app) {
        // sails.log.info(('ClusteringInverse ' + msg).red.inverse, data || {});
        console.log('sails-solr collection.js'.yellow.inverse + ' ' + msg.yellow, data || '');
    } else {
        console.log('sails-solr collection.js'.yellow.inverse + ' ' + msg.yellow, data || '');
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
