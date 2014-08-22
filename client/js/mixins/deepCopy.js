_.mixin({
  deepCopy: function deepCopy(src) {
    function copyValue(value) {
      if(_.isObject(value) &&
         !_.isFunction(value)) {
        return deepCopy(value);
      }
      else {
        return value;
      }
    }
    var ret;
    if(_.isArray(src)) {
      ret = _.map(src, copyValue);
    }
    else {
      ret = {};
      _.each(src, function(value, key) {
        ret[key] = copyValue(value);
      });
    }
    return ret;
  }
});
