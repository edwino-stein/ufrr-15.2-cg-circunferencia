App.define('Controller.Main', {

    grid: 'View.Grid',
    panel: 'View.Panel',
    canvas: 'View.Canvas',
    algorithms: 'Controller.Algorithms',
    $time: '#time',

    algorithm: null,
    gridColor: {red: 0, green: 0, blue: 0},

    render: function(center, radius){

        if(this.algorithm === null) return;

        this.grid.clearFrame(false);
        var time = 0;

        switch (this.algorithm) {
            case 'incremental':
                time = this.algorithms.incremental(center, radius, this.gridColor);
            break;

            case 'bresenham':
                time = this.algorithms.bresenham(center, radius, this.gridColor);
            break;

            case 'parametric':
            default:
                time = this.algorithms.parametric(center, radius, this.gridColor);
        }

        this.grid.update();
        this.$time.find('span').html((time).toFixed(5));
    },

    updateLine: function(center, radius){
        this.canvas.setCenter(center);
        this.canvas.setRadius(radius);
        this.canvas.setColor(this.gridColor);

        this.render(center, radius);
    },

    setColor: function(color){
        this.gridColor = color;
        this.canvas.setColor(color);
    },

    ready: function(){

        var me = this;

        this.panel.addListener('center-change radius-change', function(e, center, radius){
            me.updateLine(center, radius);
        });

        this.panel.addListener('resolution-change', function(e, resolution){
            me.grid.setResolution(resolution);
            me.updateLine(me.canvas.getCenter(), me.canvas.getRadius());
        });

        this.panel.addListener('color-change', function(e, color){
            me.setColor(color);
            me.updateLine(me.canvas.getCenter(), me.canvas.getRadius());
        });

        this.panel.addListener('algorithm-change', function(e, algorithm){
            me.algorithm = algorithm;
            me.updateLine(me.canvas.getCenter(), me.canvas.getRadius());
        });

        me.panel.setCenter(400, 300);
        me.panel.setRadius(200);
        me.panel.setResolution(7);
        me.panel.setAlgorithm('parametric');
    },

    init: function(){
        var me = this;
        me.grid = me._appRoot_.get(me.grid);
        me.algorithms = me._appRoot_.get(me.algorithms);
        me.canvas = me._appRoot_.get(me.canvas);
        me.panel = me._appRoot_.get(me.panel);
        me.$time = $(me.$time);
    }

});
