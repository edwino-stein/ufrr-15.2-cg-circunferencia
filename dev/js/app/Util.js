App.define('Util', {

    Point: function Point(x, y){
        this.x = x;
        this.y = y;
    },

    Color: function Color(red, green, blue){

        red = parseInt(red);
        green = parseInt(green);
        blue = parseInt(blue);

        this.red = isNaN(red) || red < 0 || red > 255 ? 0 : red;
        this.green = isNaN(green) || green < 0 || green > 255 ? 0 : green;
        this.blue = isNaN(blue) || blue < 0 || blue > 255 ? 0 : blue;
    },

});
