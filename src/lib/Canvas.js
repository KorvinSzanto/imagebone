module.exports = (function Canvas() {
  return require('./Class.js').extend({

    /**
     * Initialize
     * @param  {Image} image The Image element
     * @return {Canvas}      this
     */
    init: function(image) {
      var my_image = new Image(), me = this;
      my_image.src = image.src;
      this.set('canvas', document.createElement('canvas'))
          .set('context', this.get('canvas').getContext('2d'))
          .set('image', my_image)
          .set('offset', {x:0,y:0});


      if (image.height && image.width) {
        this.render(image);
      } else {
        image.addEventListener('load', function() {
          me.render(image);
        });
      }

      return this;
    },

    /**
     * Render the canvas in place of the original image
     * @param  {Image} image The Image element
     * @return {Canvas} this
     */
    render: function(image) {
      var me = this,
          canvas = this.get('canvas'),
          ratio = (window.devicePixelRatio || 1),
          width = image.width,
          height = image.height;

      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      this.set('ratio', ratio)
          .set('size', {width: width, height: height})
          .set('canvas_size', {width: width, height: height})
          .set('original_size', this.getSize());

      me.draw();
      image.parentNode.replaceChild(canvas, image);
    },

    clear: function() {
      var canvas = this.getCanvas();
      canvas.width = canvas.width;
      return this;
    },

    /**
     * Draw the canvas
     * @return {Canvas} this
     */
    draw: function() {
      return this.drawBackground().drawImage();
    },

    drawImage: function() {
      this.getContext().drawImage(this.getImage(),
                                  this.getOffset().x,
                                  this.getOffset().y,
                                  this.getSize().width * this.getRatio(),
                                  this.getSize().height * this.getRatio());
      return this;
    },

    drawBackground: function() {
      var block_size = 10 * this.getRatio(),
          width = Math.ceil(this.getCanvasSize().width * this.getRatio() / block_size),
          height = Math.ceil(this.getCanvasSize().height * this.getRatio() / block_size),
          x,
          y,
          context = this.getContext(),
          colored;

      context.fillStyle = '#eee';
      for (x = width; x--;) {
        for (y = height; y--;) {
          colored = (y % 2 ? (x % 2) === 0 : (x % 2) !== 0);
          if (colored) {
            context.fillRect(x * block_size, y * block_size, block_size, block_size);
          }
        }
      }
      return this;
    },

    resizeCanvas: function(width, height) {
      var canvas = this.getCanvas(),
          ratio = this.getRatio(),
          old_size = this.getCanvasSize(),
          offset = this.getOffset();

      offset.x += (width - old_size.width);
      offset.y += (height - old_size.height);

      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      this.set('canvas_size', {width: width, height: height}).draw();
    }
  });
}());
