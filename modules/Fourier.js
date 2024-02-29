window.Fourier = function(){

	let colors = ['red','orange','yellow','green','blue','pink','purple'];
	let range = 32;
	let fft;
	let meter;

	let self = this;
	self.$el = $('<fourier>');

	for(var i=0; i<range; i++){
		$('<fourier-c>').appendTo(this.$el).css({height:1+'%'});
	}

	
	sampleRate = Tone.getContext().sampleRate;
	meter = new Tone.Meter();
	fft = new Tone.FFT(range);

	mic.connect(meter).connect(fft);
	beginMonitoring();
	

	function beginMonitoring(){
		setInterval(pulse, 100);
	}

	function pulse(){

		let freqs = fft.getValue();
		self.$el.find('fourier-c').each(function(n){
			let amt = (128+freqs[n])/128;
			$(this).height(amt*100+'%').attr('bg',colors[Math.floor(amt*colors.length)]);
		})

	}
	
}