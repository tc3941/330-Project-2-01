/* TODO: Presets for songs
-they must have a background
-scale to canvas

TODO: ability to have effects based on sound levels
-ex. inverse is at 90% because music avg is at 17k

TODO: circles that match the colors of the song picture

MAYBE: add custom images and songs with custom colors
*/

export class imageBackground{
    constructor(canvas){
        this.canvas = canvas;
        this.backgroundColor = "white";
    }
    drawImage(image){
        let ctx = this.canvas.getContext('2d');
        let scale = this.canvas.height / image.height;
        ctx.save();
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        ctx.restore();
        ctx.drawImage(image,this.canvas.width/2 - (image.width/2 *scale),0,image.width *scale,image.height *scale);//place in center
    }
    setBackgroundColor(color){
        this.backgroundColor = color;
    }
}