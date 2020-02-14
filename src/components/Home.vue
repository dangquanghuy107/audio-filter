<template>
  <div class="home">
    <div class="record-btn">
        <v-icon size="100" v-on:click="onRecordClick()">{{recordButton}}</v-icon>
    </div>
    <div class="container"> 
        <h2>Input</h2>
        <div class="audio">.</div>
        <div class="play-btn">
            <v-icon size="100" v-on:click="onInputPlayClick()">{{inputPlayButton}}</v-icon>
        </div>
    </div>
    <div class="container"> 
        <h2>Output</h2>
        <div class="audio">.</div>
        <div class="play-btn">
            <v-icon size="100" v-on:click="onOutputPlayClick()">{{outputPlayButton}}</v-icon>
        </div>
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

const toggleRecordButton = ['mdi-microphone', 'mdi-stop']
const togglePlayButton = ['mdi-play-circle', 'mdi-pause-circle']

// var recorder = new Recorder()
// recorder.record()

var gumStream;
var recorder;
var input;
var audioContext = new AudioContext()

function createDownloadLink(blob) {
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');
    //add controls to the <audio> element 
    au.controls = true;
    au.src = url;
    //link the a element to the blob 
    link.href = url;
    link.download = new Date().toISOString() + '.wav';
    link.innerHTML = link.download;
    console.log(url)
    link.click()
    //add the new audio and a elements to the li element 
    li.appendChild(au);
    li.appendChild(link);
    //add the li element to the ordered list 
    // recordingsList.appendChild(li);
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
          navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(stream) {
            gumStream = stream
            input = audioContext.createMediaStreamSource(gumStream)
            recorder = new Recorder(input, {
              numChannels: 1
            })
            recorder.record()
          }).catch(function(err){
            console.error(err)
          })
        }
        else{
          console.log("stopButton clicked");
          //disable the stop button, enable the record too allow for new recordings 
          // stopButton.disabled = true;
          // recordButton.disabled = false;
          // pauseButton.disabled = true;
          //reset button just in case the recording is stopped while paused 
          // pauseButton.innerHTML = "Pause";
          //tell the recorder to stop the recording 
          recorder.stop(); //stop microphone access 
          gumStream.getAudioTracks()[0].stop();
          //create the wav blob and pass it on to createDownloadLink 
          recorder.exportWAV(createDownloadLink);
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container{
    width: 100%;
    margin-top: 100px;
}
/* .btn-container{
    width: 100%;
    margin-top: 200px
} */
.audio{
    float: left;
    background: #42b983;
    height: 100px;
    width: 85%;
}
.play-btn{
    float: right;
    width: 15%;
}
.record-btn{
    align-items: center;
    margin-top: 100px
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
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
