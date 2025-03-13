window.MelodyMatch = function(){


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
		[-1,1,2,3,4,-1]
	]
	

	let low = 'D3';

	let chart = [];
	let EVERY_NTH_NOTE = 3;
	let nSkip = 0;
	let isInRange = false;
	for(var f in FREQ){
		if(f==low) isInRange = true;
		if(isInRange && !nSkip--){
			chart.push({name:f,freq:FREQ[f]});
			nSkip = EVERY_NTH_NOTE;
		}
	}

	const FREQMIN = chart[0].freq;
	const FREQMAX = chart[chart.length-1].freq;
	const FREQRANGE = FREQMAX - FREQMIN;



	chart.length = colors.length;

	self.$el = $('<melodymatch>');
	let $pcs = [];
	for(var i=0; i<BEATS; i++){

		$pcs[i] = $(`<pitch-c>
			<pitch-fill></pitch-fill>
			<pitch-goal></pitch-goal>
			</pitch-c>`).appendTo(this.$el);



		$pcs[i].find('pitch-goal').css('height',LEVELS[0][i]/chart.length*100+'%');
	}

	let $svg = $(`<svg viewBox='0 0 100 100' preserveAspectRatio='none'>
			<path fill='none' stroke='var( --yellow )' d='M 0,100 L 100,0'/>
		</svg>
		`).appendTo(self.$el).css({position:'absolute',top:0,left:0, width:12*40, height:8*40, marginTop:80 });

	let $path = $svg.find('path');

	let $frame = $(`<toyframe>
			<toycorner></toycorner>
			<toycorner></toycorner>
			<toycorner></toycorner>
			<toycorner></toycorner>
		</toyframe>`).appendTo(self.$el);

	//$pc.addClass('live');

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

		if(nBeat != nBeatWas){
			nBeatWas = nBeat;
			iFreqMax = 0;

			self.$el.find('pitch-c').removeClass('active');
			$pcs[nBeat%history.length].addClass('active');
		}


		let wave = waveform.getValue();
		let freq = yin(wave,sampleRate);

		//console.log(FREQMIN, freq, FREQMAX);

		let min = 9999;
		let iFreq = 0;
		while(iFreq<chart.length-1 && freq > (chart[iFreq].freq + chart[iFreq+1].freq)/2) iFreq++;

		//if(iFreq>chart.length) iFreq = chart.length;


		
		//console.log(iFreq);

		if(iFreq > iFreqMax) iFreqMax = iFreq;
		
		history[nBeat] = iFreqMax;

		// need to quantize this
		pulses[nPulse%pulses.length] = freq;


		let amt = history[nBeat]/(chart.length-1);

		$pcs[nBeat].find('pitch-fill').css({ height:amt*100+'%' }).attr('bg',colors[history[nBeat]]);

		let d = '';
		for(var i=0; i<pulses.length; i++){

			let f = pulses[i];


			let iy = -1;
			for(var n=0; n<chart.length; n++) if( f > chart[n].freq ) iy = n;

			let y = 0;

			if(iy>=0){

				let y = iy/(chart.length-1);

				let next = chart[iy+1]?chart[iy+1].freq:chart[iy].freq;
				let gap = next - chart[iy].freq;
				let extra = f - chart[iy].freq;

				let progress = extra/gap;

				y += progress;
			}






			/*let y = ( pulses[i] - FREQMIN ) / FREQRANGE;
		
			if( isNaN(y) || y <= 0 ) y = 0.1;

			console.log(y);*/
			
			d += (i==0?' M ':' L ') + (i) + ',' + (100-y*100);

		}

	

		$path.attr('d',d);
		
		/*if(nPulse%FPS==0){

			

			history.push(iFreq);
			while(history.length>range) history.shift();
		}*/

		//history[history.length-1] = iFreq;

		/*self.$el.find('pitch-c pitch-fill').each(function(n){
			let amt = (history[n]+1)/chart.length;
			$(this).css({'height':amt*100+'%'}).attr('bg',colors[history[n]]);
		})*/

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