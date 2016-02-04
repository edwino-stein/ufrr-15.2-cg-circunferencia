App.define('View.Panel', {

    $domObj: '#panel',

    $centerX: '#x',
    $centerY: '#y',

    $radius: '#radius',
    $resolutionSelect: '#resolution',
    $algorithmSelect: '#algorithm',
    $colorPicker: '#color',


    newPoint: function(x, y){
        return new this.util.Point(x, y);
    },

    colorHexToDec: function(hex){

        if(hex[0] === '#') hex = hex.slice(1, hex.length);

        if(hex.length === 3)
            return new this.util.Color(
                parseInt(hex[0]+hex[0], 16),
                parseInt(hex[1]+hex[1], 16),
                parseInt(hex[2]+hex[2], 16)
            );

        else if(hex.length === 6)
            return new this.util.Color(
                parseInt(hex.slice(0, 2), 16),
                parseInt(hex.slice(2, 4), 16),
                parseInt(hex.slice(4, 6), 16)
            );

        else
            return new this.util.Color(0, 0, 0);

    },

    addListener: function(eventName, handle){
        this.$domObj.on(eventName, handle);
    },

    getCenter: function(){
        var x = parseInt(this.$centerX.val()),
            y = parseInt(this.$centerY.val());

        return this.newPoint(
            !isNaN(x) ? x : 0,
            !isNaN(y) ? y : 0
        )
    },

    setCenter: function(x, y){
        this.$centerX.val(x);
        this.onCenterInputChange(this.$centerX[0], x);
        this.$centerY.val(y);
        this.onCenterInputChange(this.$centerY[0], y);
    },

    getRadius: function(){
        var radius = parseInt(this.$radius.val());
        return !isNaN(radius) ? radius : 0;
    },

    setRadius: function(radius){
        this.$radius.val(radius);
        this.onRadiusInputChange(this.$radius[0], radius);
    },

    setResolution: function(resolution){

        if(isNaN(resolution) || resolution > 10)
            resolution = 10;
        else if(resolution < 3)
            resolution = 3;

        this.$resolutionSelect.val(resolution);
        this.onSelectResolutionChange(resolution);
    },

    setAlgorithm: function(algorithm){
        this.$algorithmSelect.val(algorithm);
        this.onAlgorithmSelect(algorithm);
    },

    onCenterInputChange: function(element, value){

        if(element.min >= value || isNaN(value))
            $(element).val(element.min).select();

        else if(value > element.max)
            $(element).val(element.max);

        this._appRoot_.Base.fireEvent('center-change', this.$domObj, [this.getCenter(), this.getRadius()]);
    },

    onRadiusInputChange: function(element, value){

        var center = this.getCenter();

        //Define limite do raio para não ultrapassar as bordas do viewport
        if(center.x + value >= 800) value = 800 - center.x;
        if(center.x - value <= 0) value = center.x;
        if(center.y + value >= 600) value = 600 - center.y;
        if(center.y - value <= 0) value = center.y;
        $(element).val(value);

        this.$centerX.attr('max', 800 - value).attr('min', value);
        this.$centerY.attr('max', 600 - value).attr('min', value);

        this._appRoot_.Base.fireEvent('radius-change', this.$domObj, [this.getCenter(), this.getRadius()]);
    },

    onSelectResolutionChange: function(value){

        if(isNaN(value) || value > 10){
            value = 10;
            this.$resolutionSelect.val(10);
        }
        else if(value < 3){
            value = 3;
            this.$resolutionSelect.val(3);
        }

        this._appRoot_.Base.fireEvent('resolution-change', this.$domObj, [value]);
    },

    onColorSelect: function(value){
        this._appRoot_.Base.fireEvent('color-change', this.$domObj, [this.colorHexToDec(value)]);
    },

    onAlgorithmSelect: function(value){
        this._appRoot_.Base.fireEvent('algorithm-change', this.$domObj, [value]);
    },

    ready: function(){
        var me = this;
        me.$centerX.bind('input', function(){me.onCenterInputChange(this, parseInt($(this).val()))});
        me.$centerY.bind('input', function(){me.onCenterInputChange(this, parseInt($(this).val()))});
        me.$radius.bind('input', function(){me.onRadiusInputChange(this, parseInt($(this).val()))});

        me.$resolutionSelect.change(function(){me.onSelectResolutionChange(parseInt(this.value))});
        me.$algorithmSelect.change(function(){me.onAlgorithmSelect(this.value)});
        me.$colorPicker.on('input', function(e){me.onColorSelect($(this).val())}).val('#000000');
    },

    init: function(){
        this.$domObj = $(this.$domObj);

        this.$centerX = $(this.$centerX);
        this.$centerY = $(this.$centerY);
        this.$radius = $(this.$radius);

        this.$resolutionSelect = $(this.$resolutionSelect);
        this.$algorithmSelect = $(this.$algorithmSelect);
        this.$colorPicker = $(this.$colorPicker);

        this.util = this._appRoot_.get('Util');
    }
});
