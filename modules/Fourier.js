window.Fourier = function(){

	let colors = ['red','orange','yellow','green','blue','pink','purple'];
	let range = 32;
	let fft;
	let meter;

	let self = this;
	self.$el = $('<fourier>').addClass('disabled');

	for(var i=0; i<range; i++){
		$('<fourier-c>').appendTo(this.$el).css({height:1+'%'});
	}

	this.$el.on('mousedown',async function(){

		await Tone.start()

		sampleRate = Tone.getContext().sampleRate;

		meter = new Tone.Meter();
		fft = new Tone.FFT(range);

		const mic = new Tone.UserMedia().connect(meter).connect(fft);


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

	function pulse(){

		let freqs = fft.getValue();
		$('fourier-c').each(function(n){
			let amt = (128+freqs[n])/128;
			$(this).height(amt*100+'%').attr('bg',colors[Math.floor(amt*colors.length)]);
		})

	}
	
}