App.define('View.Grid', {
    domObj: '#grid',

    fakeWidth: 200,
    fakeHeight: 150,
    realWidth: 800,
    realHeight: 600,

    pixelSize: 3,

    context: null,
    imageData: null,
    map: null,

    setResolution: function(pixelSize){

        switch (pixelSize) {

            case 9:
                this.pixelSize = 9;
                this.fakeWidth = 80;
                this.fakeHeight = 60;
            break;

            case 7:
                this.pixelSize = 7;
                this.fakeWidth = 100;
                this.fakeHeight = 75;
            break;

            case 4:
                this.pixelSize = 4;
                this.fakeWidth = 160;
                this.fakeHeight = 120;
            break;

            case 3:
            default:
                this.pixelSize = 3;
                this.fakeWidth = 200;
                this.fakeHeight = 150;
            break;
        }

        this.mapGrid();
    },

    mapGrid: function(){

        this.map = [];
        var row, pixel;
        for(var y = 0; y < this.realHeight; y += this.pixelSize + 1){

            row = [];
            for(var x = 0; x < this.realWidth; x += this.pixelSize + 1){

                pixel = [];
                for(var i = y; i < y + this.pixelSize; i++)
                    for(var j = x; j < x + this.pixelSize; j++)
                        pixel.push((i * this.realWidth + j) * 4);

                row.push(pixel);
            }

            this.map.push(row);
        }

        this.clearFrame(true);
    },

    activePixel: function(point, color, autoUpdate){

        if(point.x < 0 || point.x >= this.fakeWidth) return;
        if(point.y < 0 || point.y >= this.fakeHeight) return;
        autoUpdate = typeof(autoUpdate) === 'undefined' || autoUpdate ? true : false;

        var pixel = this.map[point.y][point.x], index;

        for(var i in pixel){
            index = pixel[i];
            this.imageData.data[index]   = color.red;       //red
            this.imageData.data[++index] = color.green;     //green
            this.imageData.data[++index] = color.blue;      //blue
            this.imageData.data[++index] = 255;             //alpha
        }

        if(autoUpdate) this.update();
    },

    getPixelColor: function(point){

        if(point.x < 0 || point.x >= this.fakeWidth) return;
        if(point.y < 0 || point.y >= this.fakeHeight) return;

        var pixel = this.map[point.y][point.x][0];
        return new this.util.Color(
            this.imageData.data[pixel],
            this.imageData.data[pixel + 1],
            this.imageData.data[pixel + 2]
        );
    },

    clearFrame: function(autoUpdate){

        autoUpdate = typeof(autoUpdate) === 'undefined' || autoUpdate ? true : false;

        this.context.clearRect(0, 0, this.realWidth, this.realHeight);
        this.imageData = this.context.getImageData(0, 0, this.realWidth, this.realHeight);

        for(var i = 0; i < this.fakeHeight; i++)
            for(var j = 0; j < this.fakeWidth; j++)
                this.activePixel(
                    {x: j, y: i},
                    {red: 255, green: 255, blue:255},
                    false
                );

        if(autoUpdate) this.update();
    },

    update: function(){
        this.context.putImageData(this.imageData, 0, 0);
    },

    ready: function(){
        this.setResolution(9);
    },

    init: function(){
        this.domObj = $(this.domObj)[0];
        this.context = this.domObj.getContext('2d');
        this.imageData = this.context.getImageData(0, 0, this.realWidth, this.realHeight);
        this.util = this._appRoot_.get('Util');
    }
});
