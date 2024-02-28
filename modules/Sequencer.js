window.Sequencer = function(){

	const synth = new Tone.Synth().toDestination();
	synth.envelope.attack = 0.1;
	synth.envelope.release = 1;

	const pitchLibrary = ['C2','D2','E2','G2','A2','C3','D3','E3','G3','A3','C4','D4','E4','G4','A4','C5','D5','E5','G5'];
	const timePerBeat = 0.5;

	const self = this;
	self.$el = $('<seq>');

	for(var r = 0; r < 8; r++){
		let $r = $('<seq-r>').appendTo(self.$el);
		for(var c = 0; c < 8; c++){
			$('<seq-c>').appendTo($r).attr('c',c).attr('r',r);
		}
	}


	let map = [];
	let nBeat = -1;
	function tick(){
		nBeat++;
		self.$el.find('seq-c').attr('bg','purple');
		self.$el.find('seq-c:nth-of-type('+(1+nBeat%8)+')').attr('bg','yellow');

		let pitch = pitchLibrary[ 6 + 8-map[nBeat%8]]

		if(pitch) synth.triggerAttackRelease(pitch, 0.5);
	}

	self.$el.find('seq-c').click(function(){

		let r = $(this).attr('r');
		let c = $(this).attr('c');
		let b = $(this).hasClass('selected');

		self.$el.find('seq-c[c='+c+']').removeClass('selected');
		if(!b) $(this).addClass('selected');

		map[c] = b?undefined:r;
	})

	setInterval(tick,timePerBeat*1000);
	
}