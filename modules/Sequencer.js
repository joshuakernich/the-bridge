window.Sequencer = function(){

	const synth = new Tone.Synth().toDestination();
	synth.envelope.attack = 0.1;
	synth.envelope.release = 1;

	const pitchLibrary = ['D3','E3','G3','A3','C4','D4','E4','G4','A4'];
	const timePerBeat = 0.5;

	const self = this;
	self.$el = $('<seq>');

	for(var r = 0; r < 8; r++){
		let $r = $('<seq-r>').appendTo(self.$el);
		for(var c = 0; c < 8; c++){
			$('<seq-c>').appendTo($r).attr('c',c).attr('r',r);
		}
	}

	function redrawLaunchpad(){
		//Paint all of it
		for(var r=0; r<8; r++){
			for(var c=0; c<8; c++){
				window.launchpad.set(''+c+''+r,map[c]==r?'green':(cBeat==c?'orange':'off'));
			}
		}
	}


	let map = [];
	let nBeat = -1;
	let cBeat;
	function tick(){
		nBeat++;
		cBeat = nBeat%8;
		self.$el.find('seq-c').attr('bg','purple');
		self.$el.find('seq-c:nth-of-type('+(1+cBeat)+')').attr('bg','yellow');

		redrawLaunchpad();

		let pitch = pitchLibrary[ 8-map[nBeat%8]]
		if(pitch) synth.triggerAttackRelease(pitch, 0.5);
	}

	self.$el.find('seq-c').click(function(){

		let r = $(this).attr('r');
		let c = $(this).attr('c');
		let b = $(this).hasClass('selected');

		self.$el.find('seq-c[c='+c+']').removeClass('selected');
		if(!b) $(this).addClass('selected');

		map[c] = b?undefined:r;

		redrawLaunchpad();
	})

	window.launchpad.listen(function(coord){
		self.$el.find('seq-c[c='+coord[0]+'][r='+coord[1]+']').click();
	})

	setInterval(tick,timePerBeat*1000);
	
}