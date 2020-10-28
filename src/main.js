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
import { colorObject, songPreset } from './audioPreset.js';

const drawParams = {
    showGradient : true,
    showBars : true,
    showCircles : true,
    showNoise : false,
    showInvert : false,
    showEmboss : false
}
// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    sound1  : "media/Better Than Ever.mp3",
    sound2  :  "media/New Adventure Theme.mp3"
});
export let imageSources = ["media/betterThanEver.jpg","media/Avenge_Sevenfold.jpg","media/SickoMode.jpg"];
let imageObjects= [];
let currentImageIndex = 0;
let imageEffect;
let isPlaying;
let presets = [];
//upload buttons
let musicButton = document.querySelector("#musicFile");
let imageButton = document.querySelector("#songCover");

let palette = {
    color1: '#FF0000', // CSS string
    color2: [ 0, 128, 255 ], // RGB array
    color3: [ 0, 128, 255, 0.3 ], // RGB with alpha
    color4: { h: 350, s: 0.9, v: 0.3 } // Hue, saturation, value
  };

// 6 - the stuff on the page we will be changing

let invertSelect;
let h1Element,volumeLabel,volumeSlider;
let scoreElement;
let statusElement;
let score = 0;
let preseter;
let trackSelect;
let currentPreset;
let canvasElement;
// 7 - dat.GUI only calls "top-level" properties of an object
// To get around this issue,  we are creating `controllerObject` below
// and giving it setter and getters
// that will be called whenever dat.GUI tries to change a property value.
// Thus if dat.GUI trying to change the value of controllerObject.h1Color  ...
// this calls the setter (which is a method) - `set h1Color(value)` below ...
// which triggers a block of code to run ...
// and we can then run any code and set any properties that we wish

