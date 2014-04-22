module.exports = (function Context() {
  return require('./Class.js').extend({

    init: function(context) {
      this.set('context', context).set('ratio', window.devicePixelRatio || 1);
      return this.save();
    },

    applyToContext: function(method, args) {
      var context = this.getContext();
      context[method].apply(context, args);
      return this;
    },

    save: function() {
      return this.applyToContext('save');
    },

    restore: function() {
      this.applyToContext('restore');
      return this.applyToContext('restore');
    },

    scale: function(x) {
      return x * this.getRatio();
    },

    adjust: function (x) {
      x = this.scale(x);
      if (this.getRatio() === 1) {
        x -= 0.5;
      }
      return x;
    },

    scaledArguments: function (args) {
      args = Array.prototype.slice.call(args);
      return args.map(function(x) {
        return this.adjust(x);
      }, this);
    },

    setStrokeColor: function(color) {
      this.getContext().strokeStyle = color;
      return this;
    },

    setFillColor: function (color) {
      this.getContext().fillStyle = color;
      return this;
    },

    setLineWidth: function (line_width) {
      this.getContext().lineWidth = this.scale(line_width);
      return this;
    },

    moveTo: function(x, y) {
      this.set('x', x).set('y', y);
      return this.applyToContext('moveTo', this.scaledArguments(arguments));
    },

    lineTo: function(x, y) {
      this.set('x', x).set('y', y);
      return this.applyToContext('lineTo', this.scaledArguments(arguments));
    },

    addLine: function(x, y) {
      x = this.getX() + x;
      y = this.getY() + y;

      return this.lineTo(x, y);
    },

    addMove: function(x, y) {
      x = this.getX() + x;
      y = this.getY() + y;

      return this.moveTo(x, y);
    },

    translate: function() {
      return this.applyToContext('translate', this.scaledArguments(arguments));
    },

    fillText: function() {
      var args = Array.prototype.slice.call(arguments),
          text = args.shift();

      args = this.scaledArguments(args);

      return this.applyToContext('fillText', [text].concat(args));
    },

    strokeText: function() {
      var args = Array.prototype.slice.call(arguments),
          text = args.shift();

      args = this.scaledArguments(args);

      return this.applyToContext('strokeText', [text].concat(args));
    },

    fillRect: function(x, y, width, height) {
      var args = Array.prototype.slice.call(arguments);

      x = this.scale(args.shift());
      y = this.scale(args.shift());
      width = this.scale(args.shift());
      height = this.scale(args.shift());

      return this.applyToContext('fillRect', [x, y, width, height]);
    },

    drawImage: function() {
      var args = Array.prototype.slice.call(arguments),
          image = args.shift();

      var x = this.adjust(args.shift()),
          y = this.adjust(args.shift()),
          width = this.scale(args.shift()),
          height = this.scale(args.shift());

      return this.applyToContext('drawImage', [image, x, y, width, height]);
    },

    stroke: function() {
      return this.applyToContext('stroke', []);
    }

  });
}());
