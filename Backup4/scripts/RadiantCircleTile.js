define(['./worldwind.min'], function (WorldWind) {
    "use strict";

    let ColoredTile = WorldWind.ColoredTile;

    let RadiantCircleTile = function() {
        ColoredTile.apply(this, arguments);
    };

    RadiantCircleTile.prototype = Object.create(ColoredTile.prototype);

    RadiantCircleTile.prototype.shape = function() {
        let circle = this.createCanvas(this._width, this._height),
            ctx = circle.getContext('2d'),
            radius = 15,
            r2 = radius + radius;
        // console.log(this._width, this._height, radius);

        circle.width = circle.height = r2;

        let gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
        gradient.addColorStop(0, "rgba(0,0,0,1)");
        gradient.addColorStop(0.5, "rgba(0,0,0,0)");

        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, Math.PI * 2, true);

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.closePath();

        return circle;
    };

    return RadiantCircleTile;
});