window.AudioMash = function( $ui ){

	
	let meter;
	let waveform;
	let fft;
	let range = 32;
	let sampleRate;

	let low = 'C3';
	let high = 'C5';

	let chart = [];

	let isInRange = false;
	for(var f in FREQ){
		if(f==low) isInRange = true;
		if(isInRange) chart.push({name:f,freq:FREQ[f]});
		if(f==high) isInRange = false;
	}


	for(var i=0; i<range; i++){
		$('<waveformbit>').appendTo('waveform').css({height:i/range*100+'%'});
	}

	for(var i=0; i<30; i++){
		$('<singstarbit>').appendTo('singstar').css({height:'1px'});
	}

	$('[module=audiomash]').show();
	
	$('[id=tonify]').on('mousedown',async function(){

		await Tone.start()

		sampleRate = Tone.getContext().sampleRate;

		meter = new Tone.Meter();
		waveform = new Tone.Waveform();
		fft = new Tone.FFT(range);

		const mic = new Tone.UserMedia().connect(meter).connect(waveform).connect(fft);


		mic.open().then(() => {
			// promise resolves when input is available
			console.log("mic open");
			// print the incoming mic levels in decibels
			beginMonitoring();
			
		}).catch(e => {
			// promise is rejected when the user doesn't have or allow mic access
			console.log("mic not open");
		});
	});

	$('[id=hold-to-record]').on('mousedown',onDown);
	$('[id=hold-to-record]').on('mouseup',onUp);


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
	
		let freqs = fft.getValue();
		$('waveformbit').each(function(n){
			$(this).height((128+freqs[n])/128*100+'%');
		})

		history[history.length-1] = iFreq;

		nPulse++;
		if(nPulse%5==4){
			history.push(iFreq);
			while(history.length>30) history.shift();
		}

		$('singstarbit').each(function(n){
			$(this).height((history[n]/chart.length)*100+'%');
		})
	}

	function onDown() {
	
	
		
	}

	function onUp() {
		
	}
	
}