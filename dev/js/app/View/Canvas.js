App.define('View.Canvas', {

    $domObj: '#canvas',
    visiable: true,

    shape: null,

    newPoint: function(x, y){
        return new this.util.Point(x, y);
    },

    updateViewbox: function(width, height){
        this.$domObj[0].setAttribute('viewBox', '0 0 '+width+' '+height);
    },

    setCenter: function(point){
        this.shape.setAttribute('cx', point.x);
        this.shape.setAttribute('cy', point.y);
    },

    getCenter: function(){

        var x = parseInt(this.shape.getAttribute('cx')),
            y = parseInt(this.shape.getAttribute('cy'));

        return this.newPoint(
            !isNaN(x) ? x : 0,
            !isNaN(y) ? y : 0
        );
    },

    setRadius: function(radius){
        this.shape.setAttribute('r', radius);
    },

    getRadius: function(){
        var radius = parseInt(this.shape.getAttribute('r'));
        return !isNaN(radius) ? radius : 0;
    },

    setColor: function(c){
        var color = '';
        color += ((0xff ^ c.red) < 16 ? '0' : '') + (0xff ^ c.red).toString(16);
        color += ((0xff ^ c.green) < 16 ? '0' : '') + (0xff ^ c.green).toString(16);
        color += ((0xff ^ c.blue) < 16 ? '0' : '') + (0xff ^ c.blue).toString(16);
        this.shape.setAttribute('stroke', '#'+color);
    },

    getViewBoxWidth: function(){
        return this.$domObj[0].viewBox.baseVal.width
    },

    getViewBoxHeight: function(){
        return this.$domObj[0].viewBox.baseVal.height
    },

    ready: function(){
        var me = this;
        me.updateViewbox(800, 600);
    },

    init: function(){

        var me = this;
        me.$domObj = $(me.$domObj);
        me.util = me._appRoot_.get('Util');
        me.shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        me.$domObj[0].appendChild(me.shape);

        me.shape.setAttribute('cx', 400);
        me.shape.setAttribute('cy', 300);
        me.shape.setAttribute('r', 200);
        me.shape.setAttribute('fill', 'transparent');
        me.shape.setAttribute('stroke', '#f00');
        me.shape.setAttribute('stroke-width', '1.5');
    }
});
