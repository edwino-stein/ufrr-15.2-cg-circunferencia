App.define('Controller.Algorithms', {

    grid: 'View.Grid',
    canvas: 'View.Canvas',

    parametric: function(center, radius, color){

        var now = this.getTimeStamp();
            x = center.x + radius,
            y = center.y,
            angle = 0;

        for(var t = 1; t <= 360; t++){
            this.grid.activePixel( this.canvasToGrid(x, y), color, false);
            
            angle = (Math.PI * t)/180;
            x = center.x + (radius * Math.cos(angle));
            y = center.y + (radius * Math.sin(angle));
        }

        return this.getTimeStamp() - now;
    },

    newPoint: function(x, y){
        return new this.util.Point(x, y);
    },

    getTimeStamp: function(){
      return performance.now()
    },

    /**
        Converte um ponto do canvas(mm) em um pixel da grid
    */
    canvasToGrid: function(x, y){
        return this.newPoint(
            Math.floor((this.grid.fakeWidth * x)/this.canvas.getViewBoxWidth()),
            Math.floor((this.grid.fakeHeight * y)/this.canvas.getViewBoxHeight())
        );
    },

    /**
        Pega o tamanho de um pixel da grid
    */
    getPixelSize: function(){
        return this.grid.pixelSize;
    },

    init: function(){
        var me = this;
        me.grid = me._appRoot_.get(me.grid);
        me.canvas = me._appRoot_.get(me.canvas);
        this.util = this._appRoot_.get('Util');
    }
});
