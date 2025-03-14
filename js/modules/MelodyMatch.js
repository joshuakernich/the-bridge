window.MelodyMatch = function(){

	const OCTAVE = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'];
	const LOW = 'C4';
	const RANGE = 4;	// how many notes are we supporting
	const INTERVAL = 3  // interval between each suppored note


	function getNoteIndex(name){
		let note = name.substr(0,name.length-1);
		let oct = parseInt( name[name.length-1] );
		return OCTAVE.length*(oct)+OCTAVE.indexOf(note);
	}

	const iLow = getNoteIndex(LOW);
	const iHigh = iLow + RANGE * INTERVAL;


	const audio = new AudioContext();
	audio.add('blip','./audio/sfx-blip.mp3', 0.2);
	audio.add('error','./audio/sfx-error.mp3');
	audio.add('correct','./audio/sfx-correct.mp3');
	audio.add('powerup','./audio/sfx-powerup.mp3', 1);
	audio.add('good','./audio/sfx-good.mp3', 1);

	async function setupTone(){
		await Tone.start()

		let meter = new Tone.Meter();
		window.mic = new Tone.UserMedia().connect(meter);

		mic.open().then(() => {
			console.log("mic open");
			self.turnOnOff(true);
			
		}).catch(e => {
			console.log("mic not open",e);
		});


	}
	
	setupTone();


	const FPS = 20;

	let self = this;
	let colors = ['transparent','green','blue','pink','yellow'];

	const BEATS = 6;

	const LEVELS = [
		[-1,2,1,3,4,-1]
	]
	

	self.$el = $('<melodymatch>');
	let iLevel = 0;
	let level = LEVELS[iLevel];
	let $pcs = [];
	for(var i=0; i<BEATS; i++){

		$pcs[i] = $(`<pitch-c>
			<pitch-fill></pitch-fill>
			<pitch-goal></pitch-goal>
			</pitch-c>`).appendTo(this.$el);


		$pcs[i].find('pitch-goal').css('height',level[i]/(RANGE)*100+'%');

		if(level[i]==-1) $pcs[i].find('pitch-goal').css('opacity',0);
	}

	let $frame = $(`<toyframe>
			<toycorner></toycorner>
			<toycorner></toycorner>
			<toycorner></toycorner>
			<toycorner></toycorner>
		</toyframe>`).appendTo(self.$el);


	let sampleRate;
	let meter;
	let waveform;

	let nBeatWas = -1;
	let nPulse = 0;
	let history = [];
	let pulses = [];

	while(history.length<BEATS) history.push(0);
	while(pulses.length<BEATS*FPS) pulses.push(0);


	let iFreqMax = 0;

	function pulse(){

		nPulse++;

		let nBeat = Math.floor( nPulse/FPS ) % history.length;

		if(nBeat != nBeatWas){ //changed beat
			
			audio.play('blip',true);

			//check to see if we finished in the right place
			if(nBeatWas>-1 && history[nBeatWas] == level[nBeatWas]){
				let amt = level[nBeatWas]/RANGE;
				$pcs[nBeatWas].find('pitch-fill').css({ height:amt*100+'%' }).attr('bg','yellow');
				
			}


			if(nBeat==0){
				//reset
				for( var h in history){
					history[h] = -1;
					self.$el.find('pitch-fill').css('height',0);
				}
			} else if( nBeat == BEATS-1){
				//cycle complete. test complete.

				let isComplete = true;
				for( var h in history){
					if(level[h] != -1 && history[h] != level[h]) isComplete = false;
				}
				self.$el.find('pitch-fill').attr('bg',isComplete?'green':'red');

				if(isComplete){
					audio.play('correct',true);
					self.$el.find('pitch-fill').first().css('height',0);
					self.$el.find('pitch-fill').last().css('height',0);
					self.turnOnOff(false);
					if( self.callbackComplete ) self.callbackComplete();
				} else {
					
				}
			}

			nCorrect = 0;

			self.$el.find('pitch-c').removeClass('active');
			$pcs[nBeat%history.length].addClass('active');

			nBeatWas = nBeat;
		}


		let wave = waveform.getValue();
		let freq = yin(wave,sampleRate);
		
		let nNoteFromA0 = 12 * Math.log2(freq / 440) + 69;
		let nNote = (nNoteFromA0 - iLow)/INTERVAL;
		let nNoteRound = Math.round(nNote);

		if(nNoteRound == level[nBeat]) nCorrect++;
		let bCorrect = (nCorrect>5);
		if(bCorrect) nNote = nNoteRound = level[nBeat];

		history[nBeat] = nNoteRound;
		let amt = nNote/RANGE;
		$pcs[nBeat].find('pitch-fill').css({ height:amt*100+'%' }).attr('bg',bCorrect?'yellow':'blue');

		

	}

	let interval;
	self.turnOnOff = function(b){

		if(b && !meter)
			sampleRate = Tone.getContext().sampleRate;
			meter = new Tone.Meter();
			waveform = new Tone.Waveform();
		if(b){
			window.mic.connect(meter).connect(waveform);
			interval = setInterval(pulse, 1000/FPS);
		} else {
			clearInterval(interval);
		}
	}

	
	
}