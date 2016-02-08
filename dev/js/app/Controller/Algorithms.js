App.define('Controller.Algorithms', {

    grid: 'View.Grid',
    canvas: 'View.Canvas',

    parametric: function(center, radius, color){

        var now = this.getTimeStamp();
            x = center.x + radius,
            y = center.y,
            angle = 0;

        for(var t = 1; t <= 360; t++){
            this.grid.activePixel(this.canvasToGrid(x, y), color, false);

            angle = (Math.PI * t)/180;
            x = center.x + (radius * Math.cos(angle));
            y = center.y + (radius * Math.sin(angle));
        }

        return this.getTimeStamp() - now;
    },

    incremental: function(center, radius, color){

        if(radius <= 0) return 0;

        var now = this.getTimeStamp();
            x = radius,
            y = 0,
            theta = 1/radius;

        for(var alpha = 0; alpha < 6.3; alpha += theta){

            x = (radius * Math.cos(alpha) * Math.cos(theta)) - (radius * Math.sin(alpha) * Math.sin(theta));
            y = (radius * Math.cos(alpha) * Math.sin(theta)) + (radius * Math.sin(alpha) * Math.cos(theta));

            this.grid.activePixel(this.canvasToGrid(center.x + x, center.y + y), color, false);
        }

        return this.getTimeStamp() - now;
    },

    bresenham: function(center, radius, color){

        var now = this.getTimeStamp();
            idealPoint = this.newPoint(0, radius),
            pixelPoint = this.canvasToGrid(0, radius),
            p = 5/4 - radius;

        center = this.canvasToGrid(center.x, center.y);

        while(pixelPoint.x <= pixelPoint.y){

            //1º octante
            this.grid.activePixel(this.newPoint(center.x + pixelPoint.y, center.y + pixelPoint.x), color, false);

            //2º octante
            this.grid.activePixel(this.newPoint(center.x + pixelPoint.x, center.y + pixelPoint.y), color, false);

            //3º octante
            this.grid.activePixel(this.newPoint(center.x - pixelPoint.x, center.y + pixelPoint.y), color, false);

            //4º octante
            this.grid.activePixel(this.newPoint(center.x - pixelPoint.y, center.y + pixelPoint.x), color, false);

            //5º octante
            this.grid.activePixel(this.newPoint(center.x - pixelPoint.y, center.y - pixelPoint.x), color, false);

            //6º octante
            this.grid.activePixel(this.newPoint(center.x - pixelPoint.x, center.y - pixelPoint.y), color, false);

            //7º octante
            this.grid.activePixel(this.newPoint(center.x + pixelPoint.x, center.y - pixelPoint.y), color, false);

            //8º octante
            this.grid.activePixel(this.newPoint(center.x + pixelPoint.y, center.y - pixelPoint.x), color, false);

            if(p >= 0){

                pixelPoint.y--;

                //Encontra o ponto da circunferencia a partir do pixel atual
                idealPoint = this.gridToCanvas(pixelPoint.x + 1 , pixelPoint.y - 1);

                //Calcula o proximo P
                p += (2 * idealPoint.x) - (2 * idealPoint.y) + 5;

                pixelPoint.x++;
            }
            else{
                //Encontra o ponto da circunferencia a partir do pixel atual
                idealPoint = this.gridToCanvas(pixelPoint.x + 1, pixelPoint.y - 1);

                //Calcula o proximo P
                p += (2 * idealPoint.x) + 3;

                pixelPoint.x++;
            }
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
        Converte um pixel da grid em um ponto do canvas(mm)
    */
    gridToCanvas: function(x, y){
        return this.newPoint(
            (this.canvas.getViewBoxWidth() * x)/this.grid.fakeWidth,
            (this.canvas.getViewBoxHeight() * y)/this.grid.fakeHeight
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
