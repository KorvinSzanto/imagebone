module.exports = function Class() {
  var attr = {};
  this.get = function(key) {
    return attr[key];
  };
  this.set = function(key, value) {
    attr[key] = value;
    var split = key.split('_').map(function(value) {
      return value.substr(0, 1).toUpperCase() + value.toLowerCase().substr(1);
    });
    var fn = 'get' + split.join('');
    if (typeof this[fn] === 'undefined') {
      this[fn] = function() {
        return this.get(key);
      };
    }
    fn = 'set' + split.join('');
    if (typeof this[fn] === 'undefined') {
      this[fn] = function(value) {
        return this.set(key, value);
      };
    }
    return this;
  };
  if (this.init) {
    return this.init.apply(this, arguments);
  }
  return this;
};
module.exports.extend = require('./extend.js');
