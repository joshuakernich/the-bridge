window.PitchRecorder = function(){

	let self = this;
	let colors = ['red','orange','yellow','green','blue','pink','purple'];

	let range = 32;
	

	let low = 'D3';
	let high = 'A4';

	let chart = [];

	let isInRange = false;
	for(var f in FREQ){
		if(f==low) isInRange = true;
		if(isInRange) chart.push({name:f,freq:FREQ[f]});
		if(f==high) isInRange = false;
	}

	self.$el = $('<fourier>');

	for(var i=0; i<range; i++){
		$('<fourier-c>').appendTo(this.$el).css({height:'1%'});
	}

	let sampleRate = Tone.getContext().sampleRate;
	let meter = new Tone.Meter();
	let waveform = new Tone.Waveform();
	mic.connect(meter).connect(waveform);
	beginMonitoring();

	function beginMonitoring(){
		setInterval(pulse, 100);
	}

	let nPulse = 0;
	let history = [];
	function pulse(){

		let wave = waveform.getValue();
		let freq = yin(wave,sampleRate);

		let min = 9999;
		let iFreq = 0;
		while(iFreq<chart.length-1 && freq > (chart[iFreq].freq + chart[iFreq+1].freq)/2) iFreq++;

		if(!history.length) history.push(iFreq);

		nPulse++;
		if(nPulse%5==4){
			history.push(iFreq);
			while(history.length>30) history.shift();
		}

		history[history.length-1] = iFreq;

		self.$el.find('fourier-c').each(function(n){
			let amt = (history[n]/chart.length);
			$(this).height(amt*100+'%').attr('bg',colors[Math.floor(amt*colors.length)]);
		})

	}
	
}