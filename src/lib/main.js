module.exports = function Imagebone(img, width, height) {
  if (this === window || !(this instanceof Imagebone)) {
    return new Imagebone(img, width, height);
  }

  if (this.init) {
    this.init.apply(this, arguments);
  }

  var Canvas = require('./Canvas.js');
  this.canvas = new Canvas(img, width, height);
};

module.exports.prototype.resize = function(x, y) {
  if (x === Object(x)) {
    x = x.x;
    y = x.y;
  }
  this.canvas.resizeCanvas(x, y).redraw();
  return this;
};
