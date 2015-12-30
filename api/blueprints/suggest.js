

/**
 * Module dependencies
 */
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
  _ = require('lodash');

/**
 * Find Records
 *
 *  get   /:modelIdentity
 *   *    /:modelIdentity/find
 *
 * An API call to find and return model instances from the data adapter
 * using the specified criteria.  If an id was specified, just the instance
 * with that unique id will be returned.
 *
 * Optional:
 * @param {Object} where       - the find criteria (passed directly to the ORM)
 * @param {Integer} limit      - the maximum number of records to send back (useful for pagination)
 * @param {Integer} skip       - the number of records to skip (useful for pagination)
 * @param {String} sort        - the order of returned records, e.g. `name ASC` or `age DESC`
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 */

module.exports = function suggest (req, res) {

  // Look up the model
  var Model = actionUtil.parseModel(req);

  console.log('SUGGEST ', actionUtil.parsePk(req));
  var searchTerm = {q: actionUtil.parsePk(req)};
  console.log('SUGGEST searchTerm', searchTerm);

  if (!actionUtil.parsePk(req)) {
    searchTerm.q = actionUtil.parseCriteria(req)['q'];
    console.log('SUGGEST ', actionUtil.parseCriteria(req));
  }
  console.log('SUGGEST searchTerm', searchTerm);
  if (searchTerm) {
    Model.suggest(searchTerm, function(err, data){
        if (err) return res.serverError(err);
        if (req._sails.hooks.pubsub && req.isSocket) {
        Model.subscribe(req, data);
          if (req.options.autoWatch) { Model.watch(req); }
          // Also subscribe to instances of all associated models
          _.each(data, function (record) {
            actionUtil.subscribeDeep(req, record);
          });
        }

        res.ok(data);
    })
  } else {
    res.err('dfdsf');
  }

};

