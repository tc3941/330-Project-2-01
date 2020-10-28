/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';
import * as main from './main.js';

let ctx,canvasWidth,canvasHeight,gradient,analyserNode,audioData;
const soundAvgMax = 200,soundMax = 80;
let r = 255, g = 0, b = 0;
let firstPhase, secondPhase, thirdPhase, forthPhase, fifthPhase, sixthPhase;
let invTest = 0;
let _percent;
let shownBarAvg = 0;
let barsToShow = 45;
let currentTime;
let _maxTime;
let preset;
let gradientSteps;
const rem = 16;//rem in px

function setupCanvas(canvasElement,analyserNodeRef){
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom
	gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"red"},{percent:.25,color:"black"},{percent:.5,color:"red"},{percent:.75,color:"black"},{percent:1,color:"red"}]);
	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
    audioData = new Uint8Array(analyserNode.fftSize/2);
    
}
function setTime(time){
currentTime = time;
}
function setMaxTime(maxTime){
_maxTime = maxTime;
}
function setPreset(value){
    preset = value;
    gradientSteps = preset.createGradientColor((barsToShow+2)/preset.numOfPhases);
    //console.log(gradientSteps);
}
function correctTime(){
    let zero = Math.floor(currentTime%60)>=10 ? "": "0";
    return Math.floor(currentTime/60) + ":" + zero + Math.floor(currentTime%60);
}

