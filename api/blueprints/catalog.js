

/**
 * Module dependencies
 */
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
  _ = require('lodash');

module.exports = function catalog (req, res) {

  // Look up the model
  var Model = actionUtil.parseModel(req);
  var options = req.params.all();

  var opt = {
    where:actionUtil.parseCriteria(req),
    sort: actionUtil.parseSort(req),
    limit: actionUtil.parseLimit(req),
    skip: actionUtil.parseSkip(req)
  }

  if (options) {
    Model.catalog(opt, function(err, data){
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
    res.err('Solr.catalog error');
  }

};
