window.MelodyMatch = function( nLaunchpad, callbackComplete, nPuzzle ){

	if( !window.meter ) window.setupTone();

	const OCTAVE = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'];
	const LOW = 'F3';
	const RANGE = 8;	// how many notes are we supporting
	const INTERVAL = 2;  // interval between each suppored note


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


	const FPS = 20;

	let self = this;
	let colors = ['transparent','green','blue','pink','yellow'];

	const BEATS = 8;

	const LEVELS = [
		[-1,-1,4,4,6,6,-1,-1],
		[-1,-1,6,6,5,4,-1,-1],
		[-1,-1,4,6,6,4,-1,-1],
	]
	

	self.$el = $('<melodymatch>');
	let iLevel = nPuzzle%LEVELS.length;
	let level = LEVELS[iLevel];
	if(!level) level = [];
	let $pcs = [];
	for(var i=0; i<BEATS; i++){

		$pcs[i] = $(`<pitch-c>
			<pitch-fill></pitch-fill>
			<pitch-goal></pitch-goal>
			</pitch-c>`).appendTo(this.$el);


		$pcs[i].find('pitch-goal').css('bottom',level[i]/(RANGE)*100+'%');

		if(level[i]==-1) $pcs[i].find('pitch-goal').css('opacity',0);
	}

	let $frame = $(`<toyframe>
			<toycorner></toycorner>
			<toycorner></toycorner>
			<toycorner></toycorner>
			<toycorner></toycorner>
		</toyframe>`).appendTo(self.$el);

	let nBeat = -2;
	let nBeatWas = -1;
	let nPulse = 0;
	let history = [];
	let corrects = [];
	let pulses = [];
	let isGameComplete = false;

	while(history.length<BEATS) history.push(0);
	while(pulses.length<BEATS*FPS) pulses.push(0);


	let iFreqMax = 0;

	function pulse(){

		

		nPulse++;

		nBeat = Math.floor( nPulse/FPS ) % history.length;

		if(nBeat != nBeatWas){ //changed beat
			
			audio.play('blip',true);

			//check to see if we finished in the right place
			if(nBeatWas>-1 && history[nBeatWas] == level[nBeatWas]){
				corrects[nBeat] = true;
				let amt = level[nBeatWas]/RANGE;
				$pcs[nBeatWas].find('pitch-fill').css({ height:amt*100+'%' }).attr('bg','yellow');
				
			}


			if(nBeat==0){
				//reset
				for( var h in history){
					history[h] = -1;
					corrects[h] = false;
					self.$el.find('pitch-fill').css('height',0);
				}
			} else if( nBeat == BEATS-1){
				//cycle complete. test complete.

				isGameComplete = true;
				for( var h in history){
					if(level[h] != -1 && history[h] != level[h]) isGameComplete = false;
				}


				self.$el.find('pitch-fill').attr('bg',isGameComplete?'green':'red');

				if(isGameComplete){
					audio.play('correct',true);
					self.$el.find('pitch-fill').first().css('height',0);
					self.$el.find('pitch-fill').last().css('height',0);
					self.turnOnOff(false);

					setTimeout(function(){
						window.launchpad.clear( nLaunchpad );
						window.launchpad.commit( nLaunchpad );
						if( callbackComplete ) callbackComplete();
					},500)

					
				} else {
					
				}
			}

			nCorrect = 0;

			self.$el.find('pitch-c').removeClass('active');
			$pcs[nBeat%history.length].addClass('active');

			nBeatWas = nBeat;
		}


		let wave = window.waveform.getValue();
		let freq = yin(wave,window.sampleRate);
		
		let nNoteFromA0 = 12 * Math.log2(freq / 440) + 69;
		let nNote = (nNoteFromA0 - iLow)/INTERVAL;
		let nNoteRound = Math.round(nNote);

		if(nNoteRound == level[nBeat]) nCorrect++;
		let bCorrect = (nCorrect>5);
		if(bCorrect) nNote = nNoteRound = level[nBeat];

		history[nBeat] = nNoteRound;
		corrects[nBeat] = bCorrect;
		let amt = nNote/RANGE;
		$pcs[nBeat].find('pitch-fill').css({ height:amt*100+'%' }).attr('bg',bCorrect?'yellow':'blue');

		
		redrawLaunchpad();
	}

	function redrawLaunchpad(){

		// code here is a bit janky because of the double thickness grid
		// but I'm at peace with that

		window.launchpad.clear( nLaunchpad );

		
		for(var y=0; y<8; y++){
			let yTarget = level[nBeat];
			window.launchpad.setXY( nLaunchpad, nBeat, y, 'white', 0.5);
		}
		

		for( var iBeat=0; iBeat<BEATS; iBeat++ ){
			let x = iBeat;
			let isBeatCorrect = corrects[iBeat];
			let yHeight = history[iBeat];
			for(var iHeight=0; iHeight<yHeight; iHeight++){
				let y = (8-iHeight-1);

				let color = isBeatCorrect?'yellow':'blue';
				if(nBeat==BEATS-1) color = isGameComplete?'green':'red';

				window.launchpad.setXY( nLaunchpad, x, y, color, 1);
			}

			let yTarget = (8-level[iBeat]-1);
			window.launchpad.setXY( nLaunchpad, x, yTarget, 'white', 1);
		}

		window.launchpad.commit( nLaunchpad );
	}

	let interval;
	self.turnOnOff = function(b){

		if(b){
			interval = setInterval(pulse, 1000/FPS);
		} else {
			clearInterval(interval);
		}
	}

	if(nPuzzle != undefined) self.turnOnOff(true);
	
}