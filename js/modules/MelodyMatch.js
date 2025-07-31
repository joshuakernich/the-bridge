window.MelodyMatch = function( nLaunchpad, callbackComplete, nPuzzle ){

	if( !window.meter ) window.setupTone();

	function noteToFrequency(note) {
		const noteRegex = /^([A-Ga-g])(#|b)?(\d+)$/;
		const match = note.match(noteRegex);
		if (!match) throw new Error("Invalid note format");

		const noteName = match[1].toUpperCase();
		const accidental = match[2] || "";
		const octave = parseInt(match[3], 10);

		// Map of note names to semitone offsets from C
		const semitoneMap = {
			'C': 0, 'C#': 1, 'Db': 1,
			'D': 2, 'D#': 3, 'Eb': 3,
			'E': 4,
			'F': 5, 'F#': 6, 'Gb': 6,
			'G': 7, 'G#': 8, 'Ab': 8,
			'A': 9, 'A#': 10, 'Bb': 10,
			'B': 11
		};

		const fullNote = noteName + accidental;
		const semitone = semitoneMap[fullNote];
		if (semitone === undefined) throw new Error("Invalid note");

		const midiNumber = (octave + 1) * 12 + semitone;
		const frequency = 440 * Math.pow(2, (midiNumber - 69) / 12);

		return frequency;
	}

	function frequencyToLogLinear(f) {
		if (f <= fLow) return 0;
		if (f >= fHigh) return 1;

		return (Math.log2(f) - Math.log2(fLow)) / (Math.log2(fHigh) - Math.log2(fLow));
	}

	let fLow = noteToFrequency('F2');
	let fHigh = noteToFrequency('F5')

	const audio = new AudioContext();
	audio.add('blip','./audio/sfx-blip.mp3', 0.2);
	audio.add('error','./audio/sfx-error.mp3');
	audio.add('correct','./audio/sfx-correct.mp3');
	audio.add('powerup','./audio/sfx-powerup.mp3', 1);
	audio.add('good','./audio/sfx-good.mp3', 1);


	const SECONDS = 10;
	const FPS = 20;
	const STEPS = SECONDS*FPS;
	const THRESHOLD = FPS/2;
	let self = this;

	const LEVELS = [
		[{at:0.4,note:'C4'},{at:0.6,note:'E4'}],
		[{at:0.3,note:'G3'},{at:0.5,note:'E4'},{at:0.7,note:'C4'}],
		[{at:0.25,note:'G3'},{at:0.4,note:'D4'},{at:0.55,note:'G3'},{at:0.7,note:'D4'}],
	]

	self.$el = $('<melodymatch>');

	



	let level = LEVELS[nPuzzle%LEVELS.length];
	let targetThresholds = [];
	let $targets = [];
	let $fills = [];

	for(var nTarget in level){

		let target = level[nTarget];
		target.freq = noteToFrequency(target.note);
		let p = frequencyToLogLinear(target.freq);

		targetThresholds[nTarget] = 0;

		$targets[nTarget] = $('<melodytarget>').appendTo(self.$el).css({
			'left':target.at * 100 + '%',
			'top':(1-p) * 100 + '%',
		})

		$fills[nTarget] = $('<melodyfill>').appendTo($targets[nTarget]);
	}

	let $svg = $(`
		<svg viewBox='0 0 1 1'>
			<path vector-effect='non-scaling-stroke'  d=''>
		</svg>`
		).appendTo(self.$el);
	let $path = $svg.find('path');

	let $tracer = $('<melodytracer>').appendTo(self.$el);
	let $recording = $('<melodyrecording>').appendTo(self.$el);

	let $frame = $(`<toyframe>
			<toycorner></toycorner>
			<toycorner></toycorner>
			<toycorner></toycorner>
			<toycorner></toycorner>
		</toyframe>`).appendTo(self.$el);

	let positionWas = 0;
	let nStep = -1;
	let history = [];

	

	function step(){

		nStep = (nStep + 1)%STEPS;

		if(nStep==0){


			history.length = 0;
			for(var i in targetThresholds){
				if( targetThresholds[i] ) targetThresholds[i]--;
				$targets[i].attr('complete','false');
			}
		}

		let wave = window.waveform.getValue();
		let freq = yin(wave,window.sampleRate);
		
		let position = isNaN(freq)?0:frequencyToLogLinear(freq);

		let positionLerp =  (positionWas * 10 + position)/11;

		if(positionLerp<0.05) positionLerp = 0.05;


		for(var nTarget in level){

			if(targetThresholds[nTarget]<THRESHOLD){

				let px = level[nTarget].at - nStep/STEPS;
				let py = frequencyToLogLinear(level[nTarget].freq) - positionLerp;
				let d = Math.sqrt(px*px + py*py);

				// 7% of range
				if(d<0.07){
					targetThresholds[nTarget]++;
				} else if(targetThresholds[nTarget] > 0){
					targetThresholds[nTarget]--;
				}

				$fills[nTarget].css({ 
					'width':targetThresholds[nTarget]/THRESHOLD * 100 + '%',
					'height':targetThresholds[nTarget]/THRESHOLD * 100 + '%',
				})

				if( targetThresholds[nTarget] == THRESHOLD ) $targets[nTarget].attr('complete','true');
			}
		}

		history[nStep] = positionLerp;
		positionWas = positionLerp;

		redraw();
	}

	function redraw(){

		$tracer.css({
			'left':nStep/STEPS*100 + '%',
			'top':(1-history[nStep]) * 100 + '%',
		})

		let d = '';

		for(var h in history){
			d += (h==0?' M':' L') + h/STEPS + ',' + (1-history[h]);
		}

		$path.attr('d',d);

		//check for completion
		let isComplete = true;
		for(var i in targetThresholds) if(targetThresholds[i] < THRESHOLD) isComplete = false;

		if(isComplete){
			self.turnOnOff(false);
			audio.play('correct',true);
			self.$el.attr('complete',true);
			setTimeout(callbackComplete,1000);
		}
	}

	function redrawLaunchpad(){
		window.launchpad.clear( nLaunchpad );
		window.launchpad.commit( nLaunchpad );
	}

	let interval;
	self.turnOnOff = function(b){

		if(b){
			interval = setInterval(step, 1000/FPS);
		} else {
			clearInterval(interval);
		}
	}

	if(nPuzzle != undefined) self.turnOnOff(true);
	
}