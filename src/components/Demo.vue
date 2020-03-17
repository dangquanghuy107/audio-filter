<template>
    <div id="Wrapper">
        <div v-for="file in file_names" :key=file> 
            <h2>{{file}}</h2>
            <h3>Input</h3>
                <av-waveform :playtime-clickable="true" :audio-src="'http://localhost:8000/demo/input/' + file">
                </av-waveform>
            <h3>Output</h3>
                <av-waveform :audio-src="'http://localhost:8000/demo/output/' + file">
                </av-waveform>
        </div>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'Demo',
    data() {
        return {
            file_names: []
        }
    },
    created: function() {
        axios.get('http://localhost:8000/demo').then((res) => {
            this.file_names = res.data
        })
    }
}
</script>


