window.PitchRecorder = function(){

	let self = this;
	let colors = ['green','blue','purple','pink','red','orange','yellow','white'];

	let range = 8;
	
	

	let low = 'D3';

	let chart = [];
	let SKIP = 1;
	let nSkip = 0;
	let isInRange = false;
	for(var f in FREQ){
		if(f==low) isInRange = true;
		if(isInRange && !nSkip--){
			chart.push({name:f,freq:FREQ[f]});
			nSkip = SKIP;
		}
	}

	chart.length = range;

	self.$el = $('<pitchrecorder>');
	let $pc;
	for(var i=0; i<range; i++){

		$pc = $(`<pitch-c>
			<pitch-fill></pitch-fill>
			</pitch-c>`).appendTo(this.$el);
	}

	$pc.addClass('live');

	let sampleRate;
	let meter;
	let waveform;

	let nPulse = 0;
	let history = [];
	while(history.length<range) history.push(0);
	function pulse(){

		let wave = waveform.getValue();
		let freq = yin(wave,sampleRate);

		let min = 9999;
		let iFreq = 0;
		while(iFreq<chart.length-1 && freq > (chart[iFreq].freq + chart[iFreq+1].freq)/2) iFreq++;

		
		if(iFreq>chart.length) iFreq = chart.length;

		if(!history.length) history.push(iFreq);

		

		nPulse++;
		if(nPulse%5==4){
			history.push(iFreq);
			while(history.length>range) history.shift();
		}

		history[history.length-1] = iFreq;

		self.$el.find('pitch-c pitch-fill').each(function(n){
			let amt = (history[n]+1)/chart.length;

			$(this).css({'height':amt*100+'%'}).attr('bg',colors[history[n]]);
		})

	}

	let interval;
	self.turnOnOff = function(b){

		if(b && !meter)
			sampleRate = Tone.getContext().sampleRate;
			meter = new Tone.Meter();
			waveform = new Tone.Waveform();
		if(b){
			window.mic.connect(meter).connect(waveform);
			interval = setInterval(pulse, 200);
		} else {
			clearInterval(interval);
		}
	}
	
}