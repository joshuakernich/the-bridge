window.Unscramble = function(){

	let colors = ['red','orange','yellow','green','blue','pink','purple'];

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

	let message = 'YOU ARE ALL |GOING TO DIE';
	let messageTarget = toArrays(message);
	let messageLive = toArrays(message);

	const self = this;
	self.$el = $('<unscramble>');

	for(var r = 0; r < messageLive.length; r++){
		$r = $('<seq-r>').appendTo(self.$el);
		for(var c = 0; c < messageLive[r].length; c++){
			$('<seq-c>')
			.appendTo($r)
			.attr('c',c)
			.attr('r',r)
			.attr('bg',colors[Math.floor(c/2)])
			.text(messageLive[r][c])
			.on('mousedown',onCell);
		}
	}

	let group = '00 10 11 01'.split(' ');
	let anims = [];

	function onCell(){
		let c = $(this).attr('c');
		let r = $(this).attr('r');

		scramble(c,r);

		self.$el.css({'pointer-events':'none'});
		for(let a in anims) anims[a].$el.offset(anims[a].o).animate({top:0,left:0},300,validate);
	}

	function validate() {
		let isCorrect = true;

		for(var r in messageLive) for(var c in messageLive[r]) if(messageLive[r][c] != messageTarget[r][c]) isCorrect = false;
		
		if(isCorrect){
			self.$el.find('seq-c').off('mousedown').attr('bg','yellow');
		}

		self.$el.css({'pointer-events':'auto'});
	}

	function randomScramble(c,r){
		let n = 1 + Math.floor(Math.random()*3);

		while(n--) scramble(c,r);
	}

	function scramble(c,r){
		let messageWas = clone(messageLive);
		let anchor = [Math.floor(c/2)*2,0];
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

	randomScramble(0,0);
	randomScramble(2,0);
	randomScramble(4,0);
	randomScramble(6,0);
	randomScramble(8,0);
	randomScramble(10,0);
}