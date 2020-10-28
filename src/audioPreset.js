/* TODO: Presets for songs
-they must have a background
-scale to canvas

TODO: ability to have effects based on sound levels
-ex. inverse is at 90% because music avg is at 17k

TODO: circles that match the colors of the song picture

MAYBE: add custom images and songs with custom colors
*/
import {imageBackground} from './imageBackground.js';

export class songPreset{
    constructor(canvas,name,image,file,colors,bkgdColor,fontColor){
        this._canvas = canvas;
        this._name = name;
        this._image = image;
        this._file = file;
        this._colors = colors;
        this._backColor = bkgdColor;
        this.size = this._canvas.width/8;
        this._fontColor = fontColor;
// console.log(this._colors);
    }
    drawImage(){
        let ctx = this._canvas.getContext('2d');
        let scale = this.size / this._image.height;
        ctx.save();
         ctx.fillStyle = this._backColor; 
         ctx.fillRect(0,0,this._canvas.width,this._canvas.height);
        ctx.restore();
        ctx.drawImage(this._image,this._canvas.width/2 - (this._image.width/2 *scale),0,this._image.width *scale,this._image.height *scale);//place in center
    }
    createGradientColor(steps){
        //length of whatever divided the length of colors
        //that is the number of phases. so if three colors three phases.
        //ie if 9 steps and 3 colors should be base then mid color then end color 3 times.
        let phases = this._colors.length-1;
        let gradient = [];
        if(phases==0){return this._colors[0]}
        if(this._colors.length==0){return ""}
        for(let i = 0; i<phases;i++){
            for(let j = 0; j<steps;j++){
                //console.log(this._colors[i+1].Green);
            let dr =(j* (this._colors[i+1].Red - this._colors[i].Red))/steps;
            let dg =(j* (this._colors[i+1].Green - this._colors[i].Green))/steps;
            let db =(j* (this._colors[i+1].Blue - this._colors[i].Blue))/steps;
           // console.log("color r: " + dr);
           // console.log("color g: " + dg);
           // console.log("color b: " + db);
            gradient.push(`rgba(${this._colors[i].Red + dr},${this._colors[i].Green + dg},${this._colors[i].Blue + db})`);
            }
        }
        //console.log(gradient);
        return gradient;
    }
    getFontColor(){
        return this._fontColor;
    }
    get BackgroundColor(){
        return this._backColor;
    }
    ifRainbowBars(){
        return this._colors.length==0||this._colors == [];
    }
    get numOfPhases(){
        return this._colors.length-1;
    }
    get songTitle(){
        return this._name;
    }
    createTag(){
        let b = document.querySelector("#trackSelect");
        let optionTag = document.createElement("option");
        optionTag.className = "audio";
        optionTag.innerHTML = this.songTitle;
        optionTag.value = this._file;
        b.appendChild(optionTag);
        // console.log(optionTag);
    }
}

export class colorObject{
    constructor(r,g,b){
        this.r = r;
        this.g = g;
        this.b = b;
    }

    get Red(){
        return this.r;
    }
    set Red(value){
        this.r = value;
    }
    get Green(){
        return this.g;
    }
    set Green(value){
        this.g = value;
    }
    get Blue(){
        return this.b;
    }
    set Blue(value){
        this.b = value;
    }
}