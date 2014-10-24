'use strict';

angular.module('vassalApp.services')
  .factory('modes', [
    '$q',
    '$rootScope',
    'common_mode',
    'default_mode',
    'model_selected_mode',
    'selection_drag_mode',
    'model_charge_mode',
    'model_place_mode',
    'model_place_origin_mode',
    'model_place_target_mode',
    'model_create_mode',
    'model_drag_mode',
    'model_target_mode',
    'template_mode',
    'template_locked_mode',
    'template_create_mode',
    'template_drag_mode',
    'template_origin_mode',
    'template_target_mode',
    'los_mode',
    'los_origin_mode',
    'los_target_mode',
    'los_drag_mode',
    'ruler_mode',
    'ruler_drag_mode',
    'ruler_origin_mode',
    'ruler_target_mode',
    function($q,
             $rootScope,
             common_mode,
             default_mode,
             model_selected_mode,
             selection_drag_mode,
             model_charge_mode,
             model_place_mode,
             model_place_origin_mode,
             model_place_target_mode,
             model_create_mode,
             model_drag_mode,
             model_target_mode,
             template_mode,
             template_locked_mode,
             template_create_mode,
             template_drag_mode,
             template_origin_mode,
             template_target_mode,
             los_mode,
             los_origin_mode,
             los_target_mode,
             los_drag_mode,
             ruler_mode,
             ruler_drag_mode,
             ruler_origin_mode,
             ruler_target_mode) {
      var modes = {};
      var common = common_mode(modes);
      ////////////////////////////////////////////////
      modes['default'] = default_mode(modes, common);
      modes['model_selected'] = model_selected_mode(modes, common);
      ////////////////////////////////////////////////
      modes['selection_drag'] = selection_drag_mode(modes, common);
      modes['model_charge'] = model_charge_mode(modes, common);
      modes['model_place'] = model_place_mode(modes, common);
      modes['model_place_origin'] = model_place_origin_mode(modes, common);
      modes['model_place_target'] = model_place_target_mode(modes, common);
      modes['model_create'] = model_create_mode(modes, common);
      modes['model_drag'] = model_drag_mode(modes, common);
      modes['model_target'] = model_target_mode(modes, common);
      ////////////////////////////////////////////////
      modes['template_locked'] = template_locked_mode(modes, common);
      modes['template'] = template_mode(modes, common);
      ////////////////////////////////////////////////
      modes['template_create'] = template_create_mode(modes, common);
      modes['template_drag'] = template_drag_mode(modes, common);
      modes['template_origin'] = template_origin_mode(modes, common);
      modes['template_target'] = template_target_mode(modes, common);
      modes['los'] = los_mode(modes, common);
      modes['los_origin'] = los_origin_mode(modes, common);
      modes['los_target'] = los_target_mode(modes, common);
      modes['los_drag'] = los_drag_mode(modes, common);
      modes['ruler'] = ruler_mode(modes, common);
      modes['ruler_drag'] = ruler_drag_mode(modes, common);
      modes['ruler_origin'] = ruler_origin_mode(modes, common);
      modes['ruler_target'] = ruler_target_mode(modes, common);

      modes.current = modes['default'];
      modes.goTo = function(next, scope) {
        if(!_.has(modes, next)) {
          console.log('unknown mode '+next);
          return;
        }
        var previous = modes.current;
        if(modes.current) {
          modes.current.leave(scope, modes[next]);
        }
        modes.current = modes[next];
        modes.current.enter(scope, previous);
        $rootScope.$broadcast('mode change');
      };
      modes.send = function(event) {
        var defer = $q.defer();
        if(_.has(modes.current, event)) {
          console.log(modes.current.name+' <- '+event);
          var accepted = modes.current[event].apply(modes.current,
                                                    Array.prototype.slice.call(arguments, 1));
          if(accepted === false) {
            defer.reject();
          }
          else {
            defer.resolve();
          }
        }
        else {
          console.log(modes.current.name+' xx '+event);
          defer.reject();
        }
        return defer.promise;
      };
      console.log(modes);
      return modes;
    }
  ]);
