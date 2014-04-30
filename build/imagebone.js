(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright (c) 2014 Korvin Szanto

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

(function Imagebone_IIFE(global) {
  'use strict';

  global.Imagebone = require('./lib/main.js');

}(window));


},{"./lib/main.js":6}],2:[function(require,module,exports){
module.exports = (function Canvas() {
  return require('./Class.js').extend({

    /**
     * Initialize
     * @param  {Image} image The Image element
     * @return {Canvas}      this
     */
    init: function(image, width, height) {
      var my_image = new Image(), me = this;
      this.set('image', my_image)
          .set('given_image', image)
          .set('offset', {x:0,y:0})
          .set('padding', 5)
          .set('passed_width', width)
          .set('passed_height', height)
          .set('dragger_dragging', false)
          .set('image_dragging', false)
          .set('dragger_hovered', false)
          .set('image_hovered', false)
          .set('drag_start', {x:0,y:0});

      my_image.onload = function imageLoad() {
        me.initializeCanvas();
      };
      my_image.src = image.src;

      return this;
    },

    initializeCanvas: function() {
      var Context = require('./Context.js'), me = this;
      this.set('canvas', document.createElement('canvas'))
          .set('context', new Context(this.get('canvas').getContext('2d')))
          .set('width', this.getGivenImage().width || this.getImage().width)
          .set('height', this.getGivenImage().height || this.getImage().height)
          .set('initial_width', this.getWidth())
          .set('initial_height', this.getHeight())
          .set('canvas_width', this.getWidth())
          .set('canvas_height', this.getHeight())
          .set('ratio', window.devicePixelRatio || 1);


      var canvas_width = this.getCanvasWidth(),
          canvas_height = this.getCanvasHeight(),
          changed = false;
      if (this.getPassedWidth()) {
        canvas_width = this.getPassedWidth();
        changed = true;
      }
      if (this.getPassedHeight()) {
        canvas_height = this.getPassedHeight();
        changed = true;
      }

      if (changed) {
        this.resizeCanvas(canvas_width, canvas_height);
      }

      window.document.addEventListener('mousemove', function() {
        me.handleMouseMove.apply(me, arguments);
      });

      window.document.addEventListener('mouseup', function() {
        me.handleMouseUp.apply(me, arguments);
      });

      this.getCanvas().addEventListener('mousedown', function() {
        me.handleMouseDown.apply(me, arguments);
      });

      this.getGivenImage().parentNode.replaceChild(this.getCanvas(), this.getGivenImage());
      return this.renderSize().draw();
    },

    renderSize: function() {
      var width = this.getCanvasWidth() + this.getPadding() * 5,
          height = this.getCanvasHeight() + this.getPadding() * 5;

      this.getCanvas().width = width * this.getRatio();
      this.getCanvas().height = height * this.getRatio();
      this.getCanvas().style.width = width + 'px';
      this.getCanvas().style.height = height + 'px';
      return this;
    },

    clearCanvas: function() {
      var canvas = this.getCanvas(),
          context = this.getContext();

      canvas.width = canvas.width;

      context.setFillColor('white').fillRect(
        0, 0,
        this.getCanvasWidth(),
        this.getCanvasHeight());

      return this;
    },

    draw: function() {
      return this.clearCanvas().drawBackground().drawImage().drawForeground();
    },

    redraw: function() {
      return this.renderSize().draw();
    },

    /**
     * Draw the sweet transparent background thing.
     * @param  {Object} start { x: 0, y: 0 }
     * @param  {Object} size  { width: 100, height: 100, block: 10 }
     * @return {Canvas}       this
     */
    drawBackground: function() {
      var block_size = 10,
          width = Math.ceil(this.getCanvasWidth() / block_size),
          height = Math.ceil(this.getCanvasHeight() / block_size),
          x,
          y,
          context = this.getContext(),
          colored,
          block_width,
          block_height;

      context.setFillColor('#eee');
      for (x = width; x--;) {
        for (y = height; y--;) {
          colored = (y % 2 ? (x % 2) === 0 : (x % 2) !== 0);
          if (colored) {

            block_width = block_size;
            block_height = block_size;

            context.fillRect(
              x * block_size,
              y * block_size,
              block_width,
              block_height);
          }
        }
      }
      return this;
    },

    drawImage: function() {
      var ctx = this.getContext();
      ctx.drawImage(
        this.getImage(),
        this.getOffset().x,
        this.getOffset().y,
        this.getWidth(),
        this.getHeight());
      return this;
    },

    drawForeground: function() {
      var ctx = this.getContext();

      ctx.clearRect(
          this.getCanvasWidth(),
          0,
          this.getPadding() * 6,
          this.getCanvasHeight() + this.getPadding() * 6)
        .clearRect(
          0,
          this.getCanvasHeight(),
          this.getCanvasWidth() + this.getPadding() * 6,
          this.getPadding() * 6);

      return this.drawBottomSize().drawRightSize().drawDragHandle();
    },

    drawBottomSize: function() {
      var ctx = this.getContext().getContext(),
          width_text = this.getCanvasWidth(),
          text_width;


      ctx.font = 12 * this.getRatio() + 'px "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", ' +
                                        'Helvetica, Arial, "Lucida Grande", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      text_width = ctx.measureText(width_text).width / this.getRatio();
      this.getContext()
        .setLineWidth(1)
        .setStrokeColor('#333')
        .setFillColor('rgb(100,0,100)')
        .moveTo(1, this.getCanvasHeight() + this.getPadding())
        .addLine(0, this.getPadding() * 2)
        .addMove(0, -this.getPadding())
        .addLine(((-2 + this.getCanvasWidth() - text_width - this.getPadding()) / 2), 0)
        .addMove(text_width + this.getPadding(), 0)
        .lineTo(this.getCanvasWidth(), this.getCanvasHeight() + this.getPadding() * 2)
        .addMove(0, -this.getPadding())
        .addLine(0, this.getPadding() * 2)
        .stroke()

        .fillRect(width_text,
          this.getCanvasWidth() / 2,
          this.getCanvasHeight() + this.getPadding() * 2)
        .fillText(width_text,
          this.getCanvasWidth() / 2,
          this.getCanvasHeight() + this.getPadding() * 2);

      return this;
    },

    drawRightSize: function() {
      var ctx = this.getContext().getContext(),
          height_text = this.getCanvasHeight(),
          text_width;


      ctx.font = 12 * this.getRatio() + 'px "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", ' +
                                        'Helvetica, Arial, "Lucida Grande", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      text_width = ctx.measureText(height_text).width / this.getRatio();
      this.getContext()
        .setLineWidth(1)
        .setStrokeColor('#333')
        .setFillColor('rgb(100,0,100)')
        .moveTo(this.getCanvasWidth() + this.getPadding(), 1)
        .addLine(this.getPadding() * 2, 0)
        .addMove(-this.getPadding(), 0)
        .addLine(0, ((-2 + this.getCanvasHeight() - text_width - this.getPadding()) / 2))
        .addMove(0, text_width + this.getPadding() * 1.5)
        .lineTo(this.getCanvasWidth() + this.getPadding() * 2, this.getCanvasHeight())
        .addMove(-this.getPadding(), 0)
        .addLine(this.getPadding() * 2, 0)
        .stroke()
        .restore();

      ctx.save();
      ctx.translate(0, 0);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';

      this.getContext().fillText(height_text,
        -this.getCanvasHeight() / 2 - this.getPadding() / 2,
        this.getCanvasWidth() + this.getPadding() * 2);

      ctx.restore();

      return this;
    },

    drawDragHandle: function() {
      return this.getContext()
        .save()
        .setFillColor('#333')
        .translate(this.getCanvasWidth() + this.getPadding() * 0.5, this.getCanvasHeight() + this.getPadding() * 0.5)
        .fillRect(this.getPadding() * 1, this.getPadding() * 1, 2, 2)
        .fillRect(this.getPadding() * 1, this.getPadding() * 2, 2, 2)
        .fillRect(this.getPadding() * 2, this.getPadding() * 1, 2, 2)
        .fillRect(this.getPadding() * 2, this.getPadding() * 2, 2, 2);
    },

    resizeCanvas: function(width, height) {
      var old_width = this.getCanvasWidth(),
          old_height = this.getCanvasHeight();

      width = Math.max(width, 1);
      height = Math.max(height, 1);


      this.getOffset().x -= (old_width - width) / 2;
      this.getOffset().y -= (old_height - height) / 2;

      return this.set('canvas_width', width).set('canvas_height', height);
    },

    normalizeEvent: function(e) {
      if (typeof e.pageX === 'undefined') {
          e.pageX = e.clientX + window.document.body.scrollLeft + window.document.documentElement.scrollLeft;
          e.pageY = e.clientY + window.document.body.scrollTop + window.document.documentElement.scrollTop;
      }
      return e;
    },

    handleMouseMove: function(e) {
      this.normalizeEvent(e);

      if (!this.getImageDragging() && !this.getDraggerDragging()) {

        // Test if we're hovering the bottom right dragger
        var butter_zone = {
          x: this.getCanvas().offsetLeft + this.getCanvasWidth() + this.getPadding(),
          y: this.getCanvas().offsetTop + this.getCanvasHeight() + this.getPadding(),
          size: this.getPadding() * 2
        };

        if (e.pageX > butter_zone.x && e.pageX < butter_zone.x + butter_zone.size &&
            e.pageY > butter_zone.y && e.pageY < butter_zone.y + butter_zone.size) {
          this.getCanvas().style.cursor = 'grab';
          if (!this.getCanvas().style.cursor) {
            this.getCanvas().style.cursor = '-webkit-grab';
          }
          this.set('dragger_hovered', true);
        } else {
          this.getCanvas().style.cursor = '';
          this.set('dragger_hovered', false);

          // Test if we're hovering the image
          butter_zone = {
            x: this.getCanvas().offsetLeft + this.getOffset().x,
            y: this.getCanvas().offsetTop + this.getOffset().y,
            width: this.getWidth(),
            height: this.getHeight()
          };
          if (this.getOffset().x + this.getWidth() > this.getCanvasWidth()) {
            butter_zone.width = this.getCanvasWidth() - this.getOffset().x;
          }
          if (this.getOffset().y + this.getHeight() > this.getCanvasHeight()) {
            butter_zone.height = this.getCanvasHeight() - this.getOffset().y;
          }

          if (e.pageX > butter_zone.x && e.pageX < butter_zone.x + butter_zone.width &&
              e.pageY > butter_zone.y && e.pageY < butter_zone.y + butter_zone.height) {
            this.getCanvas().style.cursor = 'grab';
            if (!this.getCanvas().style.cursor) {
              this.getCanvas().style.cursor = '-webkit-grab';
            }
            this.set('image_hovered', true);
          } else {
            this.getCanvas().style.cursor = '';
            this.set('image_hovered', false);
          }
        }
      } else if (this.getImageDragging()) {
        this.setOffset({
          x: this.getOffsetStart().x + e.pageX - this.getDragStart().x,
          y: this.getOffsetStart().y + e.pageY - this.getDragStart().y
        });
        this.draw();
      } else if (this.getDraggerDragging()) {
        this.resizeCanvas(
          this.getSizeStart().width + e.pageX - this.getDragStart().x,
          this.getSizeStart().height + e.pageY - this.getDragStart().y);
        this.renderSize().draw();
      }
    },

    handleMouseDown: function(e) {
      this.normalizeEvent(e);

      if (this.getImageHovered()) {
        this.set('image_dragging', true);
        this.set('drag_start', { x: e.pageX, y: e.pageY });
        this.set('offset_start', { x: this.getOffset().x, y: this.getOffset().y });

        this.getCanvas().style.cursor = '';
        this.getCanvas().style.cursor = 'grabbing';
        if (!this.getCanvas().style.cursor) {
          this.getCanvas().style.cursor = '-webkit-grabbing';
        }
      } else if (this.getDraggerHovered()) {
        this.set('dragger_dragging', true);
        this.set('drag_start', { x: e.pageX, y: e.pageY });
        this.set('size_start', { width: this.getCanvasWidth(), height: this.getCanvasHeight() });

        this.getCanvas().style.cursor = '';
        this.getCanvas().style.cursor = 'grabbing';
        if (!this.getCanvas().style.cursor) {
          this.getCanvas().style.cursor = '-webkit-grabbing';
        }
      }

      return this;
    },

    handleMouseUp: function() {
      this.set('image_dragging', false);
      this.set('dragger_dragging', false);

      this.getCanvas().style.cursor = '';
      this.getCanvas().style.cursor = 'grab';
      if (!this.getCanvas().style.cursor) {
        this.getCanvas().style.cursor = '-webkit-grab';
      }
      return this;
    }

  });
}());

},{"./Class.js":3,"./Context.js":4}],3:[function(require,module,exports){
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

},{"./extend.js":5}],4:[function(require,module,exports){
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

    fillStrokeText: function() {
      var args = Array.prototype.slice.call(arguments);
      return this.strokeText.apply(this, args).fillText.apply(this, args);
    },

    fillRect: function(x, y, width, height) {
      var args = Array.prototype.slice.call(arguments);

      x = this.scale(args.shift());
      y = this.scale(args.shift());
      width = this.scale(args.shift());
      height = this.scale(args.shift());

      return this.applyToContext('fillRect', [x, y, width, height]);
    },

    strokeRect: function(x, y, width, height) {
      var args = Array.prototype.slice.call(arguments);

      x = this.scale(args.shift());
      y = this.scale(args.shift());
      width = this.scale(args.shift());
      height = this.scale(args.shift());

      return this.applyToContext('strokeRect', [x, y, width, height]);
    },

    fillStrokeRect: function() {
      var args = Array.prototype.slice.call(arguments);
      return this.strokeRect.apply(this, args).fillRect.apply(this, args);
    },

    clearRect: function(x, y, width, height) {
      var args = Array.prototype.slice.call(arguments);

      x = this.scale(args.shift());
      y = this.scale(args.shift());
      width = this.scale(args.shift());
      height = this.scale(args.shift());

      return this.applyToContext('clearRect', [x, y, width, height]);
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

},{"./Class.js":3}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./Canvas.js":2}]},{},[1])