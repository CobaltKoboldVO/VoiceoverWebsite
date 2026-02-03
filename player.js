{
    class AudioPlayer extends HTMLElement{
        playing = false;
        currentTime = 0;
        duration = 0;
        volume = 0.4;
        initialized = false;
        title = 'untitled';

        constructor(){
            super();

            this.attachShadow( {mode:'open'});
            this.render();
            this.initializeAudio();
            this.attachEvents();
        }

        static get observedAttributes(){
            return ['src', 'title', 'muted', 'crossorigin','loop', 'preload'];
        }

        async attributeChangedCallback(name, oldValue, newValue){
            if (name ==='src'){
                if (this.playing){
                    await this.togglePlay();
                }
                this.initailized = false;
                this.render();
            } else if(name === 'title'){
                this.title = newValue;

                if (this.titleElement){
                    this.titleElement.textContent = this.title;
                }
            }

            for (let i=0; i<this.attributes.length; i++){
                const attr = this.attributes[i];
                if (attr.name !=='title' ){
                    this.audio.setAttribute(attr.name,attr.value);

                }
            }

            if (!this.initailized){
                this.initializeAudio();
            }
        }

        initializeAudio(){
            if (this.initalized) return;

            this.initailized = true;
            this.volumeBar.value = 0.4;

            this.audidCtx = new AudioContext();

            this.track = this.audidCtx.createMediaElementSource(this.audio);
            this.gainNode = this.audidCtx.createGain(); 

            /* Frequency Visualisation */
            this.analyzerNode = this.audidCtx.createAnalyser();
            this.analyzerNode.fftSize = 2048;
            this.bufferLength = this.analyzerNode.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.analyzerNode.getByteFrequencyData(this.dataArray);

            this.track
                .connect(this.gainNode)
                .connect(this.analyzerNode)
                .connect(this.audidCtx.destination);
            
            this.changeVolume();
            this.attachEvents();
            
        }
        
        updateFrequency(){
            if (!this.playing) return;

            this.analyzerNode.getByteFrequencyData(this.dataArray);
            
            this.canvasCtx.clearRect(0,0,this.canvas.width,this.canvas.height);
            this.canvasCtx.fillStyle = 'rgba(0,0,0,0)';
            this.canvasCtx.fillRect(0,0,this.canvas.width,this.canvas.height);

            const barWidth = 3;
            const gap = 2;
            const barCount = this.bufferLength / ((barWidth +gap)-gap);
            let x = 0;

            for (let i = 0; i< barCount ; i++){
                const perc = (this.dataArray[i]*100)/255;
                const h = (perc*this.canvas.height)/100;

                this.canvasCtx.fillStyle = `rgba(${this.dataArray[i]},200, 50,1)`;
                this.canvasCtx.fillRect(x,this.canvas.height-h,barWidth, h);
                x += barWidth + gap;
            }

            requestAnimationFrame(this.updateFrequency.bind(this));
        }
        

        attachEvents(){
            this.playPauseBtn.addEventListener('click', this.togglePlay.bind(this),false);
            this.volumeBar.addEventListener('input', this.changeVolume.bind(this),false);
            this.progressBar.addEventListener('input', ()=>{
                this.seekTo(this.progressBar.value);
            },false);
            

            this.audio.addEventListener('loadedmetadata', ()=>{
                this.duration = this.audio.duration;
                this.progressBar.max = this.duration;

                const secs = parseInt( `${this.duration % 60}`, 10);
                const mins = parseInt( `${(this.duration/60) % 60}`,10);

                this.durationEl.textContent = `${mins}:${secs}`;
                
                

            })
            
            this.audio.addEventListener('timeupdate', ()=>{
                this.updateAudioTime(this.audio.currentTime);
            }
            )

            this.audio.addEventListener('ended', () => {
                this.playing = false;
                this.playPauseBtn.textContent = 'play';
            })
        }

        async togglePlay(){
            if (this.audidCtx.state === 'suspended'){
                this.audidCtx.resume();
            }

            if (this.playing){
                await this.audio.pause();
                this.playing=false;
                this.playPauseBtn.text='play';
                this.playPauseBtn.classList.remove('playing');
            } else{
                await this.audio.play();
                this.playing = true;
                this.playPauseBtn.textContent = 'pause';
                this.playPauseBtn.classList.add('playing');
                this.updateFrequency();

            }
        }

        seekTo(value){
            this.audio.currentTime = value;
        }
        updateAudioTime(time){
            this.currentTime= time;
            this.progressBar.value = this.currentTime;

            const secs = `${parseInt( `${time % 60}`, 10)}`.padStart(2,'0');
            const mins = parseInt( `${(time/60) % 60}`,10);

            this.currentTimeEl.textContent = `${mins}:${secs}`;
        }

        changeVolume(){
            this.volume = this.volumeBar.value;

            if (Number(this.volume) > 1){
                this.volumeBar.parentNode.className = 'volume-bar over';
            } else if(Number(this.volume) >0){
                this.volumeBar.parentNode.className = 'volume-bar half';
            } else {
                this.volumeBar.parentNode.className = 'volume-bar';
            }

            this.gainNode.gain.value = this.volume;
        }

    style() {
      return `
      <style>
        :host {
          width: 100%;
          max-width: 600px;
          
        }
        
        * {
            box-sizing: border-box;
        }
        
        .audio-player {
          background: #3d348b;
          border-radius: 5px;
          padding: 5px;
          color: #fff;
          display: flex;
          align-items: center;
          position: relative;
          margin: 0 0 40px;
          margin-top:60px

  
        }
        
        .audio-name {
             position: absolute;
            color: #fff;
            padding: 5px 10px;
            font-size: 1.4vw;
            width: 100%;
            left: 0;
            z-index: 2;
            text-transform: capitalize;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            font-weight: 400;
            top: -2.5vw;
            background: #3d348b;
            margin: 0;
            font-family: super_kindlyregular;
            border-radius: 5px;
        }
        
        .play-btn {
            width: 30px;
            min-width: 25px;
            height: 30px;
            background: url("Buttons.png") 0 center/500% 100% no-repeat;
            appearance: none;
            border: none;
            text-indent: -999999px;
            overflow: hidden;
            margin: 5px;
        }
        
        .play-btn.playing {
            background: url("Buttons.png") 25% center/500% 100% no-repeat;
        }
        
        .volume-bar {
            width: 30px;
            min-width: 30px;
            height: 30px;
            background: url("Buttons.png") 50% center/500% 100% no-repeat;
            position: relative;
        }
        
        .volume-bar.half {
            background: url("Buttons.png") 75% center/500% 100% no-repeat;
        }
        .volume-bar.over {
            background: url("Buttons.png") 100% center/500% 100% no-repeat;
        }
        
        .volume-field {
            display: none;
            position: absolute;
            appearance: none;
            height: 100px;
            width: 30px;
            right: 25%;
            top: calc(-100% - 20px );
            transform: translateY(-50%) rotate(180deg);
            z-index: 5;
            margin: 0;
            border-radius: 2px;
            background: #ffffff;
            writing-mode: vertical-lr;
        }
        
        .volume-field::-webkit-slider-thumb {
            
            appearance: none;
            height: 10px;
            width: 20px;
            background: #6d78ff;
        }
        
        .volume-field::-moz-range-thumb {
            appearance: none;
            height: 10px;
            width: 20px;
            background: #6d78ff
        }
        
        .volume-field::-ms-thumb  {
            appearance: none;
            height: 10px;
            width: 20px;
            background: #6d78ff
        }
        
        .volume-bar:hover .volume-field {
            display: block;
        }
        
        .progress-indicator {
            display: flex;
            justify-content: flex-end;
            position: relative;
            flex: 1;
            font-size: 12px;
            align-items: center;
            height: 20px;
        }
        
        .progress-bar {
            flex: 1;
            position: absolute;
            top: 50%;
            left: 0;
            z-index: 2;
            transform: translateY(-50%);
            width: 100%;
            appearance: none;
            margin: 0;
            overflow: hidden;
            background: none;
        }
        
        .progress-bar::-webkit-slider-thumb {
            appearance: none;
            height: 35px;
            width: 0;
            box-shadow: -600px 0 0 600px #ffffff38;
        }
        
        .progress-bar::-moz-range-thumb {
            appearance: none;
            height: 35px;
            width: 0;
            box-shadow: -600px 0 0 600px #ffffff21;
        }
        
        .progress-bar::-ms-thumb {
            appearance: none;
            height: 35px;
            width: 0;
            box-shadow: -600px 0 0 600px #ffffff21;
        }
        
        .duration,
        .current-time {
            position: relative;
            z-index: 1;
            text-shadow: 0 0 2px #111;
        }
        
        .duration {
            margin-left: 2px;
            margin-right: 5px;
        }
        
        .duration::before {
            content: '/';
            display: inline-block;
            margin-right: 2px;
        }
        
        canvas {
            position: absolute;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            opacity: 0.7;
        }

        @media only screen and (max-width: 600px) {
           .audio-name {

            font-size: 1.8vh;

            top: -4vh;

            border-radius: 5px;
        }
        }
      </style>
    `;
    }



        render(){
            this.shadowRoot.innerHTML = `
            ${this.style()}
            <figure class="audio-player">
                <figcaption class="audio-name">${this.title}</figcaption>
                <audio style="display: none"></audio>
                <button class="play-btn" type="button">play</button>
                <div class="progress-indicator">
                    
                    
                    <span class="current-time">0:00</span>
                    <input type="range" max="100" value="0" class="progress-bar">
                    <span class="duration">0:00</span>
                    <canvas style="width: 100% ; height: 35px"></canvas>
                    
                </div>
                <div class="volume-bar">
                    <input type="range" min="0" max="2" step="0.01" value="${this.volume}" class="volume-field"
                </div>
            </figure>
            `;
            this.audio = this.shadowRoot.querySelector('audio');
            this.canvas = this.shadowRoot.querySelector('canvas');
            this.playPauseBtn = this.shadowRoot.querySelector('.play-btn');
            this.titleElement = this.shadowRoot.querySelector('.audio-name');
            this.volumeBar = this.shadowRoot.querySelector('.volume-field');
            
            this.progressIndicator = this.shadowRoot.querySelector('.progress-indicator');


            this.currentTimeEl = this.progressIndicator.children[0];
            this.progressBar = this.progressIndicator.children[1];
            this.durationEl = this.progressIndicator.children[2];

            this.canvasCtx = this.canvas.getContext('2d');

            
        }
    }

    customElements.define('audio-player',AudioPlayer)

}
