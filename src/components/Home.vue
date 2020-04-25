<template>
  <div id="home">
    <div v-if="needRecord" class="record-btn">
        <v-icon size="100" @click="onRecordClick()">{{recordButton}}</v-icon>
    </div>
    <div class="container"> 
      <h2>Input</h2>
      <div v-if="needRecord">
        <canvas id="canvas"></canvas>
      </div>
      <div v-else id="waveform">
        <av-waveform :audio-src="API_URL + '/api/download_input'">
        </av-waveform>
      </div>
    </div>
    <div class="container"> 
      <h2>Output 1 (mmse) </h2>
      <div v-if="needRecord">
        <canvas id="canvas_result_1"></canvas>
      </div>
      <div v-else>
        <av-waveform :audio-src="API_URL + '/api/download_output_mmse'">
        </av-waveform>
      </div>
    </div>
    <div class="container">
      <h2>Output 2 (dnn)</h2>
      <div v-if="needRecord">
        <canvas id="canvas_result_2"></canvas>
      </div>
      <div v-else>
        <av-waveform :audio-src="API_URL + '/api/download_output_dnn'">
        </av-waveform>
      </div>
    </div>
    <div class="container">
        <div class="renew-btn">
            <v-btn @click="onNewRecordClick()" v-if="!needRecord" color="error" dark large>
                <v-icon left>mdi-autorenew</v-icon>
                New Record
            </v-btn>
        </div>
    </div>
  </div>
</template>

<script>
import Recorder from '../js/recorder'
import io from 'socket.io-client'
// import WaveSurfer from 'wavesurfer'


const toggleRecordButton = ['mdi-microphone', 'mdi-stop']
const togglePlayButton = ['mdi-play-circle', 'mdi-pause-circle']

let obj = {}
let obj_result_1 = {}
let obj_result_2 = {}
let loopID = 0;

let recorder = null


var socket = null

function init (obj, id) {
  obj.canvas = document.getElementById( id );
  obj.ctx = obj.canvas.getContext( '2d' );
  obj.width = window.innerWidth * 0.6;
  obj.height = window.innerHeight * 0.2;
  
  obj.col_result = 0

  obj.block = Math.trunc(obj.width / 128) + 1
  obj.cur_block = 0

  obj.width = obj.block * 128 + 1

  obj.canvas.width = obj.width * window.devicePixelRatio;
  obj.canvas.height = obj.height * window.devicePixelRatio;
  obj.ctx.fillStyle = `rgb(255,0,0)`;
  
  obj.canvas.style.width = obj.width + 'px';
  obj.canvas.style.height = obj.height + 'px';

  obj.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

}

let col = 0

let last_save = 0;

function loop () {   
  if (performance.now() - last_save >= 1000){
    if (col + 128 >= obj.width){
      col = 0
      obj.ctx.clearRect(0, 0, obj.canvas.width, obj.canvas.height);
    }
    recorder.getBuffer((buffers) => {
      recorder.clear()
      var arr = Array.prototype.slice.call(buffers[0])
      socket.emit('noise_2', arr)
      socket.emit('noise_1', arr)
      for (var j = 0; j < arr.length / 256; j++){
        let max = 0.01;
        for (var i = j * 256; i< (j + 1) * 256;  i++) {
          if(arr[i] > max) {
            max = arr[i];
          } 
        }

        var freq = Math.floor(max * 100);

        obj.ctx.fillRect(col,(obj.height / 2) - (freq / 2),1,freq);
        col += 2;
      }
    })
    last_save += 1000
  }

  loopID = requestAnimationFrame(loop);
}

function loop_result(obj_result) {
  if (obj_result.col_result + 128 >= obj_result.width){
    obj_result.col_result = 0
    obj_result.ctx.clearRect(0, 0, obj_result.canvas.width, obj_result.canvas.height);
  }
  for (var j = 0; j < obj_result.frequencyArray.length / 256; j++){
    let max = 0.01;
    for (var i = j * 256; i< (j + 1) * 256;  i++) {
      if(obj_result.frequencyArray[i] > max) {
        max = obj_result.frequencyArray[i];
      } 
    }

    var freq = Math.floor(max * 100);

    obj_result.ctx.fillRect(obj_result.col_result,(obj_result.height / 2) - (freq / 2),1,freq);
    obj_result.col_result += 2;
  }
}

function soundAllowed(stream) {
  var AudioContext = (window.AudioContext || window.webkitAudioContext)
  var audioContent = new AudioContext({sampleRate: 16000});
  var streamSource = audioContent.createMediaStreamSource(stream);

  recorder = new Recorder(streamSource, {numChannels: 1, bufferLen: 4096*4})

  obj.analyser = audioContent.createAnalyser();
  streamSource.connect(obj.analyser);
  obj.analyser.fftSize = 256;
  obj.frequencyArray = new Float32Array(obj.analyser.fftSize);
  init(obj, 'canvas')
  init(obj_result_1, 'canvas_result_1')
  init(obj_result_2, 'canvas_result_2')
}

export default {
  name: 'Home',
  data () {
    return {
      API_URL: process.env.VUE_APP_API_URL,
      isRecording: false,
      isInputPlaying: false,
      isOutputPlaying: false,
      recordButton: 'mdi-microphone',
      inputPlayButton: 'mdi-play-circle',
      outputPlayButton: 'mdi-play-circle',
      needRecord: true,
      status: ''
    }
  },
  methods: {
      onRecordClick: function() {
        this.isRecording = !this.isRecording
        this.recordButton = toggleRecordButton[Number(this.isRecording)]
        
        if (this.isRecording){
          recorder.record()
          last_save = performance.now()
          loop()
        } 
        else{
          recorder.stop()
          socket.emit('get_result', "Output")
          socket.on('result', () => {
            this.needRecord = !this.needRecord
          })
          cancelAnimationFrame(loopID)
        }
      },
      onInputPlayClick: function() {
        this.isInputPlaying = !this.isInputPlaying
        this.inputPlayButton = togglePlayButton[Number(this.isInputPlaying)]
      },
      onOutputPlayClick: function() {
        this.isOutputPlaying = !this.isOutputPlaying
        this.outputPlayButton = togglePlayButton[Number(this.isOutputPlaying)]
      },
      onNewRecordClick: function() {
        location.reload()
      }
  },
  beforeMount: function() {
    navigator.mediaDevices.getUserMedia({audio: true, video: false}).then((stream) => {
      soundAllowed(stream)
      this.width = obj.canvas.width
      this.isCreated = true
    }).catch((err) => {
      this.error = err
    })
  },
  created: function() {
    socket = io(this.API_URL)
    socket.on('noise_responses_1', (data) => {
      obj_result_1.frequencyArray = data
      loop_result(obj_result_1)
    })
    socket.on('noise_responses_2', (data) => {
      obj_result_2.frequencyArray = data
      loop_result(obj_result_2)
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
canvas {
  width: 100%;
  height: 100%;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
}

canvas_result_1 {
  width: 100%;
  height: 100%;
  margin-left: auto;
  margin-right: auto;
}

.container{
    display: inline-block;
  width: 100%;
  height: 100px;
}

/* .audio{
    float: left;
    height: 100px;
    width: 100%;
} */
.play-btn{
    top: 30px;
    float: right;
    width: 0%;
}
.record-btn{
    align-items: center;
    margin-top: 50px
}
.home{
    text-align: center
}
</style>