function draw(params={}){
    let average = soundBarsAverage();
    // 1 - populate the audioData array with the frequency data from the analyserNode
	// notice these arrays are passed "by reference" 
    analyserNode.getByteFrequencyData(audioData);
	// OR
	//analyserNode.getByteTimeDomainData(audioData); // waveform data
    // 4 - draw bars
    let amountTotal = 0;
        let amount = 0;
        if(main.getPlaying()){
            for(let i = 0; i<audioData.length; i++){
                if(audioData[i]>50){
                    amountTotal+=audioData[i];
                    amount++;
                }
            }
        }
        //console.log("avg from amount: " +amountTotal/amount);
        //console.log(audioData[0]);
        shownBarAvg = amountTotal/amount;
        _percent = getPercentage();
        //console.log("amount: " + amount);
        let barSpacing = -0.1;
        let margin = 5;
        let screenWidthForBar = canvasWidth - (audioData.length * barSpacing) - margin * 2;
        //let screenWidthForBar = canvasWidth - (audioData.length * barSpacing) - margin * 2;
        //let barWidth = screenWidthForBar/ audioData.length;
        // let barWidth = main.getPlaying() ? screenWidthForBar/ barsToShow : screenWidthForBar/ audioData.length;
        let barWidth = screenWidthForBar/ barsToShow;
        //console.log("barsToShow: " + barsToShow);
        //console.log("Calculated barToShow: " + screenWidthForBar/barWidth);
        let maxHeight = canvasHeight/4;
        let minHeight = 5;
        let topSpacing = 100;
        //place bars only on half
        barWidth /= 2;

        let spaceForProgressBar = minHeight*6;
        
        for(let i = 0; i < audioData.length; i++){
            ctx.save();
            ctx.globalAlpha =.75;
            let barHeight = maxHeight*(audioData[i]/soundAvgMax)+minHeight;
                    if(preset.ifRainbowBars()){
            ctx.fillStyle = getRainbowColors(255*3/audioData.length*2);
                    }else{
                        ctx.fillStyle = gradientSteps[i];
                    }
            ctx.fillRect(canvasWidth/2 + i * (barWidth + barSpacing), canvasHeight/2 - (barHeight+spaceForProgressBar/2+minHeight),barWidth,barHeight+spaceForProgressBar/2+minHeight);
            if(i!=0)
            ctx.fillRect(canvasWidth/2 - i * (barWidth + barSpacing), canvasHeight/2 - (barHeight+spaceForProgressBar/2+minHeight),barWidth,barHeight+spaceForProgressBar/2+minHeight);
            ctx.restore();
            ctx.save();
            ctx.globalAlpha =.45;
                        if(preset.ifRainbowBars()){
                            ctx.fillStyle = getRainbowColors(255*3/audioData.length*2);
                        }else{
                            ctx.fillStyle = gradientSteps[i];
                        }            
                        if(i!=0)
            ctx.fillRect(canvasWidth/2 + i * (barWidth + barSpacing), canvasHeight/2 ,barWidth,barHeight + spaceForProgressBar/2);
            ctx.fillRect(canvasWidth/2 - i * (barWidth + barSpacing), canvasHeight/2 ,barWidth,barHeight+ spaceForProgressBar/2);
        // }
            ctx.restore();
        }
        
        resetRainbowColor(); // comment out for constant rainbow
    

    //song progress bar
    ctx.save();
    let percentageOfSongComplete = _maxTime==0 ? 0 : currentTime/_maxTime;
    ctx.fillStyle = preset.BackgroundColor;
    console.log();
    ctx.fillRect(canvasWidth,canvasHeight/2 - (spaceForProgressBar+minHeight*2)/2,(-canvasWidth)*(1-percentageOfSongComplete),spaceForProgressBar+minHeight)
    ctx.restore();
    ctx.save();
    ctx.fillStyle = preset.getFontColor();
    ctx.font = `${spaceForProgressBar-minHeight}px Josefin Sans`;
    ctx.fillText(correctTime(), canvasWidth/2-25,canvasHeight/2+minHeight,100);
    ctx.font = `bold ${2*rem}px Josefin Sans`;
    let fontWidth = ctx.measureText(preset.songTitle).width;
    let titleMargin = rem;
    ctx.fillText(preset.songTitle,canvasWidth-fontWidth-titleMargin,canvasHeight-titleMargin);
    ctx.restore();

    // 5 - draw circles
    /*
		if(params.showCircles){
            let maxRadius = canvasHeight/6;
            ctx.save();
            ctx.globalAlpha = 0.5;
            for(let i = 0; i<audioData.length; i++){
                let percent = audioData[i]/255;

                let circleRadius = percent * maxRadius;
                ctx.beginPath();
                ctx.fillStyle = utils.makeColor(255,111,111,.34 - percent/3.0);
                ctx.arc(canvasWidth/6, canvasHeight/2, circleRadius , 0, 2*Math.PI,false);
                ctx.fill();
                ctx.closePath();

                ctx.beginPath();
                ctx.fillStyle = utils.makeColor(0,0,255, .10 - percent/10.0);
                ctx.arc(canvasWidth/6, canvasHeight/2, circleRadius * 1.5, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.closePath();

                ctx.beginPath();
                ctx.fillStyle = utils.makeColor(200, 200, 0, .5 - percent/5.0);
                ctx.arc(canvasWidth/6, canvasHeight/2, circleRadius * .50, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.closePath();
            }
            for(let i = 0; i<audioData.length; i++){
                let percent = audioData[i]/255;

                let circleRadius = percent * maxRadius;
                ctx.beginPath();
                ctx.fillStyle = utils.makeColor(255,111,111,.34 - percent/3.0);
                ctx.arc(5*canvasWidth/6, canvasHeight/2, circleRadius , 0, 2*Math.PI,false);
                ctx.fill();
                ctx.closePath();

                ctx.beginPath();
                ctx.fillStyle = utils.makeColor(0,0,255, .10 - percent/10.0);
                ctx.arc(5*canvasWidth/6, canvasHeight/2, circleRadius * 1.5, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.closePath();

                ctx.beginPath();
                ctx.fillStyle = utils.makeColor(200, 200, 0, .5 - percent/5.0);
                ctx.arc(5*canvasWidth/6, canvasHeight/2, circleRadius * .50, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.closePath();
            }
            ctx.restore();
        }
        */
        // 6 - bitmap manipulation
	// TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
	// regardless of whether or not we are applying a pixel effect
	// At some point, refactor this code so that we are looping though the image data only if
	// it is necessary

	// A) grab all of the pixels on the canvas and put them in the `data` array
	// `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
	// the variable `data` below is a reference to that array 
    let imageData = ctx.getImageData(0,0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width;
	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for(let i = 0; i < length; i++){
		// C) randomly change every 20th pixel to red
        if(params.showNoise && Math.random() < .05){
			// data[i] is the red channel
			// data[i+1] is the green channel
			// data[i+2] is the blue channel
            // data[i+3] is the alpha channel
            data[i] = data[i+1] = data[i+2] = 0;
            data[i] = 255;
			// zero out the red and green and blue channels
			// make the red channel 100% red
        } // end if
    } // end for
    
    if(params.showInvert){
        for(let i = 0; i < length;i+=4){
            let red = data[i], green = data[i+1], blue = data[i+2];
                    
            data[i] = getInvByPercentage(red);
            data[i+1] = getInvByPercentage(green);
            data[i+2] = getInvByPercentage(blue);
            }
    }
    if(params.showEmboss){
        for(let i = 0; i < length;i++){
            if(i%4==3) continue;
            data[i] = 127 + 2*data[i] - data[i+4] - data [i+width *4];
        }
    }
    
	// D) copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);
    

}
function getInvByPercentage(num){
    return (((255-num)-num)*_percent) + num;
}

function getPercentage(){
    return soundBarsAverage()==0 ? 0 : soundBarsAverage()/soundMax;
}
function getAvgPercentage(){
    return soundBarsAverage()==0 ? 0 : shownBarAvg/soundAvgMax;
}
function resetRainbowColor(){
    firstPhase = secondPhase = thirdPhase = forthPhase = fifthPhase = sixthPhase = false;
    r = 255;
    g = 0;
    b = 0;
}

function getRainbowColors(rate){
    if(!firstPhase){
        g +=rate;
        if(g>=255){
            firstPhase = true;
            g = 255;
        }
    }
    else if(!secondPhase){
        r -= rate;
        if(r<=0){
            secondPhase = true;
            r = 0;
        }
    }
    else if(!thirdPhase){
        b += rate;
        if(b>=255){
            thirdPhase = true;
            b = 255;
        }
    }
    else if(!forthPhase){
        g -= rate;
        if(g<=0){
            forthPhase = true;
            g = 0;
        }
    }
    else if(!fifthPhase){
        r += rate;
        if(r>=255){
            fifthPhase = true;
            r = 255;
        }
    }
    else if(!sixthPhase){
        g -= rate;
        if(g<=0){
            sixthPhase = true;
            g = 0;
        }
    }
    else{
        firstPhase = secondPhase = thirdPhase = forthPhase = fifthPhase = sixthPhase = false;
    }
    return 'rgba(' + r +', ' + g + ', ' + b + ',0.50)';
}

function soundBarsAverage(){
    let total = 0;
    for(let i = 0; i < audioData.length; i++){
        total += audioData[i];
    }
    return total/audioData.length;
}
export {setupCanvas,draw,setTime,setMaxTime,setPreset};