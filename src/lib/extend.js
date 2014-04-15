module.exports = function Extend(protoProps, staticProps) {
  var _ = require('underscore');
  var parent = this;
  var child;

  if (protoProps && _.has(protoProps, 'constructor')) {
    child = protoProps.constructor;
  } else {
    child = function(){ return parent.apply(this, arguments); };
  }

  _.extend(child, parent, staticProps);

  var Surrogate = function(){ this.constructor = child; };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();

  if (protoProps) {
    _.extend(child.prototype, protoProps);
  }

  child.__super__ = parent.prototype;

  return child;
};