const controllerObject = {
	// "backing" property we are using to keep track of values
	_h1FontWeight 						: 700, 			// `controllerObject.h1FontWeight` is the "public" property that dat.GUI will call
	_titleColor 									: "black",	// `controllerObject.h1Color` is the "public" property that dat.GUI will call
	_bodyBackgroundColor			: "#FFFFFF", // `controllerObject.bodyBackgroundColor` is the "public" property that dat.GUI will call
	_h1FontFamily							: "Serif",	// `controllerObject.fontFamily` is the "public" property that dat.GUI will call
	_h1FontSize								: 24,				// `controllerObject.fontSize` is the "public" property that dat.GUI will call
    _volume                                 :1,
    _colors                                 :[],
    _songTitle                              :"",
    _backgroundColor                    :[ 0, 128, 255 ],
    _fontColor                    :[ 0, 128, 255 ],
    _image                              :"",
    _audio                              :"",


    // keep track of the h1's `style.color` value
    resetValues(){

    },
    get audioFile(){
        return this._audio;
    },
    set audioFile(value){
        this._audio = value;
    },
    get imageFile(){
        return this._image;
    },
    set imageFile(value){
        this._image = value;
    },
    get audioFile(){
        return this._audio;
    },
    set audioFile(value){
        this._audio = value;
    },

    get songTitle(){
        return this._songTitle;
    },
    set songTitle(value){
        this._songTitle = value;
    },
    get volume(){
        return this._volume;
    },
    set volume(value){
        this._volume = value;
        audio.setVolume(value);
    },
	set titleColor(value){
		this._titleColor = value;
		
	},
	
	get titleColor(){
		return this._titleColor;
    },
    
    get backgroundColor(){
        return this._backgroundColor;
    },

    set backgroundColor(value){
        this._backgroundColor = value;
    },
	
	// keep track of the <body> `style.background-color` value
	set bodyBackgroundColor(value){
		this._bodyBackgroundColor = value;
		document.body.style.backgroundColor = value;
	},
	
	get bodyBackgroundColor(){
		return this._bodyBackgroundColor;
	},
	
	// keep track of the h1's `style.fontWeight` value
	set h1FontWeight(value){
		this._h1FontWeight = value;
		h1Element.style.fontWeight = value;
	},
	
	get h1FontWeight(){
		return this._h1FontWeight;
	},
	
	// keep track of the h1's `style.fontFamily` value
	set h1FontFamily(value){
		this._h1FontFamily = value;
		h1Element.style.fontFamily = value;
	},
	
	get h1FontFamily(){
		return this._h1FontFamily;
	},
	
	// keep track of the h1's `style.fontSize` value
	set h1FontSize(value){
		this._h1FontSize = value;
		h1Element.style.fontSize = value + "pt";
	},
	
	get h1FontSize(){
		return this._h1FontSize;
	},
	
	increaseTheScore(){
		// call a function that is outside of `controllerObject`
		scoredPoint();
	},
	
	decreaseTheScore(){
		// call a function that is outside of `controllerObject`
		lostPoint();
    },

    uploadMusicFile(){
        musicButton.click();
    },
    uploadImageFile(){
        imageButton.click();
    },
    clickPlayPause(){
        playButton.click();
    },
    moreColors(){
        if(numOfColors<6){
            numOfColors++;
            this._colors.push(preseter.addColor(palette, 'color2').name(`Color ${numOfColors}`));
            //console.log(this._colors);
            //Get color: [i].__color.__state.r replace r w/ b or g for respective colors
        }
    },
    toggleInvert(){
        invertSelect.click();
    },
    createPreset(){
        let colorArray = [];
        //console.log(this._colors.length);
        if(this._colors.length!=0){
            for(let i = 0; i<this._colors.length; i++){
                let getColor = this._colors[i].__color.__state;
                colorArray.push(new colorObject(getColor.r,getColor.g,getColor.b));
            }
        }
        else{
            colorArray = [];
        }
        let createdPreset = new songPreset(canvasElement,this.songTitle,this.imageFile,this.audioFile,colorArray,this.getRGBA(this.backgroundColor),this.getRGBA(this.fontColor));
        createdPreset.createTag();
        presets.push(createdPreset);
        window.alert("Preset of " + createdPreset.songTitle);
        this.resetValues();
    },
   
    toggleInvert(){
        invertSelect.click();
    },
    get fontColor(){
        //let getColor = this._fontColor.__color.__state;
        ////console.log(this._fontColor);
        return this._fontColor;
    },
    getRGBA(value){
        return `rgba(${value[0]},${value[1]},${value[2]})`;
    },
    set fontColor(value){
        this._fontColor = value;
    },
    startCreatingPreset(){
        loadImage(this.audioFile,this.createdPreset)
    }
};

//preloadImages(imageSources,init);

function createNewPreset(){
    let name = controllerObject._name;
    let imageFile = document.querySelector("#songCover").files[0];
    let soundFile = document.querySelector("#musicFile").files[0];
    //let newPreset = new songPreset();
   // controllerObject
}

