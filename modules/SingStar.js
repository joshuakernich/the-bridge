window.SingStar = function(){

	let self = this;
	let colors = ['red','orange','yellow','green','blue','pink','purple'];

	let range = 32;
	let waveform;
	let meter;

	let low = 'C3';
	let high = 'C5';

	let chart = [];

	let isInRange = false;
	for(var f in FREQ){
		if(f==low) isInRange = true;
		if(isInRange) chart.push({name:f,freq:FREQ[f]});
		if(f==high) isInRange = false;
	}

	self.$el = $('<fourier>').addClass('disabled');

	for(var i=0; i<range; i++){
		$('<fourier-c>').appendTo(this.$el).css({height:'1%'});
	}

	this.$el.on('mousedown',async function(){

		await Tone.start()

		sampleRate = Tone.getContext().sampleRate;

		meter = new Tone.Meter();
		waveform = new Tone.Waveform();

		const mic = new Tone.UserMedia().connect(meter).connect(waveform);


		mic.open().then(() => {
			self.$el.removeClass('disabled');
			// promise resolves when input is available
			console.log("mic open");
			// print the incoming mic levels in decibels
			beginMonitoring();
			
		}).catch(e => {
			// promise is rejected when the user doesn't have or allow mic access
			console.log("mic not open");
		});
	});

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
		while(freq > (chart[iFreq].freq + chart[iFreq+1].freq)/2) iFreq++;

		if(!history.length) history.push(iFreq);

		nPulse++;
		if(nPulse%5==4){
			history.push(iFreq);
			while(history.length>30) history.shift();
		}

		self.$el.find('fourier-c').each(function(n){
			let amt = (history[n]/chart.length);
			$(this).height(amt*100+'%').attr('bg',colors[Math.floor(amt*colors.length)]);
		})

	}
	
}