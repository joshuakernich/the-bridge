window.Sequencer = async function(){

	await Tone.start()

	let meter = new Tone.Meter();
	window.mic = new Tone.UserMedia().connect(meter);

	mic.open().then(() => {
		console.log("mic open");
		
	}).catch(e => {
		console.log("mic not open",e);
	});

	window.synth = new Tone.Synth().toDestination();
	synth.envelope.attack = 0.05;
	synth.envelope.release = 0.5;
		
	
	const pitchLibrary = ['D3','E3','G3','A3','C4','D4','E4','G4','A4'];
	const timePerBeat = 0.5;

	const self = this;
	self.$el = $('<seq>');

	let isOn = false;

	self.turnOnOff = function(b){
		isOn = b;

		/*if(b && !synth){
			synth = new Tone.Synth().toDestination();
			synth.envelope.attack = 0.1;
			synth.envelope.release = 1;
		}*/
	}

	for(var r = 0; r < 8; r++){
		let $r = $('<seq-r>').appendTo(self.$el);
		for(var c = 0; c < 8; c++){
			 $('<seq-c>').appendTo($r).attr('c',c).attr('r',r);

			
		}
	}

	let $svg = $(`<svg preserveAspectRatio=none height=800% width=100% viewBox='-1.5 0 3 8'><path vector-effect='non-scaling-stroke' d='M-1,0 L2,32'/></svg>`);

	$svg.find('path').attr('d','M0,0 L0,8');

	function redrawLaunchpad(){
		//Paint all of it
		for(var r=0; r<8; r++){
			for(var c=0; c<8; c++){
				window.launchpad.setXY(c,r,map[c]==r?'blue':(cBeat==c?'yellow':'off'));
			}
		}
	}

	let fps = 30;
	let map = [];
	let nBeat = -1;
	let cBeat;
	let intensity = 1;
	function step(){
		if(!isOn) return;
		nBeat++;
		cBeat = nBeat%8;
		intensity = 0.5;
		self.$el.find('seq-c').removeAttr('bg');
		//self.$el.find('seq-c:nth-of-type('+(1+cBeat)+')').attr('bg','yellow');

		$svg.appendTo(self.$el.find(`seq-c[c=${cBeat}]`).last());

		redrawLaunchpad();

		let pitch = pitchLibrary[ 8-map[nBeat%8]]
		if(pitch) synth.triggerAttackRelease(pitch, 0.5);
	}

	let nTick = 0;
	function tick(){
		let d = '';

		intensity *= 0.9;
		
		nTick++;
		

		let m = intensity;
		for(var i=0; i<8; i+= 0.05){

			let iFloor = Math.floor(i);

			let m = (map[cBeat]==iFloor)?6:2;
			let int = (map[cBeat]==iFloor)?1:intensity;

			d += (i==0?'M':'L')+(Math.sin((i-(nTick/fps))*Math.PI*m)*int)+','+i+' ';
		}

		
		$svg.find('path').attr('d',d);
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

	window.launchpad.listen(function(x,y){
		if(!isOn) return;
		self.$el.find('seq-c[c='+x+'][r='+y+']').click();
	})

	setInterval(step,timePerBeat*1000);

	
	setInterval(tick,1000/fps);
}