export function preloadImages(imageArray,callback){
    let counter = 0;
    for (let src of imageArray){
        let imageName = src.split('/')[1].split('.')[0];
        let img = new Image();
        imageObjects.push(img);
        img.src = src;
        img.onload = ()=>{
            counter ++;
            //console.log(src);
            if (counter == imageArray.length) callback();
        };
    }
}
function loadImage(src,callback){
        let img = new Image();
        imageObjects.push(img);
        img.src = src;
        img.onload = ()=>{
            //console.log(src);
            callback();
        };
    
}
let numOfColors = 0;
function datGuiInit(){
    // 1 - here are the page elements that we will be updating based on input from dat.GUI
	let songTitleHTML = document.querySelector("#songTitle");
    //scoreElement = document.querySelector("#score");
    
	// 2 - make a new dat.GUI instance and close it
	const gui = new dat.GUI({ width: 400 });
	gui.close();
    
	// 3 - start adding controls to our dat.GUI instance
    
   

	// 3A - top-level properties like `h1Element.innerHTML` are easy to link to dat.GUI
    /*
    gui.add(h1Element, 'innerHTML').name('h1.innerHTML');
	
	// 3B - but nested properties like `h1Element.style.color` can't be accessed directly by dat.GUI
	// so we use our `controllerObject` and its setters and getters to trigger the code we want to run
	// whenever the values of dat.GUI change
    
    gui.add(controllerObject, 'h1Color', { Black: "black", Red: "red", Green: "green", Blue: "blue" } ).name('h1.style.color');
	gui.addColor(controllerObject, 'bodyBackgroundColor').name('document.body.style.backgroundColor');
	gui.add(controllerObject, 'h1FontWeight').min(100).max(900).step(100).name('h1.style.fontWeight');
	gui.add(controllerObject, 'h1FontFamily', ["Serif","Sans-serif","Monospace","Cursive","Fantasy"]).name('h1.style.fontFamily');
	gui.add(controllerObject, 'h1FontSize', 5, 50).name('h1.style.fontSize'); // Min and max
    */
    // gui.add(controllerObject, 'h1Color', { Black: "black", Red: "red", Green: "green", Blue: "blue" } ).name('h1.style.color');
    gui.add(controllerObject, 'clickPlayPause').name('Play/Pause');
    gui.add(controllerObject, 'volume').min(0).max(2).step(.05).name('Volume');
    gui.add(controllerObject, 'toggleInvert').name("Toggle Invert Color with song");
    
    preseter = gui.addFolder("Add music and create preset");
	// 3C - make some buttons
	// here we are calling `controllerObject.increaseTheScore()` and `controllerObject.decreaseTheScore()` **methods**
	// which then call `scoredPoint()` and `lostPoint()` below
    preseter.add(controllerObject, 'songTitle').name('Song Title');
    preseter.addColor(controllerObject, 'fontColor').name('Font Color');
    preseter.addColor(controllerObject, 'backgroundColor').name('Background Color');
    preseter.add(controllerObject, 'uploadMusicFile').name('Upload Sound File');
    preseter.add(controllerObject, 'uploadImageFile').name('Upload Image File');
    
    preseter.add(controllerObject, 'moreColors').name('Add Gradiant Shift to Bars');
    preseter.add(controllerObject,'createPreset').name('Create new Preset');;
    
      //preseter.addColor(palette, 'color1');
      //let tempString = 'color' + numOfColors;
     //controllerObject._colors.push(preseter.addColor(palette, 'color2').name(`Color ${numOfColors}`));
      //preseter.addColor(palette, 'color3');
     // preseter.addColor(palette, 'color4');
    
    // gui.add(controllerObject, 'increaseTheScore').name('Score ++');
	// gui.add(controllerObject, 'decreaseTheScore').name('Score --');
}

// 4 - this is called by the `controllerObject` above
function scoredPoint(){
	score ++;
	scoreElement.innerHTML = `Score: ${score}`;
}

// 5 - this is called by the `controllerObject` above
function lostPoint(){
	score --;
	scoreElement.innerHTML = `Score: ${score}`;
}


function init(){
    audio.setUpWebaudio(DEFAULTS.sound1);
	//console.log("init called");
	//console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
	canvasElement = document.querySelector("canvas"); // hookup <canvas> element
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    canvasElement.parentNode.height = canvasElement.height;
    setupUI(canvasElement);
    canvas.setupCanvas(canvasElement,audio.analyserNode);
    let defaultColor1 = new colorObject(254,0,0);
    let defaultColor2 = new colorObject(0,254,0);
    let defaultColor3 = new colorObject(0,0,254);
    let defaultColors = [defaultColor1,defaultColor2,defaultColor3];
    presets.push(new songPreset(canvasElement,"Better Than Ever",imageObjects[0],trackSelect.childNodes[0],defaultColors,"white","black"));
    presets.push(new songPreset(canvasElement,"Paradigm",imageObjects[1],trackSelect.childNodes[1],[],'rgba(12,12,12,1)',"white"));
    presets.push(new songPreset(canvasElement,"Sicko Mode",imageObjects[2],trackSelect.childNodes[2],[],'rgba(5,87,163,1)',"red"));
    
    imageEffect = new imageBackground(canvasElement);
    datGuiInit();
    //loadPreset(0);
    loadFromPreset(presets[0]);
    loop();
}

