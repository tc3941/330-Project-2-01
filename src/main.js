/*
	main.js is primarily responsible for hooking up the UI to the rest of the application 
	and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './canvas.js';
import {imageBackground} from './imageBackground.js';

const drawParams = {
    showGradient : true,
    showBars : true,
    showCircles : true,
    showNoise : false,
    showInvert : true,
    showEmboss : false
}
// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    sound1  : "media/Better Than Ever.mp3",
    sound2  :  "media/New Adventure Theme.mp3"
});
let imageSources = ["media/betterThanEver.jpg","media/Avenge_Sevenfold.jpg","media/SickoMode.jpg"];
let imageObjects= [];
let currentImageIndex = 0;
let imageEffect;
let isPlaying;
	
preloadImages(imageSources,init);

function preloadImages(imageArray,callback){
    let counter = 0;
    for (let src of imageArray){
        let imageName = src.split('/')[1].split('.')[0];
        let img = new Image();
        imageObjects.push(img);
        img.src = src;
        img.onload = ()=>{
            counter ++;
            console.log(src);
            if (counter == imageArray.length) callback();
        };
    }
}

function init(){
    audio.setUpWebaudio(DEFAULTS.sound1);
	console.log("init called");
	console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    canvasElement.parentNode.height = canvasElement.height;
    setupUI(canvasElement);
    
    canvas.setupCanvas(canvasElement,audio.analyserNode);
    imageEffect = new imageBackground(canvasElement);
    loadPreset(0);
    loop();
}

function loadPreset(num){
    currentImageIndex = num;
    //console.log(num);
    switch (num){
        case 0: setColors("white"); break;
        case 1: setColors('rgba(12,12,12,0.50)'); break;
        case 2: setColors('rgba(5,87,163,0.50)'); break;
    }
    console.log(imageEffect.backgroundColor);
}

function setColors(color){
    //document.querySelector("div").style.backgroundColor = color;
    //document.body.style.backgroundColor = color;
    imageEffect.setBackgroundColor(color);
}

function loop(){
    /* NOTE: This is temporary testing code that we will delete in Part II */
        requestAnimationFrame(loop);
        imageEffect.drawImage(imageObjects[currentImageIndex]);
        canvas.draw(drawParams);
        // 1) create a byte array (values of 0-255) to hold the audio data
        // normally, we do this once when the program starts up, NOT every frame
        let audioData = new Uint8Array(audio.analyserNode.fftSize/2);
        
        // 2) populate the array of audio data *by reference* (i.e. by its address)
        audio.analyserNode.getByteFrequencyData(audioData);
        
        // 3) log out the array and the average loudness (amplitude) of all of the frequency bins
            //console.log(audioData);
            
           // console.log("-----Audio Stats-----");
            let totalLoudness =  audioData.reduce((total,num) => total + num);
            let averageLoudness =  totalLoudness/(audio.analyserNode.fftSize/2);
            let minLoudness =  Math.min(...audioData); // ooh - the ES6 spread operator is handy!
            let maxLoudness =  Math.max(...audioData); // ditto!
            // Now look at loudness in a specific bin
            // 22050 kHz divided by 128 bins = 172.23 kHz per bin
            // the 12th element in array represents loudness at 2.067 kHz
            let loudnessAt2K = audioData[11]; 
           // console.log(`averageLoudness = ${averageLoudness}`);
           // console.log(`minLoudness = ${minLoudness}`);
           // console.log(`maxLoudness = ${maxLoudness}`);
           // console.log(`loudnessAt2K = ${loudnessAt2K}`);
           // console.log("---------------------");
    }
export function getPlaying(){
    return isPlaying;
}
function setupUI(canvasElement){
  // A - hookup fullscreen button
  const fsButton = document.querySelector("#fsButton");
	
  // add .onclick event to button
  fsButton.onclick = e => {
    console.log("init called");
    utils.goFullscreen(canvasElement);
  };

  playButton.onclick = e =>{
      console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

      if(audio.audioCtx.state == "suspended"){
          audio.audioCtx.resume();
          isPlaying = true;
      }
      console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
      if(e.target.dataset.playing == "no"){
          audio.playCurrentSound(); //if track is currently paused, play it
          e.target.dataset.playing = "yes";
          isPlaying = true;
        }
      else{
          audio.pauseCurrentSound();
          isPlaying = false;
          e.target.dataset.playing = "no";
      }
  };
  //hook up volume slider and label
  let volumeSlider = document.querySelector("#volumeSlider");
  let volumeLabel = document.querySelector("#volumeLabel");
  // add .oninput event to slider
  volumeSlider.oninput = e =>{
      // set the gain
      audio.setVolume(e.target.value);
    //update value of label to match value of slider
      volumeLabel.innerHTML = Math.round((e.target.value/2 * 100));
  }
  // set value of label to match inital value of slider
  volumeSlider.dispatchEvent(new Event("input"));

  // hookup track <select>
  let trackSelect = document.querySelector("#trackSelect");
  //add .onchange event to <select>
trackSelect.onchange = e =>{
    audio.loadSoundFile(e.target.value);
    switch(e.target.value){
        case e.target[0].value:loadPreset(0); break;
        case e.target[1].value:loadPreset(1); break;
        case e.target[2].value:loadPreset(2); break;
    }

    
    // pause the current track if it is playing
    if(playButton.dataset.playing = "yes"){
        playButton.dispatchEvent(new MouseEvent("click"));
    }
};
    let gradientSelect = document.querySelector("#gradientCB");

    gradientSelect.onchange = e=>{
        drawParams.showGradient = e.target.checked;
    };

    let barsSelect = document.querySelector("#barsCB");

    barsSelect.onchange = e=>{
        drawParams.showBars = e.target.checked;
    };

    let circleSelect = document.querySelector("#circlesCB");

    circleSelect.onchange = e=>{
        drawParams.showCircles = e.target.checked;
    }
    let noiseSelect = document.querySelector("#noiseCB");

    noiseSelect.onchange = e=>{
        drawParams.showNoise = e.target.checked;
    }
    let invertSelect = document.querySelector("#invertCB");

    invertSelect.onchange = e =>{
        drawParams.showInvert = e.target.checked;
    }
    let embossSelect = document.querySelector("#embossCB");

    embossSelect.onchange = e =>{
        drawParams.showEmboss = e.target.checked;
    }
  
} // end setupUI

export {init};