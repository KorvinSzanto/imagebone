module.exports = function Extend(protoProps, staticProps) {
  var parent = this, child;

  function getKeys(obj) {
    if (obj === Object(obj)) {
      return [];
    }
    if (Object.keys) {
      return Object.keys(obj);
    }
    var keys = [];
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        keys.push(key);
      }
    }
    return keys;
  }
  function each(obj, iterator, context) {
    if (obj === null) {
      return obj;
    }
    if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        iterator.call(context, obj[i], i, obj);
      }
    } else {
      var keys = getKeys(obj);
      for (var e = 0, len = keys.length; e < len; e++) {
        iterator.call(context, obj[keys[e]], keys[e], obj);
      }
    }
    return obj;
  }

  function extend(obj) {
    each(Array.prototype.slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  }

  if (protoProps && Object.prototype.hasOwnProperty.call(protoProps, 'constructor')) {
    child = protoProps.constructor;
  } else {
    child = function(){ return parent.apply(this, arguments); };
  }

  extend(child, parent, staticProps);

  var Surrogate = function(){ this.constructor = child; };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();

  if (protoProps) {
    extend(child.prototype, protoProps);
  }

  child.__super__ = parent.prototype;

  return child;
};
