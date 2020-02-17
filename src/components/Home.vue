<template>
  <div class="home">
    <div class="record-btn">
        <v-icon size="100" v-on:click="onRecordClick()">{{recordButton}}</v-icon>
    </div>
    <div class="container"> 
      <h2>Input</h2>
      <canvas id="canvas"></canvas>
      <!-- <div class="play-btn"> -->
        <!-- <v-icon class="play-btn" size="100" v-on:click="onInputPlayClick()">{{inputPlayButton}}</v-icon> -->
      <!-- </div> -->
    </div>
    <div class="container"> 
      <h2>Output</h2>
      <av-waveform audio-src="assets/2020-02-16T14_46_16.363Z.wav"></av-waveform>
      <!-- <canvas id="canvas"></canvas> -->
      <!-- <div class="play-btn">
          <v-icon size="100" v-on:click="onOutputPlayClick()">{{outputPlayButton}}</v-icon>
      </div> -->
    </div>
    <div class="container">
        <div class="renew-btn">
            <v-btn color="error" dark large>
                <v-icon left>mdi-autorenew</v-icon>
                New Record
            </v-btn>
        </div>
        <div class="download-btn">
            <v-btn color="success" dark large>
                <v-icon left>mdi-download</v-icon>
                Download
            </v-btn>
        </div>
    </div>
  </div>
</template>

<script>
import Recorder from '../js/recorder'
import io from 'socket.io-client'

const toggleRecordButton = ['mdi-microphone', 'mdi-stop']
const togglePlayButton = ['mdi-play-circle', 'mdi-pause-circle']

let obj = {}
let loopID = 0;

let recorder = null


var socket = null

function init () {
  obj.canvas = document.getElementById( 'canvas' );
  obj.ctx = obj.canvas.getContext( '2d' );
  obj.width = window.innerWidth * 0.5;
  obj.height = window.innerHeight * 0.2;
  obj.canvas.width = obj.width * window.devicePixelRatio;
  obj.canvas.height = obj.height * window.devicePixelRatio;
  obj.canvas.style.width = obj.width + 'px';
  obj.canvas.style.height = obj.height + 'px';
  obj.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  
  document.body.appendChild( obj.canvas );
}

let timeOffset = 5;
let now = parseInt(performance.now()) / timeOffset;

function loop () {
  obj.ctx.clearRect(0, 0, obj.canvas.width, obj.canvas.height);
  let max = 0.01;
  
  if (parseInt(performance.now()/ timeOffset)  > now) {
      now = parseInt(performance.now() / timeOffset);
      obj.analyser.getFloatTimeDomainData(obj.frequencyArray)
      socket.emit('array', obj.frequencyArray)
      for (var i = 0; i< obj.frequencyArray.length;  i++) {
        if(obj.frequencyArray[i] > max) {
          max = obj.frequencyArray[i];
        } 
      }
    
      var freq = Math.floor(max * 100);
    
    
      obj.bars.push({
        x: obj.width,
        y: (obj.height / 2) - (freq / 2),
        height: freq,
        width: 2
      });
  }
  draw();
  loopID = requestAnimationFrame(loop);
}
obj.bars = [];

function draw() {
  for (let i = 0; i < obj.bars.length ; i++) {
    const bar = obj.bars[i];
    obj.ctx.fillStyle = `rgb(0,255,0)`;
    obj.ctx.fillRect(bar.x,bar.y,bar.width,bar.height);
    bar.x = bar.x - 2;
    
    if (bar.x < 1) {
        obj.bars.splice(i,1)
    }
    
  }
}

function soundAllowed(stream) {
  var AudioContext = (window.AudioContext || window.webkitAudioContext)
  var audioContent = new AudioContext();
  var streamSource = audioContent.createMediaStreamSource(stream);

  recorder = new Recorder(streamSource, {numChannels: 1})

  obj.analyser = audioContent.createAnalyser();
  streamSource.connect(obj.analyser);
  obj.analyser.fftSize = 1024;
  obj.frequencyArray = new Float32Array(obj.analyser.fftSize);
  init()

}

function createDownloadLink(blob) {
	
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var link = document.createElement('a');

	var filename = new Date().toISOString();

	au.controls = true;
	au.src = url;

	link.href = url;
	link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
	link.innerHTML = "Save to disk";

	// link.click()
}

export default {
  name: 'Home',
  data () {
    return {
      isRecording: false,
      isInputPlaying: false,
      isOutputPlaying: false,
      recordButton: 'mdi-microphone',
      inputPlayButton: 'mdi-play-circle',
      outputPlayButton: 'mdi-play-circle'
    }
  },
  methods: {
      onRecordClick: function() {
        this.isRecording = !this.isRecording
        this.recordButton = toggleRecordButton[Number(this.isRecording)]

        if (this.isRecording){
          recorder.record()
          loop()
        } 
        else{
          recorder.stop()
          socket.emit('message', "Hello world")
          recorder.exportWAV(createDownloadLink)
          cancelAnimationFrame(loopID)
          console.log("stopButton clicked");
        }
      },
      onInputPlayClick: function() {
        this.isInputPlaying = !this.isInputPlaying
        this.inputPlayButton = togglePlayButton[Number(this.isInputPlaying)]
      },
      onOutputPlayClick: function() {
        this.isOutputPlaying = !this.isOutputPlaying
        this.outputPlayButton = togglePlayButton[Number(this.isOutputPlaying)]
      }
  },
  beforeMount: function() {
    navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(soundAllowed)
  },
  created: function() {
    socket = io('http://localhost:3000')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
canvas {
  bottom: 0;
  left: 0;
  margin-left: auto;
  margin-right: auto;
  top: 30%;
  position: absolute;
  right: 0;
}

.container{
    width: 100%;
    margin-top: 120px;
}
.audio{
    float: left;
    /* background: #42b983; */
    height: 100px;
    width: 100%;
}
.play-btn{
    top: 30px;
    float: right;
    width: 0%;
}
.record-btn{
    align-items: center;
    margin-top: 50px
}
.renew-btn{
    float: left;
    width: 50%
}
.download-btn{
    float: right;
    width: 50%
}
.home{
    text-align: center
}
</style>
