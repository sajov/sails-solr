//https://www.reddit.com/r/sailsjs/comments/2smylz/adding_a_custom_blueprint_to_all_models/

module.exports = function (sails) {
    var blueprints = [
        "suggest",
        "browse"
    ];

    var hook = {
        initialize: function (cb) {
            var eventsToWaitFor = [];
            eventsToWaitFor.push('router:before');
            if (sails.hooks.policies) {
                eventsToWaitFor.push('hook:policies:bound');
            }
            if (sails.hooks.orm) {
                eventsToWaitFor.push('hook:orm:loaded');
            }
            if (sails.hooks.controllers) {
                eventsToWaitFor.push('hook:controllers:loaded');
            }
            sails.after(eventsToWaitFor, hook.bindShadowRoutes);
            cb();
        },

        bindShadowRoutes: function () {
            _.each(sails.middleware.controllers, function eachController(controller, controllerId) {
                var models = Object.keys(sails.models);

                function _bindRoute(path, action, options) {
                    sails.router.bind(path, _getAction(action), null, options);
                };

                function _getAction(blueprintId) {
                    return sails.middleware.controllers[controllerId][blueprintId];
                }

                for (var i = 0; i < blueprints.length; i++) {
                    if (models.indexOf(controllerId) === -1) {
                        continue;
                    }

                    _bindRoute("get /" + controllerId + "/" + blueprints[i], blueprints[i], {
                        model: controllerId,
                        blueprint: blueprints[i]
                    });
                }
            });
        }
    }

    return hook;
}