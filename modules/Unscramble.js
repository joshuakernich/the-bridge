window.Unscramble = function(){

	let colors = ['red','yellow','green','blue','pink','purple'];
	let levels = [
		{
			name:'Duotronic Encryption Matrix',
			pattern : '00 10 11 12 02 01',
			message: 'FEAR THE| COMING |  DOOM  ',
			patternWidth:2,
		},
		{
			name:'Triotonic Encryption Matrix',
			pattern: '00 10 20 21 22 12 02 01',
			message: ' EVERYONE|IS GOING |  TO DIE ',
			patternWidth:3,
		},
		{
			name:'Duotrionic Encryption Matrix',
			pattern: '00 10 11 12 02 01',
			message: 'TAKE ME |TO YOUR | LEADER ',
			patternWidth:2,
		}
		
	]



	function toArrays(m){
		let out = [];
		let rows = m.split('|');
		for(var r in rows){
			out[r] = [];
			for(var c in rows[r]) out[r][c] = rows[r][c];
		}
		return out;
	}

	function clone(arr){
		let out = arr.concat();
		for(var o in out) out[o] = out[o].concat();
		return out;
	}

	const self = this;
	self.$el = $('<unscramble>');

	self.turnOnOff = function(){

	}

	let level = undefined;
	let iLevel = 0;
	let messageTarget;
	let messageLive;
	let group;
	let anims;
	let patternWidth = 0;
	function doLevel(){

		level = levels[iLevel];
		anims = [];

		messageTarget = toArrays(level.message);
		messageLive = toArrays(level.message);

		self.$el.empty();

		$('<h2>').appendTo(self.$el).text(level.name);

		for(var r = 0; r < messageLive.length; r++){
			$r = $('<seq-r>').appendTo(self.$el);
			for(var c = 0; c < messageLive[r].length; c++){
				$('<seq-c>')
				.appendTo($r)
				.attr('c',c)
				.attr('r',r)
				.attr('bg',colors[Math.floor(c/level.patternWidth)])
				.text(messageLive[r][c])
				.on('mousedown',onCell);
			}
		}

		group = level.pattern.split(' ');
		for(let n=0; n<messageTarget[0].length/level.patternWidth; n++) randomScramble(n*level.patternWidth,0);

		$('<button>').appendTo(self.$el).text('VERIFY').click(validate);
	}
	doLevel();


	function onCell(){
		let c = $(this).attr('c');
		let r = $(this).attr('r');

		scramble(c,r);

		self.$el.css({'pointer-events':'none'});

		for(let a in anims) anims[a].$el.offset(anims[a].o).animate({top:0,left:0},300);
		setTimeout(onMove,300);
	}

	function onMove(){
		self.$el.css({'pointer-events':'auto'});
	}

	function validate() {
		let isCorrect = true;

		for(var r in messageLive) for(var c in messageLive[r]) if(messageLive[r][c] != messageTarget[r][c]) isCorrect = false;
		
		if(isCorrect){
			self.$el.find('seq-c').off('mousedown').attr('bg','yellow');
			setTimeout(function(){
				iLevel++;
				doLevel();
			},1000)
		}

		
	}

	function randomScramble(c,r){

		let n = 1 + Math.floor(Math.random()*3);

		while(n--) scramble(c,r);
	}

	function scramble(c,r){
		let messageWas = clone(messageLive);
		let anchor = [Math.floor(c/level.patternWidth)*level.patternWidth,0];
		anims = []; 
		
		for(let g in group){
			let from = [ 
				anchor[0] + parseInt(group[g][0]), 
				anchor[1] + parseInt(group[g][1]) 
				];

			let iTo = (parseInt(g)+1)%group.length;
			let to = [ 
				anchor[0] + parseInt(group[iTo][0]), 
				anchor[1] + parseInt(group[iTo][1]) 
				];

			messageLive[to[1]][to[0]] = messageWas[from[1]][from[0]];

			let $from = self.$el.find('[r='+from[1]+'][c='+from[0]+']');
			let $to = self.$el.find('[r='+to[1]+'][c='+to[0]+']');
			$to.text(messageLive[to[1]][to[0]]);

			anims[iTo] = { o:$from.offset(), $el:$to }; //capture the animations required
		}
	}

	

	
}