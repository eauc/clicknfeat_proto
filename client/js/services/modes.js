'use strict';

angular.module('vassalApp.services')
  .factory('modes', [
    'default_mode',
    'selection_drag_mode',
    'model_create_mode',
    'model_drag_mode',
    'model_target_mode',
    'template_mode',
    'template_create_mode',
    'template_drag_mode',
    'template_origin_mode',
    'template_target_mode',
    'los_mode',
    'los_drag_mode',
    'ruler_mode',
    'ruler_drag_mode',
    'ruler_origin_mode',
    'ruler_target_mode',
    function(default_mode,
             selection_drag_mode,
             model_create_mode,
             model_drag_mode,
             model_target_mode,
             template_mode,
             template_create_mode,
             template_drag_mode,
             template_origin_mode,
             template_target_mode,
             los_mode,
             los_drag_mode,
             ruler_mode,
             ruler_drag_mode,
             ruler_origin_mode,
             ruler_target_mode) {
      var modes = {};
      modes['default'] = default_mode(modes);
      modes['selection_drag'] = selection_drag_mode(modes);
      modes['model_create'] = model_create_mode(modes);
      modes['model_drag'] = model_drag_mode(modes);
      modes['model_target'] = model_target_mode(modes);
      modes['template'] = template_mode(modes);
      modes['template_create'] = template_create_mode(modes);
      modes['template_drag'] = template_drag_mode(modes);
      modes['template_origin'] = template_origin_mode(modes);
      modes['template_target'] = template_target_mode(modes);
      modes['los'] = los_mode(modes);
      modes['los_drag'] = los_drag_mode(modes);
      modes['ruler'] = ruler_mode(modes);
      modes['ruler_drag'] = ruler_drag_mode(modes);
      modes['ruler_origin'] = ruler_origin_mode(modes);
      modes['ruler_target'] = ruler_target_mode(modes);
      return modes;
    }
  ]);
