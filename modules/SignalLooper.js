window.SignalLooper = function(){

	const synth = new Tone.Synth().toDestination();
	synth.envelope.attack = 0.1;
	synth.envelope.release = 1;

	const pitchLibrary = ['D3','E3','G3','A3','C4','D4','E4','G4','A4'];
	const timePerBeat = 0.5;

	const self = this;
	self.$el = $('<seq class="looper">').css({overflow:'hidden'})

	let $inner = $('<div>').appendTo(self.$el).css({
		'transition':'all 0.5s',
		'transition-timing-function':'linear'
	});

	for(var r = 0; r < 8; r++){
		let $r = $('<seq-r>').appendTo($inner);
		for(var c = 0; c < 8; c++){
			$('<seq-c>').appendTo($r).attr('c',c).attr('r',r);
		}
	}

	
	self.$el.find('[c=1][r=0]').css({'opacity':0});
	self.$el.find('[c=0][r=1]').css({'opacity':0});

	self.$el.find('[c=0][r=7]').css({'opacity':0});
	self.$el.find('[c=1][r=7]').css({'opacity':0});
	self.$el.find('[c=0][r=6]').css({'opacity':0});

	self.$el.find('[c=7][r=7]').css({'opacity':0});
	self.$el.find('[c=6][r=7]').css({'opacity':0});
	self.$el.find('[c=7][r=6]').css({'opacity':0});

	self.$el.find('[c=7][r=0]').css({'opacity':0});
	self.$el.find('[c=6][r=0]').css({'opacity':0});
	self.$el.find('[c=7][r=1]').css({'opacity':0});

	self.$el.find('[c=3][r=3]').css({'opacity':0});
	self.$el.find('[c=3][r=4]').css({'opacity':0});
	self.$el.find('[c=4][r=3]').css({'opacity':0});
	self.$el.find('[c=4][r=4]').css({'opacity':0});


	self.$el.find('[c=0][r=0]').attr('bg','red');


	let nPad = [
		'30,31,32,40,41,42',
		'50,51,52,61,62,72',
		'53,63,73,54,64,74',
		'57,56,55,66,65,75',
		'35,36,37,45,46,47',
		'27,26,25,16,15,05',
		'03,13,23,04,14,24',
		'20,21,22,11,12,02',

	]

	let map = [];
	let nBeat = -1;
	function tick(){
		nBeat++;
		self.$el.find('seq-c').attr('bg','purple');
		self.$el.find('[c=0][r=0]').attr('bg','red');
		
		let n = nBeat%8;
		let cells = nPad[n]?nPad[n].split(','):[];
		for(var i in cells) self.$el.find('seq-c[c='+cells[i][0]+'][r='+cells[i][1]+']').attr('bg','yellow');
		
		
		if(map[n]) synth.triggerAttackRelease(pitchLibrary[0], 0.5);

		
		$inner.css({transform:'rotate(-'+nBeat/8*360+'deg)'})

	}

	self.$el.find('seq-c').on('mousedown',function(){

		let r = $(this).attr('r');
		let c = $(this).attr('c');
		let b = $(this).hasClass('selected');
		let code = ''+c+''+r;
		let n;
	
		for(var i in nPad) if(nPad[i].indexOf(code)>-1) n = i;

		let cells = nPad[n]?nPad[n].split(','):[];
		
		if(!b){
			for(var i in cells) self.$el.find('seq-c[c='+cells[i][0]+'][r='+cells[i][1]+']').addClass('selected');
			map[n] = true;
		} else {
			for(var i in cells) self.$el.find('seq-c[c='+cells[i][0]+'][r='+cells[i][1]+']').removeClass('selected');
			map[n] = undefined;
		}

		
	})

	setInterval(tick,timePerBeat*1000);
	
}