function loadPreset(num){
    currentImageIndex = num;
    //console.log(num);
    switch (num){
        case 0: setColors("white"); controllerObject.songTitle = "Better Than Ever"; break;
        case 1: setColors('rgba(12,12,12,0.50)'); controllerObject.songTitle = "Paradigm";break;
        case 2: setColors('rgba(5,87,163,0.50)'); controllerObject.songTitle = "Sicko Mode";break;
    }
    //console.log(imageEffect.backgroundColor);
}
function loadFromPreset(preset){
    canvas.setPreset(preset);
    document.querySelector("#songTitle").innerHTML = preset.songTitle;
    document.querySelector("#songTitle").style.color = preset.getFontColor();
    currentPreset = preset;
}

function setColors(color){
    //document.querySelector("div").style.backgroundColor = color;
    //document.body.style.backgroundColor = color;
    imageEffect.setBackgroundColor(color);
}

function loop(){
    /* NOTE: This is temporary testing code that we will delete in Part II */
        requestAnimationFrame(loop);
        canvas.setMaxTime(audio.element.duration);
        canvas.setTime(audio.element.currentTime);
        currentPreset.drawImage();
        //imageEffect.drawImage(imageObjects[currentImageIndex]);
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
    //console.log("init called");
    utils.goFullscreen(canvasElement);
  };

  let imageInput = document.querySelector("#songCover");

  imageInput.onchange = e =>{
      if(e.target.files.length>0){
          const files = e.target.files;
          controllerObject.imageFile = URL.createObjectURL(files[0]);
          let img = new Image();
          imageObjects.push(img);
          img.src = controllerObject.imageFile;
          controllerObject.imageFile = img;
          //console.log(imageObjects);
          //console.log(imageInput.files[0]);
        }
  };
  let musicInput = document.querySelector("#musicFile");

  musicInput.onchange = e =>{
    if(e.target.files.length>0){
    const files = e.target.files;
    controllerObject.audioFile = URL.createObjectURL(files[0]);
    //console.log(musicInput.files[0]);
    }
  };

  let instructionBt = document.querySelector("#helpBt");

  instructionBt.onclick = e =>{
    window.alert("How to use:" + "\nThe ability to change the song is at the top of the screen." + " \nControls are on the top right of the screen."
     + "The controls are obvious. The \"Toggle Invert Color with Song\""
     + "The pull down menu is where you can have the ability to add your own song to play." 
     + "You set the properties of the song in the drag down menu."
     + "\n\nSong Title - Name of the song." + "\nFont Color - Changes the color of the time elasped and title at the bottom right."
     + "\nBackground Color - The color of the page.\n" + "Upload sound File - Upload audio that will play"
     + "\nUpload Image File - Upload image of the top center of the screen"
     + "\nAdd Gradiant Shift to Bars - Changes the colors of the bars"
     + "\nAdd additional color shifts to the gradiant" + "\nCreate new Preset - Creates a preset based on the properties." 
     );
  };

  playButton.onclick = e =>{
      //console.log(`audioCtx.state before = ${audio.audioCtx.state}`);
      //console.log(audio.element.currentTime);
      if(audio.audioCtx.state == "suspended"){
          audio.audioCtx.resume();
          isPlaying = true;
      }
      //console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
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
  volumeSlider = document.querySelector("#volumeSlider");
  volumeLabel = document.querySelector("#volumeLabel");
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
trackSelect = document.querySelector("#trackSelect");
  //add .onchange event to <select>
trackSelect.onchange = e =>{
    audio.loadSoundFile(e.target.value);
    
    for(let i = 0;i < e.target.length; i++){
        if(e.target[i].value == e.target.value){
            loadFromPreset(presets[i]);
            break;
        }
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
    invertSelect = document.querySelector("#invertCB");

    invertSelect.onchange = e =>{
        drawParams.showInvert = e.target.checked;
    }
    let embossSelect = document.querySelector("#embossCB");

    embossSelect.onchange = e =>{
        drawParams.showEmboss = e.target.checked;
    }
  
} // end setupUI

export {init};