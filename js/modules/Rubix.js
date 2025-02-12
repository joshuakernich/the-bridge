window.Rubix = function( nLaunchpad, nPuzzle ){

	const audio = new AudioContext();
	audio.add('blip','./audio/sfx-blip.mp3');
	audio.add('correct','./audio/sfx-correct.mp3');

	let colors = ['red','orange','yellow','green','blue','pink','purple'];
	colors = ['yellow','pink','green','purple'];
	
	let self = this;
	self.$el = $('<rubix>');

	let isComplete = false;

	let map = [];

	let grid = 3 + (nPuzzle)%4; 
	console.log('Rubix grid',grid);
	for(var y=0; y<grid+1; y++){
		let $r = $('<row>').appendTo(self.$el);
		if(y>0) map[y-1] = [];
		for(var x=0; x<grid+1; x++){	
			let $c = $('<cell>').appendTo($r).attr('x',x-1).attr('y',y-1);
			if(x!=y && (x==0||y==0)) $c.attr('color','blue');
			if(y>0&&x>0) map[y-1][x-1] = x-1;
		}
	}

	function repaint(){

		if(isComplete) return;

		let by = true;
		let bx = true;

		launchpad.clear( nLaunchpad );
		for(var y=0; y<map.length; y++){

			launchpad.setXY(0,y+1,'blue');
			launchpad.setXY(y+1,0,'blue');

			for(var x=0; x<map[y].length; x++){
				let c = colors[map[y][x]%colors.length];
				self.$el.find(`cell[x=${x}][y=${y}]`).attr('bg',c);

				by = by && map[y][x]%colors.length == map[0][x]%colors.length;
				bx = bx && map[y][x]%colors.length == map[y][0]%colors.length;

				launchpad.setXY(nLaunchpad, x+1,y+1,c);
			}
		}

		if(bx || by){
			isComplete = true;
			setTimeout(function(){
				audio.play('correct');
				self.callbackComplete();
				launchpad.clear(nLaunchpad);
			},750);
		}
	}

	self.$el.find('[color=blue]').click(onShuffle);
	self.$el.find('[x=-1][color=blue]').text('→');
	self.$el.find('[y=-1][color=blue]').text('↓');

	function onShuffle(e){

		audio.play('blip');

		let x = $(this).attr('x');
		let y = $(this).attr('y');

		shuffle(x,y);
		repaint();
	}

	let record = [];
	function shuffle(x,y,bRecord){

		if( x == -1 ){
			map[y].unshift(map[y][map[y].length-1]);
			map[y].pop();
		}

		if( y == -1 ){
			//clone column
			let was = [];
			for( let i=0; i<map.length; i++ ) was[i] = map[i][x];
			//rotate column
			was.unshift(was.pop())
			//rewrite column
			for( let i=0; i<map.length; i++ ) map[i][x] = was[i];
		}

		if(bRecord) record.push([x,y]);
	}

	function shuffleOffset(){
		for(var i=0; i<map.length; i++){
			let n = i;
			while(n-->=0) shuffle(-1,i);
		}
	}

	function shuffleRandom(iterations){

		for(var i=0; i<iterations; i++){
			shuffle(-1,Math.floor(Math.random()*map.length),true);
			shuffle(Math.floor(Math.random()*map.length),-1,true);
		}
	}

	shuffleRandom(1);
	repaint();

	function reverse(){
		
		let move = record.pop();
		
		shuffle(move[0],move[1])
		shuffle(move[0],move[1]);
		repaint();
	}

	
	self.$el.find('[x=-1][y=-1]').click(reverse);
	
	self.triggerXY = function(x,y){
		let $c = self.$el.find(`cell[x=${x-1}][y=${y-1}]`);
		if($c.length) $c.click();
	}
}