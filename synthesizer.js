/*
　* Folk　From : https://github.com/agektmr/Audio-Visualizer
 * Original Source : https://github.com/agektmr/Audio-Visualizer/blob/master/synthesizer.js
 * Sampling Rate: 44,100
 * Frequency:
 * Samples
 * BufferSize
 */

var Synthesizer = (function() {
    window.AudioContext = (function() {
        return window.AudioContext ||
            window.webkitAudioContext ||
            window.mozAudioContext ||
            window.oAudioContext ||
            window.msAudioContext ||
            undefined;
    }());

    var AudioLoader = (function() {
        var cache = {};
        var fetch = function(srcUrl, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', srcUrl, true);
            xhr.responseType = 'arraybuffer';
            cache[srcUrl] = {
                buffer: null,
                handler: xhr,
                httpStatus: null,
                state: null
            };
            xhr.onreadystatechange = function() {
                cache[srcUrl].state = xhr.readyState;
                if (xhr.readyState == 4) {
                    cache[srcUrl].httpStatus = xhr.status;
//          if (xhr.status == 200) {
                    audioContext.decodeAudioData(xhr.response, function(buffer) {
                        cache[srcUrl].buffer = buffer;
                        cache[srcUrl].handler = null;
                        cache[srcUrl].httpStatus = xhr.status;
                        cache[srcUrl].state = xhr.readyState;
                        callback.call(self, buffer);
                    });
//          } else {
//          }
                }
            };
            xhr.send();
        }
        var read = function(source, callback) {
            var reader = new FileReader();
            reader.onload = function(e) {
                audioContext.decodeAudioData(e.target.result, function(buffer) {
// TODO: consider about cacheing.
                    callback.call(self, buffer);
                });
            }
            reader.readAsArrayBuffer(source);
        }
        return {
            load: function(source, callback) {
                if (!!cache[source] && cache[source].httpStatus === 200) {
                    console.log("data was cached", cache);
                    callback(cache[source].buffer);
                } else if (typeof source === 'string') {
                    console.log("fetch", source);
                    fetch(source, callback);
                } else if (typeof source === 'object') {
                    console.log("read", source);
                    read(source, callback);
                }
                return;
            },
            abort: function(source) {
                if (!!cache[source]) {
                    cache[source].handler.abort();
                    return true;
                } else {
                    return false;
                }
            },
            clearCache: function() {
                cache = {};
            }
        }
    }());

    var audioContext = new AudioContext();

    var Synthesizer = function(audio, callback) {
        this.buffer = null;
        this.source = null;
        this.analyserNode = audioContext.createAnalyser();
        this.timeDomainBuffer = new Uint8Array(this.analyserNode.frequencyBinCount);
        var self = this;
        AudioLoader.load(audio, function(buffer) {
            self.buffer = buffer;
            callback(buffer);
        });
    };
    Synthesizer.prototype = {
        getDuration:function(){
            return this.buffer.duration;
        },
        play: function() {
            if (this.buffer) {
                this.source = audioContext.createBufferSource();
                this.source.connect(this.analyserNode);
                this.analyserNode.connect(audioContext.destination);
                this.source.buffer = this.buffer;
                this.source.noteOn(0);
            }
        },
        stop: function() {
            if (this.buffer) {
                this.source.noteOff(0);
            }
        },
        refreshCurrentSignal:function(){
            this.analyserNode.getByteFrequencyData(this.timeDomainBuffer);
        },
        getCurrentSignal:function(){
            //TODO check not copy data.
            return this.timeDomainBuffer;
        }
    };

    return function(url, callback) {
        return new Synthesizer(url, callback);
    }
}());
