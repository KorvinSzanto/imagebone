module.exports = function Imagebone(img, width, height) {
  if (img instanceof Array || img instanceof window.HTMLCollection) {
    var imagebones = [];
    Array.prototype.map.call(img, function(img) {
      imagebones.push(new Imagebone(img, width, height));
    });

    return imagebones;
  }
  if (this === undefined || !(this instanceof Imagebone)) {
    return new Imagebone(img, width, height);
  }

  if (this.init) {
    this.init.apply(this, arguments);
  }

  var Canvas = require('./Canvas.js');
  this.canvas = new Canvas(img, width, height);
};
