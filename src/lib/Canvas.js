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
      return this.renderSize().render();
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

    render: function() {
      return this.clearCanvas().drawBackground().drawImage().drawForeground();
    },

    redraw: function() {
      return this.renderSize().render();
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

      ctx.setFillColor('white')
        .fillRect(
          this.getCanvasWidth(),
          0,
          this.getPadding() * 6,
          this.getCanvasHeight() + this.getPadding() * 6)
        .fillRect(
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
        this.render();
      } else if (this.getDraggerDragging()) {
        this.resizeCanvas(
          this.getSizeStart().width + e.pageX - this.getDragStart().x,
          this.getSizeStart().height + e.pageY - this.getDragStart().y);
        this.renderSize().render();
      }
    },

    handleMouseDown: function(e) {
      this.normalizeEvent(e);

      debugger;
      if (this.getImageHovered()) {
        this.set('image_dragging', true);
        this.set('drag_start', { x: e.pageX, y: e.pageY });
        this.set('offset_start', { x: this.getOffset().x, y: this.getOffset().y });
      } else if (this.getDraggerHovered()) {
        this.set('dragger_dragging', true);
        this.set('drag_start', { x: e.pageX, y: e.pageY });
        this.set('size_start', { width: this.getCanvasWidth(), height: this.getCanvasHeight() });
      }

      return this;
    },

    handleMouseUp: function(e) {
      this.set('image_dragging', false);
      this.set('dragger_dragging', false);
      return this;
    }

  });
}());
