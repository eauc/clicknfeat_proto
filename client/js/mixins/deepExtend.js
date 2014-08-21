_.mixin({
  deepExtend: function deepExtend(dst, src) {
    _.each(src, function(value, key) {
      if( _.isObject(value) &&
          !_.isArray(value) &&
          !_.isFunction(value) &&
          _.isObject(dst[key]) &&
          !_.isArray(dst[key]) &&
          !_.isFunction(dst[key]) ) {
        deepExtend(dst[key], value);
      }
      else {
        dst[key] = value;
      }
    });
    return dst;
  }
});
